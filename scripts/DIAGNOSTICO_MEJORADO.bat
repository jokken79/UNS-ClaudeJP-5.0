@echo off
setlocal EnableDelayedExpansion

title UNS-ClaudeJP 4.0 - Diagnostico Completo (Mejorado)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║        🔍 UNS-CLAUDEJP 4.0 - DIAGNOSTICO COMPLETO           ║
echo ║              VERSION MEJORADA DETALLADA                       ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Contador de problemas encontrados
set "PROBLEMAS=0"
set "ADVERTENCIAS=0"

REM Función para contar problemas
:contar_problema
set /a PROBLEMAS+=1
goto :eof

REM Función para contar advertencias
:contar_advertencia
set /a ADVERTENCIAS+=1
goto :eof

REM Función para mostrar resultado
:mostrar_resultado
if %errorlevel% equ 0 (
    echo    ✅ %~1
) else (
    echo    ❌ %~2
    call :contar_problema
)
goto :eof

REM Cambiar al directorio raiz del proyecto
cd /d "%~dp0\.."

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    📋 REQUISITOS DEL SISTEMA                  ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [1/6] Verificando Python...
echo --------------------------------------------------------
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Python NO esta instalado
    echo    💡 Descarga: https://www.python.org/downloads/
    echo    🔧 IMPORTANTE: Marca "Add Python to PATH" durante instalación
    call :contar_problema
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo    ✅ Python encontrado: Version %PYTHON_VERSION%
    
    REM Verificar si pip está disponible
    pip --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo    ⚠️  Advertencia: pip no disponible (puede causar problemas)
        call :contar_advertencia
    ) else (
        echo    ✅ pip disponible
    )
)
echo.

echo [2/6] Verificando Git...
echo --------------------------------------------------------
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Git NO esta instalado
    echo    💡 Descarga: https://git-scm.com/download/win
    call :contar_problema
) else (
    for /f "tokens=3" %%i in ('git --version 2^>^&1') do set GIT_VERSION=%%i
    echo    ✅ Git encontrado: Version %GIT_VERSION%
    
    REM Verificar configuración de usuario
    git config user.name >nul 2>&1
    if %errorlevel% neq 0 (
        echo    ⚠️  Advertencia: Git no tiene configurado usuario.name
        call :contar_advertencia
    ) else (
        echo    ✅ Git configurado correctamente
    )
)
echo.

echo [3/6] Verificando Docker...
echo --------------------------------------------------------
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Docker Desktop NO esta instalado
    echo    💡 Descarga: https://www.docker.com/products/docker-desktop
    call :contar_problema
) else (
    echo    ✅ Docker instalado
    docker --version
    
    REM Verificar si Docker Desktop está corriendo
    docker ps >nul 2>&1
    if %errorlevel% neq 0 (
        echo    ❌ Docker Desktop NO esta corriendo
        echo    🔧 Solución: Inicia Docker Desktop desde el menú Inicio
        call :contar_problema
    ) else (
        echo    ✅ Docker Desktop esta corriendo
        
        REM Verificar Docker Compose
        docker compose version >nul 2>&1
        if %errorlevel% EQU 0 (
            echo    ✅ Docker Compose V2 disponible
            set "DC=docker compose"
        ) else (
            docker-compose version >nul 2>&1
            if %errorlevel% EQU 0 (
                echo    ✅ Docker Compose V1 disponible
                set "DC=docker-compose"
            ) else (
                echo    ❌ Docker Compose no disponible
                call :contar_problema
            )
        )
    )
)
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🌐 RED Y PUERTOS                          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [4/6] Verificando puertos disponibles...
echo --------------------------------------------------------

netstat -ano | findstr "LISTENING" | findstr ":3000 " >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ⚠️  Puerto 3000 (Frontend) ya esta en uso
    call :contar_advertencia
) else (
    echo    ✅ Puerto 3000 disponible (Frontend)
)

netstat -ano | findstr "LISTENING" | findstr ":8000 " >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ⚠️  Puerto 8000 (Backend) ya esta en uso
    call :contar_advertencia
) else (
    echo    ✅ Puerto 8000 disponible (Backend)
)

netstat -ano | findstr "LISTENING" | findstr ":5432 " >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ⚠️  Puerto 5432 (Base de datos) ya esta en uso
    call :contar_advertencia
) else (
    echo    ✅ Puerto 5432 disponible (Base de datos)
)

