# PRIVÉ · S12 V4 · Imágenes URL HD · V6

Base: S12 V3.1 validada.

## Objetivo
Mejorar la calidad visual de las imágenes obtenidas automáticamente desde URL de Fragrantica sin volver al flujo manual.

## Cambios
- `fragrantica-autofill` ya no prioriza por defecto la miniatura 375x500.
- Se buscan primero las variantes publicadas por la ficha y las variantes de mayor resolución de `srcset`.
- La miniatura 375x500 queda solo como respaldo.
- El navegador conserva hasta 2400 px del lado mayor, sin hacer upscale artificial.
- Exportación WEBP aumentada de calidad 0.90 a 0.97.
- Limpieza de fondo/blanco rehecha con una banda corta de precisión y descontaminación del matte blanco.
- Se conserva la transparencia real.
- Las zonas blancas legítimas del frasco se protegen cuando su interior también es blanco.
- El flujo manual de pegar/subir imagen sigue siendo compatible.

## Backend
Sí cambia la Edge Function:
`supabase/functions/fragrantica-autofill/index.ts`

No requiere SQL nuevo ni cambios RLS.

## Prueba inicial
Usar únicamente VALENTINO CORAL FANTASY:
Editar perfume -> URL -> Autocompletar -> revisar vista previa -> Guardar -> revisar en móvil y hacer zoom.
Después comparar con VALENTINO INTENSE.
