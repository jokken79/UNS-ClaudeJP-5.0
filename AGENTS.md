# AGENTS.md

Este archivo proporciona guía a los agentes cuando trabajan con código en este repositorio.

## Resumen del Proyecto

UNS-ClaudeJP 5.0 es un sistema integral de gestión de RRHH para agencias de staffing japonesas (人材派遣会社), construido con:
- **Backend**: FastAPI 0.115.6 (Python 3.11+) con SQLAlchemy 2.0.36 ORM y PostgreSQL 15
- **Frontend**: Next.js 16.0.0 con React 19.0.0, TypeScript 5.6 y Tailwind CSS 3.4 (App Router)
- **DevOps**: Docker Compose para orquestación

## Comandos Críticos de Desarrollo

### Servicios Docker (Requeridos)
```bash
# Iniciar todos los servicios (perfil desarrollo)
docker compose --profile dev up -d

# Detener todos los servicios
docker compose down

# Ver logs
docker compose logs -f <nombre-servicio>

# Acceder a contenedores
docker exec -it uns-claudejp-backend bash
docker exec -it uns-claudejp-frontend bash
```

### Desarrollo Backend
```bash
# Ejecutar migraciones de base de datos
alembic upgrade head

# Crear nueva migración
alembic revision --autogenerate -m "descripción"

# Crear usuario admin
python scripts/create_admin_user.py

# Importar datos de muestra
python scripts/import_data.py
```

### Desarrollo Frontend
```bash
# Instalar nueva dependencia
npm install <nombre-paquete>

# Verificación de tipos
npm run typecheck

# Linting
npm run lint

# Construir para producción
npm run build
```

## Patrones No Obvios del Proyecto

### Problema de Compatibilidad con React 19
El proyecto incluye `@react-jvectormap/core` que es incompatible con React 19. Este paquete debe ser comentado en package.json antes de ejecutar `npm install`.

### Sistema de Perfiles Docker
El docker-compose.yml usa perfiles para separar entornos de desarrollo y producción:
- Desarrollo: `docker compose --profile dev up -d`
- Producción: `docker compose --profile prod up -d`

### Dependencias de Servicios
Los servicios tienen un orden de inicio estricto: db → importer → backend → frontend
- Backend espera por la salud de la base de datos (período de inicio de 90s)
- Frontend espera por la salud del backend
- Importer se ejecuta una vez y sale después de completar tareas

### Conexión a Base de Datos
Siempre usar el hostname `db` (no localhost) al conectar desde dentro de contenedores Docker.

### Flujo de Autenticación
- Los tokens JWT expiran después de 480 minutos (8 horas)
- Frontend almacena tokens en localStorage
- Backend valida JWT en cada solicitud mediante inyección de dependencias

### Procesamiento OCR
Sistema OCR híbrido con orden de respaldo:
1. Azure Computer Vision (primario)
2. EasyOCR (secundario)
3. Tesseract (fallback)

### Convenciones de Estructura de Archivos
- Endpoints de API del backend en `backend/app/api/` con 15 routers
- Frontend usa Next.js App Router con rutas protegidas en grupo `(dashboard)/`
- Todos los modelos de base de datos en archivo único: `backend/app/models/models.py`
- Migraciones de base de datos en `backend/alembic/versions/`

### Variables de Entorno
Variables críticas en `.env`:
- `DATABASE_URL` - Conexión PostgreSQL
- `SECRET_KEY` - Firma JWT
- `AZURE_COMPUTER_VISION_*` - Credenciales OCR
- `FRONTEND_URL` - Configuración CORS

### Scripts Batch de Windows
Todos los scripts en carpeta `scripts/` son compatibles con Windows y no deben modificarse sin probar:
- `START.bat` - Iniciar todos los servicios
- `STOP.bat` - Detener todos los servicios
- `REINSTALAR.bat` - Reinstalación completa (destruye datos)
- `LOGS.bat` - Ver logs de servicios

### Credenciales por Defecto
- Usuario: `admin`
- Contraseña: `admin123`
- **CAMBIAR EN PRODUCCIÓN**

### URLs de Servicios
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Adminer (DB UI): http://localhost:8080

## 🗄️ Base de Datos de Importación de Candidatos

### Ubicación Crítica
La base de datos Access para importación de candidatos se encuentra en:
```
BASEDATEJP/ユニバーサル企画㈱データベースv25.3.24.accdb
```

**IMPORTANTE**: Esta carpeta está en `.gitignore` (línea 150: `*.accdb`) y NO se sube a GitHub por razones de:
1. **Tamaño**: Archivos .accdb son muy grandes
2. **Seguridad**: Contiene datos personales sensibles
3. **Privacidad**: Información de candidatos y empleados

### Configuración en Scripts
Los scripts de importación buscan automáticamente esta base de datos en múltiples ubicaciones:
1. `./BASEDATEJP/` (carpeta actual)
2. `../BASEDATEJP/` (carpeta padre)
3. `../../BASEDATEJP/` (carpeta abuelo)
4. `D:/BASEDATEJP/`
5. `D:/ユニバーサル企画㈱データベース/`
6. `~/BASEDATEJP/` (directorio home)

### Scripts que Usan esta Base de Datos
- `backend/scripts/import_all_from_databasejp.py` - Importación completa
- `backend/scripts/auto_extract_photos_from_databasejp.py` - Extracción de fotos
- `backend/scripts/unified_photo_import.py` - Importación unificada de fotos
- `backend/scripts/import_access_candidates.py` - Importación de candidatos
- `backend/scripts/export_access_to_json.py` - Exportación a JSON

### Tabla Principal
- **Nombre**: `T_履歴書` (Rirekisho/CV japonés)
- **Registros**: ~1,148 candidatos
- **Columnas**: 172 campos de información

### Montaje en Docker
La carpeta `BASEDATEJP/` debe estar accesible desde el host ya que los contenedores Docker Linux no pueden acceder directamente a bases de datos Access (requiere Windows).

### Flujo de Importación
1. El sistema busca automáticamente la carpeta `BASEDATEJP/`
2. Encuentra el archivo `.accdb` específico
3. Extrae datos usando pyodbc con driver Microsoft Access
4. Importa a PostgreSQL con transformaciones
5. Extrae fotos si están disponibles (solo en Windows)

### Consideraciones de Seguridad
- **NUNCA** subir archivos `.accdb` a GitHub
- **NUNCA** incluir datos reales de candidatos en el repositorio
- **SIEMPRE** mantener la base de datos Access en entorno local seguro
- **SIEMPRE** usar datos de demostración para desarrollo