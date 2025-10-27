<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
> ℹ️ **Nota**: El flujo automatizado descrito en `.claude/CLAUDE.md` se conserva como referencia histórica. No es obligatorio para colaboradores humanos; usa las guías de este archivo como fuente de verdad.


## 🚨 NORMA #7 - GESTIÓN DE ARCHIVOS .md (OBLIGATORIA PARA TODOS LOS AGENTES)

### 📋 REGLAS DE ORO:
1. **🔍 BUSCAR ANTES DE CREAR**: Siempre buscar si existe un archivo .md similar
2. **📝 REUTILIZAR EXISTENTE**: Si hay tema similar, agregar allí con fecha
3. **📅 FORMATO DE FECHA OBLIGATORIO**: `## 📅 YYYY-MM-DD - [TÍTULO]`
4. **🚫 EVITAR DUPLICACIÓN**: No crear `NUEVO_ANALISIS.md` si existe `ANALISIS.md`

### 📁 EJEMPLOS PRÁCTICOS:
- ❌ **MALO**: Crear `PROBLEMA_TEMAS_2.md` si existe `PROBLEMA_TEMAS.md`
- ✅ **BUENO**: Editar `PROBLEMA_TEMAS.md` agregando `## 📅 2025-10-21 - Nuevo problema encontrado`

### 🎯 EXCEPCIONES:
Solo crear nuevo .md si el tema es **completamente diferente** y no encaja en existentes.

**Ver documentos existentes**: `docs/`, `docs/archive/`, `docs/guides/`, `docs/sessions/`, etc.

---

## 🎯 Preferencias del Usuario

**"claude poder"** = Ejecutar comando en terminal:
```bash
claude --dangerously-skip-permissions
```

---

## Project Overview

UNS-ClaudeJP 5.0 is a comprehensive HR management system for Japanese staffing agencies (人材派遣会社), built with:
- **Backend**: FastAPI 0.115.6 (Python 3.11+) with SQLAlchemy 2.0.36 ORM and PostgreSQL 15
- **Frontend**: Next.js 16.0.0 with React 19.0.0, TypeScript 5.6 and Tailwind CSS 3.4 (App Router)
- **DevOps**: Docker Compose for orchestration

The system manages the complete lifecycle of temporary workers: candidates (履歴書/Rirekisho), employees (派遣社員), factories (派遣先), attendance (タイムカード), payroll (給与), and requests (申請). It includes hybrid OCR processing (Azure + EasyOCR + Tesseract) for Japanese document handling.

**Version 5.0** represents a major upgrade to Next.js 16 with React 19, featuring Turbopack as the default bundler, implementing 45+ functional pages across 8 core modules with advanced theming system (12 predefined themes + custom themes), template designer, and professional design tools.

## Quick Start Commands

### Windows (scripts automatizados)

```bash
# Iniciar servicios
scripts\START.bat

# Detener
scripts\STOP.bat

# Ver logs
scripts\LOGS.bat

# Reinicializar (⚠️ borra datos)
scripts\REINSTALAR.bat
```

### Linux/macOS (comandos manuales)

```bash
python generate_env.py
# Iniciar servicios
docker compose up -d
# Ver logs
docker compose logs -f backend
# Detener servicios
docker compose down
```

> 💡 Todos los scripts .bat están en `scripts/`. Revisa [scripts/README.md](scripts/README.md) para equivalentes manuales.

Default credentials: `admin` / `admin123`

## Development Commands

### Backend Development

```bash
# Access backend container
docker exec -it uns-claudejp-backend bash

# Run database migrations
cd /app
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Create admin user
python scripts/create_admin_user.py

# Import sample data
python scripts/import_data.py

# Install a new dependency
pip install package-name
# Then add to requirements.txt
```

### Frontend Development (Next.js 16)

