"""
Simplified Import - Access Candidates to PostgreSQL
==================================================
Only maps existing fields to avoid errors
"""

import json
import sys
from datetime import datetime, date

sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.models import Candidate

# File paths
CANDIDATES_JSON = "/app/access_candidates_data.json"
PHOTO_MAPPINGS_JSON = "/app/access_photo_mappings.json"


def load_photo_mappings():
    """Load photo mappings"""
    try:
        with open(PHOTO_MAPPINGS_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Extract the "mappings" sub-object
        mappings = data.get('mappings', {})
        photo_map = {}
        for k, v in mappings.items():
            try:
                photo_map[int(k)] = v
            except (ValueError, TypeError):
                continue
        print(f"Loaded {len(photo_map)} photo mappings")
        return photo_map
    except Exception as e:
        print(f"No photo mappings found: {e}")
        return {}


def parse_date(value):
    """Parse date"""
    if not value:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value).date()
        except:
            return None
    return None


def parse_age(value):
    """Parse age field - extract number from strings like '34歳'"""
    if not value:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        try:
            # Remove '歳' and any other non-numeric characters
            import re
            num_str = re.sub(r'[^\d]', '', value)
            if num_str:
                return int(num_str)
        except:
            pass
    return None


def map_simple(row, photo_mappings):
    """Map only existing fields"""
    rid_int = row.get('履歴書ID')
    rid = str(rid_int) if rid_int else None

    return {
        # Basic
        'rirekisho_id': rid,
        'reception_date': parse_date(row.get('受付日')),
        'arrival_date': row.get('到着'),
        'full_name_kanji': row.get('氏名'),
        'full_name_kana': row.get('フリガナ'),
        'full_name_roman': row.get('氏名（ローマ字)'),
        'gender': row.get('性別'),
        'date_of_birth': parse_date(row.get('生年月日')),
        'photo_data_url': photo_mappings.get(rid_int) if rid_int else None,
        'nationality': row.get('国籍'),
        'marital_status': row.get('配偶'),

        # Address
        'postal_code': row.get('〒番号'),
        'current_address': row.get('県住所'),
        'address': row.get('番地'),
        'address_banchi': row.get('番地'),
        'address_building': row.get('建物名'),
        'building_name': row.get('建物名'),
        'registered_address': row.get('登録住所'),
        'phone': row.get('電話番号'),
        'mobile': row.get('携帯電話'),

        # Passport & Visa
        'passport_number': row.get('パスポート番号'),
        'passport_expiry': parse_date(row.get('パスポート期限')),
        'residence_status': row.get('滞在資格'),
        'residence_expiry': parse_date(row.get('（在留カード記載）滞在期限')),
        'residence_card_number': row.get('在留カード番号'),
        'license_number': row.get('運転免許証番号【自動車】'),
        'license_expiry': parse_date(row.get('運転免許期限')),

        # Licenses
        'forklift_license': row.get('普通自動二輪免許'),
        'voluntary_insurance': row.get('任意保険加入'),
        'tama_kake': row.get('限定解除免許'),
        'glasses': row.get('眼鏡'),
        'mobile_crane_under_5t': row.get('自動車交通違反歴(5年以内)'),
        'mobile_crane_over_5t': row.get('自動車交通違反歴(5年以上)'),
        'gas_welding': row.get('自転車事故歴'),

        # Family (only names and relations)
        'family_name_1': row.get('続柄関係氏名1'),
        'family_relation_1': row.get('続柄関係続柄1'),
        'family_age_1': parse_age(row.get('年齢1')),
        'family_residence_1': row.get('職業1'),
        'family_separate_address_1': row.get('通学校名住所1'),

        'family_name_2': row.get('続柄関係氏名2'),
        'family_relation_2': row.get('続柄関係続柄2'),
        'family_age_2': parse_age(row.get('年齢2')),
        'family_residence_2': row.get('職業2'),
        'family_separate_address_2': row.get('通学校名住所2'),

        'family_name_3': row.get('続柄関係氏名3'),
        'family_relation_3': row.get('続柄関係続柄3'),
        'family_age_3': parse_age(row.get('年齢3')),
        'family_residence_3': row.get('職業3'),
        'family_separate_address_3': row.get('通学校名住所3'),

        'family_name_4': row.get('続柄関係氏名4'),
        'family_relation_4': row.get('続柄関係続柄4'),
        'family_age_4': parse_age(row.get('年齢4')),
        'family_residence_4': row.get('職業4'),
        'family_separate_address_4': row.get('通学校名住所4'),

        'family_name_5': row.get('続柄関係氏名5'),
        'family_relation_5': row.get('続柄関係続柄5'),
        'family_age_5': parse_age(row.get('年齢5')),
        'family_residence_5': row.get('職業5'),
        'family_separate_address_5': row.get('通学校名住所5'),

        # Work Experience (Boolean flags)
        'exp_nc_lathe': row.get('NC加工'),
        'exp_lathe': row.get('組立'),
        'exp_forklift': row.get('玉掛'),
        'exp_welding': row.get('溶接スタッド'),
        'exp_press': row.get('吊り'),
        'exp_packing': row.get('研磨'),
        'exp_car_assembly': row.get('段ボール（包装）'),
        'exp_car_line': row.get('段ボール（容器等）'),
        'exp_car_inspection': row.get('段ボール（容器）'),
        'exp_electronic_inspection': row.get('電子部品（配線）'),
        'exp_food_processing': row.get('食品（製造）'),
        'exp_casting': row.get('塗装'),
        'exp_line_leader': row.get('プレスリーダー'),
        'exp_painting': row.get('溶接'),
        'exp_other': row.get('その他'),

        # Bento
        'bento_lunch_dinner': row.get('通勤方法　車/バ'),
        'bento_lunch_only': row.get('通勤方法　バイクその'),
        'bento_dinner_only': row.get('通勤方法　バイクの'),
        'bento_bring_own': row.get('通勤方法　自転車'),

        # Other
        'commute_method': row.get('通勤希望地'),
        'commute_time_oneway': row.get('通勤希望月額'),
        'interview_result': row.get('直接面接OK'),
        'antigen_test_kit': row.get('帰国旅費実車キット'),
        'antigen_test_date': parse_date(row.get('帰国旅費実車受渡日')),
        'covid_vaccine_status': row.get('コロナ（ワクチン接種　回数）'),

        # Japanese
        'japanese_qualification': row.get('日本語能力試験'),
        'japanese_level': row.get('日本語能力試験Level'),
        'jlpt_taken': row.get('能力試験合格'),
        'jlpt_date': row.get('能力試験受験日受験日'),
        'jlpt_score': row.get('能力試験受験日点数'),
        'jlpt_scheduled': parse_date(row.get('能力試験受験日受験予定日')),

        # Qualifications
        'qualification_1': row.get('免許・資格取得'),
        'qualification_2': row.get('免許・資格取得1'),
        'qualification_3': row.get('免許・資格取得2'),

        # Lunch & Emergency
        'lunch_preference': row.get('たばこ_2'),
        'allergy_exists': row.get('アレルギー有無'),
        'language_skill_exists': row.get('希望言語'),
        'language_skill_1': row.get('話し言語'),
        'emergency_contact_name': row.get('緊急、連絡先　氏名'),
        'emergency_contact_relation': row.get('緊急、連絡先　続柄'),
        'emergency_contact_phone': row.get('緊急、連絡先　電話番号'),

        # Reading/Writing
        'read_katakana': row.get('読め　カナ'),
        'read_hiragana': row.get('読め　ひら'),
        'read_kanji': row.get('読め　漢字'),
        'write_katakana': row.get('書け　カナ'),
        'write_hiragana': row.get('書け　ひら'),
        'write_kanji': row.get('書け　漢字'),

        'can_speak': row.get('話ができる'),
        'can_understand': row.get('話が聞きとれる'),
        'can_read_kana': row.get('ひらがな・カタカナ読める'),
        'can_write_kana': row.get('ひらがな・カタカナ書ける'),

        # Other
        'major': row.get('最終学歴'),
        'blood_type': row.get('各種健康保険'),
        'dominant_hand': row.get('たばこ'),
        'listening_level': row.get('話が聞きとれる'),
        'speaking_level': row.get('話ができる'),
        'safety_shoes': row.get('靴のサイズ'),
    }


