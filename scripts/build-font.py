"""
Builds a Portuguese-ready version of Hylia Serif.

The original Hylia Serif Beta ships combining marks (U+0300, U+0301, ...) but
no precomposed letters (á, ã, ç, ...). This script composes them by drawing the
base glyph + the mark into a new CFF charstring, adds en/em dashes and writes
WOFF2 + OTF to src/assets/fonts.

Usage:  python scripts/build-font.py
Requires: pip install fonttools brotli
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "raw-assets" / "hyliaSerif.otf"
OUT = ROOT / "src" / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

font = TTFont(SRC)
cff = font["CFF "].cff
top = cff.topDictIndex[0]
charstrings = top.CharStrings
gs = font.getGlyphSet()
hmtx = font["hmtx"]
cmap_tables = [t for t in font["cmap"].tables if t.isUnicode()]

MARKS = {
    "grave": "gravecomb",
    "acute": "acutecomb",
    "circ": "uni0302",
    "tilde": "tildecomb",
    "ced": "uni0327",
    "diaer": "uni0308",
}

COMPOSE = {
    "á": ("a", "acute"), "à": ("a", "grave"), "â": ("a", "circ"), "ã": ("a", "tilde"),
    "é": ("e", "acute"), "ê": ("e", "circ"), "í": ("i", "acute"), "ó": ("o", "acute"),
    "ô": ("o", "circ"), "õ": ("o", "tilde"), "ú": ("u", "acute"), "ü": ("u", "diaer"),
    "ç": ("c", "ced"), "ñ": ("n", "tilde"),
    "Á": ("A", "acute"), "À": ("A", "grave"), "Â": ("A", "circ"), "Ã": ("A", "tilde"),
    "É": ("E", "acute"), "Ê": ("E", "circ"), "Í": ("I", "acute"), "Ó": ("O", "acute"),
    "Ô": ("O", "circ"), "Õ": ("O", "tilde"), "Ú": ("U", "acute"), "Ü": ("U", "diaer"),
    "Ç": ("C", "ced"), "Ñ": ("N", "tilde"),
}


def bounds(name):
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    return bp.bounds


def add_glyph(name, width, draw, lsb=0):
    # CFF charstring width is stored as delta from Private.nominalWidthX
    nominal = getattr(top.Private, "nominalWidthX", 0) or 0
    default_w = getattr(top.Private, "defaultWidthX", 0) or 0
    cff_width = None if width == default_w else width - nominal
    pen = T2CharStringPen(cff_width, gs)
    draw(pen)
    cs = pen.getCharString(private=top.Private, globalSubrs=top.GlobalSubrs)
    # register glyph
    if name not in charstrings.charStrings:
        idx = len(charstrings.charStringsIndex)
        charstrings.charStringsIndex.append(cs)
        charstrings.charStrings[name] = idx
        top.charset.append(name)
    hmtx.metrics[name] = (width, lsb)
    order = font.getGlyphOrder()
    if name not in order:
        order.append(name)
        font.setGlyphOrder(order)


def map_cp(cp, name):
    for t in cmap_tables:
        t.cmap[cp] = name


for ch, (base, mark_key) in COMPOSE.items():
    mark = MARKS[mark_key]
    bb = bounds(base)
    mb = bounds(mark)
    if not bb or not mb:
        continue
    bw, blsb = hmtx[base]
    base_cx = (bb[0] + bb[2]) / 2
    mark_cx = (mb[0] + mb[2]) / 2
    dx = base_cx - mark_cx
    if mark_key == "ced":
        dy = 0  # cedilla hangs below the baseline as designed
    else:
        gap = 50
        dy = (bb[3] + gap) - mb[1]
    name = f"uni{ord(ch):04X}"

    def draw(pen, base=base, mark=mark, dx=dx, dy=dy):
        gs[base].draw(pen)
        gs[mark].draw(TransformPen(pen, (1, 0, 0, 1, dx, dy)))

    add_glyph(name, bw, draw, lsb=blsb)
    map_cp(ord(ch), name)

# dashes from the hyphen
hb = bounds("hyphen")
for cp, width in ((0x2013, 560), (0x2014, 900)):
    name = f"uni{cp:04X}"
    h_w = hb[2] - hb[0]
    sx = (width - 80) / h_w

    def draw(pen, sx=sx):
        gs["hyphen"].draw(TransformPen(pen, (sx, 0, 0, 1, 40 - hb[0] * sx, 0)))

    add_glyph(name, width, draw)
    map_cp(cp, name)

font["maxp"].numGlyphs = len(font.getGlyphOrder())
font["hhea"].numberOfHMetrics = len(font.getGlyphOrder())

font.save(OUT / "hylia-serif.otf")
font.flavor = "woff2"
font.save(OUT / "hylia-serif.woff2")
print("ok", len(font.getGlyphOrder()), "glyphs")
