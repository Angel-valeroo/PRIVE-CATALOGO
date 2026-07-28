# PRIVÉ v1.3.9 — Primera migración al Core

Esta versión migra el primer lote real de fragancias a **PRIVÉ Core Database**.

## Fragancias migradas

- Afnan 9PM — CP02446
- Afnan Turathi Blue — CP02518
- Armaf Club de Nuit Intense Man — CP02438
- Armani Aqua di Gio — CP00725
- Armani Aqua di Gio Parfum — CP02414
- Armani Aqua di Gio Profondo — CP02310

## Qué cambió

- Cada fragancia migrada tiene una ficha independiente en `data/core/`.
- `data/core/catalog.json` registra las seis fichas activas.
- Los datos enriquecidos de esas fragancias se eliminaron de `data/perfumes.json` para evitar dos fuentes de verdad.
- El JSON heredado conserva identidad básica y funciona como respaldo para las fragancias todavía no migradas.
- El adaptador sigue fusionando Core y catálogo heredado sin duplicados.

## Validación

Ejecuta:

```bash
node tools/test-core-adapter.mjs
```

El resultado esperado confirma que las seis fragancias se sirven desde Core, mantienen sus datos para filtros y asesor, y no siguen duplicadas en el formato heredado.

## Próximo paso recomendado

Migrar el catálogo en lotes pequeños y enriquecer únicamente datos respaldados por fuentes verificadas. No conviene convertir automáticamente los 325 registros mientras la mayoría solo contiene identidad básica.
