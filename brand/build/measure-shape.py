"""Measure the outer edge and the inner panel of an emblem generation and fit superellipses.

Model for each half (top, bottom): |x/a|^m + |y/b|^n = 1. m > 2 flattens the top and bottom,
n > 2 straightens the sides. Radii are measured along rays from the centre: the outer edge is the
last dark pixel; the panel edge is the end of the last dark run before a long light run (the band).

  python3 brand/build/measure-shape.py <generation.png> [...]
"""

import json
import math
import sys

import numpy as np
from PIL import Image


def measure(path):
    g = np.asarray(Image.open(path).convert("L")).astype(np.float32)
    H, W = g.shape
    dark = g < 128
    ys, xs = np.nonzero(dark)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    light = ~dark

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

    outside = grow((0, 0), light)
    # a seed in the light band: walk in from the left edge along a row a little below the middle
    yy = int(cy + 0.18 * (ys.max() - ys.min()) / 2)
    x = 0
    while not dark[yy, x]:
        x += 1
    while dark[yy, x]:
        x += 1
    band = grow((x + 2, yy), light)
    if band.sum() > 0.5 * H * W:
        raise SystemExit("band seed leaked outside")
    inner = grow((int(cx), int(cy)), ~(outside | band | (dark & ~grow((int(cx), int(cy)), ~(outside | band)))))
    inner = grow((int(cx), int(cy)), ~(outside | band))
    rows = []
    for deg in range(0, 360, 2):
        th = math.radians(deg)
        c, s = math.cos(th), math.sin(th)
        vals = []
        for r in range(0, 900):
            x, y = int(round(cx + r * c)), int(round(cy + r * s))
            if not (0 <= x < W and 0 <= y < H):
                break
            vals.append(bool(dark[y, x]))
        outer = max((i for i, v in enumerate(vals) if v), default=None)
        # runs from the centre outwards
        runs, i = [], 0
        while i < len(vals):
            j = i
            while j < len(vals) and vals[j] == vals[i]:
                j += 1
            runs.append((vals[i], i, j))
            i = j
        panel = None
        for i2 in range(len(vals) - 1, -1, -1):
            x, y = int(round(cx + i2 * c)), int(round(cy + i2 * s))
            if inner[y, x]:
                panel = i2
                break
        rows.append({"deg": deg, "outer": outer, "panel": panel})
    return (cx, cy), rows


def fit(rows, key):
    """Half-width and half-heights read off the axes; the two exponents fitted to the rest."""
    r = {row["deg"]: row[key] for row in rows}

    def med(degs):
        v = [r[d % 360] for d in degs if r.get(d % 360)]
        return float(np.median(v)) if v else None

    a = med([358, 0, 2, 178, 180, 182])
    out = {"a": a}
    for half, centre, sel in (("top", 270, lambda d: 180 < d < 360), ("bottom", 90, lambda d: 0 < d < 180)):
        b = med([centre - 4, centre - 2, centre, centre + 2, centre + 4])
        pts = [(math.radians(d), v) for d, v in r.items() if v and sel(d) and 8 < abs(d - centre) < 82]
        th = np.array([p[0] for p in pts])
        rr = np.array([p[1] for p in pts], dtype=float)
        c, s_ = np.abs(np.cos(th)), np.abs(np.sin(th))
        best = None
        for m in np.arange(1.8, 4.01, 0.05):
            for n in np.arange(1.8, 4.01, 0.05):
                lo, hi = np.zeros_like(rr), np.full_like(rr, 900.0)
                for _ in range(30):
                    mid = (lo + hi) / 2
                    inside = (mid * c / a) ** m + (mid * s_ / b) ** n < 1
                    lo, hi = np.where(inside, mid, lo), np.where(inside, hi, mid)
                e = np.sort(((lo + hi) / 2 - rr) ** 2)[: int(0.85 * rr.size)]
                if best is None or e.sum() < best[0]:
                    best = (e.sum(), m, n)
        out[half] = {"b": b, "m": round(float(best[1]), 2), "n": round(float(best[2]), 2), "rms": round(math.sqrt(best[0] / (0.85 * rr.size)), 2)}
    return out


for path in sys.argv[1:]:
    (cx, cy), rows = measure(path)
    print(path.split("/")[-1], "centre", round(cx, 1), round(cy, 1))
    print(" outer", json.dumps(fit(rows, "outer")))
    print(" panel", json.dumps(fit(rows, "panel")))
