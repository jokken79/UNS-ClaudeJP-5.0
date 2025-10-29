"""
Auto-Extract Photos from DATABASEJP Folder

Automatically searches for Access database in DATABASEJP folder
and extracts photos if access_photo_mappings.json doesn't exist.

This script:
1. Looks for DATABASEJP folder (parent or sibling directories)
2. Finds .accdb database files
3. Extracts photos using pywin32 (Windows only)
4. Saves to access_photo_mappings.json

Usage:
    python auto_extract_photos_from_databasejp.py

Requirements:
    - Windows with pywin32 installed
    - Microsoft Access installed or Access Database Engine
    - DATABASEJP folder with .accdb files
"""

import sys
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'auto_extract_photos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def find_databasejp_folder() -> Optional[Path]:
    """
    Search for DATABASEJP folder in:
    1. Current directory
    2. Parent directory
    3. Sibling directory
    4. Common known locations
    """

    logger.info("Searching for DATABASEJP folder...")

    search_paths = [
        Path.cwd() / "DATABASEJP",
        Path.cwd().parent / "DATABASEJP",
        Path.cwd().parent.parent / "DATABASEJP",
        Path("D:/DATABASEJP"),
        Path("D:/ユニバーサル企画㈱データベース"),
        Path(os.path.expanduser("~")) / "DATABASEJP",
    ]

    for path in search_paths:
        if path.exists() and path.is_dir():
            logger.info(f"✓ Found DATABASEJP at: {path}")
            return path

    logger.warning("DATABASEJP folder not found in common locations")
    return None


def find_access_database(databasejp_path: Path) -> Optional[Path]:
    """
    Search for .accdb files in DATABASEJP folder

    Priority:
    1. Look for specific database name: ユニバーサル企画㈱データベースv25.3.24.accdb
    2. Look for any .accdb file (largest = main database)
    """

    logger.info(f"Searching for Access database files in {databasejp_path}...")

    # Strategy 1: Look for the specific known database name
    known_db_names = [
        "ユニバーサル企画㈱データベースv25.3.24.accdb",
        "ユニバーサル企画㈱データベース.accdb",
        "ユニバーサル企画.accdb",
    ]

    for db_name in known_db_names:
        db_path = databasejp_path / db_name
        if db_path.exists():
            logger.info(f"✓ Found specific database: {db_name}")
            logger.info(f"  Size: {db_path.stat().st_size / (1024*1024):.1f} MB")
            return db_path

    # Strategy 2: Search for any .accdb files
    logger.info("Specific database not found, searching for any .accdb files...")
    accdb_files = list(databasejp_path.glob("**/*.accdb"))

    if not accdb_files:
        logger.warning("No .accdb files found in DATABASEJP")
        return None

    logger.info(f"Found {len(accdb_files)} Access database file(s)")

    # Sort by size (descending) to get the main database
    accdb_files.sort(key=lambda p: p.stat().st_size, reverse=True)

    selected_db = accdb_files[0]
    logger.info(f"✓ Selected largest database: {selected_db.name} ({selected_db.stat().st_size / (1024*1024):.1f} MB)")

    return selected_db


