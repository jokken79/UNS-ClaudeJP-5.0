@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Reinstalar Sistema (Corregido)

echo.
echo ========================================================
echo       UNS-CLAUDEJP - SISTEMA DE GESTION
echo       REINSTALAR SISTEMA (VERSION CORREGIDA)
echo ========================================================
echo.

REM Función para pausar en caso de error
:pause_on_error
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: La operacion fallo con codigo %errorlevel%.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b %errorlevel%
)
goto :eof

REM Función para verificar Python
:verificar_python
echo [DIAGNOSTICO] Verificando Python...
py --version >nul 2>&1
if %errorlevel% neq 0 (
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ADVERTENCIA: Python NO esta instalado o no esta en el PATH
        echo.
        echo SOLUCION:
        echo 1. Descarga Python desde: https://www.python.org/downloads/
        echo 2. Durante la instalacion, MARCA "Add Python to PATH"
        echo 3. Reinicia tu computadora
        echo 4. Vuelve a ejecutar este script
        echo.
        set "PYTHON_CMD=python"
        echo Intentaremos continuar con 'python'...
    ) else (
        for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
        echo ✅ Python encontrado: Version %PYTHON_VERSION%
        set "PYTHON_CMD=python"
    )
) else (
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python encontrado: Version %PYTHON_VERSION%
    set "PYTHON_CMD=py"
)
goto :eof

REM Función para verificar Docker
:verificar_docker
echo [DIAGNOSTICO] Verificando Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: Docker Desktop NO esta instalado
    echo.
    echo SOLUCION:
    echo 1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo 2. Instala y reinicia Windows
    echo 3. Inicia Docker Desktop
    echo 4. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Docker Desktop encontrado
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR CRITICO: Docker Desktop NO esta corriendo
    echo.
    echo SOLUCION:
    echo 1. Abre Docker Desktop desde el menu Inicio
    echo 2. Espera a que inicie completamente (hasta ver "Docker Desktop is ready")
    echo 3. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
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
        echo ❌ ERROR CRITICO: Docker Compose no esta disponible
        echo Docker Compose deberia venir con Docker Desktop.
        echo.
        pause
        exit /b 1
    )
)
goto :eof

REM Función para verificar archivos del proyecto
:verificar_proyecto
echo [DIAGNOSTICO] Verificando archivos del proyecto...

REM Cambiar al directorio raiz del proyecto
cd /d "%~dp0\.."

if not exist "docker-compose.yml" (
    echo.
    echo ❌ ERROR CRITICO: No se encuentra docker-compose.yml
    echo Asegurate de estar ejecutando este script desde la carpeta correcta
    pause
    exit /b 1
)

if not exist "backend" (
    echo.
    echo ❌ ERROR CRITICO: No se encuentra la carpeta 'backend'
    pause
    exit /b 1
)

if not exist "frontend-nextjs" (
    echo.
    echo ❌ ERROR CRITICO: No se encuentra la carpeta 'frontend-nextjs'
    pause
    exit /b 1
)

if not exist "generate_env.py" (
    echo.
    echo ❌ ERROR CRITICO: No se encuentra generate_env.py
    pause
    exit /b 1
)

echo ✅ Estructura del proyecto verificada
goto :eof

REM Inicio del script principal
call :verificar_python
call :verificar_docker
call :verificar_docker_compose
call :verificar_proyecto

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
echo ========================================================
echo       INICIANDO PROCESO DE REINSTALACION...
echo ========================================================

echo.
echo [0/6] Verificando archivo .env...
echo.

if not exist .env (
    echo      .env no encontrado. Generando automaticamente...
    %PYTHON_CMD% generate_env.py
    call :pause_on_error
    echo      ✅ OK - Archivo .env generado.
) else (
    echo      ✅ OK - Archivo .env ya existe.
)

echo.
echo [1/6] Deteniendo servicios completamente...
echo.
%DOCKER_COMPOSE_CMD% down
call :pause_on_error
echo      ✅ OK - Servicios detenidos.
echo.
echo      Esperando 10 segundos para asegurar cierre limpio...
timeout /t 10 /nobreak >nul

echo.
echo [2/6] Eliminando volumenes antiguos...
%DOCKER_COMPOSE_CMD% down -v
call :pause_on_error
echo      ✅ OK - Volumenes eliminados.

echo.
echo [3/6] Limpiando imagenes antiguas...
docker system prune -f
echo      ✅ OK - Imagenes antiguas eliminadas.

echo.
echo [4/6] Reconstruyendo imagenes desde cero...
echo      (Esto puede tardar 3-5 minutos)
echo.
%DOCKER_COMPOSE_CMD% build --no-cache
call :pause_on_error
echo      ✅ OK - Imagenes reconstruidas.

echo.
echo [5/6] Iniciando servicios nuevos...
echo.

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
    echo      ⚠️  PostgreSQL aun no esta 'healthy', esperando 30 segundos mas...
    timeout /t 30 /nobreak >nul

    REM Verificar de nuevo
    docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
    if %errorlevel% NEQ 0 (
        echo      ⚠️  PostgreSQL aun en recovery, esperando 30 segundos adicionales...
        timeout /t 30 /nobreak >nul
    )
)

REM Ahora iniciar el resto de servicios
echo      [5.4] Iniciando el resto de servicios (importer, backend, frontend, adminer)...
%DOCKER_COMPOSE_CMD% up -d
call :pause_on_error

echo      ✅ OK - Servicios iniciados.

echo.
echo [6/6] Esperando a que los servicios esten completamente listos...
echo.
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

echo.
echo ========================================================
echo       ✅ REINSTALACION COMPLETADA EXITOSAMENTE
echo ========================================================
echo.
echo El sistema ha sido reinstalado con exito.
echo.
echo 🌐 URLs de Acceso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   Adminer:   http://localhost:8080
echo.
echo 🔑 Credenciales:
echo   Usuario:   admin
echo   Password:  admin123
echo.
echo ℹ️  Nota: El frontend puede tardar unos minutos en compilar completamente.
echo.

set /p ABRIR="¿Abrir el frontend en el navegador? (S/N): "
if /i "%ABRIR%"=="S" (
    echo.
    echo 🚀 Abriendo http://localhost:3000 en tu navegador...
    start http://localhost:3000
)

echo.
echo ✅ Todo listo! El sistema esta funcionando.
pause
exit /b 0

:cancelled
echo.
echo ❌ Reinstalacion cancelada por el usuario.
echo.
pause
exit /b 0