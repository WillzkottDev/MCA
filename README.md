# MCA · Directorio de Misioneros — Cloudflare

Contenido:
- `index.html`: página completa con los 344 misioneros, buscador por nombre, bloqueo con contraseña `MCA`, logo/marca de agua y campos editables.
- `logo-mca.webp`: logo optimizado para web.
- `functions/api/contacts.js`: función opcional de Cloudflare Pages para guardar los datos de todos en una base D1 compartida.
- `schema.sql`: esquema de la tabla D1 (la función también intenta crearla automáticamente).

## Opción rápida: solo página estática
Sube `index.html` y `logo-mca.webp` a Cloudflare Pages. La página funciona inmediatamente. Los datos que cada persona escriba se guardarán en el `localStorage` de su propio navegador.

## Opción recomendada: datos compartidos con Cloudflare D1
1. Crea un proyecto de Cloudflare Pages usando esta carpeta/proyecto, de modo que se despliegue también `functions/api/contacts.js`.
2. Crea una base D1.
3. En **Settings > Functions > D1 database bindings**, agrega un binding llamado exactamente `DB`.
4. Opcional: ejecuta `schema.sql`. La función también crea la tabla si aún no existe.
5. En variables/secretos del proyecto agrega `MCA_PASSWORD` con valor `MCA`.
6. Vuelve a desplegar.

La interfaz detecta automáticamente si D1 está disponible. Verás `Cloudflare D1` arriba cuando los datos se estén guardando de forma compartida; si no, mostrará `Guardado local`.

> Nota: el bloqueo visual de la página usa `MCA`. Para protección realmente privada del contenido completo conviene usar Cloudflare Access delante del sitio. La función de guardado sí valida la contraseña en servidor.
