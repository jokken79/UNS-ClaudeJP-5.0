"""
Script to import factory and employee data to PostgreSQL
"""
import json
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
import re
import unicodedata

# Add parent directory to path
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Factory, Employee, ContractWorker, Staff, SocialInsuranceRate


def normalize_text(text: str) -> str:
    """
    Normalize Japanese text for better matching:
    - Convert to lowercase
    - Remove extra whitespace
    - Normalize unicode (半角/全角)
    - Remove common suffixes
    """
    if not text:
        return ""

    # Normalize unicode characters (NFKC handles 半角/全角)
    text = unicodedata.normalize('NFKC', text)

    # Convert to lowercase (for ASCII)
    text = text.lower()

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Remove common company suffixes for better matching
    suffixes = ['株式会社', '(株)', '有限会社', '(有)']
    for suffix in suffixes:
        text = text.replace(suffix, '')

    return text.strip()


def get_manual_factory_mapping():
    """
    Manual mapping for factory names that require special handling.
    UPDATED: Using new factory_id format with double underscore (Company__Plant)
    CVJ and HUB factories consolidated into 岡山工場
    """
    return {
        # 高雄工業 factories
        '高雄工業 本社': '高雄工業株式会社__本社工場',
        '高雄工業 岡山': '高雄工業株式会社__岡山工場',  # Consolidated
        '高雄工業 静岡': '高雄工業株式会社__本社工場',
        '高雄工業 海南第一': '高雄工業株式会社__海南第一工場',
        '高雄工業 海南第二': '高雄工業株式会社__海南第二工場',
        '高雄工業 第一': '高雄工業株式会社__第一工場',
        '高雄工業 第二': '高雄工業株式会社__第二工場',
        '高雄工業 CVJ': '高雄工業株式会社__岡山工場',  # Consolidated
        '高雄工業 HUB': '高雄工業株式会社__岡山工場',  # Consolidated
        # Other factories
        'ﾌｪﾆﾃｯｸｾﾐｺﾝﾀﾞｸﾀｰ 岡山': 'フェニテックセミコンダクター(株)__鹿児島工場',
        'ﾌｪﾆﾃｯｸｾﾐｺﾝﾀﾞｸﾀｰ 鹿児島': 'フェニテックセミコンダクター(株)__鹿児島工場',
        'オーツカ': '株式会社オーツカ__関ケ原工場',
        'アサヒフォージ': 'アサヒフォージ株式会社__真庭工場',
        '瑞陵精機': '瑞陵精機株式会社__恵那工場',
        '加藤木材 本社': '加藤木材工業株式会社__本社工場',
        '加藤木材 春日井': '加藤木材工業株式会社__春日井工場',
        'ユアサ工機 本社': 'ユアサ工機株式会社__本社工場',
        'ユアサ工機 新城': 'ユアサ工機株式会社__新城工場',
    }


def find_factory_match(factory_name_excel: str, db: Session) -> str:
    """
    Find the best matching factory in the database using multiple strategies.

    Strategies (in order):
    0. Manual mapping (for known problematic cases)
    1. Exact match (normalized)
    2. Bidirectional substring match (Excel name in DB or vice versa)
    3. Word-based matching (split by spaces, match significant words)

    Args:
        factory_name_excel: Factory name from Excel file
        db: Database session

    Returns:
        factory_id if match found, None otherwise
    """
    if not factory_name_excel:
        return None

    excel_norm = normalize_text(factory_name_excel)

    # Strategy 0: Check manual mapping first
    manual_map = get_manual_factory_mapping()
    for excel_pattern, factory_id in manual_map.items():
        if normalize_text(excel_pattern) == excel_norm or normalize_text(excel_pattern) in excel_norm:
            # Verify the factory exists
            factory = db.query(Factory).filter(Factory.factory_id == factory_id).first()
            if factory:
                return factory.factory_id

    # Get all factories from DB (cache this if performance is an issue)
    all_factories = db.query(Factory).all()

    # Strategy 1: Exact match (normalized)
    for factory in all_factories:
        db_norm = normalize_text(factory.name)
        if excel_norm == db_norm:
            return factory.factory_id

    # Strategy 2: Bidirectional substring match
    for factory in all_factories:
        db_norm = normalize_text(factory.name)

        # Check if Excel name is in DB name (e.g., "ユアサ工機 本社" in "ユアサ工機株式会社 - 本社工場")
        if excel_norm in db_norm:
            return factory.factory_id

        # Check if DB name is in Excel name (rare but possible)
        if db_norm in excel_norm:
            return factory.factory_id

    # Strategy 3: Word-based matching for Japanese factories
    # Split both names into words and check if key words match
    excel_words = set(excel_norm.split())

    best_match = None
    best_score = 0

    for factory in all_factories:
        db_norm = normalize_text(factory.name)
        db_words = set(db_norm.split())

        # Count matching words (excluding very short words)
        matching_words = excel_words.intersection(db_words)
        significant_matches = [w for w in matching_words if len(w) >= 2]

        if len(significant_matches) >= 2:  # At least 2 significant words match
            score = len(significant_matches)
            if score > best_score:
                best_score = score
                best_match = factory.factory_id

    return best_match


