# 🔍 System Verification Tools

This document explains all available tools to verify the UNS-ClaudeJP 5.0 system is working correctly.

---

## Quick Start

### Option 1: Automated Batch Verification (Recommended for Windows)

```bash
scripts\VERIFY.bat
```

**What it does:**
- Checks Docker installation and status
- Verifies all 5 containers are running
- Tests backend API health
- Checks frontend accessibility
- Counts candidates and factories in database
- Detects if Excel file is present
- Shows import progress
- Provides summary and recommendations

**Time:** 30 seconds
**Requires:** Docker Desktop running

---

### Option 2: Python Detailed Verification (Most Comprehensive)

```bash
docker exec -it uns-claudejp-backend python scripts/verify_system.py
```

**What it does:**
- Connects to database and verifies tables exist
- Shows total count of candidates, factories, employees
- Displays sample candidate data with Japanese names
- Shows candidates by employment status
- Shows visa status distribution
- Verifies admin user exists
- Checks if Excel file is present
- Lists all available factory JSON files
- Generates formatted report

**Time:** 10 seconds
**Requires:** Backend container must be running

**Output Example:**
```
============================================================
  UNS-CLAUDEJP 5.0 - SYSTEM VERIFICATION REPORT
  Generated: 2025-10-26 15:30:45
============================================================

============================================================
  1. Database Connection
============================================================

✅ Database connection: OK

============================================================
  2. Candidate Data
============================================================

✅ Total candidates: 1048

📋 Sample candidates:

   1. 田中太郎
      - Katakana: タナカタロウ
      - Birth Date: 1980-05-15
      - Nationality: Japan
      - Status: employed

   2. 鈴木花子
      - Katakana: スズキハナコ
      - Birth Date: 1985-08-22
      - Nationality: Vietnam
      - Status: employed

   3. 佐藤次郎
      - Katakana: サトウジロウ
      - Birth Date: 1990-03-10
      - Nationality: Philippines
      - Status: seeking

📊 Candidates by status:
   - employed: 950
   - seeking: 98

🛂 Visa status distribution:
   - Specific Skilled Worker (SSW): 1048

[... continues with factories, employees, users ...]

VERIFICATION SUMMARY
✅ PASS: Database Connection
✅ PASS: Candidates
✅ PASS: Factories
✅ PASS: Employees
✅ PASS: Users
✅ PASS: Excel File
✅ PASS: Factory Files

Overall: 7/7 checks passed

🎉 All systems operational!
```

---

## Individual Verification Commands

### Check Docker Services

```bash
# List all UNS-ClaudeJP services
docker ps --filter "name=uns-claudejp"

# Expected output:
# CONTAINER ID    IMAGE                           STATUS
# abc123...       uns-claudejp:backend            Up 5 minutes
# def456...       uns-claudejp:frontend           Up 5 minutes
# ghi789...       postgres:15-alpine              Up 6 minutes
# jkl012...       adminer                         Up 6 minutes
```

---

### Check Backend API Health

```bash
# Method 1: Curl (if curl installed)
curl http://localhost:8000/api/health

# Method 2: PowerShell (Windows)
(Invoke-WebRequest http://localhost:8000/api/health).Content

# Expected response:
# {"status":"ok","database":"connected","environment":"development"}
```

---

### Check Candidate Count (Database)

```bash
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT COUNT(*) as total_candidates FROM candidates;"

# Expected output (with real data):
#  total_candidates
# ------------------
#             1048
# (1 row)

# Expected output (without real data/demo):
#  total_candidates
# ------------------
#               10
# (1 row)
```

---

### Check Factory Count

```bash
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT COUNT(*) as total_factories FROM factories;"

# Expected output:
#  total_factories
# ----------------
#              127
# (1 row)
```

---

### Check Admin User

```bash
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT username, email, role FROM users WHERE username='admin';"

# Expected output:
#  username |      email      | role
# ----------+-----------------+----------
#  admin    | admin@local.com  | SUPER_ADMIN
# (1 row)
```

---

### Check Import Logs

```bash
# Show last 100 lines of importer logs
docker logs uns-claudejp-importer | tail -100

# Follow logs in real-time (Ctrl+C to stop)
docker logs -f uns-claudejp-importer

# Look for these success messages:
# ✅ Importación completada:
#    ✓ Candidatos importados: 1048
#    ! Errores: 0
```

---

### Check Backend API Logs

```bash
# Show last 50 lines
docker logs uns-claudejp-backend | tail -50

# Follow logs in real-time
docker logs -f uns-claudejp-backend

# Look for any ERROR messages and startup messages
```

---

### Check Frontend Build Status

```bash
docker logs uns-claudejp-frontend | tail -20

# Expected:
# ▲ Next.js 16.0.0
# - Local: http://localhost:3000
# - Environments: .env.local
```

---

### Check Database Tables

```bash
# List all tables and their row counts
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "
  SELECT tablename,
         (SELECT COUNT(*) FROM pg_class WHERE relname = tablename)::text as row_count
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"

# Expected tables:
# candidates
# factories
# employees
# users
# contracts
# apartments
# timer_cards
# salary_calculations
# requests
# documents
# audit_log
```

---

### Check Excel File Location