```bash
# Access frontend container
docker exec -it uns-claudejp-frontend bash

# Install new dependency
npm install <package-name>

# Development server (already running)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Management

```bash
# Access PostgreSQL directly
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp

# Run database verification
docker exec -it uns-claudejp-backend python scripts/verify_data.py

# View Adminer web interface
# Navigate to http://localhost:8080
# Server: db | Username: uns_admin | Password: 57UD10R | Database: uns_claudejp
```

## System Architecture

### Backend Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI entry point with 15 router registrations
│   ├── api/                    # REST API endpoints (15 routers)
│   │   ├── auth.py            # JWT authentication
│   │   ├── candidates.py      # 履歴書 CRUD + OCR processing
│   │   ├── employees.py       # 派遣社員 management
│   │   ├── factories.py       # 派遣先 client sites
│   │   ├── timer_cards.py     # タイムカード attendance tracking
│   │   ├── salary.py          # 給与 payroll calculations
│   │   ├── requests.py        # 申請 leave requests workflow
│   │   ├── dashboard.py       # Stats & analytics
│   │   ├── database.py        # Database management utilities
│   │   ├── azure_ocr.py       # Azure Vision API integration
│   │   ├── import_export.py   # Data import/export
│   │   ├── monitoring.py      # System health monitoring
│   │   ├── notifications.py   # Email/LINE notifications
│   │   ├── reports.py         # PDF report generation
│   │   └── settings.py        # Application settings API
│   ├── models/
│   │   └── models.py          # SQLAlchemy ORM (13 tables)
│   ├── schemas/               # Pydantic request/response models
│   ├── services/              # Business logic layer
│   │   ├── auth_service.py
│   │   ├── azure_ocr_service.py
│   │   ├── easyocr_service.py
│   │   ├── hybrid_ocr_service.py
│   │   ├── face_detection_service.py
│   │   ├── import_service.py
│   │   ├── notification_service.py
│   │   ├── payroll_service.py
│   │   └── report_service.py
│   ├── core/                  # Core configuration
│   │   ├── config.py         # Settings management
│   │   ├── database.py       # SQLAlchemy session setup
│   │   ├── logging.py        # Application logging (loguru)
│   │   └── middleware.py     # Security, logging, exception handling
│   └── utils/                # Utility functions
├── alembic/                  # Database migrations
│   └── versions/
└── scripts/                  # Maintenance scripts
```

