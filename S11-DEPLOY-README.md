# PRIVÉ S11 · Alta inteligente por URL · Corrección V3

Base: S11 validada con conexión Supabase correcta.

## Backend requerido
- SQL `PRIVE-S11-ALTA-INTELIGENTE-URL.sql` (ya instalado)
- Edge Function `fragrantica-autofill` V3

## Cambios V3
- Diseñador y nombre salen de la estructura de la URL de Fragrantica, no del título SEO de la página.
- La imagen automática prioriza la botella principal vinculada a la ficha y al ID del perfume.
- La vista previa de la imagen aparece inmediatamente al pulsar Autocompletar, incluso antes de escribir la clave.
- La clave sigue siendo obligatoria únicamente para guardar/nombre final `catalog/CLAVE.webp`.
- Pegado o selección manual siguen disponibles como respaldo.

## Prueba recomendada
1. Actualiza `fragrantica-autofill` con V3 y despliega.
2. Abre Panel → Catálogo → Nuevo perfume.
3. Pega una URL de Fragrantica y pulsa Autocompletar.
4. Comprueba que nombre y diseñador son los segmentos limpios de URL y que aparece la botella principal.
5. Escribe la clave y verifica que el texto cambia a `CLAVE.webp`.
6. Todavía no guardes hasta validar esos puntos.
