# S12 V2.1 — Corrección de caché del estado agotado

- Se incrementan las versiones de `styles.css` y `app.js` del catálogo público para forzar a los navegadores a descargar el tratamiento visual nuevo de AGOTADO.
- Se incrementan las versiones de `portal.css` y `portal.js` en Portal PRIVÉ por la misma razón.
- No cambia lógica de Supabase, SQL, RLS ni datos.

# S12 V2 — Estado agotado reforzado

- Catálogo público: AGOTADO ahora aparece como banda central grande sobre la botella, sin ocultarla.
- Ficha individual: nuevo overlay “AGOTADO / Temporalmente” y tratamiento visual diferenciado.
- Portal revendedores: mismo estado agotado reforzado en las tarjetas.
- El estado sigue dependiendo únicamente de `availability_status`; al volver a `available`, los distintivos desaparecen automáticamente.
- Sin cambios de SQL, RLS ni esquema para esta versión.


## 2026-08-14 · Sprint 8 · Panel administrativo base

- Se agregó el módulo privado `/admin/` desacoplado del catálogo público.
- El panel usa Supabase Auth con sesión real y nunca incluye `service_role` ni secretos de backend.
- Se integraron las RPC ya validadas: `get_admin_cycles_dashboard`, `get_admin_cycle_orders` y `get_admin_order_detail`.
- Se integraron descargas de Excel/PDF del proveedor y Excel/PDF individual por pedido confirmado.
- Se agregó navegación mobile-first: Cortes → Pedidos → Detalle.
- Se ocultaron claves en recomendaciones relacionadas y en el índice/páginas SEO visibles del catálogo.
- La búsqueda pública dejó de incluir la clave del proveedor como término de búsqueda.
- `/admin/` quedó excluido de indexación en `robots.txt` y con `noindex,nofollow`.
- La Publishable key se configura en el navegador la primera vez; no se debe usar una Secret key ni `service_role`.
## Sprint 7.15 — Expansión de distribuidores autorizados

- Se agregaron las credenciales de Magda Onofre “Maggie”, Luis Terán “Teran” y Esmeralda Ramírez “Esme”.
- Se mantienen Angel Valero, Mariana Valero y Roberto Guerra González como perfiles prioritarios; el resto del directorio se ordena alfabéticamente.
- Luis Terán se publica sin teléfono, conforme a su preferencia.
- Magda Onofre queda preparada para agregar su red de revendedores más adelante.
- Se sincronizaron `data/distributors.json`, `distributors.json` y el respaldo embebido de `distributors.js`.
- Se retiró la copia obsoleta `distributors (1).json` del respaldo limpio.
- Se actualizó el cache-busting del directorio para forzar la carga de la versión nueva.

## 2026-08-10 — Sprint 7.3 · Compra con confianza y directorio oficial

- Nuevo aviso institucional “Compra con confianza” al ingresar al catálogo, mostrado una vez por sesión y sin interferir con las recargas internas del sitio.
- El aviso aclara que compartir el catálogo no acredita a nadie como distribuidor autorizado y dirige al directorio oficial.
- Nueva página `distribuidores.html` preparada para credenciales de distribuidores autorizados, con fuente de datos independiente en `data/distributors.json`.
- Mientras se incorporan las credenciales reales, el directorio ofrece verificación directa mediante el Instagram oficial `@prive_trc`.
- Se añadió acceso permanente al directorio desde el pie del catálogo y se incorporó la nueva URL al sitemap.
- No se modificaron catálogo, Asesor, búsqueda, fichas ni animaciones existentes.

## 2026-08-06 — Mantenimiento de despliegue

- Reintento limpio de publicación en GitHub Pages tras un trabajo detenido en cola antes de adquirir runner.
- Sin cambios funcionales en catálogo, Asesor, búsqueda, fichas ni acceso temporal.

## 2026-08-01 — Búsqueda contextual: sesión y anclaje determinístico

## Sprint 5.3 — Home unificado y transiciones orgánicas del Asesor

