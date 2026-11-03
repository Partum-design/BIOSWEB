#!/usr/bin/env python3
"""Genera el catálogo completo de estudios BIOS desde el Excel.

Salida:
  assets/estudios-data.js     catálogo que usan buscador, /servicios, /agenda y /mujer
  estudios/index.html         directorio estático de todos los estudios (indexable)
  estudios/<slug>/index.html  una página por estudio (indexable, con datos estructurados)
  sitemap.xml, robots.txt

Uso:  python3 scripts/build_estudios.py [ruta.xlsx]
Requiere openpyxl (pip install openpyxl).
"""
import html
import json
import re
import shutil
import sys
import unicodedata
from urllib.parse import quote
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'data' / 'total-estudios-bios.xlsx'
SITE = 'https://biosweb.vercel.app'  # cambiar aquí al conectar el dominio propio
WHATSAPP = '5211234567890'
ASSET_V = '20261103'

# Sucursales: A = Tultepec y Cantú · B = Tepalcapa, Haciendas y Joya · C = Tepojaco
GROUPS = {'A': ['Tultepec', 'Cantú'], 'B': ['Tepalcapa', 'Haciendas', 'Joya'], 'C': ['Tepojaco']}
ALL_BRANCHES = ['Tultepec', 'Cantú', 'Tepalcapa', 'Haciendas', 'Joya', 'Tepojaco']
BRANCH_NAMES = {'Cantú': 'Plaza Cantú', 'Joya': 'Plaza La Joya', 'Haciendas': 'Las Haciendas',
                'Tepalcapa': 'Tepalcapa', 'Tepojaco': 'Tepojaco', 'Tultepec': 'Tultepec'}

# Sección del Excel → (cat, etiqueta visible, icono lucide, slug de categoría)
CATEGORIES = {
    'laboratorio': ('Laboratorio (procesar)', 'Laboratorio clínico', 'test-tube-diagonal', 'laboratorio-clinico'),
    'rayos x': ('Rayos X', 'Rayos X', 'scan-line', 'rayos-x'),
    'usg': ('Ultrasonidos', 'Ultrasonido', 'radar', 'ultrasonido'),
    'usg especial': ('Ultrasonidos', 'Ultrasonido', 'radar', 'ultrasonido'),
    'tomografía': ('Tomografía', 'Tomografía', 'scan', 'tomografia'),
    'especiales': ('Estudios especiales', 'Estudios especiales', 'sparkles', 'estudios-especiales'),
    'mixto': ('Estudios especiales', 'Estudios especiales', 'sparkles', 'estudios-especiales'),
    'dipatsi': ('Patología', 'Patología', 'microscope', 'patologia'),
    'extra': ('Servicios adicionales', 'Servicios adicionales', 'stethoscope', 'servicios-adicionales'),
    # Secciones sin clasificar en el Excel: son pruebas de laboratorio.
    'revisar': ('Laboratorio (procesar)', 'Laboratorio clínico', 'test-tube-diagonal', 'laboratorio-clinico'),
    'sucursal': ('Laboratorio (procesar)', 'Laboratorio clínico', 'test-tube-diagonal', 'laboratorio-clinico'),
}
CATEGORY_ORDER = ['Laboratorio clínico', 'Rayos X', 'Ultrasonido', 'Tomografía', 'Estudios especiales', 'Patología', 'Servicios adicionales']

# Se publican todos los estudios del Excel, incluso los marcados como BAJA o QUITAR.
def is_discontinued(section, note):
    return False


def clean(text):
    return re.sub(r'\s+', ' ', str(text or '')).strip()


def fix_prep(text):
    text = clean(text)
    text = re.sub(r'prepe?raci[oó]n', 'preparación', text, flags=re.I)
    text = text.replace('No requiere preparación especial', 'No requiere preparación especial.')
    text = re.sub(r'\.\.+', '.', text)
    return text or 'No requiere preparación especial.'


def ascii_fold(text):
    return unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode()


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', ascii_fold(text).lower()).strip('-')[:70].strip('-')


def parse_branches(value):
    raw = clean(value).upper()
    letters = set(re.findall(r'\b([ABC])\b', raw))
    if not letters:  # sin sucursal definida en el Excel
        return list(ALL_BRANCHES), True
    branches = [b for g in 'ABC' if g in letters for b in GROUPS[g]]
    return [b for b in ALL_BRANCHES if b in branches], False


