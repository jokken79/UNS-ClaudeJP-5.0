# Archived Scripts Documentation

**Archive Date:** 2025-10-26
**Reason:** Phase 2 consolidation - Scripts replaced by unified tools

This directory contains obsolete scripts that have been replaced by consolidated, modernized versions.

---

## Photo Import Scripts (Replaced by `unified_photo_import.py`)

### `import_photos_by_name.py`
**Purpose:** Import photos by matching candidates using name or position-based matching
**Replaced By:** `unified_photo_import.py import`
**Reason:** Duplicated functionality, unreliable matching strategy

### `import_photos_from_json.py`
**Purpose:** Import photos from JSON mapping file to candidates table
**Replaced By:** `unified_photo_import.py import`
**Reason:** Core logic preserved, now part of unified tool

### `import_photos_from_access.py`
**Purpose:** Direct Access to PostgreSQL photo import (first attempt)
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Incomplete implementation, superseded

### `import_photos_from_access_v2.py`
**Purpose:** Second iteration of Access import
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Incremental version, not final

### `import_photos_from_access_simple.py`
**Purpose:** Simplified Access import attempt
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Too simple, missing features

### `import_photos_from_access_corrected.py`
**Purpose:** Bug-fixed version of Access import
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Logic merged into unified tool

### `extract_access_with_photos.py`
**Purpose:** Extract photos embedded in Access database
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Core functionality preserved

### `import_access_candidates_with_photos.py`
**Purpose:** Combined candidate and photo import from Access
**Replaced By:** `unified_photo_import.py extract + import`
**Reason:** Separated concerns, better modularity

### `extract_access_attachments.py`
**Purpose:** COM automation-based attachment extraction
**Replaced By:** `unified_photo_import.py extract`
**Reason:** Core logic preserved in unified tool

---

## Verification Scripts (Replaced by `verify.py`)

### `verify_data.py`
**Purpose:** Verify candidate/employee data after import
**Replaced By:** `verify.py data`
**Reason:** Consolidated into unified verification

### `verify_system.py`
**Purpose:** System health check
**Replaced By:** `verify.py system`
**Reason:** Merged with other verification tools

### `verify_all_photos.py`
**Purpose:** Verify photo data integrity (JPEG/PNG markers)
**Replaced By:** `verify.py photos`
**Reason:** Better integration with full verification

### `full_verification.py`
**Purpose:** Comprehensive system verification
**Replaced By:** `verify.py all`
**Reason:** Modernized with better reporting

---

## Diagnostic Scripts (One-time use, archived for reference)

### `explore_access_db.py`
**Purpose:** Explore Access database structure and tables
**Use Case:** Initial database exploration
**Status:** No longer needed, database structure documented

### `explore_access_columns.py`
**Purpose:** List all columns in Access tables
**Use Case:** Database schema discovery
**Status:** Schema documented, script obsolete

### `list_access_tables.py`
**Purpose:** List all tables in Access database
**Use Case:** Initial reconnaissance
**Status:** Tables documented

### `find_photos_in_access_all_tables.py`
**Purpose:** Search for photo columns across all tables
**Use Case:** Photo field discovery
**Status:** Photo field identified (T_履歴書.写真)

### `scan_all_columns_for_binary.py`
**Purpose:** Scan for binary/BLOB columns
**Use Case:** Data type analysis
**Status:** Binary fields identified

### `check_for_embedded_photos.py`
**Purpose:** Check if photos are embedded vs file paths
**Use Case:** Photo storage strategy identification
**Status:** Confirmed as Attachment type

### `check_photo_column.py`
**Purpose:** Analyze photo column structure
**Use Case:** Attachment field type discovery
**Status:** Structure documented

### `debug_photo_extraction.py`
**Purpose:** Debug photo extraction process
**Use Case:** Troubleshooting extraction errors
**Status:** Issues resolved

### `debug_photo_matching.py`
**Purpose:** Debug candidate-photo matching
**Use Case:** Troubleshooting ID mismatches
**Status:** Matching strategy finalized

---

## One-Time Migration Scripts (Historical, archived)

### `migrate_candidates_rirekisho.py`
**Purpose:** Migrate candidate data to rirekisho_id schema
**Use Case:** Database schema migration
**Status:** Migration completed

### `relink_factories.py`
**Purpose:** Relink employees to correct factories
**Use Case:** Fix factory_id references
**Status:** Relinking completed

### `assign_factory_ids.py`
**Purpose:** Assign factory_id to employees based on factory names
**Use Case:** Data normalization
**Status:** Assignment completed

### `populate_hakensaki_shain_ids.py`
**Purpose:** Populate 派遣先 employee IDs
**Use Case:** Data enrichment
**Status:** Population completed

### `match_candidates_with_employees.py`
**Purpose:** Link candidates to employee records via rirekisho_id
**Use Case:** Data relationship establishment
**Status:** Matching completed

---

## Redundant Import Scripts (Replaced by `import_data.py`)

### `import_candidates_full.py`
**Purpose:** Full candidate import with all fields
**Replaced By:** `import_data.py`
**Reason:** Redundant, main import script preferred

### `import_candidates_complete.py`
**Purpose:** Complete candidate import workflow
**Replaced By:** `import_data.py`
**Reason:** Duplicate of import_candidates_full.py

### `import_real_candidates.py`
**Purpose:** Import real candidates from Excel
**Replaced By:** `import_data.py`
**Reason:** Merged into main import script

### `import_real_candidates_final.py`
**Purpose:** Final version of real candidate import
**Replaced By:** `import_data.py`
**Reason:** Logic preserved in import_data.py

### `import_employees_as_candidates.py`
**Purpose:** Import employee data as candidate records
**Replaced By:** `import_data.py`
**Reason:** Handled by main import workflow

---

## Archive Statistics

**Total Scripts Archived:** 29
**Photo Import Scripts:** 9
**Verification Scripts:** 4
**Diagnostic Scripts:** 9
**Migration Scripts:** 5
**Redundant Import Scripts:** 5

**Lines of Code Eliminated:** ~3,500+
**Consolidation Ratio:** 29 scripts → 2 unified tools (93% reduction)

---

## Migration Guide

### Old Command → New Command

```bash
# Photo extraction
OLD: python extract_access_attachments.py --sample
NEW: python unified_photo_import.py extract --limit 5 --dry-run

OLD: python extract_access_attachments.py --full
NEW: python unified_photo_import.py extract

# Photo import
OLD: python import_photos_from_json.py --photos mappings.json
NEW: python unified_photo_import.py import --file mappings.json

OLD: python import_photos_by_name.py
NEW: python unified_photo_import.py import

# Verification
OLD: python verify_data.py
NEW: python verify.py data

OLD: python verify_all_photos.py
NEW: python verify.py photos

OLD: python verify_system.py
NEW: python verify.py system

OLD: python full_verification.py
NEW: python verify.py all
```

---

## Notes for Future Maintainers

1. **Do not delete archived scripts immediately** - Keep for historical reference and potential data recovery
2. **Scripts in this archive are NOT maintained** - Do not run them in production
3. **Refer to unified tools** - All functionality preserved in `unified_photo_import.py` and `verify.py`
4. **Git history preserved** - Original commits and development history intact

---

**Archived by:** Claude Code
**Phase:** 2 (Consolidation)
**Project:** UNS-ClaudeJP 5.0