- Home: “Ayúdame a elegir”, “Top más vendidos” y “Explorar catálogo” comparten tarjetas grandes, centradas y consistentes.
- Asesor: la transición de categoría y clima ahora revela el fondo de forma progresiva desde el botón seleccionado, detrás de toda la interfaz y sin salto final.
- Clima: se sustituyeron formas geométricas por elementos visuales reconocibles (desierto/fuego, nubes/rayos y nieve/viento).
- Se conservaron las 547 fichas y la lógica de recomendación existente.
- Limpieza de archivos históricos y reportes que no intervienen en la ejecución ni mantenimiento canónico.


- Cada nueva interacción con la búsqueda contextual inicia una sesión independiente.
- Al comenzar una nueva consulta, la vista vuelve al inicio real de las tarjetas y recalcula el ancla después del primer render.
- Las teclas posteriores actualizan resultados sin volver a desplazar la página.
- Se refuerza el mismo comportamiento después de cerrar fichas y navegar desde “También te puede gustar”.
- Se conserva la barra contextual visible mientras el usuario permanezca en la colección.

## 2026-07-31 — Corrección búsqueda contextual

- La “X” limpia visualmente ambas barras además de restablecer resultados.
- Cada nueva búsqueda contextual regresa al inicio de la colección filtrada.
- Barra contextual más ancha y acabado de cristal translúcido tipo Liquid Glass.

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


## Sprint 4.4 — Scroll continuo optimizado para Safari iOS
- Se eliminó la espera visible al llegar al final de cada bloque del catálogo.
- Se renderizan 48 tarjetas en la primera carga y el resto se prepara progresivamente en segundo plano.
- Las siguientes tarjetas se incorporan antes de que el usuario llegue al final, evitando cortes o saltos visuales.
- Las imágenes se precargan con mayor anticipación y solo se liberan cuando la memoria supera un límite seguro y están muy lejos de la pantalla.
- Se conserva un máximo controlado de imágenes decodificadas para evitar reinicios de Safari durante scroll agresivo.
- Se actualizó la caché de estilos y JavaScript a 4.4 / 5.4.


## Sprint 4.5 — estabilidad móvil Safari/Android
- Cola de imágenes con concurrencia limitada.
- Menor margen de precarga en móviles.
- Liberación temprana de imágenes lejanas durante scroll agresivo.
- Render por lotes pausado mientras el usuario desplaza rápidamente.
- Desactivación de `content-visibility` en dispositivos táctiles por inestabilidad de WebKit.


## Sprint 4.7 — virtualización real del catálogo
- Se eliminó el render acumulativo que dejaba cientos de tarjetas e imágenes en memoria.
- Safari y Android mantienen únicamente las filas cercanas a la pantalla.
- El scroll conserva la altura total del catálogo y se mantiene continuo.
- PC vuelve a recorrer el catálogo completo sin quedarse a medias.
- Las imágenes y observadores de filas retiradas se liberan al cambiar de ventana.
- Caché actualizada a styles 4.6 / app 5.6.

## Sprint 4.7 — hotfix de imágenes en catálogo virtual
- Se eliminó la dependencia de la cola/observer para las imágenes dentro de la ventana virtual.
- Las imágenes de las tarjetas visibles ahora se solicitan directamente con carga diferida nativa.
- Se cancelan las solicitudes de tarjetas retiradas antes de reciclar la ventana para controlar memoria.
- Se reinicia correctamente el estado interno al cambiar filtros o reconstruir el catálogo.
- Se mantiene la virtualización de filas para Safari y Android sin dejar el catálogo en blanco.
- Caché de JavaScript actualizada a 5.7.

## 2026-07-30 — Base Maestra Lote 005
- Se integraron 100 fichas de Dama (posiciones 351–450).
- La Base Maestra alcanza 450 perfumes activos.
- Se agregó control interno `review-batch-005.csv`.
- Se añadieron generador y prueba reproducible del Lote 005.
- Se amplió la trazabilidad con Fragrantica, Perfumoteca por clave, sitio oficial, Glass Essence y fuentes especializadas.

