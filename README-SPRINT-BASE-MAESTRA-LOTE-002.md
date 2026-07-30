# PRIVÉ — Base Maestra · Lote 002

## Alcance

Este sprint incorpora **100 perfumes nuevos**: las posiciones 51 a 150 del catálogo operativo. Con el Lote 001, la Base Maestra tiene ahora **150 fichas activas**.

El Lote 002 permanece en estado `review`. La activación permite probarlo en el Asesor PRIVÉ sin presentar la investigación como definitivamente verificada.

## Regla de fuentes

Fragrantica y Perfumoteca se consideran fuentes principales complementarias:

- **Fragrantica:** nombre correcto, versión/flanker e imagen de referencia.
- **Perfumoteca:** búsqueda por clave PRIVÉ y referencia de notas empleada por el proveedor y los pedidos.
- **Catálogo operativo PRIVÉ:** clave, categoría e imagen local.

Cuando existe una diferencia, no se mezclan versiones ni se inventan datos. La ficha queda marcada para revisión.

## Edad orientativa

Los rangos de edad expresan afinidad o tendencia, nunca una restricción. El Asesor PRIVÉ debe priorizar notas, gusto, ocasión, clima e imagen deseada; además puede proponer una alternativa más juvenil o clásica sin descalificar la elección original.

## Archivos principales

- `data/core/catalog.json`: manifiesto con 150 fichas activas.
- `data/core/review-batch-002.csv`: control de revisión de las 100 nuevas fichas.
- `tools/build-master-batch-002.py`: generador reproducible.
- `tools/test-master-batch-002.mjs`: prueba integral del lote.

## Validación

Antes de entregar se comprueban:

- 100 claves nuevas en el orden exacto del catálogo.
- 150 claves activas sin duplicados.
- nombre, diseñador y categoría idénticos al catálogo operativo.
- notas, familia, acordes, descripción, recomendaciones y edad no restrictiva.
- procedencia dual Fragrantica + Perfumoteca en cada ficha del Lote 002.
