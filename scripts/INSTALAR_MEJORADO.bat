@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP - Instalacion Inicial (Mejorada)

echo.
echo ========================================================
echo       UNS-CLAUDEJP - INSTALACION INICIAL
echo       PRIMERA VEZ EN WINDOWS (VERSION MEJORADA)
echo ========================================================
echo.

REM Función para pausar en caso de error
:pause_on_error
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: La operacion fallo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b %errorlevel%
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
    echo Presiona cualquier tecla para abrir la pagina de descarga...
    pause >nul
    start https://www.python.org/downloads/
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python encontrado: Version %PYTHON_VERSION%
)
goto :eof

REM Función para verificar Git
:verificar_git
echo [DIAGNOSTICO] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Git NO esta instalado
    echo.
    echo SOLUCION:
    echo 1. Descarga Git desde: https://git-scm.com/download/win
    echo 2. Instala con opciones por defecto
    echo 3. Reinicia tu computadora
    echo 4. Vuelve a ejecutar este script
    echo.
    echo Presiona cualquier tecla para abrir la pagina de descarga...
    pause >nul
    start https://git-scm.com/download/win
    exit /b 1
) else (
    for /f "tokens=3" %%i in ('git --version 2^>^&1') do set GIT_VERSION=%%i
    echo ✅ Git encontrado: Version %GIT_VERSION%
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
    echo ========================================================
    echo   NECESITAS INSTALAR DOCKER DESKTOP PRIMERO
    echo ========================================================
    echo.
    echo Pasos:
    echo.
    echo 1. Abre tu navegador
    echo 2. Ve a: https://www.docker.com/products/docker-desktop
    echo 3. Descarga "Docker Desktop for Windows"
    echo 4. Instala (siguiente, siguiente, finalizar)
    echo 5. Reinicia Windows
    echo 6. Abre Docker Desktop y espera que inicie
    echo 7. Vuelve a ejecutar este script
    echo.
    echo ========================================================
    echo.

    choice /C SN /M "Quieres abrir la pagina de descarga ahora? (S=Si, N=No)"
    if errorlevel 2 goto :end
    if errorlevel 1 (
        start https://www.docker.com/products/docker-desktop
        echo.
        echo Pagina abierta en tu navegador.
        echo Instala Docker Desktop y vuelve a ejecutar este script.
        echo.
    )
    goto :end
)

echo ✅ Docker instalado. Version:
docker --version
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
        echo ❌ ERROR: Docker Compose NO detectado
        echo.
        echo Docker Compose deberia venir con Docker Desktop.
        echo Asegurate de que Docker Desktop este corriendo.
        echo.
        pause
        exit /b 1
    )
)
goto :eof

REM Función para verificar que Docker Desktop este corriendo
:verificar_docker_corriendo
echo [DIAGNOSTICO] Verificando que Docker Desktop este corriendo...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Docker Desktop NO esta corriendo
    echo.
    echo SOLUCION:
    echo 1. Abre Docker Desktop (icono de ballena en la barra)
    echo 2. Espera a que inicie completamente
    echo 3. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Docker Desktop esta corriendo
)
goto :eof

REM Función para verificar puertos
:verificar_puertos
echo [DIAGNOSTICO] Verificando puertos disponibles...
echo.

set "PORTS_OK=1"

netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 3000 esta ocupado
    set "PORTS_OK=0"
) else (
    echo ✅ Puerto 3000 disponible (Frontend)
)

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 8000 esta ocupado
    set "PORTS_OK=0"
) else (
    echo ✅ Puerto 8000 disponible (Backend)
)

netstat -ano | findstr ":5432 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 5432 esta ocupado
    set "PORTS_OK=0"
) else (
    echo ✅ Puerto 5432 disponible (Base de datos)
)

