# PRIVÉ — Base Maestra · Lote 005

## Alcance

Este sprint incorpora **100 perfumes nuevos de Dama**, correspondientes a las posiciones 351 a 450 del catálogo operativo. La Base Maestra alcanza **450 fichas activas**.

El lote inicia con `DP02556 — GOOD GIRL VELVET FATALE` y termina con `DP02673 — FAME`. Todas las fichas permanecen en estado interno `review`; esta etiqueta no se muestra al público.

## Metodología

- **Catálogo operativo PRIVÉ:** clave, categoría, imagen local y orden.
- **Fragrantica:** nombre correcto, versión o flanker, identidad visual y contraste olfativo.
- **Perfumoteca:** búsqueda obligatoria por clave y referencia olfativa del producto manejado por el proveedor.
- **Sitio oficial de la marca:** contraste de lanzamiento, concentración y narrativa.
- **Glass Essence y otras fuentes especializadas/reseñas:** contraste técnico, desempeño, clima, ocasiones y percepción comunitaria.

Cuando una edición es reciente, descontinuada o tiene información limitada, la ficha conserva confianza `low` o `medium` y una nota de revisión. No se mezclan versiones ni se inventan datos.

## Archivos principales

- `data/core/catalog.json`: manifiesto con 450 fichas activas.
- `data/core/review-batch-005.csv`: control interno del lote.
- `tools/build-master-batch-005.py`: generador reproducible.
- `tools/test-master-batch-005.mjs`: prueba integral del lote.

## Validaciones ejecutadas

- 100 fichas nuevas y 450 activas.
- Orden exacto de las posiciones 351–450.
- Claves e IDs sin duplicados.
- Correspondencia con el catálogo operativo.
- Familias, acordes, notas y descripciones presentes.
- Edad orientativa y no restrictiva.
- Procedencia Fragrantica + Perfumoteca por clave + respaldo técnico.
- Adaptador Core funcionando con las 450 fichas.
