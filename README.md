# MCA Directorio — ruta corregida

Esta versión elimina la confusión entre `src/`, `dist/` e `index.html`.

## Archivo que Cloudflare publica
`public/index.html`

## Configuración en Cloudflare Pages
- Framework preset: None
- Build command: dejar vacío
- Build output directory: `public`
- Root directory: dejar vacío
- Production branch: la rama que uses (normalmente `main`)

## Importante
Mantén el binding D1 existente con nombre `DB`.
No borres ni recrees la base de datos.

El frontend ya incluye:
- pantalla de contraseña
- contador hasta el 27/09/2026 19:00 Chile
- microsegundos visuales
- estilo azul neón
- enlace Zoom
- directorio completo
- conexión a `/api/contacts`
