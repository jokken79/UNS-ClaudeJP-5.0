"""
Listar todas las tablas en Access
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def list_tables():
    """List all tables in Access database"""

    print("\n" + "=" * 100)
    print("LISTANDO TODAS LAS TABLAS EN ACCESS")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        # Usar TableList método pyodbc
        tables = cursor.tables(tableType='TABLE')

        print("Tablas encontradas:\n")

        table_list = []
        for row in tables:
            table_name = row[2]  # TABLE_NAME es el 3er campo
            table_list.append(table_name)
            print(f"  - {table_name}")

        print(f"\nTotal: {len(table_list)} tablas")

        # Ahora buscar datos binarios en cada tabla
        print("\n" + "=" * 100)
        print("BUSCANDO DATOS BINARIOS EN TABLAS\n")

        for table_name in table_list:
            try:
                print(f"Tabla: {table_name}")

                cursor.execute(f"SELECT * FROM [{table_name}] WHERE 1=0")
                columns = cursor.description

                # Obtener primer registro
                cursor.execute(f"SELECT * FROM [{table_name}]")
                first_row = cursor.fetchone()

                if first_row:
                    has_binary = False
                    for col_idx, col in enumerate(columns):
                        value = first_row[col_idx]
                        if isinstance(value, bytes):
                            col_name = col[0]
                            print(f"  [{col_idx}] {col_name}: BINARIOS ({len(value)} bytes)")
                            has_binary = True

                    if not has_binary:
                        print(f"  (sin datos binarios)")

                print()

            except Exception as e:
                print(f"  Error: {str(e)[:60]}\n")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    list_tables()
