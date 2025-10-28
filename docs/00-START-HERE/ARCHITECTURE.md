# 🏗️ Arquitectura del Sistema - UNS-ClaudeJP 5.0

**Última actualización:** 2025-10-28

Este documento describe la arquitectura completa del sistema UNS-ClaudeJP 5.0, incluyendo componentes, flujo de datos, y decisiones de diseño.

---

## 📐 Visión General

UNS-ClaudeJP 5.0 es una **aplicación web full-stack** con arquitectura de 3 capas:

```
┌─────────────────────────────────────────────┐
│         FRONTEND (Next.js 16)               │
│  - React 19 Components                      │
│  - App Router (45+ pages)                   │
│  - Zustand State Management                 │
│  - React Query (Server State)               │
└─────────────┬───────────────────────────────┘
              │ HTTP/REST API
              │ (JSON)
┌─────────────▼───────────────────────────────┐
│         BACKEND (FastAPI)                   │
│  - 15 API Routers                           │
│  - Business Logic Services                  │
│  - SQLAlchemy ORM                           │
│  - JWT Authentication                       │
└─────────────┬───────────────────────────────┘
              │ SQL Queries
              │ (SQLAlchemy)
┌─────────────▼───────────────────────────────┐
│      DATABASE (PostgreSQL 15)               │
│  - 13 Tables (Relational)                   │
│  - JSON Fields (OCR data, configs)          │
│  - Full Audit Trail                         │
└─────────────────────────────────────────────┘
```

**Servicios Externos:**
- Azure Computer Vision API (OCR)
- Email SMTP (Notificaciones)
- LINE API (Notificaciones móviles)

---

## 🎯 Principios de Diseño

1. **Separation of Concerns** - Cada capa tiene responsabilidad clara
2. **API-First** - Backend expone REST API completa
3. **Type Safety** - TypeScript (frontend) + Pydantic (backend)
4. **Database-First** - SQLAlchemy ORM con migraciones Alembic
5. **Hybrid Approach** - Server Components + Client Components (Next.js)
6. **Progressive Enhancement** - Funciona sin JavaScript para features básicas
7. **Mobile-First** - UI responsive desde móvil a desktop
8. **Offline-Ready OCR** - Fallbacks para cuando Azure no disponible

---

## 🖥️ Frontend - Next.js 16

### Arquitectura del Frontend

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (providers, theme)
│   ├── page.tsx            # Home page
│   ├── login/              # Authentication
│   │
│   ├── (dashboard)/        # Protected route group
│   │   ├── layout.tsx      # Dashboard layout (sidebar, header)
│   │   ├── dashboard/      # Main dashboard
│   │   ├── candidates/     # Candidate management (6 pages)
│   │   ├── employees/      # Employee management (5 pages)
│   │   ├── factories/      # Factory management (2 pages)
│   │   ├── timercards/     # Attendance tracking
│   │   ├── salary/         # Payroll
│   │   ├── requests/       # Leave requests
│   │   ├── themes/         # Theme gallery
│   │   ├── customizer/     # Visual customizer
│   │   └── settings/       # Settings
│   │
│   └── database-management/ # DB admin tools
│
├── components/             # React components
│   ├── layout/             # Layout components
│   ├── forms/              # Form components
│   └── ui/                 # Shadcn UI (40+ components)
│
├── lib/                    # Libraries
│   ├── api.ts              # Axios client with interceptors
│   ├── api/                # API service modules
│   ├── themes.ts           # Theme definitions
│   ├── templates.ts        # Template system
│   └── utils.ts            # Utilities (cn, formatters)
│
├── stores/                 # Zustand state
│   ├── auth-store.ts       # Authentication state
│   └── settings-store.ts   # Settings state
│
├── types/                  # TypeScript types
└── proxy.ts                # Route protection middleware
```

### Stack del Frontend

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Framework** | Next.js | 16.0.0 | SSR, App Router, File-based routing |
| **UI Library** | React | 19.0.0 | Component-based UI |
| **Language** | TypeScript | 5.6 | Type safety |
| **Bundler** | Turbopack | - | Default bundler (reemplaza Webpack) |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Components** | Shadcn UI | - | 40+ componentes pre-construidos |
| **State (Global)** | Zustand | - | Lightweight state management |
| **State (Server)** | React Query | - | Server state, caching, refetching |
| **HTTP Client** | Axios | - | API requests con interceptors |
| **Forms** | React Hook Form | - | Form validation |
| **Themes** | next-themes | - | Dark mode, custom themes |
| **Icons** | Lucide React | - | Icon library |
| **Date/Time** | date-fns | - | Date formatting |

### Patrones del Frontend

#### 1. App Router (File-based Routing)

```typescript
app/
  dashboard/
    candidates/
      page.tsx          → /dashboard/candidates
      [id]/
        page.tsx        → /dashboard/candidates/:id
        edit/
          page.tsx      → /dashboard/candidates/:id/edit
