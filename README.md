# PRIVÉ Catálogo — v2.0

Catálogo web oficial de fragancias PRIVÉ, sincronizado con el Excel operativo normalizado.

## Catálogo actual

- 547 fragancias en total.
- 305 Caballero.
- 199 Dama.
- 43 Unisex.
- Sin claves ni identificadores duplicados.
- 250 fragancias activas en la Base Maestra PRIVÉ (Lotes 001–003, estado interno de revisión).

## Fuentes de identidad

El archivo `data/perfumes.json` se genera desde el Excel operativo. El Excel es la fuente oficial para:

- diseñador;
- nombre de la fragancia;
- clave PRIVÉ;
- categoría.

Las fichas de `data/core/` enriquecen únicamente los campos olfativos y de recomendación. No sobrescriben la identidad del Excel. La regla general es crecer en lotes de 50 fragancias; los lotes 002 y 003 fueron ampliaciones autorizadas de 100. Cada lote se valida antes de activar el siguiente.

La edad se maneja como una tendencia orientativa, secundaria y no restrictiva. Nunca sustituye los gustos, la ocasión ni el estilo que la persona desea proyectar.

## Imágenes

Las imágenes se organizan por categoría y clave:

```text
IMAGES/Caballero/CP00000.avif
IMAGES/Dama/DP00000.avif
IMAGES/Unisex/UP00000.avif
```

El sitio también intenta cargar `webp`, `jpg`, `jpeg` y `png` si no encuentra AVIF.

## Actualizar el catálogo

```bash
python generar_catalogo.py "CATALOGO WEB.xlsx" data/perfumes.json
```

Solo se importan filas que tengan diseñador, perfume y clave.

## Validación local

```bash
node tools/test-identity.mjs
node tools/test-core-adapter.mjs
node tools/test-master-batch.mjs
node tools/test-master-batch-002.mjs
node tools/test-master-batch-003.mjs
```

## Publicación

Sube el contenido de esta carpeta a la raíz del repositorio de GitHub Pages, reemplazando los archivos existentes.
