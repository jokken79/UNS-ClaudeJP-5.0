@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP 4.0 - Iniciar Sistema (Mejorado)

echo.
echo ========================================================
echo       UNS-CLAUDEJP 4.0 - INICIAR SISTEMA
echo       VERSION MEJORADA CON DIAGNOSTICO COMPLETO
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
    echo Presiona cualquier tecla para abrir la pagina de descarga...
    pause >nul
    start https://www.docker.com/products/docker-desktop
    exit /b 1
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
        echo ❌ ERROR: Docker Compose no esta disponible
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

REM Función para verificar puertos
:verificar_puertos
echo [DIAGNOSTICO] Verificando puertos disponibles...

netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 3000 ya esta en uso
    echo    Esto puede causar problemas con el frontend
) else (
    echo ✅ Puerto 3000 disponible (Frontend)
)

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 8000 ya esta en uso
    echo    Esto puede causar problemas con el backend
) else (
    echo ✅ Puerto 8000 disponible (Backend)
)

netstat -ano | findstr ":5432 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% EQU 0 (
    echo ⚠️  ADVERTENCIA: Puerto 5432 ya esta en uso
    echo    Esto puede causar problemas con la base de datos
) else (
    echo ✅ Puerto 5432 disponible (Base de datos)
)

goto :eof

REM Inicio del script principal
call :verificar_python
call :verificar_docker
call :verificar_docker_compose
call :verificar_proyecto
call :verificar_puertos

echo.
echo ========================================================
echo DIAGNOSTICO COMPLETADO - TODOS LOS REQUISITOS OK
echo ========================================================
echo.

echo [1/7] Verificando archivo .env...
if not exist .env (
    echo      .env no encontrado. Generando automaticamente...
    python generate_env.py
    call :pause_on_error
    echo      ✅ OK - Archivo .env generado.
) else (
    echo      ✅ OK - Archivo .env ya existe.
)
echo.

echo [2/7] Verificando si los servicios ya estan corriendo...
%DOCKER_COMPOSE_CMD% ps | findstr "Up" >nul 2>&1
if %errorlevel% EQU 0 (
    echo      ⚠️  ADVERTENCIA: Algunos servicios ya estan corriendo
    echo.
    set /p DETENER="¿Deseas detener todos los servicios primero? (S/N): "
    if /i "%DETENER%"=="S" (
        echo      Deteniendo servicios existentes...
        %DOCKER_COMPOSE_CMD% down
        call :pause_on_error
        echo      ✅ Servicios detenidos.
        echo.
    )
)

echo [3/7] Deteniendo contenedores anteriores (si existen)...
%DOCKER_COMPOSE_CMD% down >nul 2>&1
echo      ✅ OK - Limpieza completada.
echo.

echo [4/7] Iniciando servicios...
echo.
echo      📋 IMPORTANTE: La base de datos puede tardar 60-90 segundos.
echo      Esto es NORMAL, especialmente si el sistema se cerro incorrectamente.
echo      PostgreSQL necesita tiempo para recuperar y verificar datos.
echo.
echo      ⏳ Espera pacientemente...
echo.

REM Primero iniciar solo la base de datos
echo      [4.1] Iniciando PostgreSQL primero...
%DOCKER_COMPOSE_CMD% up -d db
call :pause_on_error

echo      [4.2] Esperando 30 segundos a que PostgreSQL este saludable...
timeout /t 30 /nobreak >nul

REM Verificar que la DB este healthy antes de continuar
echo      [4.3] Verificando salud de PostgreSQL...
docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
if %errorlevel% NEQ 0 (
    echo      ⚠️  ADVERTENCIA: PostgreSQL aun no esta 'healthy', esperando 30 segundos mas...
    timeout /t 30 /nobreak >nul
    
    REM Verificar de nuevo
    docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
    if %errorlevel% NEQ 0 (
        echo      ⚠️  ADVERTENCIA: PostgreSQL aun en recovery, esperando 30 segundos adicionales...
        timeout /t 30 /nobreak >nul
    )
)

REM Ahora iniciar el resto de servicios
echo      [4.4] Iniciando el resto de servicios...
%DOCKER_COMPOSE_CMD% up -d
call :pause_on_error

echo      ✅ OK - Todos los servicios iniciados.
echo.

echo [5/7] Verificando estado de los contenedores...
echo.
%DOCKER_COMPOSE_CMD% ps
echo.

REM Verificar que todos los contenedores estén corriendo
echo [6/7] Verificando salud de los servicios...
echo.

REM Verificar base de datos
docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul
if %errorlevel% EQU 0 (
    echo      ✅ Base de datos: Saludable
) else (
    echo      ⚠️  Base de datos: En recovery (normal al iniciar)
)

REM Verificar backend
docker ps | findstr "uns-claudejp-backend" | findstr "Up" >nul 2>&1
if %errorlevel% EQU 0 (
    echo      ✅ Backend: Corriendo
) else (
    echo      ❌ Backend: No esta corriendo
)

REM Verificar frontend
docker ps | findstr "uns-claudejp-frontend" | findstr "Up" >nul 2>&1
if %errorlevel% EQU 0 (
    echo      ✅ Frontend: Corriendo
) else (
    echo      ❌ Frontend: No esta corriendo
)

REM Verificar importer
docker ps | findstr "uns-claudejp-importer" | findstr "Up" >nul 2>&1
if %errorlevel% EQU 0 (
    echo      ✅ Importer: Corriendo
) else (
    echo      ⚠️  Importer: No esta corriendo (opcional)
)

echo.

echo [7/7] Esperando a que los servicios esten completamente listos...
echo.
echo      Esperando 20 segundos adicionales para compilacion de Next.js...
timeout /t 20 /nobreak >nul

echo.
echo ========================================================
echo       ✅ SISTEMA INICIADO
echo ========================================================
echo.
echo URLs de Acceso:
echo    Frontend:         http://localhost:3000
echo    API Docs:         http://localhost:8000/api/docs
echo    Base de Datos:    http://localhost:8080 (Adminer)
echo    Health Check:     http://localhost:8000/api/health
echo.
echo Credenciales de Login:
echo    Usuario:   admin
echo    Password:  admin123
echo.
echo 📝 NOTAS IMPORTANTES:
echo  * El frontend puede tardar 1-2 minutos en compilar (Next.js)
echo  * Si ves "Loading..." en el navegador, espera y recarga
echo  * Si la BD esta "unhealthy", espera 30-60 segundos mas
echo  * Si hay problemas, ejecuta LOGS.bat para ver los detalles
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
    echo 1. Espera 30 segundos mas
    echo 2. Ejecuta LOGS.bat para ver detalles
    echo 3. Si persiste, ejecuta REINSTALAR.bat
    echo.
) else (
    echo ✅ Todos los contenedores estan funcionando correctamente
    echo.
)

set /p ABRIR="¿Abrir el frontend en el navegador? (S/N): "
if /i "%ABRIR%"=="S" (
    echo.
    echo Abriendo http://localhost:3000 en tu navegador...
    start http://localhost:3000
    
    REM Esperar un momento antes de abrir
    echo      Esperando 15 segundos para que Next.js compile...
    timeout /t 15 /nobreak >nul
)

echo.
echo 🎉 ¡Disfruta de UNS-ClaudeJP!
echo.
echo 📚 Comandos utiles:
echo    LOGS.bat           - Ver logs en tiempo real
echo    STOP.bat           - Detener todos los servicios
echo    BACKUP_DATOS.bat   - Hacer backup de la base de datos
echo    DIAGNOSTICO.bat    - Verificar estado del sistema
echo.
pause