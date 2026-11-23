import math, random
from gen import f, P, curve, poly, path, g, svg, interp, circle_pts, smooth, PAPER, LIGHT

R = random.Random(23)


# ---------------------------------------------------------------- MID
def scallop(cx, cy, rx, ry, n, rr, flat_bottom=False):
    """a closed, scalloped lump (like the pines' crowns): arcs bulging outward between points on an ellipse"""
    pts = []
    for i in range(n):
        a = math.pi * 2 * i / n + rr.uniform(-0.08, 0.08)
        k = rr.uniform(0.92, 1.05)
        y = cy + ry * k * math.sin(a)
        if flat_bottom and math.sin(a) > 0.2:
            y = cy + ry * 0.35 + ry * 0.25 * math.sin(a)
        pts.append((cx + rx * k * math.cos(a), y))
    d = 'M' + P(*pts[0])
    for i in range(n):
        p0, p1 = pts[i], pts[(i + 1) % n]
        ch = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        r = ch * rr.uniform(0.55, 0.7)
        d += f"A{f(r)} {f(r)} 0 0 1 {P(*p1)}"
    return d + 'Z'


def olive_small(x, y, s):
    """a small olive tree standing at (x, y) (base of trunk), scale s (1 = ~26 wide)"""
    w, h, t = 13 * s, 8.5 * s, 8 * s
    cy = y - t - h * 0.7
    crown = path(scallop(x, cy, w, h, 7, R, flat_bottom=True), fill=PAPER)
    trunk = path(f"M{P(x - 1.2 * s, y)}Q{P(x + 0.6 * s, y - t * 0.5)} {P(x - 2.5 * s, y - t - 2)}M{P(x + 0.2 * s, y - t * 0.5)}Q{P(x + 2 * s, y - t * 0.7)} {P(x + 3.5 * s, y - t - 2)}")
    return trunk + crown


def cypress_small(x, y, h):
    w = h * 0.16
    pts = [(x - w * 0.45, y), (x - w * 0.62, y - h * 0.3), (x - w * 0.42, y - h * 0.68), (x, y - h),
           (x + w * 0.4, y - h * 0.66), (x + w * 0.6, y - h * 0.3), (x + w * 0.42, y)]
    return path(curve(pts, amp=0.2, step=5) + 'Z', fill=PAPER)


