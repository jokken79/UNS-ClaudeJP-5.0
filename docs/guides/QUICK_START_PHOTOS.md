# Quick Start: Extract and Import Photos

## TL;DR

```bash
# 1. Navigate to scripts directory
cd backend\scripts

# 2. Run automated workflow (Windows only)
EXTRACT_AND_IMPORT_PHOTOS.bat
```

That's it! The batch script will:
- Install pywin32 if needed
- Extract photos from Access
- Import candidates with photos
- Show detailed progress

---

## Manual Steps (if batch script doesn't work)

### Step 1: Install pywin32 (Windows only)
```bash
pip install pywin32
```

### Step 2: Extract Photos from Access
```bash
# Test with 5 samples first
python extract_access_attachments.py --sample

# If successful, extract all
python extract_access_attachments.py --full
```

**Output:** `access_photo_mappings.json`

### Step 3: Import Candidates with Photos
```bash
# Test with 5 samples first
python import_access_candidates.py --sample --photos access_photo_mappings.json

# If successful, import all
python import_access_candidates.py --full --photos access_photo_mappings.json
```

**Output:** `import_candidates_report.json`

---

## Verify Success

### Check Logs
- `extract_attachments_YYYYMMDD_HHMMSS.log`
- `import_candidates_YYYYMMDD_HHMMSS.log`

### Check Database
```sql
-- Connect to PostgreSQL
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp

-- Count candidates with photos
SELECT
  COUNT(*) as total,
  COUNT(photo_data_url) as with_photos
FROM candidates;
```

### Check Frontend
1. Navigate to http://localhost:3000/candidates
2. Click on a candidate
3. Verify photo displays

---

## Troubleshooting

### Error: "pywin32 not installed"
```bash
pip install pywin32
```

### Error: "Access database not found"
Update path in `extract_access_attachments.py`:
```python
ACCESS_DB_PATH = r"C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb"
```

### Error: "Photo mappings file not found"
Run extraction first:
```bash
python extract_access_attachments.py --full
```

### No photos in database
1. Check `access_photo_mappings.json` has data
2. Re-run import with `--photos` parameter
3. Verify `rirekisho_id` values match

---

## What's Happening?

### Why Two Steps?

**Step 1: Extract Photos**
- Access stores photos as "Attachment" field type
- ODBC can't read Attachments, needs COM automation
- Extracts photos to Base64 data URLs
- Saves to JSON file

**Step 2: Import with Photos**
- Fast ODBC import of candidate data
- Looks up photos in JSON mappings
- Inserts Base64 data URLs to database

### File Locations

- **Access DB:** `C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb`
- **Scripts:** `backend/scripts/`
- **Mappings:** `backend/scripts/access_photo_mappings.json` (generated)
- **Logs:** `backend/scripts/*.log` (generated)

---

## Performance

- **Extraction:** ~20 minutes for 500 records (COM is slow)
- **Import:** ~3 minutes for 500 records (ODBC is fast)
- **Total:** ~23 minutes

---

## Need Help?

See detailed documentation:
- `backend/scripts/README_PHOTO_EXTRACTION.md`
- `docs/ACCESS_PHOTO_EXTRACTION_IMPLEMENTATION.md`
