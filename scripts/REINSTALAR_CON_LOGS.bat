@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Reinstalar Sistema (CON LOGS)

:: Crear archivo de log
set "LOG_FILE=%~dp0\reinstalar_log.txt"
echo ================================================================== > "%LOG_FILE%"
echo REINSTALAR.BAT - LOG DE EJECUCION >> "%LOG_FILE%"
echo Fecha: %date% %time% >> "%LOG_FILE%"
echo ================================================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: ============================================================================
:: SECCION DE DIAGNOSTICO
:: ============================================================================
echo.
echo ========================================================
echo   UNS-CLAUDEJP - REINSTALACION DE SISTEMA (v4.2 Corregido)
echo ========================================================
echo.
echo [FASE 1 de 3] Realizando diagnostico del sistema...
echo.

echo [FASE 1 de 3] Realizando diagnostico del sistema... >> "%LOG_FILE%"

set "PYTHON_CMD="
set "DOCKER_COMPOSE_CMD="
set "ERROR_FLAG=0"

:verificar_python
echo   [1/5] Verificando Python...
echo   [1/5] Verificando Python... >> "%LOG_FILE%"
python --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=python"
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do (
        echo     ✅ Python encontrado (Version %%i)
        echo     Python encontrado (Version %%i) >> "%LOG_FILE%"
    )
    goto :verificar_docker
)
py --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=py"
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do (
        echo     ✅ Python encontrado (Version %%i)
        echo     Python encontrado (Version %%i) >> "%LOG_FILE%"
    )
    goto :verificar_docker
)
echo     ❌ ERROR: Python no esta instalado o no esta en el PATH.
echo     ERROR: Python no esta instalado >> "%LOG_FILE%"
set "ERROR_FLAG=1"

:verificar_docker
echo   [2/5] Verificando Docker...
echo   [2/5] Verificando Docker... >> "%LOG_FILE%"
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta instalado.
    echo     ERROR: Docker Desktop no esta instalado. >> "%LOG_FILE%"
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker instalado.
    echo     Docker instalado. >> "%LOG_FILE%"
)

:verificar_docker_running
echo   [3/5] Verificando si Docker Desktop esta corriendo...
echo   [3/5] Verificando si Docker Desktop esta corriendo... >> "%LOG_FILE%"
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo     ❌ ERROR: Docker Desktop no esta corriendo.
    echo     ERROR: Docker Desktop no esta corriendo. >> "%LOG_FILE%"
    set "ERROR_FLAG=1"
) else (
    echo     ✅ Docker Desktop esta corriendo.
    echo     Docker Desktop esta corriendo. >> "%LOG_FILE%"
)

:verificar_docker_compose
echo   [4/5] Verificando Docker Compose...
echo   [4/5] Verificando Docker Compose... >> "%LOG_FILE%"
docker compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker compose"
    echo     ✅ Docker Compose V2 detectado.
    echo     Docker Compose V2 detectado. >> "%LOG_FILE%"
    goto :verificar_proyecto
)
docker-compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker-compose"
    echo     ✅ Docker Compose V1 detectado.
    echo     Docker Compose V1 detectado. >> "%LOG_FILE%"
    goto :verificar_proyecto
)
echo     ❌ ERROR: Docker Compose no fue encontrado.
echo     ERROR: Docker Compose no fue encontrado. >> "%LOG_FILE%"
set "ERROR_FLAG=1"

:verificar_proyecto
echo   [5/5] Verificando archivos del proyecto...
echo   [5/5] Verificando archivos del proyecto... >> "%LOG_FILE%"
cd /d "%~dp0\.."
if not exist "docker-compose.yml" (
    echo     ❌ ERROR: No se encuentra 'docker-compose.yml'.
    echo     ERROR: No se encuentra docker-compose.yml >> "%LOG_FILE%"
    set "ERROR_FLAG=1"
) else (
    echo     ✅ 'docker-compose.yml' encontrado.
    echo     docker-compose.yml encontrado. >> "%LOG_FILE%"
)
if not exist "generate_env.py" (
    echo     ❌ ERROR: No se encuentra 'generate_env.py'.
    echo     ERROR: No se encuentra generate_env.py >> "%LOG_FILE%"
    set "ERROR_FLAG=1"
) else (
    echo     ✅ 'generate_env.py' encontrado.
    echo     generate_env.py encontrado. >> "%LOG_FILE%"
)

