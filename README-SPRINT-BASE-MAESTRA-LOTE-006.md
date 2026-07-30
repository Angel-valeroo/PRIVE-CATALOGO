# PRIVÉ — Base Maestra · Lote 006

## Alcance

Este sprint incorpora las **97 fragancias restantes**, correspondientes a las posiciones **451 a 547** del catálogo operativo. La Base Maestra alcanza **547 fichas activas**, con lo que se cierra la fase inicial de integración total del catálogo vigente.

El lote inicia con `DP02868 — FAME COUTURE` y termina con `UP01129 — ERBA PURA`. Incluye 54 perfumes de Dama y 43 Unisex. Todas las fichas permanecen en estado interno `review`; esta etiqueta no se muestra al público.

## Metodología

- **Catálogo operativo PRIVÉ:** clave, categoría, imagen local y orden.
- **Fragrantica:** nombre correcto, versión o flanker, identidad visual y contraste olfativo.
- **Perfumoteca:** búsqueda obligatoria por clave y referencia olfativa del producto manejado por el proveedor.
- **Sitio oficial de cada marca:** contraste de lanzamiento, concentración, narrativa y notas cuando están disponibles.
- **Glass Essence:** respaldo técnico por clave.
- **Fuentes especializadas y reseñas:** contraste de desempeño, clima, ocasiones y percepción comunitaria.

Las ediciones recientes, descontinuadas o con poca documentación pública conservan confianza `low` o `medium` y una nota interna específica. No se mezclan versiones ni se completan datos sin señalarlos como revisión.

## Archivos principales

- `data/core/catalog.json`: manifiesto con 547 fichas activas.
- `data/core/review-batch-006.csv`: control interno de las 97 fichas.
- `tools/build-master-batch-006.py`: generador reproducible.
- `tools/test-master-batch-006.mjs`: prueba integral del lote.

## Validaciones ejecutadas

- 97 fichas nuevas y 547 activas.
- Orden exacto de las posiciones 451–547.
- Claves e IDs sin duplicados.
- Correspondencia con el catálogo operativo.
- Familias, acordes, notas y descripciones presentes.
- Edad orientativa y no restrictiva.
- Procedencia con Fragrantica, Perfumoteca por clave, sitio oficial, Glass Essence y fuentes especializadas.
- Adaptador Core funcionando con las 547 fichas.

## Cierre de fase

La Base Maestra ya cubre el catálogo operativo completo de 547 productos. El cierre definitivo de la fase depende de la prueba del propietario en GitHub y en el entorno real del catálogo.
