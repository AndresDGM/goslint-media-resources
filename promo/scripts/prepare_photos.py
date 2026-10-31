"""Copy the supplied photographs into public/photos with clean names,
resized so the long side is at most 2200 px (keeps renders fast).
Usage: python3 scripts/prepare_photos.py [source_dir]"""
import os, sys
from PIL import Image, ImageOps
src = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/uploads"
dst = os.path.join(os.path.dirname(__file__), "..", "public", "photos")
os.makedirs(dst, exist_ok=True)
MAP = {
    "ganadores-maraton-interna-basica.jpg": "interna-basica.jpg",
    "gadores-1-maraton-interna-avanzado.jpg": "interna-avanzado-1.jpg",
    "ganadores-2-maraton-interna-avanzado.jpg": "interna-avanzado-2.jpg",
    "visita-utp-participacion-utp_open.jpg": "utp-open.jpg",
    "visita-javeriana_cali-participacion-maraton_nacional_icpc.jpg": "nacional-javeriana-cali.jpg",
    "cena_post_participacion-maraton_nacional_icpc.jpeg": "nacional-cena.jpg",
    "vuelo-bogota-maraton_regional_icpc-2025.jpeg": "regional-2025-vuelo.jpg",
    "auditorio-politecnico-gran-colomiano-maraton_regional_icpc-2025.jpg": "regional-2025-auditorio.jpg",
    "foto-equipo-maraton_regional_icpc-2025.jpeg": "regional-2025-equipo.jpg",
}
for s, d in MAP.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, s))).convert("RGB")
    im.thumbnail((2200, 2200), Image.LANCZOS)
    im.save(os.path.join(dst, d), quality=90)
    print(d, im.size)
