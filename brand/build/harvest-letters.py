"""Harvest letterforms from an emblem generation, so the model's lettering can be set on our own
emblem with exact spelling and geometry (Maria, 20 November 2026: the image generator's lettering,
as in round 3, is the one she wants).

Step 1, find:  python3 harvest-letters.py find <generation.png> <out-dir>
  Finds every light letter on the dark band, turns each upright (the ring's normal at that point
  gives its up), writes glyph-NN.png and sheet.png (numbered) and groups.json.
Step 2, trace: python3 harvest-letters.py trace <out-dir> '<json map of letter to glyph number>' <glyphs.json>
  Traces the chosen glyphs with potrace and writes them normalised to cap height 1 (y down).
"""

import json
import math
import os
import re
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def grow(seed, allowed):
    r = np.zeros_like(allowed)
    r[seed[1], seed[0]] = True
    n = 1
    while True:
        d = r.copy()
        d[1:, :] |= r[:-1, :]
        d[:-1, :] |= r[1:, :]
        d[:, 1:] |= r[:, :-1]
        d[:, :-1] |= r[:, 1:]
        d &= allowed
        k = int(d.sum())
        if k == n:
            return d
        r, n = d, k


def label(mask):
    """4-connected components of a boolean mask (pure numpy/python, small images)."""
    H, W = mask.shape
    lab = np.zeros((H, W), dtype=np.int32)
    cur = 0
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if lab[y0, x0]:
            continue
        cur += 1
        stack = [(y0, x0)]
        lab[y0, x0] = cur
        while stack:
            y, x = stack.pop()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = cur
                    stack.append((yy, xx))
    return lab, cur


