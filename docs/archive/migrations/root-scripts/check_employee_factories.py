"""
Check Employee Factory References
==================================
Verify how many employees have factory_id references before update.
"""

import sys
from pathlib import Path

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from sqlalchemy import create_engine, text
from app.core.config import settings

def check_references():
    """Check employee factory references"""

    try:
        engine = create_engine(settings.DATABASE_URL)

        print("=" * 80)
        print("VERIFICACIÓN DE REFERENCIAS FACTORY_ID")
        print("=" * 80)
        print()

        with engine.connect() as conn:
            # Check factories
            result = conn.execute(text("SELECT COUNT(*) FROM factories"))
            factories_count = result.scalar()

            # Check employees with factory_id
            result = conn.execute(text("""
                SELECT COUNT(*) FROM employees
                WHERE factory_id IS NOT NULL
            """))
            employees_with_factory = result.scalar()

            # Check contract workers with factory_id
            result = conn.execute(text("""
                SELECT COUNT(*) FROM contract_workers
                WHERE factory_id IS NOT NULL
            """))
            contract_with_factory = result.scalar()

            # Get some examples
            result = conn.execute(text("""
                SELECT id, hakenmoto_id, factory_id
                FROM employees
                WHERE factory_id IS NOT NULL
                LIMIT 5
            """))
            employee_examples = result.fetchall()

            print("📊 RESUMEN:")
            print("-" * 80)
            print(f"   Total de fábricas en BD: {factories_count}")
            print(f"   Empleados con factory_id: {employees_with_factory}")
            print(f"   Contract workers con factory_id: {contract_with_factory}")
            print()

            if employee_examples:
                print("📋 EJEMPLOS DE EMPLEADOS CON FACTORY_ID:")
                print("-" * 80)
                for emp in employee_examples:
                    print(f"   Empleado ID: {emp[1]}, factory_id: '{emp[2]}'")
                print()

            print("⚠️  IMPORTANTE:")
            print("=" * 80)
            print(f"   Si ejecutas 'python update_factory_ids.py', se actualizarán:")
            print(f"   - {factories_count} registros en tabla 'factories'")
            print(f"   - {employees_with_factory} registros en tabla 'employees'")
            print(f"   - {contract_with_factory} registros en tabla 'contract_workers'")
            print()
            print("   ✅ El proceso es SEGURO:")
            print("      - Usa transacciones (rollback automático si hay error)")
            print("      - Mantiene la integridad referencial")
            print("      - Los empleados seguirán conectados a sus fábricas")
            print("=" * 80)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n⚠️  Asegúrate que Docker esté corriendo:")
        print("   docker compose up -d")

if __name__ == "__main__":
    check_references()
