# PRIVÉ — Base Maestra · Lote 003

## Alcance

Este sprint incorpora **100 perfumes nuevos**: las posiciones 151 a 250 del catálogo operativo. Con los lotes anteriores, la Base Maestra alcanza **250 fichas activas**.

El Lote 003 permanece en estado interno `review` para permitir su validación en el Asesor PRIVÉ sin mostrar etiquetas técnicas al cliente.

## Metodología de identidad y fuentes

Fragrantica y Perfumoteca se mantienen como fuentes principales complementarias:

- **Fragrantica:** nombre correcto, versión o flanker e imagen de referencia.
- **Perfumoteca:** búsqueda exacta por la clave PRIVÉ y referencia olfativa utilizada para los pedidos del proveedor.
- **Glass Essence:** respaldo técnico por la misma clave cuando está disponible.
- **Catálogo operativo PRIVÉ:** clave, categoría e imagen local.

El nombre y la imagen identifican la versión exacta. La clave conecta la fragancia con la referencia olfativa del proveedor. Si las fuentes difieren, no se mezclan versiones ni se inventa información: la observación queda en el reporte interno de revisión.

## Edad orientativa

Los rangos de edad indican afinidad o tendencia, nunca una restricción. El Asesor PRIVÉ debe priorizar notas, gustos, ocasión, clima y la imagen que la persona quiere proyectar. También puede ofrecer alternativas más juveniles o más clásicas sin descalificar la primera elección.

## Archivos principales

- `data/core/catalog.json`: manifiesto con 250 fichas activas.
- `data/core/review-batch-003.csv`: control interno de revisión de las 100 fichas nuevas.
- `tools/build-master-batch-003.py`: generador reproducible del lote.
- `tools/test-master-batch-003.mjs`: prueba integral del lote.

## Validación

Antes de entregar se comprueban:

- 100 claves nuevas en el orden exacto del catálogo.
- 250 claves activas sin duplicados.
- nombre, diseñador y categoría idénticos al catálogo operativo.
- familia, acordes, pirámide olfativa, descripción y recomendaciones presentes.
- edad expresada como tendencia amable y no restrictiva.
- trazabilidad Fragrantica + Perfumoteca por clave en cada ficha nueva.
- reporte interno con 100 registros, sin exponer estados técnicos en la interfaz pública.
