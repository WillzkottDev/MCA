# MCA · Directorio de Misioneros

Repositorio completo para Cloudflare Pages.

## Estructura

- `src/index.html` — página principal del directorio.
- `scripts/build.mjs` — copia el HTML a `dist/index.html` durante el build.
- `functions/api/contacts.js` — API `/api/contacts` para Cloudflare Pages + D1.
- `schema.sql` — esquema compatible para contactos.
- `wrangler.toml` — configuración base de Pages.

## Configuración en Cloudflare Pages

Usa estos valores:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (vacío / raíz del repositorio)

Esto evita la confusión de editar `src/index.html` sin que Cloudflare publique ese archivo: cada build lo copia obligatoriamente a `dist/index.html`.

## D1

Conserva la base D1 que ya utilizabas. En Cloudflare Pages debe existir un binding:

- Variable: `DB`
- Base: tu D1 actual del directorio

No borres ni recrees tu D1 si ya contiene los datos de los misioneros.

La Function es compatible con tablas llamadas `contacts` o `missionary_contacts`.

## Contraseña

Para máxima compatibilidad, si no configuras ninguna variable la API acepta `MCA`, igual que el HTML actual.

Recomendado: crea una variable/secreto `MCA_PASSWORD` con valor `MCA` (o la contraseña que quieras usar). Si cambias ese valor, también debes cambiar `const PASSWORD='MCA';` dentro de `src/index.html`.

## Subir a GitHub

Puedes reemplazar el contenido del repositorio por esta carpeta completa y hacer commit a la rama que Cloudflare tenga conectada (normalmente `main`).

Después revisa Cloudflare Pages → Deployments. El nuevo deployment debe mostrar que ejecutó:

`npm run build`

Y en el log debe aparecer:

`Build OK: src/index.html -> dist/index.html`

## Contador

El acceso incluye el contador hacia el 27-09-2026 a las 19:00 (UTC-3), enlace directo a Zoom y estilo azul neón.

Los seis dígitos fraccionarios se muestran con apariencia de microsegundos. En un navegador la actualización visual real está limitada por la frecuencia de refresco de la pantalla y `requestAnimationFrame`, por lo que no representa precisión física de microsegundos.
