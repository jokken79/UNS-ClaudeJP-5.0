"""
Script para analizar hojas ocultas del Excel
"""
import pandas as pd
import openpyxl
from pathlib import Path

def analyze_sheet(file_path, sheet_name):
    """Analiza una hoja específica del Excel"""
    print("\n" + "=" * 80)
    print(f"📄 ANÁLISIS DE HOJA: '{sheet_name}'")
    print("=" * 80)

    try:
        # Leer con diferentes configuraciones de header
        for header_row in [None, 0, 1, 2]:
            try:
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=header_row)

                if len(df) > 0:
                    print(f"\n✅ LECTURA EXITOSA con header={header_row}")
                    print(f"   Filas totales: {len(df)}")
                    print(f"   Columnas: {len(df.columns)}")

                    # Mostrar primeras 3 filas
                    print(f"\n   📋 Primeras 3 filas:")
                    print(df.head(3).to_string())

                    # Mostrar nombres de columnas
                    print(f"\n   📝 Columnas ({len(df.columns)}):")
                    for i, col in enumerate(df.columns, 1):
                        print(f"      {i:2d}. {col}")

                    break
            except Exception as e:
                continue

    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    file_path = "/app/config/employee_master_NEW.xlsm"

    print("\n" + "🔍" * 40)
    print("ANÁLISIS DE HOJAS OCULTAS")
    print("🔍" * 40)

    # Analizar DBTaishaX (empleados que renunciaron)
    analyze_sheet(file_path, "DBTaishaX")

    # Analizar 愛知23 (seguros sociales)
    analyze_sheet(file_path, "愛知23")


if __name__ == "__main__":
    main()
