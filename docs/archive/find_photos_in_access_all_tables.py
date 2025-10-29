"""
Buscar fotos en TODAS las tablas de la base de datos Access
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"

def find_photos_in_all_tables():
    """Buscar fotos en todas las tablas"""

    print("\n" + "=" * 100)
    print("BUSCANDO FOTOS EN TODAS LAS TABLAS DE ACCESS")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        # Obtener todas las tablas
        print("Obteniendo lista de tablas...\n")

        cursor.execute("SELECT name FROM sys.objects WHERE type='U' ORDER BY name")
        try:
            tables = cursor.fetchall()
        except:
            # Método alternativo
            cursor.execute(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
            )
            tables = cursor.fetchall()

        print(f"Tablas encontradas: {len(tables)}\n")

        # Iterar cada tabla
        for table_tuple in tables:
            table_name = table_tuple[0]
            print(f"Analizando tabla: {table_name}")

            try:
                # Obtener columnas de esta tabla
                cursor.execute(f"SELECT * FROM [{table_name}] WHERE 1=0")
                columns = cursor.description

                # Buscar columnas que podrían contener fotos (binarias)
                binary_cols = []
                for i, col in enumerate(columns):
                    col_name = col[0]
                    col_type = col[1]

                    # Buscar por nombre o tipo
                    if any(kw in str(col_name).lower() for kw in ['photo', 'image', 'pic', '写真', '画像']):
                        binary_cols.append((i, col_name, col_type))

                if binary_cols:
                    print(f"  Columnas con foto encontradas:")
                    for idx, name, col_type in binary_cols:
                        print(f"    [{idx}] {name} (Type: {col_type})")

                    # Obtener datos de esta tabla
                    cursor.execute(f"SELECT COUNT(*) FROM [{table_name}]")
                    row_count = cursor.fetchone()[0]
                    print(f"  Total registros: {row_count}")

                    # Ver primeros datos
                    cursor.execute(f"SELECT * FROM [{table_name}]")
                    first_row = cursor.fetchone()

                    if first_row:
                        for col_idx, col_name, _ in binary_cols:
                            value = first_row[col_idx]
                            if value:
                                if isinstance(value, bytes):
                                    print(f"    [{col_idx}] {col_name}: DATOS BINARIOS ({len(value)} bytes)")
                                else:
                                    val_str = str(value)[:80]
                                    print(f"    [{col_idx}] {col_name}: {val_str}")

                    print()

            except Exception as e:
                print(f"  Error: {str(e)[:60]}\n")
                continue

        # También buscar en T_履歴書 qué columnas tienen datos binarios
        print("\n" + "=" * 100)
        print("ANÁLISIS DETALLADO DE T_履歴書\n")

        cursor.execute("SELECT * FROM T_履歴書")
        columns = cursor.description

        print(f"Total columnas: {len(columns)}\n")
        print("Buscando columnas con datos binarios...\n")

        cursor.execute("SELECT * FROM T_履歴書")
        first_rows = []
        for i, row in enumerate(cursor.fetchall()):
            first_rows.append(row)
            if i >= 5:
                break

        for col_idx, col in enumerate(columns):
            col_name = col[0]
            col_type = col[1]

            # Revisar si algún registro tiene datos binarios
            has_binary = False
            for row in first_rows:
                if isinstance(row[col_idx], bytes):
                    has_binary = True
                    break

            if has_binary:
                print(f"  Column [{col_idx}] {col_name}: BINARIA")
                # Mostrar tamaño del primer dato binario
                for row in first_rows:
                    if isinstance(row[col_idx], bytes):
                        print(f"    Primer registro: {len(row[col_idx])} bytes")
                        break

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    find_photos_in_all_tables()
