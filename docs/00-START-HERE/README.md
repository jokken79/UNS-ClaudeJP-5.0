# 🚀 Bienvenido a UNS-ClaudeJP 5.0

## 👋 Introducción

**UNS-ClaudeJP 5.0** es un sistema integral de gestión de recursos humanos diseñado específicamente para agencias de staffing japonesas (人材派遣会社). Este sistema maneja el ciclo completo de trabajadores temporales, desde candidatos hasta empleados activos, incluyendo gestión de documentos japoneses con OCR avanzado.

---

## 🎯 ¿Por Dónde Empezar?

### Para Nuevos Usuarios

Si es tu primera vez con el sistema, sigue este orden:

1. **[Inicio Rápido (5 minutos)](QUICK_START.md)** ⚡
   - Instalación básica con Docker
   - Login y primer acceso
   - Navegación básica

2. **[Arquitectura del Sistema](ARCHITECTURE.md)** 🏗️
   - Entender la estructura del proyecto
   - Componentes principales
   - Flujo de datos

3. **[Instalación Detallada](../01-instalacion/instalacion_rapida.md)** 📦
   - Configuración completa
   - Variables de entorno
   - Troubleshooting

### Para Desarrolladores

Si vas a trabajar en el código:

1. **[CLAUDE.md](../../CLAUDE.md)** - 🔴 **LECTURA OBLIGATORIA**
   - Reglas de desarrollo
   - Normas del proyecto
   - Guías para Claude Code

2. **[Sistema de Agentes](../../openspec/AGENTS.md)** - OpenSpec y workflow

3. **[Backend Guide](../../backend/README.md)** - Configuración FastAPI

4. **[Performance Guide](../../backend/PERFORMANCE_GUIDE.md)** - Optimización

### Para Administradores

Si administras el sistema:

1. **[Base de Datos](../02-configuracion/base_datos.md)** - Configuración PostgreSQL
2. **[Migraciones](../02-configuracion/MIGRACIONES_ALEMBIC.md)** - Alembic
3. **[Backup y Restauración](../02-configuracion/BACKUP_RESTAURACION.md)** - Respaldos
4. **[Troubleshooting](../04-troubleshooting/TROUBLESHOOTING.md)** - Problemas comunes

---

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI 0.115.6** - Framework web moderno (Python 3.11+)
- **SQLAlchemy 2.0.36** - ORM para PostgreSQL
- **PostgreSQL 15** - Base de datos relacional
- **Alembic** - Migraciones de base de datos
- **Pydantic** - Validación de datos

### Frontend
- **Next.js 16.0.0** - Framework React con App Router
- **React 19.0.0** - UI library
- **TypeScript 5.6** - Tipado estático
- **Tailwind CSS 3.4** - Estilizado
- **Turbopack** - Bundler por defecto
- **Zustand** - State management
- **React Query** - Server state
- **Shadcn UI** - Componentes UI (40+ componentes)

### OCR e Inteligencia Artificial
- **Azure Computer Vision API** - OCR japonés (primario)
- **EasyOCR** - OCR deep learning (secundario)
- **Tesseract OCR** - OCR open-source (fallback)
- **MediaPipe** - Detección facial

### DevOps
- **Docker Compose** - Orquestación de contenedores
- **Docker** - Containerización
- **Git** - Control de versiones
- **GitHub** - Repositorio y CI/CD

---

## 📊 Características Principales

### 1. Gestión de Personal
- **Candidatos (履歴書/Rirekisho)** - CVs japoneses con OCR
- **Empleados (派遣社員)** - Trabajadores de dispatch
- **Personal de Contratos (請負社員)** - Contract workers
- **Staff Interno (スタッフ)** - Personal administrativo

### 2. Operaciones
- **Factories (派遣先)** - Empresas clientes
- **Apartamentos (社宅)** - Housing management
- **Tarjetas de Tiempo (タイムカード)** - Control de asistencia
  - 3 tipos de turnos (朝番/昼番/夜番)
  - Horas extras, nocturnas, días festivos
- **Cálculo de Salarios (給与)** - Payroll automático
- **Solicitudes (申請)** - Workflow de aprobaciones
  - Vacaciones (有給)
  - Medio día (半休)
  - Regreso temporal (一時帰国)
  - Renuncia (退社)

