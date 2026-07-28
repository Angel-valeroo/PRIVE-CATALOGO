# PRIVÉ v1.3.8 — Adaptador Core → Catálogo

Este sprint conecta por primera vez **PRIVÉ Core Database** con el catálogo público sin retirar todavía `data/perfumes.json`.

## Qué cambia

- `core-adapter.js` transforma una ficha Core al formato que consume `app.js`.
- `data/core/catalog.json` funciona como manifiesto de fichas Core activas.
- `app.js` carga en paralelo el catálogo heredado y las fichas Core.
- Cuando una ficha Core comparte la misma clave PRIVÉ con un registro heredado, **Core reemplaza sus datos** sin duplicar la fragancia.
- Si Core no puede cargarse, el catálogo heredado continúa funcionando como respaldo.

## Prueba piloto

`Afnan 9PM · CP02446` se carga desde `data/core/perfume.example.json` y debe conservar:

- imagen y ficha de catálogo;
- filtros de diseñador, familia y etiquetas;
- coincidencias del Asesor Inteligente para Caballero, Noche/Cita/Fiesta/Evento, Dulce/Especiado/Afrutado y clima Frío/Templado.

## Cómo agregar otra ficha Core

1. Crear el archivo JSON dentro de `data/core/`.
2. Validarlo con `node tools/validate-core.mjs ruta-del-archivo.json`.
3. Añadir el nombre del archivo a la lista `perfumes` de `data/core/catalog.json`.

No es necesario editar `app.js` para cada nueva fragancia.
