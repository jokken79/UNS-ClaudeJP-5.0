"""
Debug script to understand the photo extraction matching issue
Extracts both Access names and PostgreSQL names and compares them
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


def debug_extraction():
    """Debug the photo extraction matching issue"""

    print("\n" + "=" * 100)
    print("DEBUG: PHOTO EXTRACTION NAME MATCHING")
    print("=" * 100 + "\n")

    # Step 1: Get Access names
    print("Step 1: Extracting names from Access database...")
    access_names = []
    access_conn = None

    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        cursor.execute("SELECT * FROM T_履歴書")

        # Get first 50 names
        for i, row in enumerate(cursor.fetchall()):
            if i < 50:
                try:
                    name = str(row[2]).strip() if row[2] else "NULL"
                    access_names.append(name)
                except:
                    access_names.append("ERROR")
            else:
                break

        print(f"  Extracted {len(access_names)} Access names\n")

    except Exception as e:
        print(f"Error reading Access: {e}\n")
        return
    finally:
        if access_conn:
            access_conn.close()

    # Step 2: Get PostgreSQL names
    print("Step 2: Extracting names from PostgreSQL...")
    pg_names = []

    try:
        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        result = db.execute(text("""
            SELECT full_name_roman
            FROM candidates
            ORDER BY id
            LIMIT 100
        """))

        pg_names = [row[0] if row[0] else "NULL" for row in result.fetchall()]
        print(f"  Extracted {len(pg_names)} PostgreSQL names\n")
        db.close()

    except Exception as e:
        print(f"Error reading PostgreSQL: {e}\n")
        return

    # Step 3: Detailed comparison
    print("=" * 100)
    print("COMPARISON ANALYSIS\n")

    print("Sample Access names (first 10):")
    for i, name in enumerate(access_names[:10]):
        print(f"  [{i}] '{name}'")

    print("\nSample PostgreSQL names (first 10):")
    for i, name in enumerate(pg_names[:10]):
        print(f"  [{i}] '{name}'")

    # Check for exact matches
    print("\n" + "=" * 100)
    print("EXACT MATCHING ANALYSIS\n")

    pg_set = set(pg_names)
    exact_matches = 0

    for access_name in access_names:
        if access_name in pg_set:
            exact_matches += 1
            print(f"  MATCH: '{access_name}'")

    print(f"\nExact matches found: {exact_matches}/{len(access_names)}")

    # Check for case-insensitive matches
    print("\n" + "=" * 100)
    print("CASE-INSENSITIVE MATCHING ANALYSIS\n")

    pg_lower_map = {name.lower(): name for name in pg_names if name != "NULL"}
    case_matches = 0

    for access_name in access_names:
        if access_name.lower() in pg_lower_map:
            case_matches += 1

    print(f"Case-insensitive matches: {case_matches}/{len(access_names)}")

    # Save analysis to file for manual inspection
    print("\n" + "=" * 100)
    print("Saving detailed analysis to file...\n")

    with open("/tmp/photo_debug.txt", "w", encoding="utf-8") as f:
        f.write("PHOTO EXTRACTION DEBUG ANALYSIS\n")
        f.write("=" * 100 + "\n\n")

        f.write("ACCESS NAMES (first 50):\n")
        for i, name in enumerate(access_names):
            f.write(f"  [{i:3d}] '{name}'\n")

        f.write("\n\nPOSTGRESQL NAMES (first 100):\n")
        for i, name in enumerate(pg_names):
            f.write(f"  [{i:3d}] '{name}'\n")

        f.write(f"\n\nSTATISTICS:\n")
        f.write(f"Access names: {len(access_names)}\n")
        f.write(f"PostgreSQL names: {len(pg_names)}\n")
        f.write(f"Exact matches: {exact_matches}\n")
        f.write(f"Case-insensitive matches: {case_matches}\n")

    print("Analysis saved to /tmp/photo_debug.txt")

    # Recommendations
    print("\n" + "=" * 100)
    print("RECOMMENDATIONS:\n")

    if exact_matches == 0:
        print("NO EXACT MATCHES FOUND!")
        print("\nPossible causes:")
        print("  1. Names in Access are in different format (e.g., last name first vs first name first)")
        print("  2. Names have different spacing or special characters")
        print("  3. Names are stored differently (kanji vs hiragana/katakana)")
        print("  4. Column indices might be wrong")
        print("\nSuggestion: Check if using different matching strategy:")
        print("  - Match by Employee ID instead of name")
        print("  - Use fuzzy string matching (levenshtein distance)")
        print("  - Check if names need preprocessing (remove extra spaces, etc)")
    else:
        print(f"Found {exact_matches} exact matches out of {len(access_names)} Access records")
        print(f"Success rate: {(exact_matches * 100) // len(access_names)}%")


if __name__ == "__main__":
    debug_extraction()