def mid():
    out = []
    top = [(-40, 96), (80, 88), (200, 92), (320, 80), (440, 70), (540, 60), (640, 52), (760, 47), (880, 45), (980, 46),
           (1080, 56), (1180, 68), (1300, 80), (1420, 76), (1520, 88), (1640, 84)]
    d = curve(top, amp=0.5, step=20)
    out.append(path(d + 'L1640 302L-40 302Z', fill=PAPER))

    # the theatre, its rows cut into the slope above the temple
    tx, ty = 952, 92
    rows = ''
    for i, r in enumerate([18, 27, 36, 45, 54, 63, 72]):
        ye = ty - 2 - 0.12 * r
        ym = ty - 4 - 0.56 * r
        pts = [(tx - r * math.cos(math.pi * k / 16) + R.gauss(0, 0.15), ye - (ye - ym) * math.sin(math.pi * k / 16) + R.gauss(0, 0.15))
               for k in range(17)]
        rows += smooth(pts)
    # the stairways between the wedges of seats
    for th in (0.3 * math.pi, 0.5 * math.pi, 0.7 * math.pi):
        def on_row(r):
            ye, ym = ty - 2 - 0.12 * r, ty - 4 - 0.56 * r
            return tx - r * math.cos(th), ye - (ye - ym) * math.sin(th)
        rows += 'M' + P(*on_row(18)) + 'L' + P(*on_row(72))
    out.append(path(smooth([(tx - 76 * math.cos(math.pi * k / 16), ty - 10 - 40 * math.sin(math.pi * k / 16)) for k in range(17)])
                    + 'Z', fill=PAPER, stroke='none'))
    out.append(path(rows, stroke_width='1.7'))
    out.append(path(curve(circle_pts(tx, ty - 1, 15, 16, ry=3.6)[:-1], amp=0.1, step=4, closed=True), fill=PAPER, stroke_width='1.7'))
    out.append(path(poly([(tx - 30, ty + 6), (tx + 30, ty + 6)], amp=0.2)))

    # terraces and olive groves, far to near
    terraces = [
        # (inner end, outer end, olive scale, wall ticks)
        ((660, 92), (-40, 140), 0.7, False),
        ((1210, 100), (1640, 126), 0.7, False),
        ((700, 142), (-40, 188), 0.86, True),
        ((900, 172), (1640, 190), 0.86, True),
        ((730, 190), (-40, 236), 1.0, True),
        ((980, 214), (1640, 238), 1.0, True),
    ]
    skip = [(840, 1215, 0, 180)]  # keep the sanctuary clear
    for (xi, yi), (xo, yo), s, walls in terraces:
        x0, x1 = sorted([xi, xo])
        pts = [(x, yi + (yo - yi) * (x - xi) / (xo - xi) + 2.5 * math.sin(x / 61)) for x in range(int(x0), int(x1) + 1, 40)]
        pts.sort()
        line = curve(pts, amp=0.5, step=20)
        trees = []
        x = x0 + R.uniform(8, 40)
        while x < x1 - 10:
            yy = interp(pts, x)
            if not any(a <= x <= b and c <= yy <= e for a, b, c, e in skip):
                trees.append(olive_small(x, yy + 1, s * R.uniform(0.88, 1.08)))
            x += 44 * s + R.uniform(10, 46) * s
        out.append(path(line))
        if walls:
            ticks = ''
            xx = x0 + 6
            while xx < x1 - 6:
                yy = interp(pts, xx)
                ticks += f"M{P(xx, yy + 3.5)}l{f(R.uniform(-0.6, 0.6))} {f(2.5 + 2 * s)}"
                xx += R.uniform(14, 26)
            out.append(path(ticks, stroke_width='1.3'))
        out.append(''.join(trees))

    # temple terrace with its polygonal wall
    wall_top, wall_bot = 132, 152
    x0, x1 = 990, 1196
    out.append(path(poly([(x0, wall_top), (x1, wall_top), (x1 + 6, wall_bot), (x0 - 8, wall_bot)], amp=0.3, closed=True), fill=PAPER))
    # polygonal masonry: two courses of many-sided blocks
    poly_lines = ''
    mid_pts = [(x0 - 4, 142)]
    xs = x0 + 4
    while xs < x1:
        mid_pts.append((xs + R.uniform(-3, 3), 142 + R.uniform(-3.5, 3.5)))
        xs += R.uniform(12, 20)
    mid_pts.append((x1 + 3, 142))
    poly_lines += poly(mid_pts, amp=0.1)
    for (ya, yb_) in ((wall_top, None), (None, wall_bot)):
        xs = x0 + R.uniform(4, 12)
        while xs < x1 - 6:
            ym = interp(mid_pts, xs)
            if ya is not None:
                poly_lines += poly([(xs + R.uniform(-4, 4), ya), (xs, ym)], amp=0.1)
            else:
                poly_lines += poly([(xs, ym), (xs + R.uniform(-5, 5), yb_)], amp=0.1)
            xs += R.uniform(16, 30)
    out.append(path(poly_lines, stroke_width='1.4'))
    # crepidoma
    for k, (yb, inset) in enumerate([(132, 0), (127, 5), (122, 10)]):
        out.append(path(poly([(1004 + inset, yb), (1004 + inset, yb - 5), (1180 - inset, yb - 5), (1180 - inset, yb)], amp=0.2, closed=True),
                        fill=PAPER))
    # six columns of different heights
    heights = [40, 44, 44, 30, 44, 22]
    cols = []
    for i, hgt in enumerate(heights):
        cx = 1027 + 26 * i
        base = 117
        topy = base - hgt
        full = hgt >= 40
        wb, wt = 4.4, 3.6
        if full:
            shaft = [(cx - wb, base), (cx - wt, topy + 6), (cx + wt, topy + 6), (cx + wb, base)]
            cols.append(path(poly(shaft, amp=0.15, closed=True), fill=PAPER))
            cols.append(path(poly([(cx - wt, topy + 6), (cx - 6, topy + 3), (cx + 6, topy + 3), (cx + wt, topy + 6)], amp=0.1, closed=True)
                             + poly([(cx - 6.5, topy + 3), (cx - 6.5, topy), (cx + 6.5, topy), (cx + 6.5, topy + 3)], amp=0.1, closed=True),
                             fill=PAPER))
        else:
            shaft = [(cx - wb, base), (cx - wb + 0.3, topy + 2), (cx - 1.5, topy - 1.5), (cx + 1, topy + 1.5), (cx + wb - 0.3, topy - 1),
                     (cx + wb, base)]
            cols.append(path(poly(shaft, amp=0.15, closed=True), fill=PAPER))
        cols.append(path(poly([(cx, base - 3), (cx, topy + 9)], amp=0.1), stroke_width='1.2'))
    out.append(''.join(cols))
    # a few cypresses about the sanctuary
    cyp = [cypress_small(*c) for c in [(1210, 136, 34), (1226, 138, 26), (590, 92, 26), 
                                       (1520, 160, 30)]]
    out.append(''.join(cyp))
    return svg(300, 2.2, out)


