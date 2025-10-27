# 🚀 GUÍA RÁPIDA: Candidatos con Fotos

## ✅ Solución Implementada

He creado un sistema completo para importar candidatos con fotos desde tu base de datos Access.

---

## 📋 ¿Qué se ha creado?

### 1. **Scripts de Extracción** (Windows)
- `backend/scripts/extract_access_with_photos.py` - Extrae datos y fotos de Access
- `EXTRAER_FOTOS_ACCESS.bat` - Script automático para ejecutar la extracción

### 2. **Scripts de Importación** (Docker)
- `backend/scripts/import_access_candidates_with_photos.py` - Importa candidatos con fotos
- `backend/scripts/clear_candidates.py` - Limpia candidatos existentes

### 3. **Documentación**
- `IMPORTAR_CANDIDATOS_ACCESS.md` - Documentación completa
- `PASO_A_PASO_CANDIDATOS_FOTOS.md` - Esta guía rápida

### 4. **Configuración**
- `docker-compose.yml` - Actualizado para importación automática

---

## 🎯 PASOS SIMPLES (Solo 2 pasos!)

### ⭐ Paso 1: Extraer Fotos de Access (EN WINDOWS)

```bash
# Simplemente ejecuta:
EXTRAER_FOTOS_ACCESS.bat
```

**¿Qué hace?**
- ✅ Verifica Python y dependencias
- ✅ Conecta a tu base de datos Access
- ✅ Extrae todos los candidatos
- ✅ Extrae todas las fotos
- ✅ Guarda todo en las carpetas correctas

**Resultado:**
```
✓ access_candidates_data.json
✓ access_photo_mappings.json
✓ uploads/photos/candidates/candidate_*.jpg
```

---

### ⭐ Paso 2: Instalar Sistema (AUTOMÁTICO)

```bash
# Simplemente ejecuta:
scripts\REINSTALAR.bat
```

**¿Qué hace automáticamente?**
1. ✅ Limpia base de datos PostgreSQL
2. ✅ Crea tablas nuevas
3. ✅ **Detecta archivos de Access**
4. ✅ **Importa candidatos CON FOTOS**
5. ✅ Crea usuario admin
6. ✅ Inicia todos los servicios

---

## 🎨 Resultado Final

Después de estos 2 pasos, tendrás:

**Backend:**
- ✅ Candidatos en PostgreSQL con fotos
- ✅ Fotos accesibles vía API

**Frontend:**
- ✅ Lista de candidatos con fotos
- ✅ Detalles de candidato con foto
- ✅ Editar candidato con foto

**URLs:**
```
Frontend: http://localhost:3000/candidates
Backend API: http://localhost:8000/api/candidates
Fotos: http://localhost:8000/uploads/photos/candidates/candidate_1.jpg
```

---

## 📂 Estructura de Archivos

```
UNS-ClaudeJP-5.0/
│
├── EXTRAER_FOTOS_ACCESS.bat          ← ⭐ PASO 1: EJECUTA ESTO
│
├── scripts/
│   └── REINSTALAR.bat                ← ⭐ PASO 2: EJECUTA ESTO
│
├── access_candidates_data.json       ← Generado por Paso 1
├── access_photo_mappings.json        ← Generado por Paso 1
│
└── uploads/
    └── photos/
        └── candidates/
            ├── candidate_1.jpg       ← Generado por Paso 1
            ├── candidate_2.jpg
            └── ...
```

---

## 🔧 Configuración de Access

El script busca automáticamente:

**Ruta de Base de Datos:**
```
D:\ユニバーサル企画㈱データベースv25.3.24.accdb
```

**Tabla:**
- `T_履歴書` (Tabla de currículums)

**Si tu base de datos está en otra ubicación:**

1. Edita: `backend/scripts/extract_access_with_photos.py`
2. Línea 26: Cambia `ACCESS_DB_PATH`
3. Guarda y ejecuta `EXTRAER_FOTOS_ACCESS.bat` nuevamente

---

