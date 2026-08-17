# PRIVÉ · S14 V1 · Pendientes de entrega

Base: S13 Distribuidores V1.1 validada.

## Objetivo
Crear una vista interna de logística para el administrador, enfocada únicamente en entregas.

## Flujo
1. El corte ya tiene pedidos confirmados.
2. Cuando PRIVÉ recibe físicamente los perfumes, el admin entra a **Pendientes de entrega** y pulsa **Iniciar entregas** sobre ese corte.
3. Los artículos aparecen agrupados por perfume/presentación.
4. Debajo de cada perfume se muestra el distribuidor, cantidades, muestras y la nota/cliente capturada en el pedido.
5. Al marcar una asignación como entregada desaparece del filtro Pendientes, pero sigue disponible en Entregados hasta archivar.
6. Si se cierra el panel, el avance queda persistido en Supabase.
7. Solo se puede archivar cuando no quedan asignaciones pendientes. Al archivar se eliminan los marcadores temporales por línea y se conserva una sola marca de ciclo archivado; los pedidos originales permanecen intactos.

## Seguridad
- No cambia el pedido original.
- Las tablas de seguimiento no se exponen a authenticated.
- Todas las acciones pasan por RPCs `security definer` con validación de admin activo.

## Instalación
Primero ejecutar `sql/PRIVE-S14-PENDIENTES-ENTREGA.sql`. Después desplegar el frontend.