def find(src, out):
    os.makedirs(out, exist_ok=True)
    g = np.asarray(Image.open(src).convert("L")).astype(np.float32)
    H, W = g.shape
    dark = g < 110
    light = g > 150
    ys, xs = np.nonzero(dark)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    A, B = (xs.max() - xs.min()) / 2, (ys.max() - ys.min()) / 2
    outside = grow((0, 0), ~dark)
    # the panel: the light region containing a point a little left of centre, inside the drawing's field
    seed = None
    for dx in range(int(0.15 * A), int(0.6 * A)):
        x, y = int(cx - dx), int(cy)
        if light[y, x]:
            seed = (x, y)
            break
    panel = grow(seed, ~dark)
    cand = light & ~outside & ~panel
    lab, n = label(cand)
    comps = []
    for i in range(1, n + 1):
        yy, xx = np.nonzero(lab == i)
        if len(yy) < 12:
            continue
        comps.append({"i": i, "x0": int(xx.min()), "x1": int(xx.max()), "y0": int(yy.min()), "y1": int(yy.max()), "n": len(yy), "cx": float(xx.mean()), "cy": float(yy.mean())})
    # merge components nested inside another's box (the bar of a Theta, the dot of a monad)
    comps.sort(key=lambda c: -(c["x1"] - c["x0"]) * (c["y1"] - c["y0"]))
    groups = []
    for c in comps:
        for gr in groups:
            o = gr["box"]
            if o[0] - 2 <= c["cx"] <= o[2] + 2 and o[1] - 2 <= c["cy"] <= o[3] + 2:
                gr["ids"].append(c["i"])
                break
        else:
            groups.append({"ids": [c["i"]], "box": [c["x0"], c["y0"], c["x1"], c["y1"]]})
    # order clockwise from the top centre
    meta = []
    for gr in groups:
        m = np.isin(lab, gr["ids"])
        yy, xx = np.nonzero(m)
        gx, gy = float(xx.mean()), float(yy.mean())
        ang = (math.degrees(math.atan2(gx - cx, -(gy - cy))) + 360) % 360  # 0 = top, clockwise
        meta.append({"ids": gr["ids"], "gx": gx, "gy": gy, "ang": ang, "w": int(xx.max() - xx.min()), "h": int(yy.max() - yy.min())})
    meta.sort(key=lambda m: m["ang"])
    tiles = []
    for k, m in enumerate(meta):
        mask = np.isin(lab, m["ids"])
        # outward normal of the fitted oval at the letter
        nx, ny = (m["gx"] - cx) / A ** 2, (m["gy"] - cy) / B ** 2
        L = math.hypot(nx, ny)
        nx, ny = nx / L, ny / L
        # top half reads clockwise (up = outward); the rest reads anticlockwise (up = inward)
        top = bool(m["gy"] < cy)
        ux, uy = (nx, ny) if top else (-nx, -ny)
        vis = math.degrees(math.atan2(-uy, ux))
        m["top"] = top
        yy, xx = np.nonzero(mask)
        pad = 12
        x0, x1, y0, y1 = max(0, xx.min() - pad), min(W, xx.max() + pad + 1), max(0, yy.min() - pad), min(H, yy.max() + pad + 1)
        # dilate the mask a little so anti-aliased edges come along
        mk = mask.copy()
        for _ in range(2):
            mk[1:, :] |= mk[:-1, :]
            mk[:-1, :] |= mk[1:, :]
            mk[:, 1:] |= mk[:, :-1]
            mk[:, :-1] |= mk[:, 1:]
        crop = np.where(mk, g, 0)[y0:y1, x0:x1]
        img = Image.fromarray((255 - crop).astype(np.uint8))  # letter dark on light
        img = img.resize((img.width * 4, img.height * 4), Image.LANCZOS)
        img = img.rotate(90 - vis, resample=Image.BICUBIC, expand=True, fillcolor=255)
        a = np.asarray(img)
        yy2, xx2 = np.nonzero(a < 128)
        img = img.crop((xx2.min() - 8, yy2.min() - 8, xx2.max() + 9, yy2.max() + 9))
        img.save(f"{out}/glyph-{k:02d}.png")
        m["file"] = f"glyph-{k:02d}.png"
        tiles.append(img)
    json.dump({"centre": [cx, cy], "axes": [A, B], "groups": meta}, open(f"{out}/groups.json", "w"), indent=1)
    # numbered sheet
    th = 150
    cols = 10
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("L", (cols * 120, rows * (th + 30)), 255)
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
    except OSError:
        font = None
    for k, t in enumerate(tiles):
        t2 = t.copy()
        t2.thumbnail((110, th))
        x, y = (k % cols) * 120, (k // cols) * (th + 30)
        sheet.paste(t2, (x + 5, y + 26))
        d.text((x + 5, y + 2), f"{k}", fill=0, font=font)
    sheet.save(f"{out}/sheet.png")
    print(f"{len(meta)} groups; centre {cx:.0f},{cy:.0f}; axes {A:.0f},{B:.0f}")


def trace(out, mapping, dest, top_ref=""):
    """mapping: {"letter": "NN"}; suffix r turns the glyph round (it came out upside down), suffix t
    scales it by the capitals of the top line (top_ref: comma-separated glyph numbers of flat top-line
    letters), the rest by the median height of the flat letters chosen."""
    mapping = json.loads(mapping)

    def tile(spec):
        k = int(re.match(r"\d+", spec).group())
        im = Image.open(f"{out}/glyph-{k:02d}.png").convert("L")
        if "r" in spec:
            im = im.rotate(180, expand=True, fillcolor=255)
        return k, im

    glyphs, heights = {}, {}
    for ch, spec in mapping.items():
        k, im = tile(spec)
        a = np.asarray(im)
        bw = Image.fromarray(np.where(a < 128, 0, 255).astype(np.uint8)).convert("1")
        bmp, svg = f"{out}/t-{ch}.bmp", f"{out}/t-{ch}.svg"
        bw.save(bmp)
        subprocess.run(["potrace", bmp, "-s", "-o", svg, "-t", "6", "-a", "1.0", "-O", "0.4"], check=True)
        text = open(svg).read()
        mt = re.search(r'<g transform="([^"]+)"[^>]*>([\s\S]*?)</g>', text)
        yy, xx = np.nonzero(a < 128)
        glyphs[ch] = {"tf": mt.group(1).replace("\n", " "), "paths": re.sub(r"\s+", " ", mt.group(2)).strip(), "box": [int(xx.min()), int(yy.min()), int(xx.max()) + 1, int(yy.max()) + 1], "top": "t" in spec}
        heights[ch] = int(yy.max()) + 1 - int(yy.min())
    cap = float(np.median([heights[c] for c in heights if c in "ΗΕΙΝΜΚΛΔΠΤHEINMKLTFDWY" and not glyphs[c]["top"]]))
    cap_top = cap
    if top_ref:
        hs = []
        for spec in top_ref.split(","):
            _, im = tile(spec)
            a = np.asarray(im)
            yy, _ = np.nonzero(a < 128)
            hs.append(int(yy.max()) + 1 - int(yy.min()))
        cap_top = float(np.median(hs))
    res = {}
    for ch, gl in glyphs.items():
        c = cap_top if gl["top"] else cap
        x0, y0, x1, y1 = gl["box"]
        w, h = (x1 - x0) / c, (y1 - y0) / c
        # cap-height units, y down; each letter centred on the middle of the cap height
        res[ch] = {"w": round(w, 4), "svg": f'<g transform="translate(0 {0.5 - h / 2:.4f}) scale({1 / c:.6f}) translate({-x0} {-y0})"><g transform="{gl["tf"]}">{gl["paths"]}</g></g>'}
    json.dump({"cap_px": cap, "cap_top_px": cap_top, "glyphs": res}, open(dest, "w"), ensure_ascii=False, indent=0)
    print(f"traced {len(res)} glyphs; cap {cap:.0f} px, top-line cap {cap_top:.0f} px")


if __name__ == "__main__":
    if sys.argv[1] == "find":
        find(sys.argv[2], sys.argv[3])
    else:
        trace(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] if len(sys.argv) > 5 else "")
