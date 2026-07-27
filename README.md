# PRIVÉ Catalog — Prototipo Caballero

Primera versión funcional del catálogo neutral de PRIVÉ.

## Incluye

- 325 perfumes de la hoja **CABALLERO**.
- Buscador por nombre, diseñador y clave.
- Filtro por diseñador.
- Diseño responsivo para celular y computadora.
- Sin precios, WhatsApp, compras ni datos de contacto.
- Espacios provisionales para las fotografías.

## Cómo verlo en tu computadora

Debido a que el catálogo carga un archivo JSON, no conviene abrir `index.html`
con doble clic. Usa uno de estos métodos:

### Visual Studio Code
1. Instala la extensión **Live Server**.
2. Abre esta carpeta.
3. Haz clic derecho en `index.html`.
4. Selecciona **Open with Live Server**.

### Python
Desde esta carpeta ejecuta:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Publicarlo gratis con GitHub Pages

1. Sube todos los archivos de esta carpeta a tu repositorio `prive-catalog`.
2. En GitHub entra a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda. GitHub mostrará la dirección pública cuando termine la publicación.

## Próxima etapa

- Sustituir los espacios provisionales por fotos reales.
- Añadir Dama y Unisex.
- Crear Novedades, Top ventas y Recomendados.