def parse_days(value):
    if value is None or value == '':
        return None, 'Consultar entrega'
    if isinstance(value, (int, float)):
        d = int(value)
        return d, 'Mismo día' if d == 0 else '1 día hábil' if d == 1 else f'{d} días hábiles'
    text = clean(value)
    if 'hora' in text.lower():
        return 0, text
    return None, text


def keywords(desc, name):
    """Sinónimos útiles de la columna Descripción (sin frases de relleno)."""
    seen, out = set(), []
    base = ascii_fold(name).lower()
    for part in re.split(r'[;\n]', str(desc or '')):
        term = clean(part).strip('. ')
        low = ascii_fold(term).lower()
        if not term or low in seen or low == base:
            continue
        if re.match(r'^(prueba|estudio) de ', low) and ascii_fold(low.split(' de ', 1)[1]) == base:
            continue
        seen.add(low)
        out.append(term)
    return out


def includes(value):
    return [clean(x).rstrip(',') for x in re.split(r'[\n,]', str(value or '')) if clean(x).rstrip(',')]


def load_previous_flags():
    path = ROOT / 'assets' / 'estudios-data.js'
    try:
        m = re.search(r'window\.BIOS_ESTUDIOS = (\[.*?\]);', path.read_text(encoding='utf-8'), re.S)
        return {i['c']: i for i in json.loads(m.group(1))}
    except Exception:
        return {}


def read_catalog():
    flags = load_previous_flags()
    wb = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
    rows = list(wb.worksheets[0].iter_rows(values_only=True))
    head = [clean(h) for h in rows[0]]
    col = {name: head.index(name) for name in head if name}
    get = lambda r, name: r[col[name]] if col.get(name) is not None and col[name] < len(r) else None

    items, skipped, slugs = [], [], set()
    for r in rows[1:]:
        code, name = clean(get(r, 'Clave o componentes')), clean(get(r, 'Nombre'))
        if not code or not name:
            continue
        section = clean(get(r, 'Sección')).lower()
        if is_discontinued(section, get(r, 'Nota')):
            skipped.append(f'{code} · {name}')
            continue
        if section == 'baja':  # sin sección propia: se clasifica por el tipo de estudio
            section = 'usg' if code.upper().startswith('USG') else 'especiales'
        cat, label, icon, cat_slug = CATEGORIES.get(section, CATEGORIES['laboratorio'])
        price = get(r, 'Precio')
        price_label = None
        if isinstance(price, (int, float)):
            price = int(round(price))
        else:
            price_label = clean(price) or 'Consultar'
            price = None
        days, dl = parse_days(get(r, 'Entrega (días)'))
        branches, unconfirmed = parse_branches(get(r, 'Sucursal'))
        slug = slugify(name) or slugify(code)
        if slug in slugs:
            slug = f'{slug}-{slugify(code)}'
        n = 2
        while slug in slugs:
            slug, n = f'{slug}-{n}', n + 1
        slugs.add(slug)
        prev = flags.get(code, {})
        item = {
            'c': code, 'n': name, 't': clean(get(r, 'Tipo')) or 'Estudio',
            'cat': cat, 'catLabel': label, 'icon': icon, 'cs': cat_slug,
            'price': price, 'days': days, 'dl': dl,
            'prep': fix_prep(get(r, 'Preparación para el paciente')),
            'branches': branches,
            'top': bool(prev.get('top')), 'alta': bool(prev.get('alta')), 'campaign': bool(prev.get('campaign')),
            's': slug,
        }
        if price_label:
            item['priceLabel'] = price_label
        if unconfirmed:
            item['chk'] = True
        kw = keywords(get(r, 'Descripción'), name)
        if kw:
            item['k'] = '; '.join(kw)
        inc = includes(get(r, 'Paquete Estudios incluidos'))
        if inc:
            item['inc'] = inc
        items.append(item)
    return items, skipped


# ---------------------------------------------------------------- HTML
e = lambda text: html.escape(str(text), quote=True)


def money(item):
    return f"${item['price']:,} MXN" if item['price'] is not None else item.get('priceLabel', 'Consultar')


