# PRIVÉ · S13 Usuarios V1

## Incluye
- Nueva sección **Usuarios** en el Panel Admin, optimizada para móvil.
- Listado de cuentas con correo, rol, estado, ciudad, teléfono, distribuidor y último acceso.
- Crear cuentas Auth + `profiles` desde una Edge Function admin-only.
- Editar nombre, alias, correo, teléfono, Instagram, ciudad, rol, estado y distribuidor asignado.
- Cambiar contraseña desde backend seguro.
- `service_role` se usa únicamente dentro de `admin-users`; nunca en el navegador.
- Protección contra auto-democión/bloqueo del administrador que realiza la operación.
- Protección SQL para impedir que un usuario normal se cambie rol/estado/distribuidor por REST.

## Orden de despliegue
1. Ejecutar `sql/PRIVE-S13-USUARIOS-PREPARACION.sql`.
2. Desplegar Edge Function `supabase/functions/admin-users/index.ts`.
3. Subir frontend a GitHub.
4. Primera prueba: crear **una sola cuenta Revendedor de Prueba**.

## No hacer
- No pegar `service_role` en ningún JS/HTML.
- No crear usuarios directamente desde el navegador con admin APIs.
- No borrar cuentas como mecanismo de baja; usar estado `inactive` para conservar historial.
