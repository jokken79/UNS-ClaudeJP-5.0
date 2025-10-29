@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ==============================================================================
:: INSTALL_007_AGENTS.bat
:: Installs Claude 007 Agent System (88 agents in 18 categories)
:: ==============================================================================

color 0A
title Claude 007 Agents Installer

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         CLAUDE 007 AGENTS - INSTALLATION WIZARD                        ║
echo ║         88 Specialized Agents ^| 18 Categories                          ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

:: Check if claude-007-agents directory exists
if not exist "%~dp0..\claude-007-agents" (
    echo [ERROR] claude-007-agents directory not found!
    echo.
    echo Expected location: %~dp0..\claude-007-agents
    echo.
    echo Please clone the repository first:
    echo   cd "%~dp0.."
    echo   git clone https://github.com/avivl/claude-007-agents.git
    echo.
    pause
    exit /b 1
)

:MENU
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                    INSTALLATION OPTIONS                                ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo   1. Install to UNS-ClaudeJP Project (Recommended)
echo      └─ Adds agents to .claude\agents\ in this project
echo      └─ Version controlled, project-specific
echo.
echo   2. Install Globally (System-wide)
echo      └─ Adds agents to %USERPROFILE%\.claude\agents\
echo      └─ Available for ALL Claude Code projects
echo.
echo   3. Backup Existing Agents
echo      └─ Creates backup of current .claude\agents\ folder
echo.
echo   4. View Agent List
echo      └─ Shows all 88 available agents
echo.
echo   5. Verify Installation
echo      └─ Check if agents are installed correctly
echo.
echo   0. Exit
echo.
echo ════════════════════════════════════════════════════════════════════════
set /p choice="Select option (0-5): "

if "%choice%"=="1" goto INSTALL_PROJECT
if "%choice%"=="2" goto INSTALL_GLOBAL
if "%choice%"=="3" goto BACKUP
if "%choice%"=="4" goto LIST_AGENTS
if "%choice%"=="5" goto VERIFY
if "%choice%"=="0" goto END
goto MENU

:: ==============================================================================
:: Option 1: Install to Project
:: ==============================================================================
:INSTALL_PROJECT
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         INSTALLING TO PROJECT: UNS-ClaudeJP-5.0                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set "PROJECT_AGENTS=%~dp0..\.claude\agents"
set "SOURCE_AGENTS=%~dp0..\claude-007-agents\.claude\agents"
set "SOURCE_JSON=%~dp0..\claude-007-agents\agents.json"

echo [INFO] Target: %PROJECT_AGENTS%
echo [INFO] Source: %SOURCE_AGENTS%
echo.

:: Create backup first
if exist "%PROJECT_AGENTS%" (
    echo [BACKUP] Creating backup of existing agents...
    set "BACKUP_DIR=%~dp0..\.claude\agents.backup.%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_DIR=!BACKUP_DIR: =0!"
    xcopy /E /I /Y "%PROJECT_AGENTS%" "!BACKUP_DIR!" >nul
    echo [OK] Backup created: !BACKUP_DIR!
    echo.
)

:: Create directory if it doesn't exist
if not exist "%PROJECT_AGENTS%" mkdir "%PROJECT_AGENTS%"

echo [INSTALL] Copying 007 agents...
xcopy /E /I /Y "%SOURCE_AGENTS%\*" "%PROJECT_AGENTS%\" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy agents!
    pause
    goto MENU
)

echo [INSTALL] Copying agents.json configuration...
copy /Y "%SOURCE_JSON%" "%~dp0..\agents.json" >nul
if errorlevel 1 (
    echo [WARNING] Failed to copy agents.json (optional)
)

echo.
echo [SUCCESS] ✓ Installation complete!
echo.
echo Installed components:
echo   • 88 specialized agents
echo   • 18 agent categories
echo   • agents.json configuration
echo.
echo Location: %PROJECT_AGENTS%
echo.

:: Count installed agents
for /f %%a in ('dir /b /s "%PROJECT_AGENTS%\*.md" ^| find /c /v ""') do set agent_count=%%a
echo Installed agents: %agent_count% files
echo.

pause
goto MENU

:: ==============================================================================
:: Option 2: Install Globally
:: ==============================================================================
:INSTALL_GLOBAL
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         INSTALLING GLOBALLY (System-wide)                              ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set "GLOBAL_AGENTS=%USERPROFILE%\.claude\agents"
set "SOURCE_AGENTS=%~dp0..\claude-007-agents\.claude\agents"
set "SOURCE_JSON=%~dp0..\claude-007-agents\agents.json"

echo [INFO] Target: %GLOBAL_AGENTS%
echo [INFO] Source: %SOURCE_AGENTS%
echo.
echo [WARNING] This will make agents available to ALL Claude Code projects!
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto MENU

:: Create backup if exists
if exist "%GLOBAL_AGENTS%" (
    echo.
    echo [BACKUP] Creating backup of existing global agents...
    set "BACKUP_DIR=%USERPROFILE%\.claude\agents.backup.%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_DIR=!BACKUP_DIR: =0!"
    xcopy /E /I /Y "%GLOBAL_AGENTS%" "!BACKUP_DIR!" >nul
    echo [OK] Backup created: !BACKUP_DIR!
)

:: Create directory if it doesn't exist
if not exist "%GLOBAL_AGENTS%" mkdir "%GLOBAL_AGENTS%"

echo.
echo [INSTALL] Copying 007 agents to global location...
xcopy /E /I /Y "%SOURCE_AGENTS%\*" "%GLOBAL_AGENTS%\" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy agents!
    pause
    goto MENU
)

