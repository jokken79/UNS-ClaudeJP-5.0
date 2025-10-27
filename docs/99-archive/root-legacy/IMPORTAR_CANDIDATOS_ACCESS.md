# 📸 Importar Candidatos con Fotos desde Access

Este documento explica cómo importar candidatos con sus fotos desde la base de datos Access.

## 🎯 Proceso Completo

### 📋 Requisitos Previos

1. **Base de Datos Access**:
   - Archivo: `D:\ユニバーサル企画㈱データベースv25.3.24.accdb`
   - Debe estar accesible en Windows

2. **Python con pyodbc** (en Windows host):
   ```bash
   pip install pyodbc
   ```

3. **Driver ODBC de Microsoft Access** (generalmente ya instalado en Windows)

---

## 🚀 Pasos de Importación

### Paso 1: Extraer Datos y Fotos de Access (Windows)

```bash
# Navegar a la carpeta de scripts
cd backend\scripts

# Ejecutar extracción (en Windows, fuera de Docker)
python extract_access_with_photos.py
```

**¿Qué hace este script?**
- ✅ Conecta a la base de datos Access
- ✅ Extrae todos los candidatos de la tabla `T_履歴書`
- ✅ Extrae las fotos de los candidatos
- ✅ Guarda las fotos en: `uploads/photos/candidates/`
- ✅ Crea dos archivos JSON:
  - `access_candidates_data.json` - Datos de candidatos
  - `access_photo_mappings.json` - Mapeo ID → foto

**Archivos generados:**
```
backend/scripts/
├── access_candidates_data.json      (datos)
├── access_photo_mappings.json       (mapeo de fotos)
└── extract_access_YYYYMMDD_HHMMSS.log

uploads/photos/candidates/
├── candidate_1.jpg
├── candidate_2.jpg
├── candidate_3.jpg
└── ...
```

---

### Paso 2: Copiar Archivos al Proyecto

```bash
# Copiar JSONs a la raíz del proyecto
copy backend\scripts\access_candidates_data.json .
copy backend\scripts\access_photo_mappings.json .

# Las fotos ya están en uploads/photos/candidates/ (correctamente ubicadas)
```

---

### Paso 3: Ejecutar REINSTALAR.bat

```bash
# Esto hará:
# 1. Limpiar base de datos PostgreSQL
# 2. Recrear estructura
# 3. Importar candidatos con fotos automáticamente
scripts\REINSTALAR.bat
```

El script `REINSTALAR.bat` detectará automáticamente los archivos JSON y ejecutará la importación con fotos.

---

## 🔧 Importación Manual (Opcional)

Si solo quieres importar sin reinstalar todo:

```bash
# Limpiar candidatos existentes
docker exec -it uns-claudejp-backend python scripts/clear_candidates.py

# Importar candidatos con fotos
docker exec -it uns-claudejp-backend python scripts/import_access_candidates_with_photos.py
```

---

## 📂 Estructura de Archivos

```
UNS-ClaudeJP-5.0/
├── access_candidates_data.json          ← Copiar aquí
├── access_photo_mappings.json           ← Copiar aquí
│
├── uploads/
│   └── photos/
│       └── candidates/
│           ├── candidate_1.jpg          ← Generado automáticamente
│           ├── candidate_2.jpg
│           └── ...
│
└── backend/
    └── scripts/
        ├── extract_access_with_photos.py      ← Ejecutar en Windows
        ├── import_access_candidates_with_photos.py
        └── clear_candidates.py
```

---

## 🎨 Cómo se Muestran las Fotos en el Frontend

Una vez importados, los candidatos con fotos se verán así:

**API Response:**
```json
{
  "id": 1,
  "seimei_kanji": "山田太郎",
  "seimei_romaji": "Yamada Taro",
  "photo_url": "photos/candidates/candidate_1.jpg",
  ...
}
```

**Frontend (Next.js):**
```typescript
// La imagen se carga desde:
<img src={`${API_URL}/uploads/${candidate.photo_url}`} />

// Ejemplo real:
// http://localhost:8000/uploads/photos/candidates/candidate_1.jpg
```

---

## ⚠️ Solución de Problemas

### Problema: "No se encuentran candidatos"

**Causa**: Archivos JSON no están en el lugar correcto

**Solución**:
```bash
# Verificar que los archivos existen:
dir access_candidates_data.json
dir access_photo_mappings.json

# Si no existen, ejecutar Paso 1 y Paso 2 nuevamente
```

---

### Problema: "Fotos no aparecen"

**Causa**: Las fotos no están en la carpeta correcta

**Solución**:
```bash
# Verificar que existen fotos:
dir uploads\photos\candidates\

# Verificar permisos de carpeta
# Verificar que Docker monte correctamente el volumen
```

---

### Problema: "pyodbc.Error: Driver not found"

**Causa**: Driver ODBC de Access no instalado

**Solución**:
1. Descargar e instalar Microsoft Access Database Engine:
   - 64-bit: https://www.microsoft.com/en-us/download/details.aspx?id=54920
   - 32-bit: https://www.microsoft.com/en-us/download/details.aspx?id=13255

2. Reinstalar si es necesario

---

## 🔄 Importar en Otra PC

Para importar los mismos candidatos en otra PC:

1. **Copiar carpeta de fotos**:
   ```bash
   # Desde PC original
   xcopy /E /I uploads\photos PC_destino\UNS-ClaudeJP-5.0\uploads\photos
   ```

2. **Copiar archivos JSON**:
   ```bash
   copy access_candidates_data.json PC_destino\UNS-ClaudeJP-5.0\
   copy access_photo_mappings.json PC_destino\UNS-ClaudeJP-5.0\
   ```

3. **Ejecutar REINSTALAR.bat** en la PC destino

---

## 📊 Estadísticas de Importación

El script mostrará estadísticas como:

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

## ✅ Verificación

Para verificar que todo funciona:

1. **Backend**:
   ```bash
   # Ver candidatos en base de datos
   docker exec -it uns-claudejp-db psql -U uns_admin -d uns_claudejp

   SELECT id, seimei_kanji, photo_url FROM candidates LIMIT 10;
   ```

2. **Frontend**:
   - Navegar a: http://localhost:3000/candidates
   - Verificar que las fotos aparecen

3. **API**:
   - Abrir: http://localhost:8000/api/docs
   - Endpoint: `GET /api/candidates`
   - Verificar campo `photo_url`

---

## 🎓 Notas Técnicas

### Formato de Fotos
- **Formato**: JPG (recomendado)
- **Tamaño**: Original (se redimensiona en frontend si es necesario)
- **Nombre**: `candidate_{ID}.jpg`

### Base de Datos Access
- **Tabla**: `T_履歴書`
- **Campo de Foto**: Attachment field (OLE Object o similar)
- **Método de Extracción**: pyodbc binary data

### PostgreSQL
- **Campo**: `photo_url` (VARCHAR 255)
- **Valor**: Ruta relativa, ej: `photos/candidates/candidate_1.jpg`
- **Volumen Docker**: Montado en `/app/uploads`

---

## 📞 Soporte

Si tienes problemas:

1. Revisar logs:
   - `backend/scripts/extract_access_*.log`
   - `docker logs uns-claudejp-backend`

2. Verificar archivos generados

3. Contactar soporte técnico

---

**Última actualización**: 2025-10-26
**Versión**: UNS-ClaudeJP 5.0
