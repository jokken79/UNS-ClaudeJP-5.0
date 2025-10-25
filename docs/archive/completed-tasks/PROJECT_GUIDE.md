# 📘 UNS-ClaudeJP 4.2 - Guía Maestra del Proyecto

**Versión**: 4.2.0
**Fecha**: 2025-10-24
**Sistema**: Gestión de RRHH para Agencias de Contratación Japonesas

---

## 🎯 Resumen Ejecutivo

UNS-ClaudeJP 4.2 es un sistema integral de gestión de recursos humanos diseñado específicamente para agencias de contratación japonesas (人材派遣会社). El sistema gestiona el ciclo completo de trabajadores temporales: desde la postulación de candidatos (履歴書/Rirekisho), contratación de empleados (派遣社員), asignación a fábricas/clientes (派遣先), control de asistencia (タイムカード), cálculo de nóminas (給与), hasta la gestión de solicitudes de permisos (申請). Incluye procesamiento OCR híbrido para documentos japoneses, autenticación por roles, y interfaces optimizadas tanto para escritorio como para dispositivos móviles.

---

## 🚀 Quick Start

### Para Desarrolladores Nuevos
1. **Clonar repositorio**:
   ```bash
   git clone <repository-url>
   cd UNS-ClaudeJP-4.2
   ```

2. **Iniciar sistema**:
   ```bash
   # Windows
   scripts\START.bat

   # Linux/macOS
   python generate_env.py
   docker compose up -d
   ```

3. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs
   - Adminer (DB): http://localhost:8080

4. **Credenciales por defecto**:
   - Usuario: `admin`
   - Contraseña: `admin123`

### Enlaces Rápidos
- [Instalación Completa](docs/guides/INSTALACION_RAPIDA.md)
- [Troubleshooting](docs/guides/TROUBLESHOOTING.md)
- [Documentación Técnica Completa](CLAUDE.md)
- [Guías de Usuario](docs/guides/README.md)

---

## 📁 Estructura del Proyecto

```
/home/user/UNS-ClaudeJP-4.2/
├── backend/                # FastAPI REST API (Python 3.11+)
│   ├── app/               # Código fuente principal
│   │   ├── api/          # 14 routers REST
│   │   ├── models/       # SQLAlchemy ORM (13 tablas)
│   │   ├── schemas/      # Pydantic models
│   │   ├── services/     # Lógica de negocio
│   │   ├── core/         # Configuración y middleware
│   │   └── utils/        # Utilidades
│   ├── alembic/          # Migraciones de base de datos
│   ├── scripts/          # Scripts de mantenimiento
│   └── tests/            # Tests automatizados
├── frontend-nextjs/       # Next.js 15 UI (TypeScript 5.6)
│   ├── app/              # App Router pages (15 páginas)
│   ├── components/       # Componentes React
│   ├── lib/              # API client y utilidades
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript definitions
│   └── public/           # Assets estáticos
├── docs/                  # Documentación organizada
│   ├── guides/           # 26 guías técnicas
│   ├── issues/           # Problemas conocidos
│   ├── reports/          # Reportes técnicos
│   └── sessions/         # Sesiones de desarrollo
├── scripts/               # Scripts de operación (.bat para Windows)
│   ├── START.bat         # Iniciar sistema
│   ├── STOP.bat          # Detener sistema
│   ├── LOGS.bat          # Ver logs
│   ├── REINSTALAR.bat    # Reinstalación completa
│   └── BACKUP_DATOS.bat  # Backup de BD
├── base-datos/            # Schemas SQL e inicialización
├── docker/                # Configuraciones Docker
├── .claude/               # Configuración de agentes Claude
└── LIXO/                  # Código obsoleto v3.x (ignorar)
```

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Backend:**
- FastAPI 0.115.6 (framework web moderno)
- SQLAlchemy 2.0.36 ORM (mapeo objeto-relacional)
- PostgreSQL 15 (base de datos relacional)
- Alembic 1.14.0 (migraciones de BD)
- Python-Jose 3.3.0 (JWT authentication)
- Passlib + Bcrypt (hashing de contraseñas)
- Azure Computer Vision API (OCR primario)
- EasyOCR + Tesseract (OCR secundario/fallback)
- Loguru (logging estructurado)

**Frontend:**
- Next.js 15.5.5 (React framework con App Router)
- React 18.3.0
- TypeScript 5.6.0
- Tailwind CSS 3.4.13 (estilos utility-first)
- Shadcn UI (componentes Radix UI)
- React Query 5.59.0 (gestión de estado servidor)
- Zustand 5.0.8 (gestión de estado cliente)
- Axios 1.7.7 (cliente HTTP)
- React Hook Form 7.65.0 (gestión de formularios)
- Zod 3.25.76 (validación de schemas)
- Framer Motion 11.15.0 (animaciones)
- date-fns 4.1.0 (manejo de fechas)

**DevOps:**
- Docker Compose (orchestration)
- 5 servicios containerizados:
  - `db` - PostgreSQL 15
  - `importer` - Inicialización de datos
  - `backend` - FastAPI app
  - `frontend` - Next.js app
  - `adminer` - UI de gestión de BD

### Módulos del Sistema

1. **Candidatos (履歴書)** - Gestión de postulantes
   - 50+ campos de información personal
   - OCR de documentos japoneses
   - Workflow de aprobación
   - Detección de rostros

2. **Empleados (派遣社員)** - Trabajadores contratados
   - Vinculación con candidatos via `rirekisho_id`
   - Asignación a fábricas/clientes
   - Información contractual
   - Historial laboral

