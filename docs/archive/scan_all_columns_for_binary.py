"""
Escanear TODAS las columnas de T_履歴書 para encontrar datos binarios
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def scan_all_columns():
    """Escanear todas las columnas para datos binarios"""

    print("\n" + "=" * 100)
    print("ESCANEANDO TODAS LAS COLUMNAS DE T_履歴書 PARA DATOS BINARIOS")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        # Obtener todas las columnas
        cursor.execute("SELECT * FROM T_履歴書")
        columns = cursor.description

        print(f"Total columnas: {len(columns)}\n")

        # Obtener registros
        cursor.execute("SELECT * FROM T_履歴書")
        all_rows = cursor.fetchall()

        # Escanear cada columna
        binary_columns = {}

        for col_idx, col in enumerate(columns):
            col_name = col[0]
            col_type = col[1]

            # Escanear primeros 10 registros de esta columna
            has_binary = False
            sample_value = None

            for row_idx, row in enumerate(all_rows[:10]):
                value = row[col_idx]

                if isinstance(value, bytes):
                    has_binary = True
                    binary_columns[col_idx] = {
                        'name': col_name,
                        'type': str(col_type),
                        'size': len(value)
                    }
                    sample_value = value
                    break

            if has_binary:
                print(f"[{col_idx:3d}] {col_name:30s} = BINARIO ({len(sample_value)} bytes)")

        if not binary_columns:
            print("NO SE ENCONTRARON DATOS BINARIOS")

        # Información adicional
        print(f"\n" + "=" * 100)
        print("RESUMEN\n")

        print(f"Columnas con datos binarios: {len(binary_columns)}")

        if binary_columns:
            print("\nDetalles:")
            for col_idx, info in binary_columns.items():
                print(f"  [{col_idx}] {info['name']}")
                print(f"      Type: {info['type']}")
                print(f"      Size: {info['size']} bytes")

        else:
            print("\nLas fotos podrían estar:")
            print("  - En una tabla diferente")
            print("  - Como referencias de archivo (strings)")
            print("  - En compresión/formato especial")
            print("  - Fuera de la base de datos")

            # Mostrar información de la columna [8] nuevamente
            print(f"\n" + "=" * 100)
            print("INFORMACIÓN DE COLUMNA [8] (写真):\n")

            cursor.execute("SELECT * FROM T_履歴書")
            col_8_values = []

            for row_idx, row in enumerate(cursor.fetchall()):
                val = row[8]
                if val:
                    val_str = str(val)
                    col_8_values.append((row_idx, val_str, type(val).__name__))

            print(f"Registros con datos en columna [8]: {len(col_8_values)}\n")

            print("Primeros 20 valores:")
            for row_idx, val, val_type in col_8_values[:20]:
                print(f"  Row[{row_idx}] ({val_type}): {val[:60]}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    scan_all_columns()
