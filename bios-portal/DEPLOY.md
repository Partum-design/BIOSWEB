# Despliegue del Portal BIOS (Next.js) en Vercel

El **sitio de marketing** (raíz del repo) y el **portal** (`bios-portal/`) son
dos despliegues distintos sobre el **mismo repositorio de GitHub**:

| App | Carpeta | Proyecto Vercel | Framework |
|-----|---------|-----------------|-----------|
| Sitio público | raíz `/` | `biosweb` (ya existe) | Other (estático) |
| Portal médico | `/bios-portal` | **nuevo** (a crear) | Next.js |

> Por eso tu proyecto actual aparece como **"Other"**: sirve el HTML estático
> de la raíz. El portal NO se despliega ahí — necesita su **propio proyecto**
> con *Root Directory = `bios-portal`*, donde Vercel detecta Next.js solo.

## Pasos (una sola vez)

1. **Sube los commits** locales a GitHub (`git push`). El portal necesita el
   commit con `next.config.mjs` (Next 14 no soporta `next.config.ts`).
2. En Vercel → **Add New… → Project** → importa `Partum-design/BIOSWEB`.
3. **Root Directory:** selecciona `bios-portal`. Vercel detecta **Next.js**
   automáticamente (build `next build`, no toques nada).
4. **Environment Variables** (Production + Preview):

   ```
   NEXT_PUBLIC_SUPABASE_URL       = https://qtepszsfemehibgovxtr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = (Supabase → Project Settings → API → anon public)
   SUPABASE_SERVICE_ROLE_KEY      = (Supabase → Project Settings → API → service_role — ¡secreta!)
   NEXT_PUBLIC_SITE_URL           = https://<tu-portal>.vercel.app
   NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = false
   ```

   - La **anon key** es pública (segura en el cliente).
   - La **service_role key** es secreta: solo se usa server-side (subir
     resultados, links firmados, auditoría). Nunca la pongas en el sitio.
   - Pon `NEXT_PUBLIC_SITE_URL` con la URL final del portal (puedes
     desplegar una vez, copiar la URL y volver a guardarla).

5. **Deploy.**

## Configuración en Supabase (después del primer deploy)

En **Supabase → Authentication → URL Configuration**:
- **Site URL:** `https://<tu-portal>.vercel.app`
- **Redirect URLs:** agrega `https://<tu-portal>.vercel.app/auth/callback`

Para registro inmediato sin confirmación de correo (opcional, solo pruebas):
**Authentication → Providers → Email** → desactiva *Confirm email*.

## Crear el primer médico / admin

El registro siempre crea usuarios con rol `patient` (por seguridad). Para
elevar a `doctor` o `admin`, corre en Supabase (SQL Editor) tras registrarte:

```sql
update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
```

(Para un médico además inserta su fila en `public.doctors`.)

## Activar Google / CAPTCHA más adelante

- **Google:** crea un OAuth Client en Google Cloud, pégalo en
  Supabase → Auth → Providers → Google, y pon `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`.
- **CAPTCHA (Turnstile):** llaves de Cloudflare → Supabase → Auth → Settings.