echo [INSTALL] Copying agents.json configuration...
copy /Y "%SOURCE_JSON%" "%USERPROFILE%\.claude\agents.json" >nul

echo.
echo [SUCCESS] ✓ Global installation complete!
echo.
echo Agents are now available system-wide for ALL Claude Code projects!
echo Location: %GLOBAL_AGENTS%
echo.

pause
goto MENU

:: ==============================================================================
:: Option 3: Backup Existing Agents
:: ==============================================================================
:BACKUP
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         BACKUP EXISTING AGENTS                                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set "PROJECT_AGENTS=%~dp0..\.claude\agents"

if not exist "%PROJECT_AGENTS%" (
    echo [INFO] No existing agents found to backup.
    pause
    goto MENU
)

set "BACKUP_DIR=%~dp0..\.claude\agents.backup.%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP_DIR=!BACKUP_DIR: =0!"

echo [BACKUP] Creating backup...
echo Source: %PROJECT_AGENTS%
echo Target: !BACKUP_DIR!
echo.

xcopy /E /I /Y "%PROJECT_AGENTS%" "!BACKUP_DIR!" >nul
if errorlevel 1 (
    echo [ERROR] Backup failed!
    pause
    goto MENU
)

echo [SUCCESS] ✓ Backup created successfully!
echo Location: !BACKUP_DIR!
echo.

pause
goto MENU

:: ==============================================================================
:: Option 4: List All Agents
:: ==============================================================================
:LIST_AGENTS
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         CLAUDE 007 AGENTS - COMPLETE LIST                              ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set "SOURCE_AGENTS=%~dp0..\claude-007-agents\.claude\agents"

echo 📁 Agent Categories:
echo.
for /d %%d in ("%SOURCE_AGENTS%\*") do (
    echo   • %%~nxd
)

echo.
echo 🤖 Sample Agents:
echo.
echo   Context Orchestrators:
echo     • @vibe-coding-coordinator - Autonomous development preparation
echo     • @exponential-planner - AI capability-aware planning
echo     • @session-manager - State preservation
echo.
echo   Safety Specialists:
echo     • @leaf-node-detector - Architectural safety analysis
echo     • @permission-escalator - Dynamic permission management
echo     • @verification-specialist - Testing strategies
echo.
echo   Performance Optimizers:
echo     • @parallel-coordinator - Multi-agent coordination
echo     • @tool-batch-optimizer - Resource optimization
echo     • @session-optimizer - Context management
echo.
echo   Universal Specialists:
echo     • @software-engineering-expert - Code quality
echo     • @code-reviewer - Quality assurance
echo     • @orchestrator - Multi-dimensional analysis
echo.
echo   Backend Frameworks:
echo     • @rails-expert - Ruby on Rails
echo     • @django-expert - Django/Python
echo     • @laravel-backend-expert - Laravel/PHP
echo.
echo   Frontend Frameworks:
echo     • @react-component-architect - React components
echo     • @vue-component-architect - Vue.js components
echo     • @react-nextjs-expert - Next.js
echo.
echo   ...and 70+ more specialized agents!
echo.
echo For complete list, see: claude-007-agents\README.md
echo.

pause
goto MENU

:: ==============================================================================
:: Option 5: Verify Installation
:: ==============================================================================
:VERIFY
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         VERIFYING INSTALLATION                                         ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

set "PROJECT_AGENTS=%~dp0..\.claude\agents"
set "GLOBAL_AGENTS=%USERPROFILE%\.claude\agents"
set "PROJECT_JSON=%~dp0..\agents.json"

echo Checking project installation...
if exist "%PROJECT_AGENTS%" (
    for /f %%a in ('dir /b /s "%PROJECT_AGENTS%\*.md" ^| find /c /v ""') do set project_count=%%a
    echo   [OK] ✓ Project agents found: !project_count! files
    echo   Location: %PROJECT_AGENTS%
) else (
    echo   [X] Project agents not found
    set project_count=0
)
echo.

echo Checking global installation...
if exist "%GLOBAL_AGENTS%" (
    for /f %%a in ('dir /b /s "%GLOBAL_AGENTS%\*.md" ^| find /c /v ""') do set global_count=%%a
    echo   [OK] ✓ Global agents found: !global_count! files
    echo   Location: %GLOBAL_AGENTS%
) else (
    echo   [X] Global agents not found
    set global_count=0
)
echo.

echo Checking agents.json...
if exist "%PROJECT_JSON%" (
    echo   [OK] ✓ agents.json found
) else (
    echo   [X] agents.json not found
)
echo.

echo ════════════════════════════════════════════════════════════════════════
if !project_count! GTR 0 (
    echo   STATUS: ✓ Agents installed successfully!
) else if !global_count! GTR 0 (
    echo   STATUS: ✓ Global agents installed successfully!
) else (
    echo   STATUS: ✗ No agents installed
    echo   Run option 1 or 2 to install agents
)
echo ════════════════════════════════════════════════════════════════════════
echo.

pause
goto MENU

:: ==============================================================================
:: Exit
:: ==============================================================================
:END
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║         Thank you for using Claude 007 Agents Installer!              ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo For documentation, see:
echo   • claude-007-agents\README.md
echo   • claude-007-agents\CLAUDE.md
echo.
echo To use agents in Claude Code:
echo   claude "Use @orchestrator to analyze my project"
echo   claude "Use @vibe-coding-coordinator to build feature X"
echo.
exit /b 0
