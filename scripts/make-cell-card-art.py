#!/usr/bin/env python3
"""Мініатюра картки «Клітини та органели» у каталозі напрямів: квадратний кадр із головної картини сторінки «Клітина людини».

Картка напряму в каталозі показує головну картину своєї сторінки (так само, як «М'язи та тренування» показують muscle-lab-art-v1.webp).
Для клітини це dist/cell-atlas-v2.webp (1448 × 1086, художня 3D-ілюстрація клітини з органелами всередині). Малюнок не змінюється й не
перефарбовується: береться квадратний кадр навколо ядра (ядро, ендоплазматична сітка, мітохондрія, апарат Гольджі, лізосома, пероксисома),
стискається до 240 × 240 (80 CSS-пікселів × 3 для екранів телефона) і зберігається в WebP. Фон картини графітовий, не бірюзовий, тому
палітрових копій (-cosmic) не потрібно: у каталозі одна <img> для обох палітр, як і на самій сторінці «Клітина людини».

Допоміжний інструмент автора: потрібен Pillow. Збірка сайту його не запускає, а результат (WebP) закомічено в dist.
Запуск з кореня репозиторію: python3 scripts/make-cell-card-art.py
"""
from pathlib import Path

from PIL import Image

DIST = Path(__file__).resolve().parents[1] / 'dist'
SOURCE = 'cell-atlas-v2.webp'
OUTPUT = 'cell-atlas-card-v1.webp'
# Квадрат 1086 × 1086 зі зсувом 200 px від лівого краю: ядро посередині, обидва краї оболонки лишаються поза кадром.
CROP = (200, 0, 1286, 1086)
SIZE = 240
QUALITY = 82  # файл лишається легким (<40 КБ, перевіряє tests/catalog-cell-picture.test.mjs)


def main():
    with Image.open(DIST / SOURCE) as source:
        frame = source.convert('RGB').crop(CROP).resize((SIZE, SIZE), Image.LANCZOS)
    target = DIST / OUTPUT
    frame.save(target, 'WEBP', quality=QUALITY, method=6)
    print(f'{OUTPUT}: {SIZE}x{SIZE}, {target.stat().st_size} байт (кадр {CROP} із {SOURCE})')


if __name__ == '__main__':
    main()