## ⚡ Importación Rápida en Otra PC

Para copiar todo a otra PC:

### Opción 1: Con Fotos
```bash
# Copiar todo el proyecto
xcopy /E /I UNS-ClaudeJP-5.0 D:\OtraPC\UNS-ClaudeJP-5.0

# En la otra PC:
cd D:\OtraPC\UNS-ClaudeJP-5.0
scripts\REINSTALAR.bat
```

### Opción 2: Solo Archivos Necesarios
```bash
# Copiar solo:
- access_candidates_data.json
- access_photo_mappings.json
- uploads/photos/candidates/

# Luego ejecutar:
scripts\REINSTALAR.bat
```

---

## 🐛 Solución de Problemas

### ❌ "pyodbc.Error: Driver not found"

**Solución:**
```bash
# Instalar Microsoft Access Database Engine:
# 64-bit: https://aka.ms/accessruntime-2016-64
# 32-bit: https://aka.ms/accessruntime-2016-32
```

---

### ❌ "No se encuentran candidatos"

**Solución:**
```bash
# 1. Verificar que existen los archivos:
dir access_candidates_data.json
dir access_photo_mappings.json

# 2. Si no existen, ejecutar Paso 1 de nuevo:
EXTRAER_FOTOS_ACCESS.bat
```

---

### ❌ "Fotos no aparecen en el frontend"

**Solución:**
```bash
# 1. Verificar que existen fotos:
dir uploads\photos\candidates\

# 2. Verificar URL en navegador:
http://localhost:8000/uploads/photos/candidates/candidate_1.jpg

# 3. Si no funciona, revisar logs:
docker logs uns-claudejp-backend
```

---

## 📊 Verificación de Éxito

### Backend (PostgreSQL)
```bash
# Ver candidatos con fotos:
docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp

SELECT id, seimei_kanji, photo_url
FROM candidates
WHERE photo_url IS NOT NULL
LIMIT 10;
```

### API
```
Abrir: http://localhost:8000/api/docs
Endpoint: GET /api/candidates
Buscar: "photo_url" en la respuesta
```

### Frontend
```
Abrir: http://localhost:3000/candidates
Verificar: Fotos aparecen en la lista
```

---

## 📈 Estadísticas Esperadas

Después de importar verás algo como:

```
========================================================================
IMPORT COMPLETED SUCCESSFULLY
========================================================================
Total candidates imported: 350
Candidates with photos: 285
Errors: 0
========================================================================
```

---

## 🎯 Resumen Ultra-Rápido

```bash
# 1. Extraer (Windows)
EXTRAER_FOTOS_ACCESS.bat

# 2. Instalar (Docker)
scripts\REINSTALAR.bat

# 3. Verificar
http://localhost:3000/candidates
```

**¡Eso es todo!** 🎉

---

## 📞 Soporte

**Logs:**
- Extracción: `backend/scripts/extract_access_*.log`
- Importación: `docker logs uns-claudejp-backend`
- Docker: `docker logs uns-claudejp-importer`

**Archivos Importantes:**
- Documentación completa: `IMPORTAR_CANDIDATOS_ACCESS.md`
- Scripts: `backend/scripts/`

---

## ✨ Características del Sistema

### Extracción
- ✅ Detecta automáticamente columna de fotos
- ✅ Maneja múltiples formatos de foto
- ✅ Crea log detallado
- ✅ Validación de datos

### Importación
- ✅ Mapeo automático de campos japoneses
- ✅ Parseo inteligente de fechas
- ✅ Validación de fotos
- ✅ Manejo de errores robusto
- ✅ Estadísticas detalladas

### Sistema
- ✅ Importación automática en REINSTALAR.bat
- ✅ Fallback a candidatos demo si no hay Access
- ✅ Sin duplicados
- ✅ Fotos accesibles vía API
- ✅ Compatible con GitHub (sin subir fotos)

---

**Creado**: 2025-10-26
**Versión**: UNS-ClaudeJP 5.0
**Autor**: Claude Code