## 2026-07-30 — Base Maestra Lote 006 · cierre de fase
- Se integraron las 97 fragancias restantes del catálogo operativo (posiciones 451–547).
- La Base Maestra alcanza 547 fichas activas y cubre el catálogo vigente completo.
- El lote comprende 54 fragancias de Dama y 43 Unisex, desde `DP02868 — FAME COUTURE` hasta `UP01129 — ERBA PURA`.
- Se agregó el control interno `review-batch-006.csv`.
- Se añadieron generador y prueba reproducible del Lote 006.
- La trazabilidad conserva Fragrantica y Perfumoteca por clave como fuentes principales, con contraste de sitios oficiales, Glass Essence y fuentes especializadas.
- Las variantes recientes o con información pública limitada permanecen señaladas internamente con confianza baja o media.

## 2026-07-31 — Sprint 4.9 · búsqueda rápida contextual
- Se agregó una barra de búsqueda compacta y minimalista que aparece únicamente al entrar a la colección de perfumes.
- La barra permanece centrada y accesible durante el recorrido del catálogo, sin cubrir las tarjetas ni alterar el Home.
- Se oculta automáticamente al regresar al inicio, al salir de la colección o al abrir una ficha/Asesor Inteligente.
- La búsqueda rápida está sincronizada con el buscador principal, conserva filtros y actualiza resultados en tiempo real.
- Incluye expansión al enfocarse, limpieza de consulta y soporte para Enter/Escape, safe areas y movimiento reducido.
- Caché actualizada a styles 4.7 / app 5.8.

## 2026-07-31 — Corrección raíz de búsqueda contextual

- La búsqueda contextual se posiciona una sola vez al inicio real de las tarjetas cuando recibe foco.
- Escribir ya no ejecuta desplazamientos automáticos ni encadena animaciones.
- Enter confirma la búsqueda y únicamente cierra el teclado móvil.
- El dock permanece visible mientras el campo está enfocado, evitando que se cierre durante el ajuste inicial.
- Limpiar la consulta conserva la posición y vuelve a enfocar sin desplazar la página.


## 2026-08-01 — Sprint 5.0 · Asesor Inteligente PRIVÉ 2.0
- El Asesor pasa de 4 a 6 criterios: categoría, rango de edad orientativo, ocasión, perfil aromático, intensidad y clima.
- La edad se usa como afinidad no restrictiva, apoyándose en `recommendedAge` de la Base Maestra.
- La intensidad aprovecha `performance.intensity` y admite coincidencias exactas o cercanas para no forzar resultados artificiales.
- El motor reemplaza la coincidencia binaria por ponderación parcial y eleva la salida de 3 a 5 recomendaciones.
- En empates cercanos se favorece diversidad de diseñadores sin sacrificar las mejores coincidencias.
- Se rediseñó el Asesor con una interfaz minimalista y elegante, tarjetas tipo cristal y atmósferas reactivas.
- Al elegir Caballero, Dama o Unisex, el fondo adopta la identidad aprobada de esa categoría.
- En la pregunta de clima, Calor, Templado y Frío activan fondos y animaciones ambientales sutiles.
- Se agregó en Home la entrada “Top más vendidos” entre el Asesor y Explorar catálogo, marcada como “Próximamente” y aún sin lógica comercial.
- No se modificaron las 547 fichas de la Base Maestra.
- Caché actualizada a styles 4.8 / app 5.9.

## Sprint 5.1 — Pulido Asesor Inteligente y búsqueda contextual
- Top más vendidos: medalla con brillo y copy simplificado.
- Asesor: animación de expansión desde selección en categoría y clima.
- Edad: pregunta más natural para cliente final.
- Scroll corregido en todos los pasos y resultados del Asesor.
- Intensidad: iconografía ○ / ◐ / ●.
- Clima: atmósferas sutiles de calor, templado y frío.
- Búsqueda contextual: zona táctil protegida contra clics a tarjetas detrás.
- Limpieza de reportes, instrucciones y README de sprints históricos no necesarios para producción.

## Sprint 5.2 — Asesor full-screen y pulido visual (2026-08-01)
- Asesor móvil reestructurado: encabezado fijo, opciones/resultados con scroll propio y acciones ancladas al borde inferior.
- Cobertura de fondo reforzada para Safari/iPhone para evitar que el Home aparezca detrás de las barras del navegador.
- Transiciones de categoría y clima más lentas, nacidas desde el botón y con ondas múltiples.
- Clima rediseñado con llamas, nubes y copos de nieve reconocibles.
- Medalla de “Top más vendidos” centrada en su tarjeta.
- Limpieza del repositorio: retirados reportes, instrucciones y README históricos de sprints que no intervienen en el funcionamiento.

