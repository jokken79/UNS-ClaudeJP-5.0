"""
Properly explore Access database columns to find name and photo fields
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def explore_columns():
    """Explore Access database to find correct columns"""

    print("\n" + "=" * 120)
    print("EXPLORING ACCESS DATABASE COLUMNS")
    print("=" * 120 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        print("Conectado a Access database successfully\n")

        # Get all column names and types
        cursor.execute("SELECT * FROM T_履歴書")
        columns = cursor.description

        print(f"Total columns in T_履歴書: {len(columns)}\n")
        print("Column List:")
        print("-" * 120)

        for i, col in enumerate(columns):
            col_name = col[0]
            col_type = col[1].__name__ if col[1] else "Unknown"
            print(f"  [{i:2d}] {col_name:30s} | Type: {col_type}")

        # Get first row to see data samples
        print("\n" + "=" * 120)
        print("SAMPLE DATA (First Row):")
        print("=" * 120 + "\n")

        cursor.execute("SELECT * FROM T_履歴書")
        row = cursor.fetchone()

        if row:
            for i, col in enumerate(columns):
                col_name = col[0]
                value = row[i]

                # Format display
                if value is None:
                    display = "[NULL]"
                elif isinstance(value, bytes):
                    display = f"[BINARY DATA: {len(value)} bytes]"
                else:
                    value_str = str(value)[:100]
                    display = value_str

                print(f"  [{i:2d}] {col_name:30s} = {display}")

        # Look for likely name and photo columns
        print("\n" + "=" * 120)
        print("IDENTIFIED IMPORTANT COLUMNS:")
        print("=" * 120 + "\n")

        name_candidates = []
        photo_candidates = []

        for i, col in enumerate(columns):
            col_name = col[0]

            # Look for name columns
            if any(keyword in col_name for keyword in ['名前', '氏名', 'Name', '名義', 'ナーム']):
                name_candidates.append((i, col_name))
                print(f"  Name column found: [{i}] {col_name}")

            # Look for photo columns
            if any(keyword in col_name for keyword in ['写真', 'Photo', 'Image', '画像', 'Picture']):
                photo_candidates.append((i, col_name))
                print(f"  Photo column found: [{i}] {col_name}")

        if not name_candidates:
            print("  WARNING: No obvious name column found!")

        if not photo_candidates:
            print("  WARNING: No obvious photo column found!")

        # Check for binary data columns (likely photos)
        print("\n" + "=" * 120)
        print("CHECKING FOR BINARY DATA COLUMNS:")
        print("=" * 120 + "\n")

        cursor.execute("SELECT * FROM T_履歴書")
        row = cursor.fetchone()

        binary_columns = []
        for i, col in enumerate(columns):
            value = row[i]
            if isinstance(value, bytes):
                binary_columns.append((i, col[0], len(value)))
                print(f"  Binary data found at column [{i}] {col[0]}: {len(value)} bytes")

        # Summary
        print("\n" + "=" * 120)
        print("SUMMARY:")
        print("=" * 120 + "\n")

        print(f"Total columns: {len(columns)}")
        print(f"Name candidates: {len(name_candidates)}")
        for idx, name in name_candidates:
            print(f"  -> Column [{idx}] {name}")

        print(f"\nPhoto candidates: {len(photo_candidates)}")
        for idx, name in photo_candidates:
            print(f"  -> Column [{idx}] {name}")

        print(f"\nBinary columns (likely photos): {len(binary_columns)}")
        for idx, name, size in binary_columns:
            print(f"  -> Column [{idx}] {name} ({size} bytes)")

        # Get some actual sample names from different columns to help identify
        print("\n" + "=" * 120)
        print("SAMPLE DATA FROM POTENTIAL NAME COLUMNS:")
        print("=" * 120 + "\n")

        for name_idx, name_col in name_candidates[:3]:
            print(f"\nColumn [{name_idx}] {name_col} (first 5 values):")
            cursor.execute("SELECT * FROM T_履歴書")
            for i, row in enumerate(cursor.fetchall()):
                if i < 5:
                    value = row[name_idx]
                    display = str(value)[:80] if value else "[NULL]"
                    print(f"  [{i}] {display}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    explore_columns()
