# Plan previo · contraste de texto

Base App main `b5ef195`; rama `feature/app-text-contrast`. La aceptación ampliada se preparó
en infra `f83505a` antes de su implementación. El recorrido real sobre esta App completó 34 vistas
sin desbordamiento ni controles sin nombre; teclado pasó, pero la aceptación de contraste falló.

El informe conserva selectores y colores, no textos ni valores de campos. Se observó contraste
inferior a 4,5:1 en texto normal: --muted (4,41:1 sobre fondo de página y 4,13:1 en elección hover),
eyebrow (3,91–4,17), login-note (3,60), top-label (3,81), cabeceras de tabla (3,80), badge cerrado
(4,09) y pie (3,41). Se conservan los tonos del diseño y se oscurecen únicamente esos textos.

Se comprobarán también el placeholder de búsqueda y el estado sin portada, identificados al
revisar los estilos de bajo contraste. No se cambia el producto, layout, reglas, API ni dependencias.
No se introduce una prueba que solo replique constantes CSS: se usa el contraste calculado sobre
los fondos reales en Chromium. Repetir pruebas/build/secretos de App y aceptación integrada.

La evidencia conservará resultado anterior/final y revisiones exactas. No certifica WCAG integral
ni una demostración humana en feria. Commit/PR en inglés y fusión manual en el fork.
