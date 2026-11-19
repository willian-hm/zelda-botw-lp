"""Fallback for GIFs ffmpeg can't decode: decode with Pillow, pipe raw frames to ffmpeg."""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageSequence
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
src = ROOT / "raw-assets" / sys.argv[1]
out = ROOT / "src" / "assets" / "media" / sys.argv[2]
im = Image.open(src)
w, h = im.size
s = min(1, 640 / w)
W, H = int(w * s) // 2 * 2, int(h * s) // 2 * 2
dur = im.info.get("duration", 40) or 40
fps = max(1, round(1000 / dur))
p = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                      "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p",
                      "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
canvas = Image.new("RGB", (w, h), (0, 0, 0))
first = None
for fr in ImageSequence.Iterator(im):
    f = fr.convert("RGBA")
    canvas.paste(f, (0, 0), f)
    frame = canvas.resize((W, H), Image.LANCZOS)
    if first is None:
        first = frame.copy()
    p.stdin.write(frame.tobytes())
p.stdin.close(); p.wait()
first.save(out.with_suffix(".jpg"), quality=80)
print(out.name, out.stat().st_size // 1024, "KB", fps, "fps")
