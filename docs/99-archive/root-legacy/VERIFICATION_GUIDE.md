# 🧪 System Verification Guide - Real Candidate Import

## Overview

This guide verifies that the complete candidate import system works correctly in both scenarios:
1. **With Real Excel Data** (派遣社員 sheet with 1048 records)
2. **Without Excel Data** (fallback to 10 demo candidates)

---

## Phase 1: Pre-Execution Checks

### Step 1: Verify Files Exist

```bash
# Check if .env exists
dir .env

# Check if docker-compose.yml exists
dir docker-compose.yml

# Check if Excel file exists (optional, but triggers real import if present)
dir config\employee_master.xlsm

# Check if factory backup files exist
dir config\factories\backup\*.json
```

**Expected Output:**
- ✅ `.env` file exists in root
- ✅ `docker-compose.yml` exists in root
- ⚠️ `config\employee_master.xlsm` exists (optional - triggers real import)
- ✅ `config\factories\backup\*.json` exist (at least 100+ JSON files)

---

## Phase 2: System Startup

### Step 2: Execute REINSTALAR.bat

```bash
cd D:\JPUNS-CLAUDE5.0\UNS-ClaudeJP-4.2
scripts\REINSTALAR.bat
```

**Expected Output Sequence:**

```
=================================================================
              🚀 UNS-ClaudeJP 5.0 SETUP - Windows
=================================================================

[Paso 1/5] Checking Docker...
[Paso 2/5] Verifying project structure...
[Paso 3/5] Checking/Creating .env file...
[Paso 4/5] Copying factories from backup...
[Paso 5/5] Starting Docker services...

Waiting for PostgreSQL to be healthy...
Waiting for Backend API to be healthy...
Waiting for Frontend to be ready...

✅ SETUP COMPLETADO EXITOSAMENTE
   Frontend: http://localhost:3000
   Backend:  http://localhost:8000/api/docs
   Database: http://localhost:8080
```

⚠️ **The script takes 2-3 minutes to complete. Be patient while containers start.**

---

## Phase 3: Backend Initialization Verification

### Step 3: Check Importer Logs

```bash
# Monitor the importer service (runs data import)
docker logs uns-claudejp-importer -f

# Or check the backend logs for import script output
docker logs uns-claudejp-backend -f
```

**Expected Log Output (with Excel file):**

```
--- Running Alembic migrations ---
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl with target database 'uns_claudejp'
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> xxx (create tables)
...

--- Running create_admin_user.py ---
✓ Admin user created: admin / admin123

--- Running import_data.py ---
✓ Factories imported: 127

--- Running import_real_candidates_final.py ---
============================================================
IMPORTANDO CANDIDATOS REALES DEL EXCEL
============================================================

📂 Buscando archivo: /app/config/employee_master.xlsm
  ✓ Datos cargados: 1048 registros
  📋 Columnas: ['現在', '氏名', 'カナ', '国籍', '生年月日', '派遣先', ...]
  ✓ Total de registros a procesar: 1048
  ✓ Procesados 100 candidatos...
  ✓ Procesados 200 candidatos...
  ✓ Procesados 300 candidatos...
  ... (continues)
  ✓ Procesados 1000 candidatos...

✅ Importación completada:
   ✓ Candidatos importados: 1048
   ! Errores: 0

--- Falling back to demo candidates if needed ---
  ⚠️ Ya existen 1048 candidatos en BD.
     Saltando importación para evitar duplicados.

--- Checking for Access database imports ---
  --- No Access data found, skipping ---
```

**Expected Log Output (without Excel file):**

```
--- Running import_real_candidates_final.py ---
============================================================
IMPORTANDO CANDIDATOS REALES DEL EXCEL
============================================================

📂 Buscando archivo: /app/config/employee_master.xlsm
  ⚠️  ADVERTENCIA: Archivo Excel no encontrado!
     Ruta esperada: /app/config/employee_master.xlsm

  📝 Para usar datos REALES:
     1. Copia el archivo 'employee_master.xlsm'
     2. Colócalo en: config/
     3. Ejecuta REINSTALAR.bat nuevamente

  ℹ️  Por ahora se importarán candidatos de DEMOSTRACIÓN
     (Puedes cambiar a datos reales después)

--- Falling back to demo candidates if needed ---
  ✓ Datos cargados: 10 candidatos demo
  ✓ Total de registros a procesar: 10
  ✓ Procesados 10 candidatos...

✅ Importación completada:
   ✓ Candidatos importados: 10
   ! Errores: 0
```

---

## Phase 4: Backend Health Check

### Step 4: Verify Backend API is Responsive

```bash
# Check backend health endpoint
curl http://localhost:8000/api/health

# Alternative: Open in browser
# http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "development"
}
```

---

## Phase 5: Database Verification

### Step 5: Count Imported Candidates

```bash
# Connect to PostgreSQL
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp

# Inside PostgreSQL:
SELECT COUNT(*) FROM candidates;
```

**Expected Results:**
- **With Excel:** Should show ~1048 candidates
- **Without Excel:** Should show 10 candidates (demo data)

```sql
uns_claudejp=# SELECT COUNT(*) FROM candidates;
 count
-------
  1048
(1 row)
```

### Step 6: Verify Candidate Data Quality