# ---------------------------------------------------------------- NEAR
def cypress(x, base, H, W, seed=0):
    rr = random.Random(seed)
    trunk_h = 10
    yb = base - trunk_h
    prof = [(0, 0.55), (0.1, 0.86), (0.25, 1.0), (0.42, 0.93), (0.6, 0.74), (0.76, 0.5), (0.9, 0.24), (1, 0)]
    left, right = [], []
    for t, wr in prof:
        y = yb - (H - trunk_h) * t
        lean = 2.5 * t * t
        left.append((x - W / 2 * wr * rr.uniform(0.94, 1.04) + lean, y))
        right.append((x + W / 2 * wr * rr.uniform(0.94, 1.04) + lean, y))
    tip = right[-1]
    outline = left[:-1] + [tip] + right[:-1][::-1]
    body = path(curve(outline, amp=0.5, step=9) + 'Z', fill=PAPER)
    trunk = path(f"M{P(x - 3, base + 2)}L{P(x - 2.4, yb + 1)}M{P(x + 3, base + 2)}L{P(x + 2.4, yb + 1)}")
    # foliage texture: small arcs in staggered rows
    tex = ''
    rows = int((H - trunk_h) / 13)
    for i in range(1, rows):
        t = i / rows
        y = yb - (H - trunk_h) * t
        # half width at t
        wr = interp(sorted([(pt, w) for pt, w in prof]), t) * W / 2
        lean = 2.5 * t * t
        k = -0.5 if i % 2 else 0
        n = max(1, int(wr * 2 / 13))
        for j in range(n + 1):
            cx = x + lean - wr + 7 + (j + k + 0.5) * (2 * wr - 14) / max(n, 1)
            if abs(cx - x - lean) > wr - 6:
                continue
            s = 4.2 + rr.uniform(-0.6, 0.6)
            tex += f"M{P(cx - s, y + 1.5)}Q{P(cx, y - 3)} {P(cx + s, y + 1.5)}"
    return trunk + body + path(tex, stroke_width='1.8')


def olive_big(x, base, s, flip=1, seed=0):
    rr = random.Random(seed)
    out = []
    F = lambda dx: x + dx * s * flip
    Y = lambda dy: base - dy * s
    # a gnarled trunk with a flared foot that parts into two limbs
    tl = [(-26, 0), (-14, 8), (-12, 26), (-18, 46), (-10, 66), (-24, 88), (-44, 108)]
    tr = [(28, 0), (15, 8), (12, 30), (18, 50), (8, 70), (22, 92), (46, 112)]
    fork = [(-34, 100), (-8, 78), (2, 92), (6, 116)]
    fork2 = [(36, 104), (12, 80)]
    L = [(F(a), Y(b)) for a, b in tl]
    Rt = [(F(a), Y(b)) for a, b in tr]
    out.append(path(curve(L, amp=0, step=12) + 'L' + P(*Rt[-1]) + curve(Rt[::-1], amp=0, step=12).replace('M', 'L', 1) + 'Z',
                    fill=PAPER, stroke='none'))
    out.append(path(curve(L, amp=0.5, step=10) + curve(Rt, amp=0.5, step=10)
                    + curve([(F(a), Y(b)) for a, b in fork], amp=0.4, step=10) + curve([(F(a), Y(b)) for a, b in fork2], amp=0.4, step=10)))
    bark = ''
    for pts in ([(-6, 6), (-3, 22), (-6, 40)], [(6, 12), (4, 30), (8, 46)], [(-4, 50), (0, 64)], [(-14, 76), (-20, 88)], [(12, 62), (14, 76)]):
        bark += curve([(F(a), Y(b)) for a, b in pts], amp=0.3, step=8)
    out.append(path(bark, stroke_width='1.8'))
    # the crown: lumps, back to front
    lumps = [(-14, 178, 46, 30), (48, 168, 42, 28), (-70, 156, 40, 27), (96, 142, 32, 22), (-110, 128, 30, 20),
             (16, 146, 50, 30), (-50, 126, 44, 26), (62, 124, 42, 24)]
    for (cx, cy, rx, ry) in lumps:
        X0, Y0 = F(cx), Y(cy)
        out.append(path(scallop(X0, Y0, rx * s, ry * s, 11, rr, flat_bottom=True), fill=PAPER))
        # silvery leaf marks: little arcs along the lower inside of the lump
        tex = ''
        for k in range(4):
            t = -0.55 + k * 0.36 + rr.uniform(-0.05, 0.05)
            lx = X0 + rx * s * 0.72 * t
            ly = Y0 + ry * s * (0.12 + 0.18 * (1 - abs(t))) - rr.uniform(0, 4)
            w = 5.5 * s
            tex += f"M{P(lx - w, ly)}Q{P(lx, ly + 3.4 * s)} {P(lx + w, ly - 0.5)}"
        for k in range(2):
            lx = X0 + rr.uniform(-0.4, 0.4) * rx * s
            ly = Y0 - ry * s * rr.uniform(0.15, 0.45)
            w = 4.5 * s
            tex += f"M{P(lx - w, ly)}Q{P(lx, ly + 3 * s)} {P(lx + w, ly - 0.5)}"
        out.append(path(tex, stroke_width='1.7'))
    return ''.join(out)


