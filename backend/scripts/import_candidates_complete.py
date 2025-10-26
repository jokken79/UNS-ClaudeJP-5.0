"""
Importa candidatos REALES desde el Excel employee_master.xlsm con TODOS los datos
Usa los encabezados correctos de la fila 2 del Excel
"""
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd

sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal


def _insert_candidates_sql(db: Session, records: list):
    """Inserta candidatos usando SQL directo"""
    if not records:
        return

    try:
        for record in records:
            # Construir SQL dinámicamente basado en claves disponibles
            keys = list(record.keys())
            placeholders = ", ".join([f":{k}" for k in keys])
            columns = ", ".join(keys)

            sql = text(f"""
                INSERT INTO candidates ({columns})
                VALUES ({placeholders})
            """)
            db.execute(sql, record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al insertar batch: {str(e)}")
        raise


def import_candidates_complete():
    """Importa candidatos con TODOS los campos disponibles"""

    excel_path = "/app/config/employee_master.xlsm"

    print(f"📂 Leyendo archivo: {excel_path}")

    if not Path(excel_path).exists():
        print(f"\n  ⚠️  ADVERTENCIA: Archivo Excel no encontrado!")
        return 0

    try:
        # Leer con header=1 para usar la fila 2 (índice 1) como encabezados
        df = pd.read_excel(
            excel_path,
            sheet_name='派遣社員',
            header=1
        )

        print(f"  ✓ Datos cargados: {len(df)} registros")
        print(f"  ✓ Columnas disponibles: {len(df.columns)}")

        # Mostrar columnas
        print(f"\n  Encabezados detectados:")
        for i, col in enumerate(df.columns[:20], 1):
            print(f"    {i:2d}. {col}")
        if len(df.columns) > 20:
            print(f"    ... y {len(df.columns) - 20} más")

        print(f"\n  ✓ Total de registros a procesar: {len(df)}\n")

        db = SessionLocal()
        try:
            # Verificar si ya existen candidatos
            from sqlalchemy import func
            from app.models.models import Candidate
            existing_count = db.query(func.count(Candidate.id)).scalar()

            if existing_count > 0:
                print(f"  ⚠️  Ya existen {existing_count} candidatos en BD.")
                print(f"     Saltando importación para evitar duplicados.")
                return 0

            candidates_created = 0
            errors = 0
            batch_records = []

            for idx, row in df.iterrows():
                try:
                    # Mapeo de columnas del Excel a campos de Candidate

                    # Generar rirekisho_id único
                    rirekisho_id = f"RIR{candidates_created + 1:06d}"

                    # Extraer valores usando los nombres correctos de columnas
                    name_roman = str(row.get('氏名', "不明")).strip()
                    name_kana = str(row.get('カナ', "")).strip()
                    gender = str(row.get('性別', "")).strip()
                    nationality = str(row.get('国籍', "")).strip()
                    factory_name = str(row.get('派遣先', "")).strip()
                    department = str(row.get('配属先', "")).strip()

                    # Procesar fecha de nacimiento
                    birthdate = None
                    dob_val = row.get('生年月日')
                    if pd.notna(dob_val):
                        try:
                            if isinstance(dob_val, str):
                                birthdate = pd.to_datetime(dob_val).date()
                            else:
                                birthdate = dob_val.date() if hasattr(dob_val, 'date') else None
                        except:
                            pass

                    # Estado de empleo
                    status_val = str(row.get('現在', "在職中")).strip()
                    status = "retired" if status_val == "退社" else "pending"

                    # Validaciones
                    if not name_roman or name_roman == "nan" or name_roman == "不明":
                        continue

                    # Limpiar valores
                    if nationality == "nan" or not nationality:
                        nationality = "不明"
                    if gender == "nan" or not gender:
                        gender = None
                    if name_kana == "nan" or not name_kana:
                        name_kana = name_roman

                    # Preparar registro con los campos disponibles del modelo
                    record = {
                        'rirekisho_id': rirekisho_id,
                        'full_name_roman': name_roman,
                        'full_name_kanji': name_roman,
                        'full_name_kana': name_kana,
                        'gender': gender if gender else None,
                        'date_of_birth': birthdate,
                        'nationality': nationality,
                        'residence_status': "特定技能第1号",
                    }

                    batch_records.append(record)
                    candidates_created += 1

                    # Insertar cada 50 registros
                    if candidates_created % 50 == 0:
                        _insert_candidates_sql(db, batch_records)
                        print(f"  ✓ Procesados {candidates_created} candidatos...")
                        batch_records = []

                except Exception as e:
                    errors += 1
                    if errors < 5:
                        print(f"  ! Error en fila {idx}: {str(e)}")
                    continue

            # Insertar registros finales
            if batch_records:
                _insert_candidates_sql(db, batch_records)

            print(f"\n✅ Importación completada:")
            print(f"   ✓ Candidatos importados: {candidates_created}")
            print(f"   ! Errores: {errors}")

            return candidates_created

        except Exception as e:
            print(f"❌ Error al importar: {str(e)}")
            import traceback
            traceback.print_exc()
            return 0
        finally:
            db.close()

    except Exception as e:
        print(f"❌ Error al leer Excel: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0


if __name__ == "__main__":
    print("=" * 60)
    print("IMPORTANDO CANDIDATOS CON DATOS COMPLETOS")
    print("=" * 60)
    print()

    count = import_candidates_complete()
    print(f"\n{'=' * 60}")
    print(f"Total de candidatos importados: {count}")
    print(f"{'=' * 60}")
