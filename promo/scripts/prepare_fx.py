"""Pre-computed textures: blurred photo backdrops and film-grain tiles.
Usage: python3 scripts/prepare_fx.py"""
import os, glob
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
os.makedirs(os.path.join(root, "photos", "blur"), exist_ok=True)
for f in glob.glob(os.path.join(root, "photos", "*.jpg")):
    im = Image.open(f).convert("RGB")
    im.thumbnail((640, 640))
    im = im.filter(ImageFilter.GaussianBlur(18))
    im = ImageEnhance.Brightness(im).enhance(0.45)
    im.save(os.path.join(root, "photos", "blur", os.path.basename(f)), quality=85)
os.makedirs(os.path.join(root, "fx"), exist_ok=True)
rng = np.random.default_rng(3)
for i in range(6):
    g = rng.normal(128, 40, (540, 960)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(os.path.join(root, "fx", f"grain{i}.png"))
print("ok")
