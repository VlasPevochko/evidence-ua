"""Regenerate the two Nutrition share cards without browser dependencies.

Optional authoring helper: requires Pillow. The website build consumes the
committed JPEGs; it does not install or execute this helper.
"""
from pathlib import Path
from math import sin, pi
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = Path('/usr/share/fonts/truetype/dejavu')

def card(name, eyebrow, lines, description):
    image = Image.new('RGB', (1200, 630), '#0c2119')
    draw = ImageDraw.Draw(image)
    for offset in range(-100, 660, 24):
        points = [(x, offset + 10 * sin(x * pi / 180)) for x in range(680, 1201, 3)]
        draw.line(points, fill='#294235', width=1)
    small = ImageFont.truetype(str(FONT / 'DejaVuSans.ttf'), 23)
    serif = ImageFont.truetype(str(FONT / 'DejaVuSerif-Bold.ttf'), 66)
    body = ImageFont.truetype(str(FONT / 'DejaVuSans.ttf'), 26)
    brand = ImageFont.truetype(str(FONT / 'DejaVuSans-Bold.ttf'), 29)
    draw.text((76, 64), eyebrow, fill='#afc1b5', font=small)
    y = 128
    for line in lines:
        draw.text((76, y), line, fill='#eef0e8', font=serif)
        y += 84
    draw.rounded_rectangle((78, y + 14, 280, y + 23), radius=5, fill='#d9b977')
    for index, line in enumerate(description):
        draw.text((78, y + 56 + 37 * index), line, fill='#b9c8bc', font=body)
    draw.line((76, 534, 1124, 534), fill='#355140', width=1)
    draw.text((76, 560), 'Evidence UA', fill='#e3c47d', font=brand)
    draw.text((730, 564), 'Наука · Здоров’я · Рух', fill='#afc1b5', font=small)
    output = ROOT / 'dist' / 'og' / (name + '.jpg')
    image.save(output, quality=90, optimize=True)
    print(output.relative_to(ROOT))

card('nutrition', 'ХАРЧУВАННЯ', ['Світ харчування.'],
     ['Дієти й режими.', 'Фізіологія та біохімія.'])
card('nutrition-inside', 'ФІЗІОЛОГІЯ ТА БІОХІМІЯ', ['Харчування', 'зсередини.'],
     ['Від травлення до обміну речовин.'])
