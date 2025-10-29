# Photo Extraction Analysis Report

## Summary

Attempted to extract and link photos from the Access database (`ユニバーサル企画㈱データベースv25.3.24.accdb`) to PostgreSQL candidates. The investigation revealed critical issues with photo availability.

## Findings

### 1. Access Database Structure

**Table**: `T_履歴書` (Resume/Curriculum Vitae)
**Total Records**: 1,148
**Total Columns**: 172

### 2. Correct Column Mapping (After Debugging)

| Column Index | Field Name | Data Type | Purpose |
|---|---|---|---|
| [3] | 名前 (Name) | String | Candidate name (e.g., "MATSUMOTO MAURILIO", "LE VAN HOANG") |
| [8] | 写真 (Photo) | String | Photo file name/reference |

**Note**: Initial script used wrong indices ([2] and [8]), causing 0 matches

### 3. Photo Storage Format

**Type**: FILE NAME REFERENCES (NOT embedded binary data)
**Records with photo references**: 1,131 out of 1,148 (98.5%)
**Format examples**:
- "Photo.jpeg"
- "att.hOzhLHIIr1VhEHdb3xeFHc67YszzZnrr3uirRDrZVZg.JPG"
- "dd427491-8090-4897-b618-8366bef1df00.jpg"
- "image6.jpeg"
- "IMG_4365.jpeg"

**Key Finding**: Photos are stored as external file references, NOT as embedded OLE objects or binary data

### 4. Photo File Search Results

**Search Paths Checked**:
- D:\photos
- D:\候補者写真 (Japanese: "Candidate Photos")
- D:\candidates\photos
- D:\employee_photos
- D:\images
- C:\photos
- C:\候補者写真
- C:\candidates\photos
- Recursive subdirectory search

**Result**: **0 photo files found** on the file system

### 5. Name Matching Issue

PostgreSQL candidates table has 1,041 imported records with names like:
- "VI THI HUE"
- "NGUYEN QUANG THANG"
- "NGUYEN HUY HOANG"
- etc.

Access database names in column [3]:
- "MATSUMOTO MAURILIO"
- "HO VIET PHANG"
- "LE VAN HOANG"
- "NGUYEN VAN CONG"
- etc.

**Issue**: Limited exact name matches between Access and PostgreSQL records (mostly due to photo files not being available for testing)

## Root Cause Analysis

| Issue | Cause | Impact |
|---|---|---|
| Photo files not found | Files likely deleted or stored elsewhere | Cannot extract photos |
| Wrong column indices used | Initial debugging assumed wrong columns | 0 photos matched |
| File name references only | Photos stored as external links, not embedded | Requires file system access |

## Recommendations

### Option 1: Locate Missing Photo Files
- **Action**: Search for photo files on backup drives or cloud storage
- **Location clues**: File names suggest GUID-based storage (Azure Blob Storage format?)
- **Benefit**: Can recover all 1,131 photos from Access database

### Option 2: Continue Without Photos
- **Action**: Skip photo import, continue with candidate data only
- **Status**: 1,041 candidates already imported with complete data (names, dates, addresses, visa info)
- **Impact**: Photos can be added later manually

### Option 3: Check for Alternative Photo Sources
- **Investigation needed**:
  - Are photos stored in a separate database or cloud service?
  - Check Azure Blob Storage accounts
  - Check OneDrive or SharePoint
  - Review backup storage locations

## Technical Details

### Corrected Photo Extraction Script

Created: `/backend/scripts/import_photos_from_access_corrected.py`

Features:
- Uses correct column indices ([3] for names, [8] for photos)
- Searches multiple common photo storage locations
- Handles case-insensitive name matching
- Provides detailed logging and statistics
- Graceful error handling

### Script Performance

**Test Run Results**:
- Records processed: 1,148
- Photo file names found: 1,131
- Actual files located: 0
- Photos linked to candidates: 0

## Next Steps

1. **REQUIRED**: Locate where the 1,131 photo files are physically stored
2. Once located, update `PHOTO_SEARCH_PATHS` in the extraction script
3. Re-run the extraction script
4. Verify photos are properly linked in PostgreSQL

## Database Schema

**Current Status**:
- PostgreSQL `candidates` table: 1,041 records imported
- Field `photo_data_url`: Currently NULL for all records
- Field type: Text (stores base64 data URLs)
- Ready to accept photo data

---

**Analysis Date**: 2025-10-26
**Status**: Awaiting photo file location information
**Next Action**: User to provide location of photo files or confirm skipping photo import
