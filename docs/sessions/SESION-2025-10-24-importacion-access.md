# 📋 Sesión de Trabajo: Importación Automática de Access
**Fecha:** 2025-10-24
**Objetivo:** Configurar importación automática de candidatos desde Access Database

---

## ✅ LOGROS COMPLETADOS

### 1. Importación Manual Exitosa
- ✅ Importados **1,148 candidatos** desde Access a PostgreSQL
- ✅ Extraídas **1,116 fotos** en formato Base64 (465 MB)
- ✅ 0 errores en importación final
- ✅ Parsing correcto de edades ("34歳" → 34 como INTEGER)
- ✅ Parsing correcto de fechas (ISO format)

### 2. Configuración de Importación Automática
- ✅ Modificado `docker-compose.yml` - servicio `importer` ahora importa Access automáticamente
- ✅ Corregido `backend/requirements.txt` - eliminado `pywin32==308` (causaba error en Linux)
- ✅ Creado `backend/scripts/import_json_simple.py` - script optimizado de importación
- ✅ Archivos JSON guardados permanentemente en `backend/`

### 3. Archivos .bat Mejorados
- ✅ Creado `scripts/REINSTALAR_CON_LOGS.bat` - guarda logs completos
- ✅ Creado `scripts/REINSTALAR_VISIBLE.bat` - muestra progreso en pantalla
- ✅ Creado `backend/scripts/README_IMPORT_ACCESS.md` - documentación completa

---

## 📁 ARCHIVOS MODIFICADOS

### Archivos Críticos del Sistema

#### `docker-compose.yml` (líneas 58-73)
**ANTES:**
```yaml
command: >
  sh -c "
    alembic upgrade head &&
    python scripts/create_admin_user.py &&
    python scripts/import_data.py
  "
```

**DESPUÉS:**
```yaml
command: >
  sh -c "
    alembic upgrade head &&
    python scripts/create_admin_user.py &&
    python scripts/import_data.py &&
    if [ -f '/app/access_candidates_data.json' ]; then
      python scripts/import_json_simple.py
    fi
  "
```

#### `backend/requirements.txt` (línea 79)
**ANTES:**
```
pywin32==308
```

**DESPUÉS:**
```
# Note: pywin32 is NOT needed in Docker (Linux containers)
# Install it locally on Windows with: pip install pywin32
```

---

## 📂 ARCHIVOS CREADOS

### Scripts de Importación (Backend)

1. **`backend/scripts/export_access_to_json.py`**
   - Exporta datos de Access a JSON (Windows host)
   - Tabla: `T_履歴書`
   - Output: `access_candidates_data.json` (6.7 MB)

2. **`backend/scripts/extract_access_attachments.py`**
   - Extrae fotos usando COM automation (Windows host)
   - Requiere: `pywin32`
   - Output: `access_photo_mappings.json` (465 MB)
   - Formato: Base64 data URLs

3. **`backend/scripts/import_json_simple.py`** ⭐
   - Importa candidatos a PostgreSQL (Docker container)
   - Lee: `access_candidates_data.json` + `access_photo_mappings.json`
   - Funciones:
     - `parse_age()` - convierte "34歳" → 34
     - `parse_date()` - convierte fechas ISO
     - `load_photo_mappings()` - carga fotos desde JSON
   - Detecta duplicados por `rirekisho_id`

4. **`backend/scripts/README_IMPORT_ACCESS.md`**
   - Documentación completa del proceso
   - Troubleshooting
   - Cómo importar otras tablas

### Scripts .bat Mejorados

5. **`scripts/REINSTALAR_CON_LOGS.bat`**
   - Guarda todo en `scripts/reinstalar_log.txt`
   - Útil para debugging
   - No muestra progreso en pantalla

6. **`scripts/REINSTALAR_VISIBLE.bat`** ⭐ RECOMENDADO
   - Muestra TODO el progreso en pantalla
   - NO oculta comandos Docker
   - Ventana NO se cierra automáticamente
   - Muestra resumen de importación de Access

### Archivos de Datos (Permanentes)

7. **`backend/access_candidates_data.json`** (6.7 MB)
   - 1,148 registros de candidatos
   - Exportado desde Access

