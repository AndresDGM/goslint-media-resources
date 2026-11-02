"""Texturas de grano precalculadas (6 PNG de 960×540 que se alternan cada 3 fotogramas).
Uso: python3 scripts/prepare_fx.py"""
import os
import numpy as np
from PIL import Image
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "fx")
os.makedirs(root, exist_ok=True)
rng = np.random.default_rng(3)
for i in range(6):
    g = rng.normal(128, 40, (540, 960)).clip(0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(os.path.join(root, f"grain{i}.png"))
print("ok")
