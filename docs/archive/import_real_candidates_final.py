"""
Importa los candidatos REALES desde el Excel employee_master.xlsm
Lee la hoja '派遣社員' (Dispatch Employees) con todos los datos reales
"""
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
import openpyxl

sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.models import Candidate, CandidateStatus


def _insert_candidates_sql(db: Session, records: list):
    """Inserta candidatos usando SQL directo para evitar problemas con enum de SQLAlchemy"""
    if not records:
        return

    try:
        for record in records:
            sql = text("""
                INSERT INTO candidates (
                    rirekisho_id, full_name_roman, full_name_kanji, full_name_kana,
                    date_of_birth, nationality, gender, residence_status
                ) VALUES (
                    :rirekisho_id, :full_name_roman, :full_name_kanji, :full_name_kana,
                    :date_of_birth, :nationality, :gender, :residence_status
                )
            """)
            db.execute(sql, record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al insertar batch: {str(e)}")
        raise


def import_real_candidates():
    """Importa candidatos reales del archivo Excel"""

    excel_path = "/app/config/employee_master.xlsm"

    print(f"📂 Buscando archivo: {excel_path}")

    if not Path(excel_path).exists():
        print(f"\n  ⚠️  ADVERTENCIA: Archivo Excel no encontrado!")
        print(f"     Ruta esperada: {excel_path}")
        print(f"\n  📝 Para usar datos REALES:")
        print(f"     1. Copia el archivo 'employee_master.xlsm'")
        print(f"     2. Colócalo en: config/")
        print(f"     3. Ejecuta REINSTALAR.bat nuevamente")
        print(f"\n  ℹ️  Por ahora se importarán candidatos de DEMOSTRACIÓN")
        print(f"     (Puedes cambiar a datos reales después)\n")
        return 0

    try:
        # Leer la hoja '派遣社員' saltando la fila de título (fila 1)
        df = pd.read_excel(
            excel_path,
            sheet_name='派遣社員',
            header=1,  # La fila 2 (índice 1) tiene los encabezados
            skiprows=[0]  # Saltar la fila 1 (título)
        )

        print(f"  ✓ Datos cargados: {len(df)} registros")
        print(f"  📋 Columnas: {df.columns.tolist()}")

        # Mapeo de columnas esperadas
        col_status = '現在'  # Estado: 在職中 (empleado actual) o 退社 (retirado)
        col_name_romaji = '氏名'  # Nombre en romaji
        col_name_kana = 'カナ'  # Nombre en katakana
        col_gender = '性別'  # Género
        col_nationality = '国籍'  # Nacionalidad
        col_birthdate = '生年月日'  # Fecha nacimiento
        col_factory = '派遣先'  # Factory / Hakensaki

        # Filtrar solo empleados actuales (opcional: comentar para incluir todos)
        # df = df[df[col_status] == '在職中']

        print(f"  ✓ Total de registros a procesar: {len(df)}")

        db = SessionLocal()
        try:
            # Verificar si ya existen candidatos
            existing_count = db.query(Candidate).count()
            if existing_count > 0:
                print(f"\n  ⚠️  Ya existen {existing_count} candidatos en BD.")
                print(f"     Saltando importación para evitar duplicados.")
                return 0

            candidates_created = 0
            errors = 0
            batch_records = []

            for idx, row in df.iterrows():
                try:
                    # Extraer datos
                    name_romaji = str(row.get(col_name_romaji, "不明")).strip()
                    name_kana = str(row.get(col_name_kana, "")).strip()
                    birthdate_val = row.get(col_birthdate)
                    nationality = str(row.get(col_nationality, "")).strip()
                    gender = str(row.get(col_gender, "")).strip()
                    factory = str(row.get(col_factory, "")).strip()
                    status = str(row.get(col_status, "")).strip()

                    # Validaciones
                    if not name_romaji or name_romaji == "nan":
                        continue

                    # Procesar fecha de nacimiento
                    birthdate = None
                    if pd.notna(birthdate_val):
                        try:
                            if isinstance(birthdate_val, str):
                                birthdate = pd.to_datetime(birthdate_val).date()
                            else:
                                birthdate = birthdate_val.date() if hasattr(birthdate_val, 'date') else None
                        except:
                            pass

                    # Generar rirekisho_id único
                    rirekisho_id = f"RIR{candidates_created + 1:06d}"

                    # Preparar datos para inserción SQL directo
                    batch_records.append({
                        'rirekisho_id': rirekisho_id,
                        'full_name_roman': name_romaji,
                        'full_name_kanji': name_romaji,
                        'full_name_kana': name_kana if name_kana else name_romaji,
                        'date_of_birth': birthdate,
                        'nationality': nationality if nationality and nationality != "nan" else "不明",
                        'gender': gender if gender and gender != "nan" else None,
                        'residence_status': "特定技能第1号",
                    })

                    candidates_created += 1

                    # Insertar cada 50 registros usando SQL directo
                    if candidates_created % 50 == 0:
                        _insert_candidates_sql(db, batch_records)
                        print(f"  ✓ Procesados {candidates_created} candidatos...")
                        batch_records = []

                except Exception as e:
                    errors += 1
                    if errors < 5:  # Mostrar primeros 5 errores
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
            db.rollback()
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
    print("IMPORTANDO CANDIDATOS REALES DEL EXCEL")
    print("=" * 60)
    print()

    count = import_real_candidates()
    print(f"\n{'=' * 60}")
    print(f"Total de candidatos importados: {count}")
    print(f"{'=' * 60}")
