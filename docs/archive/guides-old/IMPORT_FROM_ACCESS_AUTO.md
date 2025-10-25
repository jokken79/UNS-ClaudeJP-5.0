# 📥 Importación Automática de Access Database

## ✅ Configuración Completada

El sistema ahora importa automáticamente los candidatos de Access cada vez que ejecutas **REINSTALAR.bat**.

---

## 🔧 Cómo Funciona

### Cuando ejecutas `REINSTALAR.bat`:

1. **Docker borra todo** (`docker compose down -v`)
2. **Docker reinicia** (`docker compose up -d`)
3. **El servicio `importer` ejecuta:**
   - ✅ Migraciones de base de datos (`alembic upgrade head`)
   - ✅ Crea usuario admin (`create_admin_user.py`)
   - ✅ Importa datos de muestra (`import_data.py`)
   - ✅ **NUEVO:** Importa candidatos de Access (`import_json_simple.py`)

### Archivos Requeridos (YA están guardados):

```
backend/
├── access_candidates_data.json      (6.7 MB - 1,148 candidatos)
├── access_photo_mappings.json       (465 MB - 1,116 fotos)
└── scripts/
    └── import_json_simple.py        (Script de importación)
```

---

## 📋 Resultados de Importación

**Total:** 1,148 candidatos
- ✅ 1,116 con fotos (Base64)
- ✅ Campos parseados correctamente:
  - Edades: "34歳" → 34 (INTEGER)
  - Fechas: ISO format
  - Fotos: data:image/jpeg;base64,...

---

## 🚀 Uso Normal

### Iniciar/Detener (SIN borrar datos):
```batch
scripts\START.bat   # Iniciar
scripts\STOP.bat    # Detener
scripts\LOGS.bat    # Ver logs
```

### Reinstalar (BORRA todo y reimporta):
```batch
scripts\REINSTALAR.bat
```

**Después de reinstalar:**
- Usuario admin: `admin` / `admin123`
- 1,148 candidatos importados automáticamente
- Datos de muestra del Excel

---

## 🔄 Actualizar Datos de Access

Si necesitas volver a exportar desde Access:

### 1️⃣ En Windows (donde está Access):
```bash
cd backend/scripts
python export_access_to_json.py
python extract_access_attachments.py --full
```

### 2️⃣ Los archivos se crean:
- `access_candidates_data.json` → Copiar a `backend/`
- `access_photo_mappings.json` → Copiar a `backend/`

### 3️⃣ Reinstalar:
```batch
scripts\REINSTALAR.bat
```

---

## 📝 Logs de Importación

Cuando reinstales, verás:

```
--- Checking for Access database imports ---
--- Importing Access candidates with photos ---
================================================================================
IMPORTING CANDIDATES - SIMPLIFIED VERSION
================================================================================
Loaded 1116 photo mappings
Found 1148 candidates

  Imported 100/1148...
  Imported 200/1148...
  ...

================================================================================
IMPORT COMPLETE
================================================================================
Total records: 1148
Imported: 1148
Skipped (duplicates): 0
Errors: 0
Photos attached: 1116
================================================================================
```

---

## ⚠️ Notas Importantes

1. **Los archivos JSON deben estar en `backend/`**
   - Si no están, la importación se omite (sin error)

2. **El sistema detecta duplicados**
   - Basado en `rirekisho_id`
   - Si ya existe, no reimporta

3. **Tamaño de archivos:**
   - `access_photo_mappings.json`: 465 MB
   - `access_candidates_data.json`: 6.7 MB
   - **Total:** ~472 MB

4. **Tiempo de importación:**
   - ~30-60 segundos para 1,148 candidatos

---

## 🆘 Troubleshooting

### Error: "No Access data found, skipping"
**Causa:** Los archivos JSON no están en `backend/`

**Solución:**
```bash
# Verificar archivos
ls -lh backend/access*.json

# Si no existen, exportar de nuevo desde Access
cd backend/scripts
python export_access_to_json.py
python extract_access_attachments.py --full
```

### Error: "Loaded 0 photo mappings"
**Causa:** El archivo `access_photo_mappings.json` está corrupto o tiene formato incorrecto

**Solución:**
```bash
# Verificar estructura del JSON
python -c "import json; data=json.load(open('backend/access_photo_mappings.json')); print(f\"Mappings: {len(data.get('mappings', {}))}\")"

# Debe mostrar: Mappings: 1116
```

### Error: "invalid input syntax for type integer"
**Causa:** Campos de edad tienen formato "34歳" en lugar de número

**Solución:** Ya está resuelto en `import_json_simple.py` con la función `parse_age()`

---

## 📞 Contacto

Para preguntas sobre la importación de Access, consulta:
- `backend/scripts/import_json_simple.py` - Script principal
- `backend/scripts/export_access_to_json.py` - Exportador
- `backend/scripts/extract_access_attachments.py` - Extractor de fotos

---

**Creado:** 2025-10-24
**Última actualización:** 2025-10-24
**Versión:** 1.0
