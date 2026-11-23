# Generates footer-delphi-far/mid/near.svg ("The path up to Delphi").
# scene_y = far_y + 21 = mid_y + 211 = near_y + 165
import math, random

OUT = '/Users/mariap/projects/athenoa/src/assets/illustrations/'
PAPER = 'var(--paper, #f2e9d3)'
LIGHT = 'var(--blue-light, #b3c0f3)'
R = random.Random(11)


def f(v):
    s = f"{v:.1f}"
    if s.endswith('.0'):
        s = s[:-2]
    if s == '-0':
        s = '0'
    return s


def P(x, y):
    return f"{f(x)} {f(y)}"


def resample(pts, step):
    out = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(1, round(L / step))
        for i in range(1, n + 1):
            t = i / n
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    return out


def jitter(pts, amp, keep_ends=True):
    out = []
    for i, (x, y) in enumerate(pts):
        if keep_ends and (i == 0 or i == len(pts) - 1):
            out.append((x, y))
        else:
            out.append((x + R.gauss(0, amp), y + R.gauss(0, amp)))
    return out


def smooth(pts, closed=False, t=1 / 6):
    n = len(pts)
    d = 'M' + P(*pts[0])
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[i - 1] if (i > 0 or closed) else pts[i]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (i + 2 < n or closed) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t)
        c2 = (p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t)
        d += 'C' + P(*c1) + ' ' + P(*c2) + ' ' + P(*p2)
    if closed:
        d += 'Z'
    return d


def curve(pts, amp=0.6, step=16, closed=False):
    if closed:
        pts = list(pts) + [pts[0]]
        r = resample(pts, step)[:-1]
        return smooth(jitter(r, amp, keep_ends=False), closed=True)
    return smooth(jitter(resample(pts, step), amp))


def poly(pts, amp=0.25, closed=False):
    pts = jitter(pts, amp, keep_ends=False)
    d = 'M' + P(*pts[0]) + ''.join('L' + P(*p) for p in pts[1:])
    return d + ('Z' if closed else '')


