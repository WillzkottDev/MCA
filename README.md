# MCA · Directorio de Misioneros — Cloudflare D1

Esta versión usa **Cloudflare D1 exclusivamente**. No utiliza `localStorage` como respaldo.

## Incluye
- `index.html`: directorio base de 344 misioneros, buscador, datos de contacto y formulario para agregar misioneros faltantes.
- `logo-mca.webp`: logo y marca de agua.
- `functions/api/contacts.js`: API para leer/guardar correo, teléfono, Facebook/Instagram y comentario.
- `functions/api/missionaries.js`: API para listar y agregar misioneros manualmente.
- `schema.sql`: tablas `contacts` y `manual_missionaries`.
- `wrangler.toml`: binding `DB` configurado para la base D1 indicada.

## Base D1 configurada
- Binding: `DB`
- Database name: `mca-directorio`
- Database ID: `9f6276fa-516e-4e01-b629-afaa65a31520`

## Variable recomendada
En Cloudflare, mantén la variable/secret del proyecto:

`MCA_PASSWORD = MCA`

## Cómo funciona “Agregar misionero”
En la parte superior del directorio aparece **＋ Agregar misionero**. El formulario pide nombre, país y año como campos obligatorios, y permite ingresar también correo, teléfono, Facebook/Instagram y un saludo.

Los registros nuevos quedan en la tabla D1 `manual_missionaries` y aparecen automáticamente mezclados con los 344 registros base. Sus datos de contacto quedan en `contacts`.

No necesitas ejecutar `schema.sql` manualmente si ya tienes la base: las Functions crean las tablas que falten al primer uso.

## Despliegue
Desde esta carpeta:

```powershell
npx wrangler pages deploy .
```

Después abre la página. Arriba debe aparecer **Cloudflare D1 · conectado**.