def extract_photos_from_access(access_db_path: Path) -> Dict[str, Any]:
    """
    Extract photos from Access database using pywin32
    Returns dictionary with extraction results
    """

    logger.info(f"\nStarting photo extraction from: {access_db_path}")

    try:
        import win32com.client as win32
    except ImportError:
        logger.error("pywin32 not installed!")
        logger.error("Install with: pip install pywin32")
        return {"error": "pywin32_not_installed"}

    try:
        import base64
        import struct

        # Open Access database
        access_app = win32.GetObject(str(access_db_path))
        logger.info("✓ Connected to Access database")

        # Get the table with photos (usually T_履歴書)
        table_name = None
        for table_obj in access_app.TableDefs:
            if "履歴書" in table_obj.Name or "履歴" in table_obj.Name:
                table_name = table_obj.Name
                break

        if not table_name:
            logger.warning("Could not find Rirekisho table, trying T_履歴書...")
            table_name = "T_履歴書"

        logger.info(f"✓ Using table: {table_name}")

        # Get database object
        db = access_app.CurrentDatabase()
        table = db.TableDefs(table_name)

        # Find photo field
        photo_field = None
        for field in table.Fields:
            if "写真" in field.Name or "Photo" in field.Name or "photo" in field.Name:
                photo_field = field.Name
                break

        if not photo_field:
            logger.warning("Photo field not found, trying 写真...")
            photo_field = "写真"

        logger.info(f"✓ Using photo field: {photo_field}")

        # Extract photos
        recordset = db.OpenRecordset(table_name)
        mappings = {}
        total_records = 0
        with_photos = 0
        errors = 0

        logger.info("Extracting photos from database...")

        while not recordset.EOF:
            total_records += 1

            try:
                # Get record ID
                record_id = str(recordset(0).Value) if recordset(0).Value else f"record_{total_records}"

                # Get photo field
                photo_field_obj = recordset(photo_field)

                if photo_field_obj.Value:
                    with_photos += 1

                    # Extract attachment
                    attachments = photo_field_obj.Value
                    if attachments:
                        for attachment in attachments:
                            # Get file data
                            file_data = attachment.FileData
                            if file_data:
                                # Convert to base64
                                base64_data = base64.b64encode(file_data).decode('utf-8')
                                photo_data_url = f"data:image/jpeg;base64,{base64_data}"
                                mappings[record_id] = photo_data_url
                                break

                if total_records % 100 == 0:
                    logger.info(f"  Processed {total_records} records, extracted {with_photos} photos")

            except Exception as e:
                errors += 1
                logger.debug(f"Error extracting photo from record {total_records}: {e}")

            recordset.MoveNext()

        recordset.Close()
        access_app.Quit()

        logger.info(f"\n✓ Extraction complete:")
        logger.info(f"  Total records: {total_records}")
        logger.info(f"  Photos extracted: {with_photos}")
        logger.info(f"  Errors: {errors}")

        return {
            "success": True,
            "total_records": total_records,
            "with_photos": with_photos,
            "errors": errors,
            "mappings": mappings
        }

    except Exception as e:
        logger.error(f"Error during extraction: {e}")
        import traceback
        logger.debug(traceback.format_exc())
        return {"error": str(e)}


def save_photo_mappings(mappings: Dict, output_path: Path) -> bool:
    """
    Save photo mappings to JSON file
    """

    try:
        output = {
            "timestamp": datetime.now().isoformat(),
            "source": "auto_extract_from_databasejp",
            "statistics": {
                "total_mappings": len(mappings)
            },
            "mappings": mappings
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        logger.info(f"✓ Saved mappings to: {output_path}")
        return True

    except Exception as e:
        logger.error(f"Error saving mappings: {e}")
        return False


def main():
    """Main auto-extraction workflow"""

    logger.info("=" * 80)
    logger.info("AUTO-EXTRACT PHOTOS FROM DATABASEJP")
    logger.info("=" * 80)

    # Check if access_photo_mappings.json already exists
    output_file = Path.cwd() / "access_photo_mappings.json"
    if output_file.exists():
        logger.info(f"access_photo_mappings.json already exists. Skipping extraction.")
        logger.info(f"Location: {output_file}")
        return 0

    # Find DATABASEJP folder
    databasejp_path = find_databasejp_folder()
    if not databasejp_path:
        logger.error("Could not find DATABASEJP folder. Please ensure it exists.")
        return 1

    # Find Access database
    access_db = find_access_database(databasejp_path)
    if not access_db:
        logger.error("Could not find Access database in DATABASEJP folder.")
        return 1

    # Extract photos
    result = extract_photos_from_access(access_db)

    if "error" in result:
        logger.error(f"Extraction failed: {result['error']}")
        return 1

    # Save mappings
    if result.get("mappings"):
        if save_photo_mappings(result["mappings"], output_file):
            logger.info("\n" + "=" * 80)
            logger.info("✓ AUTO-EXTRACTION SUCCESSFUL")
            logger.info("=" * 80)
            return 0
        else:
            logger.error("Failed to save photo mappings")
            return 1
    else:
        logger.warning("No photos were extracted")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