### Frontend Structure (Next.js 16 App Router)

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home/landing page
│   ├── login/page.tsx                # Authentication page
│   ├── profile/page.tsx              # User profile page
│   │
│   ├── (dashboard)/                  # Protected dashboard routes group
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   ├── dashboard/                # Main dashboard
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   └── dashboard-context.tsx # Dashboard state context
│   │   │
│   │   ├── candidates/               # Candidate management (6 pages)
│   │   │   ├── page.tsx              # List view with filtering
│   │   │   ├── new/page.tsx          # Create new candidate
│   │   │   ├── rirekisho/page.tsx    # Rirekisho (履歴書) view
│   │   │   ├── [id]/page.tsx         # Detail view
│   │   │   ├── [id]/edit/page.tsx    # Edit form
│   │   │   └── [id]/print/page.tsx   # Print-friendly view
│   │   │
│   │   ├── employees/                # Employee management (5 pages)
│   │   │   ├── page.tsx              # List view
│   │   │   ├── new/page.tsx          # Create new employee
│   │   │   ├── excel-view/page.tsx   # Excel-like view
│   │   │   ├── [id]/page.tsx         # Detail view
│   │   │   └── [id]/edit/page.tsx    # Edit form
│   │   │
│   │   ├── factories/                # Factory/client management (2 pages)
│   │   │   ├── page.tsx              # List view
│   │   │   └── [id]/edit/page.tsx    # Edit factory
│   │   │
│   │   ├── timercards/page.tsx       # Attendance tracking
│   │   ├── salary/page.tsx           # Payroll management
│   │   ├── requests/page.tsx         # Leave request management
│   │   ├── reports/page.tsx          # Reports & analytics
│   │   │
│   │   ├── settings/                 # Settings (2 pages)
│   │   │   ├── layout.tsx            # Settings layout
│   │   │   └── appearance/page.tsx   # Appearance settings
│   │   │
│   │   ├── themes/page.tsx           # Theme gallery (12 themes + custom)
│   │   ├── customizer/page.tsx       # Visual theme customizer
│   │   ├── templates/page.tsx        # Template management
│   │   ├── design-tools/page.tsx     # Design toolkit (gradients, shadows, colors)
│   │   ├── design-system/page.tsx    # Design system documentation
│   │   │
│   │   ├── examples/forms/page.tsx   # Form examples
│   │   ├── help/page.tsx             # Help & documentation
│   │   ├── support/page.tsx          # Support page
│   │   ├── privacy/page.tsx          # Privacy policy
│   │   └── terms/page.tsx            # Terms of service
│   │
│   ├── database-management/          # Database admin tools
│   │   ├── page.tsx                  # DB management interface
│   │   └── components/
│   │       └── table-data-viewer.tsx # Table data viewer
│   │
│   ├── settings/                     # Global settings (outside dashboard)
│   │   ├── page.tsx                  # Main settings page
│   │   └── components/               # Settings components
│   │       ├── custom-theme-builder.tsx
│   │       ├── custom-themes-list.tsx
│   │       ├── custom-template-designer.tsx
│   │       ├── custom-template-collection.tsx
│   │       └── premium-template-gallery.tsx
│   │
│   ├── demo/page.tsx                 # Demo page
│   ├── demo-font-selector/page.tsx   # Font selector demo
│   └── global-error.tsx              # Global error boundary
│
├── components/
│   ├── EmployeeForm.tsx              # Shared form (Create/Edit)
│   ├── CandidateForm.tsx             # Shared form (Create/Edit)
│   ├── OCRUploader.tsx               # Document OCR uploader
│   ├── theme-card.tsx                # Theme preview card
│   ├── template-preview.tsx          # Template preview component
│   ├── layout/                       # Layout components
│   │   ├── Header.tsx                # Header with navigation
│   │   ├── Sidebar.tsx               # Sidebar navigation
│   │   └── Navigation.tsx            # Navigation component
│   ├── forms/                        # Reusable form components
│   └── ui/                           # Shadcn UI components (40+ components)
│
├── lib/
│   ├── api.ts                        # Axios API client with interceptors
│   ├── api/                          # API service modules
│   ├── themes.ts                     # Theme definitions (12 predefined themes)
│   ├── custom-themes.ts              # Custom theme management
│   ├── templates.ts                  # Template system
│   ├── template-export.ts            # Template export utilities
│   └── utils.ts                      # Utility functions
│
├── stores/                           # Zustand state management
│   ├── auth-store.ts                 # Authentication state
│   └── settings-store.ts             # Settings state (visibility, preferences)
│
├── types/                            # TypeScript type definitions
├── proxy.ts                          # Next.js proxy (route protection)
└── public/                           # Static assets
```

**Page Count**: 45+ functional pages organized in 8 core modules

### Database Schema (13 Tables)

**Core Personnel Tables:**
- `users` - System users with role hierarchy (SUPER_ADMIN → ADMIN → COORDINATOR → KANRININSHA → EMPLOYEE → CONTRACT_WORKER)
- `candidates` - Candidate records (履歴書/Rirekisho) with 50+ fields, approval workflow, OCR data storage
- `employees` - Dispatch workers (派遣社員) linked to candidates via `rirekisho_id`
- `contract_workers` - Contract workers (請負社員)
- `staff` - Office/HR personnel (スタッフ)

**Business Tables:**
- `factories` - Client companies (派遣先) with JSON configuration storage
- `apartments` - Employee housing (社宅) with rent tracking
- `documents` - File storage with OCR data
- `contracts` - Employment contracts

**Operations Tables:**
- `timer_cards` - Attendance records (タイムカード) with 3 shift types (朝番/昼番/夜番), overtime, night, and holiday hours
- `salary_calculations` - Monthly payroll with detailed breakdowns
- `requests` - Employee requests (有給/半休/一時帰国/退社) with approval workflow
- `audit_log` - Complete audit trail

**Key Relationships:**
- Candidates → Employees via `rirekisho_id`
- Employees → Factories via `factory_id`
- Employees → Apartments via `apartment_id`

## Key Technical Details

### Authentication & Authorization

- **JWT-based authentication** with bcrypt password hashing
- **Role hierarchy**: SUPER_ADMIN → ADMIN → COORDINATOR → KANRININSHA → EMPLOYEE → CONTRACT_WORKER
- **Frontend**: Next.js proxy protects routes (`proxy.ts`)
- **Backend**: FastAPI dependency injection validates JWT on each request
- Access tokens stored in localStorage
- Token expiration: 480 minutes (8 hours)
- Login endpoint: `POST /api/auth/login`

### State Management (Frontend)

- **Zustand**: Global state for auth and settings (lightweight alternative to Redux)
- **React Query (@tanstack/react-query)**: Server state management with intelligent caching, auto-refetching
- **Next.js App Router**: File-based routing with dynamic `[id]` routes

### Theme System (Sistema de Temas)

The application features a **professional theming system** with 12 predefined themes plus unlimited custom themes.

**Predefined Themes (12 total)**:
- **Default**: `default-light`, `default-dark` - Classic themes
- **Corporate**: `uns-kikaku`, `industrial` - Professional business themes
- **Nature**: `ocean-blue`, `mint-green`, `forest-green`, `sunset` - Calming natural colors
- **Premium**: `royal-purple` - Luxury feel
- **Vibrant**: `vibrant-coral` - High energy
- **Minimalist**: `monochrome` - Black & white elegance
- **Warm**: `espresso` - Coffee-inspired tones

**Theme Features**:
- **Live Preview**: Hover over theme cards to preview (500ms delay)
- **Favorites**: Mark themes as favorites with heart icon
- **Category Filtering**: Filter by Corporate, Creative, Minimal, or Custom
- **Search**: Search themes by name or description
- **Custom Themes**: Create unlimited custom themes with Theme Builder
- **Theme Persistence**: Themes saved in localStorage via `next-themes`

**Theme Configuration** (`lib/themes.ts`):
```typescript
export interface Theme {
  name: string;
  colors: {
    "--background": string;       // Main background color (HSL)
    "--foreground": string;       // Main text color (HSL)
    "--card": string;             // Card background (HSL)
    "--primary": string;          // Primary brand color (HSL)
    "--accent": string;           // Accent color (HSL)
    "--border": string;           // Border color (HSL)
    // ... more CSS custom properties
  };
}
```

**Custom Theme Creation**:
- Navigate to `/settings` or `/dashboard/themes`
- Use **Custom Theme Builder** to create themes
- Pick colors for each design token (primary, background, card, accent, etc.)
- Save with custom name
- Themes stored in localStorage as `custom-{name}`
- Manage in "Mis Temas Personalizados" tab

**Theme Management Pages**:
- `/settings` - Main theme configuration with tabs (Predefined, Create, Custom)
- `/dashboard/themes` - Gallery view with search and filtering
- `/dashboard/customizer` - Live theme & template customizer
- `/dashboard/settings/appearance` - Appearance settings

### Template System (Sistema de Plantillas)

**Professional template system** for customizing the visual layout and styling of the application.

**Template Features**:
- **Premium Templates**: Pre-designed professional layouts
- **Custom Template Designer**: Create templates with visual editor
- **Template Variables**: Customize typography, spacing, shadows, borders
- **Export/Import**: Download templates as JSON, share configurations
- **Live Preview**: Real-time preview while designing

**Template Variables** (Customizable):
```typescript
interface TemplateVariables {
  // Typography
  "--layout-font-heading": string;     // Heading font family
  "--layout-font-body": string;        // Body text font
  "--layout-font-ui": string;          // UI elements font