```

#### 2. Server Components por Defecto

```typescript
// Server Component (default)
export default async function CandidatesPage() {
  // Puede hacer data fetching directamente
  const candidates = await fetchCandidates();
  return <CandidatesList data={candidates} />;
}

// Client Component (cuando necesario)
'use client';
export default function InteractiveForm() {
  const [state, setState] = useState();
  // ...
}
```

#### 3. API Client con Interceptors

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor - agrega JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - maneja errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

#### 4. React Query para Server State

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['candidates'],
  queryFn: () => api.get('/api/candidates').then(res => res.data),
  staleTime: 5 * 60 * 1000, // 5 minutos
  refetchOnWindowFocus: true,
});
```

#### 5. Zustand para Global State

```typescript
// stores/auth-store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

---

## 🔧 Backend - FastAPI

### Arquitectura del Backend

```
backend/
├── app/
│   ├── main.py               # FastAPI app, router registration
│   │
│   ├── api/                  # REST API endpoints
│   │   ├── auth.py           # POST /api/auth/login
│   │   ├── candidates.py     # CRUD + OCR
│   │   ├── employees.py      # CRUD employees
│   │   ├── factories.py      # CRUD factories
│   │   ├── timer_cards.py    # Attendance CRUD
│   │   ├── salary.py         # Payroll calculations
│   │   ├── requests.py       # Leave request workflow
│   │   ├── dashboard.py      # Stats & analytics
│   │   ├── database.py       # DB management endpoints
│   │   ├── azure_ocr.py      # OCR processing
│   │   ├── import_export.py  # Data import/export
│   │   ├── monitoring.py     # Health checks
│   │   ├── notifications.py  # Email/LINE notifications
│   │   ├── reports.py        # PDF report generation
│   │   └── settings.py       # App settings API
│   │
│   ├── models/
│   │   └── models.py         # SQLAlchemy ORM (13 tables)
│   │
│   ├── schemas/              # Pydantic request/response models
│   │   ├── candidate.py
│   │   ├── employee.py
│   │   ├── auth.py
│   │   └── ...
│   │
│   ├── services/             # Business logic layer
│   │   ├── auth_service.py
│   │   ├── azure_ocr_service.py
│   │   ├── easyocr_service.py
│   │   ├── hybrid_ocr_service.py
│   │   ├── face_detection_service.py
│   │   ├── notification_service.py
│   │   ├── payroll_service.py
│   │   └── report_service.py
│   │
│   ├── core/                 # Core configuration
│   │   ├── config.py         # Settings (from env)
│   │   ├── database.py       # SQLAlchemy setup, session
│   │   ├── logging.py        # Loguru configuration
│   │   └── middleware.py     # Security, CORS, logging
│   │
│   └── utils/                # Utility functions
│       ├── security.py       # JWT, password hashing
│       └── ...
│
├── alembic/                  # Database migrations
│   ├── versions/             # Migration files
│   └── env.py                # Alembic config
│
└── scripts/                  # Maintenance scripts
    ├── create_admin_user.py
    ├── import_data.py
    └── verify_data.py
