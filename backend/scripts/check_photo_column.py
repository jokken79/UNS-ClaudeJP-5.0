"""
Check what's actually in the photo column [8]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def check_photo_column():
    """Check photo column data"""

    print("\n" + "=" * 100)
    print("CHECKING PHOTO COLUMN [8]")
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

        photo_col_name = columns[8][0]
        print(f"Column [8] name: {photo_col_name}")
        print(f"Column [8] type: {columns[8][1]}\n")

        # Check first 20 records
        print("Sample data from column [8] (first 20 records):\n")

        cursor.execute("SELECT * FROM T_履歴書")
        for i, row in enumerate(cursor.fetchall()):
            if i < 20:
                photo_data = row[8]

                if photo_data is None:
                    display = "[NULL]"
                elif isinstance(photo_data, bytes):
                    display = f"[BYTES: {len(photo_data)} bytes]"
                else:
                    photo_str = str(photo_data)
                    if len(photo_str) > 100:
                        display = f"[STRING: {len(photo_str)} chars] {photo_str[:50]}..."
                    else:
                        display = f"[STRING: {len(photo_str)} chars] {photo_str}"

                print(f"  Record [{i:3d}]: {display}")

        # Count records with non-NULL photo data
        print("\n" + "=" * 100)
        print("STATISTICS:\n")

        cursor.execute("SELECT COUNT(*) FROM T_履歴書")
        total = cursor.fetchone()[0]

        cursor.execute(f"SELECT COUNT(*) FROM T_履歴書 WHERE [{photo_col_name}] IS NOT NULL")
        non_null = cursor.fetchone()[0]

        cursor.execute("SELECT * FROM T_履歴書")
        with_bytes = 0
        with_string = 0
        for row in cursor.fetchall():
            photo_data = row[8]
            if isinstance(photo_data, bytes):
                with_bytes += 1
            elif photo_data and not isinstance(photo_data, bytes):
                with_string += 1

        print(f"Total records: {total}")
        print(f"Records with photo data (not NULL): {non_null}")
        print(f"Records with binary photo data: {with_bytes}")
        print(f"Records with string photo data: {with_string}")

        if with_string > 0:
            print(f"\nString photo data found! Sample:")
            cursor.execute("SELECT * FROM T_履歴書")
            count = 0
            for row in cursor.fetchall():
                photo_data = row[8]
                if photo_data and not isinstance(photo_data, bytes):
                    photo_str = str(photo_data)[:100]
                    print(f"  {photo_str}")
                    count += 1
                    if count >= 3:
                        break

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    check_photo_column()