8. **`backend/access_photo_mappings.json`** (465 MB)
   - 1,116 fotos en Base64
   - Estructura: `{"mappings": {"1180": "data:image/jpeg;base64,..."}}`

---

## 🔧 CÓMO FUNCIONA LA IMPORTACIÓN AUTOMÁTICA

### Flujo Completo

```
┌─────────────────────────────────────────┐
│ Usuario ejecuta REINSTALAR.bat         │
└───────────────┬─────────────────────────┘
                ↓
┌───────────────────────────────────────────┐
│ docker compose down -v                    │
│ (Borra todo)                              │
└───────────────┬───────────────────────────┘
                ↓
┌───────────────────────────────────────────┐
│ docker compose build --no-cache           │
│ (Reconstruye imágenes)                    │
└───────────────┬───────────────────────────┘
                ↓
┌───────────────────────────────────────────┐
│ docker compose up -d                      │
│ (Inicia servicios)                        │
└───────────────┬───────────────────────────┘
                ↓
┌───────────────────────────────────────────┐
│ Servicio "importer" ejecuta:              │
│ 1. alembic upgrade head                   │
│ 2. python scripts/create_admin_user.py    │
│ 3. python scripts/import_data.py          │
│ 4. python scripts/import_json_simple.py ⭐│
└───────────────┬───────────────────────────┘
                ↓
┌───────────────────────────────────────────┐
│ import_json_simple.py:                    │
│ - Carga 1,116 fotos                       │
│ - Importa 1,148 candidatos                │
│ - 0 errores                                │
└───────────────────────────────────────────┘
```

### Archivos Requeridos (YA están en su lugar)

```
backend/
├── access_candidates_data.json      ← 1,148 candidatos
├── access_photo_mappings.json       ← 1,116 fotos
└── scripts/
    └── import_json_simple.py        ← Script de importación
```

---

## 🚀 COMANDOS IMPORTANTES

### Uso Normal (NO borra datos)
```batch
scripts\START.bat   # Iniciar
scripts\STOP.bat    # Detener
scripts\LOGS.bat    # Ver logs
```

### Reinstalar (BORRA todo y reimporta Access automáticamente)
```batch
scripts\REINSTALAR_VISIBLE.bat      # ⭐ RECOMENDADO - Muestra progreso
scripts\REINSTALAR_CON_LOGS.bat     # Guarda logs, no muestra progreso
scripts\REINSTALAR.bat              # Original (problema: ventana se cierra)
```

### Verificar Importación
```bash
# Total candidatos
docker exec uns-claudejp-backend python -c "
from app.core.database import SessionLocal
from app.models.models import Candidate
db = SessionLocal()
print(f'Total: {db.query(Candidate).count()}')
print(f'Con fotos: {db.query(Candidate).filter(Candidate.photo_data_url.is_not(None)).count()}')
db.close()
"
```

### Ver Logs de Importación
```bash
docker logs uns-claudejp-importer | findstr "IMPORTING CANDIDATES"
docker logs uns-claudejp-importer | findstr "IMPORT COMPLETE"
```

---

## ⚠️ PROBLEMAS ENCONTRADOS Y SOLUCIONES

### Problema 1: `pywin32` causaba error en Docker
**Error:**
```
ERROR: Could not find a version that satisfies the requirement pywin32==308
```

**Causa:** `pywin32` solo funciona en Windows, no en contenedores Linux

**Solución:** ✅ Eliminado de `requirements.txt`
- Solo se necesita en Windows host para scripts de exportación
- Instalación manual: `pip install pywin32`

### Problema 2: Edades con formato "34歳"
**Error:**
```
invalid input syntax for type integer: "34歳"
```

**Solución:** ✅ Creada función `parse_age()` en `import_json_simple.py`
```python
def parse_age(value):
    if isinstance(value, str):
        num_str = re.sub(r'[^\d]', '', value)
        return int(num_str) if num_str else None
    return value
```

### Problema 3: Fotos no se cargaban (0 photo mappings)
**Error:**
```
Loaded 0 photo mappings
```

**Causa:** Script cargaba todo el JSON en lugar de solo `["mappings"]`

**Solución:** ✅ Corregido en `load_photo_mappings()`
```python
data = json.load(f)
mappings = data.get('mappings', {})  # ← Extraer sub-objeto
```

