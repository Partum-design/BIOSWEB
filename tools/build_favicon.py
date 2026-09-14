#!/usr/bin/env python3
"""Genera el favicon de Laboratorios BIOS en todos sus tamaños.

El favicon anterior era el logotipo blanco en PNG: se perdía por completo
sobre pestañas claras. Este dibuja el símbolo de marca (globo + pulso) en
blanco sobre una pastilla con degradado azul BIOS, así que se ve igual de
nítido en tema claro, oscuro o sobre cualquier color de pestaña.

Uso:  python3 tools/build_favicon.py
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets')

DEEP = (10, 28, 46)        # #0A1C2E  azul BIOS profundo
MID = (21, 101, 192)       # #1565C0  azul de marca
BRIGHT = (41, 182, 246)    # #29B6F6  cian del pulso
WHITE = (255, 255, 255)

SS = 8                     # supermuestreo para bordes limpios

# Trazo del electrocardiograma, en fracciones del lienzo.
PULSE = [
    (0.055, 0.500), (0.320, 0.500), (0.385, 0.500), (0.442, 0.285),
    (0.520, 0.735), (0.588, 0.430), (0.645, 0.512), (0.700, 0.500),
    (0.945, 0.500),
]

# Versión de pocos vértices para 16 y 32 px, donde el trazo fino se pierde.
PULSE_SIMPLE = [
    (0.045, 0.500), (0.360, 0.500), (0.445, 0.235),
    (0.545, 0.775), (0.632, 0.500), (0.955, 0.500),
]


def gradient(size):
    """Degradado diagonal profundo -> azul -> cian."""
    image = Image.new('RGB', (size, size))
    pixels = image.load()
    for y in range(size):
        for x in range(size):
            t = (x / max(size - 1, 1) * 0.45 + y / max(size - 1, 1) * 0.55)
            if t < 0.55:
                k = t / 0.55
                start, end = DEEP, MID
            else:
                k = (t - 0.55) / 0.45
                start, end = MID, BRIGHT
            pixels[x, y] = tuple(int(start[i] + (end[i] - start[i]) * k) for i in range(3))
    return image


def rounded_mask(size, radius_ratio):
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255
    )
    return mask


def draw_icon(size, detail=True, globe=True, padding=0.0, radius_ratio=0.225):
    """Dibuja el icono a `size` px.

    `detail` agrega el meridiano del globo, que por debajo de 32 px solo
    ensucia; `globe` se apaga a 16 px, donde el aro se convierte en una
    mancha y el pulso solo se lee limpio si va solo; `padding` deja el aire
    que pide el icono de iOS.
    """
    canvas = size * SS
    icon = gradient(canvas)
    icon.putalpha(rounded_mask(canvas, radius_ratio))

    art = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(art)

    inset = canvas * padding
    span = canvas - inset * 2

    def point(fx, fy):
        return (inset + span * fx, inset + span * fy)

    radius = span * 0.315
    cx, cy = point(0.5, 0.5)
    ring = max(2, round(span * (0.070 if detail else 0.095)))

    # Globo. El meridiano va translúcido para que el pulso, que sí es blanco
    # puro, siga siendo la línea que domina la lectura del icono.
    if globe:
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                     outline=WHITE, width=ring)
    if detail:
        meridian = span * 0.140
        draw.ellipse([cx - meridian, cy - radius, cx + meridian, cy + radius],
                     outline=WHITE + (170,), width=max(2, round(span * 0.045)))

    # Pulso de borde a borde, como en el logotipo. Lleva una funda del azul
    # profundo (semitransparente) para no fundirse con el aro del globo.
    pulse = [point(fx, fy) for fx, fy in (PULSE if detail else PULSE_SIMPLE)]
    stroke = max(3, round(span * (0.078 if detail else 0.095)))
    draw.line(pulse, fill=DEEP + (145,), width=round(stroke * 1.7), joint='curve')
    draw.line(pulse, fill=WHITE, width=stroke, joint='curve')
    for tip in (pulse[0], pulse[-1]):
        draw.ellipse([tip[0] - stroke / 2, tip[1] - stroke / 2,
                      tip[0] + stroke / 2, tip[1] + stroke / 2], fill=WHITE)

    return Image.alpha_composite(icon, art).resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(ASSETS, exist_ok=True)
    outputs = {
        'favicon-16.png': draw_icon(16, detail=False, globe=False, radius_ratio=0.20),
        'favicon-32.png': draw_icon(32, detail=False, radius_ratio=0.215),
        'favicon-48.png': draw_icon(48),
        'favicon-64.png': draw_icon(64),
        'apple-touch-icon.png': draw_icon(180, padding=0.085, radius_ratio=0.0),
        'icon-192.png': draw_icon(192),
        'icon-512.png': draw_icon(512),
        'icon-maskable-512.png': draw_icon(512, padding=0.14, radius_ratio=0.0),
    }
    for name, image in outputs.items():
        image.save(os.path.join(ASSETS, name), optimize=True)
        print('assets/' + name)

    # favicon.ico en la raíz: es lo que piden por defecto los navegadores y
    # los agregadores de enlaces que no leen las etiquetas <link>.
    ico = os.path.join(ROOT, 'favicon.ico')
    outputs['favicon-48.png'].save(
        ico, format='ICO',
        append_images=[outputs['favicon-32.png'], outputs['favicon-16.png']],
        sizes=[(48, 48), (32, 32), (16, 16)],
    )
    print('favicon.ico')


if __name__ == '__main__':
    main()
