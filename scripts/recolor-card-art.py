#!/usr/bin/env python3
"""Космічні версії шести картин напрямів головної: темно-бірюзове тло стає темно-фіолетовим.

Малюнок не редагується: змінюється лише відтінок темних бірюзових тонів (тло, ядро клітини, оболонка волокна).
Помаранчевий, золотий, зелений, синій і бежевий, а також світлі бірюзові деталі (молекули) лишаються як є.
Вага перефарбування залежить від відтінку, насиченості й яскравості плавно, без масок, тому на краях немає ореолів.

Допоміжний інструмент автора: потрібні Pillow і numpy. Збірка сайту його не запускає, а результат (WebP) закомічено в dist/.
Запуск з кореня репозиторію: python3 scripts/recolor-card-art.py
Оригінали (v1, v2) власника лишаються в dist/ як історія; нові файли мають суфікс -cosmic.
"""
import colorsys
import sys
from pathlib import Path

import numpy as np
from PIL import Image

DIST = Path(__file__).resolve().parents[1] / 'dist'
TARGET_HUE = 268.0   # градусів: фіолетовий між тлом головної (#0b0a12) і лавандовим акцентом (#d1a5ff)
MUTE = 0.30          # наскільки приглушити насиченість у перефарбованих тонах
QUALITY = 88         # WebP; нові файли лишаються легкими (<180 КБ, перевіряє tests/card-art.test.mjs)

# (джерело, результат, нижня межа відтінку у градусах).
# Зелені тіла (клітина) мають відтінок понад 100°, тому для них межу ставимо 150°. У «Сну» золоті хвилі світяться
# по краях жовто-зеленим, тож їхній відтінок (70°+) теж треба перефарбувати, інакше довкола золота лишається оливкове світіння.
JOBS = [
    ('card-art-muscle-v1.webp', 'card-art-muscle-v1-cosmic.webp', 150.0),
    ('card-art-cell-v1.webp', 'card-art-cell-v1-cosmic.webp', 150.0),
    ('card-art-nutrition-v1.webp', 'card-art-nutrition-v1-cosmic.webp', 150.0),
    ('card-art-supplements-v1.webp', 'card-art-supplements-v1-cosmic.webp', 150.0),
    ('card-art-movement-v2.webp', 'card-art-movement-v2-cosmic.webp', 150.0),
    ('card-art-sleep-v2.webp', 'card-art-sleep-v2-cosmic.webp', 70.0),
]


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def recolor(im, hue_lo, target=TARGET_HUE, mute=MUTE):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    v = mx
    s = np.where(mx > 0, d / np.where(mx > 0, mx, 1), 0)
    dd = np.where(d > 1e-6, d, 1)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60.0
    h = np.where(d > 1e-6, h, 0)
    # Вага: бірюзові та зелено-сині відтінки від hue_lo до 228°, темніші за ~0.6 і не майже сірі.
    w_h = smooth(h, hue_lo, hue_lo + 22) * (1 - smooth(h, 205, 228))
    w_v = 1 - smooth(v, 0.50, 0.70)
    w_s = smooth(s, 0.10, 0.25)
    w = w_h * w_v * w_s
    h2 = h + w * (target - h)
    s2 = s * (1 - mute * w)
    # HSV -> RGB
    c = v * s2
    hp = (h2 % 360) / 60.0
    x = c * (1 - np.abs(hp % 2 - 1))
    z = np.zeros_like(c)
    sector = np.floor(hp).astype(int) % 6
    rr = np.choose(sector, [c, x, z, z, x, c])
    gg = np.choose(sector, [x, c, c, x, z, z])
    bb = np.choose(sector, [z, z, x, c, c, x])
    m = v - c
    out = np.stack([rr + m, gg + m, bb + m], -1)
    return Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8))


def border_hsv(im):
    """Середній колір рамки картини (це тло) у HSV: відтінок у градусах, насиченість, яскравість."""
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).mean(0)
    h, s, v = colorsys.rgb_to_hsv(*edge)
    return h * 360, s, v


def main():
    for source, result, hue_lo in JOBS:
        src, dst = DIST / source, DIST / result
        if not src.exists():
            sys.exit(f'Немає джерела {src}')
        before = Image.open(src)
        after = recolor(before, hue_lo)
        after.save(dst, 'WEBP', quality=QUALITY, method=6)
        hb, sb, vb = border_hsv(before)
        ha, sa, va = border_hsv(Image.open(dst))
        print(f'{result:40s} {dst.stat().st_size // 1024:4d} КБ  тло: {hb:3.0f}° s={sb:.2f} v={vb:.2f} -> {ha:3.0f}° s={sa:.2f} v={va:.2f}')


if __name__ == '__main__':
    main()
