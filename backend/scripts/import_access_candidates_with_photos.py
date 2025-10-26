"""
Import candidates with photos from Access extraction
====================================================

This script imports candidate data and their photos into PostgreSQL database.
It reads the JSON files created by extract_access_with_photos.py

Requirements:
- Must run inside Docker container or with access to database
- Requires extract_access_with_photos.py to be run first

Usage:
    # Inside Docker container
    python import_access_candidates_with_photos.py

Input files:
    - access_candidates_data.json
    - access_photo_mappings.json
    - Photos in: /app/uploads/photos/candidates/
"""

import sys
import json
import logging
from datetime import datetime, date
from pathlib import Path
import pandas as pd

sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Candidate

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'/app/import_access_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
CANDIDATES_DATA_FILE = "/app/access_candidates_data.json"
PHOTO_MAPPINGS_FILE = "/app/access_photo_mappings.json"
PHOTOS_DIR = Path("/app/uploads/photos/candidates")


def parse_date(date_value):
    """Parse date from various formats"""
    if date_value is None or date_value == "" or str(date_value).lower() == 'nan':
        return None

    try:
        # If it's already a date object
        if isinstance(date_value, date):
            return date_value

        # If it's a string, try to parse it
        if isinstance(date_value, str):
            # Try ISO format first
            try:
                return datetime.fromisoformat(date_value).date()
            except:
                pass

            # Try other common formats
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d']:
                try:
                    return datetime.strptime(date_value, fmt).date()
                except:
                    continue

        return None
    except Exception as e:
        logger.debug(f"Could not parse date: {date_value} - {e}")
        return None


