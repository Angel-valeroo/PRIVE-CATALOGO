# Base Maestra PRIVÉ — Lote 001

## Alcance

Este lote activa las primeras **50 fragancias** de la Base Maestra PRIVÉ. Todas corresponden a los primeros 50 registros del catálogo operativo y permanecen en estado `review` hasta completar la validación comercial y olfativa.

## Información incorporada

Cada ficha contiene:

- identidad vinculada por clave PRIVÉ;
- familia y acordes olfativos;
- notas de salida, corazón y fondo;
- descripción sensorial en lenguaje natural;
- etiquetas de estilo;
- intensidad;
- ocasiones, contextos, clima, estación y momento del día;
- perfil sensorial estructurado;
- tendencia orientativa de edad con nivel de confianza y mensaje no restrictivo;
- procedencia y estado de revisión de la información.

## Política de edad

La edad se almacena únicamente como una **tendencia secundaria**. No debe utilizarse para excluir fragancias ni para decir que un perfume pertenece exclusivamente a una edad.

Toda recomendación debe:

1. priorizar gustos, notas, ocasión, clima y la imagen que la persona quiere proyectar;
2. presentar el rango como una tendencia de afinidad;
3. aclarar que la fragancia puede funcionar a cualquier edad;
4. ofrecer alternativas de manera positiva cuando el usuario busque un perfil más juvenil, maduro, clásico o moderno.

## Regla de crecimiento

La base se ampliará en lotes de **50 perfumes**. No se activará el siguiente lote hasta validar el lote actual.

## Validación

```bash
node tools/test-master-batch.mjs
node tools/test-core-adapter.mjs
node tools/test-identity.mjs
```

Para validar una ficha individual:

```bash
node tools/validate-core.mjs data/core/<archivo>.json
```
