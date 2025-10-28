# Project Context - UNS-ClaudeJP 5.0

**Last Updated:** 2025-10-28

---

## Purpose

**UNS-ClaudeJP 5.0** is a comprehensive HR management system designed specifically for Japanese staffing agencies (人材派遣会社). The system manages the complete lifecycle of temporary workers from candidate intake to employee management, payroll, and operations.

### Primary Goals

1. **Digitalize HR Operations** - Replace manual/Excel-based processes with automated workflows
2. **OCR Document Processing** - Automate Japanese document (履歴書/Rirekisho) processing using hybrid OCR
3. **Streamline Payroll** - Automated calculation of salaries including overtime, night shifts, and deductions
4. **Multi-tenant Support** - Manage multiple client factories (派遣先) and employee assignments
5. **Compliance** - Track employee documentation, work permits (在留カード), and contracts
6. **Reporting** - Generate comprehensive reports for management and regulatory requirements

### Target Users

- **Super Admins** - System administrators with full access
- **Admins** - HR managers handling candidate/employee operations
- **Coordinators** - Assignment managers coordinating employee-factory placements
- **Kanrininsha (管理人者)** - Site managers overseeing specific locations
- **Employees** - Workers viewing their own data and submitting requests

---

## Tech Stack

### Frontend
- **Next.js 16.0.0** - React framework with App Router and Turbopack
- **React 19.0.0** - UI library with Server Components
- **TypeScript 5.6** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn UI** - Pre-built accessible components (40+ components)
- **Zustand** - Lightweight state management
- **React Query (@tanstack/react-query)** - Server state management with caching
- **Axios** - HTTP client with interceptors
- **date-fns** - Date manipulation library
- **next-themes** - Theme management (dark mode + custom themes)
- **React Hook Form** - Form validation and handling
- **Recharts** - Data visualization

### Backend
- **FastAPI 0.115.6** - Modern Python web framework
- **Python 3.11+** - Backend language
- **SQLAlchemy 2.0.36** - ORM for database operations
- **PostgreSQL 15** - Relational database
- **Alembic** - Database migration tool
- **Pydantic** - Data validation and serialization
- **JWT (python-jose)** - Authentication tokens
- **Bcrypt (passlib)** - Password hashing
- **Loguru** - Structured logging
- **python-multipart** - File upload handling
- **python-dotenv** - Environment variable management

### OCR & AI
- **Azure Computer Vision API** - Primary OCR for Japanese text (best accuracy)
- **EasyOCR** - Secondary OCR using deep learning (offline capable)
- **Tesseract OCR** - Fallback open-source OCR
- **MediaPipe** - Face detection for photo extraction from documents
- **OpenCV** - Image preprocessing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration (5 services)
- **Git** - Version control
- **GitHub** - Repository hosting and CI/CD
- **Adminer** - Database management UI

### Testing
- **Playwright** - E2E testing (via MCP)
- **pytest** - Python unit/integration testing
- **pytest-asyncio** - Async testing for FastAPI

---

## Project Conventions

### Code Style

#### TypeScript/React (Frontend)
- **File naming:**
  - Components: PascalCase (`EmployeeForm.tsx`)
  - Pages: lowercase (`page.tsx`)
  - Utilities: camelCase (`api.ts`)
- **Component structure:**
  ```typescript
  'use client'; // Only when needed (Client Components)

  import { useState } from 'react';

  interface Props {
    id: number;
    name: string;
  }

  export default function ComponentName({ id, name }: Props) {
    // Component logic
  }
  ```
- **Imports order:**
  1. React/Next.js
  2. Third-party libraries
  3. Internal utilities/components
  4. Types
  5. Styles
- **Prefer:** Server Components by default, use Client Components (`'use client'`) only when needed
- **State management:**
  - Local state: `useState`, `useReducer`
  - Global state: Zustand stores
  - Server state: React Query
- **Styling:** Tailwind CSS utility classes, avoid inline styles

