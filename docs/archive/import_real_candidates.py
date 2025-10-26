"""
Script para importar candidatos REALES desde Excel
Lee config/employee_master.xlsm
"""
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd

# Add parent directory to path
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Candidate


def import_real_candidates_from_excel():
    """
    Importa candidatos reales desde el archivo Excel original
    """

    # Ruta al archivo Excel (montado en Docker)
    excel_path = "/app/config/employee_master.xlsm"

    print(f"📂 Buscando archivo Excel: {excel_path}")

    # Verificar si el archivo existe
    if not Path(excel_path).exists():
        print(f"  ⚠️  Archivo no encontrado: {excel_path}")
        print(f"      Usando candidatos de demostración en su lugar.")
        return False

    try:
        # Leer todas las hojas del Excel
        print(f"  📖 Leyendo hojas del Excel...")
        xls = pd.ExcelFile(excel_path)
        print(f"  📄 Hojas encontradas: {xls.sheet_names}")

        # Intentar leer diferentes hojas posibles
        df = None
        sheet_name = None

        # Intentar hojas comunes
        for possible_sheet in ['Candidatos', '履歴書', 'candidates', 'Employees', 'empleados', '派遣社員']:
            if possible_sheet in xls.sheet_names:
                print(f"  ✓ Encontrada hoja: {possible_sheet}")
                df = pd.read_excel(excel_path, sheet_name=possible_sheet)
                sheet_name = possible_sheet
                break

        # Si no encontró ninguna hoja específica, usar la primera
        if df is None:
            print(f"  ! No se encontró hoja específica, usando primera hoja: {xls.sheet_names[0]}")
            df = pd.read_excel(excel_path, sheet_name=0)
            sheet_name = xls.sheet_names[0]

        print(f"  📊 Datos cargados: {len(df)} filas, {len(df.columns)} columnas")
        print(f"  📋 Columnas: {df.columns.tolist()}")

        # Mostrar primeras filas para entender estructura
        print(f"\n  📌 Primeras filas de datos:")
        print(df.head())

        return True

    except Exception as e:
        print(f"  ❌ Error al leer Excel: {str(e)}")
        return False


if __name__ == "__main__":
    print("==================================================")
    print("ANALIZANDO ARCHIVO EXCEL DE CANDIDATOS REALES")
    print("==================================================")
    print()

    import_real_candidates_from_excel()
