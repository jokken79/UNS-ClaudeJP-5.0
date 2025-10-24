# 📊 REPORTE DE COMPARACIÓN DE ARCHIVOS EXCEL

**Fecha**: 2025-10-24
**Archivos comparados**:
- `employee_master.xlsm` (ACTUAL)
- `【新】社員台帳(UNS)T.xlsm` (NUEVO)

---

## 🔍 RESUMEN EJECUTIVO

### Diferencias Principales

| Aspecto | ACTUAL | NUEVO | Diferencia |
|---------|--------|-------|------------|
| **Total de hojas** | 10 | 10 | ✅ Igual |
| **派遣社員 (filas)** | 1,043 | **1,048** | +5 empleados |
| **請負社員 (filas)** | 142 | 142 | ✅ Igual |
| **スタッフ (filas)** | 21 | 21 | ✅ Igual |
| **Hojas ocultas** | 6 | 6 | ✅ Igual |

**📈 CONCLUSIÓN**: El archivo NUEVO tiene **5 empleados adicionales** en la hoja 派遣社員.

---

## 📋 ESTRUCTURA DE HOJAS

### Hojas Visibles (3)

| Hoja | Tipo | Filas | Columnas | Descripción |
|------|------|-------|----------|-------------|
| **派遣社員** | Datos | 1,048 | 42 | Empleados despachados (principal) |
| **請負社員** | Datos | 142 | 36 | Trabajadores por contrato |
| **スタッフ** | Datos | 21 | 25 | Personal de oficina/HR |

### Hojas Ocultas (6) 🔒

| Hoja | Estado | Filas | Columnas | Propósito |
|------|--------|-------|----------|-----------|
| **DBGenzaiX** | 🔒 Oculta | 1,047 | 42 | Base de datos de empleados ACTUALES |
| **DBUkeoiX** | 🔒 Oculta | 99 | 33 | Base de datos de trabajadores por contrato |
| **DBStaffX** | 🔒 Oculta | 15 | 17 | Base de datos de staff |
| **DBTaishaX** | 🔒 Oculta | 1 | 27 | Base de datos de empleados que RENUNCIARON (退社) |
| **Sheet2** | 🔒 Oculta | 1,047 | 42 | Copia/Respaldo de datos |
| **Sheet1** | 🔒 Oculta | 0 | 0 | Hoja vacía |

### Hojas de Referencia (1)

| Hoja | Tipo | Filas | Columnas | Contenido |
|------|------|-------|----------|-----------|
| **愛知23** | Visible (NUEVO)<br>🔒 Oculta (ACTUAL) | 85 | 11 | Tabla de seguros sociales (健康保険・厚生年金) |

---

## 🎯 HOJAS IMPORTANTES QUE NO SE ESTÁN IMPORTANDO

### 1. **DBTaishaX** - Empleados que renunciaron (退社)
- **Filas**: 1 (pero puede crecer)
- **Columnas**: 27
- **Importancia**: ⚠️ ALTA
- **Razón**: Historial de empleados que dejaron la empresa
- **Acción recomendada**: Agregar importación con flag `is_active=False`

### 2. **愛知23** - Tabla de seguros sociales
- **Filas**: 85
- **Columnas**: 11
- **Importancia**: ⚠️ MEDIA
- **Contenido**: Tablas de cálculo de 健康保険 (seguro de salud) y 厚生年金 (pensión)
- **Acción recomendada**: Crear tabla `social_insurance_rates` para cálculos automáticos

### 3. **DBGenzaiX** - Base de datos de empleados actuales
- **Filas**: 1,047
- **Importancia**: ℹ️ BAJA (es duplicado de 派遣社員)
- **Razón**: Parece ser una vista filtrada/calculada
- **Acción recomendada**: No importar (es redundante)

---

## 🚀 RECOMENDACIONES DE ACTUALIZACIÓN

### PRIORIDAD ALTA ⚠️

1. **Reemplazar `employee_master.xlsm` con el archivo NUEVO**
   ```bash
   cp "D:\JPUNS-CLAUDE4.2\【新】社員台帳(UNS)T.xlsm" "config/employee_master.xlsm"
   ```

2. **Importar hoja DBTaishaX (empleados que renunciaron)**
   - Agregar función `import_taisha_employees()` en `import_data.py`
   - Marcar estos empleados con `is_active=False` y `termination_date`

### PRIORIDAD MEDIA ⚠️

3. **Importar tabla de seguros sociales (愛知23)**
   - Crear modelo `SocialInsuranceRate`
   - Función `import_insurance_rates()`
   - Usar en cálculos automáticos de nómina

### PRIORIDAD BAJA ℹ️

4. **Documentar hojas ocultas**
   - Agregar comentarios en el código explicando qué contiene cada hoja oculta
   - Determinar si DBUkeoiX y DBStaffX tienen datos únicos

---

## 📝 CAMPOS DISPONIBLES

### Hoja 派遣社員 (42 columnas)

Los campos están en el Excel en este formato (row 1 es título, row 2 son headers):

```
Row 1: ユニバーサル企画（株）　社員一覧表
Row 2: [現在, 社員№, 写真, 氏名, カナ, 性別, 国籍, 生年月日, ビザ種類, ビザ期限, ...]
Row 3+: Datos
```

Actualmente el script `import_data.py` usa `header=1` para leer desde la fila 2.

---

## 🔄 PROCESO DE ACTUALIZACIÓN PROPUESTO

### Paso 1: Backup
```bash
cp config/employee_master.xlsm config/employee_master_OLD.xlsm
```

### Paso 2: Actualizar archivo
```bash
cp "D:\JPUNS-CLAUDE4.2\【新】社員台帳(UNS)T.xlsm" config/employee_master.xlsm
```

### Paso 3: Ejecutar importación
```bash
docker compose down
docker compose up -d
```

O manualmente:
```bash
docker exec uns-claudejp-backend python scripts/import_data.py
```

---

## 📊 IMPACTO ESTIMADO

- **Nuevos empleados**: +5 派遣社員
- **Empleados renunciados**: +datos históricos (si se implementa DBTaishaX)
- **Datos de seguros**: +85 filas de tarifas (si se implementa 愛知23)
- **Riesgo**: ⚠️ BAJO (mismo formato, solo más datos)

---

## ✅ CHECKLIST DE MIGRACIÓN

- [ ] Hacer backup de `employee_master.xlsm`
- [ ] Copiar archivo NUEVO a `config/`
- [ ] Revisar logs de importación
- [ ] Verificar que los 5 nuevos empleados aparezcan
- [ ] (Opcional) Implementar importación de DBTaishaX
- [ ] (Opcional) Implementar importación de 愛知23
- [ ] Actualizar documentación

---

**Generado por**: Claude Code
**Fecha**: 2025-10-24