## Sprint 5.4 — Corrección estructural del Asesor y Safari
- El fondo del Home se extiende al lienzo raíz para evitar blanco detrás de la interfaz transparente de Safari.
- Medalla de Top más vendidos centrada nuevamente.
- Botón de cierre del Asesor restaurado a la esquina superior derecha y fuera del layout interno.
- Cabecera, contenido desplazable y acciones del Asesor separados en áreas de grid explícitas para evitar superposiciones.
- Opciones y navegación refinadas con tratamiento Liquid Glass.
- Corregida la transición de categoría/clima: una regla de opacidad impedía ver el reveal; ahora el fondo se expande visiblemente desde la selección durante ~1.95 s.
- Clima templado enriquecido con más nubes y rayos emoji; calor con mayor presencia de desierto/fuego; frío añade viento visible.

## Sprint 5.5 — Pulido inmersivo del Asesor
- Fondo neutro del Asesor cambiado de claro a grafito para resaltar Liquid Glass.
- Cobertura de safe-area y color del navegador reforzados en Safari/iPhone mediante theme-color dinámico y fondo compartido con html/body.
- Transiciones de categoría y clima suavizadas con una interpolación continua de 2.2 s.
- Intensidad normalizada: Sutil, Equilibrado e Intenso usan el mismo diámetro visual.
- Clima Calor enriquecido con paisaje, cactus, sol y fuego en elementos emoji reales.
- Resultados rediseñados como pantalla independiente y centrada, sin la introducción de los pasos.


## Sprint 5.6 · Transición continua + retorno a resultados
- Se sincronizó el fondo del Asesor con las zonas externas de Safari/iPhone usando `--advisor-browser-fill`, para evitar que el color final quede solo dentro del cuadro del diálogo.
- La expansión visual de categoría y clima ahora usa exactamente el mismo fondo del estado final, reduciendo el salto perceptible al terminar la animación.
- Se añadió una flecha exclusiva en la ficha abierta desde resultados del Asesor para volver a las coincidencias; la `X` sigue cerrando hacia Home.

## Sprint 5.7 · Fondo inmersivo estable + salida limpia
- Se eliminó la segunda transición de fondo que producía un salto al terminar la expansión de categoría o clima.
- Las zonas superior e inferior expuestas por Safari ahora interpolan el color de página en paralelo al reveal del Asesor.
- Las opciones de las seis preguntas del Asesor ya no dependen del momento de carga de la Base Maestra y permanecen estables.
- La X del Asesor/resultados queda por encima de todas las tarjetas y capas con `backdrop-filter`.
- Al salir mediante la X desde el flujo del Asesor se vuelve al Home con una recarga limpia, eliminando estado/hash temporal antes de volver a abrir perfumes del catálogo.


## Sprint 5.8 · Full-screen real + transición sin corte
- El fondo permanente de categoría/clima usa exactamente los mismos gradientes que la capa de animación, eliminando el cambio final perceptible.
- `html`, `body`, backdrop y overscan del Asesor comparten una única variable de relleno para conservar la experiencia de borde a borde.
- El `theme-color` de Safari se fuerza recreando el meta en cada cambio de tema para mejorar la actualización de las barras superior e inferior en iPhone.
- La pantalla de resultados conserva el mismo lienzo inmersivo.


## Sprint 5.9 · Reveal único + Safari sincronizado
- Se eliminó el cambio de fondo previo a la animación en categoría y clima.
- El color de `theme-color`/Safari se interpola durante la misma duración del reveal en vez de cambiar de golpe.
- El fondo permanente se confirma solo cuando la máscara ya cubrió toda la vista y se mantiene cubierta durante el commit para evitar el salto final.
- Resultados conservan arquitectura full-screen sin modificar la lógica del Asesor ni del catálogo.