3. **Fábricas (派遣先)** - Empresas cliente
   - Información de clientes
   - Configuración JSON flexible
   - Gestión de contratos

4. **TimerCards (タイムカード)** - Control de asistencia
   - 3 tipos de turno (朝番/昼番/夜番)
   - Horas extras, nocturnas y festivas
   - Cálculos automáticos

5. **Salarios (給与)** - Gestión de nóminas
   - Cálculos mensuales automáticos
   - Detalles de deducciones
   - Reportes PDF

6. **Solicitudes (申請)** - Permisos y ausencias
   - 4 tipos: 有給, 半休, 一時帰国, 退社
   - Workflow de aprobación
   - Notificaciones automáticas

### Arquitectura de Servicios

```
┌─────────────────────────────────────────┐
│          Next.js Frontend               │
│         (localhost:3000)                │
│  - Server Components                    │
│  - Client Components                    │
│  - App Router                           │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               │ JWT Auth
┌──────────────▼──────────────────────────┐
│          FastAPI Backend                │
│         (localhost:8000)                │
│  - 14 REST routers                      │
│  - JWT middleware                       │
│  - Business logic                       │
└──────────────┬──────────────────────────┘
               │ SQLAlchemy ORM
               │
┌──────────────▼──────────────────────────┐
│        PostgreSQL Database              │
│         (localhost:5432)                │
│  - 13 tablas relacionales               │
│  - Audit log                            │
│  - JSON fields                          │
└─────────────────────────────────────────┘

External Services:
┌─────────────────────────────────────────┐
│    Azure Computer Vision API            │
│    (OCR primario para japonés)          │
└─────────────────────────────────────────┘
```

---

## 👥 Usuarios del Sistema

### Roles y Jerarquía de Permisos

El sistema implementa 6 niveles de acceso jerárquicos:

1. **SUPER_ADMIN** (Super Administrador)
   - Control total del sistema
   - Gestión de usuarios y roles
   - Acceso a todas las funciones
   - Configuración del sistema

2. **ADMIN** (Administrador)
   - Gestión general de operaciones
   - Crear/editar candidatos y empleados
   - Aprobar solicitudes
   - Generar reportes

3. **COORDINATOR** (Coordinador)
   - Coordinación de operaciones diarias
   - Gestión de asignaciones
   - Control de asistencia
   - Procesamiento de nóminas

4. **KANRININSHA** (Gestor de RRHH - 管理人者)
   - Gestión de recursos humanos
   - Entrevistas y evaluaciones
   - Documentación de empleados
   - Seguimiento de rendimiento

5. **EMPLOYEE** (Empleado - 社員)
   - Consulta de información personal
   - Ver salarios y contratos
   - Solicitar permisos
   - Actualizar datos básicos

6. **CONTRACT_WORKER** (Trabajador Contractual - 請負社員)
   - Acceso limitado
   - Ver información básica
   - Consultar asistencia

### Acceso por Dispositivo

**Desktop/Laptop** (Escritorio):
- Todos los roles
- Funcionalidad completa
- Interfaces de administración
- Reportes complejos

**Móvil/Tablet**:
- Optimizado para EMPLOYEE y CONTRACT_WORKER
- Ver salarios y contratos
- Solicitar permisos
- Consultar información personal
- UI responsive con Tailwind

---

## 🔐 Seguridad y Autenticación

### Sistema de Autenticación

**Tecnología**:
- JWT (JSON Web Tokens) con algoritmo HS256
- Bcrypt para hashing de contraseñas (12 rounds)
- Token expiration: 480 minutos (8 horas)

**Flujo de Autenticación**:
1. Usuario envía credenciales a `POST /api/auth/login`
2. Backend valida contra base de datos
3. Si válido, genera JWT con claims (user_id, role, username)
4. Frontend almacena token en localStorage
5. Middleware de Next.js valida token en cada request
6. Backend valida JWT en cada endpoint protegido

**Storage Strategy**:
- Frontend: `localStorage` (optimizado para móvil)
- Key: `token` para access token
- Key: `user` para información de usuario serializada

**Endpoints de Autenticación**:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (solo SUPER_ADMIN)
- `POST /api/auth/change-password` - Cambio de contraseña
- `GET /api/auth/me` - Obtener usuario actual

### Seguridad del Backend

**Middleware Stack**:
1. CORS (Cross-Origin Resource Sharing)
   - Origins permitidos configurables via `FRONTEND_URL`
   - Credenciales permitidas

2. Rate Limiting
   - Prevención de ataques de fuerza bruta
   - Límites por IP

3. CSP Headers (Content Security Policy)
   - Protección contra XSS
   - Política restrictiva de recursos

4. Exception Handling
   - Logging de errores con loguru
   - Respuestas JSON consistentes
   - No exposición de stack traces en producción

5. Request Logging
   - Audit trail completo
   - Registro en tabla `audit_log`

**Validación de Datos**:
- Pydantic schemas en todos los endpoints
- Validación de tipos automática
- Sanitización de inputs

### Seguridad del Frontend

**Next.js Middleware**:
- Protección de rutas en `middleware.ts`
- Validación de JWT antes de renderizar
- Redirección automática a login si no autenticado

**Client-Side Security**:
- No almacenamiento de contraseñas
- Auto-logout en token expiration
- Validación de roles en UI
- HTTPS enforced en producción

---

## 📊 Base de Datos

### Schema Principal (13 Tablas)

**Tablas de Personal**:

1. **users** - Usuarios del sistema
   - Campos: id, username, hashed_password, role, is_active
   - Índices: username (unique)

