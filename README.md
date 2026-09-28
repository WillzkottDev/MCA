# MCA Directorio · versión D1 completa

Esta versión usa `public/index.html` como frontend publicado y D1 como fuente principal
de los nombres, país, año y datos de contacto.

## Cloudflare Pages

- Framework preset: None
- Build command: dejar vacío
- Build output directory: `public`
- Root directory: dejar vacío
- Binding D1: `DB` apuntando a TU BASE ACTUAL

## Paso obligatorio una sola vez

En Cloudflare → D1 → tu base → Console, ejecuta el archivo:

`migration.sql`

Ese script:
1. crea `missionaries` si no existe;
2. conserva la tabla `contacts`;
3. carga/actualiza los 344 misioneros;
4. deja el ID 244 como `Reviriego, Lisandro`;
5. NO elimina los contactos existentes.

También puedes ejecutarlo con Wrangler:

`npx wrangler d1 execute NOMBRE_DE_TU_DB --remote --file=./migration.sql`

## Cambiar un nombre después

Ejemplo:

```sql
UPDATE missionaries
SET name = 'Reviriego, Lisandro',
    updated_at = datetime('now')
WHERE id = 244;
```

Al recargar la web, el cambio se verá sin modificar el HTML.

## Estructura

- `public/index.html` → web publicada
- `functions/api/contacts.js` → lectura de misioneros + contactos y guardado de contactos
- `schema.sql` → tablas
- `seed_missionaries.sql` → 344 misioneros
- `migration.sql` → schema + carga completa en un solo archivo