:diagnostico_fin
if %ERROR_FLAG% EQU 1 (
    echo ========================================================
    echo ❌ DIAGNOSTICO FALLIDO. Se encontraron errores.
    echo ========================================================
    echo DIAGNOSTICO FALLIDO >> "%LOG_FILE%"
    echo.
    echo Log guardado en: %LOG_FILE%
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo ========================================================
echo ✅ DIAGNOSTICO COMPLETADO. Sistema listo para reinstalar.
echo ========================================================
echo DIAGNOSTICO COMPLETADO >> "%LOG_FILE%"

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
if /i NOT "%CONFIRMAR%"=="S" (
    echo Reinstalacion cancelada. >> "%LOG_FILE%"
    goto :cancelled
)

echo Usuario confirmo reinstalacion. >> "%LOG_FILE%"

:continue_reinstall
echo.
echo [Paso 1/5] Generando archivo .env si no existe...
echo [Paso 1/5] Generando .env >> "%LOG_FILE%"
if not exist .env (
    echo      .env no encontrado. Generando...
    %PYTHON_CMD% generate_env.py >> "%LOG_FILE%" 2>&1
    if !errorlevel! neq 0 (
        echo ❌ ERROR: Fallo la generacion de .env.
        echo ERROR: Fallo generacion de .env >> "%LOG_FILE%"
        echo Log guardado en: %LOG_FILE%
        pause
        exit /b 1
    )
    echo      ✅ .env generado.
    echo      .env generado. >> "%LOG_FILE%"
) else (
    echo      ✅ .env ya existe.
    echo      .env ya existe. >> "%LOG_FILE%"
)
echo.

echo [Paso 2/5] Deteniendo y eliminando contenedores y volumenes...
echo [Paso 2/5] Deteniendo contenedores... >> "%LOG_FILE%"
%DOCKER_COMPOSE_CMD% down -v >> "%LOG_FILE%" 2>&1
echo      ✅ Servicios detenidos y datos eliminados.
echo      Servicios detenidos. >> "%LOG_FILE%"
echo.

echo [Paso 3/5] Reconstruyendo imagenes desde cero (puede tardar 3-5 mins)...
echo [Paso 3/5] Reconstruyendo imagenes (esto puede tardar)... >> "%LOG_FILE%"
%DOCKER_COMPOSE_CMD% build --no-cache >> "%LOG_FILE%" 2>&1
if !errorlevel! neq 0 (
    echo ❌ ERROR: Fallo al construir las imagenes. Revisa los logs.
    echo ERROR: Fallo al construir imagenes >> "%LOG_FILE%"
    echo.
    echo Log guardado en: %LOG_FILE%
    echo Revisa el archivo para ver el error completo.
    echo.
    pause
    exit /b 1
)
echo      ✅ Imagenes reconstruidas.
echo      Imagenes reconstruidas. >> "%LOG_FILE%"
echo.

echo [Paso 4/5] Iniciando servicios...
echo [Paso 4/5] Iniciando servicios... >> "%LOG_FILE%"
echo      [4.1] Iniciando PostgreSQL...
%DOCKER_COMPOSE_CMD% up -d db >> "%LOG_FILE%" 2>&1
echo      [4.2] Esperando 30s a que la base de datos se estabilice...
timeout /t 30 /nobreak >nul
echo      [4.3] Iniciando el resto de servicios...
%DOCKER_COMPOSE_CMD% up -d >> "%LOG_FILE%" 2>&1
if !errorlevel! neq 0 (
    echo ❌ ERROR: Fallo al iniciar los servicios.
    echo ERROR: Fallo al iniciar servicios >> "%LOG_FILE%"
    echo.
    echo Log guardado en: %LOG_FILE%
    echo.
    pause
    exit /b 1
)
echo      ✅ Servicios iniciados.
echo      Servicios iniciados. >> "%LOG_FILE%"
echo.

echo [Paso 5/5] Esperando y verificando...
echo      [5.1] Esperando 60s para la compilacion del frontend y la BD...
timeout /t 60 /nobreak >nul
echo.

echo [FASE 3 de 3] Verificacion final...
echo [FASE 3 de 3] Verificacion final... >> "%LOG_FILE%"
echo.
%DOCKER_COMPOSE_CMD% ps >> "%LOG_FILE%" 2>&1
%DOCKER_COMPOSE_CMD% ps
echo.

echo ========================================================
echo       ✅ REINSTALACION COMPLETADA
echo ========================================================
echo REINSTALACION COMPLETADA >> "%LOG_FILE%"
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
echo Log guardado en: %LOG_FILE%
echo.
goto :end

:cancelled
echo.
echo Reinstalacion cancelada.
echo.

:end
echo Presiona cualquier tecla para salir...
pause >nul
