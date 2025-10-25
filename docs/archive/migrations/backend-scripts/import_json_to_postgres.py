"""
Import Candidates from JSON to PostgreSQL
=========================================

This script runs inside Docker container and imports candidate data
from JSON file (exported from Access) to PostgreSQL database.

Usage:
    python import_json_to_postgres.py
"""

import json
import sys
import os
from datetime import datetime, date
from sqlalchemy.orm import Session

# Add app to path
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.models import Candidate

# File paths
CANDIDATES_JSON = "/app/access_candidates_data.json"
PHOTO_MAPPINGS_JSON = "/app/access_photo_mappings.json"

def load_photo_mappings():
    """Load photo mappings from JSON"""
    try:
        with open(PHOTO_MAPPINGS_JSON, 'r', encoding='utf-8') as f:
            mappings = json.load(f)
        # Filter only numeric keys (rirekisho_id)
        photo_map = {}
        for k, v in mappings.items():
            try:
                photo_map[int(k)] = v
            except (ValueError, TypeError):
                # Skip non-numeric keys like 'timestamp'
                continue
        print(f"Loaded {len(photo_map)} photo mappings")
        return photo_map
    except FileNotFoundError:
        print("Photo mappings file not found, skipping photos")
        return {}


def parse_date(value):
    """Parse date string to date object"""
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


