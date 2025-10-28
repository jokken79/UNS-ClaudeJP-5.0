# ⚡ Inicio Rápido - 5 Minutos

**Objetivo:** Tener UNS-ClaudeJP 5.0 ejecutándose en menos de 5 minutos.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
- ✅ **Git** (opcional, para clonar el repositorio)
- ✅ Puertos disponibles: **3000**, **8000**, **5432**, **8080**

---

## 🚀 Paso 1: Obtener el Código (1 minuto)

### Opción A: Clonar desde GitHub

```bash
git clone https://github.com/jokken79/UNS-ClaudeJP-5.0.git
cd UNS-ClaudeJP-5.0
```

### Opción B: Ya tienes el código

```bash
cd UNS-ClaudeJP-5.0
```

---

## ⚙️ Paso 2: Generar Configuración (30 segundos)

### Windows

```bash
python generate_env.py
```

### Linux/macOS

```bash
python3 generate_env.py
```

Esto creará automáticamente el archivo `.env` con todas las variables necesarias.

---

## 🐳 Paso 3: Iniciar Servicios (2 minutos)

### Windows - Usar Script Automatizado

```bash
cd scripts
START.bat
```

El script hará:
1. ✅ Verificar Docker Desktop está ejecutándose
2. ✅ Construir imágenes (primera vez toma ~2-3 minutos)
3. ✅ Iniciar todos los servicios
4. ✅ Esperar a que estén listos
5. ✅ Crear usuario admin
6. ✅ Importar datos de demostración

**Espera el mensaje:**
```
✓ Todos los servicios están listos!
✓ Frontend: http://localhost:3000
✓ Backend API: http://localhost:8000/api/docs
✓ Adminer: http://localhost:8080
```

### Linux/macOS - Comandos Manuales

```bash
# Generar archivo .env si no existe
python3 generate_env.py

# Iniciar servicios
docker compose up -d

# Esperar a que estén listos (toma ~2 minutos la primera vez)
docker compose logs -f
```

---

## 🎉 Paso 4: Acceder al Sistema (30 segundos)

### 1. Abrir Frontend

Abre tu navegador en: **http://localhost:3000**

### 2. Iniciar Sesión

Usa las credenciales predeterminadas:

```
Usuario: admin
Contraseña: admin123
```

### 3. ¡Listo!

Deberías ver el **Dashboard** principal con:
- Resumen de estadísticas
- Acceso a módulos (Candidatos, Empleados, Factories, etc.)
- Menú lateral de navegación

---

## 🧪 Paso 5: Verificar Instalación (1 minuto)

### Verificar Servicios

| Servicio | URL | ¿Funciona? |
|----------|-----|------------|
| Frontend | http://localhost:3000 | ✅ Login page |
| Backend API | http://localhost:8000/api/docs | ✅ Swagger UI |
| Base de Datos | http://localhost:8080 | ✅ Adminer login |
| Health Check | http://localhost:8000/api/health | ✅ JSON response |

### Verificar Datos

1. **Dashboard:** Deberías ver estadísticas (candidatos, empleados, factories)
2. **Candidatos:** Navega a `/dashboard/candidates` - deberías ver registros de demostración
3. **Empleados:** Navega a `/dashboard/employees` - deberías ver empleados activos

---

## 🎨 Explorar Características

### Módulos Principales

1. **Dashboard** (`/dashboard`)
   - Estadísticas generales
   - Accesos rápidos

2. **Candidatos** (`/dashboard/candidates`)
   - Lista de candidatos
   - Crear nuevo candidato
   - Upload OCR de 履歴書 (Rirekisho)
   - Vista detallada e impresión

3. **Empleados** (`/dashboard/employees`)
   - Lista de empleados activos
   - Crear nuevo empleado
   - Vista Excel
   - Editar información

4. **Factories** (`/dashboard/factories`)
   - Empresas clientes (派遣先)
   - Gestión de sitios

5. **Timercards** (`/dashboard/timercards`)
   - Control de asistencia
   - Registro de horas (朝番/昼番/夜番)

6. **Salary** (`/dashboard/salary`)
   - Cálculo de nómina
   - Reportes de pago

7. **Requests** (`/dashboard/requests`)
   - Solicitudes de empleados (有給, 半休, etc.)
   - Workflow de aprobaciones

### Características Avanzadas

8. **Themes** (`/dashboard/themes`)
   - 12 temas predefinidos
   - Temas personalizados ilimitados

9. **Customizer** (`/dashboard/customizer`)
   - Diseñador visual de temas y templates
   - Live preview

10. **Design Tools** (`/dashboard/design-tools`)
    - Generadores de gradientes, sombras, paletas