```

### Stack del Backend

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Framework** | FastAPI | 0.115.6 | REST API framework |
| **Language** | Python | 3.11+ | Backend language |
| **ORM** | SQLAlchemy | 2.0.36 | Database ORM |
| **Database** | PostgreSQL | 15 | Relational database |
| **Migrations** | Alembic | - | Database migrations |
| **Validation** | Pydantic | - | Request/response validation |
| **Authentication** | JWT | - | Stateless auth |
| **Password Hash** | Bcrypt | - | Secure password storage |
| **Logging** | Loguru | - | Structured logging |
| **OCR (Primary)** | Azure Vision | - | Japanese text recognition |
| **OCR (Secondary)** | EasyOCR | - | Deep learning OCR |
| **OCR (Fallback)** | Tesseract | - | Open-source OCR |
| **Face Detection** | MediaPipe | - | Photo extraction |
| **PDF Generation** | ReportLab | - | PDF reports |
| **Email** | SMTP | - | Email notifications |

### Patrones del Backend

#### 1. API Router Registration

```python
# app/main.py
from fastapi import FastAPI
from app.api import auth, candidates, employees, ...

app = FastAPI()

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
# ... 12 more routers
```

#### 2. Dependency Injection

```python
# app/api/candidates.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.utils.security import get_current_user

router = APIRouter()

@router.get("/")
def get_candidates(
    db: Session = Depends(get_db),              # Database session
    current_user: User = Depends(get_current_user), # Auth user
    skip: int = 0,
    limit: int = 100
):
    candidates = db.query(Candidate).offset(skip).limit(limit).all()
    return candidates
```

#### 3. Pydantic Schemas (Request/Response)

```python
# app/schemas/candidate.py
from pydantic import BaseModel, Field
from datetime import datetime

class CandidateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str | None = None
    phone: str | None = None

class CandidateCreate(CandidateBase):
    pass  # For POST requests

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (era orm_mode)
```

#### 4. Service Layer Pattern

```python
# app/services/hybrid_ocr_service.py
class HybridOCRService:
    def __init__(self):
        self.azure = AzureOCRService()
        self.easyocr = EasyOCRService()
        self.tesseract = TesseractService()

    async def process_document(self, image_data: bytes):
        # Try Azure first (best for Japanese)
        try:
            return await self.azure.extract_text(image_data)
        except Exception:
            pass

        # Fallback to EasyOCR
        try:
            return await self.easyocr.extract_text(image_data)
        except Exception:
            pass

        # Last resort: Tesseract
        return await self.tesseract.extract_text(image_data)
```

#### 5. JWT Authentication

```python
# app/utils/security.py
from jose import JWTError, jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=480)  # 8 hours
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🗄️ Base de Datos - PostgreSQL

### Esquema de Datos (13 Tablas)

