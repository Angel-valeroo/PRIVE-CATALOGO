# PRIVÉ — Sprint 3.2

## Cambios implementados

- El nombre del perfume y su clave ahora aparecen en una zona superior fija y centrada.
- Se reservó espacio para evitar que las botellas altas invadan o tapen la identificación.
- La marca de agua PRIVÉ se movió detrás de la botella como elemento decorativo.
- Se eliminó el texto genérico “Eau de Parfum”.
- Se mantuvo “Colección PRIVÉ” en la esquina inferior derecha.
- “Desliza para descubrir” se movió a una zona inferior independiente.
- La guía de scroll muestra flechas elegantes y, después de tres segundos sin interacción, realiza una animación sutil.
- La guía desaparece al comenzar a hacer scroll.
- Se añadieron ajustes específicos para escritorio, tableta y móvil.

## Archivos modificados

- `index.html`
- `styles.css`
- `app.js`

## Sprint 3.3 — Corrección de composición y estabilidad

- Se bajó el bloque de nombre y clave para integrarlo mejor con la botella.
- Se creó una separación mínima protegida entre identidad y producto.
- Se añadió un límite inferior para impedir que las botellas desaparezcan de la tarjeta.
- Se alinearon las botellas hacia la base para estabilizar su posición.
- El halo luminoso ahora resalta directamente el perfume.
- Se aumentó ligeramente la legibilidad del nombre y la clave.
- Se mantuvo una zona segura para nombres largos y el botón de cierre.
- El botón circular se sustituyó por uno cuadrado con esquinas discretas.
- Se corrigieron condiciones de carrera durante la carga de imágenes para evitar cambios visuales entre aperturas.
- Se espera a que la imagen termine de decodificarse antes de mostrarla, reduciendo saltos de composición.
