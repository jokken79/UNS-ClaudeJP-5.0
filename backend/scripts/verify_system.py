"""
System Verification Script
Checks all components are working correctly after import
"""
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Candidate, Factory, Employee, User
import json


def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def verify_database_connection():
    """Check database connectivity"""
    print_header("1. Database Connection")
    try:
        db = SessionLocal()
        # Simple query to verify connection
        result = db.execute("SELECT 1").scalar()
        db.close()
        print("✅ Database connection: OK")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False


def verify_candidates():
    """Check candidate data"""
    print_header("2. Candidate Data")
    try:
        db = SessionLocal()

        total = db.query(Candidate).count()
        print(f"✅ Total candidates: {total}")

        if total == 0:
            print("   ⚠️  No candidates found - import may not have completed")
            db.close()
            return False

        # Show sample
        print(f"\n📋 Sample candidates:")
        samples = db.query(Candidate).limit(3).all()
        for i, candidate in enumerate(samples, 1):
            print(f"\n   {i}. {candidate.seimei_romaji}")
            print(f"      - Katakana: {candidate.seimei_katakana}")
            print(f"      - Birth Date: {candidate.birth_date}")
            print(f"      - Nationality: {candidate.nationality}")
            print(f"      - Status: {candidate.status}")

        # Statistics
        by_status = db.query(Candidate.status, db.func.count(Candidate.id)) \
            .group_by(Candidate.status).all()

        print(f"\n📊 Candidates by status:")
        for status, count in by_status:
            print(f"   - {status}: {count}")

        # Check visa status distribution
        visa_statuses = db.query(Candidate.visa_status, db.func.count(Candidate.id)) \
            .group_by(Candidate.visa_status).all()

        print(f"\n🛂 Visa status distribution:")
        for visa, count in visa_statuses:
            print(f"   - {visa}: {count}")

        db.close()
        return total > 0

    except Exception as e:
        print(f"❌ Error checking candidates: {str(e)}")
        return False


def verify_factories():
    """Check factory data"""
    print_header("3. Factory Data")
    try:
        db = SessionLocal()

        total = db.query(Factory).count()
        print(f"✅ Total factories: {total}")

        if total == 0:
            print("   ⚠️  No factories found")
            db.close()
            return False

        # Show sample
        print(f"\n📋 Sample factories:")
        samples = db.query(Factory).limit(5).all()
        for i, factory in enumerate(samples, 1):
            print(f"   {i}. {factory.name}")

        db.close()
        return total > 0

    except Exception as e:
        print(f"❌ Error checking factories: {str(e)}")
        return False


def verify_employees():
    """Check employee data"""
    print_header("4. Employee Data")
    try:
        db = SessionLocal()

        total = db.query(Employee).count()
        print(f"✅ Total employees: {total}")

        if total > 0:
            # Check which are linked to candidates
            linked = db.query(Employee).filter(Employee.rirekisho_id.isnot(None)).count()
            print(f"   - Linked to candidates: {linked}")

            # Show sample
            print(f"\n📋 Sample employees:")
            samples = db.query(Employee).limit(3).all()
            for i, emp in enumerate(samples, 1):
                print(f"   {i}. {emp.name} (ID: {emp.id})")

        db.close()
        return True

    except Exception as e:
        print(f"❌ Error checking employees: {str(e)}")
        return False


def verify_users():
    """Check user data"""
    print_header("5. User Accounts")
    try:
        db = SessionLocal()

        total = db.query(User).count()
        print(f"✅ Total users: {total}")

        # Check for admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print(f"✅ Admin user exists: {admin.email}")
        else:
            print("❌ Admin user not found")

        # Show all users
        if total > 0:
            print(f"\n👥 All users:")
            users = db.query(User).all()
            for user in users:
                print(f"   - {user.username} ({user.email}) - Role: {user.role}")

        db.close()
        return admin is not None

    except Exception as e:
        print(f"❌ Error checking users: {str(e)}")
        return False


def verify_excel_file():
    """Check if Excel file exists"""
    print_header("6. Real Data Source")
    excel_path = Path("/app/config/employee_master.xlsm")

    if excel_path.exists():
        size_mb = excel_path.stat().st_size / (1024 * 1024)
        print(f"✅ Excel file found: {size_mb:.1f} MB")
        print(f"   Location: {excel_path}")
        print(f"   ℹ️  Real candidate data will be imported")
        return True
    else:
        print(f"⚠️  Excel file not found: {excel_path}")
        print(f"   ℹ️  Demo candidates are being used")
        print(f"   📝 To use real data, place employee_master.xlsm in config/ and re-run")
        return False


def verify_factories_directory():
    """Check factory JSON files"""
    print_header("7. Factory Configuration Files")
    try:
        factories_dir = Path("/app/config/factories")
        backup_dir = Path("/app/config/factories/backup")

        if factories_dir.exists():
            json_files = list(factories_dir.glob("*.json"))
            print(f"✅ Factories directory exists")
            print(f"   - JSON files in active directory: {len(json_files)}")

            if len(json_files) > 0:
                # Show sample
                print(f"\n   📋 Sample factory files:")
                for f in json_files[:3]:
                    print(f"      - {f.name}")
            else:
                print(f"   ⚠️  No factory files in active directory")

        if backup_dir.exists():
            backup_files = list(backup_dir.glob("*.json"))
            print(f"\n✅ Backup factories directory exists")
            print(f"   - JSON files in backup: {len(backup_files)}")

        return len(json_files) > 0

    except Exception as e:
        print(f"❌ Error checking factory files: {str(e)}")
        return False


def generate_report():
    """Generate complete verification report"""
    print("\n" + "="*60)
    print("  UNS-CLAUDEJP 5.0 - SYSTEM VERIFICATION REPORT")
    print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    results = {
        "Database Connection": verify_database_connection(),
        "Candidates": verify_candidates(),
        "Factories": verify_factories(),
        "Employees": verify_employees(),
        "Users": verify_users(),
        "Excel File": verify_excel_file(),
        "Factory Files": verify_factories_directory(),
    }

    # Summary
    print_header("VERIFICATION SUMMARY")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for check, result in results.items():
        status = "✅ PASS" if result else "⚠️  WARN"
        print(f"{status}: {check}")

    print(f"\nOverall: {passed}/{total} checks passed")

    if passed == total:
        print("\n🎉 All systems operational!")
        print("\nYou can now:")
        print("  1. Open http://localhost:3000")
        print("  2. Login with: admin / admin123")
        print("  3. Navigate to Candidatos to see imported data")
    else:
        print("\n⚠️  Some components may need attention")
        print("Check the details above for guidance")

    print("\n" + "="*60)


if __name__ == "__main__":
    generate_report()