2. **candidates** - Candidatos (履歴書)
   - 50+ campos: nombre, apellido, fecha_nacimiento, nacionalidad, etc.
   - JSON fields: ocr_data, extra_info
   - Workflow: status (PENDING, APPROVED, REJECTED)
   - Relaciones: documents, audit_log

3. **employees** - Empleados contratados (派遣社員)
   - Campos: employee_number, hire_date, factory_id, apartment_id
   - Foreign Keys: rirekisho_id → candidates.id
   - Relaciones: factory, apartment, timer_cards, salaries

4. **contract_workers** - Trabajadores por contrato (請負社員)
   - Campos: contract_number, start_date, end_date
   - Tipo de contrato y condiciones

5. **staff** - Personal de oficina/RRHH (スタッフ)
   - Campos: department, position, responsibilities
   - Permisos administrativos

**Tablas de Negocio**:

6. **factories** - Clientes/Empresas (派遣先)
   - Campos: name, address, contact_person, phone
   - JSON field: config (configuración flexible)
   - Relaciones: employees, contracts

7. **apartments** - Viviendas para empleados (社宅)
   - Campos: name, address, rent, capacity
   - Tracking de ocupación

8. **documents** - Archivos y documentos
   - Campos: file_path, document_type, file_size
   - JSON field: ocr_data (resultados OCR)
   - Tipos: RESUME, ZAIRYU_CARD, LICENSE, etc.

9. **contracts** - Contratos de empleo
   - Campos: contract_number, start_date, end_date, terms
   - PDF storage

**Tablas de Operaciones**:

10. **timer_cards** - Registros de asistencia (タイムカード)
    - Campos: employee_id, work_date, shift_type
    - Cálculos: regular_hours, overtime_hours, night_hours, holiday_hours
    - 3 tipos de turno: 朝番 (mañana), 昼番 (tarde), 夜番 (noche)

11. **salary_calculations** - Cálculos de nómina (給与)
    - Campos: employee_id, year, month, base_salary
    - Deducciones: income_tax, residence_tax, social_insurance, rent
    - Cálculos automáticos basados en timer_cards

12. **requests** - Solicitudes de permisos (申請)
    - Tipos: 有給 (vacaciones), 半休 (medio día), 一時帰国 (retorno temporal), 退社 (renuncia)
    - Workflow: PENDING → APPROVED/REJECTED
    - Tracking de aprobadores

13. **audit_log** - Registro de auditoría
    - Campos: user_id, action, table_name, record_id, old_value, new_value
    - Timestamp automático
    - Seguimiento completo de cambios

### Relaciones Clave

```
candidates (履歴書)
    ↓ rirekisho_id
employees (派遣社員)
    ├──→ factory_id → factories (派遣先)
    ├──→ apartment_id → apartments (社宅)
    ├──→ timer_cards (タイムカード)
    ├──→ salary_calculations (給与)
    └──→ requests (申請)

users
    └──→ audit_log (todas las acciones)
```

### Migraciones de Base de Datos

**Sistema**: Alembic 1.14.0

**Ubicación**: `/home/user/UNS-ClaudeJP-4.2/backend/alembic/versions/`

**Comandos Comunes**:

```bash
# Acceder al contenedor backend
docker exec -it uns-claudejp-backend bash

# Ver estado actual
alembic current

# Ver historial de migraciones
alembic history

# Aplicar todas las migraciones pendientes
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Crear nueva migración (auto-detecta cambios)
alembic revision --autogenerate -m "descripcion"

# Crear migración vacía
alembic revision -m "descripcion"
```

**Guía Completa**: [docs/guides/MIGRACIONES_ALEMBIC.md](docs/guides/MIGRACIONES_ALEMBIC.md)

---

## 🔧 Operaciones Comunes

### Iniciar Sistema

**Windows**:
```bash
# Iniciar todos los servicios
scripts\START.bat

# El script hace:
# 1. Verifica Docker Desktop
# 2. docker compose up -d
# 3. Espera a que servicios estén healthy
# 4. Muestra URLs de acceso
```

**Linux/macOS**:
```bash
# Generar archivo .env
python generate_env.py

# Iniciar servicios
docker compose up -d

# Verificar estado
docker compose ps

# Ver logs en tiempo real
docker compose logs -f
```

### Detener Sistema

**Windows**:
```bash
scripts\STOP.bat
```

**Linux/macOS**:
```bash
docker compose down
```

### Ver Logs

**Windows**:
```bash
# Script interactivo con menú
scripts\LOGS.bat

# Opciones:
# 1 - Backend logs
# 2 - Frontend logs
# 3 - Database logs
# 4 - Todos los logs
```

**Linux/macOS**:
```bash
# Backend
docker logs -f uns-claudejp-backend

# Frontend
docker logs -f uns-claudejp-frontend

# Database
docker logs -f uns-claudejp-db

# Todos
docker compose logs -f

# Últimas 100 líneas
docker logs --tail 100 uns-claudejp-backend
```

### Reiniciar Sistema (Borra Datos)

**ADVERTENCIA**: Esto eliminará TODOS los datos de la base de datos.

**Windows**:
```bash
scripts\REINSTALAR.bat
```

**Linux/macOS**:
```bash
# Detener y eliminar volúmenes
docker compose down -v

# Reconstruir e iniciar
docker compose up -d --build
```

### Backup de Base de Datos

**Windows**:
```bash
scripts\BACKUP_DATOS.bat
```

