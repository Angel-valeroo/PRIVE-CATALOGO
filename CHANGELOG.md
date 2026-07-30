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