---

## 🔧 Comandos Útiles

### Windows (Scripts)

```bash
# Ver logs
scripts\LOGS.bat

# Detener servicios
scripts\STOP.bat

# Reiniciar (⚠️ borra datos)
scripts\REINSTALAR.bat
```

### Linux/macOS (Docker Compose)

```bash
# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Reconstruir (si cambiaste código)
docker compose up -d --build
```

---

## 🐛 Problemas Comunes

### ❌ Error: "Port 3000 is already in use"

**Solución:**

```bash
# Windows
netstat -ano | findstr "3000"
taskkill /PID <pid> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### ❌ Error: "Cannot connect to Docker daemon"

**Solución:**
- Asegúrate de que Docker Desktop esté ejecutándose
- Windows: Abre Docker Desktop desde el menú de inicio
- Verifica con: `docker ps`

### ❌ Frontend muestra pantalla en blanco

**Solución:**
- La compilación de Next.js puede tomar 1-2 minutos la primera vez
- Espera y refresca el navegador
- Verifica logs: `docker compose logs -f frontend`

### ❌ Error 401 al hacer login

**Solución:**
- Verifica que el backend esté ejecutándose: http://localhost:8000/api/health
- Verifica credenciales: `admin` / `admin123`
- Si persiste, consulta: [AUTH_ERROR_401.md](../issues/AUTH_ERROR_401.md)

### ❌ No hay datos de demostración

**Solución:**

```bash
# Windows
docker exec -it uns-claudejp-backend python scripts/import_data.py

# Linux/macOS
docker exec -it uns-claudejp-backend python scripts/import_data.py
```

---

## 📊 Verificar Estado de Servicios

### Todos los contenedores corriendo

```bash
docker ps
```

Deberías ver **4 contenedores** ejecutándose:
- `uns-claudejp-frontend`
- `uns-claudejp-backend`
- `uns-claudejp-db`
- `uns-claudejp-adminer`

### Health Check del Backend

```bash
curl http://localhost:8000/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Verificar Base de Datos

1. Abre http://localhost:8080 (Adminer)
2. Login:
   - **Server:** `db`
   - **Username:** `uns_admin`
   - **Password:** `57UD10R`
   - **Database:** `uns_claudejp`
3. Deberías ver **13 tablas**

---

## 🎓 Siguientes Pasos

Ahora que tienes el sistema ejecutándose:

### Para Usuarios

1. **[Guía de Uso - Temas y UI](../03-uso/temas_y_ui.md)** - Personaliza la apariencia
2. **[Guía OCR](../03-uso/ocr_multi_documento.md)** - Procesa documentos japoneses
3. **[Guía de Impresión](../03-uso/PRINT_SOLUTION_GUIDE.md)** - Imprime rirekishos

### Para Desarrolladores

1. **[CLAUDE.md](../../CLAUDE.md)** - 🔴 **LECTURA OBLIGATORIA**
2. **[Arquitectura](ARCHITECTURE.md)** - Entender el sistema
3. **[Backend Guide](../../backend/README.md)** - Desarrollo backend
4. **[Performance Guide](../../backend/PERFORMANCE_GUIDE.md)** - Optimización

### Para Administradores

1. **[Configuración de Base de Datos](../02-configuracion/base_datos.md)**
2. **[Migraciones Alembic](../02-configuracion/MIGRACIONES_ALEMBIC.md)**
3. **[Backup y Restauración](../02-configuracion/BACKUP_RESTAURACION.md)**
4. **[Troubleshooting](../04-troubleshooting/TROUBLESHOOTING.md)**

---

## 🎯 Resumen de 5 Minutos

1. ✅ **1 min** - Clonar/obtener código
2. ✅ **30 seg** - Generar configuración (`generate_env.py`)
3. ✅ **2 min** - Iniciar servicios (`START.bat` o `docker compose up -d`)
4. ✅ **30 seg** - Login con `admin`/`admin123`
5. ✅ **1 min** - Verificar módulos funcionan

**Total: ~5 minutos** ⚡

---

## 📞 ¿Problemas?

- **Troubleshooting Completo:** [TROUBLESHOOTING.md](../04-troubleshooting/TROUBLESHOOTING.md)
- **Error 401:** [AUTH_ERROR_401.md](../issues/AUTH_ERROR_401.md)
- **Post-Reinstalación:** [POST_REINSTALL_VERIFICATION.md](../04-troubleshooting/POST_REINSTALL_VERIFICATION.md)

---

**¡Felicidades! 🎉 Tienes UNS-ClaudeJP 5.0 funcionando.**

Última actualización: 2025-10-28
