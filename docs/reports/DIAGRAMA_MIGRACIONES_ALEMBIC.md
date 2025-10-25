# Diagrama de Cadena de Migraciones Alembic

**Fecha:** 2025-10-26
**Estado:** PROBLEMAS DETECTADOS

---

## Estado Actual de la Cadena (CON PROBLEMAS)

```
initial_baseline (None)
    ↓
d49ae3cbfac6 (add_reception_date)
    ↓
7b5286821f25 (add_missing_columns_to_candidates)
    ↓
3c20e838905b (add_more_missing_columns_to_candidates)
    ↓
e8f3b9c41a2e (add_employee_excel_fields)
    ↓
ef4a15953791 (add_calculated_hours_and_approval)
    ↓
fe6aac62e522 (add_missing_candidate_columns_simple)
    ↓
a579f9a2a523 (add_social_insurance_rates_table_simple)  ← ⚠️ PROBLEMA: Apunta de vuelta a fe6aac62e522
    ↓                                                        Esto crea un BUCLE CIRCULAR
fe6aac62e522 ← ┐
    ↓          │
    └──────────┘  BUCLE INFINITO DETECTADO
```

**Problema identificado:**
El archivo `a579f9a2a523_add_social_insurance_rates_table_simple.py` tiene:
```python
down_revision: Union[str, None] = 'fe6aac62e522'
```

Pero `fe6aac62e522_add_missing_candidate_columns_simple.py` ya apunta a `ef4a15953791`, creando un bucle.

---

## Cadena Correcta Esperada

```
initial_baseline (None)
    ↓
d49ae3cbfac6 (add_reception_date)
    ↓
7b5286821f25 (add_missing_columns_to_candidates)
    ↓
3c20e838905b (add_more_missing_columns_to_candidates)
    ↓
e8f3b9c41a2e (add_employee_excel_fields)
    ↓
ef4a15953791 (add_calculated_hours_and_approval)
    ↓
fe6aac62e522 (add_missing_candidate_columns_simple)  ← CORRECTO
    ↓
a579f9a2a523 (add_social_insurance_rates_table_simple)  ← Debería apuntar a ef4a15953791
    ↓
5584c9c895e2 (add_three_part_address_to_employees)
    ↓
a1b2c3d4e5f6 (add_system_settings_table)
    ↓
ab12cd34ef56 (add_company_plant_separation)
    ↓
20251024_120000 (remove_duplicate_building_name_column)
```

---

## Análisis Detallado de Cada Migración

### 1. initial_baseline.py
- **Revision ID:** `initial_baseline`
- **Down Revision:** `None` (es la primera migración)
- **Estado:** ✅ OK

### 2. d49ae3cbfac6_add_reception_date.py
- **Revision ID:** `d49ae3cbfac6`
- **Down Revision:** `initial_baseline`
- **Estado:** ✅ OK

### 3. 7b5286821f25_add_missing_columns_to_candidates.py
- **Revision ID:** `7b5286821f25`
- **Down Revision:** `d49ae3cbfac6`
- **Estado:** ✅ OK

### 4. 3c20e838905b_add_more_missing_columns_to_candidates.py
- **Revision ID:** `3c20e838905b`
- **Down Revision:** `7b5286821f25`
- **Estado:** ✅ OK

### 5. e8f3b9c41a2e_add_employee_excel_fields.py
- **Revision ID:** `e8f3b9c41a2e`
- **Down Revision:** `3c20e838905b`
- **Estado:** ✅ OK

### 6. ef4a15953791_add_calculated_hours_and_approval_to_.py
- **Revision ID:** `ef4a15953791`
- **Down Revision:** `e8f3b9c41a2e`
- **Estado:** ✅ OK

### 7. fe6aac62e522_add_missing_candidate_columns_simple.py
- **Revision ID:** `fe6aac62e522`
- **Down Revision:** `ef4a15953791`
- **Estado:** ✅ OK

### 8. a579f9a2a523_add_social_insurance_rates_table_simple.py ⚠️
- **Revision ID:** `a579f9a2a523`
- **Down Revision:** `fe6aac62e522` ← **PROBLEMA: Debería ser `ef4a15953791`**
- **Estado:** ❌ ERROR - Crea bucle circular

**Corrección necesaria:**
```python
# Cambiar línea 16 en el archivo:
# DE:
down_revision: Union[str, None] = 'fe6aac62e522'

# A:
down_revision: Union[str, None] = 'ef4a15953791'
```

### 9. 5584c9c895e2_add_three_part_address_to_employees.py
- **Revision ID:** `5584c9c895e2`
- **Down Revision:** `a579f9a2a523`
- **Estado:** ⚠️ DEPENDE - Funciona si se corrige #8

### 10. a1b2c3d4e5f6_add_system_settings_table.py
- **Revision ID:** `a1b2c3d4e5f6`
- **Down Revision:** `5584c9c895e2`
- **Estado:** ⚠️ DEPENDE - Funciona si se corrige #8

### 11. ab12cd34ef56_add_company_plant_separation.py
- **Revision ID:** `ab12cd34ef56`
- **Down Revision:** `a1b2c3d4e5f6`
- **Estado:** ⚠️ DEPENDE - Funciona si se corrige #8
- **Comentario:** Tiene comentario `# Updated to latest head`

