"""
Script simplificado para extraer fotos del Access
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


def extract_photos():
    """Extrae fotos del Access"""

    print("\n" + "=" * 100)
    print("EXTRAYENDO FOTOS DESDE ACCESS")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        # Conectar a Access
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        print(f"Conectado a Access\n")

        # Query simple - obtener todos los datos
        cursor.execute("SELECT * FROM T_履歴書")
        columns = [desc[0] for desc in cursor.description]

        print(f"Columnas disponibles: {len(columns)}")
        print(f"\nBuscando columnas de nombre y foto...")

        # Encontrar indices
        photo_col_idx = None
        name_col_idx = None

        for i, col in enumerate(columns):
            if '写真' in col:
                photo_col_idx = i
                print(f"  Columna de foto encontrada: {i}. {col}")
            if col == '名前':
                name_col_idx = i
                print(f"  Columna de nombre encontrada: {i}. {col}")

        if photo_col_idx is None or name_col_idx is None:
            print("Error: No se encontraron columnas de foto o nombre")
            return 0

        # Procesar fotos
        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        processed = 0
        updated = 0

        cursor.execute("SELECT * FROM T_履歴書")
        for row in cursor.fetchall():
            processed += 1

            name = str(row[name_col_idx]).strip() if row[name_col_idx] else None
            photo_info = row[photo_col_idx]

            if not name:
                continue

            # El campo de foto puede ser un path o datos binarios
            if isinstance(photo_info, bytes):
                # Es datos binarios - convertir a base64
                try:
                    photo_base64 = base64.b64encode(photo_info).decode('utf-8')
                    photo_data_url = f"data:image/jpeg;base64,{photo_base64}"

                    # Actualizar candidato en PostgreSQL
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

                except Exception as e:
                    pass

            elif photo_info:
                # Es un string - podría ser path o ya base64
                photo_info_str = str(photo_info).strip()

                if photo_info_str.startswith('data:'):
                    # Ya es base64
                    try:
                        sql = text("""
                            UPDATE candidates
                            SET photo_data_url = :photo_data_url
                            WHERE full_name_roman = :name AND photo_data_url IS NULL
                        """)

                        result = db.execute(sql, {
                            'photo_data_url': photo_info_str,
                            'name': name
                        })
                        db.commit()

                        if result.rowcount > 0:
                            updated += 1
                    except:
                        pass

            if processed % 200 == 0:
                print(f"  Procesados: {processed} | Actualizados: {updated}")

        print(f"\n" + "=" * 100)
        print(f"RESULTADOS")
        print("=" * 100)
        print(f"Total procesados: {processed}")
        print(f"Fotos vinculadas: {updated}")

        db.close()
        return updated

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 0

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    count = extract_photos()
    print(f"\n{'=' * 100}\n")
