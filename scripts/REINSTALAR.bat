@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title UNS-ClaudeJP 5.0 - Reinstalar Sistema (Completo)

echo ========================================================
echo   UNS-CLAUDEJP 5.0 - REINSTALACION DE SISTEMA (Completa)
echo ========================================================
echo.
echo [FASE 1 de 3] Realizando diagnostico del sistema
echo.

REM Variables globales
set "PYTHON_CMD="
set "DOCKER_COMPOSE_CMD="
set "ERROR_FLAG=0"

:verificar_python
echo   [1/5] Verificando Python
REM Intentar python
python --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=python"
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo     [OK] %%i encontrado.
    goto :verificar_docker
)
REM Intentar py
py --version >nul 2>&1
if %errorlevel% EQU 0 (
    set "PYTHON_CMD=py"
    for /f "tokens=*" %%i in ('py --version 2^>^&1') do echo     [OK] %%i encontrado.
    goto :verificar_docker
)
echo     [ERROR] Python no instalado o no esta en PATH
set "ERROR_FLAG=1"

:verificar_docker
echo   [2/5] Verificando Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     [ERROR] Docker Desktop no instalado o no esta en PATH
    set "ERROR_FLAG=1"
) else (
    for /f "tokens=*" %%i in ('docker --version 2^>^&1') do echo     [OK] %%i encontrado.
)

:verificar_docker_running
echo   [3/5] Verificando si Docker Desktop esta corriendo
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo     [AVISO] Docker Desktop no esta corriendo.
    echo     [^>] Intentando iniciar Docker Desktop...

    REM Buscar Docker Desktop en rutas comunes
    set "DOCKER_DESKTOP_PATH="
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        set "DOCKER_DESKTOP_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        set "DOCKER_DESKTOP_PATH=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    )

    if "!DOCKER_DESKTOP_PATH!"=="" (
        echo     [ERROR] No se pudo encontrar Docker Desktop.exe
        echo     [INFO] Por favor inicia Docker Desktop manualmente y ejecuta este script de nuevo
        set "ERROR_FLAG=1"
        goto :verificar_docker_compose
    )

    REM Iniciar Docker Desktop
    start "" "!DOCKER_DESKTOP_PATH!"

    REM Esperar hasta 90 segundos
    echo     [WAIT] Esperando a que Docker Desktop este listo (90s max)...
    set WAIT_COUNT=0
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker ps >nul 2>&1
    if %errorlevel% EQU 0 (
        echo     [OK] Docker Desktop esta corriendo.
        goto :verificar_docker_compose
    )
    set /a WAIT_COUNT+=5
    if !WAIT_COUNT! LSS 90 (
        echo     [WAIT] Esperando... (!WAIT_COUNT!s de 90s)
        goto :wait_docker
    )

    echo     [ERROR] Docker Desktop no inicio en 90 segundos
    echo     [INFO] Por favor verifica Docker Desktop manualmente
    set "ERROR_FLAG=1"
) else (
    echo     [OK] Docker Desktop esta corriendo.
)

:verificar_docker_compose
echo   [4/5] Verificando Docker Compose
docker compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker compose"
    for /f "tokens=*" %%i in ('docker compose version 2^>^&1') do echo     [OK] %%i detectado (V2).
    goto :verificar_proyecto
)
docker-compose version >nul 2>&1
if %errorlevel% EQU 0 (
    set "DOCKER_COMPOSE_CMD=docker-compose"
    for /f "tokens=*" %%i in ('docker-compose version 2^>^&1') do echo     [OK] %%i detectado (V1).
    goto :verificar_proyecto
)
echo     [ERROR] Docker Compose no encontrado
set "ERROR_FLAG=1"

:verificar_proyecto
echo   [5/5] Verificando archivos del proyecto
cd /d "%~dp0\.."
if not exist "docker-compose.yml" (
    echo     [ERROR] No se encuentra docker-compose.yml en: %CD%
    set "ERROR_FLAG=1"
) else (
    echo     [OK] docker-compose.yml encontrado.
)
if not exist "generate_env.py" (
    echo     [ERROR] No se encuentra generate_env.py en: %CD%
    set "ERROR_FLAG=1"
) else (
    echo     [OK] generate_env.py encontrado.
)

