# CHANGELOG — PRIVÉ Sprint 3.4

## Motor de composición universal

- Se reconstruyó la composición principal de la ficha como un único bloque centrado: nombre, clave y botella.
- El botón de cierre ya no desplaza el contenido hacia la izquierda.
- Los nombres largos conservan el centro, permiten salto de línea y no invaden el botón de cierre.
- Nombre, clave y botella mantienen una separación mínima consistente sin sentirse desconectados.
- Se definieron límites superiores, laterales e inferiores para impedir que cualquier botella invada el marco o desaparezca por debajo.

## Normalización automática de botellas

- Se añadió detección del área visible real de cada imagen mediante transparencia.
- El sistema ignora márgenes transparentes irregulares de los archivos.
- Cada botella se escala proporcionalmente para caber dentro de su zona segura.
- La silueta visible queda centrada, incluso cuando el lienzo original de la imagen está desbalanceado.
- La composición se recalcula al abrir la ficha y al cambiar el tamaño de la ventana.

## Halo e identidad de marca

- El halo fue integrado dentro del escenario de la botella y ahora permanece centrado detrás del producto.
- La marca de agua PRIVÉ se mantiene detrás de la botella sin controlar la posición del halo.
- Se conservaron la cuadrícula, el marco fino, “Colección PRIVÉ” y la guía animada de desplazamiento.

## Identidad visual automática por clave

- CP / C: paleta oscura para Caballero.
- DP / D: paleta más clara, cálida y delicada para Dama.
- UP / U: paleta neutra para Unisex.
- La categoría modifica únicamente el ambiente visual; la estructura y las proporciones permanecen iguales.

## Validación

- JavaScript validado sin errores de sintaxis.
- Adaptador Core validado.
- Catálogo validado: 547 perfumes sin claves ni IDs duplicados.

## Sprint 3.5 — Refinamiento visual por categoría

- Se conservó intacto el motor de composición universal aprobado en Sprint 3.4.
- Caballero ahora usa azul marino profundo, negro, reflejos fríos y acentos metálicos discretos inspirados en el Home.
- Dama ahora usa una atmósfera sofisticada de ciruela/cacao oscuro, champán y marfil cálido, evitando un rosa evidente.
- Unisex ahora usa grafito, gris mineral y plata con una identidad visual neutral.
- Se refinó el halo de cada categoría para iluminar el producto con una temperatura de color propia.
- Se unificaron marco, cuadrícula, marca de agua, botón de cierre, indicadores y contrastes mediante variables de tema.
- Se añadieron microanimaciones suaves de respiración del halo y deriva ambiental.
- Se respetó `prefers-reduced-motion` para desactivar las nuevas animaciones cuando el sistema lo solicita.

## Sprint 3.6 — Búsqueda expansible del Home

- La barra de búsqueda ahora inicia en un formato más compacto y refinado.
- Se incorporaron esquinas redondeadas y un tratamiento visual más discreto.
- Al recibir foco, la barra se expande suavemente desde el centro sin desplazar el resto del Home.
- La barra permanece expandida mientras contenga una búsqueda activa.
- Al perder el foco estando vacía, regresa automáticamente a su tamaño compacto.
- Se añadió un brillo sutil y mayor profundidad visual durante el estado activo.
- En dispositivos móviles conserva todo el ancho disponible para mantener la usabilidad.
- Se respetan las preferencias del sistema para reducir movimiento.
- Se actualizó la versión de caché de estilos y JavaScript a 3.6.

## Sprint 3.7 — Corrección de crecimiento de la búsqueda

- Se eliminó cualquier transformación visual que pudiera sentirse como zoom al activar la búsqueda.
- La barra ahora crece de forma real mediante ancho, altura mínima, padding y separación interna.
- El contenedor blanco, la tipografía y el icono aumentan de tamaño de manera coordinada.
- Se fijó un tamaño mínimo de 16 px en el campo para impedir el zoom automático de navegadores móviles al recibir foco.
- Se eliminó el borde, anillo y brillo dorado del estado activo.
- El único indicador de escritura es el cursor natural del campo.
- Se mantuvo la expansión desde el centro sin recortar ni desplazar el resto del Home.
- En móvil, la barra compacta conserva aire lateral y al activarse ocupa el ancho disponible.
- Se eliminaron efectos de escala en el botón de limpiar para mantener un crecimiento físico y estable.
- Se actualizó la versión de caché de estilos y JavaScript a 3.7.

## Sprint 3.8 — Estabilidad y pulido funcional
- Se unificó el reinicio visual de la ficha para todas las rutas de entrada: catálogo, recomendaciones, diseñador, filtros y asistente inteligente.
- Se corrigió el primer render desalineado al cambiar de perfume dentro de una ficha abierta.
- Se limpia la geometría anterior de la botella y se recalcula únicamente después de decodificar la nueva imagen.
- Se agregó un botón de búsqueda con lupa y soporte para Enter; ambos desplazan suavemente hacia los resultados.
- “Restablecer filtros” ahora es un botón visible, alineado a la derecha dentro de la barra de filtros.
- Se asignaron emojis a contextos que antes aparecían con un punto genérico: Casual, Profesional, Vacaciones, Deportivo, Especial, Formal, Romántico y Social.
