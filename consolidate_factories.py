"""
Consolidate Factory JSON Files
================================
Merge duplicate factory files (same company + plant) into single files
with an array of lines/departments.
"""

import json
import os
import sys
import shutil
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Paths
FACTORIES_DIR = Path("D:/JPUNS-CLAUDE4.2/config/factories")
BACKUP_DIR = FACTORIES_DIR / "backup"

def create_backup():
    """Create backup of original files"""
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"backup_{timestamp}"
    backup_path.mkdir(parents=True)

    print(f"📦 Creando backup en: {backup_path}")

    # Copy all JSON files
    json_files = list(FACTORIES_DIR.glob("*.json"))
    for json_file in json_files:
        shutil.copy2(json_file, backup_path / json_file.name)

    print(f"✅ {len(json_files)} archivos respaldados\n")
    return backup_path


def get_factory_key(data):
    """Generate a unique key for company + plant"""
    company = data.get("client_company", {}).get("name", "").strip()
    plant = data.get("plant", {}).get("name", "").strip()
    return f"{company}_{plant}"


def analyze_factories():
    """Analyze all factory JSON files and group by company + plant"""
    print("🔍 Analizando archivos de fábricas...\n")

    groups = defaultdict(list)

    for json_file in sorted(FACTORIES_DIR.glob("Factory-*.json")):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Skip if no factory_id
            if "factory_id" not in data:
                continue

            key = get_factory_key(data)
            groups[key].append({
                "file": json_file,
                "factory_id": data["factory_id"],
                "data": data
            })
        except Exception as e:
            print(f"⚠️  Error leyendo {json_file.name}: {e}")

    # Show summary
    print(f"📊 Resumen del análisis:")
    print(f"   Total archivos: {sum(len(files) for files in groups.values())}")
    print(f"   Empresas únicas: {len(groups)}\n")

    # Show duplicates
    print("📋 Grupos con múltiples archivos (duplicados):")
    duplicates_count = 0
    for key, files in sorted(groups.items()):
        if len(files) > 1:
            duplicates_count += 1
            print(f"   {key}: {len(files)} archivos")
            for f in files:
                print(f"      - {f['file'].name} (ID: {f['factory_id']})")

    print(f"\n   Total grupos duplicados: {duplicates_count}\n")

    return groups


def consolidate_group(key, files):
    """
    Consolidate multiple files of same company+plant into one file
    with array of lines.
    """
    if len(files) == 1:
        return None  # No need to consolidate

    # Use first file as base
    base_file = files[0]
    base_data = base_file["data"]
    base_factory_id = base_file["factory_id"]

    # Create consolidated structure
    consolidated = {
        "factory_id": base_factory_id,
        "client_company": base_data.get("client_company"),
        "plant": base_data.get("plant"),
        "lines": [],  # Array of lines/departments
        "dispatch_company": base_data.get("dispatch_company"),
        "schedule": base_data.get("schedule"),
        "payment": base_data.get("payment"),
        "agreement": base_data.get("agreement")
    }

    # Add all lines
    for file_info in files:
        data = file_info["data"]
        line = {
            "line_id": data.get("factory_id"),
            "assignment": data.get("assignment"),
            "job": data.get("job")
        }
        consolidated["lines"].append(line)

    return consolidated


def save_consolidated(key, consolidated_data, original_files):
    """Save consolidated file and remove originals"""
    # Use first file's name as base
    first_file = original_files[0]["file"]
    output_file = first_file

    # Save consolidated
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(consolidated_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Consolidado: {output_file.name} ({len(consolidated_data['lines'])} líneas)")

    # Remove duplicate files (skip the first one)
    for file_info in original_files[1:]:
        file_path = file_info["file"]
        file_path.unlink()
        print(f"   🗑️  Eliminado: {file_path.name}")


def main():
    """Main consolidation function"""
    print("=" * 60)
    print("CONSOLIDACIÓN DE ARCHIVOS DE FÁBRICAS")
    print("=" * 60)
    print()

    # Create backup
    backup_path = create_backup()

    # Analyze
    groups = analyze_factories()

    # Check for --yes flag
    import sys
    auto_yes = '--yes' in sys.argv or '-y' in sys.argv

    if not auto_yes:
        # Ask for confirmation
        print("⚠️  ¿Deseas continuar con la consolidación?")
        print("   - Se crearán archivos con array de líneas")
        print("   - Se eliminarán archivos duplicados")
        print(f"   - Backup guardado en: {backup_path}")
        try:
            response = input("\nEscribe 'SI' para continuar: ")
            if response.upper() != "SI":
                print("\n❌ Consolidación cancelada.")
                return
        except EOFError:
            print("\n⚠️  No se puede pedir confirmación en modo no-interactivo.")
            print("   Usa --yes para ejecutar automáticamente.")
            return
    else:
        print(f"✅ Modo automático activado (--yes)")
        print(f"   Backup guardado en: {backup_path}")

    print("\n🔄 Iniciando consolidación...\n")

    # Consolidate each group
    consolidated_count = 0
    for key, files in groups.items():
        if len(files) > 1:
            consolidated_data = consolidate_group(key, files)
            if consolidated_data:
                save_consolidated(key, consolidated_data, files)
                consolidated_count += 1

    print(f"\n{'=' * 60}")
    print(f"✅ CONSOLIDACIÓN COMPLETADA")
    print(f"{'=' * 60}")
    print(f"   Grupos consolidados: {consolidated_count}")
    print(f"   Backup guardado en: {backup_path}")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
