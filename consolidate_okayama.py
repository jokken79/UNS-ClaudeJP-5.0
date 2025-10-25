"""
Consolidate Okayama Factories
==============================
Merge CVJ工場 and HUB工場 into single 岡山工場.json
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
BACKUP_DIR = FACTORIES_DIR / "backup" / f"before_okayama_consolidation_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

CVJ_FILE = FACTORIES_DIR / "高雄工業株式会社_CVJ工場.json"
HUB_FILE = FACTORIES_DIR / "高雄工業株式会社_HUB工場.json"
OKAYAMA_FILE = FACTORIES_DIR / "高雄工業株式会社_岡山工場.json"

def consolidate_okayama():
    """Consolidate CVJ and HUB factories into single 岡山工場"""

    print("=" * 80)
    print("CONSOLIDAR FÁBRICAS DE OKAYAMA")
    print("=" * 80)
    print()

    # Create backup directory
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Backup creado en: {BACKUP_DIR}")
    print()

    # Read CVJ factory
    print(f"📖 Leyendo: {CVJ_FILE.name}")
    with open(CVJ_FILE, 'r', encoding='utf-8') as f:
        cvj_data = json.load(f)

    # Read HUB factory
    print(f"📖 Leyendo: {HUB_FILE.name}")
    with open(HUB_FILE, 'r', encoding='utf-8') as f:
        hub_data = json.load(f)

    print()
    print(f"   CVJ工場: {len(cvj_data.get('lines', []))} líneas")
    print(f"   HUB工場: {len(hub_data.get('lines', []))} líneas")
    print()

    # Create consolidated structure
    # Use CVJ as base (both have same company, plant location, etc.)
    okayama_data = {
        "factory_id": "高雄工業株式会社_岡山工場",
        "client_company": cvj_data.get("client_company"),
        "plant": {
            "name": "岡山工場",
            "address": cvj_data.get("plant", {}).get("address"),
            "phone": cvj_data.get("plant", {}).get("phone"),
            "responsible": cvj_data.get("plant", {}).get("responsible")
        },
        "lines": [],
        "dispatch_company": cvj_data.get("dispatch_company"),
        "schedule": cvj_data.get("schedule"),
        "payment": cvj_data.get("payment"),
        "agreement": cvj_data.get("agreement")
    }

    # Add all lines from CVJ
    for line in cvj_data.get("lines", []):
        okayama_data["lines"].append(line)

    # Add all lines from HUB
    for line in hub_data.get("lines", []):
        okayama_data["lines"].append(line)

    print(f"✅ Consolidado: {len(okayama_data['lines'])} líneas totales")
    print()

    # Backup original files
    import shutil
    shutil.copy2(CVJ_FILE, BACKUP_DIR / CVJ_FILE.name)
    shutil.copy2(HUB_FILE, BACKUP_DIR / HUB_FILE.name)
    print(f"💾 Backup completado:")
    print(f"   {BACKUP_DIR / CVJ_FILE.name}")
    print(f"   {BACKUP_DIR / HUB_FILE.name}")
    print()

    # Write consolidated file
    with open(OKAYAMA_FILE, 'w', encoding='utf-8') as f:
        json.dump(okayama_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Creado: {OKAYAMA_FILE.name}")
    print()

    # Delete original files
    CVJ_FILE.unlink()
    HUB_FILE.unlink()

    print(f"🗑️  Eliminados:")
    print(f"   {CVJ_FILE.name}")
    print(f"   {HUB_FILE.name}")
    print()

    print("=" * 80)
    print("✅ CONSOLIDACIÓN COMPLETADA")
    print("=" * 80)
    print()
    print(f"📊 Resultado:")
    print(f"   Archivo nuevo: {OKAYAMA_FILE.name}")
    print(f"   Total líneas: {len(okayama_data['lines'])}")
    print(f"   Backup en: {BACKUP_DIR}")
    print()
    print("⚠️  IMPORTANTE:")
    print("   Los empleados con factory_id='高雄工業株式会社_CVJ工場' o")
    print("   '高雄工業株式会社_HUB工場' deben actualizarse a:")
    print("   '高雄工業株式会社_岡山工場'")
    print()

if __name__ == "__main__":
    consolidate_okayama()
