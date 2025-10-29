"""
Corrected photo extraction from Access database using correct column indices
Column [3]: Candidate name (e.g., "MATSUMOTO MAURILIO")
Column [8]: Photo file name (e.g., "Photo.jpeg", "dd427491-8090-4897-b618-8366bef1df00.jpg")
"""
import sys
import os
import base64
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

# PostgreSQL Configuration from environment
POSTGRES_USER = os.getenv('POSTGRES_USER', 'uns_admin')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', '')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'uns_claudejp')
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Possible locations where photo files might be stored
PHOTO_SEARCH_PATHS = [
    r"D:\photos",
    r"D:\候補者写真",
    r"D:\candidates\photos",
    r"D:\employee_photos",
    r"D:\images",
    r"C:\photos",
    r"C:\候補者写真",
    r"C:\candidates\photos",
]


def find_photo_file(filename):
    """Search for photo file in common locations"""
    if not filename:
        return None

    # Try direct path
    if os.path.exists(filename):
        return filename

    # Try in common search paths
    for base_path in PHOTO_SEARCH_PATHS:
        full_path = os.path.join(base_path, filename)
        if os.path.exists(full_path):
            return full_path

        # Try subdirectories
        if os.path.exists(base_path):
            for root, dirs, files in os.walk(base_path):
                if filename in files:
                    return os.path.join(root, filename)

    return None


def extract_photos_corrected():
    """Extract photos using corrected column indices"""

    print("\n" + "=" * 100)
    print("EXTRACTING PHOTOS FROM ACCESS (CORRECTED)")
    print("=" * 100 + "\n")

    print("Column mapping:")
    print("  [3] = Candidate name")
    print("  [8] = Photo file name")
    print()

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        print(f"Connected to Access database\n")

        # Get all records
        cursor.execute("SELECT * FROM T_履歴書")

        # Correct column indices
        NAME_IDX = 3        # Candidate name
        PHOTO_IDX = 8       # Photo file name

        processed = 0
        updated = 0
        photo_files_found = 0
        photo_files_missing = 0
        name_not_matched = 0
        errors = 0

        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        print(f"Processing records...\n")

        for row in cursor.fetchall():
            processed += 1

            try:
                # Extract values using correct indices
                name = str(row[NAME_IDX]).strip() if row[NAME_IDX] else None
                photo_filename = str(row[PHOTO_IDX]).strip() if row[PHOTO_IDX] else None

                if not name or not photo_filename:
                    continue

                # Try to find the photo file
                photo_path = find_photo_file(photo_filename)

                if photo_path:
                    photo_files_found += 1

                    # Read photo file and convert to base64
                    try:
                        with open(photo_path, 'rb') as f:
                            photo_bytes = f.read()
                        photo_base64 = base64.b64encode(photo_bytes).decode('utf-8')
                        photo_data_url = f"data:image/jpeg;base64,{photo_base64}"

                        # Try exact name match first
                        sql = text("""
                            UPDATE candidates
                            SET photo_data_url = :photo_data_url
                            WHERE full_name_roman = :name AND photo_data_url IS NULL
                        """)

                        result = db.execute(sql, {
                            'photo_data_url': photo_data_url,
                            'name': name
                        })
                        db.commit()

                        if result.rowcount > 0:
                            updated += 1
                        else:
                            # Try case-insensitive match
                            sql2 = text("""
                                UPDATE candidates
                                SET photo_data_url = :photo_data_url
                                WHERE LOWER(full_name_roman) = LOWER(:name) AND photo_data_url IS NULL
                            """)

                            result2 = db.execute(sql2, {
                                'photo_data_url': photo_data_url,
                                'name': name
                            })
                            db.commit()

                            if result2.rowcount > 0:
                                updated += 1
                            else:
                                name_not_matched += 1

                    except Exception as e:
                        db.rollback()
                        errors += 1
                        if errors < 5:
                            print(f"  Error reading photo file {photo_filename}: {str(e)[:50]}")

                else:
                    photo_files_missing += 1

                if processed % 200 == 0:
                    print(f"  Processed: {processed:4d} | Photos linked: {updated:4d} | Files found: {photo_files_found:4d}")

            except Exception as e:
                errors += 1
                continue

        print(f"\n" + "=" * 100)
        print(f"\nRESULTS:")
        print(f"  Total records from Access:    {processed}")
        print(f"  Photos with file names:       {processed - errors}")
        print(f"  Photo files found on disk:    {photo_files_found}")
        print(f"  Photo files NOT found:        {photo_files_missing}")
        print(f"  Photos linked to candidates:  {updated}")
        print(f"  Names not matched in DB:      {name_not_matched}")
        print(f"  Errors:                       {errors}")

        if photo_files_found > 0:
            print(f"\n  Success rate (file finding): {(photo_files_found * 100) // (photo_files_found + photo_files_missing)}%")
        if photo_files_found > 0:
            print(f"  Success rate (DB linking):   {(updated * 100) // photo_files_found}%")

        db.close()
        return updated

    except Exception as e:
        print(f"Error fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    count = extract_photos_corrected()
    print(f"\n{'=' * 100}")
    print(f"Total photos linked: {count}")
    print(f"{'=' * 100}\n")
