"""
Builds 100% original, copyright-clean web-optimized media for HYRULE — The Wild Awaits:
- Converts the original painterly illustrations into responsive WebP files
- Crops thin paper margin from story-calamity so every frame is full-bleed
- Splits hero-vista into sky + mountain-valley depth layers (hero-sky / hero-land)
- Renders an original 10-second 1280x720 30fps animated entrance video (hero.mp4)
  with subtle dual-layer parallax push-in, drifting mountain mist, sun rays & pollen!

Usage: python scripts/build-original-assets.py
"""
import math
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
ART = Path(r"C:\Users\willi\.gemini\antigravity\brain\76df1493-2534-4ce8-8e35-77c6abdd82bd")
OUT = ROOT / "src" / "assets" / "media"
OUT.mkdir(parents=True, exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()

SOURCES = {
    "hero-vista": ART / "hero_vista_v2_1795117059692.jpg",
    "ch-awakening": ART / "story_awakening_1795117024924.jpg",
    "ch-calamity": ART / "story_calamity_1795117034868.jpg",
    "ch-destiny": ART / "story_destiny_1795117044262.jpg",
    "beast-water": ART / "beast_water_1795117025107.jpg",
    "beast-fire": ART / "beast_fire_1795117034546.jpg",
    "beast-wind": ART / "beast_wind_1795117043783.jpg",
    "beast-lightning": ART / "beast_lightning_1795117053682.jpg",
    "vista-meadow": ART / "vista_meadow_1795117057441.jpg",
    "vista-ruins": ART / "vista_ruins_1795117068268.jpg",
    "portrait-hero": ART / "portrait_hero_1795117060217.jpg",
    "portrait-fire": ART / "portrait_fire_1795117059152.jpg",
}


def save_webp(im, name, widths, quality=82):
    for w in widths:
        r = im.copy()
        if r.width > w:
            r = r.resize((w, round(r.height * w / r.width)), Image.LANCZOS)
        p = OUT / f"{name}-{w}.webp"
        r.save(p, "WEBP", quality=quality, method=6)
        print(f"  {p.name}: {r.size} ({p.stat().st_size // 1024} KB)")


def crop_vertical_3x4(im, center_x=0.5):
    w, h = im.size
    target_w = round(h * 0.75)
    if target_w >= w:
        return im
    cx = round(w * center_x)
    x0 = max(0, min(w - target_w, cx - target_w // 2))
    return im.crop((x0, 0, x0 + target_w, h))


# 1. Remove ALL legacy third-party media in src/assets/media
for old in OUT.iterdir():
    if old.is_file():
        old.unlink()

# 2. Export responsive WebPs for Story, Vistas, Beasts & Character Cards
print("Exporting original illustrations...")
for key in ["ch-awakening", "ch-destiny", "vista-meadow", "vista-ruins"]:
    im = Image.open(SOURCES[key]).convert("RGB")
    save_webp(im, key, [800, 1600], quality=82)

# Crop the thin cream border off story-calamity (3% inset) so it is 100% full-bleed
cal = Image.open(SOURCES["ch-calamity"]).convert("RGB")
cw, ch = cal.size
cal = cal.crop((round(cw * 0.025), round(ch * 0.032), round(cw * 0.975), round(ch * 0.968)))
save_webp(cal, "ch-calamity", [800, 1600], quality=82)

# 4 Divine Colossi (vertical 3:4)
for key in ["beast-water", "beast-fire", "beast-wind", "beast-lightning"]:
    im = Image.open(SOURCES[key]).convert("RGB")
    save_webp(im, key, [640, 1080], quality=82)

# 7 Character Gallery vertical cards (unified 3:4 artbook ratio)
save_webp(Image.open(SOURCES["portrait-hero"]).convert("RGB"), "char-link", [640, 1080], quality=84)
save_webp(crop_vertical_3x4(Image.open(SOURCES["ch-destiny"]).convert("RGB"), 0.50), "char-zelda", [640, 1080], quality=84)
save_webp(Image.open(SOURCES["beast-water"]).convert("RGB"), "char-mipha", [640, 1080], quality=84)
save_webp(Image.open(SOURCES["beast-wind"]).convert("RGB"), "char-revali", [640, 1080], quality=84)
save_webp(Image.open(SOURCES["portrait-fire"]).convert("RGB"), "char-daruk", [640, 1080], quality=84)
save_webp(Image.open(SOURCES["beast-lightning"]).convert("RGB"), "char-urbosa", [640, 1080], quality=84)
save_webp(crop_vertical_3x4(cal, 0.67), "char-ganon", [640, 1080], quality=84)

# 3. Hero Parallax Depth Layers (sky vs mountain ridge & valley)
print("Building original Hero parallax layers...")
hero_full = Image.open(SOURCES["hero-vista"]).convert("RGB").resize((1280, 720), Image.LANCZOS)
hero_full.save(OUT / "hero-poster.jpg", "JPEG", quality=86)

a = np.asarray(hero_full, dtype=np.float32)
H, W, _ = a.shape
lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
# Dynamic-programming mountain ridge seam across y=198..305 (hugs painted horizon cleanly)
Y0, Y1 = 198, 305
blur = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32)
edge = np.zeros_like(blur)
edge[3:-3] = blur[:-6] - blur[6:]
# Blue-minus-red + darkness below favours mountain silhouettes over bright golden sunrise mist
b_over_r = (a[..., 2] - a[..., 0]) * 0.25
below_mtn = np.zeros_like(blur)
below_mtn[:-6] = (235 - blur[6:]) * 0.22 + np.maximum(0, b_over_r[6:])
score = edge * 1.4 + below_mtn
# keep seam cleanly below the soft volcanic smoke plume
score[:204, 1000:1280] -= 45
band = score[Y0:Y1]
bh = band.shape[0]
STEP = 3
acc = np.full((bh, W), -1e9, dtype=np.float32)
back = np.zeros((bh, W), dtype=np.int32)
acc[:, 0] = band[:, 0]
for x in range(1, W):
    prev = acc[:, x - 1]
    best = np.full(bh, -1e9, dtype=np.float32)
    arg = np.zeros(bh, dtype=np.int32)
    for d in range(-STEP, STEP + 1):
        shifted = np.full(bh, -1e9, dtype=np.float32)
        if d >= 0:
            shifted[d:] = prev[:bh - d] if d else prev
        else:
            shifted[:d] = prev[-d:]
        cand = shifted - abs(d) * 2.2
        upd = cand > best
        best[upd] = cand[upd]
        arg[upd] = (np.arange(bh) - d)[upd]
    acc[:, x] = best + band[:, x]
    back[:, x] = arg

ridge = np.zeros(W, dtype=np.int32)
y = int(np.argmax(acc[:, -1]))
for x in range(W - 1, -1, -1):
    ridge[x] = y + Y0
    y = back[y, x]

mask = np.zeros((H, W), dtype=np.uint8)
for x in range(W):
    mask[ridge[x]:, x] = 255
mask_img = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.4))

