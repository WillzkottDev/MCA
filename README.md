# MCA Directorio — rescate + agregar misionero manual

Esta versión conserva el frontend estable y vuelve a incluir **Agregar misionero**.

## Publicación
Se incluye el mismo HTML en:
- `/index.html`
- `/public/index.html`
- `/src/index.html`

## Agregar misionero
Dentro del directorio aparece el botón **＋ Agregar misionero**.

Campos:
- Nombre
- País
- Año

Si Cloudflare D1 está disponible con binding `DB`, los misioneros agregados se guardan
en una tabla independiente llamada `manual_missionaries`, creada automáticamente.
No es necesario ejecutar migraciones SQL.

Si D1 falla, el registro queda como respaldo en `localStorage` del navegador.

## Importante
No borra ni modifica los 344 misioneros originales ni la tabla de contactos.
Los IDs de misioneros agregados manualmente parten desde 1000 para evitar colisiones.


## Cambio de esta versión
Se eliminó completamente el contador y el bloque del evento/Zoom de la pantalla de acceso.
