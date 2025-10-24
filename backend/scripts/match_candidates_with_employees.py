"""
Script to automatically match candidates with existing employees
and mark them as 'approved' if they are the same person.

Matches based on:
- Full name (kanji or roman)
- Date of birth
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.models import Candidate, Employee, CandidateStatus
from datetime import datetime
from sqlalchemy import or_, and_


def normalize_name(name: str) -> str:
    """Normalize name for comparison (lowercase, remove spaces)"""
    if not name:
        return ""
    return name.lower().replace(" ", "").replace("　", "")


def match_candidates_with_employees():
    """
    Compare all pending candidates with employees.
    If name and date of birth match, mark candidate as approved.
    """
    db = SessionLocal()

    try:
        # Get all pending candidates
        pending_candidates = db.query(Candidate).filter(
            Candidate.status == CandidateStatus.PENDING
        ).all()

        # Get all employees
        employees = db.query(Employee).all()

        print(f"Found {len(pending_candidates)} pending candidates")
        print(f"Found {len(employees)} employees")
        print("-" * 60)

        matched_count = 0

        for candidate in pending_candidates:
            # Skip if no date of birth
            if not candidate.date_of_birth:
                continue

            # Normalize candidate names
            candidate_kanji = normalize_name(candidate.full_name_kanji or "")
            candidate_kana = normalize_name(candidate.full_name_kana or "")

            # Try to match with employees
            for employee in employees:
                # Skip if no date of birth
                if not employee.date_of_birth:
                    continue

                # Check if dates match
                if candidate.date_of_birth != employee.date_of_birth:
                    continue

                # Normalize employee names
                employee_kanji = normalize_name(employee.full_name_kanji or "")
                employee_kana = normalize_name(employee.full_name_kana or "")

                # Check if names match (either kanji or kana)
                name_matches = (
                    (candidate_kanji and employee_kanji and candidate_kanji == employee_kanji) or
                    (candidate_kana and employee_kana and candidate_kana == employee_kana)
                )

                if name_matches:
                    # Found a match!
                    print(f"✓ MATCH FOUND:")
                    print(f"  Candidate ID: {candidate.id} ({candidate.rirekisho_id})")
                    print(f"  Name: {candidate.full_name_kanji or candidate.full_name_roman}")
                    print(f"  DOB: {candidate.date_of_birth}")
                    print(f"  → Matches Employee ID: {employee.id}")
                    print(f"  Name: {employee.full_name_kanji or employee.full_name_roman}")
                    print(f"  DOB: {employee.date_of_birth}")
                    print()

                    # Update candidate status to approved
                    candidate.status = CandidateStatus.APPROVED
                    candidate.approved_at = datetime.now()
                    matched_count += 1

                    # Break inner loop, move to next candidate
                    break

        # Commit all changes
        db.commit()

        print("-" * 60)
        print(f"✓ Matched and approved {matched_count} candidates")
        print(f"  Remaining pending: {len(pending_candidates) - matched_count}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("MATCHING CANDIDATES WITH EMPLOYEES")
    print("=" * 60)
    print()
    match_candidates_with_employees()
    print()
    print("Done!")