def daisy(x, y, h=14, s=1):
    d = f"M{P(x, y)}Q{P(x + 2, y - h * 0.5)} {P(x + 0.5, y - h)}"
    out = path(d, stroke_width='1.8')
    cx, cy = x + 0.5, y - h - 4 * s
    pet = ''
    for i in range(6):
        a = math.pi * 2 * i / 6 + 0.3
        pet += f"M{P(cx + 2 * s * math.cos(a), cy + 2 * s * math.sin(a))}Q{P(cx + 6 * s * math.cos(a + 0.45), cy + 6 * s * math.sin(a + 0.45))} {P(cx + 6.5 * s * math.cos(a), cy + 6.5 * s * math.sin(a))}Q{P(cx + 6 * s * math.cos(a - 0.45), cy + 6 * s * math.sin(a - 0.45))} {P(cx + 2 * s * math.cos(a), cy + 2 * s * math.sin(a))}"
    out += path(pet, fill=PAPER, stroke_width='1.6')
    out += f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(1.8 * s)}" fill="currentColor" stroke="none" data-nodraw=""/>'
    return out


def poppy(x, y, h=18):
    out = path(f"M{P(x, y)}Q{P(x - 3, y - h * 0.5)} {P(x - 1, y - h)}", stroke_width='1.8')
    cx, cy = x - 1, y - h
    cup = f"M{P(cx - 5, cy - 7)}Q{P(cx - 6, cy - 1)} {P(cx, cy)}Q{P(cx + 6, cy - 1)} {P(cx + 5, cy - 7)}Q{P(cx + 2.5, cy - 5)} {P(cx, cy - 8)}Q{P(cx - 2.5, cy - 5)} {P(cx - 5, cy - 7)}Z"
    out += path(cup, fill=PAPER, stroke_width='1.8')
    return out


def grass(x, y, s=1):
    return f"M{P(x - 2.5, y)}l{f(-3.5 * s)} {f(-10 * s)}M{P(x, y)}l{f(0.5 * s)} {f(-12 * s)}M{P(x + 2.5, y)}l{f(4 * s)} {f(-10 * s)}"


def stone(x, y, w, h):
    pts = [(x - w / 2, y), (x - w * 0.45, y - h * 0.6), (x - w * 0.15, y - h), (x + w * 0.25, y - h * 0.95), (x + w * 0.5, y - h * 0.4),
           (x + w * 0.5, y)]
    return path(curve(pts, amp=0.2, step=5) + 'Z', fill=PAPER, stroke_width='2.2')


