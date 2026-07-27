# PRIVÉ v1.3.7 — Core Database

Este sprint define el contrato de datos que alimentará al catálogo, al Asesor Inteligente y a futuras funciones.

## Principios

1. **Datos separados de la lógica.** La ficha describe la fragancia; el algoritmo decide cómo interpretarla.
2. **Sin datos inventados.** Lo desconocido se representa con `null`, listas vacías o `Desconocida`.
3. **Taxonomía controlada.** Ocasiones, climas, estaciones y escalas usan valores consistentes.
4. **Trazabilidad.** Cada ficha registra fuentes, fecha de revisión, responsable y nivel de confianza.
5. **Compatibilidad progresiva.** El catálogo actual continúa usando `data/perfumes.json`; la migración se hará por lotes.

## Archivos

- `data/core/prive-core.schema.json`: contrato formal de la ficha maestra.
- `data/core/catalog-taxonomy.json`: vocabulario autorizado.
- `data/core/perfume.example.json`: primera ficha completa de ejemplo.
- `data/core/legacy-field-map.json`: equivalencias con el JSON actual.
- `tools/validate-core.mjs`: comprobación básica con Node.js, sin dependencias.

## Estrategia de migración

### Etapa 1 — aprobada en este paquete
Definir estructura, vocabulario, ejemplo y reglas de calidad. No se modifica el catálogo público.

### Etapa 2
Crear un adaptador que transforme una ficha Core al formato que consume `app.js`. Así podremos migrar sin romper la interfaz.

### Etapa 3
Migrar un lote piloto de 10 fragancias y comparar resultados del asesor.

### Etapa 4
Migrar el catálogo completo y hacer que el asesor lea Core de manera nativa.

## Regla de calidad

Una fragancia solo debe pasar a `verified` cuando los campos relevantes tengan respaldo y la revisión esté registrada. Hasta entonces debe permanecer como `draft` o `review`.

## Validación rápida

Desde la raíz del proyecto:

```bash
node tools/validate-core.mjs data/core/perfume.example.json
```
