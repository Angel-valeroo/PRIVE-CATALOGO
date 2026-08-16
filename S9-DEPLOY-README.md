# PRIVÉ · Sprint 9 · Consistencia operativa

Esta versión integra los ajustes funcionales acordados para el Portal PRIVÉ y el panel administrativo.

## Qué cambia

### Portal
- Un solo inicio de sesión para distribuidores/revendedores/administradores.
- La cuenta admin entra al Portal y desde ahí abre **Panel administrativo** sin volver a iniciar sesión.
- Cerrar sesión desde Portal o Admin limpia la misma sesión y vuelve al Portal.
- Nueva sección **Mis pedidos** de solo lectura.
- Historial con folio, fecha, totales, detalle y re-descarga de PDF/Excel.
- Después de confirmar aparece una pantalla de confirmación con folio y botones PDF/Excel.
- La confirmación final recuerda el progreso hacia 15 perfumes.
- En un pedido cerrado se muestran claves y presentación autorizada.
- Presentación Caballero/Dama visible en el carrito para perfumes Unisex.

### Panel administrativo
- Usa la sesión del Portal; ya no existe un segundo login operativo.
- Detalle de pedido muestra **Presentación**.
- Reabrir pedido se conserva.

### Reportes
Los cuatro reemplazos de Edge Functions incluidos agregan **Presentación**:
- `generate-order-excel`
- `generate-order-pdf`
- `generate-user-order-excel`
- `generate-user-order-pdf`

Para Unisex, el consolidado de proveedor separa el mismo perfume por presentación:
- Caballero
- Dama

## Orden de instalación

1. En Supabase SQL Editor ejecutar:
   `sql/PRIVE-S9-CONSISTENCIA-UNISEX-HISTORIAL.sql`

2. En Supabase Edge Functions reemplazar el código de cada función con su `index.ts` dentro de:
   `supabase/functions/<nombre>/index.ts`

3. Hacer Deploy de las cuatro Edge Functions.

4. Probar localmente con Live Server:
   - `/portal/`
   - login revendedor
   - Mis pedidos
   - PDF/Excel individual
   - perfume Unisex Caballero/Dama
   - confirmación y descarga
   - logout/login con otra cuenta
   - login admin en Portal → Panel administrativo sin segundo login
   - detalle admin con Presentación
   - PDF/Excel proveedor con Presentación

5. Solo después subir a GitHub/producción.

## Validación clave de Unisex

Un pedido como:
- 3 × 9AM Dive · Caballero
- 2 × 9AM Dive · Dama

debe mantenerse separado en:
- Portal del revendedor
- Historial
- Panel admin
- Excel/PDF individual
- Excel/PDF proveedor

Las claves continúan ocultas antes de confirmar.
