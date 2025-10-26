"""
Debug script to understand name mismatch in photo extraction
Compares names from Access database with names in PostgreSQL
"""
import sys
import os
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

def debug_photo_matching():
    """Debug the name matching between Access and PostgreSQL"""

    print("\n" + "=" * 100)
    print("DEBUG: PHOTO MATCHING NAME MISMATCH ANALYSIS")
    print("=" * 100 + "\n")

    # Get names from Access
    print("Step 1: Extracting names from Access database...\n")

    access_conn = None
    access_names = []

    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        # Get column count
        cursor.execute("SELECT * FROM T_履歴書")
        columns = cursor.description
        print(f"Access table T_履歴書 columns: {len(columns)}")
        for i, col in enumerate(columns[:15]):  # Show first 15 columns
            print(f"  {i}: {col[0]}")

        # Get names from column 2
        print(f"\nAccess names (column index 2) - first 20 records:\n")
        cursor.execute("SELECT * FROM T_履歴書")
        for i, row in enumerate(cursor.fetchall()):
            if i < 20:
                name = str(row[2]).strip() if row[2] else "NULL"
                access_names.append(name)
                print(f"  Access[{i}]: '{name}'")
            else:
                name = str(row[2]).strip() if row[2] else "NULL"
                access_names.append(name)

        print(f"\nTotal Access records: {len(access_names)}")
        print(f"Sample Access names: {access_names[:5]}")

    except Exception as e:
        print(f"Error reading Access: {e}")
        import traceback
        traceback.print_exc()
        return
    finally:
        if access_conn:
            access_conn.close()

    # Get names from PostgreSQL
    print("\n" + "=" * 100)
    print("Step 2: Extracting names from PostgreSQL database...\n")

    try:
        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        # Get total count
        result = db.execute(text("SELECT COUNT(*) FROM candidates"))
        total = result.scalar()
        print(f"Total candidates in PostgreSQL: {total}\n")

        # Get sample names
        result = db.execute(text("""
            SELECT full_name_roman, full_name_kanji, full_name_kana
            FROM candidates
            LIMIT 20
        """))

        pg_names = []
        print(f"PostgreSQL names (full_name_roman) - first 20 records:\n")
        for i, row in enumerate(result.fetchall()):
            name = row[0] if row[0] else "NULL"
            pg_names.append(name)
            print(f"  PG[{i}]: '{name}'")

        db.close()

    except Exception as e:
        print(f"Error reading PostgreSQL: {e}")
        import traceback
        traceback.print_exc()
        return

    # Compare names
    print("\n" + "=" * 100)
    print("Step 3: Name format analysis...\n")

    print(f"Sample Access name format: '{access_names[0]}'")
    print(f"Sample PostgreSQL name format: '{pg_names[0]}'")

    # Check for exact matches
    print(f"\nChecking for exact matches in first 20 records:")
    matches = 0
    for access_name in access_names[:20]:
        if access_name in pg_names:
            matches += 1
            print(f"  MATCH FOUND: {access_name}")

    print(f"\nExact matches found: {matches}/20")

    # Try partial matching
    print(f"\nAnalyzing name structure:")
    if access_names:
        sample_access = access_names[0]
        print(f"  Access format: '{sample_access}'")
        print(f"  Contains spaces: {' ' in sample_access}")
        print(f"  Parts: {sample_access.split()}")

    if pg_names:
        sample_pg = pg_names[0]
        print(f"  PG format: '{sample_pg}'")
        print(f"  Contains spaces: {' ' in sample_pg}")
        if sample_pg != "NULL":
            print(f"  Parts: {sample_pg.split()}")

if __name__ == "__main__":
    debug_photo_matching()
