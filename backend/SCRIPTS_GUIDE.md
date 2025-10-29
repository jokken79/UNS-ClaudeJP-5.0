# Backend Scripts Guide

Comprehensive guide for all backend maintenance and utility scripts in UNS-ClaudeJP 5.0.

## Table of Contents

1. [Photo Import Scripts](#photo-import-scripts)
2. [Data Verification Scripts](#data-verification-scripts)
3. [Database Management](#database-management)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)

## Photo Import Scripts

### unified_photo_import.py

**Purpose**: Import employee photos from Excel file and match them to candidates/employees in the database.

**Location**: `backend/scripts/unified_photo_import.py`

#### Usage

```bash
# Inside backend container
docker exec -it uns-claudejp-backend bash
cd /app
python scripts/unified_photo_import.py
```

#### What it Does

1. Reads `employee_master.xlsm` from `/app/data/`
2. Extracts photo data (base64) from the Excel file
3. Matches photos to candidates by `applicant_id`
4. Updates `photo_data_url` field in the database
5. Generates detailed import report

#### Features

- **Automatic matching**: Links photos to existing candidate records
- **Demo fallback**: If Excel file missing, creates demo data
- **Comprehensive logging**: Shows success/failure for each photo
- **Transaction safety**: All changes committed together or rolled back

#### Output Example

```
=== Photo Import Report ===
Total rows in Excel: 150
Successfully imported: 145
Failed imports: 5
Skipped (no photo): 10

Failed Records:
- Row 25: Applicant ID 2025 not found
- Row 47: Invalid photo data format
- Row 89: Applicant ID missing
```

#### Troubleshooting

**Problem**: "Excel file not found"

**Solution**:
1. Ensure `employee_master.xlsm` exists in `/app/data/`
2. Check file permissions: `ls -la /app/data/`
3. Script will create demo data as fallback

**Problem**: "No photos imported"

**Solution**:
1. Check Excel column name: Should be "顔写真" (kaomei_photo)
2. Verify photo data is base64 encoded
3. Check candidate `applicant_id` values exist

**Problem**: "Database transaction failed"

**Solution**:
1. Check database connection
2. Verify table structure with `python scripts/verify_data.py`
3. Check logs for specific error

### Photo Data Format

Photos should be stored as base64 data URLs:

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

The script automatically:
- Validates base64 format
- Checks for valid image MIME types (jpeg, png, webp)
- Stores in `photo_data_url` field
- Also updates `photo_url` for backward compatibility

## Data Verification Scripts

### verify_data.py

**Purpose**: Verify database integrity, check relationships, and generate statistics.

**Location**: `backend/scripts/verify_data.py`

#### Usage

```bash
docker exec -it uns-claudejp-backend bash
python scripts/verify_data.py
```

#### What it Checks

1. **Table existence**: All required tables present
2. **Record counts**: Number of records per table
3. **Relationships**: Foreign key integrity
4. **Data quality**: Missing required fields
5. **Orphaned records**: Records without valid parents

#### Output Example

```
=== Database Verification Report ===

Tables:
✓ candidates: 234 records
✓ employees: 189 records
✓ factories: 15 records
✓ timer_cards: 5,432 records
✓ salary_calculations: 1,890 records

Relationships:
✓ All employees have valid rirekisho_id
✓ All timer_cards linked to employees
✗ 5 salary records missing employee link

Data Quality:
✓ No candidates without names
✗ 12 employees missing factory_id
✗ 3 employees without hire_date

Recommendations:
1. Update 5 salary records with employee_id
2. Assign factories to 12 employees
3. Add hire dates for 3 employees
```

#### Command-Line Options

```bash
# Detailed mode
python scripts/verify_data.py --verbose

# Check specific table
python scripts/verify_data.py --table candidates

# Export report to file
python scripts/verify_data.py --output report.txt

# JSON format
python scripts/verify_data.py --format json > report.json
```

### verify.py

**Purpose**: Quick database health check.

**Location**: `backend/scripts/verify.py`

#### Usage

```bash
python scripts/verify.py
```

Simpler than `verify_data.py`, focuses on:
- Connection status
- Basic table counts
- Critical errors only

## Database Management

### create_admin_user.py

**Purpose**: Create or reset admin user account.

**Location**: `backend/scripts/create_admin_user.py`

#### Usage

```bash
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py
```

#### What it Does

1. Checks if `admin` user exists
2. If exists: Resets password to `admin123`
3. If not: Creates new admin user
4. Sets role to `SUPER_ADMIN`

**Default Credentials**:
- Username: `admin`
- Password: `admin123`
- Role: `SUPER_ADMIN`

⚠️ **Security Warning**: Change the default password in production!

### import_data.py

**Purpose**: Import initial demo data for testing.

**Location**: `backend/scripts/import_data.py`

#### Usage

```bash
docker exec -it uns-claudejp-backend python scripts/import_data.py
```

#### What it Imports

1. **Factories**: 3 sample client companies
2. **Candidates**: 10 demo candidates with full rirekisho data
3. **Employees**: Promotes 5 candidates to employees
4. **Timer Cards**: Sample attendance data
5. **Salary Calculations**: Demo payroll records

**Use Case**: Initial system setup, testing, development.

## Common Workflows

### Initial System Setup

```bash
# 1. Start containers
docker compose up -d

# 2. Wait for database to be ready
docker logs -f uns-claudejp-db

# 3. Run migrations
docker exec -it uns-claudejp-backend alembic upgrade head

# 4. Create admin user
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py

# 5. Import demo data (optional)
docker exec -it uns-claudejp-backend python scripts/import_data.py

# 6. Import employee photos (if Excel file available)
docker exec -it uns-claudejp-backend python scripts/unified_photo_import.py

# 7. Verify everything
docker exec -it uns-claudejp-backend python scripts/verify_data.py
```

### Regular Data Import

```bash
# 1. Place Excel file in /app/data/
docker cp employee_master.xlsm uns-claudejp-backend:/app/data/

# 2. Run photo import
docker exec -it uns-claudejp-backend python scripts/unified_photo_import.py

# 3. Verify import
docker exec -it uns-claudejp-backend python scripts/verify_data.py --table candidates
```

### Password Reset

```bash
# Reset admin password to default (admin123)
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py
```

### Database Backup Before Import

```bash
# 1. Backup database
docker exec uns-claudejp-db pg_dump -U uns_admin uns_claudejp > backup_$(date +%Y%m%d).sql

# 2. Run import
docker exec -it uns-claudejp-backend python scripts/unified_photo_import.py

# 3. Verify
docker exec -it uns-claudejp-backend python scripts/verify_data.py

# 4. If problems, restore
docker exec -i uns-claudejp-db psql -U uns_admin uns_claudejp < backup_YYYYMMDD.sql
```

### Testing After Code Changes

```bash
# 1. Verify database structure
docker exec -it uns-claudejp-backend python scripts/verify_data.py

# 2. Check backend logs
docker logs uns-claudejp-backend

# 3. Test API
curl http://localhost:8000/api/health

# 4. Run verification again
docker exec -it uns-claudejp-backend python scripts/verify.py
```

## Troubleshooting

### Script Fails to Connect to Database

**Symptoms**:
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solutions**:

1. Check if database is running:
```bash
docker ps | grep uns-claudejp-db
```

2. Check database logs:
```bash
docker logs uns-claudejp-db
```

3. Verify connection string in `.env`:
```bash
docker exec -it uns-claudejp-backend env | grep DATABASE_URL
```

4. Restart database:
```bash
docker restart uns-claudejp-db
```

### Import Script Hangs

**Symptoms**: Script runs but doesn't complete.

**Solutions**:

1. Check for large Excel files:
```bash
docker exec -it uns-claudejp-backend ls -lh /app/data/
```

2. Monitor memory usage:
```bash
docker stats uns-claudejp-backend
```

3. Run with timeout:
```bash
timeout 300 docker exec -it uns-claudejp-backend python scripts/unified_photo_import.py
```

### Permission Denied

**Symptoms**:
```
PermissionError: [Errno 13] Permission denied: '/app/data/employee_master.xlsm'
```

**Solutions**:

1. Fix file permissions:
```bash
docker exec -it uns-claudejp-backend chmod 644 /app/data/employee_master.xlsm
```

2. Check directory permissions:
```bash
docker exec -it uns-claudejp-backend ls -la /app/data/
```

3. Copy file with correct ownership:
```bash
docker cp employee_master.xlsm uns-claudejp-backend:/app/data/
docker exec -it uns-claudejp-backend chown root:root /app/data/employee_master.xlsm
```

### Import Shows Success But No Data

**Symptoms**: Script reports success but database unchanged.

**Solutions**:

1. Check transaction commit:
```python
# Ensure script has db.commit()
db.commit()
```

2. Verify data actually exists:
```bash
docker exec -it uns-claudejp-backend python -c "
from app.core.database import SessionLocal
from app.models.models import Candidate
db = SessionLocal()
print(f'Candidates: {db.query(Candidate).count()}')
"
```

3. Check for silent exceptions:
```bash
# Run with verbose logging
docker exec -it uns-claudejp-backend python scripts/unified_photo_import.py --verbose
```

### Database Migration Conflicts

**Symptoms**:
```
alembic.util.exc.CommandError: Can't locate revision identified by 'xxxxx'
```

**Solutions**:

1. Check current revision:
```bash
docker exec -it uns-claudejp-backend alembic current
```

2. View migration history:
```bash
docker exec -it uns-claudejp-backend alembic history
```

3. Stamp to specific revision:
```bash
docker exec -it uns-claudejp-backend alembic stamp head
```

4. If migrations are broken, reset:
```bash
# WARNING: This deletes all data!
docker compose down -v
docker compose up -d
docker exec -it uns-claudejp-backend alembic upgrade head
```

## Script Development Guidelines

When creating new scripts:

### 1. Use Consistent Error Handling

```python
import sys
import logging
from app.core.exceptions import DatabaseError, ImportError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Script logic
    result = process_data()
    logger.info(f"Success: {result}")
    sys.exit(0)  # Exit with success code
except ImportError as e:
    logger.error(f"Import failed: {e.message}")
    logger.error(f"Details: {e.details}")
    sys.exit(1)  # Exit with error code
except Exception as e:
    logger.exception("Unexpected error:")
    sys.exit(1)
```

### 2. Add Verbose Logging

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--verbose', action='store_true', help='Enable verbose output')
args = parser.parse_args()

if args.verbose:
    logging.getLogger().setLevel(logging.DEBUG)
```

### 3. Use Transactions

```python
from app.core.database import SessionLocal

db = SessionLocal()
try:
    # All database operations
    db.add(record1)
    db.add(record2)
    db.commit()  # Commit everything together
except Exception as e:
    db.rollback()  # Rollback on error
    raise
finally:
    db.close()
```

### 4. Provide Progress Feedback

```python
from tqdm import tqdm

for i, record in enumerate(tqdm(records, desc="Importing")):
    process(record)
    if i % 100 == 0:
        logger.info(f"Processed {i}/{len(records)} records")
```

### 5. Generate Reports

```python
def generate_report(success_count, fail_count, errors):
    """Generate import report"""
    report = f"""
    === Import Report ===
    Total: {success_count + fail_count}
    Success: {success_count}
    Failed: {fail_count}

    Errors:
    """
    for error in errors:
        report += f"\n- {error}"

    return report

# Save to file
with open('/app/logs/import_report.txt', 'w') as f:
    f.write(generate_report(success, failures, error_list))
```

## Best Practices

1. **Always backup before imports**: Use `pg_dump` to create backups
2. **Use transactions**: Commit all changes together or rollback
3. **Log everything**: Use Python logging module
4. **Validate input**: Check data before processing
5. **Exit codes**: Return 0 for success, non-zero for errors
6. **Idempotent scripts**: Safe to run multiple times
7. **Progress indicators**: Show progress for long operations
8. **Error recovery**: Handle partial failures gracefully

## Further Reading

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/14/orm/tutorial.html)
- [Python Logging](https://docs.python.org/3/library/logging.html)
- [Docker Exec Reference](https://docs.docker.com/engine/reference/commandline/exec/)
