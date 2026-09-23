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

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 + SQLite · GSAP · sharp.

## Puesta en marcha

```bash
npm install
cp .env.example .env     # y cambia ADMIN_PASSWORD y AUTH_SECRET
npm run setup            # crea la base de datos y carga datos de ejemplo (placeholders)
npm run dev              # http://localhost:3000
```

Panel: http://localhost:3000/admin (contraseña por defecto en `.env`: `admin123`).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Ruta del SQLite. Por defecto `file:../data/db.sqlite` (relativa a `prisma/`). |
| `ADMIN_PASSWORD` | Contraseña del panel. |
| `AUTH_SECRET` | Cadena larga aleatoria para firmar la cookie de sesión. |
| `UPLOAD_DIR` | Carpeta donde se guardan las fotos subidas. Por defecto `./data/uploads`. |

## Datos y fotos

- La base de datos y las fotos subidas viven en `data/` (ignorada por git). Haz copia de esa carpeta para respaldar el sitio.
- Las fotos subidas se redimensionan a máximo 2400px y se convierten a WebP.
- Se sirven desde `/media/<archivo>` mediante un route handler, por lo que funcionan también en producción sin reconstruir.
- Los datos de ejemplo usan imágenes de `picsum.photos`. Al subir fotos reales, borra las de ejemplo desde el panel.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` / `npm start` | Build y servidor de producción. |
| `npm run db:push` | Crea o actualiza las tablas según `prisma/schema.prisma`. |
| `npm run db:seed` | Carga los datos de ejemplo. |
| `npm run db:studio` | Abre Prisma Studio para ver la base de datos. |

## Estructura

```
prisma/            esquema y seed
src/app/           páginas (home, galería, admin, api/upload, media)
src/components/    site/ (público) y admin/ (panel)
src/lib/           prisma, auth, media, data, gsap
src/proxy.ts       protege /admin
data/              db.sqlite y uploads (no versionado)
```

## Despliegue

Necesita un servidor Node con disco persistente (VPS, Railway, Render, Fly.io…) porque usa SQLite y guarda las fotos en disco. En plataformas sin disco persistente (Vercel) habría que cambiar SQLite por Postgres y los uploads por un bucket (S3, R2, Vercel Blob).
