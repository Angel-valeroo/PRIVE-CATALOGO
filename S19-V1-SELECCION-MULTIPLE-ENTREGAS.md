# PRIVÉ · S19 V1 · Selección múltiple en Pendientes de entrega

## Qué cambia
- En **Admin → Pendientes de entrega**, tocar una asignación pendiente ya no la entrega inmediatamente: la selecciona o deselecciona.
- Se pueden seleccionar muchas asignaciones seguidas sin esperar a Supabase entre cada toque.
- Aparece una barra de selección con:
  - cantidad seleccionada y unidades;
  - **Desmarcar**;
  - **Marcar como entregados (N)**.
- Todo el lote se guarda con **una sola llamada RPC** mediante `admin_set_delivery_items`, por lo que 20–30 entregas ya no requieren 20–30 esperas de red.
- La operación es atómica: el RPC valida todas las asignaciones antes de escribir. Si una no es válida, no marca parcialmente el lote.
- Los entregados conservan la acción individual para **regresar a pendientes**.
- La selección se limpia al cambiar de persona, pestaña Perfumes/Muestras, filtro, búsqueda o corte para evitar entregar elementos ocultos por accidente.

## Orden de instalación
1. Ejecutar `sql/PRIVE-S19-V1-SELECCION-MULTIPLE-ENTREGAS.sql` en Supabase SQL Editor.
2. Reemplazar `admin/index.html`, `admin/admin.js` y `admin.css`.
3. Probar con 2–3 asignaciones y después con un lote grande.

## No cambia
- La lógica de agrupación por distribuidor.
- El desglose por cliente de pedidos directos del administrador.
- Notas, folios, historial ni fechas de entrega.
- Prioridad Frank/Robert (sigue sin implementarse).
