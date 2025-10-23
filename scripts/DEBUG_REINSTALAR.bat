@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - DEBUG Reinstalar

echo.
echo ========================================================
echo       UNS-CLAUDEJP - HERRAMIENTA DE DIAGNOSTICO
echo ========================================================
echo.

echo [INFO] Sistema Operativo: %OS%
echo [INFO] Directorio actual: %CD%
echo [INFO] Script ejecutado desde: %~dp0
echo.

echo [1] Verificando Python...
set "PYTHON_CMD="

REM Primero intentar con 'python'
python --version 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=python"
    echo    ✅ Python encontrado (comando: python)
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo    Version: %%i
    goto :python_check_done
)

REM Si no funciona, intentar con 'py'
py --version 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=py"
    echo    ✅ Python encontrado (comando: py)
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do echo    Version: %%i
    goto :python_check_done
)

REM Si ninguno funciona
echo    ❌ Python no encontrado o no en PATH
echo    Intenta con 'python' o 'py' - ninguno funciona

:python_check_done
echo.

echo [2] Verificando Docker...
docker --version 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Docker no encontrado
) else (
    echo    ✅ Docker encontrado
)
echo.

echo [3] Verificando Docker Desktop (docker ps)...
docker ps 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Docker Desktop no esta corriendo o sin permisos
) else (
    echo    ✅ Docker Desktop corriendo
)
echo.

echo [4] Verificando Docker Compose...
docker compose version 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Docker Compose V2 no encontrado
    docker-compose --version 2>&1
    if %errorlevel% neq 0 (
        echo    ❌ Docker Compose V1 no encontrado
    ) else (
        echo    ✅ Docker Compose V1 encontrado
    )
) else (
    echo    ✅ Docker Compose V2 encontrado
)
echo.

echo [5] Verificando archivos del proyecto...
cd /d "%~dp0\.."
if exist "docker-compose.yml" (
    echo    ✅ docker-compose.yml encontrado
) else (
    echo    ❌ docker-compose.yml NO encontrado
)

if exist "backend" (
    echo    ✅ carpeta backend encontrada
) else (
    echo    ❌ carpeta backend NO encontrada
)

if exist "frontend-nextjs" (
    echo    ✅ carpeta frontend-nextjs encontrada
) else (
    echo    ❌ carpeta frontend-nextjs NO encontrada
)

if exist "generate_env.py" (
    echo    ✅ generate_env.py encontrado
) else (
    echo    ❌ generate_env.py NO encontrado
)
echo.

echo [6] Verificando contenedores existentes...
docker ps -a 2>&1
echo.

echo [7] Verificando imagenes Docker...
docker images 2>&1
echo.

echo [8] Verificando volumenes Docker...
docker volume ls 2>&1
echo.

echo ========================================================
echo DIAGNOSTICO COMPLETADO
echo ========================================================
echo.
echo Si encuentras errores:
echo 1. Python: Instala desde https://www.python.org/downloads/
echo 2. Docker: Instala Docker Desktop desde https://www.docker.com/products/docker-desktop
echo 3. Permisos: Ejecuta como Administrador
echo.
echo Presiona cualquier tecla para salir...
pause >nul