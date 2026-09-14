# ✅ Checklist de producción — Laboratorios BIOS

Estado general del sistema y lo que falta para quedar 100% en vivo.

---

## Lo que ya está listo

- **Sitio de marketing** (raíz): 11 páginas, header/footer global unificado,
  responsive móvil/escritorio, animaciones, enlaces sin subrayado.
- **Favicon de marca** (`assets/favicon.svg` + PNG + `favicon.ico` + manifest):
  el símbolo BIOS sobre una pastilla azul, visible en pestañas claras y
  oscuras. Se regenera con `python3 tools/build_favicon.py`.
- **Buscador** (`assets/search.js`): varios términos a la vez, sinónimos de
  paciente, acentos, plurales y errores de dedo. Vive en el encabezado (y en
  el menú móvil), en la portada y en el catálogo, sobre los mismos datos.
- **Rastreo / Seguimiento:** sin datos de ejemplo. El folio conecta por
  WhatsApp con la sucursal y los resultados se consultan en el portal.
- **Backend Supabase** ("Bios Web"): tablas, RLS, storage privado y
  endurecimiento de seguridad ya aplicados.
- **Portal Next.js** (`bios-portal/`): compila limpio. Login y registro con
  email/contraseña funcionando.

---

## 1) Subir cambios y desplegar

1. `git push` (los commits ya están hechos en local).
   - El **sitio** se redespliega solo en Vercel (`biosweb.vercel.app`).
2. **Portal:** crear su proyecto Vercel siguiendo **[bios-portal/DEPLOY.md](bios-portal/DEPLOY.md)**
   - Root Directory = `bios-portal`, framework Next.js (lo detecta solo).
   - Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` (secreta), `NEXT_PUBLIC_SITE_URL`,
     `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false`.

## 2) Conectar el sitio con el portal

Cuando el portal tenga URL, actualízala en **un solo lugar**:
- `portal/index.html` → `window.PORTAL_URL = 'https://<tu-portal>'`

Esa constante alimenta los botones **Iniciar sesión / Crear cuenta / Mis
resultados** del sitio.

## 3) Catálogo de estudios

La fuente de verdad es **`estudios/Top 100 estudios.xlsx`**. Su columna
**Descripción** son los sinónimos con los que el paciente busca cada estudio
(«azúcar» para glucosa, «seno» para mastografía): entre más completa, mejor
encuentra el buscador.

Cuando cambie el Excel:

```bash
python3 tools/build_estudios.py     # regenera assets/estudios-data.js
```

Lo que **no** viene del Excel vive en las tablas de `tools/build_estudios.py`:
estudios destacados (`TOP`, `ALTA`), campaña de la mujer (`CAMPAIGN`),
sinónimos extra (`EXTRA_KEYWORDS`) y correcciones de categoría
(`CATEGORY_FIX`, hoy solo `GLU.S`, que en el Excel está como rayos X).

> Después de regenerar, sube el número de `?v=` de los `<script>`/`<link>`
> en los `.html` para romper la caché del navegador.

## 4) Datos de contacto reales

| Dato | Estado | Dónde cambiarlo |
|------|--------|-----------------|
| Facebook | ✅ Puesto (perfil real) | `assets/site.js` |
| WhatsApp / teléfono | ⚠️ Placeholder `5211234567890` | Buscar y reemplazar `5211234567890` en todo el repo cuando tengas el número real |
| Instagram / X | ➖ Removidos (no hay) | Agregar en `assets/site.js` (footer) cuando existan |
| Aviso de privacidad / Términos de uso | ✅ Publicados en `/aviso-privacidad/` y `/terminos-uso/`, enlazados en el footer | Confirmar razón social/RFC exactos y activar el correo `privacidad@bioslaboratorios.com` |

> Para cambiar el WhatsApp en todo el sitio de una vez:
> reemplaza la cadena `5211234567890` por tu número (formato internacional,
> sin signos: `52` + 10 dígitos) en todos los archivos `.html` y `.js`.

## 5) Supabase — configuración de Auth (tras desplegar el portal)

En **Authentication → URL Configuration**:
- **Site URL:** la URL del portal.
- **Redirect URLs:** `https://<tu-portal>/auth/callback`

**Primer admin/médico** (SQL Editor, tras registrarte):
```sql
update public.profiles set role = 'admin' where email = 'tu-correo@dominio.com';
```

## 6) Dominio propio (opcional, recomendado)

- Sitio: `laboratoriosbios.com` → proyecto Vercel `biosweb`.
- Portal: `portal.laboratoriosbios.com` → proyecto Vercel del portal.
  (Y actualizar `PORTAL_URL` y `NEXT_PUBLIC_SITE_URL` con ese dominio.)

## 7) Rendimiento (recomendado antes de mucho tráfico)

- El sitio usa **Tailwind por CDN** (cómodo, pero más lento y con un warning
  en consola). Para producción de alto tráfico conviene compilar Tailwind a un
  CSS estático. No es bloqueante: el sitio funciona bien así.

## 8) Antes de publicar — pruebas rápidas

- [ ] Logo e imágenes cargan en las 11 páginas.
- [ ] El intro/loader y el popup salen **solo en la primera visita** de la sesión.
- [ ] Botón "Consultar estado" abre WhatsApp con el número real.
- [ ] "Iniciar sesión / Crear cuenta" llevan al portal desplegado.
- [ ] Registro de un usuario de prueba en el portal funciona.
- [ ] Revisar móvil (iPhone/Android) y escritorio.
- [ ] Buscar «ultrasonido mama», «azúcar» y «papanicolau» (con falta de
      ortografía) y confirmar que devuelven lo esperado.
- [ ] Ver el favicon en una pestaña clara y en una oscura.

---

_Generado como parte de la preparación a producción. Cualquier "cosa de
ejemplo" (folios demo, datos simulados) ya fue retirada del sitio público._
