@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Reinstalar Sistema (Mejorado con Debug)

echo.
echo ========================================================
echo       UNS-CLAUDEJP - SISTEMA DE GESTION
echo       REINSTALAR SISTEMA (VERSION MEJORADA - DEBUG)
echo ========================================================
echo.

REM Función para pausar en caso de error
:pause_on_error
if %errorlevel% neq 0 (
    echo.
    echo ERROR: La operacion fallo. Codigo de error: %errorlevel%
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo pausar
)
goto :eof

REM Función para verificar Python
:verificar_python
echo [DIAGNOSTICO] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Python NO esta instalado o no esta en el PATH
    echo.
    echo SOLUCION:
    echo 1. Descarga Python desde: https://www.python.org/downloads/
    echo 2. Durante la instalacion, MARCA "Add Python to PATH"
    echo 3. Reinicia tu computadora
    echo 4. Vuelve a ejecutar este script
    echo.
    echo Presiona cualquier tecla para continuar sin Python...
    pause >nul
    REM No salir, solo continuar
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python encontrado: Version %PYTHON_VERSION%
)
goto :eof

REM Función para verificar Docker
:verificar_docker
echo [DIAGNOSTICO] Verificando Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Docker Desktop NO esta instalado
    echo.
    echo SOLUCION:
    echo 1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo 2. Instala y reinicia Windows
    echo 3. Inicia Docker Desktop
    echo 4. Vuelve a ejecutar este script
    echo.
    echo Presiona cualquier tecla para continuar sin Docker...
    pause >nul
    REM No salir, solo continuar
) else (
    echo ✅ Docker Desktop encontrado
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Docker Desktop NO esta corriendo
    echo.
    echo SOLUCION:
    echo 1. Abre Docker Desktop desde el menu Inicio
    echo 2. Espera a que inicie completamente
    echo 3. Vuelve a ejecutar este script
    echo.
    echo Presiona cualquier tecla para continuar con Docker detenido...
    pause >nul
    REM No salir, solo continuar
) else (
    echo ✅ Docker Desktop esta corriendo
)
goto :eof

REM Función para verificar Docker Compose
:verificar_docker_compose
echo [DIAGNOSTICO] Verificando Docker Compose...
set "DOCKER_COMPOSE_CMD="
docker compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker compose"
    echo ✅ Docker Compose V2 detectado
) else (
    docker-compose version >nul 2>&1
    if %errorlevel% EQU 0 (
        set "DOCKER_COMPOSE_CMD=docker-compose"
        echo ✅ Docker Compose V1 detectado
    ) else (
        echo.
        echo ❌ ERROR: Docker Compose no esta disponible
        echo Docker Compose deberia venir con Docker Desktop.
        echo.
        echo Presiona cualquier tecla para continuar sin Docker Compose...
        pause >nul
        REM No salir, solo continuar
    )
)
goto :eof

REM Función para verificar archivos del proyecto
:verificar_proyecto
echo [DIAGNOSTICO] Verificando archivos del proyecto...

REM Verificar que estamos en el directorio correcto
if not exist "%~dp0\.." (
    echo.
    echo ❌ ERROR: No se puede encontrar el directorio raiz del proyecto
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo continuar
)

cd /d "%~dp0\.."

if not exist "docker-compose.yml" (
    echo.
    echo ❌ ADVERTENCIA: No se encuentra docker-compose.yml
    echo Asegurate de estar ejecutando este script desde la carpeta correcta
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo continuar
)

if not exist "backend" (
    echo.
    echo ❌ ADVERTENCIA: No se encuentra la carpeta 'backend'
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo continuar
)

if not exist "frontend-nextjs" (
    echo.
    echo ❌ ADVERTENCIA: No se encuentra la carpeta 'frontend-nextjs'
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo continuar
)

if not exist "generate_env.py" (
    echo.
    echo ❌ ADVERTENCIA: No se encuentra generate_env.py
    echo Presiona cualquier tecla para continuar...
    pause >nul
    REM No salir, solo continuar
)

echo ✅ Estructura del proyecto verificada (con posibles advertencias)
goto :eof

REM Inicio del script principal
echo Ejecutando verificaciones (con modo debug)...

call :verificar_python
echo Python verificado. Errorlevel: %errorlevel%

call :verificar_docker
echo Docker verificado. Errorlevel: %errorlevel%

call :verificar_docker_compose
echo Docker Compose verificado. Errorlevel: %errorlevel%

call :verificar_proyecto
echo Proyecto verificado. Errorlevel: %errorlevel%

echo.
echo ========================================================
echo ADVERTENCIA IMPORTANTE
echo ========================================================
echo.
echo Esta accion eliminara:
echo   - Todos los contenedores
echo   - Todos los volumenes (BASE DE DATOS)
echo   - Todas las imagenes construidas
echo.
echo Se reinstalara todo desde cero con datos de prueba.
echo.

set /p CONFIRMAR="Estas SEGURO que deseas continuar? (S/N): "
if /i NOT "%CONFIRMAR%"=="S" goto :cancelled

:continue

echo.
echo [0/6] Verificando archivo .env...
echo.

if not exist .env (
    echo      .env no encontrado. Generando automaticamente...
    if exist "generate_env.py" (
        python generate_env.py
        call :pause_on_error
        echo      ✅ OK - Archivo .env generado.
    ) else (
        echo      ❌ ERROR: generate_env.py no encontrado. Creando .env basico...
        (
            echo # Generated by REINSTALAR_MEJORADO_DEBUG.bat
            echo DATABASE_URL=postgresql://uns_admin:admin123@localhost:5432/uns_claudejp
            echo NEXT_PUBLIC_API_URL=http://localhost:8000
            echo JWT_SECRET=your-secret-key-here-change-in-production
        ) > .env
        echo      ✅ OK - Archivo .env basico creado.
    )
) else (
    echo      ✅ OK - Archivo .env ya existe.
)