def map_candidate_data(row, photo_mappings):
    """Map Access row data to Candidate model fields"""
    rirekisho_id_int = row.get('履歴書ID')
    rirekisho_id = str(rirekisho_id_int) if rirekisho_id_int else None

    # Get photo from mappings (using integer key)
    photo_data_url = photo_mappings.get(rirekisho_id_int) if rirekisho_id_int else None

    candidate_data = {
        # Basic Info
        'rirekisho_id': rirekisho_id,
        'reception_date': parse_date(row.get('受付日')),
        'arrival_date': row.get('到着'),
        'full_name_kanji': row.get('氏名'),
        'full_name_kana': row.get('フリガナ'),
        'full_name_roman': row.get('氏名（ローマ字)'),
        'gender': row.get('性別'),
        'date_of_birth': parse_date(row.get('生年月日')),
        'photo_data_url': photo_data_url,
        'nationality': row.get('国籍'),
        'marital_status': row.get('配偶'),
        # Note: '入国日' (entry date) is not in current Candidate model

        # Address
        'postal_code': row.get('〒番号'),
        'prefecture': row.get('県住所'),
        'address': row.get('番地'),
        'building': row.get('建物名'),
        'registered_address': row.get('登録住所'),
        'phone_number': row.get('電話番号'),
        'mobile_phone': row.get('携帯電話'),

        # Passport & Visa
        'passport_number': row.get('パスポート番号'),
        'passport_expiry': parse_date(row.get('パスポート期限')),
        'visa_type': row.get('滞在資格'),
        'zairyu_card_expiry': parse_date(row.get('（在留カード記載）滞在期限')),
        'zairyu_card_number': row.get('在留カード番号'),
        'driver_license': row.get('運転免許証番号【自動車】'),
        'license_expiry': parse_date(row.get('運転免許期限')),

        # License types
        'driver_license_mc': row.get('普通自動二輪免許'),
        'voluntary_return_insurance': row.get('任意保険加入'),
        'motorcycle_license': row.get('限定解除免許'),
        'glasses': row.get('眼鏡'),
        'traffic_accident': row.get('自動車交通違反歴(5年以内)'),
        'traffic_violation': row.get('自動車交通違反歴(5年以上)'),
        'bicycle_accident': row.get('自転車事故歴'),

        # Family (5 members)
        'family_relationship_1': row.get('続柄関係続柄1'),
        'family_name_1': row.get('続柄関係氏名1'),
        'family_age_1': row.get('年齢1'),
        'family_occupation_1': row.get('職業1'),
        'family_school_name_1': row.get('通学校名住所1'),

        'family_relationship_2': row.get('続柄関係続柄2'),
        'family_name_2': row.get('続柄関係氏名2'),
        'family_age_2': row.get('年齢2'),
        'family_occupation_2': row.get('職業2'),
        'family_school_name_2': row.get('通学校名住所2'),

        'family_relationship_3': row.get('続柄関係続柄3'),
        'family_name_3': row.get('続柄関係氏名3'),
        'family_age_3': row.get('年齢3'),
        'family_occupation_3': row.get('職業3'),
        'family_school_name_3': row.get('通学校名住所3'),

        'family_relationship_4': row.get('続柄関係続柄4'),
        'family_name_4': row.get('続柄関係氏名4'),
        'family_age_4': row.get('年齢4'),
        'family_occupation_4': row.get('職業4'),
        'family_school_name_4': row.get('通学校名住所4'),

        'family_relationship_5': row.get('続柄関係続柄5'),
        'family_name_5': row.get('続柄関係氏名5'),
        'family_age_5': row.get('年齢5'),
        'family_occupation_5': row.get('職業5'),
        'family_school_name_5': row.get('通学校名住所5'),

        # Japanese Language
        'japanese_speaking': row.get('話ができる'),
        'japanese_listening': row.get('話が聞きとれる'),
        'japanese_reading_hiragana': row.get('ひらがな・カタカナ読める'),
        'japanese_writing_hiragana': row.get('ひらがな・カタカナ書ける'),
        'kanji_reading': row.get('漢字の読み書き'),

        # Education
        'final_education': row.get('最終学歴'),

        # Physical
        'height': row.get('身長'),
        'weight': row.get('体重'),
        'shirt_size': row.get('服のサイズ'),
        'waist': row.get('ウエスト'),
        'shoe_size': row.get('靴サイズ'),

        # Health
        'health_insurance': row.get('各種健康保険'),
        'smoking': row.get('たばこ'),
        'medication': row.get('薬（通院中・薬使用）'),
        'allergy_tattoo': row.get('刺青 有'),
        'allergy_tattoo_yes': row.get('刺青 無'),
        'allergy_none': row.get('アレルギー 無'),
        'allergy_yes': row.get('アレルギー 有'),
        'allergy_details': row.get('アレルギー 内'),

        # Work Experience (7 entries)
        'work_start_date_1': row.get('雇用年月日1'),
        'work_entry_date_1': row.get('雇用入社1'),
        'work_end_date_1': row.get('雇用年退社日1'),
        'work_exit_date_1': row.get('雇用月退社日1'),
        'work_company_name_1': row.get('雇用入社会社名1'),
        'work_company_exit_1': row.get('雇用退社会社名1'),

        # Similar for entries 2-7...

        # Work Skills (Boolean)
        'nc': row.get('NC加工'),
        'assembly': row.get('組立'),
        'forklift': row.get('玉掛'),
        'welding': row.get('溶接スタッド'),
        'crane': row.get('吊り'),
        'grinding': row.get('研磨'),
        'packaging_cardboard': row.get('段ボール（包装）'),
        'packaging_cosmetics': row.get('段ボール（容器等）'),
        'packaging_container': row.get('段ボール（容器）'),
        'electronics_wiring': row.get('電子部品（配線）'),
        'food_manufacturing': row.get('食品（製造）'),
        'painting': row.get('塗装'),
        'press': row.get('プレスリーダー'),
        'welding_spot': row.get('溶接'),
        'other_skills': row.get('その他'),

        # Commute Preferences
        'commute_car': row.get('通勤方法　車/バ'),
        'commute_bike_car': row.get('通勤方法　バイクその'),
        'commute_bike': row.get('通勤方法　バイクの'),
        'commute_bicycle': row.get('通勤方法　自転車'),

        # Other
        'desired_work_location': row.get('通勤希望地'),
        'desired_monthly_salary': row.get('通勤希望月額'),
        'direct_interview_ok': row.get('直接面接OK'),
        'temporary_return_kit': row.get('帰国旅費実車キット'),
        'temporary_return_date': parse_date(row.get('帰国旅費実車受渡日')),
        'corona_vaccination': row.get('コロナ（ワクチン接種　回数）'),
        'corona_card': row.get('接種済カード記載'),
        'corona_card_1': row.get('接種済カード記載１'),
        'corona_card_2': row.get('接種済カード記載2'),
        'jlpt_level': row.get('日本語能力試験'),
        'jlpt_level_detail': row.get('日本語能力試験Level'),
        'jlpt_passed': row.get('能力試験合格'),
        'jlpt_test_date': row.get('能力試験受験日受験日'),
        'jlpt_test_score': row.get('能力試験受験日点数'),
        'jlpt_scheduled_date': parse_date(row.get('能力試験受験日受験予定日')),
        'certification_1': row.get('免許・資格取得'),
        'certification_2': row.get('免許・資格取得1'),
        'certification_3': row.get('免許・資格取得2'),

        # Lunch/Emergency
        'lunch': row.get('弁当'),
        'lunch_preference': row.get('たばこ_2'),
        'allergies': row.get('刺青_2'),
        'allergy_food': row.get('アレルギー有無'),
        'preferred_language': row.get('希望言語'),
        'preferred_meal': row.get('話し言語'),
        'emergency_contact_name': row.get('緊急、連絡先　氏名'),
        'emergency_contact_relationship': row.get('緊急、連絡先　続柄'),
        'emergency_contact_phone': row.get('緊急、連絡先　電話番号'),

        # Reading levels
        'reading_hiragana': row.get('各種健 保'),
        'reading_kanji': row.get('読め　カナ'),
        'reading_katakana': row.get('読め　ひら'),
        'reading_mixed': row.get('読め　漢字'),
        'writing_hiragana': row.get('書け　カナ'),
        'writing_katakana': row.get('書け　ひら'),
        'writing_mixed': row.get('書け　漢字'),
    }

    return candidate_data


