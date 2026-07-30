# PRIVÉ — Base Maestra · Lote 004

## Alcance

Este sprint incorpora **100 perfumes nuevos**: las posiciones 251 a 350 del catálogo operativo. La Base Maestra alcanza **350 fichas activas**.

Las fichas del Lote 004 permanecen en estado interno `review` para validar su comportamiento en el Asesor PRIVÉ sin mostrar etiquetas técnicas al cliente.

## Metodología

- **Fragrantica:** nombre correcto, versión o flanker, imagen de referencia y contraste olfativo.
- **Perfumoteca:** búsqueda exacta por la clave PRIVÉ y referencia olfativa asociada a los pedidos del proveedor.
- **Catálogo operativo PRIVÉ:** clave, categoría e imagen local.

El nombre y la imagen fijan la identidad. La clave enlaza la referencia del proveedor. Ante diferencias, no se mezclan versiones ni se inventan datos: el registro queda en revisión interna.

## Edad orientativa

La edad se presenta como tendencia de afinidad y nunca como restricción. El Asesor prioriza notas, gustos, ocasión, clima y la imagen que la persona desea proyectar.

## Archivos principales

- `data/core/catalog.json`: manifiesto con 350 fichas activas.
- `data/core/review-batch-004.csv`: control interno del lote.
- `tools/build-master-batch-004.py`: generador reproducible.
- `tools/test-master-batch-004.mjs`: prueba integral.