## Sprint 6.0 · Motor visual único del Asesor
- Se reemplazó la expansión con `clip-path` por una burbuja física escalada con `transform`, evitando el lag de composición observado en iPhone.
- Categoría y clima comparten una sola fuente de color entre revelación, fondo final y lienzo extendido (`html/body`).
- Se eliminó una regla `[open]` heredada que pintaba el diálogo con el color destino antes de comenzar la animación.
- La barra inferior del Asesor quedó como Liquid Glass translúcido para no tapar la revelación del fondo.
- El `theme-color` se confirma una sola vez al terminar la animación y se expresa como `rgb()` para conservar el tono CSS.
- Resultados conserva el mismo fondo full-screen del clima seleccionado.
- Prueba visual real: los seis temas terminan con RGB idéntico en diálogo/html/body; la expansión mantiene composición fluida en la prueba de navegador.


## Sprint 6.1 · Safari safe-area / under-page real
- Se mantuvo intacto el motor visual del Sprint 6.0.
- Mientras el Asesor está abierto, el Home/catálogo subyacente se oculta para que Safari no derive sus barras de una superficie gris/clara detrás del diálogo.
- `html` y `body` reciben el color real del tema como `background-color` inline y se añadió una superficie under-page sólida para overscroll y zonas expuestas por el navegador.
- El `theme-color` se reinserta al confirmar un tema para forzar su relectura en Safari compatibles.


## Sprint 6.2 · Corrección X de búsqueda contextual
- Se corrigió el bloqueo del botón X de la búsqueda flotante de la colección.
- La protección anti click-through permanece, pero ahora detiene propagación en fase burbuja para permitir que los controles internos reciban primero sus eventos.
- La X limpia ambas barras, restablece resultados y mantiene el buscador contextual activo sin tocar la navegación ni el scroll existentes.

## Producción + SEO técnico · Sprint 7.0
- Catálogo de producción consolidado en `data/prive-catalog.json`: las 547 fichas enriquecidas se cargan con una sola solicitud; la ruta histórica de JSON individuales queda como respaldo.
- El HTML inicial ya publica 547 fragancias en lugar de `0 fragancias` mientras JavaScript termina de cargar.
- Canonical, Open Graph, Twitter Card, favicon, Apple Touch Icon, manifest y JSON-LD integrados para `https://www.perfumeriaprive.com/`.
- `robots.txt` y `sitemap.xml` añadidos.
- 547 páginas SEO estáticas generadas bajo `/perfumes/<slug>/`, además de `/perfumes/` como índice rastreable.
- Se añadieron `404.html` y recursos de identidad web en `/assets/`.
- Se eliminaron las imágenes huérfanas `CP00735.avif` y `CP02414.avif`; quedan 547 imágenes para 547 perfumes activos.
- Se retiraron reportes e instrucciones históricas obsoletas del repositorio.

## Sprint 7.1 · Acceso temporal para distribuidores
- Se añadió una pantalla de acceso temporal completamente desacoplada del catálogo mediante `access-gate.css` y `access-gate.js`.
- La sesión de acceso se conserva únicamente durante la sesión actual del navegador; no se guarda la contraseña.
- Las credenciales se comparan mediante SHA-256 en el cliente para evitar dejar la contraseña escrita literalmente en el archivo JavaScript.
- Se integró el canal oficial de Instagram `@prive_trc` como alternativa pública para clientes que deseen consultar disponibilidad, información o cotizaciones.
- El generador de producción incorpora la misma capa temporal a las 547 páginas SEO y al índice de fragancias para mantener una experiencia consistente mientras dure esta medida.
- Esta capa está diseñada para retirarse posteriormente eliminando sus dos archivos y sus referencias, sin alterar la lógica del catálogo.

## 2026-08-06 — Reintento de publicación GitHub Pages
- Marcador de publicación sin cambios funcionales para generar un deployment nuevo después de que el runner anterior permaneciera en cola.
- No modifica catálogo, búsqueda, Asesor, fichas, SEO ni acceso temporal.

## 2026-08-06 — Reintento final de publicación GitHub Pages
- Marcador técnico sin cambios funcionales para generar un commit/deployment completamente nuevo.
## Sprint 7.2 — Sesión temporal controlada
- Invalida una sola vez las sesiones anteriores del acceso temporal mediante una nueva versión interna de sesión.
- Mantiene el acceso durante recargas y navegación dentro de la misma sesión del navegador.
- La sesión expira automáticamente a las 12 horas y vuelve a solicitar credenciales.
- Al cerrar la sesión/pestaña del navegador, `sessionStorage` se descarta y el acceso vuelve a solicitarse al regresar.
- Se actualiza el cache-busting de `access-gate.js` a `v=1.1` en todas las páginas públicas/SEO para que la nueva política de sesión se cargue tras la publicación.