```sql
-- Check if candidate names are populated
SELECT seimei_romaji, nationality, birth_date, visa_status
FROM candidates
LIMIT 5;

-- Check employee status distribution
SELECT status, COUNT(*)
FROM candidates
GROUP BY status;

-- Verify factory associations (if employees linked)
SELECT COUNT(DISTINCT factory_id)
FROM employees
WHERE factory_id IS NOT NULL;
```

---

## Phase 6: Frontend Verification

### Step 7: Access the Application

```
Open browser: http://localhost:3000
```

**Expected:**
- Page loads without errors
- See login form
- Default credentials: `admin` / `admin123`

### Step 8: Login and Check Candidates

1. **Login**
   - Username: `admin`
   - Password: `admin123`

2. **Navigate to Candidates**
   - Click "Candidatos" in sidebar
   - Should see candidate list with filters

3. **Verify Data Display**
   - ✅ Check that candidates are listed
   - ✅ Check pagination (should show total count)
   - ✅ Check filtering works
   - ✅ Click on a candidate to verify detail view
   - ✅ Verify names display correctly in Japanese

**Example URLs to Test:**
```
http://localhost:3000/candidates
http://localhost:3000/candidates/1
http://localhost:3000/dashboard
http://localhost:3000/factories
```

---

## Phase 7: Browser Console Check

### Step 9: Verify No JavaScript Errors

Press `F12` to open Developer Tools → Console tab

**Should See:**
- ✅ No red error messages
- ✅ No warnings about missing components
- ✅ No React key warnings
- ✅ API calls are successful (Network tab)

**Should NOT See:**
- ❌ `Uncaught TypeError...`
- ❌ `Failed to fetch...`
- ❌ `Cannot read property...`
- ❌ `Duplicate keys...`

---

## Phase 8: Complete Data Flow Test

### Step 10: End-to-End Verification

#### Scenario A: Real Data (With Excel File)

1. Ensure `config/employee_master.xlsm` exists
2. Run `scripts\REINSTALAR.bat`
3. Check logs show "Importando candidatos reales del Excel"
4. Verify database has ~1048 candidates
5. Login and see candidates list with actual Japanese names
6. Click a candidate and verify all fields are populated

#### Scenario B: Demo Data (Without Excel File)

1. Ensure `config/employee_master.xlsm` does NOT exist
2. Delete it if present: `del config\employee_master.xlsm`
3. Run `scripts\REINSTALAR.bat`
4. Check logs show "Archivo Excel no encontrado" + fallback to demo
5. Verify database has exactly 10 candidates
6. Login and see 10 demo candidates with sample data
7. Verify all functionality works normally

#### Scenario C: Switching Between Modes

1. Start with demo (no Excel): 10 candidates
2. Add `config/employee_master.xlsm`
3. Run `docker compose down -v` to clear database
4. Run `scripts\REINSTALAR.bat`
5. Verify now shows ~1048 candidates

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Windows - Check port usage
netstat -ano | findstr "3000"
netstat -ano | findstr "8000"
netstat -ano | findstr "5432"

# Kill process using port 3000 (replace PID)
taskkill /PID <PID> /F

# Then restart: scripts\REINSTALAR.bat
```

### Issue: Containers Not Starting

```bash
# Check container status
docker ps -a

# Check logs for specific container
docker logs uns-claudejp-backend
docker logs uns-claudejp-db
docker logs uns-claudejp-importer

# Force restart
docker compose down -v
scripts\REINSTALAR.bat
```

### Issue: Database Connection Failed

```bash
# Verify PostgreSQL container is running
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "\dt"

# Should list all tables (candidates, employees, etc.)
```

### Issue: Candidates Not Showing

```bash
# Check if data was actually imported
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT COUNT(*) FROM candidates;"

# Check backend logs for import errors
docker logs uns-claudejp-importer

# If 0 candidates, check Excel file location
dir config\employee_master.xlsm

# If no Excel file, run: REINSTALAR.bat (triggers demo import)
```

### Issue: Login Fails

```bash
# Recreate admin user
docker exec -it uns-claudejp-backend python scripts/create_admin_user.py

# Verify user was created
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT username, email FROM users WHERE username='admin';"
```

---

## Success Criteria ✅

The system is working correctly when:

- [x] `REINSTALAR.bat` completes without errors
- [x] Docker containers are running: `docker ps` shows 5 services
- [x] Backend API responds at `http://localhost:8000/api/health`
- [x] Database contains candidates: `SELECT COUNT(*) FROM candidates`
- [x] Frontend loads at `http://localhost:3000`
- [x] Login works with admin/admin123
- [x] Candidates page shows appropriate data count
- [x] Candidates display with Japanese names correctly
- [x] No JavaScript errors in browser console
- [x] Real data (1048) shows if Excel file present, OR demo data (10) if not

---

## Quick Status Check Commands

```bash
# Check all services running
docker ps

# Check candidate count
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT COUNT(*) as candidates FROM candidates;"

# Check factory count
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT COUNT(*) as factories FROM factories;"

# Check if admin user exists
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp -c "SELECT username FROM users;"

# View last 50 lines of importer logs
docker logs uns-claudejp-importer | tail -50
```

---

## Next Steps

1. **Execute REINSTALAR.bat** - Run the complete setup
2. **Monitor logs** - Watch for import progress and completion
3. **Verify database** - Check candidate and factory counts
4. **Test application** - Login and verify UI functionality
5. **Test Git scenario** - Clone to another directory to test portability

If any step fails, check the **Troubleshooting** section above.