def import_candidates():
    """Import candidates"""
    print("=" * 80)
    print("IMPORTING CANDIDATES - SIMPLIFIED VERSION")
    print("=" * 80)

    photo_mappings = load_photo_mappings()

    with open(CANDIDATES_JSON, 'r', encoding='utf-8') as f:
        candidates_data = json.load(f)

    print(f"Found {len(candidates_data)} candidates\n")

    db = SessionLocal()
    imported = 0
    skipped = 0
    errors = 0

    try:
        for i, row in enumerate(candidates_data, 1):
            try:
                rid_str = str(row.get('履歴書ID')) if row.get('履歴書ID') else None
                full_name = row.get('氏名')

                # Check duplicate
                existing = db.query(Candidate).filter(
                    Candidate.rirekisho_id == rid_str
                ).first()

                if existing:
                    skipped += 1
                    if skipped % 100 == 0:
                        print(f"  Skipped {skipped} duplicates...")
                    continue

                # Map
                data = map_simple(row, photo_mappings)

                # Create
                candidate = Candidate(**data)
                db.add(candidate)
                db.commit()

                imported += 1
                if imported % 100 == 0:
                    print(f"  Imported {imported}/{len(candidates_data)}...")

            except Exception as e:
                db.rollback()
                errors += 1
                if errors <= 5:  # Only show first 5 errors
                    print(f"  ERROR #{i}: {str(e)[:100]}")
                continue

        print("\n" + "=" * 80)
        print("IMPORT COMPLETE")
        print("=" * 80)
        print(f"Total records: {len(candidates_data)}")
        print(f"Imported: {imported}")
        print(f"Skipped (duplicates): {skipped}")
        print(f"Errors: {errors}")
        print(f"Photos attached: {sum(1 for d in candidates_data if photo_mappings.get(d.get('履歴書ID')))}")
        print("=" * 80)

    finally:
        db.close()


if __name__ == '__main__':
    import_candidates()
