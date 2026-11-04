#!/usr/bin/env python3
"""Мініатюри карток каталогу напрямів для «Харчування», «Добавок», «Руху й біомеханіки» та «Сну й відновлення».

Картка напряму в каталозі показує справжню картину замість тьмяної піктограми (рішення власника 2026-11-03, «26 так»). У цих чотирьох сторінок немає
однієї головної картини (у «Харчуванні» плитки дієт, у «Добавках» фото-плитки, у «Русі» схеми внизу, у «Сні» лише малий малюнок), тому береться картина
напряму з вікна «Куди рушимо далі?» (dist/card-art-*.webp, надіслана власником): з неї вирізається квадратний кадр навколо головного предмета
(тарілка, банка, коліно, мозок з місяцем), який стискається до 240 × 240 (80 CSS-пікселів × 3 для екранів телефона) і зберігається в WebP.

Малюнок не змінюється й не перефарбовується: лише обрізання й стиснення. Кадр робиться двічі: з оригіналу власника (темно-бірюзове тло) для «Зеленого»
і з космічної копії `-cosmic` (її робить scripts/recolor-card-art.py) для космосу, тож у каталозі, як і раніше, стоїть пара `<img data-art>`.
Картки «М'язи та тренування» (muscle-lab-art-v1.webp) і «Клітини та органели» (cell-atlas-card-v1.webp, scripts/make-cell-card-art.py) цей скрипт не чіпає.

Допоміжний інструмент автора: потрібен Pillow. Збірка сайту його не запускає, а результат (WebP) закомічено в dist.
Запуск з кореня репозиторію: python3 scripts/make-direction-thumbs.py
"""
from pathlib import Path

from PIL import Image

DIST = Path(__file__).resolve().parents[1] / 'dist'
SIZE = 240
QUALITY = 80  # кожен файл лишається легким (<40 КБ, перевіряє tests/catalog-card-pictures.test.mjs)

# (напрям, картина напряму без суфікса палітри, кадр (лівий, верхній, правий, нижній) у пікселях картини; кадр квадратний).
# Browser QA читає цей рядок і порівнює кадр у картці з вирізкою цієї самої картини, тож формат рядків не змінювати.
THUMBS = [
    ('nutrition', 'card-art-nutrition-v1', (290, 15, 930, 655)),
    ('supplements', 'card-art-supplements-v1', (318, 55, 898, 635)),
    ('movement', 'card-art-movement-v2', (290, 0, 960, 670)),
    ('sleep', 'card-art-sleep-v2', (320, 0, 980, 660)),
]
# Оригінал (для «Зеленого») і космічна копія (для космосу): суфікс імені файла.
PALETTES = ('', '-cosmic')


def main():
    for area, source, box in THUMBS:
        if box[2] - box[0] != box[3] - box[1]:
            raise SystemExit(f'{area}: кадр {box} не квадратний')
        for suffix in PALETTES:
            with Image.open(DIST / f'{source}{suffix}.webp') as picture:
                frame = picture.convert('RGB').crop(box).resize((SIZE, SIZE), Image.LANCZOS)
            target = DIST / f'card-thumb-{area}-v1{suffix}.webp'
            frame.save(target, 'WEBP', quality=QUALITY, method=6)
            print(f'{target.name}: {SIZE}x{SIZE}, {target.stat().st_size} байт (кадр {box} із {source}{suffix}.webp)')


if __name__ == '__main__':
    main()