  // Layout
  "--layout-card-radius": string;      // Card border radius (0-32px)
  "--layout-button-radius": string;    // Button border radius (0-999px)
  "--layout-panel-blur": string;       // Panel backdrop blur (0-40px)
  "--layout-container-max": string;    // Max container width
  "--layout-section-gap": string;      // Section spacing

  // Effects
  "--layout-card-shadow": string;      // Card shadow CSS
  "--layout-button-shadow": string;    // Button shadow CSS
}
```

**Template Management**:
- **Create**: `/settings` → "Diseña tu formato a medida" section
- **Gallery**: "Colección de plantillas premium" section
- **Collection**: "Mis plantillas personalizadas" - manage saved templates
- **Storage**: Templates saved in localStorage
- **Apply**: One-click activation with `applyTemplateToDocument()`

### Design Tools & Customization (Herramientas de Diseño)

The system includes **professional design tools** for creating custom UI elements without code.

#### Customizer (`/dashboard/customizer`)

**Real-time visual customizer** with live preview:

- **Left Panel - Controls**:
  - Template selector (switch between predefined templates)
  - Theme selector (apply any theme)
  - Quick customization sliders:
    - Card Radius (0-32px)
    - Button Radius (0-999px)
    - Panel Blur (0-40px)
  - Advanced options (accordion):
    - Typography (heading, body, UI fonts)
    - Spacing (container max, section gap)
    - Shadows & Effects (card shadow, button shadow)

- **Right Panel - Live Preview**:
  - Real-time preview of changes
  - Device toggle (desktop/mobile/tablet)
  - Updates instantly as you adjust controls

- **Actions**:
  - **Apply All**: Apply theme + template to entire app
  - **Reset**: Restore template defaults
  - **Export**: Download configuration as JSON

#### Design Tools (`/dashboard/design-tools`)

**Advanced toolkit** for creating design assets:

- **Gradient Generator**: Create CSS gradients visually
- **Shadow Generator**: Design box-shadows and text-shadows
- **Color Palette Generator**: Generate harmonious color schemes
- **Typography Scale**: Preview font sizing and spacing
- **Border Radius Previewer**: Test different border radius values
- **Spacing Scale**: Visualize spacing system

#### Design System (`/dashboard/design-system`)

**Complete design system documentation**:

- **Colors**: All theme colors with HSL values
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Spacing scale (4px base grid)
- **Components**: Documentation for all UI components
- **Design Tokens**: All CSS custom properties
- **Usage Examples**: Code snippets for each component

**Design System Features**:
- Copy-paste ready code examples
- Visual previews of all tokens
- Responsive breakpoints documentation
- Accessibility guidelines
- Animation timing functions

### OCR Integration (Hybrid Approach)

The system uses a **multi-provider OCR strategy** for processing Japanese documents:

- **Primary**: Azure Computer Vision API (best for Japanese text)
- **Secondary**: EasyOCR (deep learning-based, works offline)
- **Fallback**: Tesseract OCR (open-source)
- **Face Detection**: MediaPipe for photo verification

**OCR Workflow:**
1. User uploads 履歴書 (Rirekisho) image via `OCRUploader` component
2. Image sent to backend `/api/azure-ocr/process` endpoint
3. Hybrid OCR service processes with available providers
4. Extracted data normalized and validated
5. Candidate record auto-created/updated
6. OCR results stored in `documents.ocr_data` JSON field

**Supported Documents:**
- 履歴書 (Rirekisho/Resume) - Full Japanese CV with 50+ fields
- 在留カード (Zairyu Card/Residence Card) - Foreign worker permit
- 運転免許証 (Driver's License)

**Configuration:**
Set `AZURE_COMPUTER_VISION_ENDPOINT` and `AZURE_COMPUTER_VISION_KEY` in environment. System automatically falls back to other providers if Azure is unavailable.

### Environment Variables

Key variables in `.env` or `docker-compose.yml`:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `FRONTEND_URL` - For CORS configuration

**Optional:**
- `AZURE_COMPUTER_VISION_*` - OCR service credentials
- `SMTP_*` - Email service configuration
- `LINE_CHANNEL_ACCESS_TOKEN` - For LINE notifications
- `DEBUG` - Enable debug mode
- `LOG_LEVEL` - Logging level (default: INFO)

See `.env.example` for complete list of configuration options.

### Date Handling

- Backend uses `datetime` with timezone awareness (pytz)
- Frontend uses `date-fns` for date formatting
- Japanese calendar considerations for fiscal year calculations
- Date formats:
  - Database: ISO-8601 with timezone
  - API: ISO-8601
  - UI: Localized JP format (YYYY年MM月DD日)

## Common Development Workflows

### Adding a New API Endpoint

1. Define Pydantic schema in `app/schemas/`:
```python
from pydantic import BaseModel
from datetime import datetime

