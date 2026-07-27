# PRIVÉ Catálogo v1.3

Primera base de la versión **Inteligencia del Catálogo**, construida sobre v1.2.1.

## Cambios principales

- Diseño mobile-first y soporte para áreas seguras de iPhone.
- Ficha de perfume de pantalla completa en teléfonos y modal premium en escritorio.
- Nueva estructura para familia olfativa, acordes, intensidad, ocasiones, temporadas y pirámide de notas.
- Recomendaciones que priorizan coincidencias de perfil; cuando aún no hay metadatos, utiliza el mismo diseñador.
- Búsqueda preparada para consultar metadatos olfativos.
- Filtro de familia olfativa que aparece automáticamente cuando existan datos.
- La aplicación funciona aunque falten imágenes o fichas olfativas.

## Campos opcionales admitidos en perfumes.json

```json
{
  "description": "Descripción original PRIVÉ",
  "family": "Amaderada aromática",
  "accords": ["Fresco", "Cítrico", "Amaderado"],
  "topNotes": ["Bergamota"],
  "heartNotes": ["Lavanda"],
  "baseNotes": ["Cedro"],
  "intensity": "Intenso",
  "occasions": ["Noche", "Evento"],
  "seasons": ["Otoño", "Invierno"]
}
```

Los campos pueden agregarse progresivamente sin modificar el código del sitio.
