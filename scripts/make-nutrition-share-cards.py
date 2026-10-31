"""Regenerate the two Nutrition share cards without browser dependencies.

Optional authoring helper: requires Pillow. The website build consumes the
committed JPEGs; it does not install or execute this helper.
"""
from pathlib import Path
from math import sin, pi
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = Path('/usr/share/fonts/truetype/dejavu')

# Космічна палітра сайту (рішення власника 2026-10-31): ті самі значення, що --pine-* у dist/palette-cosmic.css
# (tests/share-and-print.test.mjs звіряє ці п'ять кольорів із файлом палітри). До цього картки були сосново-зеленими.
BG = '#0b0a12'      # --pine-bg
LINE = '#3b3647'    # --pine-line: розділювач
WAVE = '#2b2739'    # хвилі візерунка: між тлом і лінією, щоб лишались ледь помітними, як візерунок інших карток
TEXT = '#f7f3ef'    # --pine-text: заголовок
MUTED = '#c3b9d1'   # --pine-muted: підпис, опис, девіз
ACCENT = '#d1a5ff'  # --pine-accent: риска під заголовком і назва

def card(name, eyebrow, lines, description):
    image = Image.new('RGB', (1200, 630), BG)
    draw = ImageDraw.Draw(image)
    for offset in range(-100, 660, 24):
        points = [(x, offset + 10 * sin(x * pi / 180)) for x in range(680, 1201, 3)]
        draw.line(points, fill=WAVE, width=1)
    small = ImageFont.truetype(str(FONT / 'DejaVuSans.ttf'), 23)
    serif = ImageFont.truetype(str(FONT / 'DejaVuSerif-Bold.ttf'), 66)
    body = ImageFont.truetype(str(FONT / 'DejaVuSans.ttf'), 26)
    brand = ImageFont.truetype(str(FONT / 'DejaVuSans-Bold.ttf'), 29)
    draw.text((76, 64), eyebrow, fill=MUTED, font=small)
    y = 128
    for line in lines:
        draw.text((76, y), line, fill=TEXT, font=serif)
        y += 84
    draw.rounded_rectangle((78, y + 14, 280, y + 23), radius=5, fill=ACCENT)
    for index, line in enumerate(description):
        draw.text((78, y + 56 + 37 * index), line, fill=MUTED, font=body)
    draw.line((76, 534, 1124, 534), fill=LINE, width=1)
    draw.text((76, 560), 'Evidence UA', fill=ACCENT, font=brand)
    draw.text((730, 564), 'Наука · Здоров’я · Рух', fill=MUTED, font=small)
    output = ROOT / 'dist' / 'og' / (name + '.jpg')
    image.save(output, quality=90, optimize=True)
    print(output.relative_to(ROOT))

card('nutrition', 'ХАРЧУВАННЯ', ['Світ харчування.'],
     ['Дієти й режими.', 'Фізіологія та біохімія.'])
card('nutrition-inside', 'ФІЗІОЛОГІЯ ТА БІОХІМІЯ', ['Харчування', 'зсередини.'],
     ['Від травлення до обміну речовин.'])
