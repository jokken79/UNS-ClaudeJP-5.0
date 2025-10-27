# Análisis de Integración OCR en UNS-ClaudeJP 4.2

## RESUMEN EJECUTIVO

El proyecto UNS-ClaudeJP 4.2 implementa un sistema híbrido de OCR con:
- Azure Computer Vision (primario)
- EasyOCR (fallback)
- HybridOCRService (orquestador inteligente)

OlmOCR puede integrarse como nuevo proveedor sin romper el sistema actual.

## ESTRUCTURA ACTUAL

### Archivos Críticos

1. **backend/app/services/azure_ocr_service.py** (1030 líneas)
   - Método principal: `process_document(file_path, document_type)`
   - Parsers: `_parse_zairyu_card()`, `_parse_license()`
   - Extracción de foto: `_extract_photo_from_document()`

2. **backend/app/services/easyocr_service.py** (487 líneas)
   - Preprocesamiento: CLAHE, denoising, binarización
   - Detección de contorno y corrección de perspectiva
   - Método: `process_document_with_easyocr(image_data, document_type)`

3. **backend/app/services/hybrid_ocr_service.py** (401 líneas)
   - Orquestador: `process_document_hybrid(image_data, document_type, preferred_method="auto")`
   - Estrategias: "azure", "easyocr", "auto" (hibrido)
   - Combinación inteligente: `_combine_results(primary, secondary, primary_method)`

4. **backend/app/api/azure_ocr.py** (161 líneas)
   - Endpoint: `POST /api/azure-ocr/process`
   - Maneja upload de archivo y base64

5. **backend/app/models/models.py** (línea 301)
   - Tabla `Document` con campo `ocr_data` (JSON)
   - Almacena resultado completo del OCR

6. **backend/app/core/config.py** (líneas 61-87)
   - Variables de configuración: AZURE_COMPUTER_VISION_ENDPOINT, KEY, etc.

7. **docker-compose.yml** (líneas 105-113)
   - Variables de entorno para OCR

## FLUJO DE DATOS ACTUAL

```
POST /api/azure-ocr/process
    ↓
HybridOCRService.process_document_hybrid()
    ↓
Selecciona estrategia (auto/azure/easyocr)
    ↓
Ejecuta AzureOCRService o EasyOCRService
    ↓
Parsing por tipo de documento
    ↓
Extracción de foto
    ↓
Combinación de resultados (si ambos exitosos)
    ↓
Retorna JSON con ~50 campos
    ↓
Almacena en documents.ocr_data
```

## ESQUEMA DE RESPUESTA OCR

```json
{
    "success": true,
    "raw_text": "texto extraído",
    "document_type": "zairyu_card",
    "ocr_method": "hybrid",
    "confidence_score": 0.95,
    "name_kanji": "田中太郎",
    "birthday": "1990年05月15日",
    "nationality": "ベトナム",
    "address": "東京都新宿区...",
    "visa_status": "技能実習1号",
    "residence_card_number": "AB1234567890",
    "photo": "data:image/jpeg;base64,...",
    ... (~40 campos más)
}
```


## PUNTOS DE INTEGRACIÓN PARA OLMOCR

### Opción A: Nuevo Servicio Paralelo (RECOMENDADO)

Crear `backend/app/services/olmocr_service.py`:
- Interfaz idéntica a Azure y EasyOCR
- Registrar en HybridOCRService
- Agregar a configuración (OLMOCR_ENABLED, OLMOCR_API_KEY)
- Agregar a requirements.txt

**Ventajas**:
- No rompe sistema existente
- Totalmente reversible con env var
- Permite fallback a Azure si falla
- Compatible con estrategia hibrida

### Opción B: Reemplazar Azure

Modificar azure_ocr_service.py directamente:
- Cambiar implementación interna
- Mantener interfaz externa igual

**Ventajas**: Cambio mínimo
**Desventajas**: Pierde fallback a Azure

### Opción C: Nuevo Endpoint

Crear `backend/app/api/olmocr.py` con endpoint separado.

**Desventajas**: Frontend necesita cambios

## CÓDIGO REQUERIDO PARA OLMOCR

```python
class OlmOCRService:
    def process_document_with_olmocr(
        self,
        image_data: bytes,
        document_type: str
    ) -> Dict[str, Any]:
        # Retornar estructura idéntica a azure_ocr_service
        return {
            "success": True/False,
            "raw_text": "...",
            "document_type": document_type,
            "name_kanji": "...",
            "birthday": "...",
            "photo": "data:image/jpeg;base64,...",
            # ... más campos
        }
```

## MODIFICACIONES NECESARIAS

1. **hybrid_ocr_service.py** (~línea 30):
   - Agregar inicialización de OlmOCR
   - Agregar `_process_with_olmocr()`
   - Extender estrategia para "olmocr"

2. **config.py** (~línea 87):
   - Agregar OLMOCR_ENABLED, OLMOCR_API_KEY, OLMOCR_ENDPOINT

3. **docker-compose.yml** (~línea 113):
   - Agregar variables de entorno

4. **requirements.txt**:
   - Agregar dependencias de OlmOCR

## CAMPOS QUE DEBE PARSEAR OLMOCR

### Para Zairyu Card (在留カード):
- name_kanji, name_kana, name_roman
- birthday, date_of_birth
- gender, nationality
- address, postal_code, current_address, address_banchi, address_building
- visa_status, residence_status
- residence_card_number, residence_expiry
- photo

### Para License (運転免許証):
- name_kanji, name_kana
- birthday, date_of_birth
- license_number, license_type, license_expire_date
- address
- photo

### Para Rirekisho (履歴書):
- Similar a Zairyu Card
- Experiencia laboral
- Educación
- Cualificaciones

## CHECKLIST DE INTEGRACIÓN

```
PRE-INTEGRACIÓN:
[ ] OlmOCR devuelve Dict con estructura compatible
[ ] OlmOCR soporta imágenes japonesas
[ ] Dependencias claras

CÓDIGO:
[ ] olmocr_service.py creado
[ ] Registrado en hybrid_ocr_service.py
[ ] Config actualizada (config.py, docker-compose.yml)
[ ] requirements.txt actualizado

TESTING:
[ ] Backend inicia sin OlmOCR (OLMOCR_ENABLED=false)
[ ] Azure sigue funcionando normalmente
[ ] Activar OlmOCR (OLMOCR_ENABLED=true)
[ ] Test con preferred_method="olmocr"
[ ] Test con preferred_method="auto" (híbrido)
[ ] Comparar resultados: Azure vs OlmOCR vs Hybrid
[ ] Verificar fotos extraídas correctamente
[ ] Verificar nombres parseados (kanji, kana, roman)
[ ] Verificar fechas en formato japonés (YYYY年MM月DD日)

VALIDACIÓN FINAL:
[ ] Sin cambios a database schema
[ ] Sin breaking changes a API
[ ] Frontend no requiere cambios
[ ] Documentación actualizada
```

## CONCLUSIÓN

**OlmOCR puede integrarse sin romper el sistema existente.**

**Recomendación**: Opción A (Nuevo Servicio Paralelo)

**Impacto**: MÍNIMO
- No requiere cambios a BD
- No requiere cambios a endpoints
- No requiere cambios a frontend
- Reversible con env var
- Tiempo estimado: 3-4 horas

---

**Documento generado**: 2025-10-26  
**Sistema**: UNS-ClaudeJP 4.2.0  
**Backend**: FastAPI 0.115.6 + SQLAlchemy 2.0.36 + PostgreSQL 15