#### Python/FastAPI (Backend)
- **File naming:** snake_case (`auth_service.py`)
- **Function/variable naming:** snake_case
- **Class naming:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **API Router structure:**
  ```python
  from fastapi import APIRouter, Depends
  from sqlalchemy.orm import Session

  router = APIRouter(prefix="/api/resource", tags=["resource"])

  @router.get("/")
  def get_resources(db: Session = Depends(get_db)):
      # Logic here
  ```
- **Imports order:**
  1. Standard library
  2. Third-party packages
  3. FastAPI/SQLAlchemy
  4. Internal modules (app.*)
- **Type hints:** Always use type hints for function parameters and return values
- **Docstrings:** Use for complex functions and classes

### Architecture Patterns

#### Frontend Patterns
1. **App Router** - Next.js 13+ file-based routing
   - `app/` directory structure
   - Route groups: `(dashboard)/`
   - Dynamic routes: `[id]/`
2. **Separation of Concerns:**
   - `app/` - Pages and layouts
   - `components/` - Reusable components
   - `lib/` - Business logic and utilities
   - `stores/` - State management
   - `types/` - TypeScript definitions
3. **API Client Pattern:**
   - Centralized Axios instance with interceptors
   - Automatic JWT token injection
   - Error handling for 401/403
4. **Server Components First:**
   - Use Server Components by default
   - Client Components only when interactive features needed

#### Backend Patterns
1. **Layered Architecture:**
   - `api/` - REST endpoints (controllers)
   - `services/` - Business logic
   - `models/` - SQLAlchemy ORM models
   - `schemas/` - Pydantic request/response models
   - `core/` - Configuration and database
   - `utils/` - Helper functions
2. **Dependency Injection:**
   - Database sessions via `Depends(get_db)`
   - Current user via `Depends(get_current_user)`
3. **Service Layer Pattern:**
   - Complex logic in service classes
   - API routes delegate to services
4. **Repository Pattern (implicit via ORM):**
   - Database queries in service layer
   - No raw SQL (use SQLAlchemy)

#### Database Patterns
1. **Relational Model:**
   - 13 tables with foreign key relationships
   - Normalized structure (3NF)
2. **Hybrid Storage:**
   - JSON fields for flexible data (OCR results, configs)
   - Relational fields for structured data
3. **Audit Trail:**
   - `audit_log` table records all changes
   - Timestamp fields (`created_at`, `updated_at`)

### Testing Strategy

#### Frontend Testing
- **Unit Tests:** Component testing with Vitest/Jest (planned)
- **Integration Tests:** React Testing Library (planned)
- **E2E Tests:** Playwright MCP for visual verification
- **Manual Testing:** Swagger UI for API endpoints

#### Backend Testing
- **Unit Tests:** pytest for individual functions
- **Integration Tests:** pytest with test database
- **API Tests:** pytest + httpx for endpoint testing
- **Test Database:** Separate PostgreSQL instance
- **Coverage Target:** 70%+ for critical paths

#### Testing Workflow
1. Coder implements feature
2. Tester agent runs Playwright tests
3. Manual verification via Swagger UI
4. pytest suite runs on commit

### Git Workflow

#### Branching Strategy
- **Main Branch:** `main` - Production-ready code
- **Feature Branches:** `claude/feature-name-{session-id}` - Individual features
  - Format: `claude/update-markdown-files-011CUYhBY4nfxNkDKkwTuvi7`
  - Session ID must match for push to succeed
- **Hotfix Branches:** `hotfix/description` - Critical fixes

#### Commit Conventions
- **Format:** `type: description`
- **Types:**
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `style:` - Code style changes (formatting)
  - `refactor:` - Code refactoring
  - `test:` - Test additions/changes
  - `chore:` - Build process or auxiliary tool changes
- **Examples:**
  - `feat: add OCR processing for zairyu cards`
  - `fix: resolve 401 error on login`
  - `docs: update installation guide`

#### Commit Process
1. Stage changes: `git add .`
2. Commit with message: `git commit -m "$(cat <<'EOF' ..."`
3. Push to branch: `git push -u origin <branch-name>`
4. Create PR when ready