def tholos(cx, base_y, S):
    """The Tholos of Athena Pronaia: a ring of three steps, a low cella wall, three Doric columns and their
    curved piece of entablature. base_y is the top of the lowest step at the centre line."""
    out = []
    sh = 7 * S / 1.25
    steps_def = [(base_y, 106 * S, 13 * S), (base_y - sh, 98 * S, 12 * S), (base_y - 2 * sh, 90 * S, 11 * S)]
    for (yt, rx, ry) in steps_def:
        front = circle_pts(cx, yt, rx, 30, 0, math.pi, ry=ry)
        bottom = circle_pts(cx, yt + sh, rx, 30, math.pi, 0, ry=ry)
        out.append(path(curve(front, amp=0.15, step=12) + 'L' + P(*bottom[0]) + curve(bottom, amp=0.15, step=12).replace('M', 'L', 1) + 'Z',
                        fill=PAPER))
        out.append(path(curve(circle_pts(cx, yt, rx, 30, math.pi, 2 * math.pi, ry=ry), amp=0.15, step=12), stroke_width='2.2'))
    ring_y = base_y - 2 * sh
    joints = ''
    for row, (yt, rx, ry) in enumerate(steps_def):
        for k in range(8 + 2 * row):
            a = math.pi * (k + 0.5 + 0.5 * (row % 2)) / (8 + 2 * row)
            if a >= math.pi:
                continue
            joints += f"M{P(cx + rx * math.cos(a), yt + ry * math.sin(a) + 0.8)}l0 {f(sh - 1.6)}"
    out.append(path(joints, stroke_width='1.4'))
    # low cella wall inside the ring
    wr, wry = 62 * S, 7.5 * S
    wt, wb = ring_y - 11 * S, ring_y - 2 * S
    out.append(path(curve(circle_pts(cx, wt, wr, 24, 0, math.pi, ry=wry), amp=0, step=10)
                    + 'L' + P(cx - wr, wb) + curve(circle_pts(cx, wb, wr, 24, math.pi, 0, ry=wry), amp=0, step=10).replace('M', 'L', 1) + 'Z',
                    fill=PAPER, stroke='none'))
    out.append(path(curve(circle_pts(cx, wt, wr, 24, math.pi, 2 * math.pi, ry=wry), amp=0.2, step=10)
                    + curve(circle_pts(cx, wt, wr, 24, 0, math.pi, ry=wry), amp=0.2, step=10)
                    + f"M{P(cx - wr, wt)}L{P(cx - wr, wb)}M{P(cx + wr, wt)}L{P(cx + wr, wb)}"))
    blocks = ''
    for c in range(2):
        yy = wt + 4.5 * S * c
        for k in range(7):
            a = math.pi * (k + 0.3 + 0.5 * (c % 2)) / 7
            blocks += f"M{P(cx + wr * math.cos(a), yy + wry * math.sin(a))}l0 {f(4.5 * S)}"
        if c:
            blocks += curve(circle_pts(cx, yy, wr, 20, 0.02, math.pi - 0.02, ry=wry), amp=0.1, step=12)
    out.append(path(blocks, stroke_width='1.4'))

    # three columns
    ring_rx, ring_ry = 80 * S, 10 * S
    angs = [math.radians(a) for a in (131, 106, 80)]
    top_y = ring_y - 94 * S
    for a in angs:
        x = cx + ring_rx * math.cos(a)
        yb = ring_y + ring_ry * math.sin(a)
        sq = 0.75 + 0.25 * math.sin(a)
        wb_, wt_ = 8.6 * S * sq, 6.8 * S * sq
        yt = top_y + ring_ry * math.sin(a) * 0.9
        cap_y = yt + 11 * S
        shaft = [(x - wb_, yb), (x - wb_ * 0.98, yb - 40 * S), (x - wt_, cap_y), (x + wt_, cap_y), (x + wb_ * 0.98, yb - 40 * S), (x + wb_, yb)]
        out.append(path(curve(shaft[:3], amp=0.15, step=14) + 'L' + P(*shaft[3]) + curve(shaft[3:], amp=0.15, step=14).replace('M', 'L', 1) + 'Z',
                        fill=PAPER))
        fl = ''
        for k in (-0.5, 0, 0.5):
            fl += curve([(x + k * wb_ * 1.1, yb - 3), (x + k * wb_ * 1.05, yb - 45 * S), (x + k * wt_ * 1.1, cap_y + 3)], amp=0.12, step=16)
        out.append(path(fl, stroke_width='1.4'))
        ew = wt_ + 4.5 * S * sq
        out.append(path(f"M{P(x - wt_, cap_y)}Q{P(x - ew, cap_y - 1)} {P(x - ew, cap_y - 5 * S)}L{P(x + ew, cap_y - 5 * S)}Q{P(x + ew, cap_y - 1)} {P(x + wt_, cap_y)}Z"
                        + poly([(x - ew - 0.5, cap_y - 5 * S), (x - ew - 0.5, cap_y - 10 * S), (x + ew + 0.5, cap_y - 10 * S), (x + ew + 0.5, cap_y - 5 * S)],
                               amp=0.1, closed=True), fill=PAPER))
        # drum joints
        dj = ''
        for jy in (0.33, 0.62):
            yy = yb - (yb - cap_y) * jy
            ww = wb_ - (wb_ - wt_) * jy
            dj += f"M{P(x - ww, yy)}Q{P(x, yy + 1.6)} {P(x + ww, yy)}"
        out.append(path(dj, stroke_width='1.4'))

    # entablature, a curved piece broken at both ends
    a0, a1 = math.radians(140), math.radians(70)

    def band(y, a):
        return cx + (ring_rx + 4 * S) * math.cos(a), y + ring_ry * math.sin(a) * 0.9

    def arcline(y, a_from, a_to, n=16):
        return [band(y, a_from + (a_to - a_from) * i / n) for i in range(n + 1)]

    yA, yF, yC, yT = top_y, top_y - 13 * S, top_y - 29 * S, top_y - 35 * S
    lower = arcline(yA, a0, a1)
    upper = arcline(yT, a1, a0)
    out.append(path(smooth(lower) + 'L' + P(*upper[0]) + smooth(upper).replace('M', 'L', 1) + 'Z', fill=PAPER, stroke='none'))
    ent = ''
    for yy in (yA, yF, yF - 1.5 * S, yC, yC - 1.8 * S):
        ent += curve(arcline(yy, a0, a1), amp=0.12, step=10)
    ent += curve(arcline(yT, a0 + 0.04, a1 - 0.03), amp=0.12, step=10)
    l0, l1 = band(yA, a0), band(yT, a0 + 0.04)
    ent += poly([l0, (l0[0] + 1.5, l0[1] - 9 * S), (l0[0] - 1, l0[1] - 17 * S), (l0[0] + 1, l0[1] - 26 * S), l1], amp=0.2)
    r0, r1 = band(yA, a1), band(yT, a1 - 0.03)
    ent += poly([r0, (r0[0] - 1, r0[1] - 10 * S), (r0[0] + 1.5, r0[1] - 20 * S), (r0[0] - 0.5, r0[1] - 28 * S), r1], amp=0.2)
    ent += curve(arcline(yC - 5.3 * S, a0 + 0.04, a1 - 0.03), amp=0.1, step=10)
    out.append(path(ent))
    tri = ''
    n_tri = 9
    for i in range(n_tri):
        a = a0 + (a1 - a0) * (i + 0.5) / n_tri
        x, y = band(yF, a)
        sq = 0.7 + 0.3 * math.sin(a)
        w = 5.2 * S * sq
        tri += poly([(x - w, y - 1.5), (x - w, y - 14.5 * S), (x + w, y - 14.5 * S), (x + w, y - 1.5)], amp=0.1)
        tri += f"M{P(x - w / 3, y - 3)}L{P(x - w / 3, y - 13 * S)}M{P(x + w / 3, y - 3)}L{P(x + w / 3, y - 13 * S)}"
        xa, ya = band(yA, a)
        tri += f"M{P(x - w, ya - 11 * S)}L{P(x + w, ya - 11 * S)}"
    out.append(path(tri, stroke_width='1.4'))
    den = ''
    for i in range(22):
        a = a0 + 0.04 + (a1 - a0 - 0.07) * (i + 0.5) / 22
        x, y = band(yC - 1.8 * S, a)
        den += f"M{P(x, y)}l0 {f(-3.4 * S)}"
    out.append(path(den, stroke_width='1.3'))
    return ''.join(out)