```
┌─────────────────────────────────────────────────┐
│                   CORE TABLES                   │
└─────────────────────────────────────────────────┘

users                     candidates               employees
├── id (PK)               ├── id (PK)              ├── id (PK)
├── username              ├── name                 ├── rirekisho_id (FK → candidates)
├── email                 ├── name_kana            ├── factory_id (FK → factories)
├── password_hash         ├── birthdate            ├── apartment_id (FK → apartments)
├── role                  ├── gender               ├── employee_number
├── created_at            ├── email                ├── contract_type
└── ...                   ├── phone                ├── start_date
                          ├── ocr_data (JSON)      └── ...
                          ├── photo_url
                          ├── status               contract_workers
                          └── ...                  ├── id (PK)
                                                   ├── name
                          factories                └── ...
                          ├── id (PK)
                          ├── name                 staff
                          ├── address              ├── id (PK)
                          ├── config (JSON)        ├── name
                          └── ...                  └── ...

┌─────────────────────────────────────────────────┐
│              OPERATIONS TABLES                  │
└─────────────────────────────────────────────────┘

timer_cards               salary_calculations      requests
├── id (PK)               ├── id (PK)              ├── id (PK)
├── employee_id (FK)      ├── employee_id (FK)     ├── employee_id (FK)
├── date                  ├── month                ├── request_type
├── shift_type            ├── base_salary          ├── start_date
├── hours_normal          ├── overtime_pay         ├── end_date
├── hours_overtime        ├── total_pay            ├── status
├── hours_night           ├── deductions           ├── approved_by
├── hours_holiday         └── ...                  └── ...
└── ...

┌─────────────────────────────────────────────────┐
│              SUPPORT TABLES                     │
└─────────────────────────────────────────────────┘

documents                 contracts                apartments
├── id (PK)               ├── id (PK)              ├── id (PK)
├── candidate_id (FK)     ├── employee_id (FK)     ├── name
├── document_type         ├── start_date           ├── address
├── file_url              ├── end_date             ├── rent_amount
├── ocr_data (JSON)       ├── salary               └── ...
└── ...                   └── ...

audit_log
├── id (PK)
├── user_id (FK)
├── action
├── table_name
├── record_id
├── timestamp
└── changes (JSON)
```

### Relaciones Clave

```
candidates (履歴書) ──┐
                      │ rirekisho_id
                      ▼
employees (派遣社員) ──┬─► factories (派遣先)
                      │ factory_id
                      │
                      ├─► apartments (社宅)
                      │ apartment_id
                      │
                      ├─► timer_cards (タイムカード)
                      │ employee_id
                      │
                      ├─► salary_calculations (給与)
                      │ employee_id
                      │
                      └─► requests (申請)
                        employee_id
```

### Tipos de Datos Especiales

#### JSON Fields

1. **`candidates.ocr_data`** - Datos extraídos por OCR
```json
{
  "raw_text": "...",
  "fields": {
    "name": "山田太郎",
    "birthdate": "1990-01-01",
    "address": "東京都...",
    "...": "..."
  },
  "confidence": 0.95,
  "provider": "azure"
}
```

2. **`factories.config`** - Configuración específica de factory
```json
{
  "shift_times": {
    "morning": {"start": "08:00", "end": "17:00"},
    "afternoon": {"start": "17:00", "end": "02:00"},
    "night": {"start": "22:00", "end": "07:00"}
  },
  "overtime_rate": 1.25,
  "night_rate": 1.35
}
```

3. **`audit_log.changes`** - Cambios realizados
```json
{
  "before": {"status": "active"},
  "after": {"status": "terminated"},
  "changed_fields": ["status", "termination_date"]
}
```

---

## 🔄 Flujo de Datos

### 1. Flujo de Autenticación

```
User (Browser)
    │
    ▼
┌─────────────────┐
│ POST /api/auth/ │
│      login      │
│                 │
│ { username,     │
│   password }    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend: auth.py       │
│                         │
│  1. Verify password     │
│  2. Create JWT token    │
│  3. Return token        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ { "access_token": "...",│
│   "token_type": "bearer"│
│   "user": {...} }       │
└────────┬────────────────┘
         │
         ▼
Frontend stores token
in localStorage
         │
         ▼
All subsequent requests
include header:
Authorization: Bearer <token>
```

### 2. Flujo de OCR Processing

