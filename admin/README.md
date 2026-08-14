# Panel administrativo PRIVÉ · Sprint 8

Ruta del módulo: `/admin/`.

## Primera apertura
1. Ingresa la **Project URL** exacta de Supabase: `https://TU-PROJECT-REF.supabase.co`.
2. Pega únicamente la **Publishable key** del proyecto.
3. Inicia sesión con una cuenta cuyo `profiles.role` sea `admin` y `status` sea `active`.

El panel valida y normaliza la Project URL antes de guardarla. La configuración y la sesión se almacenan únicamente en el navegador mediante `localStorage`.

**Nunca uses una Secret key ni `service_role` en este módulo.**

## Funciones del panel
- Resumen del próximo corte.
- Filtros de cortes: con pedidos, próximos, cerrados y todos.
- Búsqueda por nombre/fecha de corte.
- Estado visual: PRÓXIMO / ABIERTO / CERRADO.
- Pedidos de cada corte.
- Historial global de pedidos confirmados con búsqueda.
- Detalle administrativo de pedido.
- Descarga de Excel/PDF proveedor.
- Descarga de Excel/PDF individual.
- Renovación automática de sesión cuando existe `refresh_token`.
- Mensajes de conexión/login más claros.

## Backend requerido
- `get_admin_cycles_dashboard()`
- `get_admin_cycle_orders(uuid)`
- `get_admin_order_detail(uuid)`
- `get_confirmed_order_history()`
- `generate-order-excel`
- `generate-order-pdf`
- `generate-user-order-excel`
- `generate-user-order-pdf`
