# 📘 GUÍA: Importar Tarifas de Seguros Sociales (愛知23)

## 📅 Fecha: 2025-10-24

## 🎯 OBJETIVO

Importar la tabla de tarifas de seguros sociales desde la hoja oculta **愛知23** del archivo `employee_master.xlsm` a la tabla `social_insurance_rates`.

---

## 📊 ESTRUCTURA DE LA HOJA 愛知23

### Headers (filas 1-11):
```
Fila 1-5: Título y fechas de vigencia
Fila 6-8: Headers de columnas (multi-nivel)
Fila 9-11: Sub-headers con tasas
Fila 12+: DATOS
```

### Columnas de DATOS:

| Col | Nombre | Descripción | Ejemplo |
|-----|--------|-------------|---------|
| 0 | 等級 | Grado/Nivel | 1, 2, 3... |
| 1 | 月額 | 標準報酬月額 (Standard Monthly Compensation) | 58000, 68000... |
| 2 | 円以上 | Rango mínimo del salario | 0, 63000, 73000... |
| 3 | から | Separador | ～ |
| 4 | 円未満 | Rango máximo del salario | 63000, 73000, 83000... |
| 5 | 健康保険全額 | Seguro salud TOTAL (sin 介護) | 5817.4 |
| 6 | 健康保険 | Seguro salud EMPLEADO (sin 介護) | 2908.7 |
| 7 | 介護保険全額 | Seguro salud TOTAL (con 介護) | 6739.6 |
| 8 | 介護保険 | Seguro salud EMPLEADO (con 介護) | 3369.8 |
| 9 | 厚生年金ALL | Pensión TOTAL | 16104 |
| 10 | 厚生年金 | Pensión EMPLEADO | 8052 |

**NOTA**: La diferencia entre columnas 5-6 vs 7-8 es:
- **Sin 介護保険** (Col 5-6): Para empleados **menores de 40 años**
- **Con 介護保険** (Col 7-8): Para empleados **de 40 años o más**

---

## 🛠️ IMPLEMENTACIÓN

### Paso 1: Actualizar la función en `backend/scripts/import_data.py`

Reemplaza la función `import_insurance_rates()` con este código:

```python
def import_insurance_rates(db: Session):
    """
    Import 社会保険料 (Social Insurance Rates) from 愛知23 hidden sheet

    Esta tabla contiene las tarifas de:
    - 健康保険 (Health Insurance) - con y sin 介護保険 (Nursing Care)
    - 厚生年金 (Employee Pension)

    Basadas en 標準報酬月額 (Standard Monthly Compensation)
    """
    print("=" * 50)
    print("IMPORTANDO TARIFAS DE SEGUROS (愛知23)")
    print("=" * 50)

    try:
        # Leer desde fila 12 (donde empiezan los datos reales)
        # skiprows=11 significa saltar las primeras 11 filas (0-10)
        df = pd.read_excel(
            '/app/config/employee_master.xlsm',
            sheet_name='愛知23',
            header=None,  # No usar header automático
            skiprows=11   # Saltar las 11 filas de título/headers
        )

        # Eliminar filas completamente vacías
        df = df.dropna(how='all')

        print(f"📋 Total de filas encontradas: {len(df)}")

        # Limpiar tabla existente (opcional - comentar si quieres mantener historial)
        # db.query(SocialInsuranceRate).delete()

        imported = 0
        skipped = 0

        for idx, row in df.iterrows():
            # Saltar filas sin 標準報酬月額 (monthly compensation)
            if pd.isna(row[1]) or row[1] == 0:
                continue

            try:
                # Extraer datos
                grade = str(row[0]) if pd.notna(row[0]) else None
                standard_compensation = int(float(row[1]))
                min_compensation = int(float(row[2])) if pd.notna(row[2]) else 0
                max_compensation = int(float(row[4])) if pd.notna(row[4]) else standard_compensation + 5000

                # Seguros de salud (sin 介護保険 - para <40 años)
                health_total_no_nursing = int(float(row[5])) if pd.notna(row[5]) else None
                health_employee_no_nursing = int(float(row[6])) if pd.notna(row[6]) else None

                # Seguros de salud (con 介護保険 - para ≥40 años)
                health_total_with_nursing = int(float(row[7])) if pd.notna(row[7]) else None
                health_employee_with_nursing = int(float(row[8])) if pd.notna(row[8]) else None

                # Pensión
                pension_total = int(float(row[9])) if pd.notna(row[9]) else None
                pension_employee = int(float(row[10])) if pd.notna(row[10]) else None

                # Calcular employer portion (diferencia entre total y employee)
                health_employer_no_nursing = (health_total_no_nursing - health_employee_no_nursing) if health_total_no_nursing and health_employee_no_nursing else None
                health_employer_with_nursing = (health_total_with_nursing - health_employee_with_nursing) if health_total_with_nursing and health_employee_with_nursing else None
                pension_employer = (pension_total - pension_employee) if pension_total and pension_employee else None

                # Verificar si ya existe este rango
                existing = db.query(SocialInsuranceRate).filter(
                    SocialInsuranceRate.standard_compensation == standard_compensation,
                    SocialInsuranceRate.prefecture == '愛知'
                ).first()

                if existing:
                    skipped += 1
                    continue

                # Crear registro
                rate = SocialInsuranceRate(
                    min_compensation=min_compensation,
                    max_compensation=max_compensation,
                    standard_compensation=standard_compensation,

                    # Health insurance WITHOUT nursing care (<40 years old)
                    health_insurance_total=health_total_no_nursing,
                    health_insurance_employee=health_employee_no_nursing,
                    health_insurance_employer=health_employer_no_nursing,

                    # Nursing care insurance (≥40 years old)
                    # Guardamos la DIFERENCIA en estos campos
                    nursing_insurance_total=(health_total_with_nursing - health_total_no_nursing) if health_total_with_nursing and health_total_no_nursing else None,
                    nursing_insurance_employee=(health_employee_with_nursing - health_employee_no_nursing) if health_employee_with_nursing and health_employee_no_nursing else None,
                    nursing_insurance_employer=(health_employer_with_nursing - health_employer_no_nursing) if health_employer_with_nursing and health_employer_no_nursing else None,

                    # Pension insurance
                    pension_insurance_total=pension_total,
                    pension_insurance_employee=pension_employee,
                    pension_insurance_employer=pension_employer,

                    # Metadata
                    effective_date=datetime.now().date(),  # O parsear de la hoja
                    prefecture='愛知',
                    notes=f'Grado: {grade}' if grade else None
                )

                db.add(rate)
                imported += 1

            except Exception as e:
                print(f"  ⚠ Error en fila {idx}: {e}")
                continue

        # Commit al final
        db.commit()

        print(f"✓ Importadas {imported} tarifas de seguros")
        if skipped > 0:
            print(f"  ⚠ {skipped} duplicados omitidos")

        return imported

    except Exception as e:
        db.rollback()
        print(f"✗ Error importando tarifas de seguros: {e}")
        import traceback
        traceback.print_exc()
        return 0
```

### Paso 2: Ejecutar la importación

Tienes **2 opciones**:

#### Opción A: Reiniciar Docker (importa todo de nuevo)

```bash
docker compose down
docker compose up -d
```

Esto ejecutará `import_data.py` completo, incluyendo las tarifas.

#### Opción B: Ejecutar solo la función de tarifas (recomendado)

```bash
docker exec uns-claudejp-backend python -c "
from app.core.database import SessionLocal
from scripts.import_data import import_insurance_rates

db = SessionLocal()
try:
    count = import_insurance_rates(db)
    print(f'\n✅ IMPORTADAS {count} TARIFAS')
finally:
    db.close()
"
```

---

## 🔍 VERIFICAR LA IMPORTACIÓN

Después de importar, verifica los datos:

```bash
docker exec uns-claudejp-backend python -c "
from app.core.database import SessionLocal
from app.models.models import SocialInsuranceRate

db = SessionLocal()
try:
    count = db.query(SocialInsuranceRate).count()
    print(f'Total tarifas importadas: {count}')

    # Mostrar primeras 5
    rates = db.query(SocialInsuranceRate).limit(5).all()
    print('\n📋 Primeras 5 tarifas:')
    for r in rates:
        print(f'  標準報酬: ¥{r.standard_compensation:,}')
        print(f'    Rango: ¥{r.min_compensation:,} - ¥{r.max_compensation:,}')
        print(f'    健康保険 (empleado): ¥{r.health_insurance_employee}')
        print(f'    厚生年金 (empleado): ¥{r.pension_insurance_employee}')
        print()
finally:
    db.close()
"
```

---

## 🎯 CÓMO USAR LAS TARIFAS EN CÁLCULOS

### Ejemplo: Calcular seguros para un empleado

```python
from app.models.models import SocialInsuranceRate, Employee
from datetime import date

# Obtener salario mensual del empleado
employee_salary = 250000  # ¥250,000/mes
employee_age = 42  # años

# Buscar la tarifa correspondiente
rate = db.query(SocialInsuranceRate).filter(
    SocialInsuranceRate.min_compensation <= employee_salary,
    SocialInsuranceRate.max_compensation > employee_salary,
    SocialInsuranceRate.prefecture == '愛知'
).first()

if rate:
    # Calcular deducción del empleado
    health_deduction = rate.health_insurance_employee
    pension_deduction = rate.pension_insurance_employee

    # Si el empleado tiene ≥40 años, agregar 介護保険
    nursing_deduction = 0
    if employee_age >= 40:
        nursing_deduction = rate.nursing_insurance_employee

    total_deduction = health_deduction + pension_deduction + nursing_deduction

    print(f"Deducciones para salario ¥{employee_salary:,}:")
    print(f"  健康保険: ¥{health_deduction}")
    print(f"  介護保険: ¥{nursing_deduction}")
    print(f"  厚生年金: ¥{pension_deduction}")
    print(f"  TOTAL: ¥{total_deduction}")
```

---

## 📝 NOTAS IMPORTANTES

### 1. **介護保険 (Nursing Care Insurance)**

- Solo aplica a empleados de **40 años o más**
- En la tabla guardamos la DIFERENCIA entre "con" y "sin" 介護
- Para calcular:
  - Si edad < 40: usar `health_insurance_employee`
  - Si edad ≥ 40: usar `health_insurance_employee + nursing_insurance_employee`

### 2. **Actualización de Tarifas**

Las tarifas cambian periódicamente (ej. 令和6年3月分). Para actualizar:

1. Obtener nuevo archivo Excel
2. Ejecutar `import_insurance_rates()` de nuevo
3. Opción: Limpiar tabla antes con `db.query(SocialInsuranceRate).delete()`
4. O mantener historial agregando campo `effective_date`

### 3. **Otras Prefecturas**

El modelo soporta múltiples prefecturas:
- `prefecture = '愛知'` (actual)
- Puedes agregar `prefecture = '東京'`, etc.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Cuando vayas a implementar:

- [ ] Hacer backup de la base de datos
- [ ] Actualizar función `import_insurance_rates()` en `import_data.py`
- [ ] Ejecutar importación (Opción A o B)
- [ ] Verificar que se importaron ~85 tarifas
- [ ] Probar cálculo con un empleado de prueba
- [ ] Integrar en cálculo de nómina (`salary_calculations`)

---

## 📚 REFERENCIAS

- **Archivo**: `config/employee_master.xlsm`
- **Hoja**: `愛知23` (oculta)
- **Modelo**: `backend/app/models/models.py` - `SocialInsuranceRate` (líneas 753-785)
- **Script**: `backend/scripts/import_data.py` - función `import_insurance_rates()`
- **Migración**: `backend/alembic/versions/a579f9a2a523_add_social_insurance_rates_table_simple.py`

---

**Generado por**: Claude Code
**Fecha**: 2025-10-24