### 3. Documentos e OCR
- **OCR Híbrido Multi-Proveedor**
  - Azure Vision (primario)
  - EasyOCR (secundario)
  - Tesseract (fallback)
- **Documentos Soportados:**
  - 履歴書 (Rirekisho/Resume) - 50+ campos
  - 在留カード (Zairyu Card) - Permiso de residencia
  - 運転免許証 (Driver's License)
- **Extracción de Fotos** - MediaPipe face detection
- **Almacenamiento** - JSON en campo `ocr_data`

### 4. Sistema de Temas
- **12 Temas Predefinidos:**
  - Default (light/dark)
  - Corporate (uns-kikaku, industrial)
  - Nature (ocean-blue, mint-green, forest-green, sunset)
  - Premium (royal-purple)
  - Vibrant (vibrant-coral)
  - Minimalist (monochrome)
  - Warm (espresso)
- **Temas Personalizados Ilimitados**
- **Template Designer** - Diseñador visual
- **Design Tools** - Gradientes, sombras, paletas
- **Live Preview** - Vista previa en tiempo real

### 5. Seguridad y Autenticación
- **JWT Authentication** - Tokens seguros
- **Bcrypt** - Hash de contraseñas
- **Role Hierarchy:**
  - SUPER_ADMIN → Control total
  - ADMIN → Administración
  - COORDINATOR → Coordinación
  - KANRININSHA → Gestión (管理人者)
  - EMPLOYEE → Empleado
  - CONTRACT_WORKER → Trabajador contrato
- **Audit Log** - Registro completo de auditoría

---

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación Next.js |
| **Backend API** | http://localhost:8000 | API REST FastAPI |
| **API Docs** | http://localhost:8000/api/docs | Swagger UI interactivo |
| **ReDoc** | http://localhost:8000/api/redoc | Documentación alternativa |
| **Adminer** | http://localhost:8080 | Gestión de base de datos |
| **Health Check** | http://localhost:8000/api/health | Estado del backend |

---

## 📦 Servicios Docker

El sistema ejecuta 5 servicios vía Docker Compose:

1. **db** - PostgreSQL 15 con volumen persistente
2. **importer** - Inicialización de datos (one-time)
   - Crea usuario admin (`admin` / `admin123`)
   - Importa datos de demostración
3. **backend** - FastAPI con hot reload
4. **frontend** - Next.js 16 con hot reload (Turbopack)
5. **adminer** - UI de gestión de base de datos

Todos los servicios se comunican vía red bridge `uns-network`.

---

## 📚 Estructura del Proyecto

```
UNS-ClaudeJP-5.0/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py      # Entry point (15 routers)
│   │   ├── api/         # REST endpoints (15 routers)
│   │   ├── models/      # SQLAlchemy ORM (13 tables)
│   │   ├── schemas/     # Pydantic models
│   │   ├── services/    # Business logic
│   │   ├── core/        # Config, database, logging
│   │   └── utils/       # Utilities
│   ├── alembic/         # Database migrations
│   └── scripts/         # Maintenance scripts
│
├── frontend/            # Next.js 16 application
│   ├── app/             # App Router (45+ pages)
│   │   ├── (dashboard)/ # Protected routes
│   │   ├── candidates/  # 6 pages
│   │   ├── employees/   # 5 pages
│   │   ├── factories/   # 2 pages
│   │   ├── timercards/  # Attendance
│   │   ├── salary/      # Payroll
│   │   ├── requests/    # Leave requests
│   │   ├── themes/      # Theme gallery
│   │   ├── customizer/  # Visual customizer
│   │   └── settings/    # Settings
│   ├── components/      # React components
│   ├── lib/             # Libraries & utilities
│   ├── stores/          # Zustand state
│   └── types/           # TypeScript types
│
├── docs/                # Documentation (YOU ARE HERE)
│   ├── 00-START-HERE/   # 🚀 Start here
│   ├── 01-instalacion/  # Installation
│   ├── 02-configuracion/# Configuration
│   ├── 03-uso/          # Usage guides
│   ├── 04-troubleshooting/# Problems
│   ├── 05-devops/       # Git, GitHub
│   ├── 06-agentes/      # Agents
│   ├── 97-reportes/     # Reports
│   ├── archive/         # Historical
│   └── database/        # DB schema
│
├── scripts/             # Windows batch scripts
│   ├── START.bat        # Start services
│   ├── STOP.bat         # Stop services
│   ├── LOGS.bat         # View logs
│   └── REINSTALAR.bat   # Reinitialize (⚠️ deletes data)
│
├── openspec/            # OpenSpec system
├── CLAUDE.md            # 🔴 CRITICAL - Development rules
└── docker-compose.yml   # Docker orchestration
```

---

## 🗄️ Esquema de Base de Datos (13 Tablas)

### Tablas de Personal
- **users** - Usuarios del sistema con jerarquía de roles
- **candidates** - Registros de candidatos (履歴書) con 50+ campos
- **employees** - Trabajadores de dispatch (派遣社員)
- **contract_workers** - Trabajadores de contrato (請負社員)
- **staff** - Personal de oficina/HR (スタッフ)

### Tablas de Negocio
- **factories** - Empresas clientes (派遣先)
- **apartments** - Vivienda de empleados (社宅)
- **documents** - Almacenamiento de archivos con OCR
- **contracts** - Contratos de empleo

### Tablas de Operaciones
- **timer_cards** - Registros de asistencia (タイムカード)
- **salary_calculations** - Cálculos de nómina mensual
- **requests** - Solicitudes de empleados con workflow
- **audit_log** - Log de auditoría completo

**Relaciones Clave:**
- Candidates → Employees via `rirekisho_id`
- Employees → Factories via `factory_id`
- Employees → Apartments via `apartment_id`

[Ver esquema completo](../database/BD_PROPUESTA_3_HIBRIDA.md)

---

## 🎓 Terminología Japonesa

El sistema utiliza términos japoneses estándar de la industria de staffing:

| Japonés | Romaji | Español | Uso en Sistema |
|---------|--------|---------|----------------|
| 履歴書 | Rirekisho | Currículum/CV | Módulo Candidates |
| 派遣社員 | Haken Shain | Empleado de dispatch | Módulo Employees |
| 派遣先 | Haken-saki | Empresa cliente | Módulo Factories |
| タイムカード | Taimu kādo | Tarjeta de tiempo | Módulo Timercards |
| 給与 | Kyūyo | Salario | Módulo Salary |
| 申請 | Shinsei | Solicitud | Módulo Requests |
| 有給 | Yūkyū | Vacaciones pagadas | Tipo de request |
| 半休 | Hankyū | Medio día | Tipo de request |
| 一時帰国 | Ichiji kikoku | Regreso temporal | Tipo de request |
| 退社 | Taisha | Renuncia | Tipo de request |
| 朝番 | Asaban | Turno mañana | Tipo de shift |
| 昼番 | Hiruban | Turno tarde | Tipo de shift |
| 夜番 | Yoban | Turno noche | Tipo de shift |
| 社宅 | Shataku | Vivienda de empresa | Módulo Apartments |
| 管理人者 | Kanrininsha | Gestor/Manager | Rol de usuario |
| 請負社員 | Ukeoi Shain | Trabajador contrato | Tipo de personal |

---

## 🚨 Credenciales Predeterminadas

**⚠️ IMPORTANTE: Cambiar en producción**

```
Usuario: admin
Contraseña: admin123
```

**Base de Datos (Adminer):**
```
Servidor: db
Usuario: uns_admin
Contraseña: 57UD10R
Base de datos: uns_claudejp
```

---

## 📞 Siguientes Pasos

1. **[Inicio Rápido](QUICK_START.md)** - Instala y ejecuta el sistema en 5 minutos
2. **[Arquitectura](ARCHITECTURE.md)** - Entiende cómo funciona el sistema
3. **[Índice de Documentación](../INDEX.md)** - Explora toda la documentación
4. **[CLAUDE.md](../../CLAUDE.md)** - Si vas a desarrollar (OBLIGATORIO)

---

## 🆘 ¿Necesitas Ayuda?

- **Problemas comunes:** [Troubleshooting Guide](../04-troubleshooting/TROUBLESHOOTING.md)
- **Error 401:** [AUTH_ERROR_401.md](../issues/AUTH_ERROR_401.md)
- **Post-instalación:** [POST_REINSTALL_VERIFICATION.md](../04-troubleshooting/POST_REINSTALL_VERIFICATION.md)

---

**¡Bienvenido a UNS-ClaudeJP 5.0!** 🚀

Última actualización: 2025-10-28