echo.
echo [1/6] Deteniendo servicios completamente...
echo.

if defined DOCKER_COMPOSE_CMD (
    %DOCKER_COMPOSE_CMD% down
    call :pause_on_error
    echo      ✅ OK - Servicios detenidos.
) else (
    echo      ❌ ADVERTENCIA: Docker Compose no disponible, omitiendo detencion
)

echo.
echo      Esperando 10 segundos para asegurar cierre limpio...
timeout /t 10 /nobreak >nul

echo.
echo [2/6] Eliminando volumenes antiguos...
if defined DOCKER_COMPOSE_CMD (
    %DOCKER_COMPOSE_CMD% down -v
    call :pause_on_error
    echo      ✅ OK - Volumenes eliminados.
) else (
    echo      ❌ ADVERTENCIA: Docker Compose no disponible, omitiendo eliminacion de volumenes
)

echo.
echo [3/6] Limpiando imagenes antiguas...
if defined DOCKER_COMPOSE_CMD (
    docker system prune -f
    echo      ✅ OK - Imagenenes antiguas eliminadas.
) else (
    echo      ❌ ADVERTENCIA: Docker no disponible, omitiendo limpieza de imagenes
)

echo.
echo [4/6] Reconstruyendo imagenes desde cero...
echo      (Esto puede tardar 3-5 minutos)
echo.

if defined DOCKER_COMPOSE_CMD (
    %DOCKER_COMPOSE_CMD% build --no-cache
    call :pause_on_error
) else (
    echo      ❌ ADVERTENCIA: Docker Compose no disponible, omitiendo construccion
)

echo.
echo [5/6] Iniciando servicios nuevos...
echo.

if defined DOCKER_COMPOSE_CMD (
    REM Primero iniciar solo la base de datos
    echo      [5.1] Iniciando PostgreSQL primero...
    %DOCKER_COMPOSE_CMD% up -d db
    call :pause_on_error

    echo      [5.2] Esperando 30 segundos a que PostgreSQL este saludable...
    timeout /t 30 /nobreak >nul

    REM Verificar que la DB este healthy antes de continuar
    echo      [5.3] Verificando salud de PostgreSQL...
    docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
    if %errorlevel% NEQ 0 (
        echo      ADVERTENCIA: PostgreSQL aun no esta 'healthy', esperando 30 segundos mas...
        timeout /t 30 /nobreak >nul

        REM Verificar de nuevo
        docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
        if %errorlevel% NEQ 0 (
            echo      ADVERTENCIA: PostgreSQL aun en recovery, esperando 30 segundos adicionales...
            timeout /t 30 /nobreak >nul
        )
    )

    REM Ahora iniciar el resto de servicios
    echo      [5.4] Iniciando el resto de servicios (importer, backend, frontend, adminer)...
    %DOCKER_COMPOSE_CMD% up -d
    call :pause_on_error

    echo      ✅ OK - Servicios iniciados.
) else (
    echo      ❌ ADVERTENCIA: Docker Compose no disponible, omitiendo inicio de servicios
)

echo.
echo [6/6] Esperando a que los servicios esten completamente listos...
echo.

if defined DOCKER_COMPOSE_CMD (
    echo      [6.1] Esperando a que el importer complete (30 segundos)...
    timeout /t 30 /nobreak >nul

    echo      [6.2] Esperando a que Next.js compile (30 segundos)...
    timeout /t 30 /nobreak >nul

    echo      [6.3] Verificando si existe backup de produccion...
    echo.
    if exist "%~dp0..\backend\backups\production_backup.sql" (
        echo      ✅ Backup encontrado: backend\backups\production_backup.sql
        echo.
        set /p RESTORE="¿Deseas restaurar tus datos guardados? (S/N): "
        if /i "!RESTORE!"=="S" (
            echo.
            echo      🔄 Restaurando datos desde backup...
            echo.
            docker exec -i uns-claudejp-db psql -U uns_admin uns_claudejp < "%~dp0..\backend\backups\production_backup.sql" >nul 2>&1
            if !errorlevel! EQU 0 (
                echo      ✅ Datos restaurados exitosamente desde el backup
                echo.
            ) else (
                echo      ⚠️  Error al restaurar backup (puede ser normal si las tablas ya existen^)
                echo.
            )
        ) else (
            echo      ℹ️  Usando datos demo por defecto
            echo.
        )
    ) else (
        echo      ℹ️  No se encontró backup. Usando datos demo por defecto.
        echo      💡 Tip: Ejecuta BACKUP_DATOS.bat para guardar tus datos actuales.
        echo.
    )

    echo      [6.4] Verificando estado final de contenedores...
    echo.
    %DOCKER_COMPOSE_CMD% ps
    echo.
)

echo.
echo ========================================================
echo       ✅ OK - REINSTALACION COMPLETADA (MODO DEBUG)
echo ========================================================
echo.
echo El sistema ha sido reinstalado con exito.
echo.
echo URLs de Acceso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   Adminer:   http://localhost:8080
echo.
echo Credenciales:
echo   Usuario:   admin
echo   Password:  admin123
echo.
echo Nota: El frontend puede tardar unos minutos en compilar.
echo.

set /p ABRIR="¿Abrir el frontend en el navegador? (S/N): "
if /i "%ABRIR%"=="S" (
    echo.
    echo Abriendo http://localhost:3000 en tu navegador...
    start http://localhost:3000
)

echo.
pause
exit /b 0

:cancelled
echo.
echo Reinstalacion cancelada.
echo.
pause
exit /b 0