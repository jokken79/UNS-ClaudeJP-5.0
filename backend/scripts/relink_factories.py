"""
Script to re-link employees with NULL factory_id to their correct factories.

This script is useful when:
1. Initial import failed to link some employees
2. Factory names in Excel don't exactly match database names
3. You want to verify and fix factory linkage issues

Usage:
    python relink_factories.py [--dry-run] [--verbose]

Options:
    --dry-run   : Show what would be updated without making changes
    --verbose   : Show detailed matching information
"""

import sys
import argparse
from pathlib import Path
import pandas as pd
import re
import unicodedata
from typing import Optional, Dict, List

# Add parent directory to path
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Factory, Employee


def normalize_text(text: str) -> str:
    """
    Normalize Japanese text for better matching.
    Same as in import_data.py for consistency.
    """
    if not text:
        return ""

    text = unicodedata.normalize('NFKC', text)
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()

    # Remove common company suffixes
    suffixes = ['株式会社', '(株)', '有限会社', '(有)']
    for suffix in suffixes:
        text = text.replace(suffix, '')

    return text.strip()


def get_manual_mapping() -> Dict[str, str]:
    """
    Manual mapping for factory names that don't match automatically.

    Maps: Excel factory name -> preferred database factory_id pattern

    This mapping handles cases where:
    - Excel uses city names (e.g., "高雄工業 岡山")
    - Database uses plant names (e.g., "高雄工業株式会社 - 本社工場")
    - Names are abbreviated differently
    """
    return {
        # 高雄工業 - Map city-based names to main plants
        '高雄工業 本社': 'Factory-39',  # 本社工場 (first one)
        '高雄工業 岡山': 'Factory-39',   # Default to 本社工場 (Okayama is nearby)
        '高雄工業 静岡': 'Factory-39',   # Default to 本社工場
        '高雄工業 海南第一': 'Factory-48',  # 海南第一工場
        '高雄工業 海南第二': 'Factory-62',  # 海南第二工場

        # フェニテックセミコンダクター (half-width katakana in Excel)
        'ﾌｪﾆﾃｯｸｾﾐｺﾝﾀﾞｸﾀｰ 岡山': 'Factory-06',  # フェニテックセミコンダクター(株) - 鹿児島工場
        'ﾌｪﾆﾃｯｸｾﾐｺﾝﾀﾞｸﾀｰ 鹿児島': 'Factory-06',  # フェニテックセミコンダクター(株) - 鹿児島工場

        # オーツカ
        'オーツカ': 'Factory-30',  # 株式会社オーツカ - 関ケ原工場

        # アサヒフォージ
        'アサヒフォージ': 'Factory-37',  # アサヒフォージ株式会社 - 真庭工場

        # Note: The following are NOT in database and will be auto-created:
        # - コーリツ (乙川, 亀崎, 州の崎, 本社)
        # - PATEC
        # - プレテック
        # - 三芳
        # - ワーク (堺, 岡山, 志紀)
    }


