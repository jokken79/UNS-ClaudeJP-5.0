"""
Update Factory IDs in Database
===============================
Update factory_id in factories and employees tables based on the mapping file.
"""

import json
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

def load_mapping():
    """Load factory ID mapping"""
    mapping_file = Path("D:/JPUNS-CLAUDE4.2/config/factories/factory_id_mapping.json")

    if not mapping_file.exists():
        print("❌ Error: No se encontró factory_id_mapping.json")
        print("   Primero ejecuta: python rename_factories.py")
        sys.exit(1)

    with open(mapping_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def update_database(mappings):
    """Update factory_id in database"""

    # Create database connection
    engine = create_engine(settings.DATABASE_URL)

    print("🔄 Actualizando base de datos...\n")

    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()

        try:
            for mapping in mappings:
                old_id = mapping["old_id"]
                new_id = mapping["new_id"]

                print(f"Actualizando: {old_id} → {new_id}")

                # Update factories table
                result = conn.execute(
                    text("UPDATE factories SET factory_id = :new_id WHERE factory_id = :old_id"),
                    {"new_id": new_id, "old_id": old_id}
                )
                factories_updated = result.rowcount

                # Update employees table
                result = conn.execute(
                    text("UPDATE employees SET factory_id = :new_id WHERE factory_id = :old_id"),
                    {"new_id": new_id, "old_id": old_id}
                )
                employees_updated = result.rowcount

                # Update contract_workers table
                result = conn.execute(
                    text("UPDATE contract_workers SET factory_id = :new_id WHERE factory_id = :old_id"),
                    {"new_id": new_id, "old_id": old_id}
                )
                contract_workers_updated = result.rowcount

                print(f"   Factories: {factories_updated}, Employees: {employees_updated}, Contract Workers: {contract_workers_updated}")

            # Commit transaction
            trans.commit()

            print("\n✅ Base de datos actualizada exitosamente!")

        except Exception as e:
            # Rollback on error
            trans.rollback()
            print(f"\n❌ Error actualizando base de datos: {e}")
            print("   Cambios revertidos (rollback)")
            raise


def main():
    """Main function"""
    print("=" * 80)
    print("ACTUALIZAR factory_id EN BASE DE DATOS")
    print("=" * 80)
    print()

    # Load mapping
    mappings = load_mapping()
    print(f"📋 {len(mappings)} factory_id para actualizar\n")

    # Ask for confirmation
    print("⚠️  Esta operación actualizará:")
    print("   - Tabla 'factories'")
    print("   - Tabla 'employees'")
    print("   - Tabla 'contract_workers'")
    print()

    try:
        response = input("¿Deseas continuar? (SI/no): ")
        if response.upper() != "SI":
            print("\n❌ Actualización cancelada.")
            return
    except EOFError:
        print("\n⚠️  Modo no-interactivo detectado. Cancelando por seguridad.")
        print("   Para ejecutar automáticamente, modifica el script.")
        return

    print()

    # Update database
    update_database(mappings)

    print("\n" + "=" * 80)
    print("✅ ACTUALIZACIÓN COMPLETADA")
    print("=" * 80)


if __name__ == "__main__":
    main()
