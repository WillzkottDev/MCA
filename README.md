# MCA · Directorio de Misioneros — Cloudflare D1

Esta versión usa **Cloudflare D1 exclusivamente**. Ya no utiliza `localStorage` como respaldo.

## Incluye
- `index.html`: directorio completo de 344 misioneros.
- `logo-mca.webp`: logo y marca de agua.
- `functions/api/contacts.js`: API de Cloudflare Pages para leer/guardar datos.
- `schema.sql`: tabla `contacts`.
- `wrangler.toml`: binding `DB` configurado para la base D1 indicada.

## Base D1 configurada
- Binding: `DB`
- Database name: `mca-directorio`
- Database ID: `9f6276fa-516e-4e01-b629-afaa65a31520`

## Variable recomendada
En Cloudflare, deja la variable/secret del proyecto:

`MCA_PASSWORD = MCA`

La función usa `MCA` como respaldo si esa variable no existe, pero es preferible mantenerla como secret.

## Despliegue
Desde esta carpeta:

```powershell
npx wrangler pages deploy .
```

Si tu proyecto de Pages tiene otro nombre distinto de `mca-antofagasta`, ajusta `name` en `wrangler.toml` antes de desplegar.

Al abrir la página, arriba debe aparecer **Cloudflare D1 · conectado**. Si aparece **D1 · sin conexión**, revisa el binding `DB` y vuelve a desplegar.
