## Sprint 4.3 — Safari scroll memory hardening

- Carga del catálogo reducida a lotes de 16 tarjetas.
- Nuevas imágenes se cargan solo cerca del viewport.
- Imágenes lejanas se descargan para liberar memoria decodificada.
- La carga de nuevos lotes se pausa durante scroll agresivo y continúa al quedar inactivo.
- Se conserva la navegación y el diseño existentes.

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


## Sprint 3.9 — Apertura canónica de fichas
- Todas las rutas de entrada a una fragancia siguen usando `openPerfume`, ahora con un reinicio visual y de scroll reforzado.
- Al cambiar de perfume desde “También te puede gustar”, “Ver diseñador”, el Asistente o el catálogo, la ficha vuelve siempre al inicio en el primer clic.
- Se desactiva temporalmente el desplazamiento suave durante el reinicio para impedir que la posición anterior se herede.
- Se invalida cualquier carga de imagen anterior antes de renderizar la nueva fragancia.
- La botella se recalcula varias veces durante los primeros fotogramas y después de decodificar la imagen para mantener el centro estable.
- Se añadieron protecciones contra condiciones de carrera cuando el usuario cambia rápidamente entre fragancias.
- Casos de prueba prioritarios: Acqua di Giò desde recomendaciones y apertura posterior desde “Ver diseñador”.
- Caché actualizada a la versión 3.9.

## Sprint 4.0 — Identidad Dama y Home centrado
- Se sustituyó la atmósfera de Dama por una paleta vino/borgoña profunda con degradados sutiles, halo rosado-vino y acentos refinados.
- Se centró la composición completa del Home: overline, logotipo, eslogan, mensaje, búsqueda, categorías, contador y accesos.
- Se compactó y reequilibró el espacio superior del Hero para eliminar la sensación de bloque negro vacío.
- La atmósfera decorativa del Home ahora se organiza alrededor del eje central.
- “Ayúdame a elegir” ahora presenta al Asesor Inteligente PRIVÉ y usa una estrella como símbolo de descubrimiento.
- Caché actualizada a la versión 4.0.

## Sprint 4.1 — Legibilidad en fichas Dama
- Se reforzó el contraste de “Desliza para descubrir” y “Colección PRIVÉ” únicamente en las fichas de Dama.
- Se sustituyeron los tonos semitransparentes por marfil rosado de mayor presencia, conservando la atmósfera vino/borgoña.
- Se añadieron sombras suaves para separar el texto del degradado y de los reflejos del escenario.
- Las flechas de desplazamiento ahora tienen mayor contraste y definición sin volverse protagonistas.
- Caballero, Unisex, composición, tamaños y comportamiento funcional permanecen sin cambios.
- Caché de estilos y JavaScript actualizada a la versión 4.1.

## Base Maestra — Lote 001 (50 perfumes)
- Se activaron las primeras 50 fichas enriquecidas de PRIVÉ Core Database, respetando el orden del catálogo operativo.
- Cada ficha incorpora familia, acordes, pirámide olfativa, descripción sensorial, etiquetas de estilo, intensidad, ocasiones, contextos, clima, estación y momento del día.
- Se añadió un perfil sensorial estructurado para mejorar búsquedas, similitud y recomendaciones.
- La tendencia de edad ahora incluye rango, nivel de confianza, encuadre `tendency`, indicador no restrictivo y una explicación amable.
- La edad permanece como señal secundaria: no excluye perfumes y siempre prioriza gustos, notas y personalidad.
- El adaptador Core expone `styleTags`, `dayParts`, `sensoryProfile` y `ageTrend` sin alterar la identidad procedente del Excel.
- Las recomendaciones entre perfumes ahora también consideran etiquetas de estilo y momento del día.
- Se fijó la regla de crecimiento en lotes de 50, con validación obligatoria antes del siguiente lote.
- Se añadieron pruebas automáticas del lote, política de edad, integridad de archivos, orden y ausencia de duplicados.
- Caché de JavaScript y Core actualizada a la versión 5.0 / `master-001`.

## Base Maestra — Lote 002 (100 perfumes) — 2026-07-30

- Se incorporaron las posiciones 51–150 del catálogo operativo: 100 fichas nuevas.
- La Base Maestra pasa de 50 a 150 perfumes activos.
- Se estableció la política dual de fuentes principales:
  - Fragrantica para nombre, versión e imagen.
  - Perfumoteca para búsqueda por clave y referencia olfativa del proveedor.
- Todas las fichas nuevas conservan estado `review` y nivel de confianza explícito.
- Se añadió `data/core/review-batch-002.csv` para controlar variantes ambiguas y revisiones pendientes.
- La edad sigue siendo una tendencia orientativa y nunca una restricción.
- Se actualizó la versión de caché Core a `master-002`.
- Se añadieron generador y pruebas reproducibles del Lote 002.

## Base Maestra — Lote 003 (100 perfumes) — 2026-07-30

- Se incorporaron las posiciones 151–250 del catálogo operativo: 100 fichas nuevas.
- La Base Maestra pasa de 150 a 250 perfumes activos.
- Se mantuvo la metodología de fuentes principales complementarias:
  - Fragrantica para nombre, versión e imagen.
  - Perfumoteca para búsqueda exacta por clave y referencia olfativa del proveedor.
  - Glass Essence como respaldo técnico por clave cuando está disponible.
- Todas las fichas nuevas conservan estado interno `review`; este estado no se muestra en el catálogo público.
- Se añadió `data/core/review-batch-003.csv` para controlar variantes, lanzamientos recientes y discrepancias sin mezclar versiones.
- La edad continúa como tendencia orientativa, secundaria y nunca restrictiva.
- Se actualizó la versión de caché Core a `master-003` y la carga de JavaScript a 5.1.
- Se añadieron generador y pruebas reproducibles del Lote 003.


## Base Maestra — Lote 004 (100 perfumes) — 2026-07-30

- Se incorporaron las posiciones 251–350 del catálogo operativo: 100 fichas nuevas.
- La Base Maestra pasa de 250 a 350 perfumes activos.
- Se mantuvo la política dual de fuentes principales: Fragrantica para nombre/versión/imagen y Perfumoteca para búsqueda exacta por clave y referencia del proveedor.
- Las fichas nuevas permanecen en estado interno `review`, sin mostrar ese estado al público.
- Se añadió `data/core/review-batch-004.csv` para el control interno.
- La edad continúa como tendencia orientativa, secundaria y nunca restrictiva.
- Se actualizó la versión de Core a `master-004` y la carga de JavaScript a 5.2.
- Se añadieron generador y pruebas reproducibles del Lote 004.

## Sprint 4.2 — Estabilidad del catálogo en Safari iOS
- El catálogo ahora se renderiza en lotes controlados de 32 tarjetas.
- Se evita disparar múltiples cargas simultáneas al hacer scroll rápido.
- Las imágenes de tarjetas ya no ejecutan decodificación masiva; la decodificación completa se conserva en la ficha de detalle.
- Se añadió `content-visibility` para reducir memoria y trabajo fuera de pantalla.
- Safari ya no pierde la posición por un `pageshow` restaurado desde memoria.
