# S13 · Distribuidores V1.1

Decisión operativa: solo Administrador y Distribuidor tienen cuenta en Portal PRIVÉ.

Cambios:
- Revendedor eliminado del módulo de cuentas.
- Cuentas existentes con role=reseller se migran a distributor mediante SQL.
- Se elimina Distribuidor asignado del formulario y de las tarjetas.
- Instagram se elimina del módulo. La columna puede permanecer en base de datos por compatibilidad; ya no se usa.
- Nuevo distribuidor es el flujo por defecto.
- El portal acepta únicamente distributor/admin.
- El saludo usa alias como primera opción: Hola, [alias]. Si falta alias, usa nombre completo como respaldo.
- No se elimina el valor reseller del enum de Postgres para evitar romper historial/dependencias.

Orden de despliegue:
1. Ejecutar sql/PRIVE-S13-DISTRIBUIDORES-V1.1.sql
2. Reemplazar y desplegar Edge Function admin-users
3. Publicar frontend en GitHub Pages
4. Probar creación de un distribuidor
