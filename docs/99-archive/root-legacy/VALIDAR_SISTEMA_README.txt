========================================================================
VALIDAR_SISTEMA.bat - Script de Validacion Completa del Sistema
========================================================================

Ubicacion: D:\JPUNS-CLAUDE4.2\scripts\VALIDAR_SISTEMA.bat

PROPOSITO:
----------
Valida el sistema UNS-ClaudeJP 4.2 antes de ejecutar REINSTALAR.bat,
detectando problemas criticos que podrian causar fallas durante la
instalacion.

6 AREAS DE VALIDACION:
-----------------------
[1] Software Base
    - Python >= 3.10
    - Docker Desktop instalado
    - Docker corriendo
    - docker-compose v2

[2] Archivos Criticos
    - docker-compose.yml
    - generate_env.py  
    - config/factories_index.json
    - base-datos/01_init_database.sql
    - docker/Dockerfile.backend
    - docker/Dockerfile.frontend-nextjs
    - backend/app/main.py
    - frontend-nextjs/package.json

[3] Puertos Disponibles
    - 3000 (Frontend)
    - 5432 (PostgreSQL)
    - 8000 (Backend)
    - 8080 (Adminer)

[4] Espacio en Disco
    - Minimo 5 GB libres

[5] Configuracion
    - .env existe o puede generarse
    - docker-compose.yml sintaxis valida

[6] Problemas Conocidos
    - Cadena Alembic (fe6aac62e522)
    - Variables de entorno requeridas:
      * POSTGRES_DB
      * POSTGRES_USER
      * POSTGRES_PASSWORD
      * SECRET_KEY

NIVELES DE SEVERIDAD:
---------------------
[X] CRITICO  - Detiene instalacion (Python, Docker, docker-compose)
[X] ALTO     - Puede causar fallas graves (archivos, espacio, config)
[X] MEDIO    - Problemas menores (.env sin Python)
[!] ADVERTENCIA - No bloquea (puertos, Docker no corriendo)

SALIDA:
-------
- Pantalla: Resumen con contadores de errores
- Archivo: VALIDACION_RESULTADOS.txt (abre automaticamente)

ESTADO FINAL:
-------------
- "SEGURO PARA EJECUTAR REINSTALAR.bat" (0 errores criticos/altos)
- "RIESGOS DETECTADOS" (1+ errores criticos/altos)

USO:
----
1. Doble clic en scripts\VALIDAR_SISTEMA.bat
2. Presiona cualquier tecla para iniciar
3. Espera validacion (30-60 segundos)
4. Revisa el resumen y VALIDACION_RESULTADOS.txt
5. Corrige errores criticos/altos antes de REINSTALAR.bat

EJEMPLO DE SALIDA:
------------------
========================================================================
RESUMEN DE VALIDACION
========================================================================

Verificaciones: 23
Criticos:       0
Altos:          0
Medios:         1
Advertencias:   2

[OK] SEGURO PARA EJECUTAR REINSTALAR.bat

NOTA: 2 advertencias.

========================================================================
Reporte guardado en: VALIDACION_RESULTADOS.txt
========================================================================

CARACTERISTICAS:
----------------
- Robusto: Maneja errores gracefully
- Detallado: Reporte completo con fecha/hora
- Visual: Usa [OK], [X], [!] para claridad
- Auto-abre: Abre reporte automaticamente
- Sin Docker requerido: Funciona sin Docker corriendo

FECHA DE CREACION: 2025-10-26
VERSION: 1.0
TAMAÑO: 11 KB (319 lineas)
========================================================================
