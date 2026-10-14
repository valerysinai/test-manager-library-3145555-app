# Plan previo · T-22 React

Base main 07d7b54. Rama feature/app-library. Este documento precede al código.
Referencia: docs main 16cba02, spec-python/spec.md y api-contract.md, adaptación React/Laravel.
API contrastada en feature/api-completion c4e3d8c: CI verde, pendiente de fusión.

## Alcance y decisiones

- HU-01/02: login, cierre/expiración de sesión y alta de bibliotecarios solo admin. Token únicamente
  en memoria; no cookies, localStorage, URL ni logs. La contraseña se envía sin recortar y se limpia.
- HU-03/04: catálogo paginado, texto/categoría, detalle, altas/edición/baja y portadas para admin.
  ISBN no editable; existencias y categorías proceden del servidor. Binarios con Bearer mediante fetch,
  URL de objeto revocada al sustituir/desmontar; nunca se interpreta cover_key como ruta pública.
- HU-05: búsqueda/alta/detalle de socios y conteo activo para ambos roles. Sin editar/borrar socios.
- HU-06/07/08: elegir un socio y 1–3 libros distintos; servidor decide reglas y atomicidad. Lista con
  fechas/estado/socio y detalle de líneas; devolución individual, sin editar/borrar préstamo.
- HU-09/10: vencidos con fechas UTC y días calculados por API; reporte admin por fechas inclusivas,
  sin información personal ni reconstrucción desde el catálogo actual.

React 19.2 y Vite 8.3 conforme a la adaptación. TypeScript limita DTOs/campos del contrato;
CSS propio, navegación por hash sin dependencias de producto adicionales. Formularios accesibles,
mensajes españoles, estados de carga/vacío/error, controles por rol y diseño móvil/escritorio.
La API conserva autorización y validaciones definitivas; ocultar acciones no sustituye 401/403.
Las solicitudes autenticadas y login requieren HTTPS confiable. Configuración pública del origen
mediante VITE_API_BASE_URL, sin secretos de backend en el bundle. Se favorece mismo origen con /api/v1.

## Escenarios antes de implementar

1. Cliente: URL/query/JSON exactos, Bearer, multipart sin Content-Type manual, 204/binario,
   sobre de errores, 401 expira sesión y rechazo de transporte inseguro.
2. Interfaz: login inválido/válido, permisos admin/librarian, alta sin password en respuesta,
   filtros/paginación, préstamo sin duplicados y devolución que refresca existencias.
3. Respuestas tardías no reemplazan resultados de búsquedas nuevas; se abortan al desmontar.
4. Compilación TypeScript/producción y pruebas de interacción con API simulada. No presentar
   mocks como recorrido integrado: T-22 conserva aceptación manual con API/infra real.
5. Registrar resultado, alcance y pendientes antes del PR en inglés. Commits pequeños publicados.

Sin multas, reservas, renovaciones, mensajería, importaciones ni nuevos atributos/entidades.
No se renombra ninguna entidad ni se modifica el contrato. T-20, T-21 y T-23 continúan en sus repos.
Se conserva el corte de las 11:00 a. m.; este avance posterior no modifica elegibilidad.
