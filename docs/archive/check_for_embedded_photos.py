"""
Check if photos are embedded as OLE objects in Access database
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def check_for_embedded_photos():
    """Check all columns for binary photo data (OLE objects)"""

    print("\n" + "=" * 100)
    print("CHECKING FOR EMBEDDED PHOTOS IN ALL COLUMNS")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        # Get column info
        cursor.execute("SELECT * FROM T_履歴書")
        columns = cursor.description

        print(f"Scanning {len(columns)} columns for binary data...\n")

        # Check first row for binary data in all columns
        cursor.execute("SELECT * FROM T_履歴書")
        row = cursor.fetchone()

        if row:
            print("First record binary data check:")
            print("-" * 100)

            binary_cols = []
            for i, col in enumerate(columns):
                col_name = col[0]
                value = row[i]

                if isinstance(value, bytes):
                    binary_cols.append((i, col_name, len(value)))
                    print(f"  [{i:3d}] {col_name:30s} = BINARY ({len(value)} bytes)")

            if binary_cols:
                print(f"\nFound {len(binary_cols)} binary columns")

                # Check statistics on each binary column
                print(f"\nBinary column statistics:")
                for col_idx, col_name, _ in binary_cols:
                    cursor.execute("SELECT * FROM T_履歴書")
                    non_null_count = 0
                    size_list = []

                    for row in cursor.fetchall():
                        if isinstance(row[col_idx], bytes):
                            non_null_count += 1
                            size_list.append(len(row[col_idx]))

                    if non_null_count > 0:
                        avg_size = sum(size_list) // len(size_list)
                        max_size = max(size_list)
                        min_size = min(size_list)

                        print(f"  Column [{col_idx}] {col_name}:")
                        print(f"    Records with data: {non_null_count}")
                        print(f"    Avg size: {avg_size} bytes")
                        print(f"    Min size: {min_size} bytes")
                        print(f"    Max size: {max_size} bytes")
            else:
                print("No binary columns found in first record")

        # Also check if column [8] might contain compressed/encoded photo data
        print(f"\n" + "=" * 100)
        print("DETAILED ANALYSIS OF COLUMN [8] (Photo field):\n")

        cursor.execute("SELECT * FROM T_履歴書")
        photos_count = 0
        sample_photos = []

        for row in cursor.fetchall():
            photo_data = row[8]

            if photo_data:
                photos_count += 1
                if len(sample_photos) < 10:
                    if isinstance(photo_data, bytes):
                        sample_photos.append(f"[BINARY {len(photo_data)} bytes]")
                    else:
                        photo_str = str(photo_data)[:80]
                        sample_photos.append(photo_str)

        print(f"Records with photo data in column [8]: {photos_count}")
        print(f"\nSample photo data (first 10):")
        for i, photo in enumerate(sample_photos):
            print(f"  [{i}] {photo}")

        # Check for other tables that might contain photos
        print(f"\n" + "=" * 100)
        print("CHECKING FOR OTHER TABLES IN DATABASE:\n")

        # Get all tables
        cursor.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
        )
        try:
            tables = cursor.fetchall()
            print(f"Tables in database:")
            for table in tables:
                print(f"  - {table[0]}")
        except:
            # Fallback method
            print("Could not query system tables")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    check_for_embedded_photos()