```
User uploads 履歴書 image
    │
    ▼
┌──────────────────────────┐
│ Frontend: OCRUploader    │
│                          │
│ FormData with image file │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /api/azure-ocr/process  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Backend: HybridOCRService        │
│                                  │
│ Try Azure Computer Vision        │
│    ├─ Success? → Return result   │
│    └─ Fail? ↓                    │
│                                  │
│ Try EasyOCR                      │
│    ├─ Success? → Return result   │
│    └─ Fail? ↓                    │
│                                  │
│ Try Tesseract                    │
│    └─ Return result              │
└──────────┬───────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Normalize extracted data       │
│ ├─ Name (name, name_kana)      │
│ ├─ Birthdate                   │
│ ├─ Address                     │
│ ├─ Phone                       │
│ └─ 50+ other fields            │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ MediaPipe Face Detection       │
│ Extract photo from document    │
│ Save to /uploads/photos/       │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Create/Update Candidate        │
│ ├─ Save extracted fields       │
│ ├─ Save ocr_data (JSON)        │
│ └─ Save photo_url              │
└──────────┬─────────────────────┘
           │
           ▼
Return candidate object to frontend
```

### 3. Flujo de Salary Calculation

```
Monthly cron job triggers
    │
    ▼
┌────────────────────────────┐
│ PayrollService             │
│                            │
│ For each active employee:  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ 1. Fetch all timer_cards for month│
│    SELECT * FROM timer_cards       │
│    WHERE employee_id = ?           │
│      AND month = ?                 │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ 2. Calculate totals                │
│    ├─ Normal hours                 │
│    ├─ Overtime hours (* 1.25)      │
│    ├─ Night hours (* 1.35)         │
│    └─ Holiday hours (* 1.35)       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ 3. Apply rates from factory config │
│    base_rate = employee.hourly_rate│
│    total_pay = Σ(hours × rates)    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ 4. Calculate deductions            │
│    ├─ Tax (源泉徴収)                │
│    ├─ Social Insurance (社会保険)  │
│    ├─ Rent (if apartment)          │
│    └─ Other                        │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ 5. Create salary_calculation record│
│    INSERT INTO salary_calculations │
│    (..., net_pay)                  │
└────────┬───────────────────────────┘
         │
         ▼
Send notification to employee
Generate PDF pay slip
```

---

## 🐳 Docker Architecture

### Container Orchestration

```
docker-compose.yml
    │
    ├─► uns-claudejp-db (PostgreSQL)
    │   ├─ Port: 5432
    │   ├─ Volume: postgres_data
    │   └─ Network: uns-network
    │
    ├─► uns-claudejp-backend (FastAPI)
    │   ├─ Port: 8000
    │   ├─ Depends on: db
    │   ├─ Volume: ./backend:/app
    │   └─ Network: uns-network
    │
    ├─► uns-claudejp-frontend (Next.js)
    │   ├─ Port: 3000
    │   ├─ Depends on: backend
    │   ├─ Volume: ./frontend:/app
    │   └─ Network: uns-network
    │
    ├─► uns-claudejp-adminer (Adminer)
    │   ├─ Port: 8080
    │   ├─ Depends on: db
    │   └─ Network: uns-network
    │
    └─► uns-claudejp-importer (One-time)
        ├─ Depends on: backend, db
        ├─ Runs: import_data.py
        └─ Exits after completion
```

### Network Topology

```
Host Machine (Windows/Linux/macOS)
    │
    ├─ Port 3000 → Frontend Container
    ├─ Port 8000 → Backend Container
    ├─ Port 8080 → Adminer Container
    └─ Port 5432 → PostgreSQL Container
           │
           └─ Volume: postgres_data (persistent)

Internal Network (uns-network)
    │
    ├─ frontend → backend:8000 (API calls)
    ├─ backend → db:5432 (SQL queries)
    └─ adminer → db:5432 (DB management)
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend verifies password (bcrypt)
   ↓
3. Backend creates JWT token
   {
     "sub": user_id,
     "role": "ADMIN",
     "exp": timestamp + 8 hours
   }
   ↓
4. Frontend stores token in localStorage
   ↓
5. All requests include header:
   Authorization: Bearer <token>
   ↓
6. Backend validates token on each request
   ↓
7. Backend checks role permissions
   ↓
8. Request processed or rejected
```

### Role Hierarchy

