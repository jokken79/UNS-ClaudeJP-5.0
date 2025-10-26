"""
Importa candidatos REALES desde el Excel employee_master.xlsm con TODOS los datos disponibles
Mapea las 42 columnas del Excel a los campos del modelo Candidate
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
            keys = [k for k in record.keys() if record[k] is not None]
            if not keys:
                continue

            placeholders = ", ".join([f":{k}" for k in keys])
            columns = ", ".join(keys)

            sql = text(f"""
                INSERT INTO candidates ({columns})
                VALUES ({placeholders})
            """)
            # Filtrar solo las claves no-None
            params = {k: v for k, v in record.items() if v is not None}
            db.execute(sql, params)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al insertar batch: {str(e)}")
        raise


def parse_date(date_val):
    """Convierte valores de fecha"""
    if pd.isna(date_val):
        return None
    try:
        if isinstance(date_val, str):
            return pd.to_datetime(date_val).date()
        else:
            return date_val.date() if hasattr(date_val, 'date') else None
    except:
        return None


def import_candidates_full():
    """Importa candidatos con TODOS los campos disponibles del Excel"""

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
        print(f"  ✓ Total de registros a procesar: {len(df)}\n")

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
                    # Generar rirekisho_id único
                    rirekisho_id = f"RIR{candidates_created + 1:06d}"

                    # Extraer valores usando los nombres correctos de columnas
                    # Campos básicos (requeridos)
                    name_roman = str(row.get('氏名', "")).strip()
                    name_kana = str(row.get('カナ', "")).strip()
                    gender = str(row.get('性別', "")).strip()
                    nationality = str(row.get('国籍', "")).strip()

                    # Validaciones: saltar si no hay nombre
                    if not name_roman or name_roman == "nan":
                        continue

                    # Campos de dirección y ubicación
                    postal_code = str(row.get('〒', "")).strip()
                    address = str(row.get('住所', "")).strip()
                    apartment = str(row.get('ｱﾊﾟｰﾄ', "")).strip()

                    # Campos de fechas
                    birthdate = parse_date(row.get('生年月日'))
                    hire_date = parse_date(row.get('入社日'))
                    exit_date = parse_date(row.get('退社日'))
                    visa_expiry = parse_date(row.get('ビザ期限'))
                    move_in_date = parse_date(row.get('入居'))
                    move_out_date = parse_date(row.get('退去'))
                    license_expiry = parse_date(row.get('免許期限'))
                    voluntary_insurance_expiry = parse_date(row.get('任意保険期限'))

                    # Campos de estado y documentos
                    status_val = str(row.get('現在', "在職中")).strip()
                    status = "pending"
                    visa_type = str(row.get('ビザ種類', "")).strip()
                    license_type = str(row.get('免許種類', "")).strip()
                    commute_method = str(row.get('通勤方法', "")).strip()

                    # Campos adicionales
                    employee_num = row.get('社員№')
                    factory_name = str(row.get('派遣先', "")).strip()
                    department = str(row.get('配属先', "")).strip()
                    age = row.get('年齢')
                    salary_hourly = row.get('時給')
                    notes = str(row.get('備考', "")).strip()

                    # Limpiar valores NaN/nan
                    if nationality == "nan" or not nationality:
                        nationality = None
                    if gender == "nan" or not gender:
                        gender = None
                    if name_kana == "nan" or not name_kana:
                        name_kana = name_roman
                    if postal_code == "nan" or not postal_code:
                        postal_code = None
                    if address == "nan" or not address:
                        address = None
                    if apartment == "nan" or not apartment:
                        apartment = None
                    if visa_type == "nan" or not visa_type:
                        visa_type = None
                    if license_type == "nan" or not license_type:
                        license_type = None
                    if commute_method == "nan" or not commute_method:
                        commute_method = None
                    if notes == "nan" or not notes:
                        notes = None

                    # Preparar registro con TODOS los campos disponibles del modelo
                    record = {
                        'rirekisho_id': rirekisho_id,
                        'full_name_roman': name_roman,
                        'full_name_kanji': name_roman,  # Usar roman como kanji por ahora
                        'full_name_kana': name_kana,
                        'gender': gender,
                        'date_of_birth': birthdate,
                        'nationality': nationality,
                        'postal_code': postal_code,
                        'current_address': address,
                        'address': address,
                        'address_building': apartment,
                        'hire_date': hire_date,
                        'residence_status': visa_type if visa_type else "不明",
                        'residence_expiry': visa_expiry,
                        'license_number': license_type,
                        'license_expiry': license_expiry,
                        'car_ownership': None,
                        'voluntary_insurance': None,  # Usar "有" si expiry es no-null
                        'commute_method': commute_method,
                        'ocr_notes': notes,
                    }

                    # Agregar voluntar_insurance si tiene expiry
                    if voluntary_insurance_expiry:
                        record['voluntary_insurance'] = "有"

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

    count = import_candidates_full()
    print(f"\n{'=' * 60}")
    print(f"Total de candidatos importados: {count}")
    print(f"{'=' * 60}")