### Problema 4: REINSTALAR.bat se cierra sin errores
**Causa:** Posible problema de codificación o sintaxis en archivo original

**Solución:** ✅ Creados `REINSTALAR_VISIBLE.bat` y `REINSTALAR_CON_LOGS.bat`

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### Base de Datos PostgreSQL
- ✅ Total candidatos: **1,148**
- ✅ Con fotos: **1,116**
- ✅ Fábricas: **102**
- ✅ 派遣社員: **945**
- ✅ 請負社員: **133**
- ✅ スタッフ: **19**

### Servicios Docker
```
uns-claudejp-db        (PostgreSQL)  - Corriendo
uns-claudejp-backend   (FastAPI)     - Corriendo
uns-claudejp-frontend  (Next.js 15)  - Corriendo
uns-claudejp-adminer   (Adminer)     - Corriendo
```

### URLs de Acceso
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs
- Adminer: http://localhost:8080
- Credenciales: `admin` / `admin123`

---

## 🔧 ACTUALIZACIÓN POST-REINSTALACIÓN (2025-10-24 17:06 JST)

### Problema 11: Error de serialización en `/api/candidates`
**Error:**
```
Unable to serialize unknown type: <class 'app.models.models.Candidate'>
```

**Causa:** El endpoint `list_candidates` devolvía objetos SQLAlchemy directamente en lugar de convertirlos a schemas Pydantic.

**Solución:** ✅ Modificado `backend/app/api/candidates.py` línea 448
```python
# ANTES:
return {
    "items": candidates,  # <- Objetos SQLAlchemy
    ...
}

# DESPUÉS:
items = [CandidateResponse.model_validate(c) for c in candidates]
return {
    "items": items,  # <- Objetos Pydantic serializables
    ...
}
```

**Resultado:** Backend reiniciado y funcionando correctamente.

### Problema 12: Fotos de candidatos no aparecen en el frontend
**Error:** Las fotos importadas desde Access (1,116 fotos en Base64) no se mostraban en la página de candidatos.

**Causa:**
1. El schema Pydantic `CandidateBase` solo incluía `photo_url` pero no `photo_data_url`
2. El frontend estaba buscando `photo_url` en lugar de `photo_data_url`
3. Las fotos están guardadas en el campo `photo_data_url` (formato Base64)

**Solución:** ✅ Modificados 2 archivos:

**1. Backend:** `backend/app/schemas/candidate.py` línea 23
```python
# ANTES:
photo_url: Optional[str] = None
nationality: Optional[str] = None

# DESPUÉS:
photo_url: Optional[str] = None
photo_data_url: Optional[str] = None  # Base64 photo data
nationality: Optional[str] = None
```

**2. Frontend:** `frontend-nextjs/app/(dashboard)/candidates/page.tsx`
```typescript
// Tipo (línea 30):
photo_data_url?: string;  // Base64 photo data

// Renderizado (línea 201-203):
{candidate.photo_data_url ? (
  <img src={candidate.photo_data_url} alt="候補者写真" />
) : (
  <UserPlusIcon />
)}
```

**Resultado:** Fotos visibles en la página de candidatos.

### Estado Final Verificado ✅

**Servicios Docker:**
- ✅ Database (PostgreSQL): Corriendo y saludable
- ✅ Backend (FastAPI): Corriendo y saludable
- ✅ Frontend (Next.js): Corriendo
- ✅ Adminer: Corriendo

**Base de Datos:**
- ✅ Total candidatos: **1,148**
- ✅ Con fotos: **1,116**
- ✅ Importación automática: **Funcionando**

**URLs de Acceso:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs
- Adminer: http://localhost:8080
- Credenciales: `admin` / `admin123`

---

## 🔮 PRÓXIMOS PASOS PENDIENTES

### Completados ✅

1. ✅ **Reinstalación completada exitosamente**
2. ✅ **Importación de Access confirmada** (1,148 candidatos, 1,116 fotos)
3. ✅ **Error de serialización arreglado** (endpoint `/api/candidates`)
4. ✅ **Error de fotos no visibles arreglado** (agregado `photo_data_url` a schema y frontend)

### Opcional (Mejoras Futuras)