def import_candidates_with_photos():
    """
    Import candidates with their photos from JSON files

    Returns:
        int: Number of candidates imported
    """
    logger.info("=" * 80)
    logger.info("IMPORTING CANDIDATES WITH PHOTOS FROM ACCESS DATA")
    logger.info("=" * 80)

    # Check if files exist
    if not Path(CANDIDATES_DATA_FILE).exists():
        logger.error(f"❌ Candidates data file not found: {CANDIDATES_DATA_FILE}")
        logger.info("")
        logger.info("Please run these steps first:")
        logger.info("  1. On Windows host, run: python backend/scripts/extract_access_with_photos.py")
        logger.info(f"  2. Copy generated files to project root:")
        logger.info(f"     - access_candidates_data.json")
        logger.info(f"     - access_photo_mappings.json")
        logger.info(f"  3. Ensure photos are in: uploads/photos/candidates/")
        logger.info(f"  4. Run REINSTALAR.bat")
        return 0

    if not Path(PHOTO_MAPPINGS_FILE).exists():
        logger.warning(f"⚠️  Photo mappings file not found: {PHOTO_MAPPINGS_FILE}")
        logger.warning("   Candidates will be imported without photos")
        photo_mappings = {}
    else:
        with open(PHOTO_MAPPINGS_FILE, 'r', encoding='utf-8') as f:
            photo_mappings = json.load(f)
        logger.info(f"✓ Loaded {len(photo_mappings)} photo mappings")

    # Load candidate data
    logger.info(f"Loading candidate data from: {CANDIDATES_DATA_FILE}")
    with open(CANDIDATES_DATA_FILE, 'r', encoding='utf-8') as f:
        candidates_data = json.load(f)

    logger.info(f"✓ Loaded {len(candidates_data)} candidate records")
    logger.info("")

    db = SessionLocal()
    try:
        # Check if candidates already exist
        existing_count = db.query(Candidate).count()
        if existing_count > 0:
            logger.warning(f"⚠️  Database already contains {existing_count} candidates")
            logger.info("   Skipping import to avoid duplicates")
            logger.info("   To force reimport, run: docker exec -it uns-claudejp-backend python scripts/clear_candidates.py")
            return 0

        imported_count = 0
        with_photos_count = 0
        errors = 0

        logger.info("Processing candidates...")
        logger.info("")

        # Common field mappings (Access -> PostgreSQL)
        field_mappings = {
            'ID': 'id',
            '氏名': 'seimei_kanji',
            'カナ': 'seimei_katakana',
            'ローマ字': 'seimei_romaji',
            '生年月日': 'birth_date',
            '性別': 'gender',
            '国籍': 'nationality',
            '電話番号': 'phone',
            'メール': 'email',
            '在留資格': 'visa_status',
            '職歴年数': 'work_experience_years',
            '資格': 'qualification',
            '現在': 'status',
        }

        for idx, record in enumerate(candidates_data, 1):
            try:
                # Extract candidate ID
                candidate_id = record.get('ID') or record.get('id') or idx

                # Get photo filename if exists
                photo_filename = photo_mappings.get(str(candidate_id))
                if photo_filename:
                    photo_path = f"photos/candidates/{photo_filename}"
                    # Verify photo file exists
                    if not (PHOTOS_DIR / photo_filename).exists():
                        logger.warning(f"  Photo file not found: {photo_filename}")
                        photo_path = None
                    else:
                        with_photos_count += 1
                else:
                    photo_path = None

                # Extract main fields
                seimei_kanji = str(record.get('氏名', record.get('seimei_kanji', 'Unknown'))).strip()
                if not seimei_kanji or seimei_kanji.lower() in ['nan', 'none', '']:
                    logger.debug(f"  Skipping record {idx}: no name")
                    continue

                seimei_katakana = str(record.get('カナ', record.get('seimei_katakana', ''))).strip()
                seimei_romaji = str(record.get('ローマ字', record.get('seimei_romaji', seimei_kanji))).strip()

                # Parse birth date
                birth_date = parse_date(record.get('生年月日', record.get('birth_date')))

                # Other fields
                gender = str(record.get('性別', record.get('gender', ''))).strip()
                nationality = str(record.get('国籍', record.get('nationality', 'Unknown'))).strip()
                phone = str(record.get('電話番号', record.get('phone', ''))).strip()
                email = str(record.get('メール', record.get('email', ''))).strip()
                visa_status = str(record.get('在留資格', record.get('visa_status', 'Unknown'))).strip()
                work_experience_years = record.get('職歴年数', record.get('work_experience_years', 0))
                qualification = str(record.get('資格', record.get('qualification', ''))).strip()
                status_raw = str(record.get('現在', record.get('status', ''))).strip()

                # Map status
                if status_raw == '在職中':
                    status = 'employed'
                elif status_raw == '退社':
                    status = 'inactive'
                else:
                    status = 'seeking'

                # Create candidate
                candidate = Candidate(
                    seimei_kanji=seimei_kanji,
                    seimei_katakana=seimei_katakana if seimei_katakana else seimei_kanji,
                    seimei_romaji=seimei_romaji if seimei_romaji else seimei_kanji,
                    birth_date=birth_date,
                    gender=gender if gender else None,
                    nationality=nationality if nationality != 'nan' else 'Unknown',
                    phone=phone if phone and phone != 'nan' else '',
                    email=email if email and email != 'nan' else '',
                    visa_status=visa_status if visa_status != 'nan' else 'Unknown',
                    work_experience_years=int(work_experience_years) if work_experience_years else 0,
                    qualification=qualification if qualification and qualification != 'nan' else '',
                    status=status,
                    photo_url=photo_path,  # Add photo URL (relative path)
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                )

                db.add(candidate)
                imported_count += 1

                # Show progress
                if imported_count % 100 == 0:
                    logger.info(f"  ✓ Processed {imported_count} candidates ({with_photos_count} with photos)...")

            except Exception as e:
                errors += 1
                if errors < 10:  # Show first 10 errors
                    logger.error(f"  ❌ Error processing record {idx}: {e}")
                continue

        # Commit all changes
        db.commit()

        logger.info("")
        logger.info("=" * 80)
        logger.info("IMPORT COMPLETED SUCCESSFULLY")
        logger.info("=" * 80)
        logger.info(f"Total candidates imported: {imported_count}")
        logger.info(f"Candidates with photos: {with_photos_count}")
        logger.info(f"Errors: {errors}")
        logger.info("=" * 80)

        return imported_count

    except Exception as e:
        db.rollback()
        logger.error("=" * 80)
        logger.error("IMPORT FAILED")
        logger.error("=" * 80)
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        logger.error("=" * 80)
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    count = import_candidates_with_photos()

    if count > 0:
        print(f"\n✅ Successfully imported {count} candidates!")
    else:
        print("\n❌ Import failed or no candidates imported. Check the log file.")
