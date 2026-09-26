# MCA · Cloudflare Worker + D1

Este proyecto está preparado para el Worker existente `mca` (`mca.will-010.workers.dev`).

## Estructura

- `src/index.js`: API Worker (`/api/health`, `/api/contacts`, `/api/missionaries`).
- `public/index.html`: directorio de misioneros.
- `public/logo-mca.webp`: logo y marca de agua.
- `wrangler.jsonc`: Worker, Static Assets y binding D1 `DB`.
- `schema.sql`: referencia del esquema; el Worker crea las tablas automáticamente si no existen.

## D1 incluido

- Binding: `DB`
- Database: `mca-directorio`
- Database ID: `9f6276fa-516e-4e01-b629-afaa65a31520`

## Desplegar al Worker existente

Desde esta carpeta:

```powershell
npx wrangler login
npx wrangler deploy
```

No uses `wrangler pages deploy`: este proyecto es Workers, no Pages.

La URL seguirá siendo `https://mca.will-010.workers.dev/` siempre que tu cuenta tenga ese subdominio y el Worker se llame `mca`.

## Contraseña

El código acepta `MCA` como valor de respaldo. Si ya tienes el secret `MCA_PASSWORD`, se utilizará ese valor. Para fijarlo desde Wrangler:

```powershell
npx wrangler secret put MCA_PASSWORD
```

Cuando pregunte el valor, escribe `MCA`.

## Probar D1

Después del deploy entra al sitio, escribe `MCA`, y el indicador superior debe mostrar `Cloudflare D1 · conectado`.