def find_factory_match(factory_name_excel: str, db: Session, verbose: bool = False) -> Optional[str]:
    """
    Find the best matching factory in the database.
    Returns factory_id if match found, None otherwise.
    """
    if not factory_name_excel:
        return None

    all_factories = db.query(Factory).all()
    excel_norm = normalize_text(factory_name_excel)

    if verbose:
        print(f"\n  Searching for: '{factory_name_excel}' (normalized: '{excel_norm}')")

    # Strategy 0: Check manual mapping first
    manual_map = get_manual_mapping()
    for excel_pattern, factory_id in manual_map.items():
        if normalize_text(excel_pattern) == excel_norm or normalize_text(excel_pattern) in excel_norm:
            # Verify the factory exists
            factory = db.query(Factory).filter(Factory.factory_id == factory_id).first()
            if factory:
                if verbose:
                    print(f"    ✓ MANUAL MAP match: [{factory.factory_id}] {factory.name}")
                return factory.factory_id

    # Strategy 1: Exact match
    for factory in all_factories:
        db_norm = normalize_text(factory.name)
        if excel_norm == db_norm:
            if verbose:
                print(f"    ✓ EXACT match: [{factory.factory_id}] {factory.name}")
            return factory.factory_id

    # Strategy 2: Bidirectional substring match
    for factory in all_factories:
        db_norm = normalize_text(factory.name)
        if excel_norm in db_norm:
            if verbose:
                print(f"    ✓ SUBSTRING match: [{factory.factory_id}] {factory.name}")
            return factory.factory_id
        if db_norm in excel_norm:
            if verbose:
                print(f"    ✓ REVERSE SUBSTRING match: [{factory.factory_id}] {factory.name}")
            return factory.factory_id

    # Strategy 3: Word-based matching
    excel_words = set(excel_norm.split())
    best_match = None
    best_score = 0
    best_factory_name = ""

    for factory in all_factories:
        db_norm = normalize_text(factory.name)
        db_words = set(db_norm.split())
        matching_words = excel_words.intersection(db_words)
        significant_matches = [w for w in matching_words if len(w) >= 2]

        if len(significant_matches) >= 2:
            score = len(significant_matches)
            if score > best_score:
                best_score = score
                best_match = factory.factory_id
                best_factory_name = factory.name

    if best_match and verbose:
        print(f"    ✓ WORD-BASED match (score={best_score}): [{best_match}] {best_factory_name}")

    return best_match


def create_missing_factory(factory_name: str, db: Session) -> str:
    """
    Create a placeholder factory for a name that doesn't exist in the database.

    Args:
        factory_name: The factory name from Excel
        db: Database session

    Returns:
        factory_id of the newly created factory
    """
    # Generate a factory_id
    # Find the next available MISSING-XXX id
    existing_missing = db.query(Factory).filter(
        Factory.factory_id.like('MISSING-%')
    ).all()

    if existing_missing:
        # Extract numbers and find max
        numbers = []
        for f in existing_missing:
            try:
                num = int(f.factory_id.replace('MISSING-', ''))
                numbers.append(num)
            except:
                pass
        next_num = max(numbers) + 1 if numbers else 1
    else:
        next_num = 1

    factory_id = f'MISSING-{next_num:03d}'

    # Create factory record
    factory = Factory(
        factory_id=factory_id,
        name=factory_name,
        address='住所不明 (自動生成)',
        phone='',
        contact_person='',
        config={},
        is_active=True
    )

    db.add(factory)
    db.commit()

    return factory_id


def load_employee_factory_mapping() -> Dict[int, str]:
    """
    Load the factory names for each employee from the Excel file.

    Returns:
        Dictionary mapping hakenmoto_id -> factory_name_from_excel
    """
    mapping = {}

    try:
        # Read 派遣社員 sheet
        df = pd.read_excel('/app/config/employee_master.xlsm', sheet_name='派遣社員', header=1)

        for _, row in df.iterrows():
            if pd.notna(row.get('社員№')) and pd.notna(row.get('派遣先')):
                hakenmoto_id = int(row['社員№'])
                factory_name = str(row['派遣先'])
                mapping[hakenmoto_id] = factory_name

    except Exception as e:
        print(f"Error reading Excel file: {e}")

    return mapping