land = hero_full.convert("RGBA")
land.putalpha(mask_img)
land.save(OUT / "hero-land.webp", "WEBP", quality=84, method=6)
land.resize((640, 360), Image.LANCZOS).save(OUT / "hero-land-sm.webp", "WEBP", quality=80)

sky = a.copy()
for x in range(W):
    y0 = max(0, ridge[x] - 4)
    sky[y0:, x] = a[max(0, y0 - 2), x]
sky_img = Image.fromarray(sky.clip(0, 255).astype(np.uint8))
blurred_sky = sky_img.filter(ImageFilter.GaussianBlur(22))
sky_img = Image.composite(blurred_sky, sky_img, Image.fromarray(mask).filter(ImageFilter.GaussianBlur(12)))
sky_img.save(OUT / "hero-sky.webp", "WEBP", quality=82, method=6)
sky_img.resize((640, 360), Image.LANCZOS).save(OUT / "hero-sky-sm.webp", "WEBP", quality=80)
print(f"  hero ridge range: y={ridge.min()}..{ridge.max()}")

# 4. Render 100% Original Seamless Animated Entrance Video (hero.mp4, 10s @ 30fps)
print("Rendering original animated entrance video hero.mp4...")
FPS = 30
DUR = 10
FRAMES = FPS * DUR
VW, VH = 1280, 720