**Linux/macOS**:
```bash
# Backup completo
docker exec uns-claudejp-db pg_dump -U uns_admin uns_claudejp > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo schema
docker exec uns-claudejp-db pg_dump -U uns_admin --schema-only uns_claudejp > schema_backup.sql

# Backup solo datos
docker exec uns-claudejp-db pg_dump -U uns_admin --data-only uns_claudejp > data_backup.sql
```

### Restaurar Base de Datos

**Linux/macOS**:
```bash
# Copiar backup al contenedor
docker cp backup.sql uns-claudejp-db:/tmp/

# Restaurar
docker exec uns-claudejp-db psql -U uns_admin -d uns_claudejp -f /tmp/backup.sql
```

**Guía Completa**: [docs/guides/BACKUP_RESTAURACION.md](docs/guides/BACKUP_RESTAURACION.md)

### Crear Usuario Administrador

```bash
# Windows
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py

# Linux/macOS
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py

# Credenciales por defecto:
# Usuario: admin
# Contraseña: admin123
```

### Importar Datos de Prueba

```bash
docker exec -it uns-claudejp-backend python scripts/import_data.py
```

### Verificar Salud del Sistema

```bash
# Health check endpoint
curl http://localhost:8000/api/health

# Verificar servicios Docker
docker compose ps

# Verificar logs de errores (últimos 50)
docker logs --tail 50 uns-claudejp-backend | grep ERROR
```

---

## 📚 Documentación

### Estructura de Documentación

```
docs/
├── guides/               # 26 guías técnicas
│   ├── INSTALACION_RAPIDA.md
│   ├── TROUBLESHOOTING.md
│   ├── MIGRACIONES_ALEMBIC.md
│   ├── AZURE_OCR_SETUP.md
│   ├── IMPORT_FROM_ACCESS_AUTO.md
│   ├── BACKUP_RESTAURACION.md
│   ├── INSTRUCCIONES_GIT.md
│   └── ...
├── issues/               # Problemas conocidos
├── reports/              # Reportes técnicos
├── sessions/             # Sesiones de desarrollo
├── BACKEND_AUDIT_REPORT_2025-10-23.md
├── AUDITORIA_COMPLETA_2025-10-24.md
└── README.md
```

### Guías por Categoría

**Instalación y Setup**:
- [Instalación Rápida](docs/guides/INSTALACION_RAPIDA.md) - Setup inicial completo
- [Azure OCR Setup](docs/guides/AZURE_OCR_SETUP.md) - Configuración de OCR
- [Post-Install Verification](docs/guides/POST_REINSTALL_VERIFICATION.md) - Verificación post-instalación

**Base de Datos**:
- [Migraciones Alembic](docs/guides/MIGRACIONES_ALEMBIC.md) - Gestión de schema
- [Backup y Restauración](docs/guides/BACKUP_RESTAURACION.md) - Respaldos de BD

**Importación de Datos**:
- [Import from Access (Auto)](docs/guides/IMPORT_FROM_ACCESS_AUTO.md) - Importación automática
- [Import from Access (Manual)](docs/guides/IMPORT_FROM_ACCESS_MANUAL.md) - Importación manual
- [Quick Start Import](docs/guides/QUICK_START_IMPORT.md) - Guía rápida
- [Guía Importar Tarifas/Seguros](docs/guides/GUIA_IMPORTAR_TARIFAS_SEGUROS.md)

**OCR y Documentos**:
- [OCR Multi-Document Guide](docs/guides/OCR_MULTI_DOCUMENT_GUIDE.md) - Procesamiento múltiple
- [Photo Extraction](docs/guides/PHOTO_EXTRACTION.md) - Extracción de fotos
- [Quick Start Photos](docs/guides/QUICK_START_PHOTOS.md) - Guía rápida de fotos

**Desarrollo**:
- [Scripts Mejorados Guide](docs/guides/SCRIPTS_MEJORADOS_GUIDE.md) - Scripts de operación
- [Limpieza Código Antiguo](docs/guides/LIMPIEZA_CODIGO_ANTIGUO.md) - Mantenimiento
- [Theme Switcher Quick Start](docs/guides/THEME_SWITCHER_QUICK_START.md) - Temas
- [Navigation Animations](docs/guides/NAVIGATION_ANIMATIONS_IMPLEMENTATION.md) - Animaciones

**Git y Deployment**:
- [Instrucciones Git](docs/guides/INSTRUCCIONES_GIT.md) - Workflow de Git
- [Cómo Subir a GitHub](docs/guides/COMO_SUBIR_A_GITHUB.md) - Publicación
- [Seguridad GitHub](docs/guides/SEGURIDAD_GITHUB.md) - Buenas prácticas

**Troubleshooting**:
- [Troubleshooting Guide](docs/guides/TROUBLESHOOTING.md) - Solución de problemas comunes
- [Print Solution Guide](docs/guides/PRINT_SOLUTION_GUIDE.md) - Problemas de impresión

### Auditorías y Reportes

**Auditoría Completa del Sistema**:
- [Auditoría Completa 2025-10-24](docs/AUDITORIA_COMPLETA_2025-10-24.md)
  - 7 problemas críticos identificados
  - 14 warnings documentados
  - Prioridades y soluciones propuestas

**Auditoría de Backend**:
- [Backend Audit Report 2025-10-23](docs/BACKEND_AUDIT_REPORT_2025-10-23.md)
  - Análisis de 21 archivos Python
  - Evaluación de estructura y calidad
  - Recomendaciones de mejora

### Documentación Técnica Principal