def relink_factories(dry_run: bool = False, verbose: bool = False, create_missing: bool = False):
    """
    Main function to re-link employees with NULL factory_id.

    Args:
        dry_run: If True, show what would be updated without making changes
        verbose: If True, show detailed matching information
        create_missing: If True, create placeholder factories for unmatched names
    """
    db = SessionLocal()

    try:
        print("=" * 70)
        print("FACTORY RE-LINKAGE SCRIPT")
        print("=" * 70)
        print()

        # Get employees with NULL factory_id
        employees_null = db.query(Employee).filter(Employee.factory_id.is_(None)).all()
        print(f"Found {len(employees_null)} employees with factory_id = NULL")
        print()

        if len(employees_null) == 0:
            print("✓ All employees are already linked to factories!")
            return

        # Load factory names from Excel
        print("Loading factory names from Excel...")
        excel_mapping = load_employee_factory_mapping()
        print(f"✓ Loaded factory mappings for {len(excel_mapping)} employees")
        print()

        # Try to match and update
        updated = 0
        not_found = 0
        no_excel_data = 0
        created = 0
        failed_matches: List[Dict] = []

        print("Processing employees...")
        print("-" * 70)

        for employee in employees_null:
            hakenmoto_id = employee.hakenmoto_id

            # Get factory name from Excel
            factory_name_excel = excel_mapping.get(hakenmoto_id)

            if not factory_name_excel:
                no_excel_data += 1
                if verbose:
                    print(f"  Employee {hakenmoto_id}: No factory data in Excel")
                continue

            # Try to find match
            factory_id = find_factory_match(factory_name_excel, db, verbose=verbose)

            if factory_id:
                if not dry_run:
                    employee.factory_id = factory_id
                    db.commit()

                print(f"  ✓ Employee {hakenmoto_id} ({employee.full_name_kanji}): "
                      f"'{factory_name_excel}' → [{factory_id}]")
                updated += 1
            elif create_missing and not dry_run:
                # Create a placeholder factory
                factory_id = create_missing_factory(factory_name_excel, db)
                employee.factory_id = factory_id
                db.commit()

                print(f"  ⚠ Employee {hakenmoto_id} ({employee.full_name_kanji}): "
                      f"'{factory_name_excel}' → [{factory_id}] (CREATED)")
                created += 1
                updated += 1
            else:
                not_found += 1
                failed_matches.append({
                    'hakenmoto_id': hakenmoto_id,
                    'name': employee.full_name_kanji,
                    'factory_name_excel': factory_name_excel
                })
                print(f"  ✗ Employee {hakenmoto_id} ({employee.full_name_kanji}): "
                      f"'{factory_name_excel}' - NO MATCH FOUND")

        # Summary
        print()
        print("=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print(f"Total employees with NULL factory_id: {len(employees_null)}")
        print(f"  ✓ Successfully {'would be ' if dry_run else ''}linked: {updated}")
        if created > 0:
            print(f"  ⚠ Factories created: {created}")
        print(f"  ✗ No match found: {not_found}")
        print(f"  ⚠ No Excel data: {no_excel_data}")
        print("=" * 70)

        if dry_run and updated > 0:
            print()
            print("ℹ️  This was a DRY RUN. No changes were made to the database.")
            print("   Run without --dry-run to apply changes.")

        # Show failed matches for manual review
        if failed_matches:
            print()
            print("=" * 70)
            print("FAILED MATCHES (requires manual review)")
            print("=" * 70)
            for item in failed_matches:
                print(f"  Employee {item['hakenmoto_id']} ({item['name']}): "
                      f"'{item['factory_name_excel']}'")

            # Show available factories for reference
            print()
            print("Available factories in database:")
            factories = db.query(Factory).all()
            for f in sorted(factories, key=lambda x: x.name)[:50]:
                print(f"  [{f.factory_id}] {f.name}")
            if len(factories) > 50:
                print(f"  ... and {len(factories) - 50} more")

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def main():
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(
        description='Re-link employees with NULL factory_id to their correct factories.'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be updated without making changes'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed matching information'
    )
    parser.add_argument(
        '--create-missing',
        action='store_true',
        help='Create placeholder factories for unmatched names'
    )

    args = parser.parse_args()

    relink_factories(
        dry_run=args.dry_run,
        verbose=args.verbose,
        create_missing=args.create_missing
    )


if __name__ == "__main__":
    main()
