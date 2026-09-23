# WebFotografo

Sitio web editorial para fotógrafo de bodas, inspirado en daniloandsharon.com, con panel de administración para gestionar textos y fotos.

## Características

**Sitio público**
- Hero a pantalla completa con foto y título en tres líneas (serif cursiva / sans mayúsculas / serif cursiva).
- Popup de "Reservas" que aparece tras unos segundos (configurable y desactivable).
- Botón MENU que despliega un menú a pantalla completa desde arriba; al pasar el mouse por cada sección cambia la foto central.
- Sección de historias con scroll horizontal ("Bodas reales"): al hacer scroll vertical la fila de historias se desplaza en horizontal (GSAP ScrollTrigger). Cada historia es una boda con su propia galería. En móvil se muestran en vertical.
- Sección con fotos en vertical dentro de la home ("Portafolio").
- Tarjetas para el resto de galerías, bloque "Sobre nosotros", formulario de contacto y footer.
- Página propia por galería e historia en `/galeria/<slug>` con cuadrícula masonry.

**Tipos de sección (se eligen en el panel)**
- `stories`: historias con scroll horizontal. Contiene sub-galerías (una por boda), cada una con su página.
- `vertical`: muestra sus fotos en una cuadrícula dentro de la home, con enlace a la galería completa.
- `card`: solo una tarjeta en la home que lleva a su página.

**Panel de administración (`/admin`)**
- Login por contraseña (variable `ADMIN_PASSWORD`).
- Ajustes y textos: nombre, hero, cita, popup de reservas, sobre nosotros, contacto, foto del hero y de "sobre nosotros".
- Secciones: crear, editar, ordenar, ocultar del menú o de la home, elegir presentación (historias, vertical o tarjeta), borrar.
- Historias: dentro de una sección de tipo historias se crean las bodas (nombre de la pareja y lugar), se ordenan y cada una tiene sus propias fotos.
- Fotos por sección: subida múltiple con arrastrar y soltar, reordenar (arrastrar o flechas), foto de portada para el menú, descripción, borrar.
- Mensajes recibidos desde el formulario de contacto.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 + Postgres · Vercel Blob (fotos) · GSAP · sharp.

## Puesta en marcha

Necesitas una base de datos Postgres. La opción más simple es crear una gratis en [Neon](https://neon.tech) y copiar su cadena de conexión.

```bash
npm install
cp .env.example .env     # pon tu DATABASE_URL y cambia ADMIN_PASSWORD y AUTH_SECRET
npm run setup            # crea las tablas y carga datos de ejemplo (placeholders)
npm run dev              # http://localhost:3000
```

Panel: http://localhost:3000/admin (contraseña por defecto en `.env`: `admin123`).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres. |
| `ADMIN_PASSWORD` | Contraseña del panel. |
| `AUTH_SECRET` | Cadena larga aleatoria para firmar la cookie de sesión. |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob. Si existe, las fotos se guardan en Blob; si no, en disco local. |
| `UPLOAD_DIR` | Carpeta local para fotos cuando no hay Blob. Por defecto `./data/uploads`. |

## Datos y fotos

- Las fotos se reducen en el navegador (máx. 2400px) antes de subirse, y en el servidor se convierten a WebP.
- En Vercel se guardan en Vercel Blob con URL pública. En local se guardan en `data/uploads` y se sirven por `/media/<archivo>`.
- Los datos de ejemplo usan imágenes de `picsum.photos`. El seed solo se ejecuta si la base está vacía (`npm run db:seed:force` para forzarlo).

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` / `npm start` | Build y servidor de producción. |
| `npm run db:push` | Crea o actualiza las tablas según `prisma/schema.prisma`. |
| `npm run db:seed` | Carga los datos de ejemplo si la base está vacía. |
| `npm run db:studio` | Abre Prisma Studio para ver la base de datos. |
| `npm run vercel-build` | Lo que ejecuta Vercel: genera Prisma, aplica el esquema, siembra si hace falta y construye. |

## Estructura

```
prisma/            esquema y seed
src/app/           páginas (home, galería, admin, api/upload, media)
src/components/    site/ (público) y admin/ (panel)
src/lib/           prisma, auth, media, data, gsap
src/proxy.ts       protege /admin
data/              fotos subidas en local (no versionado)
```

## Despliegue en Vercel

1. En [vercel.com/new](https://vercel.com/new) importa el repositorio `gadiedcarrero/fotolachy`. Deja el framework en Next.js.
2. Antes de desplegar, en **Storage** del proyecto:
   - **Create Database → Neon (Postgres)**. Vercel añade `DATABASE_URL` sola.
   - **Create → Blob**. Vercel añade `BLOB_READ_WRITE_TOKEN` sola.
3. En **Settings → Environment Variables** añade `ADMIN_PASSWORD` y `AUTH_SECRET` (una cadena larga aleatoria).
4. Despliega. El build ejecuta `vercel-build`: crea las tablas y carga los datos de ejemplo la primera vez.
5. Entra en `https://<tu-proyecto>.vercel.app/admin` con la contraseña y sube las fotos reales.

Cada `git push` a `main` vuelve a desplegar automáticamente.
