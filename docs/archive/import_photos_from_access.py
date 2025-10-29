"""
Extrae fotos desde la base de datos Access y las vincula a los candidatos en PostgreSQL
Lee: ユニバーサル企画㈱データベースv25.3.24.accdb
Tabla: T_履歴書
Campo de foto: 写真 (100% de registros tienen foto)
"""
import sys
import os
import base64
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Access Database Configuration
ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"
ACCESS_TABLE = "T_履歴書"

# PostgreSQL Configuration from environment
POSTGRES_USER = os.getenv('POSTGRES_USER', 'uns_admin')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', '')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'uns_claudejp')
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Foto campo
PHOTO_FIELD = "写真"
NAME_FIELD = "名前"
ID_FIELD = "履歴書ID"


def connect_access():
    """Conecta a Access database"""
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        conn = pyodbc.connect(conn_str)
        print(f"Conectado a Access: {ACCESS_DB_PATH}\n")
        return conn
    except Exception as e:
        print(f"Error al conectar a Access: {e}")
        raise


def extract_photos_from_access():
    """Extrae fotos del Access y las vincula a los candidatos"""

    print("\n" + "=" * 100)
    print("EXTRAYENDO Y VINCULANDO FOTOS DESDE ACCESS")
    print("=" * 100 + "\n")

    access_conn = None
    postgres_engine = None

    try:
        # Conectar a Access
        access_conn = connect_access()
        cursor = access_conn.cursor()

        # Get total records
        cursor.execute(f"SELECT COUNT([{ID_FIELD}]) FROM [{ACCESS_TABLE}]")
        total = cursor.fetchone()[0]
        print(f"Total de registros en Access: {total}\n")

        # Query para obtener nombre y foto
        query = f"SELECT [{ID_FIELD}], [{NAME_FIELD}], [{PHOTO_FIELD}] FROM [{ACCESS_TABLE}]"
        try:
            cursor.execute(query)
        except Exception as e:
            # Intentar sin corchetes
            query = f"SELECT {ID_FIELD}, {NAME_FIELD}, {PHOTO_FIELD} FROM {ACCESS_TABLE}"
            cursor.execute(query)

        # Conectar a PostgreSQL
        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        photos_found = 0
        photos_updated = 0
        photos_not_found = 0
        photo_errors = 0
        processed = 0

        # Procesar fotos
        while True:
            row = cursor.fetchone()
            if not row:
                break

            try:
                processed += 1
                access_id = str(row[0]).strip() if row[0] else None
                name = str(row[1]).strip() if row[1] else None
                photo_path = str(row[2]).strip() if row[2] else None

                if not name or photo_path == "NULL" or not photo_path:
                    continue

                photos_found += 1

                # Intentar leer el archivo de foto
                photo_data_url = None
                if photo_path:
                    # Intentar leer como file path
                    possible_paths = [
                        photo_path,
                        f"D:\\{photo_path}",
                        f"C:\\{photo_path}",
                        f"D:\\photo\\{photo_path}",
                        f"D:\\photos\\{photo_path}",
                        f"D:\\candidates\\{photo_path}",
                    ]

                    for path in possible_paths:
                        if os.path.exists(path):
                            try:
                                with open(path, 'rb') as f:
                                    photo_bytes = f.read()
                                photo_base64 = base64.b64encode(photo_bytes).decode('utf-8')
                                photo_data_url = f"data:image/jpeg;base64,{photo_base64}"
                                break
                            except Exception as e:
                                continue

                # Si no encontro el archivo, intentar si el foto_path es base64
                if not photo_data_url and photo_path:
                    if photo_path.startswith('data:'):
                        photo_data_url = photo_path
                    elif photo_path.startswith('/') or 'base64' in photo_path.lower():
                        # Posible base64
                        photo_data_url = photo_path

                if photo_data_url:
                    # Vincular con el candidato en PostgreSQL usando el nombre
                    # Buscar candidato por full_name_roman que coincida con name
                    sql = text("""
                        UPDATE candidates
                        SET photo_data_url = :photo_data_url
                        WHERE full_name_roman = :name
                        AND photo_data_url IS NULL
                        LIMIT 1
                    """)

                    result = db.execute(sql, {
                        'photo_data_url': photo_data_url,
                        'name': name
                    })
                    db.commit()

                    if result.rowcount > 0:
                        photos_updated += 1
                    else:
                        # Intenta buscar por similar name
                        sql2 = text("""
                            UPDATE candidates
                            SET photo_data_url = :photo_data_url
                            WHERE similarity(full_name_roman, :name) > 0.7
                            AND photo_data_url IS NULL
                            LIMIT 1
                        """)
                        try:
                            result2 = db.execute(sql2, {
                                'photo_data_url': photo_data_url,
                                'name': name
                            })
                            db.commit()
                            if result2.rowcount > 0:
                                photos_updated += 1
                        except:
                            photos_not_found += 1

                    if photos_updated % 100 == 0:
                        print(f"  Procesados: {processed} | Fotos vinculadas: {photos_updated}")
                else:
                    photo_errors += 1

            except Exception as e:
                photo_errors += 1
                if photo_errors < 5:
                    print(f"  Error procesando foto de {name}: {str(e)[:50]}")
                continue

        print(f"\n" + "=" * 100)
        print(f"RESULTADOS")
        print("=" * 100 + "\n")
        print(f"Procesados desde Access:    {processed}")
        print(f"Fotos encontradas:          {photos_found}")
        print(f"Fotos vinculadas:           {photos_updated}")
        print(f"No encontradas en BD:       {photos_not_found}")
        print(f"Errores al leer foto:       {photo_errors}")
        print(f"\nPorcentaje de exito: {photos_updated * 100 // photos_found if photos_found > 0 else 0}%")

        return photos_updated

    except Exception as e:
        print(f"Error fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

    finally:
        if access_conn:
            access_conn.close()
        if postgres_engine:
            postgres_engine.dispose()


if __name__ == "__main__":
    print("\n" + "=" * 100)
    print("IMPORTADOR DE FOTOS DESDE ACCESS")
    print("=" * 100)

    count = extract_photos_from_access()

    print(f"\n{'=' * 100}")
    print(f"Total de fotos procesadas: {count}")
    print(f"{'=' * 100}\n")
