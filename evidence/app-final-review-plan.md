# Plan de cierre de las correcciones de App

Main observado `77401f2`; rama existente `feature/app-library`, cabeza inicial `bee3043`.
Docs de referencia `8e62f0f`: README, adaptación React/Laravel, artículo XII y T-22.
API main `60bbcdd` contiene ya el cierre verificado de backend.

El diff pendiente incorpora la corrección `47a517d`: etiquetas explícitas label/htmlFor con ID
único, detectada en navegador real. No se reescribe esa corrección ni se presenta como nueva.
El plan T-22 y la evidencia original conservan su cronología.

Antes de añadir pruebas, se preparan estos escenarios: dos selectores Categoría simultáneos
(filtro/formulario), etiquetas con texto exacto sin opciones incluidas, controles identificados
sin colisiones y asociación conservada tras renderizar de nuevo. Las once pruebas existentes
simulan la API; no sustituyen la aceptación integrada.

Ejecutar pruebas/build/secretos y el recorrido de infra con esta App y la API ya fusionada:
HTTPS confiable, crear libro/portada/socio, prestar/devolver, reporte, cuenta librarian, permisos,
capturas móvil/escritorio y persistencia. Usar solo el proyecto efímero que genera ese verificador.
Guardar revisiones y resultados exactos, sin credenciales. No ampliar producto, renombrar entidades,
retocar dependencias sin necesidad ni fusionar automáticamente el PR.

Después actualizar Docs con la situación real de los seis forks: rama publicada, prueba aprobada
y fusión se distinguen. Se conservan tablas históricas y se añade una foto de cierre actualizada.
La demostración manual en feria y la revisión completa de accesibilidad permanecen separadas.
