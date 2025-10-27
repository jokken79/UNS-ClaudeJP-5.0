# JPUNS-Claude-3.0 - Sistema de Gestión de RRHH

## Descripción General

Este es un sistema de gestión de recursos humanos (RRHH) diseñado para agencias de empleo en Japón. La aplicación está construida con una arquitectura moderna de microservicios, utilizando un frontend de Next.js y un backend de FastAPI. La comunicación entre el frontend y el backend se realiza a través de una API RESTful. La aplicación está completamente dockerizada para facilitar su desarrollo, despliegue y escalabilidad.

### Tecnologías Principales

- **Frontend:**
  - Next.js 16.0.0
  - React 19.0.0
  - TypeScript 5.6.0
  - Tailwind CSS 3.4.18
  - Radix UI
  - Recharts
  - Zustand
  - React Hook Form

- **Backend:**
  - FastAPI
  - Python 3.10
  - PostgreSQL (con Alembic para migraciones)
  - SQLAlchemy

- **Contenerización:**
  - Docker
  - Docker Compose

## Cómo Construir y Ejecutar la Aplicación

La aplicación está diseñada para ser ejecutada con Docker Compose, que orquesta los diferentes servicios (frontend, backend, base de datos).

### Requisitos Previos

- Docker y Docker Compose instalados.
- Git para clonar el repositorio.

### Pasos para la Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/jokken79/JPUNS-CLAUDE4.0.git
    cd JPUNS-CLAUDE4.0
    ```

2.  **Configurar las variables de entorno:**
    Copie los archivos de ejemplo `.env.example` y `.env.local.example` a `.env` y `.env.local` respectivamente, y modifique las variables según sea necesario.
    ```bash
    cp .env.example .env
    cp .env.local.example .env.local
    ```

3.  **Construir y ejecutar los contenedores:**
    Utilice Docker Compose para construir las imágenes y levantar los servicios.
    ```bash
    docker-compose up --build -d
    ```
    El flag `-d` ejecuta los contenedores en segundo plano.

4.  **Acceder a la aplicación:**
    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend (API Docs):** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
    - **Adminer (Gestor de BD):** [http://localhost:8080](http://localhost:8080)

### Comandos Útiles de Docker Compose

- **Iniciar los servicios:** `docker-compose start`
- **Detener los servicios:** `docker-compose stop`
- **Ver los logs:** `docker-compose logs -f <nombre_del_servicio>` (e.g., `frontend`, `backend`)
- **Reconstruir un servicio:** `docker-compose build <nombre_del_servicio>`

## Desarrollo

Para el desarrollo, los volúmenes de Docker están configurados para reflejar los cambios del código en tiempo real dentro de los contenedores.

- **Frontend (Next.js):** El servidor de desarrollo de Next.js se ejecuta con `npm run dev`, que soporta recarga en caliente.
- **Backend (FastAPI):** El servidor de FastAPI se ejecuta con `uvicorn` con la opción `--reload`, que reinicia el servidor automáticamente al detectar cambios en el código.

### Scripts Principales

- **`npm run dev`:** Inicia el servidor de desarrollo de Next.js.
- **`npm run build`:** Compila la aplicación de Next.js para producción.
- **`npm run start`:** Inicia el servidor de producción de Next.js.
- **`npm run lint`:** Ejecuta ESLint para el frontend.
- **`npm run type-check`:** Verifica los tipos de TypeScript en el frontend.
- **`alembic upgrade head`:** Aplica las migraciones de la base de datos. Este comando se ejecuta automáticamente al iniciar el servicio `importer`.

## Convenciones de Código

- **Frontend:** El código sigue las convenciones estándar de React y TypeScript, con un fuerte énfasis en componentes funcionales y hooks. El estilo se gestiona con Tailwind CSS.
- **Backend:** El código sigue las mejores prácticas de FastAPI, con un enfoque en la inyección de dependencias y el uso de Pydantic para la validación de datos.
- **General:** Se espera que todo el código nuevo incluya pruebas y siga el estilo del código existente.