- [CLAUDE.md](CLAUDE.md) - Guía completa para Claude Code
- [README.md](README.md) - Introducción al proyecto
- [DOCS.md](DOCS.md) - Documentación técnica detallada
- [CHANGELOG.md](CHANGELOG.md) - Historial de cambios
- [PROJECT_GUIDE.md](PROJECT_GUIDE.md) - Este documento

---

## 🛠️ Desarrollo

### Agregar Nueva Feature

**Workflow Completo**:

1. **Leer Documentación**:
   - Revisar [CLAUDE.md](CLAUDE.md) para entender estructura
   - Verificar convenciones del proyecto

2. **Backend** (si requiere API):

   a. **Crear Modelo** en `backend/app/models/models.py`:
   ```python
   class NewFeature(Base):
       __tablename__ = "new_features"
       id = Column(Integer, primary_key=True, index=True)
       name = Column(String, nullable=False)
       created_at = Column(DateTime, default=datetime.now)
   ```

   b. **Crear Schemas** en `backend/app/schemas/`:
   ```python
   # new_feature.py
   from pydantic import BaseModel
   from datetime import datetime

   class NewFeatureBase(BaseModel):
       name: str

   class NewFeatureCreate(NewFeatureBase):
       pass

   class NewFeatureResponse(NewFeatureBase):
       id: int
       created_at: datetime

       class Config:
           from_attributes = True
   ```

   c. **Crear Router** en `backend/app/api/`:
   ```python
   # new_feature.py
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from app.core.database import get_db
   from app.schemas.new_feature import NewFeatureCreate, NewFeatureResponse

   router = APIRouter(prefix="/new-features", tags=["new-features"])

   @router.post("/", response_model=NewFeatureResponse)
   def create_new_feature(
       feature: NewFeatureCreate,
       db: Session = Depends(get_db)
   ):
       # Implementación
       pass
   ```

   d. **Registrar Router** en `backend/app/main.py`:
   ```python
   from app.api import new_feature
   app.include_router(new_feature.router, prefix="/api")
   ```

3. **Frontend** (Next.js):

   a. **Crear Tipos** en `frontend-nextjs/types/`:
   ```typescript
   // new-feature.ts
   export interface NewFeature {
     id: number;
     name: string;
     created_at: string;
   }
   ```

   b. **Crear API Service** en `frontend-nextjs/lib/api/`:
   ```typescript
   // new-feature.ts
   import { api } from '../api';
   import type { NewFeature } from '@/types/new-feature';

   export const newFeatureApi = {
     getAll: () => api.get<NewFeature[]>('/api/new-features'),
     create: (data: Omit<NewFeature, 'id' | 'created_at'>) =>
       api.post<NewFeature>('/api/new-features', data),
   };
   ```

   c. **Crear Page** en `frontend-nextjs/app/`:
   ```typescript
   // app/new-feature/page.tsx
   'use client';

   import { useQuery } from '@tanstack/react-query';
   import { newFeatureApi } from '@/lib/api/new-feature';

   export default function NewFeaturePage() {
     const { data, isLoading } = useQuery({
       queryKey: ['newFeatures'],
       queryFn: () => newFeatureApi.getAll().then(res => res.data),
     });

     if (isLoading) return <div>Loading...</div>;

     return (
       <div>
         <h1>New Feature</h1>
         {/* Implementación */}
       </div>
     );
   }
   ```

4. **Testing Manual**:
   - Verificar API en http://localhost:8000/api/docs
   - Probar UI en http://localhost:3000
   - Verificar en diferentes roles de usuario

### Crear Migración de Base de Datos

```bash
# 1. Acceder al contenedor backend
docker exec -it uns-claudejp-backend bash

# 2. Navegar al directorio de la aplicación
cd /app

# 3. Crear migración (auto-detecta cambios en models.py)
alembic revision --autogenerate -m "descripcion_del_cambio"

# 4. Revisar archivo generado en alembic/versions/
# Verificar que los cambios sean correctos

# 5. Aplicar migración
alembic upgrade head

# 6. Verificar en la base de datos
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp
\dt  # Listar tablas
\d nombre_tabla  # Ver estructura de tabla
\q  # Salir
```

**Notas Importantes**:
- Siempre revisar el archivo de migración antes de aplicar
- Alembic no detecta cambios en tipos de datos existentes automáticamente
- Para cambios complejos, crear migración vacía y escribir manualmente
- Nunca modificar migraciones ya aplicadas en producción

### Agregar Dependencia

**Backend (Python)**:

```bash
# 1. Acceder al contenedor
docker exec -it uns-claudejp-backend bash

# 2. Instalar paquete
pip install nombre-paquete==version

# 3. Salir del contenedor
exit

# 4. Agregar a requirements.txt
echo "nombre-paquete==version" >> backend/requirements.txt

# 5. Reconstruir imagen (opcional, si necesitas persistir)
docker compose build backend
```

**Frontend (npm)**:

```bash
# 1. Acceder al contenedor
docker exec -it uns-claudejp-frontend bash

# 2. Instalar paquete
npm install nombre-paquete

# 3. Salir del contenedor
exit

# El package.json se actualiza automáticamente
# Commitear el package.json y package-lock.json
```

### Debugging y Desarrollo Local

**Modo Desarrollo con Hot Reload**:

Ambos servicios (backend y frontend) están configurados con hot reload:

- **Backend**: Uvicorn con `--reload` flag
- **Frontend**: Next.js con `next dev`

Los cambios en código se reflejan automáticamente sin reiniciar contenedores.

**Acceder a Shell de Contenedores**:

```bash
# Backend (Python)
docker exec -it uns-claudejp-backend bash

# Frontend (Node.js)
docker exec -it uns-claudejp-frontend bash

# Database (PostgreSQL)
docker exec -it uns-claudejp-db bash
```