def import_factories(db: Session):
    """Import factories from JSON files"""
    print("=" * 50)
    print("IMPORTANDO FÁBRICAS")
    print("=" * 50)

    try:
        # Load factories index
        with open('/app/config/factories_index.json', 'r', encoding='utf-8') as f:
            index = json.load(f)

        imported = 0
        skipped = 0

        for factory_info in index['factories']:
            try:
                factory_id = factory_info['factory_id']

                # Check if exists
                existing = db.query(Factory).filter(Factory.factory_id == factory_id).first()
                if existing:
                    skipped += 1
                    continue

                # Find the correct factory file by prefix
                factory_dir = Path('/app/config/factories')
                found_files = list(factory_dir.glob(f'{factory_id}*.json'))
                
                if not found_files:
                    raise FileNotFoundError(f"No JSON file found starting with '{factory_id}' in {factory_dir}")

                # Use the first file found
                factory_file = found_files[0]

                # Load full factory config
                with open(factory_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)

                # Create factory record
                factory = Factory(
                    factory_id=factory_id,
                    name=f"{config['client_company']['name']} - {config['plant']['name']}".strip(),
                    address=config['plant']['address'],
                    phone=config['plant']['phone'],
                    contact_person=config['assignment']['supervisor']['name'],
                    config=config,
                    is_active=True
                )

                db.add(factory)
                db.commit()  # Commit individually
                imported += 1

                if imported % 20 == 0:
                    print(f"  Procesadas {imported} fábricas...")

            except Exception as e:
                db.rollback()
                print(f"  ✗ Error en {factory_id}: {e}")

        print(f"✓ Importadas {imported} fábricas a PostgreSQL")
        if skipped > 0:
            print(f"  ⚠ {skipped} duplicados omitidos\n")
        return imported

    except Exception as e:
        print(f"✗ Error importando fábricas: {e}\n")
        return 0


