# Guía de Scripts Mejorados - UNS-ClaudeJP 4.2

## 📋 Resumen de Mejoras

Se han creado versiones mejoradas de los scripts `.bat` críticos para solucionar el problema de ventanas que se cierran inmediatamente al ejecutarse en otras PCs.

## 🛠️ Scripts Mejorados Disponibles

### 1. `INSTALAR_MEJORADO.bat`
- **Propósito**: Primera instalación del sistema en una nueva PC
- **Mejoras**:
  - Diagnóstico completo de dependencias (Python, Git, Docker)
  - Verificación automática de puertos disponibles
  - Detección de versiones y compatibilidad
  - Pausas automáticas en caso de error
  - Instrucciones claras para instalar dependencias faltantes

### 2. `START_MEJORADO.bat`
- **Propósito**: Iniciar el sistema diariamente
- **Mejoras**:
  - Verificación completa del estado del sistema antes de iniciar
  - Detección de servicios ya corriendo
  - Monitoreo de salud de contenedores
  - Diagnóstico de errores en tiempo real
  - Opciones automáticas para abrir navegador

### 3. `REINSTALAR_MEJORADO.bat`
- **Propósito**: Reinstalación completa del sistema
- **Mejoras**:
  - Diagnóstico previo completo
  - Verificación de Python para generar .env
  - Limpieza segura de volumenes
  - Detección automática de backups
  - Restauración opcional de datos

## 🔍 Problemas Solucionados

### Problema 1: Ventanas que se cierran inmediatamente
- **Causa**: Los scripts no verificaban dependencias y fallaban silenciosamente
- **Solución**: Diagnóstico completo con pausas automáticas en caso de error

### Problema 2: Falta de Python en el PATH
- **Causa**: Los scripts asumían que Python estaba instalado y accesible
- **Solución**: Detección automática de Python con instrucciones para instalación

### Problema 3: Docker Desktop no iniciado
- **Causa**: Los scripts no verificaban si Docker estaba corriendo
- **Solución**: Verificación automática con instrucciones claras

### Problema 4: Rutas relativas incorrectas
- **Causa**: Los scripts no siempre encontraban los archivos del proyecto
- **Solución**: Verificación de estructura del proyecto con rutas robustas

## 📝 Cómo Usar los Scripts Mejorados

### Para Primera Instalación:
1. Descarga el proyecto en una carpeta
2. Ejecuta `scripts\INSTALAR_MEJORADO.bat`
3. Sigue las instrucciones que aparecen en pantalla
4. El script te guiará paso a paso

### Para Uso Diario:
1. Ejecuta `scripts\START_MEJORADO.bat`
2. El script verificará todo antes de iniciar
3. Espera a que todos los servicios estén "Up"
4. Abre http://localhost:3000 en tu navegador

### Para Reinstalar:
1. Ejecuta `scripts\REINSTALAR_MEJORADO.bat`
2. Confirma que deseas continuar (advertencia de pérdida de datos)
3. El script hará backup automático si es posible
4. Espera a que complete la reinstalación

## 🔧 Características de Diagnóstico

Los scripts mejorados incluyen diagnóstico automático de:

### ✅ Dependencias del Sistema
- **Python**: Verifica instalación y versión
- **Git**: Verifica instalación y versión
- **Docker Desktop**: Verifica instalación y estado
- **Docker Compose**: Detecta V1 y V2 automáticamente

### ✅ Estructura del Proyecto
- Verifica carpetas `backend` y `frontend-nextjs`
- Verifica `docker-compose.yml`
- Verifica `generate_env.py`

### ✅ Puertos Disponibles
- Puerto 3000 (Frontend)
- Puerto 8000 (Backend)
- Puerto 5432 (Base de datos)
- Puerto 8080 (Adminer)

### ✅ Estado de Servicios
- Salud de contenedores Docker
- Estado de PostgreSQL (healthy/unhealthy)
- Estado de backend y frontend
- Detección de contenedores con errores

## 🚨 Manejo de Errores

### Si Python no está instalado:
```
❌ ERROR: Python NO esta instalado o no esta en el PATH
SOLUCION:
1. Descarga Python desde: https://www.python.org/downloads/
2. Durante la instalacion, MARCA "Add Python to PATH"
3. Reinicia tu computadora
4. Vuelve a ejecutar este script
```

### Si Docker Desktop no está corriendo:
```
❌ ERROR: Docker Desktop NO esta corriendo
SOLUCION:
1. Abre Docker Desktop desde el menu Inicio
2. Espera a que inicie completamente
3. Vuelve a ejecutar este script
```

### Si hay puertos ocupados:
```
⚠️  ADVERTENCIA: Puerto 3000 esta ocupado
Opciones:
1. Cierra las aplicaciones que usan esos puertos
2. O continua y puede que haya errores
```

## 📊 Comparación: Original vs Mejorado

| Característica | Original | Mejorado |
|----------------|----------|----------|
| Diagnóstico de dependencias | ❌ | ✅ |
| Pausas en caso de error | ❌ | ✅ |
| Detección de Python | ❌ | ✅ |
| Verificación de Docker | ❌ | ✅ |
| Manejo de puertos | Básico | Completo |
| Instrucciones claras | ❌ | ✅ |
| Monitoreo de servicios | ❌ | ✅ |
| Detección de errores | ❌ | ✅ |
| GUIA visual | ❌ | ✅ |
| Auto-recuperación | ❌ | ✅ |

## 🎯 Recomendaciones

### Para Desarrolladores:
- Usa los scripts mejorados para desarrollo
- Los scripts proporcionan mejor diagnóstico de problemas
- Ideal para troubleshooting

### Para Usuarios Finales:
- Usa `START_MEJORADO.bat` para uso diario
- Usa `REINSTALAR_MEJORADO.bat` si hay problemas
- Los scripts te guiarán paso a paso

### Para Soporte Técnico:
- Los scripts mejorados proporcionan información detallada
- Facilitan el diagnóstico remoto de problemas
- Reducen tickets de soporte por instalación

## 🔄 Migración desde Scripts Originales

Si ya usas los scripts originales:

1. **No hay riesgo**: Los scripts mejorados son compatibles
2. **Puedes probar**: Ejecuta los scripts mejorados sin afectar tu instalación
3. **Vuelve atrás**: Siempre puedes usar los scripts originales si prefieres

## 📞 Soporte

Si tienes problemas con los scripts mejorados:

1. Ejecuta `DIAGNOSTICO.bat` para ver el estado completo
2. Revisa los logs con `LOGS.bat`
3. Consulta `TROUBLESHOOTING.md` para problemas comunes
4. Los scripts mejorados te darán instrucciones específicas

---

**Nota**: Los scripts mejorados mantienen toda la funcionalidad de los originales pero agregan robustez y mejor manejo de errores.