def drum(x, y, r, L):
    """a column drum lying on its side; (x, y) the centre of its visible end"""
    body = poly([(x, y - r), (x + L, y - r * 0.96), (x + L + 1, y + r), (x, y + r)], amp=0.2)
    e = circle_pts(x, y, r * 0.42, 16, 0, 2 * math.pi, ry=r)
    o = path(body + 'Z', fill=PAPER)
    o += path(curve(e[:-1], amp=0.1, step=5, closed=True), fill=PAPER)
    o += path(f"M{P(x + L * 0.55, y - r + 2)}Q{P(x + L * 0.6, y)} {P(x + L * 0.55, y + r - 2)}", stroke_width='1.4')
    return o


# Athena's owl (drawn for the olive grove), perched on the tip of the tallest cypress: seen only by night,
# it flies in when night falls; a click wakes it (Maria, 23 November 2026)
OWL = '<g class="delphi-owl"><g transform="translate(188 -170)">' + '<g class="grove-owl"><path fill="var(--paper, #f2e9d3)" stroke-width="2.2" d="M1074 169.8C1070.2 169.8 1065.5 169.8 1062.8 171.2C1060 172.8 1058.5 175.1 1057.5 178.8C1056.5 182.4 1056.4 188.4 1056.8 193C1057.1 197.6 1058.1 203.1 1059.8 206.5C1061.4 209.9 1064.1 211.9 1066.5 213.2C1068.9 214.6 1071.5 214.8 1074 214.8C1076.5 214.8 1079.1 214.6 1081.5 213.2C1083.9 211.9 1086.6 209.9 1088.2 206.5C1089.9 203.1 1090.9 197.6 1091.2 193C1091.6 188.4 1091.5 182.4 1090.5 178.8C1089.5 175.1 1088 172.8 1085.2 171.2C1082.5 169.8 1077.8 169.8 1074 169.8Z"/><circle cx="1067.4" cy="183.2" r="4.9" fill="var(--paper, #f2e9d3)" stroke-width="1.8"/><circle class="owl-eye" cx="1067.8" cy="183.4" r="2" fill="currentColor" stroke="none"/><circle cx="1080.6" cy="183.2" r="4.9" fill="var(--paper, #f2e9d3)" stroke-width="1.8"/><circle class="owl-eye" cx="1080.2" cy="183.4" r="2" fill="currentColor" stroke="none"/><path stroke-width="1.6" d="M1061.1 178Q1067.2 172.8 1073.1 177.7Q1080.8 172.8 1086.9 178M1072 187L1074 191.5L1076 187M1058.7 191.5Q1060.5 202 1067.2 209.5M1089.3 191.5Q1087.5 202 1080.8 209.5M1069.5 214.8l-1.2 2.6M1071.8 214.8l0 2.8M1078.5 214.8l1.2 2.6M1076.2 214.8l0 2.8M1069.5 199q1 1.2 2 0M1077.8 196.8q1 1.2 2 0M1073.2 204.2q1 1.2 2 0M1080 205q1 1.2 2 0"/></g><g class="grove-sparks"><path style="--d:0.00s" fill="var(--gold, #cda04f)" stroke="none" d="M1023 135Q1023 145 1033 145Q1023 145 1023 155Q1023 145 1013 145Q1023 145 1023 135Z"/><path style="--d:0.07s" fill="var(--gold, #cda04f)" stroke="none" d="M1122 121Q1122 133 1134 133Q1122 133 1122 145Q1122 133 1110 133Q1122 133 1122 121Z"/><path style="--d:0.14s" fill="var(--gold, #cda04f)" stroke="none" d="M1002 182Q1002 190 1010 190Q1002 190 1002 198Q1002 190 994 190Q1002 190 1002 182Z"/><path style="--d:0.21s" fill="var(--gold, #cda04f)" stroke="none" d="M1143 172Q1143 181 1152 181Q1143 181 1143 190Q1143 181 1134 181Q1143 181 1143 172Z"/><path style="--d:0.28s" fill="var(--gold, #cda04f)" stroke="none" d="M1074 92Q1074 103 1085 103Q1074 103 1074 114Q1074 103 1063 103Q1074 103 1074 92Z"/><path style="--d:0.35s" fill="var(--gold, #cda04f)" stroke="none" d="M1038 84Q1038 91 1045 91Q1038 91 1038 98Q1038 91 1031 91Q1038 91 1038 84Z"/><path style="--d:0.42s" fill="var(--gold, #cda04f)" stroke="none" d="M1113 75Q1113 82 1120 82Q1113 82 1113 89Q1113 82 1106 82Q1113 82 1113 75Z"/><path style="--d:0.49s" fill="var(--gold, #cda04f)" stroke="none" d="M987 133Q987 139 993 139Q987 139 987 145Q987 139 981 139Q987 139 987 133Z"/><path style="--d:0.56s" fill="var(--gold, #cda04f)" stroke="none" d="M1161 136Q1161 142 1167 142Q1161 142 1161 148Q1161 142 1155 142Q1161 142 1161 136Z"/></g>' + '</g></g>'

