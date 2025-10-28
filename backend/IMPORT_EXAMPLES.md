# Import Examples - UNS-ClaudeJP 5.0

This document shows how to use the consolidated `__init__.py` imports for cleaner code.

## 📦 Models

### Before (verbose):
```python
from app.models.models import User, Candidate, Employee
from app.models.models import UserRole, CandidateStatus
```

### After (clean):
```python
from app.models import User, Candidate, Employee
from app.models import UserRole, CandidateStatus
```

### Available Models:
```python
from app.models import (
    # Enums
    UserRole, CandidateStatus, DocumentType, RequestType, RequestStatus, ShiftType,

    # Core Personnel
    User, Candidate, CandidateForm, Employee, ContractWorker, Staff,

    # Business
    Factory, Apartment, Document, Contract,

    # Operations
    TimerCard, SalaryCalculation, Request,

    # System
    AuditLog, SocialInsuranceRate, SystemSettings,
)
```

## 🔧 Services

### Before:
```python
from app.services.auth_service import AuthService
from app.services.hybrid_ocr_service import HybridOCRService
from app.services.payroll_service import PayrollService
```

### After:
```python
from app.services import AuthService, HybridOCRService, PayrollService
```

### Available Services:
```python
from app.services import (
    AuthService,           # JWT authentication
    AzureOCRService,       # Azure Computer Vision OCR
    EasyOCRService,        # Deep learning OCR (offline)
    FaceDetectionService,  # MediaPipe face detection
    HybridOCRService,      # Multi-provider OCR orchestration
    ImportService,         # Excel/CSV data import
    NotificationService,   # Email and LINE notifications
    PayrollService,        # Salary calculations
    ReportService,         # PDF report generation
)
```

## 📋 Schemas

### Before:
```python
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.schemas.auth import UserLogin, Token
```

### After:
```python
from app.schemas import CandidateCreate, CandidateResponse
from app.schemas import EmployeeCreate, EmployeeUpdate
from app.schemas import UserLogin, Token
```

### Example with Multiple Schemas:
```python
from app.schemas import (
    # Authentication
    UserLogin, UserRegister, Token, UserResponse,

    # Candidates
    CandidateCreate, CandidateUpdate, CandidateResponse,
    DocumentUpload, CandidateApprove,

    # Employees
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    EmployeeTerminate, YukyuUpdate,

    # Common
    PaginationParams, PaginatedResponse,
)
```

## 🌐 API Routers

### In main.py - Before:
```python
from app.api import auth, candidates, employees
# Had to import each module separately
```

### After (same, but now documented):
```python
from app.api import (
    auth,
    candidates,
    employees,
    factories,
    timer_cards,
    salary,
    requests,
    dashboard,
    # ... all 15 routers available
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
```

## 🎯 Real-World Example

### Creating a New API Endpoint

**Before (verbose imports):**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Candidate, CandidateStatus
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.services.hybrid_ocr_service import HybridOCRService

router = APIRouter()

@router.post("/", response_model=CandidateResponse)
def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    ocr_service: HybridOCRService = Depends()
):
    # ... implementation
    pass
```

**After (clean imports):**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Candidate, CandidateStatus
from app.schemas import CandidateCreate, CandidateResponse
from app.services import HybridOCRService

router = APIRouter()

@router.post("/", response_model=CandidateResponse)
def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    ocr_service: HybridOCRService = Depends()
):
    # ... implementation
    pass
```

## 📊 IDE Benefits

With these consolidated imports, IDEs now provide:

1. **Better autocomplete**: Type `from app.models import ` and see all available models
2. **Clearer API**: `__all__` lists show exactly what's public
3. **Easier refactoring**: Change internal structure without breaking imports
4. **Documentation**: Docstrings explain each module's purpose

## 🔍 Checking Available Exports

```python
# See all available models
from app import models
print(models.__all__)

# See all available services
from app import services
print(services.__all__)

# See all available schemas
from app import schemas
print(schemas.__all__)
```

## ✅ Migration Guide

If you have existing code using the old import style, you can migrate gradually:

1. **Both styles work**: Old verbose imports still function
2. **Migrate incrementally**: Change imports file by file
3. **Use IDE refactoring**: Most IDEs can automate this

### Quick Migration Script
```python
# Old pattern
from app.models.models import User, Candidate
# New pattern (change to)
from app.models import User, Candidate
```

Simply replace:
- `from app.models.models import` → `from app.models import`
- `from app.services.{service_name} import` → `from app.services import`
- `from app.schemas.{schema_name} import` → `from app.schemas import`

---

**Note**: The old import style (`from app.models.models import User`) still works perfectly. These consolidated imports are an additional convenience, not a breaking change.
