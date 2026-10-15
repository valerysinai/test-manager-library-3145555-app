# test-manager-library-3145555-app

> **Prueba técnica · Ficha ADSO 3145555**
> Horario: **miércoles 14 de octubre de 2026, de 6:50 a. m. a 11:00 a. m.** (hora Colombia). Entrega a las **11:00 a. m.**

Este repositorio es el **frontend** de *Manager Library*, en **React**. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3145555-docs`](https://github.com/code-sena/test-manager-library-3145555-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 11:00 a. m.** Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3145555-docs`](https://github.com/code-sena/test-manager-library-3145555-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3145555-api`](https://github.com/code-sena/test-manager-library-3145555-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3145555-app`](https://github.com/code-sena/test-manager-library-3145555-app) | Frontend en React |
| [`test-manager-library-3145555-page`](https://github.com/code-sena/test-manager-library-3145555-page) | Sitio público estático de presentación |
| [`test-manager-library-3145555-infra`](https://github.com/code-sena/test-manager-library-3145555-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3145555-tool`](https://github.com/code-sena/test-manager-library-3145555-tool) | Utilidades: sembrador de datos de demostración |

## T-22 · Interfaz React

El [plan SDD previo](evidence/t-22-plan.md) fue publicado antes del código. La
[evidencia y lista de aceptación](evidence/t-22.md) distingue pruebas simuladas y recorrido integrado.

La interfaz implementa login, catálogo, gestión de libros y portadas para admin, socios,
préstamos de 1–3 libros distintos, devolución individual, vencidos, reporte y alta de bibliotecarios.
Las acciones se muestran según rol; el servidor sigue siendo responsable de autorización,
existencias, unicidad, vencimientos y reglas de negocio. No hay alta de administradores ni
edición/eliminación de socios o préstamos.

La [revisión final de App](evidence/app-final-review.md) documenta la corrección de etiquetas
pendiente de fusionar en main, sus 13 pruebas y el recorrido real repetido con la API ya fusionada.

### Desarrollo y verificación

Requisitos: Node.js 26.5 y npm 11.17 o compatible con el lockfile.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run dev
```

React/React DOM 19.2.9, Vite 8.3.4 y dependencias exactas se conservan en package-lock.json.
`npm run dev` escucha solamente en la máquina local. La pantalla se puede revisar por HTTP,
pero login y llamadas a la biblioteca requieren HTTPS confiable. No se desactiva validación TLS.

### Conexión con la API

`VITE_API_BASE_URL` es configuración pública de compilación; su valor predeterminado es
`/api/v1`. El despliegue de infra sirve React por HTTPS y reenvía `/api/v1` a Laravel en su red
privada. Si se usa otro origen HTTPS, configurar también `CORS_ORIGIN` en la API con el origen
exacto de React. Nunca incluir JWT_SECRET, credenciales de base ni admin en variables VITE.

El token queda únicamente en memoria, desaparece al recargar/cerrar sesión y caduca a las
ocho horas. Una respuesta 401 autenticada vuelve al login. Las portadas se consultan con Bearer,
se muestran con URL de objeto y se liberan al cerrar o sustituir el detalle. No se exponen rutas
de disco. Las fechas se presentan explícitamente en UTC y los mensajes están en español.

### Contenedor

```sh
docker build --build-arg VITE_API_BASE_URL=/api/v1 -t manager-library-app .
```

El contenedor sirve archivos estáticos por su puerto interno 80. Su red, proxy HTTPS y conexión
a Laravel corresponden a T-20 en infra. Este repositorio no crea tablas ni ejecuta migraciones.
El Dockerfile se construyó durante el recorrido integrado descrito en la revisión final.
Una compilación Vite aislada sigue sin sustituir esa verificación de despliegue.

El flujo React checks instala desde el lockfile, ejecuta pruebas y compila. La aceptación T-22
de punta a punta requiere API, base e infraestructura desplegadas juntas; el recorrido automatizado
real y sus revisiones se registran en la evidencia. Los tests simulados no lo sustituyen y la
demostración manual en feria sigue separada. Se conserva la fecha original de entrega.