## Sprint 7.4 · Credenciales oficiales
- Se incorpora la primera credencial oficial del directorio: Angel Valero, CEO de PRIVÉ.
- La credencial muestra nombre, alias, ciudad, teléfono e Instagram autorizados por el titular.
- Se agrega la fotografía oficial al directorio y se prepara el diseño reutilizable para futuros distribuidores autorizados.
- Se consolida `data/distributors.json` como fuente canónica del directorio.

## Sprint 7.5 — Credenciales compactas
- Se conserva el aviso emergente “Compra con confianza” con las dos rutas: ver distribuidores o continuar al catálogo.
- Credenciales de distribuidores más compactas y centradas.
- Foto de perfil circular.
- Teléfono en texto plano, sin acción de llamada.
- Instagram conserva acceso directo.
- Borde dorado animado y sutil para distinguir visualmente las credenciales.
- Diseño responsive preparado para mostrar varias credenciales por pantalla.


## Sprint 7.6 — Perfil institucional y tarjetas expandibles
- La vista inicial conserva credenciales compactas y ahora todas las tarjetas pueden abrirse para ver el perfil completo.
- El perfil de Angel Valero se distingue como “Fundador & CEO de PRIVÉ” con sello exclusivo de perfil oficial.
- Frase del fundador: “La calidad nos unió; la confianza nos hace crecer.”
- Se integró un mensaje breve del fundador sobre calidad, confianza y apoyo.
- Teléfono se mantiene como texto plano; Instagram conserva acceso directo.
- La ficha ampliada muestra dinámicamente el número de distribuidores autorizados activos.
- Se dejó preparada la estructura `network` para que cada distribuidor pueda mostrar después únicamente nombre y alias de sus propios revendedores.
- Las tarjetas de distribuidores con red mostrarán un contador de revendedores en la vista compacta.
- El aviso “Compra con confianza” conserva las dos decisiones: ver distribuidores autorizados o continuar al catálogo; no existe redirección automática al directorio.


## Sprint 7.7 — Perfil fundador refinado
- “Ver perfil” cambia a “Más detalles”.
- El perfil ampliado deja de comportarse como hoja inferior: abre anclado desde la parte superior y siempre inicia con scroll en cero.
- Se conserva y muestra la frase del fundador y el mensaje completo.
- El aro de la foto del perfil ampliado incorpora una animación dorada sutil.
- El distintivo del fundador queda como “Perfil oficial” con check de verificación.
- Cargo del fundador: “Fundador - CEO de PRIVÉ”.
- Se mantiene intacto el flujo “Compra con confianza” y sus dos opciones.


## Sprint 7.9 — Perfil fundador garantizado
- Se sincronizan las dos fuentes históricas de distribuidores para evitar datos desfasados.
- El perfil `owner` fuerza el cargo `Fundador - CEO de PRIVÉ`.
- El lema y el mensaje del fundador tienen respaldo directo en el renderer, por lo que aparecen incluso si un JSON antiguo llegara a quedar en caché o sin reemplazar.
- `Perfil oficial` queda protegido como distintivo exclusivo del fundador.
- Se actualiza el cache-busting de `distributors.js`.


## Sprint 7.10 — Mensaje del fundador
- Se actualiza el mensaje oficial del fundador para agradecer primero a Dios, a la familia, a quienes creyeron en el proyecto y a cada cliente que ha dado su confianza a PRIVÉ.
- Cierre aprobado: `Gracias por formar parte de este emprendimiento y de esta historia.`
- Se sincronizan ambas fuentes históricas de distribuidores y el respaldo del renderer para evitar inconsistencias.


