"""
Explora la estructura de la base de datos Access
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

# Access Database Configuration
ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"
ACCESS_TABLE = "T_履歴書"


def explore_access_db():
    """Explore Access database structure"""

    print("\n" + "=" * 100)
    print("EXPLORANDO BASE DE DATOS ACCESS")
    print("=" * 100 + "\n")

    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        conn = pyodbc.connect(conn_str)
        print(f"Conectado a: {ACCESS_DB_PATH}\n")

        cursor = conn.cursor()

        # Get column info
        cursor.execute(f"SELECT TOP 1 * FROM [{ACCESS_TABLE}]")
        columns = cursor.description

        print(f"Columnas en tabla '{ACCESS_TABLE}':")
        print(f"Total: {len(columns)}\n")
        for i, col in enumerate(columns, 1):
            col_name = col[0]
            col_type = col[1].__name__ if col[1] else "Unknown"
            print(f"{i:3d}. {col_name:30s} | Tipo: {col_type}")

        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM [{ACCESS_TABLE}]")
        total_rows = cursor.fetchone()[0]
        print(f"\nTotal de registros: {total_rows}")

        # Get sample row
        print(f"\n" + "=" * 100)
        print(f"MUESTRA DE DATOS (registro 1)")
        print("=" * 100 + "\n")

        cursor.execute(f"SELECT * FROM [{ACCESS_TABLE}]")
        row = cursor.fetchone()

        if row:
            for col, value in zip(columns, row):
                col_name = col[0]
                if value is None:
                    value_display = "[NULL]"
                elif isinstance(value, bytes):
                    value_display = f"[BYTES: {len(value)} bytes]"
                else:
                    value_str = str(value)[:80]
                    value_display = value_str
                print(f"{col_name:30s}: {value_display}")

        # Look for photo field
        print(f"\n" + "=" * 100)
        print(f"BUSCAR COLUMNA DE FOTO")
        print("=" * 100 + "\n")

        photo_cols = []
        for col in columns:
            col_name = col[0]
            if '写真' in col_name or 'photo' in col_name.lower() or 'image' in col_name.lower():
                photo_cols.append(col_name)

        if photo_cols:
            print(f"Columnas de foto encontradas: {photo_cols}")
            for col_name in photo_cols:
                cursor.execute(f"SELECT COUNT(*) FROM [{ACCESS_TABLE}] WHERE [{col_name}] IS NOT NULL")
                count_not_null = cursor.fetchone()[0]
                print(f"\nColumna '{col_name}':")
                print(f"  Registros con foto: {count_not_null} / {total_rows}")
                if count_not_null > 0:
                    print(f"  Porcentaje: {count_not_null * 100 // total_rows}%")
        else:
            print("No se encontro columna de foto")
            print("\nBuscando columna que contenga datos binarios...")

        # Look for ID field
        print(f"\n" + "=" * 100)
        print(f"CAMPOS IMPORTANTES")
        print("=" * 100 + "\n")

        id_field = None
        for col in columns:
            col_name = col[0]
            if '履歴書ID' in col_name or 'ID' in col_name:
                id_field = col_name
                print(f"Campo de ID encontrado: {id_field}")
                cursor.execute(f"SELECT [{id_field}] FROM [{ACCESS_TABLE}] LIMIT 5")
                for i, row in enumerate(cursor.fetchall(), 1):
                    print(f"  Muestra {i}: {row[0]}")
                break

        conn.close()

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    explore_access_db()