```
SUPER_ADMIN
    ├─ Can do everything
    ├─ Manage all users
    └─ Access all data

ADMIN
    ├─ Manage candidates, employees
    ├─ Approve requests
    └─ View reports

COORDINATOR
    ├─ Manage assignments
    ├─ View employee data
    └─ Limited editing

KANRININSHA (管理人者)
    ├─ View assigned employees
    └─ Basic operations

EMPLOYEE
    ├─ View own data
    └─ Submit requests

CONTRACT_WORKER
    ├─ View own data (limited)
    └─ Submit requests (limited)
```

### Security Layers

1. **Network Level:**
   - CORS configured (only allowed origins)
   - Rate limiting on API endpoints
   - HTTPS in production (recommended)

2. **Application Level:**
   - JWT expiration (8 hours)
   - Role-based access control (RBAC)
   - Input validation (Pydantic)
   - SQL injection prevention (ORM)
   - XSS prevention (React escaping)

3. **Database Level:**
   - Password hashing (bcrypt)
   - Audit log (all changes tracked)
   - Prepared statements (SQLAlchemy)

4. **Docker Level:**
   - Isolated network
   - Non-root users in containers
   - Environment variables for secrets

---

## 📊 Performance Considerations

### Frontend Optimization

1. **Next.js App Router:**
   - Server Components (reduce JS bundle)
   - Automatic code splitting
   - Turbopack bundler (faster than Webpack)

2. **Caching:**
   - React Query cache (5 min stale time)
   - LocalStorage for theme/settings
   - Service Workers (future)

3. **Image Optimization:**
   - Next.js Image component (automatic optimization)
   - WebP format
   - Lazy loading

### Backend Optimization

1. **Database:**
   - Indexes on foreign keys
   - Indexes on frequently queried fields
   - Connection pooling (SQLAlchemy)

2. **API:**
   - Pagination (default 100 items)
   - Field selection (GraphQL-style in future)
   - Compression (gzip)

3. **Async Operations:**
   - OCR processing (async)
   - Email sending (background tasks)
   - Report generation (background tasks)

### Database Optimization

1. **Indexes:**
   - Primary keys (automatic)
   - Foreign keys (all relationships)
   - Composite indexes (multi-field queries)

2. **Query Optimization:**
   - Eager loading (avoid N+1)
   - Select only needed fields
   - Use JOINs efficiently

3. **Migrations:**
   - Online migrations (zero downtime)
   - Alembic tracks all changes

---

## 🧪 Testing Strategy

### Frontend Tests (Future)

- **Unit Tests:** Vitest or Jest
- **Integration Tests:** React Testing Library
- **E2E Tests:** Playwright

### Backend Tests

- **Unit Tests:** pytest
- **Integration Tests:** pytest with test database
- **API Tests:** pytest + httpx

### Manual Testing

- **Swagger UI:** http://localhost:8000/api/docs
- **Adminer:** Direct SQL queries

---

## 📈 Scalability

### Horizontal Scaling

```
Load Balancer
    │
    ├─► Frontend Instance 1
    ├─► Frontend Instance 2
    └─► Frontend Instance 3
         │
         ├─► Backend Instance 1
         ├─► Backend Instance 2
         └─► Backend Instance 3
              │
              └─► PostgreSQL (single instance or cluster)
```

### Vertical Scaling

- Increase container resources
- Optimize queries
- Add caching layer (Redis)

---

## 🎯 Future Architecture Improvements

1. **Microservices:**
   - Separate OCR service
   - Separate notification service
   - Separate report generation service

2. **Caching:**
   - Redis for session storage
   - Redis for frequently accessed data

3. **Message Queue:**
   - RabbitMQ or Celery for background jobs
   - Async task processing

4. **CDN:**
   - CloudFront or similar
   - Static asset delivery

5. **Monitoring:**
   - Prometheus + Grafana
   - Error tracking (Sentry)
   - APM (Application Performance Monitoring)

---

## 📚 Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Última actualización:** 2025-10-28

[← Volver a START-HERE](README.md) | [Ver Índice Completo](../INDEX.md)
