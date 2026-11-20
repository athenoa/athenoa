"""Trace Athena and her rays out of Higgsfield generation 96 (chosen by Maria, 20 November 2026).

Finds the inner panel (everything inside the thin gap that runs round the inside of the dark band),
keeps only the drawing in it, lets the hem run a little past the panel's edge (the vector clips it
with its own curve, so she always meets the band with no gap), upscales four times for smooth
curves and writes a bitmap for potrace. Also measures the oval, band, gap and hairline and fits
them, so the vector can be rebuilt to the same proportions.

  python3 brand/build/trace-figure.py <generation.png> <out-dir>
"""

import json
import math
import sys

import numpy as np
from PIL import Image

src, out_dir = sys.argv[1], sys.argv[2]
grey = np.asarray(Image.open(src).convert("L")).astype(np.float32)
H, W = grey.shape
dark = grey < 128


def grow(seed_xy, allowed):
    """Region of `allowed` connected to the seed (4-neighbour)."""
    r = np.zeros_like(allowed)
    x, y = seed_xy
    if not allowed[y, x]:
        raise SystemExit(f"seed {seed_xy} not in the allowed region")
    r[y, x] = True
    n = 1
    while True:
        d = r.copy()
        d[1:, :] |= r[:-1, :]
        d[:-1, :] |= r[1:, :]
        d[:, 1:] |= r[:, :-1]
        d[:, :-1] |= r[:, 1:]
        d &= allowed
        m = int(d.sum())
        if m == n:
            return d
        r, n = d, m


def erode(mask, k):
    m = mask.copy()
    for _ in range(k):
        e = m.copy()
        e[1:, :] &= m[:-1, :]
        e[:-1, :] &= m[1:, :]
        e[:, 1:] &= m[:, :-1]
        e[:, :-1] &= m[:, 1:]
        m = e
    return m


ys, xs = np.nonzero(dark)
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2

# Walk in from the right along the middle row, as runs of dark and light:
# background, band (perhaps broken by the monad), gap, hairline, panel.
row = dark[int(cy)]
runs = []
x = W - 1
while x > cx:
    v = row[x]
    start = x
    while x > cx and row[x] == v:
        x -= 1
    runs.append((bool(v), start, x + 1))  # (dark?, outer x, inner x)
band_x = gap_x = None
for i in range(1, len(runs) - 2):
    is_dark, a, b = runs[i]
    if band_x is None and is_dark:
        band_x = a - 6
    # the gap: a short light run, then a short dark run (hairline), then a long light run (panel)
    if (not is_dark) and a - b < 10 and runs[i + 1][0] and runs[i + 1][1] - runs[i + 1][2] < 10 and runs[i + 2][1] - runs[i + 2][2] > 20:
        gap_x = (a + b) // 2
        break
if band_x is None or gap_x is None:
    raise SystemExit(f"could not find band and gap on the middle row: {runs[:8]}")
print("band seed", band_x, "gap seed", gap_x, "centre", cx, cy)

outside = grow((0, 0), ~dark)
band = grow((band_x, int(cy)), dark)
gap = grow((gap_x, int(cy)), ~dark)
if gap.sum() > 0.2 * W * H:
    raise SystemExit("gap seed leaked into a large region")
inner = grow((int(cx), int(cy)), ~(outside | band | gap))  # hairline + panel + drawing
panel = erode(inner, 6)  # without the hairline

# Let the drawing that touches the bottom of the panel run on past it
fig = dark & panel
ext = np.zeros_like(fig)
for col in range(W):
    rows = np.nonzero(panel[:, col])[0]
    if len(rows) == 0:
        continue
    yb = rows.max()
    if yb > cy and fig[yb - 4 : yb + 1, col].all():  # real hem, not a speck at the edge
        ext[yb + 1 : min(H, yb + 18), col] = True

img = np.full_like(grey, 255.0)
img[panel] = grey[panel]
img[ext] = 0
ys2, xs2 = np.nonzero(panel | ext)
x0, x1, y0, y1 = xs2.min(), xs2.max() + 1, ys2.min(), ys2.max() + 1
crop = Image.fromarray(img[y0:y1, x0:x1].astype(np.uint8))
SCALE = 4
big = crop.resize((crop.width * SCALE, crop.height * SCALE), Image.LANCZOS)
bw = big.point(lambda v: 0 if v < 128 else 255).convert("1")
bw.save(f"{out_dir}/figure.bmp")


# Measure radii along many directions: outer edge, band inner edge (gap outer), hairline inner edge
def radius(mask_fn, th, rmax=700, inward=True):
    rng = range(rmax, 0, -1) if inward else range(0, rmax)
    for r in rng:
        px = int(round(cx + r * math.cos(th)))
        py = int(round(cy + r * math.sin(th)))
        if 0 <= px < W and 0 <= py < H and mask_fn(px, py):
            return r
    return None


samples = []
for deg in range(0, 360, 3):
    th = math.radians(deg)
    r_out = radius(lambda px, py: not outside[py, px], th)
    r_gap_out = radius(lambda px, py: gap[py, px], th)
    r_inner = radius(lambda px, py: inner[py, px], th)
    samples.append({"deg": deg, "outer": r_out, "gap_outer": r_gap_out, "hairline_outer": r_inner})


def fit(key):
    """Fit an egg-shaped oval: one half-width, and a height and exponent for each half."""
    pts = [(s["deg"], s[key]) for s in samples if s[key]]
    best = {}
    A = np.arange(150, 460, 1.0)[:, None, None]
    B = np.arange(250, 560, 1.0)[None, :, None]
    for half, sel in (("top", lambda d: 180 < d < 360), ("bottom", lambda d: 0 < d < 180)):
        th = np.array([math.radians(d) for d, r in pts if sel(d)])[None, None, :]
        r = np.array([r for d, r in pts if sel(d)], dtype=float)[None, None, :]
        c, s = np.abs(np.cos(th)), np.abs(np.sin(th))
        err_best = None
        for n in np.arange(1.8, 2.61, 0.05):
            rr = ((c / A) ** n + (s / B) ** n) ** (-1 / n)
            err = ((rr - r) ** 2).sum(axis=2)
            i, j = np.unravel_index(np.argmin(err), err.shape)
            if err_best is None or err[i, j] < err_best:
                err_best = err[i, j]
                best[half] = {"a": float(A[i, 0, 0]), "b": float(B[0, j, 0]), "n": round(float(n), 2), "rms": float(math.sqrt(err[i, j] / r.size))}
    return best


fits = {k: fit(k) for k in ("outer", "gap_outer", "hairline_outer")}
meta = {
    "source": src.split("/")[-1],
    "size": [W, H],
    "centre": [cx, cy],
    "bitmap_origin": [int(x0), int(y0)],
    "bitmap_scale": SCALE,
    "fits": fits,
}
json.dump(meta, open(f"{out_dir}/figure.json", "w"), indent=2)
print(json.dumps(fits, indent=1))
