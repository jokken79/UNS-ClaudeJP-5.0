# Sistema de Agentes - UNS-CLAUDEJP

## Overview

El Sistema de Agentes es una plataforma de automatización diseñada para el proyecto UNS-CLAUDEJP que permite ejecutar tareas especializadas de mantenimiento, desarrollo, respaldo y optimización mediante agentes configurables.

## 🏗️ Arquitectura

```
agentes/
├── agents_catalog.yaml      # Catálogo de agentes definidos
├── agent_executor.py        # Motor de ejecución de agentes
├── EJECUTAR_AGENTE.bat      # Interfaz gráfica para Windows
├── README.md               # Esta documentación
└── logs/                   # Logs de ejecución (creado automáticamente)
```

## 🚀 Inicio Rápido

### Opción 1: Interfaz Gráfica (Recomendado)

1. Navega a la carpeta `agentes/`
2. Ejecuta `EJECUTAR_AGENTE.bat` (doble clic)
3. Selecciona la opción deseada del menú

### Opción 2: Línea de Comandos

```bash
# Listar todos los agentes
python agent_executor.py list

# Ejecutar un agente específico
python agent_executor.py execute cache_cleaner_basic

# Ver detalles de un agente
python agent_executor.py details cache_cleaner_full
```

## 🤖 Agentes Disponibles

### Agentes de Mantenimiento

#### `cache_cleaner_basic` - Limpieza Cache Básico
- **Propósito**: Limpieza de cache local sin dependencias de Docker
- **Ideal para**: Desarrollo diario, cuando Docker no está disponible
- **Capacidades**:
  - Eliminar `__pycache__` de Python
  - Limpiar cache de Next.js (`.next`, `out`)
  - Eliminar cache de npm (`node_modules/.cache`)
  - Limpiar archivos temporales

#### `cache_cleaner_full` - Limpieza Cache Completo
- **Propósito**: Limpieza completa incluyendo Docker
- **Requiere**: Docker Desktop instalado y en ejecución
- **Capacidades**: Todas las del básico más:
  - Limpiar build cache de Docker
  - Eliminar imágenes colgadas (dangling)
  - Verificación de estado de Docker

#### `cache_cleaner_original` - Versión Original
- **Estado**: ⚠️ Deprecado
- **Nota**: Reemplazado por las versiones mejoradas

### Agentes de Desarrollo

#### `project_initializer` - Inicializador de Proyecto
- **Propósito**: Configura el entorno de desarrollo desde cero
- **Capacidades**:
  - Instalar dependencias
  - Configurar entorno
  - Inicializar servicios

### Agentes de Respaldo

#### `data_backup` - Respaldo de Datos
- **Propósito**: Crea respaldos automáticos de datos críticos
- **Capacidades**:
  - Respaldo de base de datos
  - Respaldo de configuraciones
  - Compresión de archivos

## 📋 Uso Detallado

### Listar Agentes

```bash
# Todos los agentes
python agent_executor.py list

# Por categoría
python agent_executor.py list maintenance
python agent_executor.py list development
python agent_executor.py list backup
python agent_executor.py list diagnostic
python agent_executor.py list optimization
```

### Ejecutar Agentes

```bash
# Ejecución directa
python agent_executor.py execute cache_cleaner_basic

# El sistema verificará:
# - Requisitos del agente
# - Permisos necesarios
# - Disponibilidad de scripts
# - Confirmación del usuario
```

### Ver Detalles

```bash
# Información completa del agente
python agent_executor.py details cache_cleaner_full
```

## 🔧 Configuración

### Requisitos del Sistema

- **Windows OS**: Todos los agentes requieren Windows
- **Python 3.7+**: Para el motor de ejecución
- **Docker Desktop**: Para agentes que usan Docker
- **Permisos de administrador**: Para algunas operaciones

### Configuración del Catálogo

El archivo `agents_catalog.yaml` define:

- **Agentes**: Definición y capacidades
- **Requisitos**: Dependencias necesarias
- **Seguridad**: Niveles de seguridad y permisos
- **Ejecución**: Modos y timeouts

### Políticas de Seguridad

```yaml
security_policies:
  require_confirmation: true        # Siempre pedir confirmación
  admin_privileges_required:        # Agentes que requieren admin
    - cache_cleaner_full
    - cache_cleaner_original
  audit_log: true                   # Mantener logs de auditoría
```

## 📊 Logs y Auditoría

### Ubicación de Logs
```
logs/agents/
├── agent_execution_20251025.log    # Logs del día
└── agent_execution_20251024.log    # Logs anteriores
```

### Formato de Logs
```
[2025-10-25 12:13:45] cache_cleaner_basic: INICIO - Ejecutando Agente Limpieza Cache Básico
[2025-10-25 12:13:50] cache_cleaner_basic: EXITO - Agente ejecutado correctamente
```

## 🛠️ Solución de Problemas

### Problemas Comunes

#### 1. "Python no está instalado"
**Solución**: Instala Python desde https://python.org y asegúrate de agregar al PATH

#### 2. "Docker no está en ejecución"
**Solución**: Inicia Docker Desktop antes de ejecutar agentes que lo requieran

#### 3. "Permisos insuficientes"
**Solución**: Ejecuta como administrador o usa agentes que no requieran privilegios elevados

#### 4. "Script no encontrado"
**Solución**: Verifica las rutas en `agents_catalog.yaml` y que los scripts existan

### Modo Debug

Para ejecutar con información detallada:

```bash
# Ver logs en tiempo real
python agent_executor.py execute cache_cleaner_basic --debug
```

## 🔒 Consideraciones de Seguridad

- **Confirmación requerida**: Todos los agentes piden confirmación antes de ejecutarse
- **Verificación de requisitos**: Se validan todas las dependencias antes de la ejecución
- **Logs de auditoría**: Todas las ejecuciones quedan registradas
- **Niveles de seguridad**: Cada agente tiene un nivel de seguridad asignado

## 🚀 Crear Nuevos Agentes

### 1. Definir el Agente

Agrega a `agents_catalog.yaml`:

```yaml
maintenance_agents:
  - id: "mi_agente_personalizado"
    name: "Mi Agente Personalizado"
    description: "Descripción de lo que hace el agente"
    script_path: "../scripts/mi_script.bat"
    category: "maintenance"
    tags: ["tag1", "tag2"]
    requirements:
      - "Windows OS"
      - "Algún requisito específico"
    capabilities:
      - "Capacidad 1"
      - "Capacidad 2"
    execution_mode: "batch"
    safety_level: "low"
```

### 2. Crear el Script

Crea el script correspondiente en la ruta especificada:

```batch
@echo off
echo Ejecutando mi agente personalizado...
REM Tu lógica aquí
echo Agente completado
pause
```

### 3. Probar el Agente

```bash
python agent_executor.py details mi_agente_personalizado
python agent_executor.py execute mi_agente_personalizado
```

## 📚 Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `EJECUTAR_AGENTE.bat` | Interfaz gráfica completa |
| `python agent_executor.py list` | Listar todos los agentes |
| `python agent_executor.py execute <id>` | Ejecutar agente específico |
| `python agent_executor.py details <id>` | Ver detalles del agente |

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en `logs/agents/`
2. Verifica que todos los requisitos estén cumplidos
3. Consulta la documentación específica del agente
4. Usa el modo debug para información detallada

## 📝 Historial de Cambios

### v1.0 (2025-10-25)
- Creación inicial del sistema de agentes
- Agentes de limpieza de cache (básico y completo)
- Interfaz gráfica para Windows
- Sistema de logs y auditoría
- Documentación completa

---

**Desarrollado por**: Kilo Code  
**Proyecto**: UNS-CLAUDEJP  
**Última actualización**: 2025-10-25