class NewEntityBase(BaseModel):
    name: str
    description: str | None = None

class NewEntityCreate(NewEntityBase):
    pass

class NewEntityResponse(NewEntityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode)
```

2. Create endpoint in `app/api/`:
```python
from fastapi import APIRouter, Depends
from app.schemas.new_entity import NewEntityCreate, NewEntityResponse
from app.models.models import NewEntity
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/new-entities", tags=["new-entities"])

@router.post("/", response_model=NewEntityResponse)
def create_new_entity(
    entity: NewEntityCreate,
    db: Session = Depends(get_db)
):
    db_entity = NewEntity(**entity.model_dump())
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity
```

3. Register router in `app/main.py`:
```python
from app.api import new_entity
app.include_router(new_entity.router, prefix="/api")
```

4. Update frontend API client in `lib/api.ts` or `lib/api/`

### Adding a New Database Table

1. Add SQLAlchemy model to `app/models/models.py`:
```python
class NewEntity(Base):
    __tablename__ = "new_entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="new_entities")
```

2. Create migration: `alembic revision --autogenerate -m "add_new_entity"`
3. Review migration file in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Create corresponding Pydantic schemas

### Adding a New Next.js Page

1. Create page file in `app/` directory:
```typescript
// app/new-feature/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function NewFeaturePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['newFeature'],
    queryFn: () => api.get('/api/new-feature').then(res => res.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>New Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

2. For dynamic routes, use `[id]` folder structure:
```
app/
└── new-feature/
    ├── page.tsx              # List view
    ├── [id]/
    │   └── page.tsx          # Detail view
    └── [id]/edit/
        └── page.tsx          # Edit view
```

3. Add navigation link in `components/layout/Sidebar.tsx` or navigation component

### Debugging Issues

**Logs and Monitoring:**
- Check logs: `LOGS.bat` (select service to monitor)
- Real-time logs: `docker logs -f uns-claudejp-backend` (or `-frontend`, `-db`)
- API documentation: http://localhost:8000/api/docs (Swagger UI)
- Database admin: http://localhost:8080 (Adminer)

**Common Issues:**

1. **Login fails**:
   - Reset admin password: `docker exec -it uns-claudejp-backend python scripts/create_admin_user.py`
   - Default credentials: `admin` / `admin123`
   - Check JWT `SECRET_KEY` is set in environment

2. **Database errors**:
   - Verify PostgreSQL is running: `docker ps | findstr uns-claudejp-db`
   - Check connection: `docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp`
   - Run migrations: `docker exec -it uns-claudejp-backend alembic upgrade head`

3. **Frontend doesn't load**:
   - Next.js compilation can take 1-2 minutes on first build
   - Check frontend logs: `docker logs uns-claudejp-frontend`
   - Verify backend is accessible: http://localhost:8000/api/health
   - Clear browser cache and localStorage

4. **OCR failures**:
   - Check if Azure credentials are set: `AZURE_COMPUTER_VISION_ENDPOINT`, `AZURE_COMPUTER_VISION_KEY`
   - System automatically falls back to EasyOCR/Tesseract if Azure unavailable
   - OCR can be disabled with `OCR_ENABLED=false`

5. **Port conflicts**:
   - Required ports: 3000 (frontend), 8000 (backend), 5432 (PostgreSQL), 8080 (Adminer)
   - Windows: `netstat -ano | findstr "3000"` to check port usage
   - Kill process: `taskkill /PID <pid> /F`

6. **Docker issues**:
   - Ensure Docker Desktop is running
   - Check container status: `docker ps -a`
   - Restart containers: `STOP.bat` then `START.bat`
   - Nuclear option: `REINSTALAR.bat` (destroys all data)

## Testing

### Backend Tests
- Located in `backend/tests/`
- Run with `pytest` inside backend container
- Use `pytest-asyncio` for async endpoint testing
- Debug with: `pytest -vs` for verbose output

### Frontend Tests
- Testing framework: Playwright (E2E) available in devDependencies
- Currently minimal testing infrastructure
- Add component tests using Vitest or Jest

## Important Notes

- **LIXO folder**: Contains obsolete v3.x files (old Vite frontend), can be ignored
- **Default credentials**: `admin` / `admin123` (CHANGE IN PRODUCTION!)
- **Docker required**: All services run in containers
- **Port requirements**: 3000, 8000, 5432, 8080
- **Japanese terminology**: Extensive use of Japanese HR terms (履歴書, 派遣社員, タイムカード, etc.)
- **v5.0 Upgrade**: Upgraded to Next.js 16 with React 19, Turbopack default bundler in October 2025
- **Next.js**: Uses App Router (not Pages Router), Server Components by default

## Critical Development Rules

**NEVER DELETE OR MODIFY:**
1. **Batch scripts** in `scripts/` folder (START.bat, STOP.bat, LOGS.bat, etc.) - System depends on these
2. **Orchestration files** in `.claude/agents/` - Agent delegation system
3. **Working code** - If it works, don't touch it; only add or enhance
4. **Migration history** in `backend/alembic/versions/` - Git conflicts can break the database
5. **Configuration files** - docker-compose.yml, .env structure, package.json

**WINDOWS COMPATIBILITY:**
- All scripts must work on any Windows PC with Docker Desktop
- Use Windows-style paths in batch files (`\` not `/`)
- PowerShell and cmd.exe compatible
- No WSL/Linux dependencies required

**BEFORE MAJOR CHANGES:**
- Suggest creating a Git branch
- Ask for confirmation before modifying existing code
- Maintain current coding style and conventions
- Verify changes don't break Docker orchestration

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js application |
| **Backend API** | http://localhost:8000 | FastAPI REST API |
| **API Docs** | http://localhost:8000/api/docs | Interactive Swagger UI |
| **ReDoc** | http://localhost:8000/api/redoc | Alternative API docs |
| **Adminer** | http://localhost:8080 | Database management UI |
| **Health Check** | http://localhost:8000/api/health | Backend health status |

## Docker Services

The application runs 5 services via Docker Compose:

1. **db** - PostgreSQL 15 with persistent volume
2. **importer** - One-time data initialization (creates admin user, imports demo data)
3. **backend** - FastAPI application with hot reload
4. **frontend** - Next.js 16 application with hot reload (Turbopack default)
5. **adminer** - Database management UI

All services communicate via `uns-network` bridge network.
