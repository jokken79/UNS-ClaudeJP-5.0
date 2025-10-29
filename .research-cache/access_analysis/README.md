# Access Database Analysis - T_履歴書 Table

**Analysis Date:** 2025-10-24
**Database:** `C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb`
**Table Name:** `T_履歴書` (Rirekisho/Resume)
**Script:** `backend/scripts/analyze_access_db.py`

---

## Summary Statistics

- **Total Records:** 1,148
- **Total Columns:** 172
- **Text Columns:** 136 (VARCHAR and LONGCHAR)
- **Numeric Columns:** 1 (INTEGER)
- **Date Columns:** 8 (DATETIME)
- **Boolean Columns:** 27 (BIT)
- **BLOB Columns:** 0 (No OLE Object/image fields detected)
- **Nullable Columns:** 138
- **Primary Key:** `履歴書ID` (COUNTER/Auto-increment)

---

## Key Findings

### 1. No BLOB/OLE Object Fields Detected
- The `写真` (photo) field is **LONGCHAR** (text), not LONGBINARY (binary)
- This means photos are likely stored as **file paths** or **base64 text**, not as embedded images
- No binary image extraction is needed

### 2. Access-Specific Data Types
The table uses several Access-specific types that need mapping to PostgreSQL:

| Access Type | Count | PostgreSQL Equivalent |
|------------|-------|----------------------|
| VARCHAR | 135 | VARCHAR(n) or TEXT |
| LONGCHAR | 2 | TEXT (unlimited length) |
| DATETIME | 8 | TIMESTAMP |
| BIT | 27 | BOOLEAN |
| INTEGER | 1 | INTEGER |
| COUNTER | 1 | SERIAL (auto-increment) |

### 3. Schema Structure Analysis

The table contains comprehensive employee resume data organized into sections:

#### Basic Information (Columns 1-26)
- Personal details (name, gender, DOB, nationality)
- Contact information (address, phone, mobile)
- Immigration documents (passport, residence card, visa status)
- Driver's license and vehicle information

#### Skills & Certifications (Columns 27-33)
- Driver's license, forklift, crane, welding certifications
- All stored as BIT (boolean) flags

#### Family Information (Columns 34-58)
- 5 family member entries, each with:
  - Name, relationship, age, residence status, address

#### Language Skills (Columns 59-63, 145-149)
- Japanese speaking/listening/reading/writing abilities
- Language skill levels (有無, Level)
- JLPT test information

#### Education & Physical Attributes (Columns 64-71)
- Education level, height, weight, clothing sizes

#### Work Experience (Columns 78-119)
- 7 employment history entries
- Each entry: start/end dates, company name

#### Job Skills (Columns 120-134)
- Manufacturing skills (NC lathe, press, forklift, etc.)
- Quality control, assembly, inspection
- All stored as BIT (boolean) flags

#### Work Preferences (Columns 135-141)
- Lunch preferences
- Commute method and time
- Interview results

#### COVID-19 Related (Columns 142-144)
- Antigen test kit results
- Vaccination status

#### Additional Qualifications (Columns 150-172)
- Japanese proficiency test details
- Other certifications
- Reading/writing skills breakdown

---

## Data Type Mapping for Migration

### Recommended PostgreSQL Schema

