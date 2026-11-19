"""
Splits the hero frame into depth layers for the parallax opening:
  hero-sky.webp   -> sky only, extended below the ridge (so parallax never reveals holes)
  hero-land.webp  -> mountains + valley + Link with transparent sky
Also extracts the 'awakening run' clip used in Chapter I.

  python scripts/build-hero.py
"""
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "src" / "assets" / "media"
RAW = ROOT / "raw-assets"
FF = imageio_ffmpeg.get_ffmpeg_exe()

src = Image.open(MEDIA / "hero-poster.jpg").convert("RGB")
a = np.asarray(src).astype(np.float32)
H, W, _ = a.shape
lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

# The ridge is found as the optimal left->right seam (dynamic programming)
# that maximises the "bright above / dark below" edge between y=Y0..Y1.
Y0, Y1 = 85, 330
blur = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
edge = np.zeros_like(blur)
edge[3:-3] = blur[:-6] - blur[6:]          # positive where it gets darker going down
# also favour transitions into bluish/dark terrain: penalise bright pixels below
below_dark = np.zeros_like(blur)
below_dark[:-8] = (200 - blur[8:]) * 0.15
score = edge + below_dark
# the volcano's smoke plume is a cloud, not terrain: keep the seam below it
score[:128, 925:1095] -= 60
# the pale far-left peak has a weak edge: discourage cutting underneath it
score[168:, 60:170] -= 40
band = score[Y0:Y1]                          # (h, W)
h = band.shape[0]
STEP = 14                                    # max vertical jump between columns
acc = np.full((h, W), -1e9, dtype=np.float32)
back = np.zeros((h, W), dtype=np.int32)
acc[:, 0] = band[:, 0]
for x in range(1, W):
    prev = acc[:, x - 1]
    best = np.full(h, -1e9, dtype=np.float32)
    arg = np.zeros(h, dtype=np.int32)
    for d in range(-STEP, STEP + 1):
        shifted = np.full(h, -1e9, dtype=np.float32)
        if d >= 0:
            shifted[d:] = prev[:h - d] if d else prev
        else:
            shifted[:d] = prev[-d:]
        cand = shifted - abs(d) * 0.25
        upd = cand > best
        best[upd] = cand[upd]
        arg[upd] = (np.arange(h) - d)[upd]
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
mask_img = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.6))

land = src.copy().convert("RGBA")
land.putalpha(mask_img)
land.save(MEDIA / "hero-land.webp", "WEBP", quality=82, method=6)

# sky: extend the colour right above the ridge downwards, then blur the filled area
sky = a.copy()
for x in range(W):
    y0 = max(0, ridge[x] - 3)
    sky[y0:, x] = a[max(0, y0 - 2), x]
sky_img = Image.fromarray(sky.clip(0, 255).astype(np.uint8))
blurred = sky_img.filter(ImageFilter.GaussianBlur(18))
fill_mask = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(10))
sky_img = Image.composite(blurred, sky_img, fill_mask)
sky_img.save(MEDIA / "hero-sky.webp", "WEBP", quality=80, method=6)
sky_img.resize((640, 360), Image.LANCZOS).save(MEDIA / "hero-sky-sm.webp", "WEBP", quality=78)
land.resize((640, 360), Image.LANCZOS).save(MEDIA / "hero-land-sm.webp", "WEBP", quality=78)
print("ridge range", ridge.min(), ridge.max())

# Chapter I clip: Link running through the meadow toward the light
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", "0.4", "-to", "6.4",
                "-i", str(RAW / "zeldaVideo.mp4"), "-an", "-vf", "scale=1280:-2,fps=30",
                "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", str(MEDIA / "awakening-run.mp4")], check=True)
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", "3.2",
                "-i", str(RAW / "zeldaVideo.mp4"), "-frames:v", "1", "-vf", "scale=1280:-2",
                "-q:v", "4", str(MEDIA / "awakening-run.jpg")], check=True)
print("ok")