**Ejecutar Scripts de Python**:

```bash
docker exec -it uns-claudejp-backend python scripts/nombre_script.py
```

**Ejecutar Comandos de Node**:

```bash
docker exec -it uns-claudejp-frontend npm run <comando>
```

**Ver Variables de Entorno**:

```bash
# Backend
docker exec uns-claudejp-backend env | grep DATABASE

# Frontend
docker exec uns-claudejp-frontend env | grep NEXT_PUBLIC
```

---

## 🐛 Troubleshooting Común

### Login falla / No puedo autenticarme

**Síntomas**: Error 401, credenciales incorrectas

**Solución**:
```bash
# Resetear contraseña de admin
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py

# Credenciales por defecto:
# Usuario: admin
# Contraseña: admin123

# Verificar que el usuario existe en la BD
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT username, role FROM users;"
```

**Causas Comunes**:
- Usuario no existe (ejecutar script de creación)
- Token expirado (logout y login nuevamente)
- SECRET_KEY diferente en backend (regenerar tokens)

### Frontend no carga / Página en blanco

**Síntomas**: http://localhost:3000 no responde o muestra página en blanco

**Solución**:
```bash
# 1. Verificar logs del frontend
docker logs uns-claudejp-frontend

# 2. Esperar compilación (puede tomar 1-2 minutos)
# Next.js compila en primera carga

# 3. Verificar que el backend esté accesible
curl http://localhost:8000/api/health

# 4. Limpiar caché del navegador
# Chrome: Ctrl+Shift+Delete
# Borrar localStorage: F12 → Console → localStorage.clear()

# 5. Reiniciar contenedor frontend
docker restart uns-claudejp-frontend
```

**Causas Comunes**:
- Compilación de Next.js en progreso (esperar)
- Backend no accesible (verificar puerto 8000)
- LocalStorage corrupto (limpiar navegador)
- Error de build (ver logs)

### Base de datos error / Connection refused

**Síntomas**: "Connection refused", "database does not exist"

**Solución**:
```bash
# 1. Verificar que PostgreSQL esté corriendo
docker ps | grep uns-claudejp-db

# 2. Verificar health check
docker inspect uns-claudejp-db | grep Health -A 10

# 3. Ver logs de la base de datos
docker logs uns-claudejp-db

# 4. Aplicar migraciones pendientes
docker exec -it uns-claudejp-backend alembic upgrade head

# 5. Si persiste, reiniciar BD
docker restart uns-claudejp-db

# 6. Opción nuclear: reiniciar sistema completo
scripts\REINSTALAR.bat  # Windows
docker compose down -v && docker compose up -d  # Linux
```

**Causas Comunes**:
- PostgreSQL no terminó de iniciar (esperar 30-60s)
- Migraciones no aplicadas
- Volumen corrupto (requiere reinstalación)
- Shutdown incorrecto previo

### Puerto ocupado / Port already in use

**Síntomas**: "Error starting userland proxy: listen tcp [...] bind: address already in use"

**Windows**:
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr "3000"
netstat -ano | findstr "8000"

# Matar proceso por PID
taskkill /PID <numero> /F

# Ejemplo:
netstat -ano | findstr "3000"
# Output: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 12345
taskkill /PID 12345 /F
```

**Linux/macOS**:
```bash
# Verificar qué proceso usa el puerto
lsof -ti:3000
lsof -ti:8000

# Matar proceso
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Puertos Requeridos**:
- 3000 - Frontend (Next.js)
- 8000 - Backend (FastAPI)
- 5432 - Database (PostgreSQL)
- 8080 - Adminer (DB Admin UI)

### OCR no funciona / OCR processing fails

**Síntomas**: Upload de documento falla, "OCR processing error"

**Solución**:
```bash
# 1. Verificar credenciales de Azure
docker exec uns-claudejp-backend env | grep AZURE

# 2. Verificar logs de OCR
docker logs uns-claudejp-backend | grep -i ocr

# 3. El sistema tiene fallback automático:
# Azure Computer Vision → EasyOCR → Tesseract

# 4. Verificar que al menos Tesseract esté disponible
docker exec -it uns-claudejp-backend tesseract --version

# 5. Si Azure no está configurado, es normal que use fallback
```

**Notas**:
- Azure OCR es opcional (requiere credenciales)
- Sistema funciona sin Azure usando EasyOCR/Tesseract
- Calidad de OCR: Azure > EasyOCR > Tesseract

**Configuración de Azure**:
Ver [docs/guides/AZURE_OCR_SETUP.md](docs/guides/AZURE_OCR_SETUP.md)

### Docker Desktop no responde

**Windows**:
```bash
# 1. Abrir Task Manager (Ctrl+Shift+Esc)
# 2. Buscar "Docker Desktop"
# 3. Finalizar tarea
# 4. Reiniciar Docker Desktop desde menú inicio

# 5. Si persiste, reiniciar servicio Docker
services.msc
# Buscar "Docker Desktop Service"
# Click derecho → Reiniciar
```

**Linux**:
```bash
# Reiniciar servicio Docker
sudo systemctl restart docker

# Ver estado
sudo systemctl status docker
```

### Contenedores no inician / Services won't start

**Síntomas**: `docker compose up -d` falla, contenedores en estado "Exited"

**Solución**:
```bash
# 1. Ver logs de todos los servicios
docker compose logs

# 2. Verificar estado de contenedores
docker compose ps -a

# 3. Limpiar contenedores y volúmenes
docker compose down -v

# 4. Limpiar imágenes huérfanas
docker image prune -f

# 5. Reconstruir desde cero
docker compose build --no-cache

# 6. Iniciar nuevamente
docker compose up -d

# 7. Verificar health checks
docker compose ps
```