def near():
    out = []
    ground = [(x, 283 + 2.6 * math.sin(x / 97) + 1.6 * math.sin(x / 41 + 1)) for x in range(-40, 1641, 40)]
    S = 1.25
    TX = 800

    # the rise the tholos stands on
    mound = [(360, 288), (430, 282), (500, 270), (560, 254), (610, 238), (660, 224), (720, 214), (800, 211), (900, 213),
             (960, 222), (1020, 240), (1080, 258), (1140, 272), (1220, 286)]
    out.append(path(curve(mound, amp=0.5, step=18) + 'Z', fill=PAPER))
    hatch = ''
    for (x0, x1, y0) in [(440, 490, 280), (972, 1020, 240), (1050, 1100, 260), (1120, 1180, 276), (980, 1010, 252)]:
        hatch += curve([(x0, y0), ((x0 + x1) / 2, y0 - 2), (x1, y0)], amp=0.3, step=12)
    out.append(path(hatch, stroke_width='1.8'))

    # the stone path, winding up to the tholos
    cl = [(614, 293), (642, 281), (646, 269), (630, 259), (622, 249), (634, 240), (658, 232), (690, 226)]
    wd = [120, 92, 70, 54, 43, 34, 26, 20]

    def at(y):
        for i in range(len(cl) - 1):
            if cl[i + 1][1] <= y <= cl[i][1]:
                t = (cl[i][1] - y) / (cl[i][1] - cl[i + 1][1])
                return cl[i][0] + (cl[i + 1][0] - cl[i][0]) * t, wd[i] + (wd[i + 1] - wd[i]) * t
        return cl[-1][0], wd[-1]

    Lp = [(cx - w / 2, cy) for (cx, cy), w in zip(cl, wd)]
    Rp = [(cx + w / 2, cy) for (cx, cy), w in zip(cl, wd)]
    out.append(path(curve(Lp, amp=0, step=8) + 'L' + P(*Rp[-1]) + curve(Rp[::-1], amp=0, step=8).replace('M', 'L', 1) + 'Z',
                    fill=PAPER, stroke='none'))
    out.append(path(curve(Lp, amp=0.4, step=8) + curve(Rp, amp=0.4, step=8)))
    steps = ''
    risers = ''
    y = 283.0
    dy = 8.4
    while y > 228:
        cx, w = at(y)
        a, b = cx - w / 2 + 1.5, cx + w / 2 - 1.5
        steps += curve([(a, y + 0.3), ((a + b) / 2, y - 0.5), (b, y + 0.2)], amp=0.2, step=12)
        ry_ = y + max(1.6, dy * 0.32)
        risers += curve([(a + 2, ry_), (b - 2, ry_ + 0.2)], amp=0.15, step=14)
        if w > 28:
            for j in ((R.uniform(0.2, 0.4), R.uniform(0.6, 0.8)) if w > 64 else (R.uniform(0.35, 0.65),)):
                steps += f"M{P(a + (b - a) * j, y + 0.8)}l{f(R.uniform(-0.5, 0.5))} {f(dy * 0.6)}"
        y -= dy
        dy = max(2.9, dy * 0.87)
    out.append(path(steps, stroke_width='2'))
    out.append(path(risers, stroke_width='1.3'))
    edge = ''
    for side in (-1, 1):
        y = 285
        while y > 238:
            cx, w = at(y)
            sx = cx + side * (w / 2 + 2 + w * 0.03)
            sz = 1.6 + w * 0.045
            edge += stone(sx, y + 1, sz * 2.4, sz * 1.2)
            y -= 9 + (288 - y) * 0.1 + R.uniform(0, 5)
    out.append(edge)

    out.append(tholos(TX, 212, S))

    # cypresses framing the path
    out.append(cypress(398, 288, 236, 42, seed=1))
    out.append(cypress(442, 286, 176, 34, seed=2))
    out.append(cypress(530, 287, 210, 36, seed=3))
    # cypresses at the right
    # the three on the right sway when the owl is woken (each its own group, swaying about its foot)
    out.append('<g class="delphi-sway" style="--sway:1">' + cypress(1222, 287, 214, 40, seed=4) + '</g>')
    out.append('<g class="delphi-sway" style="--sway:1.3">' + cypress(1262, 286, 256, 46, seed=5) + '</g>')
    out.append('<g class="delphi-sway" style="--sway:0.8">' + cypress(1300, 288, 176, 34, seed=6) + '</g>')
    out.append(OWL)
    # old olives at the edges
    out.append(olive_big(118, 287, 1.0, flip=1, seed=7))
    out.append('<g class="delphi-sway" style="--sway:0.6">' + olive_big(1490, 287, 0.92, flip=-1, seed=8) + '</g>')

    # ground band (the copyright band below meets it)
    gd = curve(ground, amp=0, step=40)
    bumps = ''
    for (bx, bw, bh) in [(26, 30, 7), (330, 26, 6), (486, 30, 6), (740, 24, 5), (868, 34, 7), (1110, 28, 6), (1380, 40, 8), (1584, 26, 6)]:
        by = interp(ground, bx) + 1.5
        bumps += f"M{P(bx - bw / 2, by)}A{f(bw * 0.3)} {f(bh)} 0 0 1 {P(bx, by - bh)}A{f(bw * 0.3)} {f(bh)} 0 0 1 {P(bx + bw / 2, by)}Z"
    out.append(path(gd + 'V374H-40Z' + bumps, fill='currentColor'))
    gr = ''
    for x in [30, 210, 262, 300, 372, 528, 660, 712, 812, 900, 984, 1080, 1160, 1196, 1350, 1420, 1560, 1610]:
        gr += grass(x, interp(ground, x) - 0.5, R.uniform(0.85, 1.15))
    for (x, y) in [(918, 216), (990, 246), (1064, 262), (500, 274), (712, 216)]:
        gr += grass(x, y, 0.72)
    out.append(path(gr, stroke_width='2'))
    fl = ''
    for (x, h) in [(300, 15), (326, 11), (566, 10), (1000, 14), (1124, 12), (1146, 16), (1404, 13), (1570, 12)]:
        fl += daisy(x, interp(ground, x) - 0.5, h, 0.95)
    for (x, h) in [(240, 17), (1060, 15), (1356, 19)]:
        fl += poppy(x, interp(ground, x) - 0.5, h)
    out.append(fl)
    st = ''
    for (x, w, h) in [(352, 22, 10), (1176, 18, 8), (1440, 26, 11), (770, 16, 6)]:
        st += stone(x, interp(ground, x) + 1, w, h)
    out.append(st)
    return svg(360, 2.6, out)