def import_haken_employees(db: Session):
    """Import 派遣社員 (Dispatch employees)"""
    print("=" * 50)
    print("IMPORTANDO 派遣社員 (DISPATCH EMPLOYEES)")
    print("=" * 50)

    try:
        df = pd.read_excel('/app/config/employee_master.xlsm', sheet_name='派遣社員', header=1)

        imported = 0
        errors = 0
        skipped = 0

        for idx, row in df.iterrows():
            try:
                # Skip if no employee number
                if pd.isna(row['社員№']):
                    continue

                hakenmoto_id = int(row['社員№'])

                # Check if employee already exists (skip duplicates)
                existing = db.query(Employee).filter(Employee.hakenmoto_id == hakenmoto_id).first()
                if existing:
                    skipped += 1
                    continue

                # Helper function to parse dates safely
                def parse_date(value):
                    if pd.notna(value):
                        try:
                            return pd.to_datetime(value).date()
                        except:
                            pass
                    return None

                # Helper function to parse integers safely
                def parse_int(value):
                    if pd.notna(value):
                        try:
                            return int(float(value))
                        except:
                            pass
                    return None

                # Parse dates
                hire_date = parse_date(row.get('入社日'))
                current_hire_date = parse_date(row.get('現入社'))
                termination_date = parse_date(row.get('退社日'))
                zairyu_expire = parse_date(row.get('ビザ期限'))
                dob = parse_date(row.get('生年月日'))
                jikyu_revision_date = parse_date(row.get('時給改定'))
                billing_revision_date = parse_date(row.get('請求改定'))
                social_insurance_date = parse_date(row.get('社保加入'))
                entry_request_date = parse_date(row.get('入社依頼'))
                license_expire_date = parse_date(row.get('免許期限'))
                optional_insurance_expire = parse_date(row.get('任意保険期限'))
                apartment_start_date = parse_date(row.get('入居'))
                apartment_move_out_date = parse_date(row.get('退去'))

                # Parse status
                status_text = row.get('現在')
                current_status = 'active' # Default
                is_active = True

                if pd.notna(status_text):
                    if status_text == '退社':
                        current_status = 'terminated'
                        is_active = False
                    elif status_text == '待機中':
                        current_status = 'suspended'
                    # '在職中' maps to the default 'active'


                # Parse integers
                jikyu = parse_int(row.get('時給')) or 0
                hourly_rate_charged = parse_int(row.get('請求単価'))
                profit_difference = parse_int(row.get('差額利益'))
                standard_compensation = parse_int(row.get('標準報酬'))
                health_insurance = parse_int(row.get('健康保険'))
                nursing_insurance = parse_int(row.get('介護保険'))
                pension_insurance = parse_int(row.get('厚生年金'))

                # Parse strings
                def get_str(key):
                    val = row.get(key)
                    return str(val) if pd.notna(val) else None

                # Find factory_id by looking up the factory name from '派遣先'
                factory_name_from_excel = get_str('派遣先')
                db_factory_id = None
                if factory_name_from_excel:
                    # Use improved matching function
                    db_factory_id = find_factory_match(factory_name_from_excel, db)
                    if not db_factory_id:
                        print(f"  [WARN] Factory '{factory_name_from_excel}' not found for employee {hakenmoto_id}. Skipping factory link.")

                # Create employee record with ALL fields
                employee = Employee(
                    hakenmoto_id=hakenmoto_id,
                    factory_id=db_factory_id,
                    hakensaki_shain_id=get_str('派遣先社員ID'),
                    full_name_kanji=get_str('氏名') or '',
                    full_name_kana=get_str('カナ') or '',
                    date_of_birth=dob,
                    gender=get_str('性別'),
                    nationality=get_str('国籍'),
                    zairyu_expire_date=zairyu_expire,
                    visa_type=get_str('ビザ種類'),
                    postal_code=get_str('〒'),
                    address=get_str('住所'),
                    current_address=get_str('現住所'),  # 現住所 - Base address
                    address_banchi=get_str('番地'),  # 番地 - Block/lot number
                    address_building=get_str('物件名'),  # 物件名 - Building name
                    phone=None,
                    email=None,
                    # Employment
                    hire_date=hire_date,
                    current_hire_date=current_hire_date,
                    jikyu=jikyu,
                    jikyu_revision_date=jikyu_revision_date,
                    position=get_str('職種'),
                    contract_type='派遣',
                    # Assignment
                    assignment_location=get_str('配属先'),
                    assignment_line=get_str('配属ライン'),
                    job_description=get_str('仕事内容'),
                    # Financial
                    hourly_rate_charged=hourly_rate_charged,
                    billing_revision_date=billing_revision_date,
                    profit_difference=profit_difference,
                    standard_compensation=standard_compensation,
                    health_insurance=health_insurance,
                    nursing_insurance=nursing_insurance,
                    pension_insurance=pension_insurance,
                    social_insurance_date=social_insurance_date,
                    # License
                    license_type=get_str('免許種類'),
                    license_expire_date=license_expire_date,
                    commute_method=get_str('通勤方法'),
                    optional_insurance_expire=optional_insurance_expire,
                    # Skills
                    japanese_level=get_str('日本語検定'),
                    career_up_5years=get_str('キャリアアップ5年目') == 'はい',
                    # Apartment
                    apartment_start_date=apartment_start_date,
                    apartment_move_out_date=apartment_move_out_date,
                    # Other
                    entry_request_date=entry_request_date,
                    notes=get_str('備考'),
                    is_active=is_active,
                    current_status=current_status,
                    termination_date=termination_date
                )

                db.add(employee)
                db.commit()  # Commit individually
                imported += 1

                if imported % 100 == 0:
                    print(f"  Procesados {imported} empleados...")

            except Exception as e:
                db.rollback()
                errors += 1
                if errors < 10:  # Only show first 10 errors
                    print(f"  ✗ Error en fila {idx}: {e}")
        print(f"✓ Importados {imported} empleados 派遣社員")
        if skipped > 0:
            print(f"  ⚠ {skipped} duplicados omitidos")
        if errors > 0:
            print(f"  ⚠ {errors} errores encontrados\n")
        return imported

    except Exception as e:
        db.rollback()
        print(f"✗ Error importando 派遣社員: {e}\n")
        return 0


