# MCA Directorio — versión de rescate

Esta versión vuelve al frontend que ya funcionaba y evita depender de una sola ruta.

El mismo `index.html` está duplicado en:
- `/index.html`
- `/public/index.html`
- `/src/index.html`

Así, si tu proyecto actual sigue apuntando a `src`, no queda en blanco.
También funciona si Cloudflare está configurado para publicar `public`.

## Recomendación inmediata

Si antes te funcionaba con `src/index.html`, NO cambies todavía la configuración de Cloudflare.
Sube este repositorio completo y deja el proyecto apuntando igual que antes.

## Importante

Esta versión NO migra nombres a D1 todavía. Primero recuperamos el sitio estable.
El apellido de Lisandro ya quedó corregido como `Reviriego, Lisandro`.
Los datos de contacto siguen usando `/api/contacts` como antes.
