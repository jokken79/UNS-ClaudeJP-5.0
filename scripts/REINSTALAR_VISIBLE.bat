@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Reinstalar Sistema (Visible)

:: ============================================================================
:: SECCION DE DIAGNOSTICO
:: ============================================================================
echo.
echo ========================================================
echo   UNS-CLAUDEJP - REINSTALACION DE SISTEMA (v4.2)
echo ========================================================
echo.
echo [FASE 1 de 3] Realizando diagnostico del sistema...
echo.

set "PYTHON_CMD="
set "DOCKER_COMPOSE_CMD="
set "ERROR_FLAG=0"

:verificar_python
echo   [1/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=python"
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo     ✅ Python encontrado (Version %%i)
    goto :verificar_docker
)
py --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=py"
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do echo     ✅ Python encontrado (Version %%i)
    goto :verificar_docker
)
echo     ❌ ERROR: Python no esta instalado o no esta en el PATH.
echo        SOLUCION: Instala Python desde https://www.python.org/downloads/
set "ERROR_FLAG=1"

:verificar_docker
echo   [2/5] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta instalado.
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker instalado.
)

:verificar_docker_running
echo   [3/5] Verificando si Docker Desktop esta corriendo...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta corriendo.
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker Desktop esta corriendo.
)

:verificar_docker_compose
echo   [4/5] Verificando Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker compose"
    echo     ✅ Docker Compose V2 detectado.
    goto :verificar_proyecto
)
docker-compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker-compose"
    echo     ✅ Docker Compose V1 detectado.
    goto :verificar_proyecto
)
echo     ❌ ERROR: Docker Compose no fue encontrado.
set "ERROR_FLAG=1"

:verificar_proyecto
echo   [5/5] Verificando archivos del proyecto...
cd /d "%~dp0\.."
if not exist "docker-compose.yml" (
    echo     ❌ ERROR: No se encuentra 'docker-compose.yml'.
    set "ERROR_FLAG=1"
) else (
    echo     ✅ 'docker-compose.yml' encontrado.
)
if not exist "generate_env.py" (
    echo     ❌ ERROR: No se encuentra 'generate_env.py'.
    set "ERROR_FLAG=1"
) else (
    echo     ✅ 'generate_env.py' encontrado.
)
echo.

:diagnostico_fin
if %ERROR_FLAG% EQU 1 (
    echo ========================================================
    echo ❌ DIAGNOSTICO FALLIDO. Se encontraron errores.
    echo ========================================================
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo ========================================================
echo ✅ DIAGNOSTICO COMPLETADO. Sistema listo para reinstalar.
echo ========================================================
echo.

:: ============================================================================
:: SECCION DE REINSTALACION
:: ============================================================================

echo [FASE 2 de 3] Preparando para la reinstalacion...
echo.
echo ========================================================
echo                 ADVERTENCIA IMPORTANTE
echo ========================================================
echo.
echo    Esta accion eliminara TODOS los datos existentes:
echo      - Contenedores, Base de Datos, Imagenes Docker.
echo.
echo    Se reinstalara todo desde cero.
echo.
echo ========================================================
echo.

set /p CONFIRMAR="Estas SEGURO que deseas continuar? (S/N): "
if /i NOT "%CONFIRMAR%"=="S" goto :cancelled

:continue_reinstall
echo.
echo [Paso 1/5] Generando archivo .env si no existe...
if not exist .env (
    echo      .env no encontrado. Generando...
    %PYTHON_CMD% generate_env.py
    if !errorlevel! neq 0 (
        echo ❌ ERROR: Fallo la generacion de .env.
        pause
        exit /b 1
    )
    echo      ✅ .env generado.
) else (
    echo      ✅ .env ya existe.
)
echo.

echo [Paso 2/5] Deteniendo y eliminando contenedores y volumenes...
%DOCKER_COMPOSE_CMD% down -v
echo      ✅ Servicios detenidos y datos eliminados.
echo.

echo [Paso 3/5] Reconstruyendo imagenes desde cero...
echo.
echo      ⏳ ESTO PUEDE TARDAR 5-15 MINUTOS
echo      📺 Veras el progreso completo a continuacion:
echo.
echo ========================================================
%DOCKER_COMPOSE_CMD% build --no-cache
set BUILD_ERROR=!errorlevel!
echo ========================================================
echo.
if !BUILD_ERROR! neq 0 (
    echo ❌ ERROR: Fallo al construir las imagenes.
    echo.
    pause
    exit /b 1
)
echo      ✅ Imagenes reconstruidas.
echo.

echo [Paso 4/5] Iniciando servicios...
echo      [4.1] Iniciando PostgreSQL...
%DOCKER_COMPOSE_CMD% up -d db
echo      [4.2] Esperando 30s a que la base de datos se estabilice...
timeout /t 30 /nobreak >nul
echo      [4.3] Iniciando el resto de servicios (importer, backend, frontend)...
echo.
%DOCKER_COMPOSE_CMD% up -d
if !errorlevel! neq 0 (
    echo ❌ ERROR: Fallo al iniciar los servicios.
    pause
    exit /b 1
)
echo.
echo      ✅ Servicios iniciados.
echo.

echo [Paso 5/5] Esperando a que los servicios se estabilicen...
echo      [5.1] Esperando 60s para que el importer termine...
echo           (Migraciones + Admin user + Import data + Access import)
timeout /t 60 /nobreak >nul
echo.

echo      [5.2] Verificando logs del importer para ver si importo Access...
echo.
echo ========================================================
docker logs uns-claudejp-importer 2>&1 | findstr /C:"IMPORTING CANDIDATES" /C:"IMPORT COMPLETE" /C:"Total records" /C:"Imported:" /C:"Photos attached"
echo ========================================================
echo.

echo [FASE 3 de 3] Verificacion final...
echo.
echo Estado de los servicios:
echo.
%DOCKER_COMPOSE_CMD% ps
echo.

echo ========================================================
echo       ✅ REINSTALACION COMPLETADA
echo ========================================================
echo.
echo URLs de Acceso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000/api/docs
echo   Adminer:   http://localhost:8080
echo.
echo Credenciales: admin / admin123
echo.
echo Nota: El frontend puede tardar 1-2 minutos mas en compilar.
echo.
goto :end

:cancelled
echo.
echo Reinstalacion cancelada.
echo.

:end
echo Presiona cualquier tecla para salir...
pause >nul
