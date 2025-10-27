# Access Database Photo Extraction Workflow

## Overview

Access stores photos in an **Attachment field type** - a special field that stores binary files inside the database, not as file paths or BLOBs. This requires Windows COM automation to extract.

## Two-Step Import Process

### Step 1: Extract Photos from Access (Windows Host)

The extraction script uses `pywin32` COM automation to access the Attachment field and extract photos as Base64 data URLs.

**Important:** This script MUST run on the Windows host (NOT in Docker), because:
- pywin32 is Windows-only
- Requires Microsoft Access drivers
- Uses COM automation

#### Install pywin32 (Windows Host)

```bash
# On Windows host (outside Docker)
pip install pywin32
```

#### Run Photo Extraction

```bash
# Navigate to backend/scripts directory
cd backend\scripts

# Test with 5 sample records
python extract_access_attachments.py --sample

# Extract all photos
python extract_access_attachments.py --full

# Extract limited number
python extract_access_attachments.py --full --limit 100
```

**Output:**
- Creates `access_photo_mappings.json` with:
  - Timestamp and database info
  - Statistics on extraction
  - Mappings: `rirekisho_id` → `photo_data_url` (Base64)

**Sample Output Structure:**
```json
{
  "timestamp": "2025-10-24T10:30:00",
  "access_database": "C:\\Users\\JPUNS\\Desktop\\...accdb",
  "table": "T_履歴書",
  "photo_field": "写真",
  "statistics": {
    "total_records": 500,
    "processed": 500,
    "with_attachments": 450,
    "without_attachments": 50,
    "extraction_successful": 445,
    "extraction_failed": 5,
    "errors": 0
  },
  "mappings": {
    "RR001": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "RR002": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    ...
  }
}
```

### Step 2: Import Candidates with Photos

Once photos are extracted, run the import script with the photo mappings file.

```bash
# Copy access_photo_mappings.json to a location accessible by Docker
# or mount it as a volume

# Inside backend container or on Windows host
python import_access_candidates.py --sample --photos access_photo_mappings.json

# Full import with photos
python import_access_candidates.py --full --photos access_photo_mappings.json
```

**How it works:**
1. Import script loads photo mappings from JSON
2. For each candidate record:
   - Gets `rirekisho_id` from Access
   - Looks up photo in mappings dictionary
   - Sets `photo_data_url` field with Base64 data URL
3. Photo is saved directly in PostgreSQL

## Technical Details

### Access Attachment Field Structure

Access Attachments are NOT simple fields. Internally they are:
- A hidden system table storing attachment metadata
- Linked to parent record via internal keys
- Each attachment has: FileName, FileType, FileData

### COM Automation Approach

```python
import win32com.client

# Open Access database
access = win32com.client.Dispatch("Access.Application")
access.OpenCurrentDatabase(db_path)

# Open recordset
recordset = access.CurrentDb().OpenRecordset("T_履歴書")

# For each record
while not recordset.EOF:
    # Get attachment field (it's a recordset itself!)
    attachment_field = recordset.Fields("写真")

    # Access attachment recordset
    if attachment_field.Value and attachment_field.Value.RecordCount > 0:
        attachments = attachment_field.Value
        attachments.MoveFirst()

        # Extract data
        filename = attachments.Fields("FileName").Value
        file_data = attachments.Fields("FileData").Value

        # Convert to Base64
        photo_base64 = base64.b64encode(bytes(file_data)).decode()
        data_url = f"data:image/jpeg;base64,{photo_base64}"
```

### Why Not ODBC/pyodbc?

The `pyodbc` library (used in import script) **CANNOT read Attachment fields**. When you query an Attachment field via ODBC:
- Field appears as `None` or binary gibberish
- No access to internal attachment recordset
- No way to extract file data

This is why we need two separate scripts:
1. **extract_access_attachments.py** - Windows COM automation (pywin32)
2. **import_access_candidates.py** - ODBC import (pyodbc) + photo mappings

## Workflow Summary

```
┌─────────────────────────────────────────┐
│ Access Database (T_履歴書)              │
│ - 写真 field (Attachment type)          │
│ - Contains embedded photo files         │
└────────────┬────────────────────────────┘
             │
             ▼
   ┌─────────────────────────────┐
   │ extract_access_attachments  │ ← Windows Host
   │ - Uses pywin32 COM          │   (pywin32)
   │ - Extracts binary data      │
   │ - Converts to Base64        │
   └────────────┬────────────────┘
                │
                ▼
   ┌─────────────────────────────┐
   │ access_photo_mappings.json  │
   │ {                           │
   │   "RR001": "data:image...", │
   │   "RR002": "data:image..."  │
   │ }                           │
   └────────────┬────────────────┘
                │
                ▼
   ┌─────────────────────────────┐
   │ import_access_candidates    │ ← Docker or Host
   │ - Uses pyodbc (ODBC)        │   (pyodbc)
   │ - Loads photo mappings      │
   │ - Imports to PostgreSQL     │
   └────────────┬────────────────┘
                │
                ▼
   ┌─────────────────────────────┐
   │ PostgreSQL (candidates)     │
   │ - photo_data_url field      │
   │ - Base64 embedded photos    │
   └─────────────────────────────┘
```

## Troubleshooting

### Error: "pywin32 not installed"
**Solution:** Install pywin32 on Windows host:
```bash
pip install pywin32
```

### Error: "Access database not found"
**Solution:** Check the path in extract_access_attachments.py:
```python
ACCESS_DB_PATH = r"C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb"
```

### Error: "No matching distribution for pywin32" (in Docker)
**Solution:** This is expected! Run extraction script on Windows host, not in Docker.

### Warning: "Photo mappings file not found"
**Solution:** Run Step 1 (extraction) first to generate `access_photo_mappings.json`

### Issue: Photos not importing
**Solutions:**
1. Check `access_photo_mappings.json` was created successfully
2. Verify mappings file path is correct in import command
3. Check `rirekisho_id` values match between Access and mappings

### Issue: COM Error when opening Access
**Solutions:**
1. Ensure Microsoft Access is installed on Windows host
2. Close Access if it's already open
3. Check Access database is not locked by another process
4. Verify user has permissions to Access database file

## File Locations

- **Extraction Script:** `backend/scripts/extract_access_attachments.py`
- **Import Script:** `backend/scripts/import_access_candidates.py`
- **Photo Mappings:** `backend/scripts/access_photo_mappings.json` (generated)
- **Access Database:** `C:\Users\JPUNS\Desktop\ユニバーサル企画㈱データベースv25.3.24.accdb`

## Log Files

Both scripts generate timestamped log files:
- `extract_attachments_YYYYMMDD_HHMMSS.log`
- `import_candidates_YYYYMMDD_HHMMSS.log`

Check these for detailed execution traces and error messages.

## Performance Notes

- **Extraction:** ~1-2 seconds per photo (COM overhead)
- **Import:** ~100-500 records per second (ODBC)
- For 500 candidates with photos: ~20 minutes extraction, ~2 minutes import

## Next Steps

After successful import with photos:
1. Verify photos in database:
   ```sql
   SELECT rirekisho_id,
          CASE
            WHEN photo_data_url IS NOT NULL THEN 'HAS_PHOTO'
            ELSE 'NO_PHOTO'
          END as photo_status
   FROM candidates
   LIMIT 10;
   ```

2. Test photo display in frontend (Next.js)
3. Check photo rendering in candidate detail pages