```bash
# Windows command line
dir config\employee_master.xlsm

# If file exists:
# Directory of D:\UNS-ClaudeJP-4.2\config
# 10/20/2025  2:15 PM    1,228,159 employee_master.xlsm

# If file does NOT exist:
# File Not Found
```

---

### Check Factory JSON Files

```bash
# Count factory JSON files
dir config\factories\*.json | find /c ".json"

# List factory files
dir config\factories\*.json

# Expected output: 100+ JSON files like Factory-01.json, Factory-02.json, etc.
```

---

## Troubleshooting Guide

### Problem: `VERIFY.bat` says "Docker daemon not running"

**Solution:**
```bash
# Start Docker Desktop
# Wait 30 seconds for daemon to start
# Run VERIFY.bat again
```

---

### Problem: `Containers not running yet`

**Solution:**
```bash
# Start containers
scripts\START.bat

# Wait 2-3 minutes for startup
# Then run:
scripts\VERIFY.bat
```

---

### Problem: `0 candidates in database`

**Diagnosis:**
```bash
# Check if import completed
docker logs uns-claudejp-importer | grep "Importación completada"

# Check if still importing
docker logs uns-claudejp-importer | grep "Procesados"

# Check if import script ran
docker logs uns-claudejp-importer | grep "IMPORTANDO"
```

**Solutions:**

If import didn't run at all:
```bash
# Restart services
scripts\STOP.bat
scripts\START.bat
# Wait 5 minutes
```

If Excel file is missing but you want real data:
```bash
# Place Excel file in config/
# Restart to re-import
scripts\STOP.bat
scripts\START.bat
```

---

### Problem: `Backend API not responding`

**Diagnosis:**
```bash
# Check backend health
docker logs uns-claudejp-backend | tail -20

# Look for any CRITICAL or ERROR messages
```

**Solutions:**

Check database connection:
```bash
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT 1;"

# Should return: (1)
```

Restart backend:
```bash
docker restart uns-claudejp-backend
docker logs -f uns-claudejp-backend
```

---

### Problem: Login fails (admin/admin123)

**Diagnosis:**
```bash
# Check if admin user exists
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp \
  -c "SELECT username, email FROM users;"
```

**Solution:**
```bash
# Recreate admin user
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py
```

---

### Problem: Frontend shows 404 or loading indefinitely

**Diagnosis:**
```bash
# Check frontend logs
docker logs uns-claudejp-frontend | tail -50

# Check if backend is accessible from frontend
docker exec -it uns-claudejp-frontend curl http://backend:8000/api/health
```

**Solution:**

Clear cache and rebuild:
```bash
docker restart uns-claudejp-frontend

# Monitor build progress
docker logs -f uns-claudejp-frontend

# Next.js build can take 1-2 minutes
```

---

## Verification Checklist

Use this checklist to verify system readiness:

```
INFRASTRUCTURE
[ ] Docker Desktop installed and running
[ ] 5 containers running: db, backend, frontend, importer, adminer

FILES
[ ] .env file exists in root
[ ] docker-compose.yml exists
[ ] config/factories/backup/*.json exists (100+ files)

BACKEND
[ ] Backend API responds to http://localhost:8000/api/health
[ ] Database tables created (9+ tables)
[ ] Admin user exists (username: admin)

DATA
[ ] Candidates imported: 1048 (real) or 10 (demo)
[ ] Factories imported: 100+
[ ] No import errors in logs

FRONTEND
[ ] Frontend loads at http://localhost:3000
[ ] Login works with admin/admin123
[ ] Candidates page displays data
[ ] No JavaScript errors in console

EXCEL (Optional but recommended)
[ ] Excel file at config/employee_master.xlsm
[ ] File contains 派遣社員 sheet
[ ] Sheet has 1048 rows of employee data
```

---

## Performance Baseline

For reference, here are expected performance metrics:

```
Startup Time:
- Docker containers start: 30-45 seconds
- Database migrations: 10-15 seconds
- Data import (real): 30-60 seconds
- Data import (demo): 5-10 seconds
- Frontend build: 1-2 minutes
Total: 3-5 minutes from REINSTALAR.bat to working app

Database Size:
- Empty database: ~10 MB
- With 1048 candidates + 127 factories: ~50 MB

Response Times:
- Backend health check: <50ms
- List 1000 candidates: <500ms
- List factories: <100ms
- Login: <200ms
```

---

## Support

If verification tools report issues:

1. **Check VERIFICATION_GUIDE.md** - Detailed step-by-step guide
2. **Check Docker logs** - `docker logs <container-name>`
3. **Review SETUP.md** - Setup and configuration documentation
4. **Check project README** - General project information

---

## Summary

| Tool | Command | Time | Best For |
|------|---------|------|----------|
| **Batch Script** | `scripts\VERIFY.bat` | 30s | Quick overview (Windows) |
| **Python Script** | `docker exec ... verify_system.py` | 10s | Detailed database check |
| **Docker Logs** | `docker logs <container>` | 5s | Troubleshooting |
| **Direct SQL** | `docker exec ... psql` | 5s | Database queries |
| **Browser** | `http://localhost:3000` | - | Visual verification |

**Recommended workflow:**
1. Start with `scripts\VERIFY.bat` for quick status
2. If issues found, run `docker logs` for specific service
3. Run Python `verify_system.py` for detailed database check
4. Test in browser at http://localhost:3000