def head(title, description, canonical, prefix, extra=''):
    return f'''<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}">
    <link rel="canonical" href="{e(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Laboratorios BIOS">
    <meta property="og:locale" content="es_MX">
    <meta property="og:title" content="{e(title)}">
    <meta property="og:description" content="{e(description)}">
    <meta property="og:url" content="{e(canonical)}">
    <link rel="icon" href="{prefix}favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="{prefix}assets/favicon/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="{prefix}assets/favicon/favicon-192.png">
    <link rel="apple-touch-icon" href="{prefix}assets/favicon/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="{prefix}assets/multipage.css?v=20261007">
    <link rel="stylesheet" href="{prefix}assets/compact.css?v=20261007">
    <script>window.BIOS_BASE = '{prefix}';</script>
    <script src="{prefix}assets/site.js?v={ASSET_V}" defer></script>
    <link rel="stylesheet" href="{prefix}assets/polish.css?v=20261103">
    <link rel="stylesheet" href="{prefix}assets/estudios.css?v={ASSET_V}">
{extra}</head>
<body>
    <div class="page-shell">
        <header class="site-header"></header>
'''


FOOT = '''    </div>
    <script>document.addEventListener('DOMContentLoaded', () => window.lucide && lucide.createIcons());</script>
</body>
</html>
'''


def meta_description(item):
    parts = [f"{item['n']} en Laboratorios BIOS"]
    parts.append(f"precio {money(item)}" if item['price'] is not None else 'precio a consultar')
    parts.append(f"entrega {item['dl'].lower()}")
    text = ', '.join(parts) + '. ' + item['prep']
    text += ' Agenda en Cuautitlán, Tultepec y Tepojaco.'
    return text if len(text) <= 158 else text[:155].rsplit(' ', 1)[0] + '…'


def json_ld(item, url):
    test = {
        '@type': 'MedicalTest', 'name': item['n'], 'alternateName': item['c'],
        'description': item['prep'], 'url': url,
    }
    if item.get('k'):
        test['alternateName'] = [item['c']] + item['k'].split('; ')[:8]
    service = {
        '@type': 'Service', 'name': item['n'], 'serviceType': item['catLabel'], 'url': url,
        'provider': {'@type': 'MedicalClinic', 'name': 'Laboratorios BIOS', 'url': SITE + '/',
                     'address': {'@type': 'PostalAddress', 'addressLocality': 'Cuautitlán Izcalli',
                                 'addressRegion': 'Estado de México', 'addressCountry': 'MX'}},
        'areaServed': ['Cuautitlán', 'Cuautitlán Izcalli', 'Tultepec', 'Tepojaco', 'Estado de México'],
    }
    if item['price'] is not None:
        service['offers'] = {'@type': 'Offer', 'price': item['price'], 'priceCurrency': 'MXN',
                             'availability': 'https://schema.org/InStock', 'url': url}
    crumbs = {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': SITE + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Estudios', 'item': SITE + '/estudios/'},
        {'@type': 'ListItem', 'position': 3, 'name': item['catLabel'], 'item': f"{SITE}/estudios/#{item['cs']}"},
        {'@type': 'ListItem', 'position': 4, 'name': item['n'], 'item': url},
    ]}
    data = {'@context': 'https://schema.org', '@graph': [test, service, crumbs]}
    return '    <script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'