```sql
CREATE TABLE candidates (
    -- Primary Key
    rirekisho_id SERIAL PRIMARY KEY,

    -- Dates (8 columns)
    uketsuke_date TIMESTAMP,  -- 受付日 (reception date)
    birth_date TIMESTAMP,      -- 生年月日 (birth date)
    join_date TIMESTAMP,       -- 入社日 (join date)
    passport_expiry TIMESTAMP, -- パスポート期限
    residence_expiry TIMESTAMP, -- 在留期限
    license_expiry TIMESTAMP,   -- 運転免許期限
    covid_test_date TIMESTAMP,  -- 簡易抗原検査実施日
    jlpt_scheduled_date TIMESTAMP, -- 能力試験受験受験予定

    -- Text fields (VARCHAR -> TEXT for simplicity)
    name VARCHAR(50),
    name_kana TEXT,  -- LONGCHAR in Access
    name_romaji VARCHAR(50),
    gender VARCHAR(5),
    photo TEXT,  -- LONGCHAR (likely file path)
    nationality VARCHAR(10),
    spouse VARCHAR(5),
    postal_code VARCHAR(10),
    current_address VARCHAR(50),
    -- ... (130+ more text fields)

    -- Boolean fields (27 columns)
    has_vehicle BOOLEAN DEFAULT FALSE,
    has_insurance BOOLEAN DEFAULT FALSE,
    has_forklift_license BOOLEAN DEFAULT FALSE,
    has_tamakake BOOLEAN DEFAULT FALSE,
    -- ... (23 more boolean fields)

    -- Integer fields
    commute_time_minutes INTEGER,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### COUNTER to SERIAL Mapping
Access `COUNTER` type → PostgreSQL `SERIAL`
- Auto-incrementing primary key
- No migration needed for existing IDs (use INSERT with explicit IDs)

### LONGCHAR Handling
Access `LONGCHAR` (1GB max) → PostgreSQL `TEXT` (unlimited)
- Two LONGCHAR fields detected:
  1. `フリガナ` (name reading)
  2. `写真` (photo - likely file path stored as text)

### BIT to BOOLEAN Mapping
All 27 BIT fields map directly to PostgreSQL BOOLEAN
- Default value: FALSE
- Access stores as 0/1, PostgreSQL stores as true/false

---

## Photo Field Investigation

**Field Name:** `写真` (Photo)
**Access Type:** LONGCHAR (text)
**Current Implementation:** Text storage, NOT binary

### Implications:
1. Photos are **NOT embedded** as OLE objects
2. Photos are likely:
   - File paths to external images
   - Base64-encoded text strings
   - URLs or network paths
3. **No OLE header stripping required**
4. **No binary extraction needed**

### Migration Strategy:
- If file paths: Copy image files to new storage, update paths
- If Base64: Decode and save as files, store new paths
- If URLs: Verify accessibility, keep as-is or download

---

## Migration Recommendations

### 1. Use Two-Stage Migration
**Stage 1: Extract to CSV** (Windows host)
```python
# Run: backend/scripts/analyze_access_db.py
# Modify to export data to CSV
```

**Stage 2: Import to PostgreSQL** (Docker container)
```python
# Use pandas or COPY FROM to bulk import
```

### 2. Handle Photo Field Separately
- Extract photo references from `写真` field
- Verify if they are file paths or Base64
- Create migration script to handle images independently

### 3. Preserve All 172 Columns
- Do NOT drop any columns during migration
- Some may be legacy but contain historical data
- Can normalize schema in Phase 2 after data verification

### 4. Date Field Validation
8 DATETIME fields need careful handling:
- Access stores dates as `YYYY-MM-DD HH:MM:SS`
- PostgreSQL TIMESTAMP compatible
- Watch for NULL dates and invalid date ranges

### 5. Boolean Field Defaults
All 27 BIT fields:
- Access default: 0 (False)
- PostgreSQL: Set explicit DEFAULT FALSE
- Verify during migration that 0→FALSE, 1→TRUE

---

## Next Steps

### Immediate Actions:
1. **Verify Photo Storage Method**
   - Query sample `写真` field values
   - Determine if paths, Base64, or URLs
   - Document actual storage mechanism

2. **Test Small Batch Migration**
   - Export 10 records to CSV
   - Import to test PostgreSQL database
   - Verify data integrity

3. **Create Full Migration Script**
   - Based on `backend/scripts/analyze_access_db.py`
   - Add CSV export functionality
   - Add PostgreSQL import functionality

### Migration Workflow:
```
1. analyze_access_db.py (DONE)
   ↓
2. export_access_to_csv.py (TODO)
   ↓
3. import_csv_to_postgres.py (TODO)
   ↓
4. verify_migration.py (TODO)
```

---

## Files Generated

1. **`access_analysis_T_履歴書_20251024_140239.json`**
   - Full schema export
   - Column metadata
   - Type mappings
   - Statistics

2. **`README.md`** (this file)
   - Human-readable summary
   - Migration recommendations
   - Next steps

---

## Technical Notes

### pyodbc Version
- **Package:** pyodbc 5.3.0
- **Python:** 3.13
- **Driver:** Microsoft Access Driver (*.mdb, *.accdb)

### Access Database Version
- **File:** ユニバーサル企画㈱データベースv25.3.24.accdb
- **Format:** ACCDB (Access 2007+)
- **Size:** Unknown (not queried)
- **Records:** 1,148 candidates

### Performance Considerations
- **Large LONGCHAR fields** may slow queries
- Consider adding indexes on:
  - `氏名` (name)
  - `国籍` (nationality)
  - `受付日` (reception date)
  - `面接結果OK` (interview result)

---

**Analysis Complete** ✓
For questions or issues, see: `backend/scripts/analyze_access_db.py`
