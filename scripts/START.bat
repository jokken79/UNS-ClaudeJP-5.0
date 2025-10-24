@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Iniciar Sistema (Corregido)

:: ============================================================================
:: SECCION DE DIAGNOSTICO
:: ============================================================================
echo.
echo ========================================================
echo    UNS-CLAUDEJP - INICIAR SISTEMA (v4.2 Corregido)
echo ========================================================
echo.
echo [FASE 1 de 2] Realizando diagnostico del sistema...
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
    echo                  (Asegurate de marcar "Add Python to PATH" durante la instalacion)
set "ERROR_FLAG=1"
echo.

:verificar_docker
echo   [2/5] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta instalado.
    echo        SOLUCION: Instala Docker Desktop desde https://www.docker.com/products/docker-desktop
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker instalado.
)
echo.

:verificar_docker_running
echo   [3/5] Verificando si Docker Desktop esta corriendo...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta corriendo.
    echo        SOLUCION: Inicia Docker Desktop y espera a que este listo.
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker Desktop esta corriendo.
)
echo.

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
    echo        SOLUCION: Asegurate que Docker Desktop este actualizado.
set "ERROR_FLAG=1"
echo.

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
    echo    Por favor, corrige los errores listados arriba y
    echo    vuelve a ejecutar el script.
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo ========================================================
echo ✅ DIAGNOSTICO COMPLETADO. Sistema listo para iniciar.
echo ========================================================
echo.

:: ============================================================================
:: SECCION DE INICIO
:: ============================================================================

echo [FASE 2 de 2] Iniciando servicios de UNS-ClaudeJP...
echo.

echo [Paso 1/4] Generando archivo .env si no existe...
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

echo [Paso 2/4] Iniciando contenedores Docker...
%DOCKER_COMPOSE_CMD% up -d
if !errorlevel! neq 0 (
    echo ❌ ERROR: Fallo al iniciar los contenedores.
    pause
    exit /b 1
)
echo      ✅ Contenedores iniciados.
echo.

echo [Paso 3/4] Esperando a que los servicios se estabilicen (30s)...
timeout /t 30 /nobreak >nul
echo.

echo [Paso 4/4] Verificando estado final de los servicios...
%DOCKER_COMPOSE_CMD% ps
echo.


echo ========================================================
echo       ✅ SISTEMA INICIADO
echo ========================================================
echo.
echo URLs de Acceso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000/api/docs
echo   Adminer:   http://localhost:8080
echo.
echo Credenciales: admin / admin123
echo.
echo Nota: El frontend puede tardar 1-2 minutos en compilar la primera vez.
echo.

set /p ABRIR="¿Abrir el frontend en el navegador? (S/N): "
if /i "%ABRIR%"=="S" (
    echo.
    echo Abriendo http://localhost:3000 en tu navegador...
    start http://localhost:3000
)

goto :end

:end
echo.
echo Presiona cualquier tecla para salir...
pause >nul