def study_page(item, related):
    url = f"{SITE}/estudios/{item['s']}/"
    p = '../../'
    title = f"{item['n']} — precio y preparación | Laboratorios BIOS"
    wa = f"https://wa.me/{WHATSAPP}?text=" + html.escape(
        quote(f"Hola Laboratorios BIOS, quiero información del estudio: {item['n']} ({item['c']})"))
    branches = ''.join(f'<li><i data-lucide="map-pin" class="w-4 h-4"></i>{e(BRANCH_NAMES[b])}</li>' for b in item['branches'])
    chk = '<p class="estudio-note"><i data-lucide="info" class="w-4 h-4"></i> Confirma con tu sucursal que este estudio esté disponible antes de acudir.</p>' if item.get('chk') else ''
    inc = ''
    if item.get('inc'):
        inc = '<section class="panel estudio-block"><h2>Incluye</h2><ul class="estudio-list">' + \
              ''.join(f'<li><i data-lucide="check" class="w-4 h-4"></i>{e(x)}</li>' for x in item['inc']) + '</ul></section>'
    kw = ''
    if item.get('k'):
        kw = '<section class="panel estudio-block"><h2>También lo puedes encontrar como</h2><p class="estudio-tags">' + \
             ''.join(f'<span>{e(x)}</span>' for x in item['k'].split('; ')[:14]) + '</p></section>'
    rel = ''.join(f'<li><a href="../{e(r["s"])}/"><span>{e(r["n"])}</span><b>{e(money(r))}</b></a></li>' for r in related)
    return head(title, meta_description(item), url, p, json_ld(item, url)) + f'''
        <main class="page-enter estudio-page">
            <nav class="estudio-crumbs" aria-label="Migas de pan">
                <a href="{p}">Inicio</a><span>/</span><a href="../">Estudios</a><span>/</span><a href="../#{item['cs']}">{e(item['catLabel'])}</a>
            </nav>
            <div class="estudio-grid">
                <article class="dark-panel estudio-hero">
                    <span class="section-kicker !bg-white/10 !border-white/15 !text-cyan-100"><i data-lucide="{item['icon']}" class="w-4 h-4"></i> {e(item['catLabel'])}{' · Paquete' if item['t'] == 'Paquete' else ''}</span>
                    <h1 class="brand-type">{e(item['n'])}</h1>
                    <p class="estudio-code">Clave {e(item['c'])}</p>
                    <div class="estudio-facts">
                        <div><small>Precio</small><strong>{e(money(item))}</strong></div>
                        <div><small>Entrega de resultados</small><strong>{e(item['dl'])}</strong></div>
                    </div>
                    <div class="estudio-actions">
                        <a class="primary-button" href="{p}agenda/?estudio={e(quote(item['c']))}"><i data-lucide="calendar-check" class="w-5 h-5"></i> Agendar este estudio</a>
                        <a class="primary-button !bg-[#25D366]" target="_blank" rel="noopener" href="{wa}"><i class="fa-brands fa-whatsapp text-lg"></i> Cotizar por WhatsApp</a>
                    </div>
                </article>
                <div class="estudio-side">
                    <section class="panel estudio-block">
                        <h2>Preparación</h2>
                        <p>{e(item['prep'])}</p>
                    </section>
                    {inc}
                    <section class="panel estudio-block">
                        <h2>Sucursales donde se realiza</h2>
                        <ul class="estudio-list estudio-branches">{branches}</ul>
                        {chk}
                        <a class="estudio-link" href="{p}sucursales/">Ver horarios y ubicación <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
                    </section>
                    {kw}
                </div>
            </div>
            <section class="panel estudio-block estudio-related">
                <h2>Otros estudios de {e(item['catLabel'].lower())}</h2>
                <ul>{rel}</ul>
                <a class="estudio-link" href="../">Ver los {TOTAL} estudios <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
            </section>
        </main>
''' + FOOT


def directory_page(items):
    p = '../'
    by_cat = {label: [i for i in items if i['catLabel'] == label] for label in CATEGORY_ORDER}
    nav = ''.join(f'<a class="chip" href="#{v[0]["cs"]}">{e(k)} <span class="chip-count">{len(v)}</span></a>' for k, v in by_cat.items() if v)
    sections = ''
    for label, group in by_cat.items():
        if not group:
            continue
        group = sorted(group, key=lambda i: ascii_fold(i['n']).lower())
        rows = ''.join(
            f'<li data-q="{e(ascii_fold((i["n"] + " " + i["c"] + " " + i.get("k", "")).lower()))}"><a href="{e(i["s"])}/"><span>{e(i["n"])}<small>{e(i["c"])} · {e(i["dl"])}</small></span><b>{e(money(i))}</b></a></li>'
            for i in group)
        sections += f'<section class="panel estudio-block estudio-dir" id="{group[0]["cs"]}"><h2><i data-lucide="{group[0]["icon"]}" class="w-5 h-5"></i> {e(label)} <span>{len(group)}</span></h2><ul>{rows}</ul></section>\n'
    ld = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Estudios de Laboratorios BIOS',
          'numberOfItems': len(items),
          'itemListElement': [{'@type': 'ListItem', 'position': n + 1, 'url': f"{SITE}/estudios/{i['s']}/", 'name': i['n']} for n, i in enumerate(items)]}
    extra = '    <script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    desc = f'Directorio completo de los {len(items)} estudios de Laboratorios BIOS: laboratorio clínico, rayos X, ultrasonido, tomografía, patología y estudios especiales con precio y preparación.'
    return head(f'Todos los estudios ({len(items)}) | Laboratorios BIOS', desc, f'{SITE}/estudios/', p, extra) + f'''
        <main class="page-enter estudio-page">
            <div class="dark-panel estudio-hero estudio-dir-hero">
                <span class="section-kicker !bg-white/10 !border-white/15 !text-cyan-100"><i data-lucide="microscope" class="w-4 h-4"></i> Directorio BIOS</span>
                <h1 class="brand-type">Todos nuestros estudios</h1>
                <p>{len(items)} estudios y paquetes con precio, tiempo de entrega y preparación. Toca cualquiera para ver el detalle o agendarlo.</p>
                <div class="estudio-actions">
                    <a class="primary-button" href="{p}servicios/"><i data-lucide="sliders-horizontal" class="w-5 h-5"></i> Filtrar por sucursal y precio</a>
                    <a class="primary-button !bg-white !text-[#0A1C2E]" href="{p}agenda/"><i data-lucide="calendar-check" class="w-5 h-5"></i> Agendar</a>
                </div>
            </div>
            <div class="estudio-dir-tools">
                <input id="dir-search" class="field" type="search" placeholder="Filtrar la lista: tiroides, orina, tórax..." aria-label="Filtrar estudios">
                <nav class="flex flex-wrap gap-2">{nav}</nav>
            </div>
            {sections}
            <p id="dir-empty" class="hidden panel estudio-block text-center">No hay estudios con ese nombre. Prueba el <a class="estudio-link" href="{p}servicios/">buscador inteligente</a>.</p>
        </main>
    <script>
        (() => {{
            const input = document.getElementById('dir-search');
            const fold = t => t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
            input.addEventListener('input', () => {{
                const words = fold(input.value).split(/\\s+/).filter(Boolean);
                let shown = 0;
                document.querySelectorAll('.estudio-dir').forEach(section => {{
                    let count = 0;
                    section.querySelectorAll('li').forEach(li => {{
                        const ok = words.every(w => li.dataset.q.includes(w));
                        li.hidden = !ok;
                        if (ok) count++;
                    }});
                    section.hidden = count === 0;
                    shown += count;
                }});
                document.getElementById('dir-empty').classList.toggle('hidden', shown > 0);
            }});
        }})();
    </script>
''' + FOOT


