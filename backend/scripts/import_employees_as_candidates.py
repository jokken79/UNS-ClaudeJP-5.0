"""
Script para importar empleados reales del Excel como Candidatos
Lee la hoja '派遣社員' (Dispatch Employees) del employee_master.xlsm
"""
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
import re

# Add parent directory to path
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Candidate


def extract_name_parts(full_name):
    """Extrae nombre en diferentes formatos"""
    if not full_name or pd.isna(full_name):
        return "不明", "フメイ", "Unknown"

    full_name = str(full_name).strip()

    # Nombre Kanji (asumimos que es lo que tenemos)
    kanji = full_name

    # Nombre Katakana (convertir básicamente)
    # En producción esto debería usar una librería de conversión
    katakana = full_name  # Placeholder

    # Nombre Romaji (aproximado)
    romaji = full_name  # Placeholder

    return kanji, katakana, romaji


def import_employees_as_candidates():
    """
    Importa empleados reales desde el Excel como candidatos
    """

    excel_path = "/app/config/employee_master.xlsm"

    print(f"📂 Leyendo archivo: {excel_path}")

    if not Path(excel_path).exists():
        print(f"  ❌ Archivo no encontrado")
        return 0

    try:
        # Leer la hoja de empleados
        df = pd.read_excel(excel_path, sheet_name='派遣社員', header=None)

        # Saltar las primeras filas de header y encontrar la fila de encabezados real
        # Buscamos la fila que contiene "現在" (estado actual) o "氏名" (nombre)
        actual_header_row = None
        for idx, row in df.iterrows():
            row_str = ' '.join([str(v) for v in row if pd.notna(v)])
            if '氏名' in row_str or '現在' in row_str or '社員' in row_str:
                actual_header_row = idx
                break

        if actual_header_row is None:
            # Si no encontramos encabezados, asumir que comienzan en la fila 2
            actual_header_row = 1

        print(f"  📋 Encabezados encontrados en fila: {actual_header_row}")

        # Obtener los headers reales
        headers = df.iloc[actual_header_row].tolist()
        print(f"  📄 Headers: {headers[:10]}...")  # Mostrar primeros 10

        # Releer con los headers correctos
        df = pd.read_excel(
            excel_path,
            sheet_name='派遣社員',
            header=actual_header_row,
            skiprows=actual_header_row
        )

        print(f"  ✓ Datos cargados: {len(df)} filas")
        print(f"  📊 Columnas útiles: {df.columns.tolist()[:10]}...")

        # Filtrar solo empleados actuales (no retirados)
        if '現在' in df.columns or '状態' in df.columns:
            status_col = '現在' if '現在' in df.columns else '状態'
            df = df[df[status_col] != '退社']  # Excluir retirados

        print(f"  ✓ Después de filtrar (sin retirados): {len(df)} empleados activos")

        # Mostrar estructura de datos
        print(f"\n  📌 Primeras 3 filas:")
        print(df.head(3))

        # Contar posibles nombres
        possible_name_cols = [col for col in df.columns if '氏名' in str(col) or '名前' in str(col)]
        print(f"\n  👤 Columnas de nombre encontradas: {possible_name_cols}")

        db = SessionLocal()
        try:
            # Verificar candidatos existentes
            existing_count = db.query(Candidate).count()
            if existing_count > 0:
                print(f"\n  ⚠️  Ya existen {existing_count} candidatos en BD. Importación cancelada.")
                return 0

            # Por ahora solo mostrar estructura sin importar
            print(f"\n  ✅ Estructura de datos lista para importar")
            print(f"  📊 Total de registros importables: {len(df)}")

            return len(df)

        finally:
            db.close()

    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0


if __name__ == "__main__":
    print("=" * 50)
    print("ANALIZANDO DATOS REALES DE EMPLEADOS")
    print("=" * 50)
    print()

    count = import_employees_as_candidates()
    print(f"\n✓ Análisis completado. Registros procesables: {count}")