def path(d, **attrs):
    a = ''.join(f' {k.rstrip("_").replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<path{a} d="{d}"/>'


def g(children, **attrs):
    a = ''.join(f' {k.rstrip("_").replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<g{a}>' + ''.join(children) + '</g>'


def svg(h, sw, children):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 {h}" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">' + ''.join(children) + '</svg>\n')


def interp(pts, x):
    """y on a polyline (sorted by x) at x"""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return pts[0][1] if x < pts[0][0] else pts[-1][1]


def circle_pts(cx, cy, r, n=24, a0=0, a1=2 * math.pi, ry=None):
    ry = r if ry is None else ry
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


# ---------------------------------------------------------------- FAR
def far():
    out = []
    # sun, setting into the saddle right of the cliffs
    sx, sy, sr = 562, 190, 27
    sun = [path(curve(circle_pts(sx, sy, sr, 28)[:-1], amp=0.35, step=8, closed=True), data_gold='')]
    rays = ''
    for k in range(11):
        a = math.pi + math.pi * (k + 0.5) / 11
        r0 = sr + 9
        r1 = sr + (21 if k % 2 == 0 else 15)
        rays += 'M' + P(sx + r0 * math.cos(a), sy + r0 * math.sin(a)) + 'L' + P(sx + r1 * math.cos(a), sy + r1 * math.sin(a))
    sun.append(path(rays, data_gold=''))
    out.append(g(sun, class_='sky-day', style='--set:76px'))

    # night: crescent moon and stars
    mx, my, mr = 1046, 40, 18
    dx, dy, r2 = 7.5, -5, 15.5
    d = math.hypot(dx, dy)
    a = (mr * mr - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(mr * mr - a * a)
    ux, uy = dx / d, dy / d
    vx, vy = -uy, ux
    p1 = (a * ux + h * vx, a * uy + h * vy)
    p2 = (a * ux - h * vx, a * uy - h * vy)

    def arc(c, rad, A, B, via):
        a0 = math.atan2(A[1] - c[1], A[0] - c[0])
        a1 = math.atan2(B[1] - c[1], B[0] - c[0])
        am = math.atan2(via[1], via[0])

        def inside(s, e, m):  # ccw sweep from s to e contains m
            span = (e - s) % (2 * math.pi)
            return (m - s) % (2 * math.pi) <= span

        if inside(a0, a1, am):
            span = (a1 - a0) % (2 * math.pi)
        else:
            span = -((a0 - a1) % (2 * math.pi))
        n = 14
        return [(c[0] + rad * math.cos(a0 + span * i / n), c[1] + rad * math.sin(a0 + span * i / n)) for i in range(n + 1)]

    outer = arc((0, 0), mr, p1, p2, (-ux, -uy))
    inner = arc((dx, dy), r2, p2, p1, (-ux, -uy))
    pts = [(mx + x, my + y) for x, y in outer + inner[1:-1]]
    moon = g([path(smooth(pts, closed=True), data_gold='', data_nodraw='')], class_='sky-moon', style='--rise:30px')

    def sparkle(x, y, s):
        return path(f"M{P(x, y - s)}Q{P(x + s * .2, y - s * .2)} {P(x + s * .75, y)}Q{P(x + s * .2, y + s * .2)} {P(x, y + s)}"
                    f"Q{P(x - s * .2, y + s * .2)} {P(x - s * .75, y)}Q{P(x - s * .2, y - s * .2)} {P(x, y - s)}Z", data_nodraw='')

    def dot(x, y, r):
        return f'<circle data-nodraw="" cx="{f(x)}" cy="{f(y)}" r="{r}" fill="currentColor" stroke="none"/>'

    stars = [sparkle(150, 36, 9), dot(286, 76, 2), dot(408, 28, 2.1), sparkle(560, 52, 8.5), dot(688, 22, 2),
             sparkle(860, 32, 8), dot(960, 54, 2), sparkle(1180, 30, 9.5), dot(1290, 80, 2.2), sparkle(1408, 34, 8), dot(1528, 66, 2)]
    night = [moon] + [g([s], class_='sky-star', style=f'--n:{i}') for i, s in enumerate(stars)]
    out.append(g(night, class_='sky-night', display='none'))

    # thin cloud wisps (drawn behind the mountains)
    def wisp(x0, x1, y, th):
        top = [(x0, y)] + [(x0 + (x1 - x0) * t, y - th * math.sin(math.pi * t) * (1 - 0.3 * t)) for t in (0.2, 0.45, 0.7, 0.9)] + [(x1, y)]
        bot = [(x1, y)] + [(x0 + (x1 - x0) * t, y + th * 0.25 * math.sin(math.pi * t)) for t in (0.75, 0.45, 0.15)] + [(x0, y)]
        return path(curve(top + bot[1:-1], amp=0.3, step=20, closed=True), fill=PAPER)

    out.append(g([wisp(118, 330, 74, 9), path(curve([(70, 85), (160, 85), (262, 84)], amp=0.3)),
                  path(curve([(300, 86), (352, 86)], amp=0.2)),
                  wisp(1190, 1430, 64, 10), path(curve([(1290, 75), (1400, 75), (1488, 76)], amp=0.3)),
                  path(curve([(1150, 77), (1250, 76)], amp=0.2))]))

    # back ranges, low at the sun's saddle on the left
    back_l = [(-40, 150), (80, 138), (180, 120), (280, 130), (380, 112), (452, 126), (516, 166), (562, 192), (600, 214), (640, 262)]
    back_r = [(1180, 262), (1210, 200), (1260, 150), (1350, 130), (1460, 140), (1560, 122), (1640, 128)]
    for pts in (back_l, back_r):
        d = curve(pts, amp=0.5, step=18)
        out.append(path(d + f'L{P(pts[-1][0], 420)}L{P(pts[0][0], 420)}Z', fill=PAPER, stroke='none'))
        out.append(path(d))
    hatch = ''
    for (x0, x1, yy) in [(40, 150, 160), (190, 300, 146), (330, 430, 134), (90, 200, 178), (1280, 1390, 150), (1420, 1540, 142),
                         (1330, 1450, 168), (1520, 1620, 150)]:
        hatch += curve([(x0, yy + 3), ((x0 + x1) / 2, yy - 2), (x1, yy + 2)], amp=0.4, step=30)
    out.append(path(hatch))

    # the Phaedriades: two great walls of rock, the Castalian gorge between them
    left = [(600, 262), (604, 236), (596, 222), (606, 200), (614, 182), (612, 160), (622, 142), (626, 122), (640, 110), (664, 105),
            (690, 102), (716, 99), (738, 95), (764, 92), (792, 88), (818, 86), (842, 81), (864, 79), (880, 84),
            (890, 120), (894, 180), (896, 262)]
    right = [(910, 262), (911, 180), (913, 120), (920, 84), (936, 77), (962, 80), (990, 85), (1016, 88), (1042, 94), (1066, 99),
             (1090, 108), (1104, 122), (1112, 142), (1128, 156), (1138, 176), (1158, 190), (1176, 212), (1200, 236), (1222, 262)]
    for cliff in (left, right):
        out.append(path(curve(cliff, amp=0.5, step=10) + 'Z', fill=PAPER))

    def jag(pts, amp=5):
        out_ = []
        for i, (x, y) in enumerate(pts):
            out_.append((x + (amp if i % 2 else -amp * 0.4) * R.uniform(0.5, 1), y))
        return out_

    shade = [
        # deep in the gorge
        [(880, 84), (890, 120), (900, 150), (913, 120), (920, 84), (916, 130), (911, 180), (910, 262), (896, 262), (894, 180), (890, 120)],
        # the left wall's face turned to the gorge
        [(846, 81), (864, 79), (880, 84), (890, 120), (894, 180), (896, 262)] + jag([(866, 262), (870, 230), (860, 204), (866, 176), (856, 150), (862, 120), (852, 96)]),
        # the right wall's face turned to the gorge
        [(913, 120), (920, 84), (934, 78)] + jag([(930, 100), (938, 126), (930, 156), (940, 186), (932, 220), (938, 262)], 4) + [(910, 262), (911, 180)],
        # the right wall's flank, away from the evening sun
        [(1090, 108), (1104, 122), (1112, 142), (1128, 156), (1138, 176), (1158, 190), (1176, 212), (1200, 236), (1218, 262), (1170, 262)]
        + jag([(1152, 236), (1130, 210), (1120, 184), (1104, 160), (1092, 132)], 4),
    ]
    out.append(g([path(curve(s_, amp=0.4, step=9, closed=True)) for s_ in shade], fill=LIGHT, stroke='none', data_nodraw=''))
    stri = ''
    for cliff, x0, x1 in ((left, 632, 878), (right, 926, 1100)):
        tops = sorted([(x, y) for x, y in cliff if y < 125], key=lambda p: p[0])
        x = x0
        while x < x1:
            top = interp(tops, x) + R.uniform(4, 10)
            L = R.choice([40, 70, 100, 130, 150, 160])
            pts = [(x, top)]
            yy = top
            while yy < min(top + L, 250):
                yy += 20
                pts.append((x + R.uniform(-1.8, 1.8), yy))
            if len(pts) >= 2:
                if len(pts) > 4 and R.random() < 0.4:
                    cut = R.randint(2, len(pts) - 2)
                    stri += curve(pts[:cut], amp=0.3, step=10)
                    if len(pts[cut:]) >= 2:
                        stri += curve([(p[0], p[1] + 6) for p in pts[cut:]], amp=0.3, step=10)
                else:
                    stri += curve(pts, amp=0.3, step=10)
            x += R.choice([7, 9, 11, 14, 18, 24])
    for (x0, x1, yy) in [(640, 690, 150), (700, 750, 188), (956, 1000, 146), (1040, 1080, 178), (790, 830, 128), (980, 1030, 212),
                         (650, 690, 222), (1112, 1140, 196)]:
        stri += curve([(x0, yy), ((x0 + x1) / 2, yy + 2.5), (x1, yy - 1)], amp=0.3, step=12)
    out.append(path(stri, stroke_width='1.5'))

    # front soft ranges
    front_l = [(-40, 212), (90, 198), (210, 208), (330, 191), (440, 206), (520, 222), (610, 236), (660, 262)]
    front_r = [(1160, 262), (1200, 236), (1260, 220), (1330, 217), (1440, 203), (1540, 212), (1640, 206)]
    for pts in (front_l, front_r):
        d = curve(pts, amp=0.5, step=18)
        fill_d = d + f'L{P(pts[-1][0], 420)}L{P(pts[0][0], 420)}Z'
        out.append(path(fill_d, fill=PAPER, stroke='none'))
        out.append(path(d))
    hatch = ''
    for (x0, x1, yy) in [(20, 140, 216), (160, 280, 222), (300, 420, 210), (380, 500, 226), (1250, 1330, 232),
                         (1400, 1520, 218), (1530, 1620, 226)]:
        hatch += curve([(x0, yy + 2), ((x0 + x1) / 2, yy - 2), (x1, yy + 1)], amp=0.4, step=30)
    out.append(path(hatch))

    # the two eagles of Zeus, meeting over Delphi
    def bird(x, y, s):
        return f"M{P(x - 9 * s, y + 1 * s)}Q{P(x - 5 * s, y - 5 * s)} {P(x, y + 1 * s)}Q{P(x + 5 * s, y - 5 * s)} {P(x + 9 * s, y + 1 * s)}"
    out.append(path(bird(700, 48, 1) + bird(742, 62, 0.85), stroke_width='1.8'))
    return svg(420, 2, out)


if __name__ == '__main__':
    open(OUT + 'footer-delphi-far.svg', 'w').write(far())
    import mid_near
    open(OUT + 'footer-delphi-mid.svg', 'w').write(mid_near.mid())
    open(OUT + 'footer-delphi-near.svg', 'w').write(mid_near.near())
