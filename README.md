# PRIVÉ Catálogo — v1.3.9.1

Catálogo inteligente de fragancias con **Asesor Inteligente PRIVÉ** y una arquitectura híbrida de migración hacia **PRIVÉ Core Database**.

## Estado actual

- Experiencia principal centrada en el Asesor Inteligente PRIVÉ.
- Catálogo heredado conectado con fichas enriquecidas de PRIVÉ Core Database.
- Seis fragancias ya migradas a Core.
- Adaptador Core → Catálogo con prevención de duplicados.
- Diseño mobile-first y filtros por diseñador, familia, notas y atributos disponibles.

## v1.3.9.1 — Limpieza de identidad y versión

- Actualiza la versión visible del sitio a **v1.3.9.1**.
- Elimina dos registros duplicados que compartían código PRIVÉ:
  - `CP00850`: se conserva **HUGO MAN** y se elimina el alias duplicado **HUGO**.
  - `CP01079`: se conserva **HALLOWEEN · HALLOWEEN MAN** y se elimina el duplicado bajo **JESUS DEL POZO**.
- Añade una prueba automática para detectar códigos e identificadores duplicados antes de futuras migraciones.
- Mantiene intactas las seis fichas Core y la lógica del asesor.

## Validación local

Desde la raíz del proyecto:

```bash
node tools/test-identity.mjs
node tools/test-core-adapter.mjs
```

## Publicación

Sube el contenido de esta carpeta a la raíz del repositorio de GitHub Pages y reemplaza los archivos existentes.
