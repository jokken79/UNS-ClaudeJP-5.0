"""
Rename Factory JSON Files
==========================
Remove "Factory-XX_" prefix from filenames and update factory_id inside files.
"""

import json
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Paths
FACTORIES_DIR = Path("D:/JPUNS-CLAUDE4.2/config/factories")
BACKUP_DIR = FACTORIES_DIR / "backup"

def create_backup():
    """Create backup before renaming"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"before_rename_{timestamp}"
    backup_path.mkdir(parents=True, exist_ok=True)

    print(f"📦 Creando backup en: {backup_path}")

    # Copy all JSON files
    json_files = list(FACTORIES_DIR.glob("Factory-*.json"))
    for json_file in json_files:
        shutil.copy2(json_file, backup_path / json_file.name)

    print(f"✅ {len(json_files)} archivos respaldados\n")
    return backup_path


def rename_files():
    """Rename files and update factory_id"""
    print("🔄 Procesando archivos...\n")

    json_files = sorted(FACTORIES_DIR.glob("Factory-*.json"))

    mappings = []  # Store old_id -> new_id mappings for database update

    for json_file in json_files:
        # Skip example file
        if "example" in json_file.name.lower():
            print(f"⏭️  Saltando archivo de ejemplo: {json_file.name}\n")
            continue

        # Read current content
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        old_factory_id = data.get("factory_id", "")
        old_name = json_file.name

        # Extract company and plant names
        client_company = data.get("client_company")
        plant = data.get("plant")

        # Skip if no valid data
        if not client_company or not plant:
            print(f"⏭️  Saltando archivo sin datos: {json_file.name}\n")
            continue

        company_name = client_company.get("name", "Unknown").strip()
        plant_name = plant.get("name", "Unknown").strip()

        # Clean names (remove invalid characters for filenames)
        import re
        company_name_clean = re.sub(r'[\t\n\r\\/:*?"<>|]', '', company_name)
        plant_name_clean = re.sub(r'[\t\n\r\\/:*?"<>|]', '', plant_name)

        # Create new filename: Empresa_Planta.json
        new_filename = f"{company_name_clean}_{plant_name_clean}.json"
        new_path = FACTORIES_DIR / new_filename

        # Create new factory_id (same as filename without .json)
        new_factory_id = f"{company_name_clean}_{plant_name_clean}"

        # Update factory_id in JSON
        data["factory_id"] = new_factory_id

        # Write updated content to new file
        with open(new_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ Renombrado:")
        print(f"   De: {old_name}")
        print(f"   A:  {new_filename}")
        print(f"   factory_id: {old_factory_id} → {new_factory_id}")
        print()

        # Store mapping for database update
        mappings.append({
            "old_id": old_factory_id,
            "new_id": new_factory_id,
            "old_file": old_name,
            "new_file": new_filename
        })

        # Delete old file if different from new
        if json_file != new_path:
            json_file.unlink()

    return mappings


def save_mapping(mappings):
    """Save ID mapping for database update"""
    mapping_file = FACTORIES_DIR / "factory_id_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mappings, f, ensure_ascii=False, indent=2)

    print(f"📄 Mapeo guardado en: {mapping_file}")
    print(f"   Usa este archivo para actualizar la base de datos\n")


def main():
    """Main function"""
    print("=" * 80)
    print("RENOMBRAR ARCHIVOS DE FÁBRICAS")
    print("=" * 80)
    print()
    print("Esta operación:")
    print("  - Quitará el prefijo 'Factory-XX_' de los nombres de archivo")
    print("  - Actualizará el factory_id dentro de cada JSON")
    print("  - Creará un backup antes de hacer cambios")
    print()

    # Create backup
    backup_path = create_backup()

    # Rename files
    mappings = rename_files()

    # Save mapping
    save_mapping(mappings)

    print("=" * 80)
    print("✅ RENOMBRADO COMPLETADO")
    print("=" * 80)
    print(f"   Total archivos procesados: {len(mappings)}")
    print(f"   Backup guardado en: {backup_path}")
    print()
    print("⚠️  IMPORTANTE: Debes actualizar la base de datos ejecutando:")
    print("   python update_factory_ids.py")
    print("=" * 80)


if __name__ == "__main__":
    main()