netstat -ano | findstr "LISTENING" | findstr ":8080 " >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ⚠️  Puerto 8080 (Adminer) ya esta en uso
    call :contar_advertencia
) else (
    echo    ✅ Puerto 8080 disponible (Adminer)
)
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    📁 ARCHIVOS DEL PROYECTO                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [5/6] Verificando estructura del proyecto...
echo --------------------------------------------------------

if exist ".gitignore" (
    echo    ✅ .gitignore encontrado
) else (
    echo    ❌ .gitignore NO encontrado (riesgo de seguridad)
    call :contar_problema
)

if exist "docker-compose.yml" (
    echo    ✅ docker-compose.yml encontrado
) else (
    echo    ❌ docker-compose.yml NO encontrado
    call :contar_problema
)

if exist "backend" (
    echo    ✅ Carpeta backend encontrada
    
    REM Verificar archivos importantes del backend
    if exist "backend\requirements.txt" (
        echo    ✅ requirements.txt encontrado
    ) else (
        echo    ❌ requirements.txt NO encontrado
        call :contar_problema
    )
    
    if exist "backend\main.py" (
        echo    ✅ main.py encontrado
    ) else (
        echo    ❌ main.py NO encontrado
        call :contar_problema
    )
) else (
    echo    ❌ Carpeta backend NO encontrada
    call :contar_problema
)

if exist "frontend-nextjs" (
    echo    ✅ Carpeta frontend-nextjs encontrada
    
    REM Verificar archivos importantes del frontend
    if exist "frontend-nextjs\package.json" (
        echo    ✅ package.json encontrado
    ) else (
        echo    ❌ package.json NO encontrado
        call :contar_problema
    )
    
    if exist "frontend-nextjs\next.config.ts" (
        echo    ✅ next.config.ts encontrado
    ) else (
        echo    ❌ next.config.ts NO encontrado
        call :contar_problema
    )
) else (
    echo    ❌ Carpeta frontend-nextjs NO encontrada
    call :contar_problema
)

if exist "generate_env.py" (
    echo    ✅ generate_env.py encontrado
) else (
    echo    ❌ generate_env.py NO encontrado
    call :contar_problema
)
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🔐 CONFIGURACION                          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [6/6] Verificando configuracion...
echo --------------------------------------------------------

if exist ".env" (
    echo    ✅ Archivo .env existe
    
    REM Verificar variables importantes
    findstr "POSTGRES_PASSWORD" .env >nul 2>&1
    if %errorlevel% EQU 0 (
        echo    ✅ POSTGRES_PASSWORD configurado
    ) else (
        echo    ⚠️  POSTGRES_PASSWORD no encontrado
        call :contar_advertencia
    )
    
    findstr "SECRET_KEY" .env >nul 2>&1
    if %errorlevel% EQU 0 (
        echo    ✅ SECRET_KEY configurado
    ) else (
        echo    ⚠️  SECRET_KEY no encontrado
        call :contar_advertencia
    )
    
    findstr "DATABASE_URL" .env >nul 2>&1
    if %errorlevel% EQU 0 (
        echo    ✅ DATABASE_URL configurado
    ) else (
        echo    ⚠️  DATABASE_URL no encontrado
        call :contar_advertencia
    )
) else (
    echo    ⚠️  Archivo .env NO existe (se creará automáticamente)
    call :contar_advertencia
)

