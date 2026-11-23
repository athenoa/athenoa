"""Plato's olive grove: generates footer-grove-far/mid/near.svg (grove agent's generator)."""
import math
import random

OUT = './'  # run from src/assets/illustrations: python3 footer-grove.py
PAPER = 'var(--paper, #f2e9d3)'


def f(n):
    s = f'{n:.1f}'
    if s.endswith('.0'):
        s = s[:-2]
    return '0' if s == '-0' else s


def pt(p):
    return f'{f(p[0])} {f(p[1])}'


def catmull(pts, closed=False):
    """Smooth path through points (Catmull-Rom as cubic Beziers)."""
    n = len(pts)
    if closed:
        get = lambda i: pts[i % n]
        segs = range(n)
    else:
        get = lambda i: pts[min(max(i, 0), n - 1)]
        segs = range(n - 1)
    d = f'M{pt(pts[0])}'
    for i in segs:
        p0, p1, p2, p3 = get(i - 1), get(i), get(i + 1), get(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{pt(c1)} {pt(c2)} {pt(p2)}'
    if closed:
        d += 'Z'
    return d


def path(d, **attrs):
    a = ''.join(f' {k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<path{a} d="{d}"/>'


def jit(rng, pts, a):
    return [(x + rng.uniform(-a, a), y + rng.uniform(-a, a)) for x, y in pts]


def interp(ctrl, x):
    """Piecewise-linear lookup of y at x in a sorted control list, smoothed by cosine."""
    if x <= ctrl[0][0]:
        return ctrl[0][1]
    for (x0, y0), (x1, y1) in zip(ctrl, ctrl[1:]):
        if x0 <= x <= x1:
            t = (x - x0) / (x1 - x0)
            t = (1 - math.cos(t * math.pi)) / 2
            return y0 + (y1 - y0) * t
    return ctrl[-1][1]


def line_along(ctrl, x0, x1, dy=0, step=26, rng=None, a=0.6):
    pts = []
    x = x0
    while x < x1:
        pts.append((x, interp(ctrl, x) + dy))
        x += step
    pts.append((x1, interp(ctrl, x1) + dy))
    if rng:
        pts = [pts[0]] + jit(rng, pts[1:-1], a) + [pts[-1]]
    return pts


def svg(viewh, sw, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 {viewh}" fill="none" stroke="currentColor" '
        f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">' + ''.join(body) + '</svg>\n'
    )


def sparkle(x, y, s):
    """Four-pointed star like the other night skies."""
    return (
        f'M{f(x)} {f(y - s)}Q{f(x + s * 0.15)} {f(y - s * 0.2)} {f(x + s * 0.75)} {f(y)}'
        f'Q{f(x + s * 0.15)} {f(y + s * 0.2)} {f(x)} {f(y + s)}'
        f'Q{f(x - s * 0.15)} {f(y + s * 0.2)} {f(x - s * 0.75)} {f(y)}'
        f'Q{f(x - s * 0.15)} {f(y - s * 0.2)} {f(x)} {f(y - s)}Z'
    )


def scallop_blob(rng, cx, cy, rx, ry, chord=(9, 17), bulge=0.62, flat_bottom=0.0):
    """Closed outline of small outward arcs around an irregular ellipse: a clump of leaves."""
    pts = []
    a = rng.uniform(0, 0.4)
    per = math.pi * (rx + ry)
    while a < 2 * math.pi + rng.uniform(0, 0.1) - 0.15:
        r = 1 + rng.uniform(-0.09, 0.09)
        x = cx + rx * r * math.cos(a)
        y = cy + ry * r * math.sin(a)
        if flat_bottom and math.sin(a) > 0:
            y = cy + ry * r * math.sin(a) * (1 - flat_bottom)
        pts.append((x, y))
        a += rng.uniform(*chord) / per * 2 * math.pi
    d = f'M{pt(pts[0])}'
    for p, q in zip(pts, pts[1:] + pts[:1]):
        c = math.hypot(q[0] - p[0], q[1] - p[1])
        rad = c * bulge * rng.uniform(0.9, 1.15)
        rad = max(rad, c / 2 + 0.01)
        d += f'A{f(rad)} {f(rad)} 0 0 1 {pt(q)}'
    return d + 'Z'


# --------------------------------------------------------------------------------------------- FAR
def far():
    rng = random.Random(11)
    b = []
    # sun, low in the saddle left of Lycabettus (right third)
    sx, sy, sr = 1068, 204, 35
    disc = [(sx + sr * math.cos(t), sy + sr * math.sin(t)) for t in [i / 24 * 2 * math.pi for i in range(24)]]
    rays = ''
    for i in range(15):
        t = math.pi + (i + 0.5) / 15 * math.pi
        r0 = sr + 9
        r1 = sr + (25 if i % 2 == 0 else 16) + rng.uniform(-2, 2)
        rays += f'M{pt((sx + r0 * math.cos(t), sy + r0 * math.sin(t)))}L{pt((sx + r1 * math.cos(t), sy + r1 * math.sin(t)))}'
    b.append(
        '<g class="sky-day" style="--set:150px">'
        + path(catmull(jit(rng, disc, 0.5), True), data_gold='')
        + path(rays, data_gold='')
        + '</g>'
    )
    # night: a crescent in the left third, stars
    mx, my, mr = 516, 64, 21
    moon = (
        f'M{f(mx + 4)} {f(my - mr)}A{mr} {mr} 0 1 0 {f(mx + 15)} {f(my + 15)}'
        f'A{mr - 2} {mr - 2} 0 0 1 {f(mx + 4)} {f(my - mr)}Z'
    )
    night = f'<g class="sky-night" display="none"><g class="sky-moon" style="--rise:120px">{path(moon, data_gold="", data_nodraw="")}</g>'
    stars = [(118, 44, 'd'), (300, 26, 's'), (640, 30, 'd'), (760, 84, 's'), (905, 36, 'd'), (1012, 104, 'd'),
             (1140, 46, 's'), (1328, 30, 'd'), (1446, 80, 's'), (1560, 40, 'd'), (196, 112, 'd')]
    for n, (x, y, k) in enumerate(stars):
        if k == 'd':
            s = f'<circle data-nodraw="" cx="{x}" cy="{y}" r="{rng.choice([2, 2.1, 2.2])}" fill="currentColor" stroke="none"/>'
        else:
            s = path(sparkle(x, y, rng.uniform(9, 11)), data_nodraw='')
        night += f'<g class="sky-star" style="--n:{n}">{s}</g>'
    b.append(night + '</g>')

    # thin clouds (paper lenses with a line through them)
    def cloud(x0, x1, y, h):
        top = [(x0, y)] + [(x0 + (x1 - x0) * t, y - h * math.sin(t * math.pi) * (0.8 + 0.4 * math.sin(t * 7))) for t in (0.15, 0.3, 0.45, 0.6, 0.75, 0.9)] + [(x1, y)]
        bot = [(x0 + (x1 - x0) * t, y + h * 0.28 * math.sin(t * math.pi)) for t in (0.8, 0.5, 0.2)]
        out = path(catmull(top + bot, True), fill=PAPER)
        inner = path(catmull([(x0 + (x1 - x0) * 0.22, y - h * 0.15), (x0 + (x1 - x0) * 0.5, y - h * 0.3), (x0 + (x1 - x0) * 0.8, y - h * 0.12)]))
        return out + inner

    b.append(cloud(170, 400, 118, 13))
    b.append(cloud(250, 350, 136, 6))
    b.append(cloud(1330, 1540, 112, 12))
    # three birds over the saddle
    for x, y, s in [(905, 128, 7), (930, 116, 5.5), (948, 134, 4.5)]:
        b.append(path(f'M{f(x - s)} {f(y - s * 0.3)}Q{f(x - s * 0.45)} {f(y - s * 0.75)} {f(x)} {f(y)}Q{f(x + s * 0.45)} {f(y - s * 0.75)} {f(x + s)} {f(y - s * 0.3)}', stroke_width='1.8'))

    # back ridge: Parnes to the left, the long back of Hymettus to the right
    r1 = [(-40, 182), (60, 172), (170, 160), (270, 166), (360, 178), (450, 172), (560, 180), (660, 192), (760, 200),
          (860, 205), (960, 210), (1040, 212), (1120, 206), (1220, 190), (1320, 168), (1420, 158), (1520, 160), (1640, 170)]

    def ridge(ctrl, x0=-40, x1=1640, a=0.8):
        crest = line_along(ctrl, x0, x1, step=24, rng=rng, a=a)
        fill = path(catmull(crest) + f'L{x1} 440L{x0} 440Z', fill=PAPER, stroke='none')
        return fill + path(catmull(crest))

    b.append(ridge(r1))
    for x0, x1, dy in [(100, 330, 12), (420, 600, 10), (1300, 1560, 13), (1380, 1500, 25), (190, 260, 24)]:
        b.append(path(catmull(line_along(r1, x0, x1, dy, rng=rng, a=0.5))))

    # Lycabettus: a gentle cone in the right third, in front of the back ridge
    ly = [(1080, 226), (1120, 212), (1150, 190), (1172, 160), (1190, 136), (1204, 124), (1216, 122), (1228, 128),
          (1246, 148), (1272, 176), (1306, 198), (1350, 212), (1400, 222)]
    lyc = jit(rng, ly, 0.6)
    b.append(path(catmull(lyc) + 'L1400 440L1080 440Z', fill=PAPER, stroke='none') + path(catmull(lyc)))
    # its flank: a few hatch strokes on the shaded side and a path winding up
    for i in range(6):
        t = 0.2 + i * 0.12
        x = 1222 + t * 70
        y = 130 + t * 70
        b.append(path(f'M{f(x)} {f(y + 6)}l{f(-6 - i)} {f(14 + i * 2)}'))

    # nearer hills of the plain, and the Acropolis on its rock (left third)
    r2 = [(-40, 236), (80, 222), (200, 212), (300, 216), (380, 224), (470, 226), (560, 232), (680, 240), (800, 244),
          (920, 243), (1040, 246), (1160, 240), (1280, 232), (1400, 228), (1520, 222), (1640, 230)]
    # the rock
    rock = [(330, 222), (352, 214), (368, 206), (372, 198), (392, 195), (430, 194), (468, 195), (480, 200), (486, 210),
            (500, 218), (520, 226)]
    rock = jit(rng, rock, 0.4)
    b.append(path(catmull(rock) + 'L520 260L330 260Z', fill=PAPER, stroke='none') + path(catmull(rock)))
    for x0, y0, l in [(378, 204, 14), (474, 203, 13), (395, 199, 9)]:
        b.append(path(f'M{f(x0)} {f(y0)}l{f(-3)} {f(l)}', stroke_width='1.6'))
    # Parthenon: stylobate, columns, entablature, pediment
    px, py, pw = 404, 194, 46
    tmp = f'M{f(px - 2)} {f(py)}H{f(px + pw + 2)}M{f(px)} {f(py - 3)}H{f(px + pw)}'
    for i in range(8):
        cx = px + 3 + i * (pw - 6) / 7
        tmp += f'M{f(cx)} {f(py - 3)}V{f(py - 15)}'
    tmp += f'M{f(px - 1)} {f(py - 15)}H{f(px + pw + 1)}M{f(px - 1)} {f(py - 18)}H{f(px + pw + 1)}'
    tmp += f'M{f(px)} {f(py - 18)}L{f(px + pw / 2)} {f(py - 24)}L{f(px + pw)} {f(py - 18)}'
    b.append(path(tmp, stroke_width='1.6'))
    b.append(ridge(r2))
    for x0, x1, dy in [(60, 250, 10), (600, 820, 9), (900, 1100, 10), (1300, 1520, 9), (700, 760, 19)]:
        b.append(path(catmull(line_along(r2, x0, x1, dy, rng=rng, a=0.5))))
    open(OUT + 'footer-grove-far.svg', 'w').write(svg(420, 2, b))



# --------------------------------------------------------------------------------------------- MID
def norm(v):
    L = math.hypot(*v) or 1
    return (v[0] / L, v[1] / L)


def leafy_blob(rng, cx, cy, rx, ry, chord=(9, 14), h=(4, 6.5), droop=0.3, flat_bottom=0.3):
    """Closed outline of an olive clump: an irregular oval whose edge breaks into small leaf tips."""
    pts = []
    per = math.pi * (rx + ry)
    a = rng.uniform(0, 0.5)
    end = a + 2 * math.pi
    while a < end - 0.12:
        r = 1 + rng.uniform(-0.08, 0.08) + 0.06 * math.sin(a * 3 + cx)
        s = math.sin(a)
        y = cy + ry * r * s * ((1 - flat_bottom) if s > 0 else 1)
        pts.append((cx + rx * r * math.cos(a), y))
        a += rng.uniform(*chord) / per * 2 * math.pi
    d = f'M{pt(pts[0])}'
    for p, q in zip(pts, pts[1:] + pts[:1]):
        m = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
        n = norm((m[0] - cx, (m[1] - cy) * rx / ry))
        t = norm((q[0] - p[0], q[1] - p[1]))
        hh = rng.uniform(*h)
        tip = (m[0] + n[0] * hh + t[0] * hh * 0.35, m[1] + n[1] * hh + t[1] * hh * 0.35 + hh * droop)
        c1 = (p[0] + n[0] * hh * 0.7, p[1] + n[1] * hh * 0.7)
        c2 = (q[0] + n[0] * hh * 0.45 + (tip[0] - q[0]) * 0.3, q[1] + n[1] * hh * 0.45 + (tip[1] - q[1]) * 0.3)
        d += f'Q{pt(c1)} {pt(tip)}Q{pt(c2)} {pt(q)}'
    return d + 'Z'


def leaf(x, y, ang, L=8, w=2.4):
    c, s = math.cos(ang), math.sin(ang)
    p1 = (x + c * L, y + s * L)
    m = (x + c * L / 2, y + s * L / 2)
    return f'M{f(x)} {f(y)}Q{pt((m[0] - s * w, m[1] + c * w))} {pt(p1)}Q{pt((m[0] + s * w, m[1] - c * w))} {f(x)} {f(y)}Z'


def sprigs(rng, cx, cy, rx, ry, n):
    """Inside a clump: an inner edge of leaf tips across its lower part (the mass of leaves turning
    under), and a single leaf or two above it."""
    a0, a1 = math.radians(rng.uniform(22, 38)), math.radians(rng.uniform(142, 158))
    ecx, ecy, erx, ery = cx + rng.uniform(-3, 3), cy - ry * 0.12, rx * 0.68, ry * 0.5
    pts = []
    a = a0
    while a < a1:
        pts.append((ecx + erx * math.cos(a), ecy + ery * math.sin(a)))
        a += rng.uniform(9, 13) / (math.pi * (erx + ery)) * 2 * math.pi
    d = ''
    if len(pts) > 2:
        d = f'M{pt(pts[0])}'
        for p, q in zip(pts, pts[1:]):
            m = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
            nn = norm((m[0] - ecx, (m[1] - ecy) * erx / ery))
            t = norm((q[0] - p[0], q[1] - p[1]))
            hh = rng.uniform(3.5, 5.5)
            tip = (m[0] + nn[0] * hh + t[0] * hh * 0.35, m[1] + nn[1] * hh + t[1] * hh * 0.35 + hh * 0.3)
            c1 = (p[0] + nn[0] * hh * 0.7, p[1] + nn[1] * hh * 0.7)
            c2 = (q[0] + nn[0] * hh * 0.45 + (tip[0] - q[0]) * 0.3, q[1] + nn[1] * hh * 0.45 + (tip[1] - q[1]) * 0.3)
            d += f'Q{pt(c1)} {pt(tip)}Q{pt(c2)} {pt(q)}'
    for _ in range(n - 2 if rx > 34 else 0):
        x = cx + rng.uniform(-0.45, 0.45) * rx
        y = cy - ry * rng.uniform(0.3, 0.5)
        d += leaf(x, y, rng.choice([0.5, 2.6]) + rng.uniform(-0.3, 0.3), rng.uniform(7, 8.5))
    return path(d, stroke_width='1.8') if d else ''


def small_olive(rng, x, y, w):
    """A young olive of the orchard: short twisted trunk, a round leafy crown."""
    h = w * 0.6
    tw = max(w * 0.09, 2)
    th = w * 0.36
    out = []
    lean = rng.uniform(-2, 2)
    trunk = [(x - tw * 1.6, y + 0.5), (x - tw * 0.6, y - th * 0.3), (x - tw * 0.6 + lean, y - th * 0.7), (x - tw * 1.2 + lean, y - th - 2),
             (x + tw * 1.2 + lean, y - th - 2), (x + tw * 0.6 + lean, y - th * 0.6), (x + tw * 0.7, y - th * 0.25), (x + tw * 1.7, y + 0.5)]
    out.append(path(catmull(trunk) + 'Z', fill=PAPER))
    cy = y - th - h * 0.4
    c = max(w * 0.26, 6)
    out.append(path(leafy_blob(rng, x + lean, cy, w / 2, h / 2, chord=(c, c * 1.5), h=(w * 0.07, w * 0.11), flat_bottom=0.3), fill=PAPER))
    out.append(path(f'M{f(x - w * 0.32)} {f(y + 1.5)}h{f(w * 0.64)}', stroke_width='1.5'))
    return ''.join(out)


def mid():
    rng = random.Random(23)
    b = []
    crest = [(-40, 108), (100, 98), (240, 86), (380, 80), (520, 86), (660, 96), (800, 100), (940, 94), (1080, 84),
             (1220, 74), (1360, 70), (1480, 76), (1640, 90)]
    cl = line_along(crest, -40, 1640, step=24, rng=rng, a=0.7)
    b.append(path(catmull(cl) + 'L1640 320L-40 320Z', fill=PAPER, stroke='none'))
    b.append(path(catmull(cl)))
    # two cypresses on the left of the grove
    for x, hgt, w in [(262, 74, 13), (284, 58, 11)]:
        y = interp(crest, x) + 30
        c = [(x - 1.5, y), (x - w / 2, y - hgt * 0.35), (x - w * 0.42, y - hgt * 0.7), (x, y - hgt), (x + w * 0.42, y - hgt * 0.7),
             (x + w / 2, y - hgt * 0.35), (x + 1.5, y)]
        b.append(path(catmull(jit(rng, c, 0.4)), fill=PAPER))
        b.append(path(f'M{f(x)} {f(y - hgt * 0.8)}q{f(-2)} {f(hgt * 0.3)} 0 {f(hgt * 0.65)}', stroke_width='1.6'))
    # rows of olives down the slope: the back row on the skyline, then nearer rows, each larger
    rows = [(9, 20, 70), (40, 27, 90), (76, 35, 112)]
    for ri, (dy, w, gap) in enumerate(rows):
        x = -30 + (ri * 31) % gap
        trees = []
        while x < 1640:
            xx = x + rng.uniform(-gap * 0.12, gap * 0.12)
            if not (236 < xx < 306 and ri < 2):
                trees.append((xx, interp(crest, xx) + dy + rng.uniform(-1.5, 1.5), w * rng.uniform(0.86, 1.12)))
            x += gap
        # the furrow under the row, in broken lengths
        for x0 in range(-40, 1640, 170):
            x1 = x0 + rng.uniform(90, 140)
            b.append(path(catmull(line_along(crest, x0 + rng.uniform(0, 20), x1, dy + 4, rng=rng, a=0.5)), stroke_width='1.5'))
        for xx, yy, ww in trees:
            b.append(small_olive(rng, xx, yy, ww))
    # the low dry-stone wall across the slope, and the terrace in front of it
    wall_dy = 112
    top = line_along(crest, -40, 1640, wall_dy, step=20, rng=rng, a=0.8)
    base = [(x, y + 15) for x, y in top]
    b.append(path(catmull(top) + 'L1640 320L-40 320Z', fill=PAPER, stroke='none'))
    b.append(path(catmull(top)))
    b.append(path(catmull(base)))
    # its stones: two rough courses of rounded field stones
    st = ''
    for course in (0, 1):
        x = -40 + course * 8
        while x < 1640:
            w = rng.uniform(10, 21)
            hgt = rng.uniform(4.6, 6.4)
            y0 = interp(crest, x + w / 2) + wall_dy + 1.6 + course * 6.8 + rng.uniform(-0.5, 0.5)
            if rng.random() < 0.8:
                r = hgt / 2
                st += (f'M{f(x)} {f(y0 + r)}q0 {f(-r)} {f(r)} {f(-r)}h{f(w - 2 * r)}q{f(r)} 0 {f(r)} {f(r)}'
                       f'q0 {f(r)} {f(-r)} {f(r)}h{f(-(w - 2 * r))}q{f(-r)} 0 {f(-r)} {f(-r)}Z')
            x += w + rng.uniform(1.5, 3)
    b.append(path(st, stroke_width='1.4'))
    # a stele with a palmette crown, by the wall on the right
    sx = 1296
    sy = interp(crest, sx) + wall_dy - 1
    b.append(path(f'M{f(sx - 8)} {f(sy)}L{f(sx - 7)} {f(sy - 38)}H{f(sx + 7)}L{f(sx + 8)} {f(sy)}Z', fill=PAPER))
    b.append(path(f'M{f(sx - 7)} {f(sy - 32)}H{f(sx + 7)}', stroke_width='1.6'))
    b.append(path(f'M{f(sx - 7)} {f(sy - 38)}C{f(sx - 9)} {f(sy - 52)} {f(sx + 9)} {f(sy - 52)} {f(sx + 7)} {f(sy - 38)}Z', fill=PAPER))
    b.append(path(f'M{f(sx)} {f(sy - 39)}V{f(sy - 47)}M{f(sx)} {f(sy - 39)}L{f(sx - 4)} {f(sy - 46)}M{f(sx)} {f(sy - 39)}L{f(sx + 4)} {f(sy - 46)}', stroke_width='1.5'))
    # grass along the foot of the wall
    g = ''
    for x in range(-20, 1640, 47):
        xx = x + rng.uniform(-10, 10)
        yy = interp(crest, xx) + wall_dy + 18
        g += f'M{f(xx - 3)} {f(yy)}l{f(-2)} {f(-6)}M{f(xx)} {f(yy)}l0 {f(-8)}M{f(xx + 3)} {f(yy)}l{f(2)} {f(-6)}'
    b.append(path(g, stroke_width='1.6'))
    open(OUT + 'footer-grove-mid.svg', 'w').write(svg(300, 2.2, b))


# -------------------------------------------------------------------------------------------- NEAR
def offset_line(cl, widths, side):
    """side -1: the left of a line that runs upward; +1: its right."""
    out = []
    for i, (x, y) in enumerate(cl):
        a = cl[max(i - 1, 0)]
        c = cl[min(i + 1, len(cl) - 1)]
        nx, ny = norm((-(c[1] - a[1]), c[0] - a[0]))
        w = widths[i] / 2 * side
        out.append((x + nx * w, y + ny * w))
    return out


def bez(p0, p1, p2, n):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
            for t in [i / (n - 1) for i in range(n)]]


def olive_tree(rng, base, fork, trunk_w, limbs, clumps, twigs=(), hollow=None, sprig_n=3):
    """An old olive: one outline for a twisted trunk and its limbs, then clumps of leaves.
    limbs: (ctrl, tip, w0, w1) from the fork, ordered left to right."""
    bx, by = base
    fx, fy = fork
    n = 7
    cl = bez((bx, by), ((bx + fx) / 2 + rng.uniform(-6, 6), (by + fy) / 2), (fx, fy), n)
    widths = [trunk_w * w for w in (1.7, 1.18, 0.98, 1.06, 0.94, 1.04, 1.12)]
    tl = offset_line(cl, widths, -1)
    tr = offset_line(cl, widths, 1)
    tl[0] = (tl[0][0] - trunk_w * 0.3, by + 4)
    tr[0] = (tr[0][0] + trunk_w * 0.3, by + 4)
    sides = []
    for ctrl, tip, w0, w1 in limbs:
        lc = bez((fx, fy), ctrl, tip, 7)
        lw = [w0 + (w1 - w0) * (i / 6) ** 0.8 for i in range(7)]
        lw = [w * (1 + 0.1 * math.sin(i * 2.3 + w0)) for i, w in enumerate(lw)]
        sides.append((offset_line(lc, lw, -1), offset_line(lc, lw, 1), lc))
    outline = list(tl[:-1])
    for i, (l, r, lc) in enumerate(sides):
        outline += l[1 if i == 0 else 2:]
        d = norm((lc[-1][0] - lc[-2][0], lc[-1][1] - lc[-2][1]))
        outline.append((lc[-1][0] + d[0] * 3, lc[-1][1] + d[1] * 3))
        if i < len(sides) - 1:
            outline += list(reversed(r[2:]))
            nl = sides[i + 1][0]
            outline.append(((r[1][0] + nl[1][0]) / 2, (r[1][1] + nl[1][1]) / 2 + 3))
        else:
            outline += list(reversed(r[1:]))
    outline += list(reversed(tr[:-1]))
    out = []
    for t in twigs:
        out.append(path(catmull(t), stroke_width='2.2'))
    out.append(path(catmull(jit(rng, outline, 0.5), True), fill=PAPER))
    # the twist: grooves winding up the trunk and out along the main limbs
    g = ''
    for k in (1, 3):
        a = tl[k]
        c = tr[k + 1]
        g += f'M{pt((a[0] + (c[0] - a[0]) * 0.15, a[1] + 2))}Q{pt(((a[0] + c[0]) / 2 + rng.uniform(-2, 2), (a[1] + c[1]) / 2 + 7))} {pt((a[0] + (c[0] - a[0]) * 0.82, c[1] - 1))}'
    g += catmull([(cl[1][0] + trunk_w * 0.25, cl[1][1]), (cl[2][0] + trunk_w * 0.15, cl[2][1]), (cl[4][0] - trunk_w * 0.1, cl[4][1]), (cl[6][0] - trunk_w * 0.2, cl[6][1] + 3)])
    for (l, r, lc) in sides:
        if limbs[sides.index((l, r, lc))][2] >= 18:
            g += f'M{pt((lc[1][0] + 2, lc[1][1] + 2))}Q{pt(((lc[1][0] + lc[3][0]) / 2 + 3, (lc[1][1] + lc[3][1]) / 2))} {pt(lc[4])}'
    out.append(path(g, stroke_width='2'))
    if hollow:
        hx, hy, hw, hh = hollow
        out.append(path(f'M{f(hx)} {f(hy - hh)}C{f(hx + hw)} {f(hy - hh * 0.4)} {f(hx + hw * 0.8)} {f(hy + hh * 0.6)} {f(hx)} {f(hy + hh)}C{f(hx - hw * 0.9)} {f(hy + hh * 0.5)} {f(hx - hw)} {f(hy - hh * 0.4)} {f(hx)} {f(hy - hh)}Z', fill='currentColor'))
    # roots into the ground
    out.append(path(f'M{pt((tl[0][0] + 4, by + 1))}q{f(-7)} {f(-3)} {f(-16)} {f(3)}M{pt((tr[0][0] - 4, by + 1))}q{f(7)} {f(-3)} {f(16)} {f(3)}'))
    for cx, cy, rx, ry in clumps:
        out.append(path(leafy_blob(rng, cx, cy, rx, ry), fill=PAPER))
        out.append(sprigs(rng, cx, cy, rx, ry, sprig_n if rx > 34 else sprig_n - 1))
    return ''.join(out)


def seated_profile(x, y, s, flip=1, kind='plain', drop=26):
    """A robed figure on the bench, seen from the side, turned towards the middle (right when flip=1).
    Origin: where they sit."""
    X = lambda px: x + px * s * flip
    Y = lambda py: y + py * s
    P = lambda px, py: (X(px), Y(py))
    D = drop / s
    body = [(-1, -34), (-5.5, -31.5), (-8.5, -25), (-9.5, -15), (-10, -6), (-9.5, 0.5), (-6, 3.5), (2, 4.5), (8, 5.5),
            (9.5, 10), (9, D - 6), (8.5, D - 1.5), (14, D - 1), (20, D + 0.2), (21, D - 1.2), (18, D - 3.5), (17.5, D - 10),
            (17.5, 4), (16.5, -1.5), (12, -3.5), (6.5, -7), (5.5, -15), (6, -23), (4.5, -30), (2, -33.5)]
    out = [path(catmull([P(*p) for p in body], True), fill=PAPER)]
    folds = f'M{pt(P(-7, -26))}Q{pt(P(-1, -14))} {pt(P(6, -8))}'
    folds += f'M{pt(P(-3, 0))}Q{pt(P(6, -2.5))} {pt(P(15, 0))}'
    folds += f'M{pt(P(12.5, 8))}Q{pt(P(14, D * 0.55))} {pt(P(13, D - 4))}'
    head = (3, -41)
    extra = []
    if kind == 'plain':  # forearm along the thigh
        folds += f'M{pt(P(0, -28))}Q{pt(P(-2, -18))} {pt(P(-0.5, -12))}Q{pt(P(6, -8))} {pt(P(12, -5))}'
    elif kind == 'chin':  # elbow on the knee, chin on the hand, leaning in
        head = (4.5, -40.5)
        extra.append(path(f'M{pt(P(1, -28))}Q{pt(P(8, -14))} {pt(P(14, -5))}Q{pt(P(11.5, -20))} {pt(P(7.5, -34))}', stroke_width='2.2'))
    elif kind == 'scroll':  # reading an open scroll held out in both hands
        extra.append(path(f'M{pt(P(1, -27))}Q{pt(P(2, -16))} {pt(P(11, -15))}', stroke_width='2'))
        extra.append(path(f'M{pt(P(9, -21))}L{pt(P(19, -24))}L{pt(P(20.5, -13))}L{pt(P(10.5, -10))}Z', fill=PAPER, stroke_width='1.8'))
        extra.append(path(f'M{pt(P(9, -21.5))}L{pt(P(10.5, -9.5))}M{pt(P(19, -24.5))}L{pt(P(20.5, -12.5))}', stroke_width='2.6'))
        head = (3.5, -41)
    elif kind == 'gesture':  # a hand held out, asking
        extra.append(path(f'M{pt(P(1, -28))}Q{pt(P(4, -18))} {pt(P(10, -17))}L{pt(P(18, -22))}', stroke_width='2.2'))
        extra.append(path(f'M{pt(P(18, -22))}l{f(2.5 * s * flip)} {f(-3 * s)}M{pt(P(18, -22))}l{f(3.4 * s * flip)} {f(-0.6 * s)}', stroke_width='1.8'))
    elif kind == 'bun':  # a woman of the Academy, her hair gathered up
        folds += f'M{pt(P(0, -28))}Q{pt(P(-2, -18))} {pt(P(-0.5, -12))}Q{pt(P(6, -8))} {pt(P(12, -5))}'
    out.append(path(folds, stroke_width='1.8'))
    out += extra
    out.append(f'<circle cx="{f(X(head[0]))}" cy="{f(Y(head[1]))}" r="{f(6.3 * s)}" fill="{PAPER}"/>')
    if kind == 'bun':
        out.append(f'<circle cx="{f(X(head[0] - 6))}" cy="{f(Y(head[1] - 3.5))}" r="{f(3.1 * s)}" fill="{PAPER}" stroke-width="2"/>')
    return ''.join(out)


def teacher(x, y, s=1.1):
    """Standing, one arm raised with a finger pointing up; a scroll at his side. Origin: between the feet."""
    P = lambda px, py: (x + px * s, y + py * s)
    body = [(-4, -82), (-10, -79), (-13, -72), (-13, -60), (-14, -45), (-15, -30), (-16, -15), (-17, -4), (-14, 0),
            (-6, -1), (0, 0), (6, -1), (14, 0), (17, -4), (15, -18), (14, -35), (13, -52), (13, -66), (12, -75), (9, -79), (4, -82)]
    out = [path(catmull([P(*p) for p in body], True), fill=PAPER)]
    # the raised arm: upper arm out to the elbow, forearm up, a hand with one finger pointing to the sky
    arm_cl = [P(9.5, -76), P(17, -83), P(22.5, -89), P(22, -97), P(21, -103)]
    arm_w = [6.5 * s, 6 * s, 5.4 * s, 4.6 * s, 4.2 * s]
    arm = offset_line(arm_cl, arm_w, -1) + list(reversed(offset_line(arm_cl, arm_w, 1)))
    out.append(path(catmull(arm, True), fill=PAPER, stroke_width='2.2'))
    hx, hy = P(21, -105.5)
    out.append(f'<ellipse cx="{f(hx)}" cy="{f(hy)}" rx="{f(2.6 * s)}" ry="{f(3.2 * s)}" fill="{PAPER}" stroke-width="2"/>')
    out.append(path(f'M{pt(P(21.3, -108.5))}L{pt(P(21.8, -114))}', stroke_width='2.2'))
    folds = ''.join([
        f'M{pt(P(-11, -75))}Q{pt(P(2, -58))} {pt(P(14, -42))}',
        f'M{pt(P(-14.5, -36))}Q{pt(P(0, -29))} {pt(P(14.5, -31))}',
        f'M{pt(P(-6, -29))}Q{pt(P(-8.5, -16))} {pt(P(-7.5, -2))}',
        f'M{pt(P(5, -28))}Q{pt(P(6.5, -15))} {pt(P(6, -2))}',
    ])
    out.append(path(folds, stroke_width='1.8'))
    # the scroll in his left hand
    out.append(path(f'M{pt(P(-19, -58))}L{pt(P(-11, -40))}M{pt(P(-14, -60))}L{pt(P(-6, -42))}', stroke_width='1.8'))
    out.append(path(f'M{pt(P(-19, -58))}Q{pt(P(-16.5, -61.5))} {pt(P(-14, -60))}', stroke_width='2.4'))
    hx, hy = P(0.5, -89.5)
    out.append(f'<circle cx="{f(hx)}" cy="{f(hy)}" r="{f(7 * s)}" fill="{PAPER}"/>')
    # a beard
    out.append(path(f'M{pt(P(-5, -86))}Q{pt(P(0.5, -76))} {pt(P(6, -86))}', fill=PAPER, stroke_width='2'))
    return ''.join(out)


def owl(x, y, s=1.15):
    """Athena's little owl, flat-headed and frowning, on a branch. Origin: its feet."""
    P = lambda px, py: (x + px * s, y + py * s)
    body = [(0, -29.5), (-7.5, -28.5), (-11, -23.5), (-11.5, -14), (-9.5, -5), (-5, -0.5), (0, 0.5), (5, -0.5), (9.5, -5),
            (11.5, -14), (11, -23.5), (7.5, -28.5)]
    out = [path(catmull([P(*p) for p in body], True), fill=PAPER, stroke_width='2.2')]
    for ex in (-4.4, 4.4):
        cx, cy = P(ex, -20.5)
        out.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(3.3 * s)}" fill="{PAPER}" stroke-width="1.8"/>')
        out.append(f'<circle class="owl-eye" cx="{f(cx + 0.4 * (1 if ex < 0 else -1))}" cy="{f(cy + 0.2)}" r="{f(1.35 * s)}" fill="currentColor" stroke="none"/>')
    d = f'M{pt(P(-8.6, -24))}Q{pt(P(-4.5, -27.5))} {pt(P(-0.6, -24.2))}Q{pt(P(4.5, -27.5))} {pt(P(8.6, -24))}'
    d += f'M{pt(P(-1.3, -18))}L{pt(P(0, -15))}L{pt(P(1.3, -18))}'
    d += f'M{pt(P(-10.2, -15))}Q{pt(P(-9, -8))} {pt(P(-4.5, -3))}M{pt(P(10.2, -15))}Q{pt(P(9, -8))} {pt(P(4.5, -3))}'
    d += f'M{pt(P(-3, 0.5))}l{f(-1.2)} {f(2.6)}M{pt(P(-1.5, 0.5))}l0 {f(2.8)}M{pt(P(3, 0.5))}l{f(1.2)} {f(2.6)}M{pt(P(1.5, 0.5))}l0 {f(2.8)}'
    for px, py in [(-3, -10), (2.5, -11.5), (-0.5, -6.5), (4, -6)]:
        d += f'M{pt(P(px, py))}q{f(1)} {f(1.2)} {f(2)} 0'
    out.append(path(d, stroke_width='1.6'))
    sparks = ''
    for i, (dx, dy, r) in enumerate([(-34, -46, 10), (32, -54, 12), (-48, -16, 8), (46, -22, 9), (0, -74, 11), (-24, -82, 7), (26, -88, 7), (-58, -50, 6), (58, -48, 6)]):
        cx, cy = P(dx, dy)
        sparks += (f'<path style="--d:{i * 0.07:.2f}s" fill="var(--gold, #cda04f)" stroke="none" d="M{f(cx)} {f(cy - r)}'
                   f'Q{f(cx)} {f(cy)} {f(cx + r)} {f(cy)}Q{f(cx)} {f(cy)} {f(cx)} {f(cy + r)}Q{f(cx)} {f(cy)} {f(cx - r)} {f(cy)}Q{f(cx)} {f(cy)} {f(cx)} {f(cy - r)}Z"/>')
    return '<g class="grove-owl">' + ''.join(out) + '</g><g class="grove-sparks">' + sparks + '</g>'