def import_ukeoi_employees(db: Session):
    """Import 請負社員 (Contract employees)"""
    print("=" * 50)
    print("IMPORTANDO 請負社員 (CONTRACT EMPLOYEES)")
    print("=" * 50)

    try:
        df = pd.read_excel('/app/config/employee_master.xlsm', sheet_name='請負社員', header=2)

        imported = 0
        errors = 0
        skipped = 0

        for idx, row in df.iterrows():
            try:
                # Get column by index since names might be problematic
                status = row.iloc[0] if len(row) > 0 else None
                shain_no = row.iloc[1] if len(row) > 1 else None

                # Skip if no employee number
                if pd.isna(shain_no):
                    continue

                hakenmoto_id = int(shain_no)

                # Check if already exists
                existing = db.query(ContractWorker).filter(ContractWorker.hakenmoto_id == hakenmoto_id).first()
                if existing:
                    skipped += 1
                    continue

                name = row.iloc[3] if len(row) > 3 else ''
                kana = row.iloc[4] if len(row) > 4 else ''
                gender = row.iloc[5] if len(row) > 5 else None
                nationality = row.iloc[6] if len(row) > 6 else None

                # Jikyu
                jikyu = 0
                if len(row) > 9 and pd.notna(row.iloc[9]):
                    try:
                        jikyu = int(float(row.iloc[9]))
                    except:
                        pass

                # Dates
                hire_date = None
                if len(row) > 25 and pd.notna(row.iloc[25]):
                    try:
                        hire_date = pd.to_datetime(row.iloc[25]).date()
                    except:
                        pass

                termination_date = None
                is_active = status != '退社' if pd.notna(status) else True
                if len(row) > 26 and pd.notna(row.iloc[26]):
                    try:
                        termination_date = pd.to_datetime(row.iloc[26]).date()
                    except:
                        pass

                contract_worker = ContractWorker(
                    hakenmoto_id=hakenmoto_id,
                    full_name_kanji=str(name) if pd.notna(name) else '',
                    full_name_kana=str(kana) if pd.notna(kana) else '',
                    gender=str(gender) if pd.notna(gender) else None,
                    nationality=str(nationality) if pd.notna(nationality) else None,
                    hire_date=hire_date,
                    jikyu=jikyu,
                    contract_type='請負',
                    is_active=is_active,
                    termination_date=termination_date
                )

                db.add(contract_worker)
                db.commit()  # Commit individually
                imported += 1

                if imported % 50 == 0:
                    print(f"  Procesados {imported} empleados...")

            except Exception as e:
                db.rollback()
                errors += 1
                if errors < 10:
                    print(f"  ✗ Error en fila {idx}: {e}")
        print(f"✓ Importados {imported} empleados 請負社員")
        if skipped > 0:
            print(f"  ⚠ {skipped} duplicados omitidos")
        if errors > 0:
            print(f"  ⚠ {errors} errores encontrados\n")
        return imported

    except Exception as e:
        db.rollback()
        print(f"✗ Error importando 請負社員: {e}\n")
        return 0


def import_staff_employees(db: Session):
    """Import スタッフ (Staff employees)"""
    print("=" * 50)
    print("IMPORTANDO スタッフ (STAFF)")
    print("=" * 50)

    try:
        df = pd.read_excel('/app/config/employee_master.xlsm', sheet_name='スタッフ', header=2)

        imported = 0
        errors = 0
        skipped = 0

        for idx, row in df.iterrows():
            try:
                # Get by index
                status = row.iloc[0] if len(row) > 0 else None
                shain_no = row.iloc[1] if len(row) > 1 else None

                if pd.isna(shain_no):
                    continue

                staff_id = int(shain_no)

                # Check if already exists
                existing = db.query(Staff).filter(Staff.staff_id == staff_id).first()
                if existing:
                    skipped += 1
                    continue

                name = row.iloc[2] if len(row) > 2 else ''
                kana = row.iloc[3] if len(row) > 3 else ''

                # Monthly salary (staff typically have monthly salary, not hourly)
                monthly_salary = 0
                if len(row) > 7 and pd.notna(row.iloc[7]):
                    try:
                        monthly_salary = int(float(row.iloc[7]))
                    except:
                        pass

                staff = Staff(
                    staff_id=staff_id,
                    full_name_kanji=str(name) if pd.notna(name) else '',
                    full_name_kana=str(kana) if pd.notna(kana) else '',
                    monthly_salary=monthly_salary,
                    is_active=status != '退社' if pd.notna(status) else True
                )

                db.add(staff)
                db.commit()  # Commit individually
                imported += 1

            except Exception as e:
                db.rollback()
                errors += 1
                if errors < 10:
                    print(f"  ✗ Error en fila {idx}: {e}")
        print(f"✓ Importados {imported} empleados スタッフ")
        if skipped > 0:
            print(f"  ⚠ {skipped} duplicados omitidos")
        if errors > 0:
            print(f"  ⚠ {errors} errores encontrados\n")
        return imported

    except Exception as e:
        db.rollback()
        print(f"✗ Error importando スタッフ: {e}\n")
        return 0


