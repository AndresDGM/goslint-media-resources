"""Prepara las fotos del video: originales (sin tocar) -> public/photos (orientación EXIF aplicada, RGB,
lado mayor 2200 px, JPEG 90) y public/photos/blur (fondos desenfocados precalculados: 640 px, desenfoque
gaussiano 18, brillo 0,45).

Uso: python3 scripts/prepare_photos.py CARPETA_DE_ORIGINALES [...]
Las fotos ya preparadas están en public/photos. Los originales son los de busqueda-binaria/public/Photos
y los extraídos de la presentación «GOSLINT_UCEVA_presentacion» (ver README)."""
import glob, os, sys
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
DST = os.path.join(ROOT, "photos")
os.makedirs(os.path.join(DST, "blur"), exist_ok=True)
for f in sorted(p for d in sys.argv[1:] for p in glob.glob(os.path.join(d, "*")) if os.path.isfile(p)):
    name = os.path.splitext(os.path.basename(f))[0] + ".jpg"
    im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    big = im.copy(); big.thumbnail((2200, 2200), Image.LANCZOS); big.save(os.path.join(DST, name), quality=90)
    sm = im.copy(); sm.thumbnail((640, 640), Image.LANCZOS)
    sm = ImageEnhance.Brightness(sm.filter(ImageFilter.GaussianBlur(18))).enhance(0.45)
    sm.save(os.path.join(DST, "blur", name), quality=85)
    print(name, big.size)