EX_C = (800, 268)
EX_RIN, EX_ROUT = (150, 34), (184, 45)
EX_SEAT, EX_BACK = 26, 36


def ell(r, lift, ang):
    t = math.radians(ang)
    return (EX_C[0] + r[0] * math.cos(t), EX_C[1] - lift + r[1] * math.sin(t))


def exedra(rng):
    """The curved stone bench, open towards us."""
    C, rin, rout = EX_C, EX_RIN, EX_ROUT

    def arc(r, lift, n=26, a=0.3):
        return jit(rng, [ell(r, lift, 180 + 180 * i / n) for i in range(n + 1)], a)

    top = EX_SEAT + EX_BACK
    back_top = arc((rout[0] + 2, rout[1] + 1), top)
    cap = arc((rout[0] - 4, rout[1] - 1), top - 5)
    seat_back = arc((rout[0] - 6, rout[1] - 1.5), EX_SEAT)
    seat_front = arc(rin, EX_SEAT)
    face_bottom = arc(rin, 0)
    L, R = C[0] - rout[0] - 2, C[0] + rout[0] + 2
    out = [path(catmull(back_top) + f'L{f(R)} 290L{f(L)} 290Z', fill=PAPER)]
    out.append(path(catmull(cap), stroke_width='2'))
    out.append(path(catmull(seat_back)))
    out.append(path(catmull(seat_front)))
    out.append(path(catmull(face_bottom)))
    out.append(path(catmull(arc((rin[0] - 34, rin[1] - 8), 0)), stroke_width='1.6'))
    d = ''
    for side in (-1, 1):
        xo = C[0] + side * (rout[0] + 2)
        xi = C[0] + side * rin[0]
        xb = C[0] + side * (rout[0] - 6)
        d += f'M{f(xo)} {f(C[1] - top)}V{f(C[1])}M{f(xi)} {f(C[1] - EX_SEAT)}V{f(C[1])}M{f(xb)} {f(C[1] - EX_SEAT)}H{f(xi)}'
    # joints between the blocks of the back and of the seat's face
    for ang in (207, 234, 261, 279, 306, 333):
        d += f'M{pt(ell((rout[0] - 4, rout[1] - 1), top - 5, ang))}L{pt(ell((rout[0] - 6, rout[1] - 1.5), EX_SEAT, ang))}'
    for ang in (221, 248, 292, 319):
        d += f'M{pt(ell(rin, EX_SEAT, ang))}L{pt(ell(rin, 0, ang))}'
    out.append(path(d, stroke_width='1.8'))
    # a carved scroll at each end of the back
    for side in (-1, 1):
        ex = C[0] + side * (rout[0] - 5)
        ey = C[1] - EX_SEAT - 12
        s = side
        d = (f'M{f(ex + s * 7)} {f(C[1] - top + 1)}C{f(ex + s * 7)} {f(ey + 3)} {f(ex - s * 7)} {f(ey + 4)} {f(ex - s * 7)} {f(ey - 3)}'
             f'C{f(ex - s * 7)} {f(ey - 9)} {f(ex + s * 2)} {f(ey - 9)} {f(ex + s * 2)} {f(ey - 3)}'
             f'C{f(ex + s * 2)} {f(ey)} {f(ex - s * 2.5)} {f(ey)} {f(ex - s * 2.5)} {f(ey - 3)}')
        out.append(path(d, stroke_width='2'))
    return ''.join(out)