def import_candidates():
    """Import all candidates from JSON to PostgreSQL"""
    print("=" * 80)
    print("IMPORTING CANDIDATES FROM JSON TO POSTGRESQL")
    print("=" * 80)

    # Load photo mappings
    photo_mappings = load_photo_mappings()

    # Load candidate data
    print(f"\nLoading candidate data from {CANDIDATES_JSON}...")
    with open(CANDIDATES_JSON, 'r', encoding='utf-8') as f:
        candidates_data = json.load(f)

    print(f"Found {len(candidates_data)} candidates in JSON")

    # Get database session
    db = SessionLocal()

    try:
        imported = 0
        skipped = 0
        errors = 0

        for i, row in enumerate(candidates_data, 1):
            try:
                rirekisho_id_str = str(row.get('履歴書ID')) if row.get('履歴書ID') else None
                full_name = row.get('氏名')

                # Check if candidate already exists
                existing = db.query(Candidate).filter(
                    Candidate.rirekisho_id == rirekisho_id_str
                ).first()

                if existing:
                    print(f"  [{i}/{len(candidates_data)}] Skipping duplicate: {rirekisho_id_str} - {full_name}")
                    skipped += 1
                    continue

                # Map data
                candidate_data = map_candidate_data(row, photo_mappings)

                # Create candidate
                candidate = Candidate(**candidate_data)
                db.add(candidate)
                db.commit()  # Commit immediately after each insert

                imported += 1
                if imported % 50 == 0:
                    print(f"  Imported {imported} candidates...")

            except Exception as e:
                db.rollback()  # Rollback on error
                print(f"  ERROR processing record #{i}: {e}")
                errors += 1
                continue

        print("\n" + "=" * 80)
        print("IMPORT SUMMARY")
        print("=" * 80)
        print(f"Total records: {len(candidates_data)}")
        print(f"Imported: {imported}")
        print(f"Skipped (duplicates): {skipped}")
        print(f"Errors: {errors}")
        print(f"Photos attached: {len([c for c in candidates_data if photo_mappings.get(c.get('履歴書ID'))])}")
        print("=" * 80)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Import failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == '__main__':
    import_candidates()
