"""
Update Factory ID Format
=========================
Change from Company_Plant to Company__Plant (double underscore)
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Paths
FACTORIES_DIR = Path("D:/JPUNS-CLAUDE4.2/config/factories")
BACKUP_DIR = FACTORIES_DIR / "backup" / f"before_double_underscore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def update_factory_id_format():
    """Update factory_id from Company_Plant to Company__Plant"""

    print("=" * 80)
    print("ACTUALIZAR FORMATO DE FACTORY_ID")
    print("=" * 80)
    print()

    # Create backup directory
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Backup creado en: {BACKUP_DIR}")
    print()

    # Get all factory JSON files (excluding example and backup)
    json_files = [
        f for f in FACTORIES_DIR.glob("*.json")
        if "example" not in f.name.lower()
        and "backup" not in str(f)
    ]

    print(f"📄 Encontrados {len(json_files)} archivos JSON\\n")

    import shutil

    for json_file in sorted(json_files):
        try:
            # Backup
            shutil.copy2(json_file, BACKUP_DIR / json_file.name)

            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Skip if no valid data
            if not data.get("client_company") or not data.get("plant"):
                print(f"⏭️  Saltando {json_file.name} (sin datos válidos)")
                continue

            # Get current factory_id (Company_Plant)
            old_factory_id = data.get("factory_id", "")

            # Extract company and plant names
            company_name = data.get("client_company", {}).get("name", "")
            plant_name = data.get("plant", {}).get("name", "")

            # Create new factory_id with double underscore
            new_factory_id = f"{company_name}__{plant_name}"

            # Update factory_id
            data["factory_id"] = new_factory_id

            # Update all line_ids to use new format too
            if "lines" in data:
                for line in data["lines"]:
                    old_line_id = line.get("line_id", "")
                    # Keep the last part (unique identifier)
                    if "_" in old_line_id:
                        parts = old_line_id.split("_")
                        # If it's like "Company_Plant_Line1" or "Factory-XX"
                        if old_line_id.startswith("Factory-"):
                            line["line_id"] = old_line_id  # Keep Factory-XX format for lines
                        else:
                            # Last part is the line identifier
                            line_identifier = parts[-1]
                            line["line_id"] = f"{new_factory_id}_{line_identifier}"

            # Save updated file
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"✅ Actualizado: {json_file.name}")
            print(f"   Viejo: {old_factory_id}")
            print(f"   Nuevo: {new_factory_id}")
            print()

        except Exception as e:
            print(f"❌ Error procesando {json_file.name}: {e}")

    print("=" * 80)
    print("✅ FORMATO ACTUALIZADO")
    print("=" * 80)
    print()
    print(f"📊 Resultado:")
    print(f"   Archivos actualizados: {len(json_files)}")
    print(f"   Nuevo formato: Company__Plant (doble underscore)")
    print(f"   Backup en: {BACKUP_DIR}")
    print()

if __name__ == "__main__":
    update_factory_id_format()