def near():
    rng = random.Random(7)
    b = []
    ground = [(-40, 284), (120, 286), (260, 282), (420, 285), (560, 283), (700, 283), (800, 284), (920, 283), (1060, 285),
              (1200, 283), (1340, 286), (1480, 282), (1640, 284)]

    # at the edges, two middling old olives (seen on wide screens)
    b.append(olive_tree(rng, (150, 286), (158, 226), 21,
                        [((132, 206), (94, 182), 15, 7), ((172, 200), (192, 158), 15, 7)],
                        [(64, 178, 34, 21), (114, 152, 40, 26), (182, 144, 44, 27), (240, 170, 34, 21), (146, 182, 30, 15)],
                        hollow=(152, 258, 4, 8)))
    b.append(olive_tree(rng, (1466, 286), (1456, 226), 21,
                        [((1432, 200), (1412, 162), 15, 7), ((1474, 204), (1496, 154), 15, 7)],
                        [(1362, 176, 34, 21), (1420, 148, 42, 27), (1490, 140, 42, 27), (1548, 168, 36, 22), (1456, 182, 30, 15)],
                        hollow=(1462, 258, 4, 8)))

    # the exedra and the gathering on it, the farthest drawn first
    # no bench and no people, only the olives and the owl (Maria, 23 November 2026)

    # the two great olives framing it
    b.append(olive_tree(rng, (458, 287), (466, 226), 40,
                        [((428, 228), (386, 180), 30, 12), ((482, 196), (462, 138), 30, 12), ((506, 222), (580, 174), 24, 10)],
                        [(326, 170, 38, 22), (380, 142, 46, 28), (444, 118, 50, 30), (514, 114, 48, 30), (570, 140, 44, 26),
                         (594, 170, 26, 15), (412, 172, 36, 17), (506, 164, 34, 17)],
                        twigs=[[(396, 186), (360, 182), (330, 188)]],
                        hollow=(456, 258, 5.5, 12)))
    b.append(olive_tree(rng, (1146, 287), (1134, 226), 40,
                        [((1084, 222), (1030, 194), 20, 8), ((1126, 190), (1118, 134), 30, 12), ((1184, 206), (1234, 158), 28, 11)],
                        [(1024, 188, 24, 14), (1080, 130, 38, 22), (1124, 118, 50, 30), (1192, 122, 48, 30), (1246, 150, 40, 24),
                         (1286, 178, 28, 17), (1172, 166, 36, 17)],
                        hollow=(1144, 258, 5.5, 12)))
    b.append(owl(1074, 214, 1.5))

    # the ground
    gl = line_along(ground, -40, 1640, step=30, rng=rng, a=0.9)
    b.append(path(catmull(gl) + 'L1640 374L-40 374Z', fill='currentColor'))
    mounds = ''
    for x, w, h in [(40, 34, 9), (330, 40, 11), (1250, 38, 10), (1560, 34, 9), (980, 24, 7), (600, 22, 6)]:
        y = interp(ground, x) + 3
        mounds += f'M{f(x)} {f(y)}A{f(w * 0.3)} {f(h)} 0 0 1 {f(x + w * 0.45)} {f(y - h * 0.7)}A{f(w * 0.35)} {f(h)} 0 0 1 {f(x + w)} {f(y)}Z'
    b.append(path(mounds, fill='currentColor'))
    # stones half in the grass
    st = ''
    for x, w, h in [(250, 16, 8), (268, 9, 5), (618, 13, 6), (690, 10, 5), (1188, 18, 8), (1206, 10, 5), (1400, 14, 7), (88, 11, 6)]:
        y = interp(ground, x + w / 2) + 1
        st += f'M{f(x)} {f(y)}C{f(x)} {f(y - h)} {f(x + w * 0.3)} {f(y - h * 1.1)} {f(x + w * 0.55)} {f(y - h * 1.05)}C{f(x + w)} {f(y - h)} {f(x + w)} {f(y - h * 0.4)} {f(x + w)} {f(y)}Z'
    b.append(path(st, fill=PAPER))
    # grass tufts
    tufts = ''
    for x in range(-20, 1640, 38):
        xx = x + rng.uniform(-12, 12)
        yy = interp(ground, xx) + 0.5
        h = rng.uniform(7, 12)
        tufts += f'M{f(xx - 3)} {f(yy)}l{f(-3)} {f(-h * 0.7)}M{f(xx)} {f(yy)}l{f(0.5)} {f(-h)}M{f(xx + 3)} {f(yy)}l{f(3)} {f(-h * 0.75)}'
    b.append(path(tufts, stroke_width='2.2'))
    open(OUT + 'footer-grove-near.svg', 'w').write(svg(360, 2.6, b))


far()
mid()
near()
print('ok')
def preview():
    rd = lambda n: open(OUT + f'footer-grove-{n}.svg').read()
    html = '''<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#f2e9d3;--paper:#f2e9d3;--gold:#cda04f;color:#0b1c8c}
body.dark{background:#080d42;--paper:#080d42;--gold:#dcbb78;color:#b4c1f4}
.s{position:relative;width:max(100%,1024px);left:50%;translate:-50% 0;aspect-ratio:1600/525;margin-top:80px}
.l{position:absolute;left:0;width:100%;bottom:0}.l svg{display:block;width:100%}
.far{bottom:16%}.mid{bottom:2.7%}.near{bottom:-1px}
.sky-day path,.sky-moon path{fill:var(--gold)}
body.dark .sky-day{display:none} body.dark .sky-night{display:inline}
.band{height:16px;background:currentColor}
</style><div class="s"><div class="l far">FAR</div><div class="l mid">MID</div><div class="l near">NEAR</div></div><div class="band"></div>
<script>if(location.hash=='#dark')document.body.className='dark'</script>'''
    html = html.replace('FAR', rd('far')).replace('MID', rd('mid')).replace('NEAR', rd('near'))
    open('grove-preview.html', 'w').write(html)


preview()