STATIC_PAGES = ['', 'servicios/', 'estudios/', 'sucursales/', 'mujer/', 'conocenos/', 'empresas/', 'medicos/',
                'facturacion/', 'unete/', 'aviso-privacidad/', 'terminos-uso/']


def main():
    global TOTAL
    items, skipped = read_catalog()
    TOTAL = len(items)

    data = json.dumps(items, ensure_ascii=False, separators=(',', ':'))
    (ROOT / 'assets' / 'estudios-data.js').write_text(
        f'// Catálogo BIOS ({len(items)} estudios) — generado por scripts/build_estudios.py desde "{SOURCE.name}". No editar a mano.\n'
        f'window.BIOS_ESTUDIOS = {data};\n', encoding='utf-8')

    out = ROOT / 'estudios'
    for child in out.iterdir() if out.exists() else []:
        if child.is_dir():
            shutil.rmtree(child)
    out.mkdir(exist_ok=True)
    for item in items:
        same = [i for i in items if i['catLabel'] == item['catLabel'] and i is not item]
        same.sort(key=lambda i: (not i['top'], not i['alta'], abs((i['price'] or 0) - (item['price'] or 0))))
        page = out / item['s']
        page.mkdir()
        (page / 'index.html').write_text(study_page(item, same[:8]), encoding='utf-8')
    (out / 'index.html').write_text(directory_page(items), encoding='utf-8')

    today = date.today().isoformat()
    urls = [f'{SITE}/{p}' for p in STATIC_PAGES] + [f"{SITE}/estudios/{i['s']}/" for i in items]
    (ROOT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        ''.join(f'  <url><loc>{e(u)}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
    (ROOT / 'robots.txt').write_text(
        f'User-agent: *\nAllow: /\nDisallow: /agenda/\n\nSitemap: {SITE}/sitemap.xml\n', encoding='utf-8')

    # Versión del catálogo en las páginas que lo cargan, para que el navegador no use una copia vieja.
    stamp = date.today().strftime('%Y%m%d')
    for page in [ROOT / 'index.html', ROOT / 'assets' / 'site.js'] + [ROOT / d / 'index.html' for d in ('servicios', 'agenda', 'mujer')]:
        text = page.read_text(encoding='utf-8')
        page.write_text(re.sub(r'estudios-data\.js\?v=\d+', f'estudios-data.js?v={stamp}', text), encoding='utf-8')

    print(f'{len(items)} estudios publicados · {len(skipped)} omitidos (dados de baja):')
    for s in skipped:
        print('  -', s)


TOTAL = 0
if __name__ == '__main__':
    main()
