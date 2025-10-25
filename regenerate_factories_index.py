"""
Regenerate Factories Index
===========================
Create factories_index.json from the current JSON files with updated factory_id.
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
INDEX_FILE = Path("D:/JPUNS-CLAUDE4.2/config/factories_index.json")

def regenerate_index():
    """Regenerate factories index from JSON files"""

    print("=" * 80)
    print("REGENERAR ÍNDICE DE FÁBRICAS")
    print("=" * 80)
    print()

    # Get all factory JSON files (excluding example and backup)
    json_files = [
        f for f in FACTORIES_DIR.glob("*.json")
        if "example" not in f.name.lower()
        and "backup" not in str(f)
    ]

    print(f"📄 Encontrados {len(json_files)} archivos JSON\n")

    factories_list = []

    for json_file in sorted(json_files):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Skip if no valid data
            if not data.get("client_company") or not data.get("lines"):
                print(f"⏭️  Saltando {json_file.name} (sin datos válidos)")
                continue

            # Add each line as a separate entry (like the original index)
            for line in data.get("lines", []):
                entry = {
                    "factory_id": data.get("factory_id", ""),
                    "client_company": data.get("client_company", {}).get("name", ""),
                    "plant_name": data.get("plant", {}).get("name", ""),
                    "department": line.get("assignment", {}).get("department", ""),
                    "line": line.get("assignment", {}).get("line", ""),
                    "hourly_rate": line.get("job", {}).get("hourly_rate", 0.0)
                }
                factories_list.append(entry)

            print(f"✅ Procesado: {json_file.name} ({len(data.get('lines', []))} líneas)")

        except Exception as e:
            print(f"❌ Error procesando {json_file.name}: {e}")

    # Create index
    index = {
        "total_factories": len(factories_list),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "factories": factories_list
    }

    # Save index
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 80)
    print("✅ ÍNDICE REGENERADO")
    print("=" * 80)
    print(f"   Total de entradas: {len(factories_list)}")
    print(f"   Guardado en: {INDEX_FILE}")
    print("=" * 80)
    print()
    print("✅ Ahora cuando ejecutes REINSTALAR.bat, se cargarán automáticamente")
    print("   los nuevos factory_id (sin prefijo Factory-XX_)")
    print()


if __name__ == "__main__":
    regenerate_index()