# Pre-create soft mist overlay ribbon (tileable horizontally)
mist = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
md = ImageDraw.Draw(mist)
for cx, cy, rx, ry, al in [
    (260, 395, 290, 42, 46),
    (740, 375, 340, 48, 52),
    (1120, 415, 280, 42, 44),
    (520, 445, 360, 38, 36),
    (960, 355, 240, 32, 34),
]:
    md.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(246, 244, 232, al))
mist = mist.filter(ImageFilter.GaussianBlur(34))

# Warm golden sun-ray bloom
sun_bloom = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
sd = ImageDraw.Draw(sun_bloom)
sd.ellipse((350, 30, 930, 470), fill=(255, 232, 168, 42))
sd.ellipse((490, 120, 790, 380), fill=(255, 246, 212, 54))
sun_bloom = sun_bloom.filter(ImageFilter.GaussianBlur(58))

# Deterministic floating golden pollen motes
rng = np.random.default_rng(42)
motes = [
    (rng.uniform(0, VW), rng.uniform(0, VH), rng.uniform(1.6, 3.6), rng.uniform(0.3, 1.0), rng.uniform(0, 6.28))
    for _ in range(36)
]

proc = subprocess.Popen(
    [
        FF, "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{VW}x{VH}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUT / "hero.mp4"),
    ],
    stdin=subprocess.PIPE,
)

for i in range(FRAMES):
    t = i / FRAMES  # 0..1 seamless loop phase!
    ang = t * 2 * math.pi
    # Seamless breathing camera push-in & gentle horizon pan (loops smoothly at t=0 and t=1)
    sky_scale = 1.03 + 0.018 * (0.5 - 0.5 * math.cos(ang))
    land_scale = 1.03 + 0.042 * (0.5 - 0.5 * math.cos(ang))
    pan_x = math.sin(ang) * 14.0

    # Composite sky layer
    sw, sh = round(VW * sky_scale), round(VH * sky_scale)
    s_crop_x = round((sw - VW) / 2 + pan_x * 0.4)
    s_crop_y = round((sh - VH) / 2)
    sky_frame = sky_img.resize((sw, sh), Image.BILINEAR).crop((s_crop_x, s_crop_y, s_crop_x + VW, s_crop_y + VH)).convert("RGBA")

    # Pulse sunlight glow softly
    sun_alpha = 0.65 + 0.35 * math.sin(ang)
    sun_layer = sun_bloom.copy()
    sun_layer.putalpha(sun_layer.getchannel("A").point(lambda v: int(v * sun_alpha)))
    sky_frame.alpha_composite(sun_layer)

    # Composite terrain/valley/adventurer layer with stronger depth scale
    lw, lh = round(VW * land_scale), round(VH * land_scale)
    l_crop_x = round((lw - VW) / 2 + pan_x)
    l_crop_y = round((lh - VH) * 0.62)
    land_frame = land.resize((lw, lh), Image.BILINEAR).crop((l_crop_x, l_crop_y, l_crop_x + VW, l_crop_y + VH))
    sky_frame.alpha_composite(land_frame)

    # Scroll mist horizontally seamlessly across the valley
    mx = int((t * VW) % VW)
    mist_shift = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    mist_shift.paste(mist, (mx, 0))
    mist_shift.paste(mist, (mx - VW, 0))
    sky_frame.alpha_composite(mist_shift)

    # Floating golden pollen motes (loop seamlessly via modulo)
    mote_layer = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(mote_layer)
    for x0, y0, r, spd, ph in motes:
        px = (x0 + t * VW * 0.14 * spd) % VW
        py = (y0 - t * VH * 0.18 * spd + math.sin(ang * 2 + ph) * 12) % VH
        al = int((110 + 95 * math.sin(ang + ph)) * 0.85)
        mdraw.ellipse((px - r, py - r, px + r, py + r), fill=(255, 244, 198, max(0, min(255, al))))
    sky_frame.alpha_composite(mote_layer)

    proc.stdin.write(sky_frame.convert("RGB").tobytes())

proc.stdin.close()
proc.wait()
print(f"  hero.mp4: {(OUT / 'hero.mp4').stat().st_size // 1024} KB")
print("Done! All assets in src/assets/media are 100% original.")