### Guía Completa de Troubleshooting

Para más problemas y soluciones detalladas, consultar:
- [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)

---

## 📝 Changelog Reciente

### v4.2.0 (2025-02-10)

**Añadido**:
- ✅ Documentación multiplataforma completa (README, DOCS, guías)
- ✅ Nueva carpeta `docs/issues/` con documentación de problemas
- ✅ Reportes técnicos restaurados en `docs/reports/`
- ✅ Notas de lanzamiento en `docs/releases/4.2.0.md`
- ✅ Primera prueba automatizada (`backend/tests/test_health.py`)
- ✅ Pipeline CI (`.github/workflows/backend-tests.yml`)
- ✅ 39 archivos de documentación reorganizados
- ✅ Auth optimizado para móvil (localStorage)
- ✅ Tipos TypeScript completos (40+ interfaces)

**Cambiado**:
- 🔄 `APP_NAME` y `APP_VERSION` en docker-compose.yml → 4.2.0
- 🔄 CLAUDE.md actualizado con equivalentes Linux/macOS
- 🔄 SQLEnum simplificado (6 cambios en backend)
- 🔄 Limpieza de código obsoleto (-170KB)

**Corregido**:
- 🐛 21 problemas críticos y warnings documentados
- 🐛 Enlaces rotos a documentación reemplazados
- 🐛 Referencias a carpetas antiguas actualizadas
- 🐛 Imports obsoletos eliminados
- 🐛 Warnings de TypeScript resueltos

### v4.0.1 (2025-10-17)

**Corregido**:
- ✅ **Crítico**: PostgreSQL health check timeout aumentado
- ✅ Startup success rate: 60% → 98%
- ✅ Mejor manejo de errores en START.bat

**Añadido**:
- ✅ CLEAN.bat - Script de limpieza completa
- ✅ 6 documentos técnicos de troubleshooting

### v4.0.0 (2025-10-17)

**Lanzamiento Mayor**:
- ✅ Migración completa a Next.js 15
- ✅ 8 módulos core funcionales
- ✅ 15 páginas operativas
- ✅ OCR híbrido (Azure + EasyOCR + Tesseract)
- ✅ React Query + Zustand
- ✅ TypeScript completo
- ✅ Docker Compose orchestration

**Rendimiento**:
- ⚡ 40% más rápido con Next.js SSR
- 🎨 UI moderna con gradientes
- 📱 Mobile-first responsive design
- 🔐 Seguridad mejorada con JWT

Ver [CHANGELOG.md](CHANGELOG.md) completo

---

## 🤝 Contribuir

### Workflow de Contribución

1. **Crear Feature Branch**:
   ```bash
   git checkout -b feature/nombre-descriptivo

   # Ejemplos:
   # feature/add-salary-reports
   # fix/login-bug
   # docs/update-installation-guide
   ```

2. **Hacer Cambios**:
   - Seguir convenciones de código del proyecto
   - Mantener compatibilidad con Windows/Linux
   - Actualizar documentación si es necesario
   - Agregar comentarios en código complejo

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "tipo: descripción breve

   Descripción detallada del cambio.

   - Cambio 1
   - Cambio 2
   "

   # Tipos de commit:
   # feat: Nueva funcionalidad
   # fix: Corrección de bug
   # docs: Cambios en documentación
   # style: Formateo, no cambia lógica
   # refactor: Refactorización de código
   # test: Agregar o modificar tests
   # chore: Mantenimiento, dependencias
   ```

4. **Push a Remoto**:
   ```bash
   git push origin feature/nombre-descriptivo
   ```

5. **Crear Pull Request**:
   - Ir a GitHub repository
   - Click "New Pull Request"
   - Seleccionar tu branch
   - Llenar template con:
     - Descripción de cambios
     - Motivación
     - Cómo probar
     - Screenshots (si aplica)

### Convenciones de Código

**Python (Backend)**:
- PEP 8 style guide
- Type hints en funciones
- Docstrings en funciones públicas
- Max line length: 100 caracteres

**TypeScript (Frontend)**:
- ESLint configuration del proyecto
- Componentes funcionales con hooks
- Props con interfaces TypeScript
- Nombres de archivos: kebab-case.tsx

**Git**:
- Commits descriptivos en español o inglés
- Branches con prefijo tipo/nombre
- No commits directos a main
- Squash commits antes de merge (opcional)

### Testing

Antes de crear Pull Request:

```bash
# Backend: Verificar que corre sin errores
docker logs uns-claudejp-backend | grep ERROR

# Frontend: Verificar que compila
docker exec uns-claudejp-frontend npm run build

