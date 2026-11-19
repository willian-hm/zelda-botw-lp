"""
Asset pipeline: converts the original (heavy) media in raw-assets/ into
web-optimized files inside src/assets/media.

  python scripts/optimize-assets.py

Requires: pip install pillow imageio-ffmpeg
- PNG/AVIF/JPG  -> WebP in responsive sizes
- GIF runes     -> H.264 MP4 loops (10-20x smaller) + poster
- Trailer       -> short hero clip + poster frame
- MP3           -> 128 kbps
"""
import subprocess
from pathlib import Path
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-assets"
OUT = ROOT / "src" / "assets" / "media"
OUT.mkdir(parents=True, exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()


def ff(*args):
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def webp(src, name, widths=None, height=None, quality=78):
    im = Image.open(RAW / src)
    im.seek(0)
    im = im.convert("RGBA" if im.mode in ("RGBA", "P", "LA") else "RGB")
    if im.mode == "RGBA":
        # crop transparent margins so layouts stay predictable
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)
    outs = []
    if height:
        for h in height:
            r = im.copy()
            if r.height > h:
                r = r.resize((round(r.width * h / r.height), h), Image.LANCZOS)
            p = OUT / f"{name}-{h}.webp"
            r.save(p, "WEBP", quality=quality, method=6)
            outs.append((p.name, r.size))
    else:
        for w in widths:
            r = im.copy()
            if r.width > w:
                r = r.resize((w, round(r.height * w / r.width)), Image.LANCZOS)
            p = OUT / f"{name}-{w}.webp"
            r.save(p, "WEBP", quality=quality, method=6)
            outs.append((p.name, r.size))
    for o in outs:
        print(o)


# --- story & landscapes -----------------------------------------------------
for src, name in [
    ("despertarLink.webp", "ch-awakening"),
    ("ZeldaEcalamidade.avif", "ch-calamity"),
    ("divineBeasts.avif", "ch-champions"),
    ("finalBattle.webp", "ch-destiny"),
]:
    webp(src, name, widths=[960, 1920], quality=80)

for i, ext in enumerate(["png", "png", "png", "jpg", "webp", "avif"], start=1):
    webp(f"scene{i}.{ext}", f"scene{i}", widths=[800, 1600], quality=80)

webp("sheikah screen 3.jpg", "sheikah-panel", widths=[1600], quality=72)
webp("sheikah screen 2.jpg", "sheikah-eye", widths=[1200], quality=72)
webp("cameraRune.jpg", "rune-camera", widths=[736], quality=78)

# --- characters --------------------------------------------------------------
for src, name in [
    ("link.png", "char-link"), ("zelda.png", "char-zelda"), ("mipha.png", "char-mipha"),
    ("revali.webp", "char-revali"), ("daruk.png", "char-daruk"), ("urbosa.png", "char-urbosa"),
    ("ganonCalamity.webp", "char-ganon"),
]:
    webp(src, name, height=[640, 1200], quality=80)

webp("Link.webp", "link-bow", widths=[386], quality=82)
webp("navIcon.png", "logo", widths=[480], quality=85)
webp("icon.webp", "crest", widths=[256], quality=85)
Image.open(RAW / "icon.webp").convert("RGBA").resize((64, 38)).save(ROOT / "public" / "favicon.png")

# --- hero clip from the trailer opening (0.2-15.9s are HUD-free) ------------
ff("-ss", "0.2", "-to", "15.9", "-i", str(RAW / "zeldaVideo.mp4"), "-an",
   "-vf", "scale=1280:-2,fps=30,fade=t=in:st=0:d=0.6,fade=t=out:st=15.0:d=0.7",
   "-c:v", "libx264", "-preset", "slow", "-crf", "26",
   "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / "hero.mp4"))
ff("-ss", "15.6", "-i", str(RAW / "zeldaVideo.mp4"), "-frames:v", "1",
   "-q:v", "3", str(OUT / "hero-poster.jpg"))
ff("-ss", "15.6", "-i", str(RAW / "zeldaVideo.mp4"), "-frames:v", "1",
   "-vf", "scale=640:-2", "-q:v", "5", str(OUT / "hero-poster-sm.jpg"))

# --- rune gifs -> mp4 ----------------------------------------------------------
# (magnesisRune.gif uses RGBA frames ffmpeg can't decode -> scripts/gif-to-mp4.py)
subprocess.run(["python", str(ROOT / "scripts" / "gif-to-mp4.py"), "magnesisRune.gif", "rune-magnesis.mp4"], check=True)
for g in ["stasis", "cryonis", "bomb", "amiibo", "moto"]:
    src = RAW / f"{g}Rune.gif"
    ff("-i", str(src), "-an", "-vf", "scale='min(640,iw)':-2:flags=lanczos,fps=24,format=yuv420p",
       "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-movflags", "+faststart",
       str(OUT / f"rune-{g}.mp4"))
    ff("-i", str(src), "-frames:v", "1", "-vf", "scale='min(640,iw)':-2", "-q:v", "5",
       str(OUT / f"rune-{g}.jpg"))

# --- audio -------------------------------------------------------------------
for src, name in [("ZeldaMainTheme.mp3", "theme"), ("Kass.mp3", "kass"), ("ZeldaIniciar.mp3", "start")]:
    ff("-i", str(RAW / src), "-vn", "-map_metadata", "-1", "-ac", "2", "-b:a", "128k",
       str(OUT / f"{name}.mp3"))

total = sum(p.stat().st_size for p in OUT.iterdir())
print(f"done: {total/1e6:.1f} MB in {OUT}")