### 12. 20251024_120000_remove_duplicate_building_name_column.py
- **Revision ID:** `20251024_120000`
- **Down Revision:** `ab12cd34ef56`
- **Estado:** ⚠️ DEPENDE - Funciona si se corrige #8
- **Comentario:** Tiene comentario `# Fixed: was creating a branch at d49ae3cbfac6`

---

## Comandos de Diagnóstico

### Ver estado actual de migraciones
```bash
cd D:\JPUNS-CLAUDE4.2\backend
docker exec -it uns-claudejp-backend alembic current
```

### Ver historial completo
```bash
docker exec -it uns-claudejp-backend alembic history --verbose
```

### Intentar aplicar migraciones (puede fallar)
```bash
docker exec -it uns-claudejp-backend alembic upgrade head
```

---

## Solución Paso a Paso

### Opción 1: Corregir el Archivo Problemático (RECOMENDADO)

1. **Editar el archivo:**
   ```bash
   D:\JPUNS-CLAUDE4.2\backend\alembic\versions\a579f9a2a523_add_social_insurance_rates_table_simple.py
   ```

2. **Cambiar línea 16:**
   ```python
   # DE:
   down_revision: Union[str, None] = 'fe6aac62e522'

   # A:
   down_revision: Union[str, None] = 'ef4a15953791'
   ```

3. **Verificar que no haya otros conflictos:**
   ```bash
   cd D:\JPUNS-CLAUDE4.2\backend
   findstr /s /i "down_revision" alembic\versions\*.py
   ```

4. **Probar la cadena corregida:**
   ```bash
   docker compose down -v
   docker compose up -d db
   timeout /t 30
   docker compose up -d importer
   docker compose logs -f importer
   ```

### Opción 2: Recrear Migraciones Desde Cero (NUCLEAR)

⚠️ **ADVERTENCIA:** Esta opción eliminará TODO el historial de migraciones.

1. **Hacer backup:**
   ```bash
   cd D:\JPUNS-CLAUDE4.2
   mkdir backend\alembic\versions_backup
   copy backend\alembic\versions\*.py backend\alembic\versions_backup\
   ```

2. **Eliminar todas las migraciones:**
   ```bash
   del backend\alembic\versions\*.py
   ```

3. **Crear migración inicial desde modelos:**
   ```bash
   docker exec -it uns-claudejp-backend alembic revision --autogenerate -m "initial_complete_schema"
   ```

4. **Aplicar nueva migración:**
   ```bash
   docker exec -it uns-claudejp-backend alembic upgrade head
   ```

---

## Validación Post-Corrección

Después de corregir el problema, ejecutar:

```bash
# 1. Validar cadena de migraciones
cd D:\JPUNS-CLAUDE4.2\backend
python -c "from alembic import command; from alembic.config import Config; cfg = Config('alembic.ini'); command.history(cfg)"

# 2. Aplicar migraciones en BD limpia
docker compose down -v
docker compose up -d db
timeout /t 30
docker compose exec backend alembic upgrade head

# 3. Verificar tablas creadas
docker compose exec db psql -U uns_admin -d uns_claudejp -c "\dt"
```

---

## Tabla Resumen de Problemas

| Migración | Revision ID | Down Revision | Estado | Acción Requerida |
|-----------|-------------|---------------|--------|------------------|
| initial_baseline | initial_baseline | None | ✅ OK | Ninguna |
| d49ae3cbfac6 | d49ae3cbfac6 | initial_baseline | ✅ OK | Ninguna |
| 7b5286821f25 | 7b5286821f25 | d49ae3cbfac6 | ✅ OK | Ninguna |
| 3c20e838905b | 3c20e838905b | 7b5286821f25 | ✅ OK | Ninguna |
| e8f3b9c41a2e | e8f3b9c41a2e | 3c20e838905b | ✅ OK | Ninguna |
| ef4a15953791 | ef4a15953791 | e8f3b9c41a2e | ✅ OK | Ninguna |
| fe6aac62e522 | fe6aac62e522 | ef4a15953791 | ✅ OK | Ninguna |
| a579f9a2a523 | a579f9a2a523 | fe6aac62e522 | ❌ ERROR | Cambiar a ef4a15953791 |
| 5584c9c895e2 | 5584c9c895e2 | a579f9a2a523 | ⚠️ DEPENDE | Esperar corrección |
| a1b2c3d4e5f6 | a1b2c3d4e5f6 | 5584c9c895e2 | ⚠️ DEPENDE | Esperar corrección |
| ab12cd34ef56 | ab12cd34ef56 | a1b2c3d4e5f6 | ⚠️ DEPENDE | Esperar corrección |
| 20251024_120000 | 20251024_120000 | ab12cd34ef56 | ⚠️ DEPENDE | Esperar corrección |

---

## Próximos Pasos

1. ✅ **Corregir** `a579f9a2a523_add_social_insurance_rates_table_simple.py`
2. ✅ **Validar** con `alembic history`
3. ✅ **Probar** con `alembic upgrade head` en BD limpia
4. ✅ **Ejecutar** REINSTALAR.bat con confianza

---

**Generado por:** Claude Code Agent
**Fecha:** 2025-10-26
**Versión del proyecto:** JPUNS-CLAUDE4.2 v4.2