#### Pull Request Guidelines
- **Title:** Clear description of changes
- **Body:**
  - Summary (1-3 bullet points)
  - Test plan (checklist)
  - Screenshots (if UI changes)
- **Footer:** `🤖 Generated with Claude Code`
- **Review:** Required before merge to main

---

## Domain Context

### Japanese Staffing Industry Terms

The system uses specific Japanese terminology from the staffing industry:

| Japanese | Romaji | English | System Usage |
|----------|--------|---------|--------------|
| 履歴書 | Rirekisho | Resume/CV | Candidate module |
| 派遣社員 | Haken Shain | Dispatch Worker | Employee type |
| 派遣先 | Haken-saki | Client Company | Factory module |
| タイムカード | Taimu kādo | Timecard | Attendance tracking |
| 給与 | Kyūyo | Salary | Payroll module |
| 申請 | Shinsei | Request | Leave requests |
| 有給 | Yūkyū | Paid Leave | Request type |
| 半休 | Hankyū | Half Day | Request type |
| 一時帰国 | Ichiji kikoku | Temporary Return | Request type |
| 退社 | Taisha | Resignation | Request type |
| 朝番 | Asaban | Morning Shift | Shift type |
| 昼番 | Hiruban | Afternoon Shift | Shift type |
| 夜番 | Yoban | Night Shift | Shift type |
| 社宅 | Shataku | Company Housing | Apartments module |
| 管理人者 | Kanrininsha | Manager | User role |
| 請負社員 | Ukeoi Shain | Contract Worker | Employee type |
| 在留カード | Zairyu kādo | Residence Card | Document type |
| 運転免許証 | Unten menkyo-shō | Driver's License | Document type |

### Business Rules

1. **Candidate → Employee Conversion:**
   - Candidates become Employees via `rirekisho_id` link
   - Candidate data preserved for audit trail

2. **Timecard Shift Types:**
   - 朝番 (Morning): 08:00-17:00 (standard)
   - 昼番 (Afternoon): 17:00-02:00 (includes night hours)
   - 夜番 (Night): 22:00-07:00 (full night shift)

3. **Payroll Calculation:**
   - Base rate: hourly wage × hours worked
   - Overtime (残業): 1.25× rate (after 8 hours/day)
   - Night hours (深夜): 1.35× rate (22:00-05:00)
   - Holiday (休日): 1.35× rate
   - Deductions: Tax, social insurance, rent (if apartment)

4. **Request Approval Workflow:**
   - Employee submits request
   - Coordinator/Admin reviews
   - Approved/Rejected status update
   - Employee notified

