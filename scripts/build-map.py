"""
Generates the stylised Hyrule map geometry (src/data/mapGeometry.js).

This is an ARTISTIC representation: region shapes are a weighted Voronoi
diagram built from hand-placed seeds that respect the relative layout of
Breath of the Wild's tower regions (north = top). Positions are approximate
and are not presented as official data.

  python scripts/build-map.py
"""
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "mapGeometry.js"
W, H = 1000, 720

# id: (x, y, weight)
SEEDS = {
    "hebra": (190, 105, 1800),
    "tabantha": (300, 225, 0),
    "ridge": (345, 360, -400),
    "gerudo-highlands": (120, 400, 600),
    "wasteland": (175, 605, 2600),
    "woodland": (545, 185, 0),
    "central": (540, 360, 1200),
    "plateau": (420, 515, -600),
    "eldin": (735, 150, 600),
    "akkala": (895, 130, 0),
    "lanayru": (830, 320, 600),
    "dueling-peaks": (690, 470, -200),
    "hateno": (890, 480, 0),
    "lake": (535, 625, 200),
    "faron": (735, 625, 0),
}

CONTINENT = [
    (40, 70), (130, 40), (260, 36), (400, 50), (520, 30), (640, 42), (760, 30),
    (870, 40), (955, 78), (978, 170), (948, 248), (968, 320), (990, 410),
    (972, 505), (940, 590), (880, 650), (790, 688), (660, 700), (520, 694),
    (390, 702), (250, 698), (120, 684), (48, 640), (22, 530), (34, 410),
    (18, 290), (30, 170),
]

LAKE = [(480, 590), (520, 572), (570, 578), (612, 600), (604, 636), (560, 652), (510, 648), (474, 624)]

RIVERS = [
    [(548, 300), (560, 360), (530, 420), (556, 480), (540, 530), (548, 576)],
    [(812, 300), (850, 330), (900, 350), (956, 352)],
    [(700, 470), (760, 520), (800, 600), (850, 660)],
]


def clip(poly, a, b, c):
    """Keep points with a*x + b*y <= c (Sutherlandâ€“Hodgman on one half-plane)."""
    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        pin = a * p[0] + b * p[1] <= c
        qin = a * q[0] + b * q[1] <= c
        if pin:
            out.append(p)
        if pin != qin:
            dp = a * p[0] + b * p[1] - c
            dq = a * q[0] + b * q[1] - c
            t = dp / (dp - dq)
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def key(p):
    return (round(p[0], 1), round(p[1], 1))


def smooth_closed(points, samples=6, noise=0.0, seed=1):
    """Catmull-Rom through points, with optional radial noise."""
    r = random.Random(seed)
    n = len(points)
    out = []
    for i in range(n):
        p0, p1, p2, p3 = points[i - 1], points[i], points[(i + 1) % n], points[(i + 2) % n]
        for s in range(samples):
            t = s / samples
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            if noise:
                x += (r.random() - 0.5) * noise
                y += (r.random() - 0.5) * noise
            out.append((x, y))
    return out


def smooth_open(points, samples=8):
    pts = [points[0]] + points + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for s in range(samples):
            t = s / samples
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(points[-1])
    return out


def path(points, closed=True):
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in points)
    return d + (" Z" if closed else "")


def bbox(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return [round(min(xs), 1), round(min(ys), 1), round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)]


regions = {}
ids = list(SEEDS)
for i in ids:
    sx, sy, wi = SEEDS[i]
    poly = [(0, 0), (W, 0), (W, H), (0, H)]
    for j in ids:
        if i == j:
            continue
        tx, ty, wj = SEEDS[j]
        a, b = tx - sx, ty - sy
        c = (tx * tx + ty * ty - sx * sx - sy * sy + wi - wj) / 2
        poly = clip(poly, a, b, c)
    # organic borders
    org = []
    n = len(poly)
    for k in range(n):
        p, q = poly[k], poly[(k + 1) % n]
        kp, kq = key(p), key(q)
        if kp == kq:
            continue
        # canonical direction so neighbouring cells share the exact same border
        a_, b_ = (p, q) if kp < kq else (q, p)
        on_border = (
            (abs(p[0]) < 0.5 and abs(q[0]) < 0.5) or (abs(p[0] - W) < 0.5 and abs(q[0] - W) < 0.5) or
            (abs(p[1]) < 0.5 and abs(q[1]) < 0.5) or (abs(p[1] - H) < 0.5 and abs(q[1] - H) < 0.5)
        )
        if on_border:
            org.append(p)
            continue
        r = random.Random(f"{key(a_)}{key(b_)}")
        dx, dy = b_[0] - a_[0], b_[1] - a_[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        count = max(2, int(L / 22))
        phase = r.random() * 6.28
        pts = [a_]
        for s in range(1, count):
            t = s / count
            env = math.sin(math.pi * t)
            off = (math.sin(t * 8 + phase) * 0.55 + (r.random() - 0.5) * 0.9) * 10 * env
            pts.append((a_[0] + dx * t + nx * off, a_[1] + dy * t + ny * off))
        if kp > kq:
            pts = [b_] + list(reversed(pts[1:]))  # starts at p (== b_)
        org.extend(pts)
    regions[i] = {"d": path(org), "box": bbox(poly), "seed": [sx, sy]}

continent = smooth_closed(CONTINENT, samples=7, noise=5, seed=7)
lake = smooth_closed(LAKE, samples=6, noise=2, seed=3)
rivers = [path(smooth_open(r), closed=False) for r in RIVERS]

# decorative contour rings around the coast (ocean "wave" lines)
data = {
    "viewBox": [0, 0, W, H],
    "continent": path(continent),
    "lake": path(lake),
    "rivers": rivers,
    "regions": regions,
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    "// AUTO-GENERATED by scripts/build-map.py â€” artistic, approximate geometry.\n"
    "export default " + json.dumps(data, ensure_ascii=False, indent=1) + "\n",
    encoding="utf-8",
)
print("wrote", OUT, len(OUT.read_text()) // 1024, "KB")