REM Verificar si hay contenedores corriendo
if defined DC (
    echo    🔍 Verificando contenedores Docker...
    %DC% ps --format "table {{.Names}}\t{{.Status}}" 2>nul | findstr "Up" >nul 2>&1
    if %errorlevel% EQU 0 (
        echo    ✅ Hay contenedores corriendo
        
        REM Verificar contenedores específicos
        %DC% ps | findstr "uns-claudejp-db" | findstr "Up" >nul 2>&1
        if %errorlevel% EQU 0 (
            echo    ✅ Base de datos corriendo
            
            REM Verificar salud de la base de datos
            docker inspect --format="{{.State.Health.Status}}" uns-claudejp-db 2>nul | findstr "healthy" >nul 2>&1
            if %errorlevel% EQU 0 (
                echo    ✅ Base de datos saludable
            ) else (
                echo    ⚠️  Base de datos en recovery (normal al iniciar)
                call :contar_advertencia
            )
        ) else (
            echo    ❌ Base de datos no corriendo
            call :contar_problema
        )
        
        %DC% ps | findstr "uns-claudejp-backend" | findstr "Up" >nul 2>&1
        if %errorlevel% EQU 0 (
            echo    ✅ Backend corriendo
        ) else (
            echo    ❌ Backend no corriendo
            call :contar_problema
        )
        
        %DC% ps | findstr "uns-claudejp-frontend" | findstr "Up" >nul 2>&1
        if %errorlevel% EQU 0 (
            echo    ✅ Frontend corriendo
        ) else (
            echo    ❌ Frontend no corriendo
            call :contar_problema
        )
    ) else (
        echo    ℹ️  No hay contenedores corriendo (normal si el sistema está detenido)
    )
)
echo.

echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    📊 RESUMEN DEL DIAGNOSTICO                ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

if %PROBLEMAS% EQU 0 (
    if %ADVERTENCIAS% EQU 0 (
        echo 🎉 ¡EXCELENTE! No se encontraron problemas
        echo    El sistema esta listo para funcionar correctamente.
    ) else (
        echo ✅ BUENO: No hay problemas críticos
        echo    ⚠️  Hay %ADVERTENCIAS% advertencias menores
    )
) else (
    echo ❌ SE ENCONTRARON %PROBLEMAS% PROBLEMA(S)
    echo    ⚠️  Hay %ADVERTENCIAS% advertencia(s)
    echo.
    echo 🔧 ACCIONES RECOMENDADAS:
    echo.
    
    if %PROBLEMAS% GTR 0 (
        echo    1. Soluciona los problemas críticos marcados con ❌
        echo    2. Revisa las secciones anteriores para detalles específicos
        echo    3. Vuelve a ejecutar este diagnóstico después de corregir
        echo.
    )
    
    if %ADVERTENCIAS% GTR 0 (
        echo    4. Considera solucionar las advertencias marcadas con ⚠️
        echo    5. Pueden afectar el rendimiento o funcionalidad
        echo.
    )
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🚀 PROXIMOS PASOS                          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

if %PROBLEMAS% EQU 0 (
    echo ✅ ESTADO: Sistema listo para usar
    echo.
    echo Opciones disponibles:
    echo   🔄 START.bat              - Iniciar el sistema
    echo   🔄 START_MEJORADO.bat     - Iniciar con diagnóstico completo
    echo   📋 LOGS.bat              - Ver logs en tiempo real
    echo   🔍 Verificar URLs:
    echo      Frontend:  http://localhost:3000
    echo      Backend:   http://localhost:8000
    echo      Adminer:   http://localhost:8080
    echo.
    echo Credenciales por defecto:
    echo    Usuario: admin
    echo    Password: admin123
) else (
    echo ⚠️  ESTADO: Sistema necesita atención
    echo.
    echo Pasos recomendados:
    echo   1. Soluciona los problemas identificados arriba
    echo   2. Ejecuta INSTALAR_MEJORADO.bat si es primera vez
    echo   3. Ejecuta START_MEJORADO.bat para iniciar con diagnóstico
    echo   4. Usa LOGS.bat para ver detalles de errores
    echo.
    echo Si necesitas ayuda:
    echo   📖 Consulta: docs/guides/SCRIPTS_MEJORADOS_GUIDE.md
    echo   🔧 Verifica: docs/guides/TROUBLESHOOTING.md
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🔗 UTILIDADES ADICIONALES                  ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo Comandos útiles:
echo   📋 Ver estado de contenedores: %DC% ps
echo   📋 Ver logs de todos:        %DC% logs -f
echo   📋 Detener todo:             %DC% down
echo   📋 Reiniciar todo:           %DC% restart
echo   📋 Limpiar Docker:           docker system prune -f
echo.

echo Archivos importantes:
echo   📄 Configuración:           .env
echo   📄 Config Docker:           docker-compose.yml
echo   📄 Dependencias Backend:    backend/requirements.txt
echo   📄 Dependencias Frontend:   frontend-nextjs/package.json
echo.

echo.
set /p SALIR="Presiona Enter para salir..."
echo.

exit /b %PROBLEMAS%