if "%PORTS_OK%"=="0" (
    echo.
    echo ⚠️  ADVERTENCIA: Algunos puertos estan ocupados
    echo.
    echo Opciones:
    echo 1. Cierra las aplicaciones que usan esos puertos
    echo 2. O continua y puede que haya errores
    echo.
    choice /C CN /M "Deseas continuar de todos modos? (C=Continuar, N=No)"
    if errorlevel 2 (
        echo.
        echo Instalacion cancelada.
        echo.
        echo Para ver que proceso usa un puerto:
        echo   netstat -ano ^| findstr ":3000"
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
    echo ❌ ERROR: No se encuentra docker-compose.yml
    echo Asegurate de estar ejecutando este script desde la carpeta correcta
    pause
    exit /b 1
)

if not exist "backend" (
    echo.
    echo ❌ ERROR: No se encuentra la carpeta 'backend'
    pause
    exit /b 1
)

if not exist "frontend-nextjs" (
    echo.
    echo ❌ ERROR: No se encuentra la carpeta 'frontend-nextjs'
    pause
    exit /b 1
)

if not exist "generate_env.py" (
    echo.
    echo ❌ ERROR: No se encuentra generate_env.py
    pause
    exit /b 1
)

echo ✅ Estructura del proyecto verificada
goto :eof

REM Inicio del script principal
echo.
echo ========================================================
echo FASE 1: DIAGNOSTICO DEL SISTEMA
echo ========================================================
echo.

call :verificar_python
call :verificar_git
call :verificar_docker
call :verificar_docker_compose
call :verificar_docker_corriendo
call :verificar_puertos
call :verificar_proyecto

echo.
echo ========================================================
echo ✅ DIAGNOSTICO COMPLETADO - TODOS LOS REQUISITOS OK
echo ========================================================
echo.

echo.
echo ========================================================
echo FASE 2: INSTALACION DE UNS-CLAUDEJP
echo ========================================================
echo.

echo [1/2] Verificando archivo .env...
if not exist .env (
    echo      .env no encontrado. Generando automaticamente...
    python generate_env.py
    call :pause_on_error
    echo      ✅ OK - Archivo .env generado.
) else (
    echo      ✅ OK - Archivo .env ya existe.
)
echo.

echo [2/2] Instalando UNS-ClaudeJP...
echo.
echo 📋 ESTA ES LA PRIMERA VEZ, tomara 5-10 minutos
echo Docker necesita:
echo   - Descargar imagenes base (Python, Node, PostgreSQL)
echo   - Construir el Backend (FastAPI)
echo   - Construir el Frontend (React)
echo   - Crear volumenes para la base de datos
echo   - Inicializar la base de datos con datos de prueba
echo.
echo ⏳ Por favor, ten paciencia...
echo.

%DOCKER_COMPOSE_CMD% build --no-cache
call :pause_on_error

echo.
echo ✅ Construccion completada
echo.

echo Iniciando servicios por primera vez...
%DOCKER_COMPOSE_CMD% up -d
call :pause_on_error

echo.
echo Esperando a que los servicios esten listos...
echo Esto puede tomar 1-2 minutos...
echo.

timeout /t 60 /nobreak >nul

echo.
echo Estado de los servicios:
%DOCKER_COMPOSE_CMD% ps
echo.

echo ========================================================
echo       ✅ OK - INSTALACION COMPLETADA
echo ========================================================
echo.
echo 🎉 UNS-ClaudeJP esta instalado y corriendo!
echo.
echo URLs de Acceso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo Credenciales de Login:
echo   Usuario:   admin
echo   Password:  admin123
echo.
echo 📝 Nota: El frontend puede tardar 1-2 minutos mas en compilar
echo       Si ves "Loading..." espera un momento y recarga.
echo.

REM Verificar si hay errores en los contenedores
echo 🔍 Verificacion final de errores...
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr "Exited\|Error" >nul 2>&1
if %errorlevel% EQU 0 (
    echo.
    echo ⚠️  ADVERTENCIA: Algunos contenedores tienen errores
    echo.
    echo Contenedores con problemas:
    docker ps --format "table {{.Names}}\t{{.Status}}" | findstr "Exited\|Error"
    echo.
    echo Soluciones recomendadas:
    echo 1. Ejecuta LOGS.bat para ver detalles
    echo 2. Si persiste, ejecuta REINSTALAR.bat
    echo.
) else (
    echo ✅ Todos los contenedores estan funcionando correctamente
    echo.
)

echo ========================================================
echo PROXIMOS PASOS
echo ========================================================
echo.
echo 1. Para iniciar en el futuro:      START.bat
echo 2. Para detener:                   STOP.bat
echo 3. Para ver logs:                  LOGS.bat
echo 4. Para guia rapida:               INSTRUCCIONES_RAPIDAS.txt
echo 5. Para documentacion completa:    README.md
echo 6. Para backup de datos:           BACKUP_DATOS.bat
echo.

choice /C SN /M "Abrir en el navegador ahora? (S=Si, N=No)"
if errorlevel 2 goto :end
if errorlevel 1 (
    echo.
    echo Abriendo navegador...
    start http://localhost:3000
    
    REM Esperar un momento antes de abrir
    echo      Esperando 15 segundos para que Next.js compile...
    timeout /t 15 /nobreak >nul
)

:end
echo.
echo 🎉 ¡Instalacion finalizada con exito!
echo.
echo 📚 Comandos utiles:
echo    START.bat           - Iniciar el sistema
echo    STOP.bat            - Detener todos los servicios
echo    LOGS.bat            - Ver logs en tiempo real
echo    DIAGNOSTICO.bat     - Verificar estado del sistema
echo    BACKUP_DATOS.bat    - Hacer backup de la base de datos
echo.
pause