5. **Document Requirements:**
   - 在留カード (Zairyu Card) - Required for foreign workers
   - 履歴書 (Rirekisho) - Required for all candidates
   - 運転免許証 (Driver's License) - Optional

---

## Important Constraints

### Technical Constraints

1. **Windows Compatibility:**
   - All scripts must work on Windows (Docker Desktop)
   - Batch files (.bat) use Windows path separators (`\`)
   - PowerShell and cmd.exe compatible
   - No WSL/Linux dependencies

2. **Docker Required:**
   - All services run in containers
   - No local Python/Node.js required
   - Persistent volumes for database

3. **Port Requirements:**
   - 3000: Frontend (Next.js)
   - 8000: Backend (FastAPI)
   - 5432: Database (PostgreSQL)
   - 8080: Adminer (DB UI)
   - Ports must be available

4. **Python Version:**
   - Python 3.11+ required for backend
   - Type hints using modern syntax (X | Y instead of Union[X, Y])

5. **Database:**
   - PostgreSQL 15 required
   - No MySQL/SQLite support
   - Alembic for all schema changes

### Business Constraints

1. **Data Privacy:**
   - Personal information (PII) stored securely
   - Password hashing with bcrypt
   - JWT tokens expire after 8 hours
   - Audit log for compliance

2. **Multi-language:**
   - UI primarily Japanese
   - System messages in Japanese
   - Documentation in Spanish/English
   - OCR optimized for Japanese text

3. **Role Hierarchy:**
   - Strict role-based access control (RBAC)
   - Hierarchy: SUPER_ADMIN → ADMIN → COORDINATOR → KANRININSHA → EMPLOYEE → CONTRACT_WORKER
   - Cannot escalate own privileges

### Regulatory Constraints

1. **Labor Laws (Japanese):**
   - Accurate timecard tracking required
   - Overtime calculation compliant with labor law
   - Holiday/night shift premium rates

2. **Immigration:**
   - 在留カード (Zairyu Card) validation
   - Work permit expiration tracking
   - Visa type verification

---

## External Dependencies

### Required Services

1. **Azure Computer Vision API** (Optional but recommended)
   - **Purpose:** Primary OCR for Japanese documents
   - **Endpoint:** `AZURE_COMPUTER_VISION_ENDPOINT`
   - **Key:** `AZURE_COMPUTER_VISION_KEY`
   - **Fallback:** EasyOCR, Tesseract if unavailable

2. **SMTP Server** (Optional)
   - **Purpose:** Email notifications
   - **Config:** `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - **Usage:** Salary slips, request notifications

3. **LINE Messaging API** (Optional)
   - **Purpose:** Mobile notifications to employees
   - **Token:** `LINE_CHANNEL_ACCESS_TOKEN`
   - **Usage:** Request approvals, announcements

### Development Dependencies

1. **Docker Hub:**
   - Base images: `python:3.11`, `node:20`, `postgres:15`

2. **npm Registry:**
   - Frontend packages from npm

3. **PyPI:**
   - Backend packages from PyPI

### Database Dependencies

1. **PostgreSQL 15:**
   - Extensions: None required (all standard)
   - Encoding: UTF-8 for Japanese text
   - Timezone: UTC (converted to JST in application)

---

## File Structure Rules

### Critical Files (NEVER DELETE)

1. **Batch Scripts:**
   - `scripts/START.bat` - System startup
   - `scripts/STOP.bat` - System shutdown
   - `scripts/LOGS.bat` - Log viewer
   - `scripts/REINSTALAR.bat` - System reset

2. **Configuration:**
   - `docker-compose.yml` - Service orchestration
   - `backend/alembic/versions/*` - Migration history
   - `.env` - Environment variables

3. **Documentation:**
   - `CLAUDE.md` - Development rules
   - `openspec/AGENTS.md` - Agent system
   - `docs/INDEX.md` - Documentation index

### Development Workflow

1. **Before Major Changes:**
   - Create feature branch
   - Update TODO list (TodoWrite)
   - Consult CLAUDE.md

2. **Adding Features:**
   - Backend: Create API endpoint → Schema → Service
   - Frontend: Create page → Components → API integration
   - Test: Use tester agent for visual verification

3. **Database Changes:**
   - Modify `backend/app/models/models.py`
   - Generate migration: `alembic revision --autogenerate -m "description"`
   - Review migration file
   - Apply: `alembic upgrade head`

4. **Documentation:**
   - Update relevant docs in `docs/`
   - Follow NORMA #7 (búsqueda antes de crear)
   - Add date headers: `## 📅 YYYY-MM-DD - [TÍTULO]`

---

## OpenSpec Integration

This project uses **OpenSpec** for spec-driven development:

- **Proposals:** `openspec/changes/YYYYMMDD-HHmmss-{description}.md`
- **Commands:**
  - `/openspec:proposal` - Create new spec
  - `/openspec:apply` - Implement approved spec
  - `/openspec:archive` - Archive deployed spec

See `openspec/AGENTS.md` for complete guidelines.

---

**For complete project documentation, see:**
- [Documentation Index](../docs/INDEX.md)
- [CLAUDE.md](../CLAUDE.md)
- [Architecture Guide](../docs/00-START-HERE/ARCHITECTURE.md)

---

**Last Updated:** 2025-10-28