def import_taisha_employees(db: Session):
    """Import 退社社員 (Resigned employees) from DBTaishaX hidden sheet"""
    print("=" * 50)
    print("IMPORTANDO 退社社員 (RESIGNED EMPLOYEES)")
    print("=" * 50)

    try:
        df = pd.read_excel('/app/config/employee_master.xlsm', sheet_name='DBTaishaX', header=0)

        # Filter out rows where all values are NaN
        df = df.dropna(how='all')

        if len(df) == 0:
            print("ℹ No hay empleados renunciados registrados aún.\n")
            return 0

        imported = 0
        errors = 0

        for idx, row in df.iterrows():
            try:
                if pd.isna(row.get('社員№')):
                    continue

                hakenmoto_id = int(row['社員№'])

                # Check if employee exists and update to inactive
                employee = db.query(Employee).filter(Employee.hakenmoto_id == hakenmoto_id).first()

                if employee:
                    # Update existing employee to mark as resigned
                    employee.is_active = False
                    employee.current_status = 'terminated'
                    if pd.notna(row.get('退社日')):
                        try:
                            employee.termination_date = pd.to_datetime(row['退社日']).date()
                        except:
                            pass

                    db.commit()
                    imported += 1

            except Exception as e:
                db.rollback()
                errors += 1
                if errors < 5:
                    print(f"  ✗ Error en fila {idx}: {e}")

        print(f"✓ Actualizados {imported} empleados renunciados")
        if errors > 0:
            print(f"  ⚠ {errors} errores encontrados\n")
        return imported

    except Exception as e:
        db.rollback()
        print(f"✗ Error importando 退社社員: {e}\n")
        return 0


def import_insurance_rates(db: Session):
    """Import social insurance rates from 愛知23 sheet"""
    print("=" * 50)
    print("IMPORTANDO TARIFAS DE SEGUROS (愛知23)")
    print("=" * 50)

    try:
        # Note: This sheet has a complex format, needs special parsing
        # For now, we'll skip it and add a TODO comment
        print("ℹ Importación de tarifas de seguros pendiente de implementación.")
        print("  (Requiere parsing manual de la tabla compleja)\n")
        return 0

    except Exception as e:
        print(f"✗ Error importando tarifas: {e}\n")
        return 0


def main():
    """Main import function"""
    db = SessionLocal()

    try:
        print("\n" + "=" * 50)
        print("INICIANDO IMPORTACIÓN DE DATOS")
        print("=" * 50 + "\n")

        # Import factories
        factories_count = import_factories(db)

        # Import employees
        haken_count = import_haken_employees(db)
        ukeoi_count = import_ukeoi_employees(db)
        staff_count = import_staff_employees(db)
        taisha_count = import_taisha_employees(db)
        insurance_count = import_insurance_rates(db)

        total_employees = haken_count + ukeoi_count + staff_count

        # Summary
        print("=" * 50)
        print("RESUMEN DE IMPORTACIÓN")
        print("=" * 50)
        print(f"Fábricas:          {factories_count:4d}")
        print(f"派遣社員:          {haken_count:4d}")
        print(f"請負社員:          {ukeoi_count:4d}")
        print(f"スタッフ:          {staff_count:4d}")
        print(f"退社社員:          {taisha_count:4d}")
        print(f"Tarifas seguros:   {insurance_count:4d}")
        print(f"{'─' * 50}")
        print(f"TOTAL Empleados:   {total_employees:4d}")
        print("=" * 50)

    except Exception as e:
        print(f"\n✗ Error general: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