## Sprint 7.11 — Primer distribuidor autorizado
- Se integra a Ruben Albores, alias `Chaparro`, como primer Distribuidor autorizado de PRIVÉ.
- Ciudad: Torreón, Coahuila.
- Teléfono visible únicamente como texto: `871 594 5420`.
- Perfil sin Instagram y sin red de revendedores por el momento.
- Se agrega su fotografía oficial al directorio.
- El contador del perfil del fundador pasa a reflejar 1 distribuidor autorizado activo.
- Se sincronizan `distributors.json` y `data/distributors.json` para evitar inconsistencias.


## Sprint 7.12 — Adalaaí Cabrera + contacto condicional
- Se integra a Adalaaí Cabrera, alias `Cabrera`, como Distribuidor autorizado.
- Ciudad: Torreón, Coahuila.
- Teléfono: `871 571 9087`.
- Instagram oficial de su perfil: `@adalaaicabreraa`.
- Se agrega su fotografía y su red inicia vacía.
- Se corrige de raíz `safeUrl`: los valores vacíos ya no se convierten en la URL principal del sitio.
- En consecuencia, Ruben Albores y cualquier distribuidor futuro sin Instagram ya no muestran botón, texto ni espacio de Instagram.
- Se sincronizan `data/distributors.json` y `distributors.json`.

## Sprint 7.13 — Credenciales ampliadas y claves ocultas (2026-08-13)
- Se amplió el directorio oficial con Mariana Valero, Roberto Guerra González, Diana Rodriguez, Ernesto Meraz, Francisco Félix, Kaled Puentes y Angel Soto.
- Mariana Valero aparece como perfil oficial verificado con rol “CEO y Redes”.
- Angel Soto usa el rol “Redes - Distribuidor Autorizado”.
- Orden del directorio: Angel Valero, Mariana Valero, Roberto Guerra González y después distribuidores por orden alfabético.
- Se actualizó la fotografía de Adalaaí Cabrera.
- Las claves de perfumes dejaron de mostrarse visualmente en catálogo, fichas, resultados del Asesor, textos de búsqueda y páginas SEO, sin eliminarse de los datos internos.
- Las redes pendientes de Angel Soto y Roberto Guerra González quedan preparadas sin mostrar secciones vacías.

## Sprint 10 · Catálogo administrativo
- Nueva pestaña Catálogo en Panel administrativo.
- Alta y edición de perfumes con clave privada vía RPC.
- Carga de imágenes nuevas a Supabase Storage `perfume-images`.
- Control Disponible / Agotado temporalmente.
- Portal PRIVÉ muestra perfumes agotados y bloquea su alta al pedido.
- Perfumes nuevos se publican como ficha básica para enriquecimiento posterior.

## S11 V5 - 2026-08-16
- Mejora puntual del procesamiento de imagen: limpieza de halo/fringe blanco conectado al fondo, con expansión limitada y descontaminación de borde.
- Conserva transparencia WEBP y evita chroma-key global para proteger detalles blancos reales.
- Sin cambios a RLS, pedidos, búsqueda, categorías ni flujo de alta/edición ya validados.


## S12 V1 - Migración segura del catálogo público a Supabase
- Supabase pasa a definir qué perfumes están activos y visibles en el catálogo público.
- Altas, cambios de nombre/diseñador/categoría, imagen y disponibilidad se reflejan sin regenerar el catálogo local.
- Los perfiles olfativos históricos se conservan como capa enriquecida mientras se completa su migración.
- Perfumes nuevos sin enriquecimiento muestran el estado de perfil en preparación.
- Imágenes de Storage tienen prioridad y las imágenes locales quedan como respaldo.
- Se muestra AGOTADO públicamente sin retirar la fragancia.
- No se exponen perfume_keys, source_url ni campos administrativos.

## S12 V3 — Supabase como fuente única del catálogo público
- Migra los perfiles enriquecidos históricos a `public.perfume_profiles` (JSONB) mediante SQL de semilla.
- `get_public_catalog()` devuelve únicamente campos públicos + `profile_data`; no expone `perfume_keys`, `source_url` ni provenance.
- El catálogo público deja de consultar `data/prive-catalog.json` y `data/core/*` en tiempo de ejecución.
- Perfumes nuevos con `profile_status=basic` siguen funcionando con ficha en preparación hasta ser enriquecidos.
- Se incrementa versión de caché de `app.js`/`styles.css` a 12.3.
