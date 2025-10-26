"""
Extrae fotos del Access usando índices de columna
Posición 2: 名前 (nombre)
Posición 8: 写真 (foto)
"""
import sys
import os
import base64
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pyodbc
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

ACCESS_DB_PATH = r"D:\ユニバーサル企画㈱データベースv25.3.24.accdb"
POSTGRES_URL = "postgresql://uns_admin:57UD10R@localhost:5432/uns_claudejp"


def extract_photos():
    """Extrae fotos del Access usando índices"""

    print("\nEXTRAYENDO FOTOS DESDE ACCESS\n")
    print("=" * 100 + "\n")

    access_conn = None
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={ACCESS_DB_PATH};'
        )
        access_conn = pyodbc.connect(conn_str)
        cursor = access_conn.cursor()

        print(f"Conectado a Access\n")

        # Obtener datos
        cursor.execute("SELECT * FROM T_履歴書")

        # Índices basados en exploración anterior
        NAME_IDX = 2       # Nombre
        PHOTO_IDX = 8      # Foto

        processed = 0
        updated = 0
        errors = 0

        postgres_engine = create_engine(POSTGRES_URL)
        Session = sessionmaker(bind=postgres_engine)
        db = Session()

        print(f"Procesando fotos...")
        print(f"Usando columna de nombre (indice {NAME_IDX})")
        print(f"Usando columna de foto (indice {PHOTO_IDX})\n")

        for row in cursor.fetchall():
            processed += 1

            try:
                # Extraer valores
                name = str(row[NAME_IDX]).strip() if row[NAME_IDX] else None
                photo_data = row[PHOTO_IDX]

                if not name or not photo_data:
                    continue

                # Convertir a base64 si es bytes
                photo_data_url = None

                if isinstance(photo_data, bytes):
                    try:
                        photo_base64 = base64.b64encode(photo_data).decode('utf-8')
                        photo_data_url = f"data:image/jpeg;base64,{photo_base64}"
                    except Exception as e:
                        errors += 1
                        continue

                elif isinstance(photo_data, str):
                    photo_str = str(photo_data).strip()
                    if photo_str.startswith('data:'):
                        photo_data_url = photo_str

                if photo_data_url:
                    # Actualizar en PostgreSQL
                    try:
                        sql = text("""
                            UPDATE candidates
                            SET photo_data_url = :photo_data_url
                            WHERE full_name_roman = :name AND photo_data_url IS NULL
                            LIMIT 1
                        """)

                        result = db.execute(sql, {
                            'photo_data_url': photo_data_url,
                            'name': name
                        })
                        db.commit()

                        if result.rowcount > 0:
                            updated += 1

                    except Exception as e:
                        db.rollback()
                        errors += 1

                if processed % 200 == 0:
                    print(f"  Procesados: {processed:4d} | Fotos vinculadas: {updated:4d}")

            except Exception as e:
                errors += 1
                continue

        print(f"\n" + "=" * 100)
        print(f"\nRESULTADOS:")
        print(f"  Total procesados:      {processed}")
        print(f"  Fotos vinculadas:      {updated}")
        print(f"  Errores:               {errors}")

        db.close()
        return updated

    except Exception as e:
        print(f"Error fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

    finally:
        if access_conn:
            access_conn.close()


if __name__ == "__main__":
    count = extract_photos()
    print(f"\n{'=' * 100}\n")
