# Sprint v1.3.9.1 — Limpieza de identidad y versión

## Objetivo

Estabilizar la identidad del catálogo antes de iniciar la migración masiva a PRIVÉ Core Database.

## Cambios

1. La etiqueta visible del encabezado ahora muestra `V1.3.9.1 EXPERIMENTAL`.
2. Se resolvieron dos duplicados históricos del catálogo:
   - `CP00850`: **HUGO MAN** queda como registro canónico; **HUGO** se elimina por ser el mismo producto con el mismo código.
   - `CP01079`: **HALLOWEEN · HALLOWEEN MAN** queda como registro canónico; la copia bajo **JESUS DEL POZO** se elimina.
3. Se agregó `tools/test-identity.mjs`, que falla cuando encuentra:
   - códigos PRIVÉ repetidos;
   - identificadores `id` repetidos;
   - códigos Core repetidos;
   - colisiones entre fichas Core.
4. El README principal fue actualizado al estado real del proyecto.

## Resultado esperado

- 323 registros heredados únicos.
- 6 fichas Core activas.
- Sin códigos ni IDs duplicados.
- El adaptador mantiene el mismo comportamiento para las fragancias migradas.