# Manual: Probar funcionalidad en navegador
# - Login funciona
# - Navegación correcta
# - Formularios validan
# - No errores en consola (F12)
```

### Recursos para Contribuidores

- [Instrucciones Git Detalladas](docs/guides/INSTRUCCIONES_GIT.md)
- [Cómo Subir a GitHub](docs/guides/COMO_SUBIR_A_GITHUB.md)
- [Seguridad GitHub](docs/guides/SEGURIDAD_GITHUB.md)

---

## 📞 Soporte y Recursos

### Documentación

**Principal**:
- [CLAUDE.md](CLAUDE.md) - Guía técnica completa
- [README.md](README.md) - Introducción y quick start
- [DOCS.md](DOCS.md) - Documentación detallada del sistema
- [PROJECT_GUIDE.md](PROJECT_GUIDE.md) - Este documento

**Guías Específicas**:
- Instalación: [docs/guides/INSTALACION_RAPIDA.md](docs/guides/INSTALACION_RAPIDA.md)
- Troubleshooting: [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)
- Base de Datos: [docs/guides/MIGRACIONES_ALEMBIC.md](docs/guides/MIGRACIONES_ALEMBIC.md)
- OCR: [docs/guides/AZURE_OCR_SETUP.md](docs/guides/AZURE_OCR_SETUP.md)
- Git: [docs/guides/INSTRUCCIONES_GIT.md](docs/guides/INSTRUCCIONES_GIT.md)

**Todas las Guías**: [docs/guides/README.md](docs/guides/README.md)

### Reportar Problemas

**GitHub Issues**:
1. Buscar si el problema ya existe
2. Crear nuevo issue con template
3. Incluir:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Sistema operativo y versión
   - Screenshots si aplica

**Problemas Conocidos**:
Ver [docs/issues/](docs/issues/) para problemas documentados y workarounds

### Obtener Ayuda

**Orden recomendado**:
1. Buscar en [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)
2. Revisar [GitHub Issues](https://github.com/tu-usuario/uns-claudejp-4.2/issues)
3. Consultar documentación técnica ([CLAUDE.md](CLAUDE.md))
4. Revisar logs del sistema (`scripts\LOGS.bat`)
5. Crear nuevo issue si el problema persiste

### Auditorías y Reportes Técnicos

**Auditoría Más Reciente**:
- [Auditoría Completa 2025-10-24](docs/AUDITORIA_COMPLETA_2025-10-24.md)
  - Estado general del sistema
  - 7 problemas críticos identificados
  - 14 warnings documentados
  - Plan de acción prioritizado

**Reportes de Backend**:
- [Backend Audit Report 2025-10-23](docs/BACKEND_AUDIT_REPORT_2025-10-23.md)
  - Análisis de código Python
  - Evaluación de estructura
  - Recomendaciones de mejora

### Enlaces Útiles

**URLs del Sistema**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Database Admin: http://localhost:8080
- Health Check: http://localhost:8000/api/health

**Repositorios**:
- GitHub: https://github.com/[usuario]/UNS-ClaudeJP-4.2
- Issues: https://github.com/[usuario]/UNS-ClaudeJP-4.2/issues
- Pull Requests: https://github.com/[usuario]/UNS-ClaudeJP-4.2/pulls

---

## 📄 Licencia

[Especificar licencia del proyecto]

**Opciones comunes**:
- MIT License (permisiva, uso comercial permitido)
- Apache 2.0 (permisiva con protección de patentes)
- GPL v3 (copyleft, cambios deben ser open source)
- Propietaria (uso restringido)

---

## 🙏 Agradecimientos

**Tecnologías Principales**:
- [FastAPI](https://fastapi.tiangolo.com/) - Framework backend moderno
- [Next.js](https://nextjs.org/) - Framework React con SSR
- [PostgreSQL](https://www.postgresql.org/) - Base de datos robusta
- [Docker](https://www.docker.com/) - Containerización
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM potente

**Librerías Clave**:
- [React Query](https://tanstack.com/query/latest) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com/) - Componentes React
- [Pydantic](https://docs.pydantic.dev/) - Validación de datos

**Servicios**:
- [Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/) - OCR para japonés
- [Docker Hub](https://hub.docker.com/) - Registry de imágenes

---

## 📊 Estadísticas del Proyecto

**Código**:
- Backend: ~15,000 líneas de Python
- Frontend: ~12,000 líneas de TypeScript/TSX
- Tests: 1+ test automatizado (expandiendo)
- Documentación: 39 archivos en docs/

**Funcionalidad**:
- 8 módulos core completos
- 15 páginas funcionales
- 13 tablas de base de datos
- 14 endpoints REST principales
- 6 roles de usuario
- 3 tipos de OCR (híbrido)

**Performance**:
- Build time (backend): ~30s
- Build time (frontend): ~60s
- Startup time: ~80s (primera vez), ~30s (subsecuente)
- Cold start (Next.js): ~2-3s
- Hot reload: <1s

---

## 🔮 Roadmap Futuro

**Planificado**:
- [ ] Tests automatizados completos (Pytest + Playwright)
- [ ] CI/CD pipeline completo
- [ ] Deployment a producción (Azure/AWS)
- [ ] App móvil nativa (React Native)
- [ ] Internacionalización completa (i18n)
- [ ] Reportes avanzados con exportación
- [ ] Integración con servicios de nómina externos
- [ ] Notificaciones push (LINE/Email)
- [ ] Dashboard analytics mejorado
- [ ] Performance optimization
- [ ] Security audit completo
- [ ] Documentación API interactiva

**En Consideración**:
- [ ] Módulo de reclutamiento
- [ ] Sistema de evaluaciones
- [ ] Chat interno
- [ ] Gestión de documentos avanzada
- [ ] Integración con sistemas de tiempo biométricos

---

**Última actualización**: 2025-10-24
**Mantenido por**: [Nombre del equipo/organización]
**Versión del documento**: 1.0.0

---

## 📝 Historial del Documento

| Fecha      | Versión | Cambios                                    | Autor      |
|------------|---------|---------------------------------------------|------------|
| 2025-10-24 | 1.0.0   | Creación inicial del PROJECT_GUIDE.md     | Claude Code |

---

**¿Preguntas? ¿Sugerencias?**
Abre un issue en GitHub o consulta la documentación en [docs/](docs/)
