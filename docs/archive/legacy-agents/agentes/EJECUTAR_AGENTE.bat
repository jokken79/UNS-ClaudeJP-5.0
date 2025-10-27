@echo off
chcp 65001 >nul
title UNS-CLAUDEJP - Ejecutor de Agentes

echo.
echo ========================================================
echo   UNS-CLAUDEJP - SISTEMA DE AGENTES
echo ========================================================
echo.
echo Sistema de automatización con agentes especializados
echo para mantenimiento, desarrollo y optimización.
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Python no está instalado o no está en el PATH
    echo Por favor, instale Python para usar el sistema de agentes
    pause
    exit /b 1
)

REM Cambiar al directorio de agentes
cd /d "%~dp0"

REM Verificar si existe el ejecutor de agentes
if not exist "agent_executor.py" (
    echo [ERROR] No se encuentra agent_executor.py
    pause
    exit /b 1
)

REM Verificar si existe el catálogo
if not exist "agents_catalog.yaml" (
    echo [ERROR] No se encuentra agents_catalog.yaml
    pause
    exit /b 1
)

REM Mostrar menú principal
:menu
cls
echo.
echo ========================================================
echo   UNS-CLAUDEJP - MENÚ DE AGENTES
echo ========================================================
echo.
echo 1. Listar todos los agentes
echo 2. Listar agentes de mantenimiento
echo 3. Listar agentes de sistema
echo 4. Listar agentes de desarrollo
echo 5. Listar agentes de control de versiones (Git)
echo 6. Listar agentes de respaldo
echo 7. Listar agentes de utilidades
echo 8. Ejecutar agente específico
echo 9. Ver detalles de un agente
echo 10. Ejecutar limpieza rápida (sin Docker)
echo 11. Ejecutar limpieza completa (con Docker)
echo 12. Iniciar sistema completo
echo 13. Detener sistema completo
echo 14. Diagnosticar sistema
echo 15. Sincronizar con GitHub
echo 16. Ver logs de ejecución
echo 0. Salir
echo.

set /p opcion="Seleccione una opción (0-16): "

if "%opcion%"=="1" (
    echo.
    echo Listando todos los agentes...
    python agent_executor.py list
    pause
    goto menu
)

if "%opcion%"=="2" (
    echo.
    echo Listando agentes de mantenimiento...
    python agent_executor.py list maintenance
    pause
    goto menu
)

if "%opcion%"=="3" (
    echo.
    echo Listando agentes de sistema...
    python agent_executor.py list system
    pause
    goto menu
)

if "%opcion%"=="4" (
    echo.
    echo Listando agentes de desarrollo...
    python agent_executor.py list development
    pause
    goto menu
)

if "%opcion%"=="5" (
    echo.
    echo Listando agentes de control de versiones...
    python agent_executor.py list version_control
    pause
    goto menu
)

if "%opcion%"=="6" (
    echo.
    echo Listando agentes de respaldo...
    python agent_executor.py list backup
    pause
    goto menu
)

if "%opcion%"=="7" (
    echo.
    echo Listando agentes de utilidades...
    python agent_executor.py list utility
    pause
    goto menu
)

if "%opcion%"=="8" (
    echo.
    echo Agentes disponibles:
    python agent_executor.py list
    echo.
    set /p agent_id="Ingrese el ID del agente a ejecutar: "
    if not "%agent_id%"=="" (
        python agent_executor.py execute %agent_id%
    )
    pause
    goto menu
)

if "%opcion%"=="8" (
    echo.
    echo Agentes disponibles:
    python agent_executor.py list
    echo.
    set /p agent_id="Ingrese el ID del agente a consultar: "
    if not "%agent_id%"=="" (
        python agent_executor.py details %agent_id%
    )
    pause
    goto menu
)

if "%opcion%"=="9" (
    echo.
    echo Ejecutando limpieza rápida (sin Docker)...
    python agent_executor.py execute cache_cleaner_basic
    pause
    goto menu
)

if "%opcion%"=="10" (
    echo.
    echo Ejecutando limpieza completa (con Docker)...
    python agent_executor.py execute cache_cleaner_full
    pause
    goto menu
)

if "%opcion%"=="11" (
    echo.
    echo Mostrando logs de ejecución...
    if exist "..\logs\agents" (
        dir "..\logs\agents\*.log" /b
        echo.
        set /p log_file="Ingrese el nombre del archivo log a ver (o Enter para el más reciente): "
        if "%log_file%"=="" (
            for /f "delims=" %%i in ('dir "..\logs\agents\*.log" /b /o:-d') do (
                set log_file=%%i
                goto :show_log
            )
        )
        :show_log
        if exist "..\logs\agents\%log_file%" (
            echo.
            echo Contenido de %log_file%:
            echo ========================================================
            type "..\logs\agents\%log_file%"
        ) else (
            echo [ERROR] No se encuentra el archivo log
        )
    ) else (
        echo [INFO] No hay logs disponibles aún
    )
    pause
    goto menu
)

if "%opcion%"=="0" (
    echo.
    echo Saliendo del sistema de agentes...
    goto end
)

echo.
echo [ERROR] Opción no válida
pause
goto menu

:end
echo.
echo Gracias por usar el sistema de agentes UNS-CLAUDEJP
echo.
pause