:diagnostico_fin
echo.
if %ERROR_FLAG% EQU 1 (
    echo ========================================================
    echo [ERROR] DIAGNOSTICO FALLIDO
    echo ========================================================
    echo.
    echo Por favor corrige los errores anteriores antes de continuar.
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo ========================================================
echo [OK] DIAGNOSTICO COMPLETADO. Sistema listo para reinstalar.
echo ========================================================
echo.

REM ========================================================
REM FASE 2: REINSTALACION
REM ========================================================

echo.
echo [FASE 2 de 3] Preparando para la reinstalacion
echo.
echo ========================================================
echo                 ADVERTENCIA IMPORTANTE
echo ========================================================
echo.
echo    Esta accion eliminara TODOS los datos existentes:
echo      - Contenedores Docker
echo      - Base de Datos PostgreSQL
echo      - Volumenes Docker
echo      - Imagenes Docker
echo.
echo    Se creara una instalacion completamente nueva desde cero.
echo.
echo ========================================================
echo.

set /p CONFIRMAR="Estas SEGURO que deseas continuar? (S/N): "
if /i NOT "%CONFIRMAR%"=="S" goto :cancelled

:continue_reinstall
echo.
echo Iniciando reinstalacion completa...
echo.

echo [Paso 1/7] Generando archivo .env si no existe
if not exist .env (
    echo      [^>] Generando .env con generate_env.py...
    %PYTHON_CMD% generate_env.py
    if !errorlevel! neq 0 (
        echo      [ERROR] Fallo la generacion de .env.
        echo.
        pause
        exit /b 1
    )
    echo      [OK] .env generado correctamente.
) else (
    echo      [OK] .env ya existe, se mantendra la configuracion actual.
)
echo.

echo [Paso 2/7] Deteniendo y eliminando contenedores y volumenes
echo      [^>] Deteniendo servicios existentes...
%DOCKER_COMPOSE_CMD% down -v
if !errorlevel! neq 0 (
    echo      [AVISO] Algunos contenedores ya estaban detenidos.
) else (
    echo      [OK] Servicios detenidos y datos eliminados.
)
echo.

echo [Paso 3/7] Copiando datos de factories desde backup
echo      [^>] Creando directorio config\factories si no existe...
if not exist "config\factories" mkdir "config\factories"
echo      [^>] Buscando archivos JSON en config\factories\backup...
if exist "config\factories\backup" (
    for /r "config\factories\backup" %%F in (*.json) do (
        echo         Copiando: %%~nxF
        copy "%%F" "config\factories\" /Y >nul
    )
    echo      [OK] Datos de factories copiados desde backup.
) else (
    echo      [INFO] No se encontro directorio de backup, se continuara sin datos de factories.
)
echo.

echo [Paso 4/7] Reconstruyendo imagenes desde cero
echo      [INFO] Primera instalacion: 30-40 minutos
echo      [INFO] Reinstalaciones: 5-8 minutos
echo      [^>] Construyendo imagenes sin cache...
set DOCKER_BUILDKIT=1
%DOCKER_COMPOSE_CMD% build --no-cache
if !errorlevel! neq 0 (
    echo      [ERROR] Fallo al construir imagenes Docker
    echo      [INFO] Revisa los logs anteriores para mas detalles
    echo.
    pause
    exit /b 1
)
echo      [OK] Imagenes reconstruidas correctamente.
echo.

echo [Paso 5/7] Iniciando servicios
echo      [5.1] Iniciando PostgreSQL primero...
%DOCKER_COMPOSE_CMD% --profile dev up -d db --remove-orphans
if !errorlevel! neq 0 (
    echo      [ERROR] Fallo al iniciar base de datos
    pause
    exit /b 1
)
echo      [OK] PostgreSQL iniciado.
echo.
echo      [5.2] Esperando 60 segundos a que la base de datos se estabilice...
timeout /t 60 /nobreak >nul
echo      [OK] Base de datos lista.
echo.
echo      [5.3] Iniciando el resto de servicios (backend, frontend, adminer)...
%DOCKER_COMPOSE_CMD% --profile dev up -d --remove-orphans
if !errorlevel! neq 0 (
    echo      [ERROR] Fallo al iniciar servicios
    echo      [INFO] Usa 'docker compose logs' para ver los errores
    pause
    exit /b 1
)
echo      [OK] Todos los servicios iniciados.
echo.

echo [Paso 6/7] Esperando y verificando servicios
echo      [6.1] Esperando 120 segundos para compilacion inicial del frontend...
echo      [INFO] Next.js 16 con Turbopack requiere tiempo inicial de compilacion
timeout /t 120 /nobreak >nul
echo      [OK] Frontend listo.
echo.

echo      [6.2] Verificando si existe backup de produccion...
if exist "%~dp0\..\backend\backups\production_backup.sql" (
    echo      [OK] Backup de produccion encontrado.
    echo.
    set /p RESTORE="Deseas restaurar datos guardados desde el backup? (S/N): "
    if /i "!RESTORE!"=="S" (
        echo      [^>] Restaurando datos desde backup...
        docker exec -i uns-claudejp-db psql -U uns_admin -d uns_claudejp < "%~dp0\..\backend\backups\production_backup.sql" >nul 2>&1
        if !errorlevel! EQU 0 (
            echo      [OK] Datos de produccion restaurados correctamente.
        ) else (
            echo      [AVISO] Error al restaurar backup, se usaran datos demo.
        )
    ) else (
        echo      [INFO] Usando datos demo predeterminados.
    )
) else (
    echo      [INFO] No se encontro backup de produccion.
    echo      [INFO] Se usaran datos demo predeterminados.
)
echo.

echo      [6.3] Auto-extrayendo fotos desde DATABASEJP (Access)...
cd /d "%~dp0\.."
set "PHOTO_JSON=access_photo_mappings.json"
if exist "!PHOTO_JSON!" (
    echo      [INFO] Archivo de mapeo de fotos ya existe: !PHOTO_JSON!
    echo      [INFO] Usando archivo existente para importacion.
) else (
    echo      [^>] Buscando DATABASEJP.accdb en directorios comunes...
    %PYTHON_CMD% backend\scripts\auto_extract_photos_from_databasejp.py >nul 2>&1
    if !errorlevel! EQU 0 (
        if exist "!PHOTO_JSON!" (
            echo      [OK] Fotos extraidas desde DATABASEJP correctamente.
        ) else (
            echo      [AVISO] Script ejecutado pero no se genero !PHOTO_JSON!
        )
    ) else (
        echo      [AVISO] DATABASEJP.accdb no encontrado o error en extraccion.
        echo      [INFO] Se continuara sin importacion de fotos desde Access.
    )
)

if exist "!PHOTO_JSON!" (
    echo      [^>] Copiando archivo de mapeo al contenedor backend...
    docker cp "!PHOTO_JSON!" uns-claudejp-backend:/app/ >nul 2>&1
    if !errorlevel! EQU 0 (
        echo      [OK] Archivo copiado al contenedor.
        echo      [^>] Importando fotos a la base de datos...
        docker exec uns-claudejp-backend python scripts/unified_photo_import.py import-photos --file !PHOTO_JSON! --batch-size 100 >nul 2>&1
        if !errorlevel! EQU 0 (
            echo      [OK] Fotos importadas correctamente a la base de datos.
        ) else (
            echo      [AVISO] Error al importar fotos, pero se continuara.
        )
    ) else (
        echo      [AVISO] Error al copiar archivo al contenedor.
    )
)
echo.

echo      [6.4] Ejecutando migraciones de base de datos (Alembic)...
docker exec uns-claudejp-backend alembic upgrade head >nul 2>&1
if !errorlevel! EQU 0 (
    echo      [OK] Migraciones ejecutadas correctamente.
) else (
    echo      [AVISO] Error al ejecutar migraciones (puede ser normal si ya estan aplicadas).
)
echo.

echo      [6.5] Sincronizando fotos y estados de empleados...
docker exec uns-claudejp-backend python scripts/sync_employee_data_advanced.py >nul 2>&1
if !errorlevel! EQU 0 (
    echo      [OK] Sincronizacion de datos avanzada completada.
) else (
    echo      [AVISO] Error en sincronizacion, pero se continuara.
)
echo.

echo      [6.6] Importando datos completos desde fuentes externas...
echo      [INFO] Este proceso puede tardar 15-30 minutos dependiendo del volumen de datos
echo      [INFO] Se importara desde DATABASEJP.accdb y employee_master.xlsm
echo      [INFO] Mostrando progreso en tiempo real...
echo.
docker exec uns-claudejp-backend python scripts/import_all_from_databasejp.py
if !errorlevel! EQU 0 (
    echo.
    echo      [OK] Importacion completa finalizada correctamente.
) else (
    echo.
    echo      [ERROR] Fallo durante la importacion de datos
    echo      [INFO] Revisa los logs en el contenedor: /app/import_all_*.log
    echo      [INFO] Puedes continuar pero algunos datos pueden faltar
)
echo.

echo      [6.7] Verificacion de datos importados...
echo      [^>] Contando registros en la base de datos...
docker exec uns-claudejp-backend python -c "from app.core.database import SessionLocal; from app.models.models import Candidate, Employee, ContractWorker, Staff, Factory; db = SessionLocal(); print('  Candidatos (履歴書):', db.query(Candidate).count()); print('  Empleados (派遣社員):', db.query(Employee).count()); print('  Empleados (請負社員):', db.query(ContractWorker).count()); print('  Staff (スタッフ):', db.query(Staff).count()); print('  Fabricas (派遣先):', db.query(Factory).count()); db.close()"
echo.

echo      [6.8] Verificacion de correcciones implementadas...
docker exec uns-claudejp-backend python scripts/verify_import_fixes.py
if !errorlevel! EQU 0 (
    echo      [OK] Todas las verificaciones completadas correctamente.
) else (
    echo      [AVISO] Algunas verificaciones fallaron, revisa los logs.
)
echo.

REM ========================================================
REM FASE 3: VERIFICACION FINAL
REM ========================================================

echo.
echo [FASE 3 de 3] Verificacion final del sistema
echo.

echo [Paso 7/7] Verificando estado de todos los servicios
echo.
%DOCKER_COMPOSE_CMD% ps
echo.

echo ========================================================
echo       [OK] REINSTALACION COMPLETADA EXITOSAMENTE
echo ========================================================
echo.
echo Sistema UNS-ClaudeJP 5.0 reinstalado y listo para usar.
echo.
echo --------------------------------------------------------
echo URLs de Acceso:
echo --------------------------------------------------------
echo   Frontend (Next.js 16):  http://localhost:3000
echo   Backend API (FastAPI):  http://localhost:8000
echo   API Docs (Swagger):     http://localhost:8000/api/docs
echo   Adminer (DB Manager):   http://localhost:8080
echo.
echo --------------------------------------------------------
echo Credenciales por Defecto:
echo --------------------------------------------------------
echo   Usuario:  admin
echo   Password: admin123
echo.
echo --------------------------------------------------------
echo Informacion Adicional:
echo --------------------------------------------------------
echo   - Primera carga del frontend puede tardar 1-2 minutos
echo   - El sistema usa Next.js 16 con Turbopack
echo   - Base de datos: PostgreSQL 15
echo   - Para ver logs: scripts\LOGS.bat
echo   - Para detener: scripts\STOP.bat
echo.
echo IMPORTANTE: Cambia las credenciales por defecto en produccion
echo.
goto :end

:cancelled
echo.
echo ========================================================
echo Reinstalacion cancelada por el usuario.
echo ========================================================
echo.
echo No se realizaron cambios en el sistema.
echo.

:end
echo Presiona cualquier tecla para salir...
pause >nul
