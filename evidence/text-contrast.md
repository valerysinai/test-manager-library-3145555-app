# Corrección de contraste y aceptación ampliada

Base main b5ef195; rama feature/app-text-contrast. El [plan previo](text-contrast-plan.md)
`7ad0aad` precede a la corrección `a9b74f9`. La revisión real anterior pasó teclado/layout/nombres,
pero falló contraste en 34 vistas; no se ocultaron esas observaciones.

Se oscurecen diez colores de texto en style.css: ayudas, encabezados, nota de login, placeholder,
top-label, badges cerrado/sin ejemplares y vencido, estado sin portada, tablas y pie. Se conservan
tonos, layout, contenido y comportamiento. No se modifican API, reglas, nombres ni dependencias.

Trece pruebas y build TypeScript/Vite pasaron localmente. La
[CI de a9b74f9](https://github.com/valerysinai/test-manager-library-3145555-app/actions/runs/38674670975)
pasó, incluido el escaneo de secretos. Esas pruebas de cliente/DOM no se presentan como auditoría
de los estilos; la comprobación de contraste usa Chromium real en infra.

La [aceptación ampliada](https://github.com/valerysinai/test-manager-library-3145555-infra/blob/a7b3798/evidence/final-acceptance.md)
conserva fuente, antes/después y capturas. Sobre App a9b74f9, API main 60bbcdd e infra 7f6ee24
pasaron 42 vistas (21 estados × móvil/escritorio), sin hallazgos del detector de contraste,
controles sin nombre o desbordamiento de documento. Foco, enlace de salto y Tab/Enter se probaron
a 390 y 1440 px; menú y tablas con scroll interno fueron alcanzables.

Los estados incluyen login, formularios/detalles, errores de documento/rango, vacíos, catálogo
por rol, portada, préstamo/cierre y vencido real. La API demo usa dos instantes de C-04 sin cambiar
reloj del equipo. UI rechaza otro préstamo al socio vencido (409), devuelve la línea y actualiza
listado/stock. Tras recrear contenedores se conservan datos y bytes de portada.
La [CI integrada de 7f6ee24](https://github.com/valerysinai/test-manager-library-3145555-infra/actions/runs/38675186829)
también pasó; no se atribuye esa integración a los mocks ni a la CI aislada de App.

Se revisaron muestras visuales de login desktop, alta móvil, detalle, error de socio, préstamo,
reporte y vencidos. El contraste se calcula sin redondear para decidir; colores transparentes
se componen con su fondo real. Las referencias de W3C y limitaciones están en infra.
No equivale a certificar WCAG completa ni lectores de pantalla/dispositivos no ejecutados.

La guía de demostración queda en Docs y debe completarla la persona que presenta. El plazo
original permanece intacto. El último commit solo incorpora esta evidencia y su enlace desde README.
