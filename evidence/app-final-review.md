# Revisión final de App para integrar las correcciones

## Estado y análisis previo

Main `77401f2` contiene la implementación inicial pero no la corrección `47a517d` de etiquetas.
Se conserva `feature/app-library`; el [plan de cierre](app-final-review-plan.md), commit `6d1b279`,
precede a las nuevas pruebas `88b20a9`. El plan original de T-22 conserva su contexto.
No se cambia alcance, reglas, entidades ni contrato; los formularios siguen en español.

Field asocia cada label a un ID generado por React, que se pasa al control. Esto evita que el
texto de las opciones del select forme parte de la identificación de la etiqueta. La corrección
ya tenía una reproducción en Chromium; no se presenta como defecto nuevo descubierto aquí.

## Pruebas y CI

Las trece pruebas y la compilación TypeScript/Vite pasaron localmente. Dos regresiones nuevas
verifican etiquetas Categoría exactas en filtro/formulario simultáneos, ausencia de colisiones,
asociación label/control estable tras rerender, valor conservado y foco por teclado.
Son pruebas de DOM simulado, no una auditoría integral de accesibilidad.

La [CI sobre 88b20a9](https://github.com/valerysinai/test-manager-library-3145555-app/actions/runs/38672884000)
pasó: trece pruebas, build y control de secretos. También pasaron localmente el escaneo de todos
los archivos versionados y las cinco pruebas del detector. La última actualización solo añade
documentación/capturas y excluye bytecode de Python de Git y del contexto Docker.

## Recorrido real posterior con API fusionada

Se ejecutó `npm run verify` desde infra con contextos absolutos a los checkouts:

- App `88b20a907eed92e476294abfe0188f565ebb337f`, pendiente de fusión.
- API main `60bbcdd8c45637d426455d4e24b028ea1af76157`, ya fusionada.
- Infra main `f694448a13b6851e10488353ce38c582677ad75c`, ya fusionada.

Proyecto efímero `library-check-1792032478675-b0c83510`. Se verificó PostgreSQL vacío antes de
las migraciones propiedad de API, seis tablas de negocio y cinco categorías. El cliente rechazó
TLS sin confianza y usó una CA explícita con validación habilitada para el recorrido real.

Chromium real completó login admin, creación de libro, selección exacta de categoría, carga de
portada privada por PUT, alta de socio, préstamo con selección sin duplicados, devolución por
línea, reporte y alta/login de bibliotecario. El reporte respondió 200 con una fila. Se verificó
que el bibliotecario no tenga acciones de catálogo admin ni enlaces de reporte/alta de cuentas.

Se inspeccionaron las capturas del catálogo de [escritorio](final/catalog-desktop.png) y
[móvil](final/catalog-mobile.png), 1440×1000 y viewport 390×844. No se observó desbordamiento
horizontal y la prueba no detectó errores JavaScript. Después de detener/recrear contenedores
se conservaron los registros, préstamo cerrado, dos ejemplares disponibles y los bytes de portada.
La verificación terminó con salida 0 y limpió únicamente los contenedores/volúmenes del proyecto.
No se publican datos de login, tokens, contraseñas ni el checkpoint privado de persistencia.

Para reproducir: preparar la configuración/TLS de infra según su README y ejecutar desde ese
repositorio `npm run verify`, usando `API_CONTEXT` y `APP_CONTEXT` absolutos para estas revisiones.
El runner exige Docker y crea su proyecto aislado; no debe sustituirse por una prueba en la base
operativa. El recorrido de esta sección es local, no se atribuye al runner de la CI de App.

## Otros repositorios y límites

API ya conserva evidencia de 200 pruebas, C-08 concurrente y las 400 medidas RNF-1 sobre `68b41b0`
([cierre API](https://github.com/valerysinai/test-manager-library-3145555-api/blob/36a9f73/evidence/api-final-review.md)).
T-21 y T-23 tienen sus propias evidencias fusionadas. El
[cierre en Docs](https://github.com/valerysinai/test-manager-library-3145555-docs/blob/feature/docs-api-completion/cierre-repositorios.md)
fecha sus revisiones y distingue publicado, fusionado y ejecutado.

Esta revisión no acredita la demostración manual de feria ni todos los flujos/tecnologías de
asistencia. No garantiza ausencia de cualquier defecto. El corte original permanece intacto.
El [PR de correcciones](https://github.com/valerysinai/test-manager-library-3145555-app/compare/main...feature/app-library?expand=1)
queda para revisión y fusión en el fork.