4. **Actualizar datos desde Access**
   - En Windows: ejecutar `export_access_to_json.py`
   - En Windows: ejecutar `extract_access_attachments.py --full`
   - Copiar JSONs a `backend/`
   - Ejecutar REINSTALAR_VISIBLE.bat

5. **Importar otras tablas de Access**
   - Seguir patrón de `import_json_simple.py`
   - Crear modelos SQLAlchemy correspondientes
   - Agregar al servicio `importer`

6. **Relacionar candidatos con employees**
   - Buscar candidatos por `rirekisho_id`
   - Crear vista combinada candidate + employee
   - Mostrar foto en perfil de empleado

---

## 📖 DOCUMENTACIÓN DE REFERENCIA

### Archivos Importantes para Leer

1. **`backend/scripts/README_IMPORT_ACCESS.md`**
   - Documentación completa del proceso
   - Troubleshooting de errores comunes
   - Cómo importar otras tablas

2. **`CLAUDE.md`**
   - Instrucciones del proyecto
   - Arquitectura del sistema
   - Comandos comunes

3. **`scripts/README.md`**
   - Explicación de todos los scripts .bat
   - Equivalentes manuales de comandos

### Scripts de Importación

- `backend/scripts/export_access_to_json.py` - Exportar desde Access (Windows)
- `backend/scripts/extract_access_attachments.py` - Extraer fotos (Windows)
- `backend/scripts/import_json_simple.py` - Importar a PostgreSQL (Docker)

---

## 💾 BACKUP Y SEGURIDAD

### Archivos Críticos a NO Borrar

```
backend/
├── access_candidates_data.json      # 6.7 MB - NO borrar
├── access_photo_mappings.json       # 465 MB - NO borrar
└── scripts/
    ├── export_access_to_json.py
    ├── extract_access_attachments.py
    └── import_json_simple.py
```

### Hacer Backup de la Base de Datos
```bash
# Crear backup
docker exec uns-claudejp-db pg_dump -U uns_admin -d uns_claudejp > backup.sql

# Restaurar backup
docker cp backup.sql uns-claudejp-db:/tmp/
docker exec uns-claudejp-db psql -U uns_admin -d uns_claudejp -f /tmp/backup.sql
```

---

## 🎯 RESUMEN EJECUTIVO

### Lo que Logramos Hoy

✅ **Importación automática de Access configurada**
- 1,148 candidatos con 1,116 fotos
- Se importan automáticamente al reinstalar
- Archivos guardados permanentemente

✅ **Scripts .bat mejorados**
- REINSTALAR_VISIBLE.bat muestra progreso completo
- REINSTALAR_CON_LOGS.bat guarda logs detallados

✅ **Problemas resueltos**
- pywin32 en Linux
- Edades "34歳" → 34
- Fotos no se cargaban
- Ventana se cierra

### En Cualquier PC Funcionará

✅ Los archivos JSON están en `backend/` (se copian al contenedor)
✅ El `docker-compose.yml` modificado está en Git
✅ Los scripts .bat están en `scripts/`
✅ Todo se monta automáticamente

### Próxima Vez que Reinstales

1. Ejecuta `scripts\REINSTALAR_VISIBLE.bat`
2. Espera 10-15 minutos (primera vez)
3. Al final verás: "Imported: 1148, Photos: 1116"
4. ¡Listo!

---

**Última actualización:** 2025-10-24 17:15 JST
**Estado:** ✅ Sistema completamente funcional con fotos visibles
**Verificación completada:**
- Reinstalación exitosa
- 1,148 candidatos importados con 1,116 fotos
- Error de serialización arreglado
- Error de fotos no visibles arreglado
- Todos los servicios corriendo correctamente

---

## 📞 COMANDOS RÁPIDOS DE REFERENCIA

```batch
# Ver estado
docker ps

# Ver logs de importación
docker logs uns-claudejp-importer

# Verificar candidatos
docker exec uns-claudejp-backend python -c "from app.core.database import SessionLocal; from app.models.models import Candidate; db = SessionLocal(); print(f'Total: {db.query(Candidate).count()}'); db.close()"

# Reiniciar desde cero
scripts\REINSTALAR_VISIBLE.bat

# Iniciar/Detener sin borrar datos
scripts\START.bat
scripts\STOP.bat
```

---

**FIN DEL RESUMEN**
