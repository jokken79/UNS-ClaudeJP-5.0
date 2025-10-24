# 📄 Guía de Uso: Subida de Múltiples Documentos OCR

## Fecha: 2025-10-24

## 🎯 Descripción

El sistema OCR ahora permite subir **múltiples documentos** en el formulario de nuevo candidato (履歴書/Rirekisho), específicamente:

- **在留カード (Zairyu Card)** - Tarjeta de residencia
- **運転免許証 (Menkyo-sho)** - Licencia de conducir

Ambos documentos pueden ser procesados en la **misma sesión** y sus datos se combinan automáticamente para rellenar el formulario.

---

## ✨ Características Nuevas

### 1. **Subida de Múltiples Documentos**
- Sube Zairyu Card y/o Menkyo-sho
- Cada documento tiene su propia sección en la UI
- Procesa cada documento independientemente

### 2. **Auto-Rellenado Inteligente**
- Datos de Zairyu Card tienen **prioridad**
- Datos de Menkyo-sho **complementan** campos faltantes
- Campos específicos de licencia siempre se agregan

### 3. **UI Mejorada**
- 2 secciones separadas: una para cada tipo de documento
- Preview independiente de cada imagen
- Botones "OCR実行" independientes
- Indicadores de progreso para cada procesamiento
- Badges de completado cuando el OCR termina

---

## 📝 Cómo Usar

### Paso 1: Acceder al Formulario de Nuevo Candidato

1. Navega a **Candidatos → Nuevo Candidato** en el menú
2. Automáticamente se redirige a `/candidates/rirekisho`
3. Verás el formulario de 履歴書 (Rirekisho)

### Paso 2: Abrir el Panel de OCR

1. Busca el botón **"Azure Computer Vision OCR"** en la parte superior
2. Haz clic para abrir el panel de subida de documentos
3. Verás 2 secciones:
   - **在留カード (Zairyu Card)**
   - **運転免許証 (License)**

### Paso 3: Subir Documentos

#### Opción A: Subir Solo Zairyu Card
1. En la sección "在留カード":
   - Arrastra y suelta la imagen, o haz clic para seleccionar
   - Formatos soportados: JPG, PNG, HEIC (máx. 8MB)
2. Haz clic en **"OCR実行"** en la sección de Zairyu Card
3. Espera a que el procesamiento complete
4. Los campos del formulario se rellenan automáticamente

#### Opción B: Subir Solo Menkyo-sho
1. En la sección "運転免許証":
   - Arrastra y suelta la imagen, o haz clic para seleccionar
2. Haz clic en **"OCR実行"** en la sección de License
3. Los campos del formulario se rellenan automáticamente

#### Opción C: Subir Ambos Documentos (RECOMENDADO)
1. Sube Zairyu Card en su sección
2. Haz clic en **"OCR実行"** para procesarlo
3. Espera a que complete
4. Sube Menkyo-sho en su sección
5. Haz clic en **"OCR実行"** para procesarlo
6. Los datos de ambos documentos se combinan automáticamente

### Paso 4: Verificar Datos Auto-Rellenados

Después de procesar, verás:
- **Panel verde de confirmación** mostrando campos rellenados
- **Badge indicando** qué documentos fueron procesados
- **Formulario actualizado** con los datos extraídos

### Paso 5: Completar y Guardar

1. Revisa los campos auto-rellenados
2. Completa campos adicionales manualmente si es necesario
3. Haz clic en **"保存"** (Guardar) para guardar el candidato

---

## 🔄 Lógica de Combinación de Datos

### Prioridad de Campos

**Campos de Zairyu Card tienen prioridad:**
- Nombre (氏名)
- Fecha de nacimiento (生年月日)
- Nacionalidad (国籍)
- Dirección (住所)
- Género (性別)
- Datos de visa (在留資格, 在留期間)
- Número de tarjeta de residencia (在留カード番号)

**Campos específicos de Menkyo-sho siempre se agregan:**
- Número de licencia (免許証番号)
- Fecha de expiración de licencia (有効期限)
- Tipo de licencia (種類)

**Campos de Menkyo-sho solo se usan si Zairyu Card no los tiene:**
- Nombre (solo si no hay de Zairyu)
- Fecha de nacimiento (solo si no hay de Zairyu)
- Dirección (solo si no hay de Zairyu)

### Ejemplo de Combinación

**Escenario: Subir ambos documentos**

Zairyu Card detecta:
```
- Nombre: 田中 太郎
- Fecha Nacimiento: 1990-01-15
- Nacionalidad: ベトナム
- Dirección: 愛知県名古屋市...
- Visa: 技能実習
- Tarjeta: AB12345678CD
```

Menkyo-sho detecta:
```
- Nombre: 田中 太郎
- Fecha Nacimiento: 1990-01-15
- Licencia: 123456789012
- Fecha Expiración: 2028-12-31
- Tipo: 普通
```

**Resultado combinado en el formulario:**
```
- Nombre: 田中 太郎 (de Zairyu, prioridad)
- Fecha Nacimiento: 1990-01-15 (de Zairyu, prioridad)
- Nacionalidad: ベトナム (de Zairyu)
- Dirección: 愛知県名古屋市... (de Zairyu)
- Visa: 技能実習 (de Zairyu)
- Tarjeta: AB12345678CD (de Zairyu)
- Licencia: 123456789012 (de Menkyo-sho ✓)
- Fecha Expiración Licencia: 2028-12-31 (de Menkyo-sho ✓)
```

---

## 📊 Campos Extraídos

### Campos de Zairyu Card (在留カード)

| Campo | Nombres Posibles en OCR | Campo del Formulario |
|-------|------------------------|---------------------|
| Nombre | `name_kanji`, `full_name_kanji`, `name_roman` | `氏名（漢字）` |
| Furigana | `name_kana`, `full_name_kana`, `name_katakana` | `フリガナ` |
| Fecha Nacimiento | `birthday`, `date_of_birth` | `生年月日` |
| Género | `gender` | `性別` |
| Nacionalidad | `nationality` | `国籍` |
| Código Postal | `postal_code`, `zip_code` | `郵便番号` |
| Dirección | `address`, `current_address` | `現住所` |
| Teléfono | `mobile`, `phone` | `携帯電話` |
| Visa | `visa_status`, `residence_status` | `在留資格` |
| Período Visa | `visa_period`, `residence_expiry` | `在留期間` |
| Número Tarjeta | `residence_card_number`, `zairyu_card_number` | `在留カード番号` |
| Pasaporte | `passport_number` | `パスポート番号` |
| Foto | `photo` | Foto del candidato |

### Campos de Menkyo-sho (運転免許証)

| Campo | Nombres Posibles en OCR | Campo del Formulario |
|-------|------------------------|---------------------|
| Número Licencia | `license_number`, `menkyo_number` | `免許証番号` |
| Fecha Expiración | `license_expiry`, `license_expire_date` | `有効期限` |
| Tipo Licencia | `license_type` | Notas adicionales |
| Nombre | `name_kanji`, `full_name_kanji` | `氏名（漢字）` ⚠️ solo si no hay de Zairyu |
| Furigana | `name_kana`, `full_name_kana` | `フリガナ` ⚠️ solo si no hay de Zairyu |
| Fecha Nacimiento | `birthday`, `date_of_birth` | `生年月日` ⚠️ solo si no hay de Zairyu |
| Dirección | `address`, `current_address` | `現住所` ⚠️ solo si no hay de Zairyu |

---

## ⚠️ Notas Importantes

### Calidad de Imagen
Para mejores resultados:
- ✅ Usa imágenes de alta resolución (300 DPI o más)
- ✅ Asegura buena iluminación sin sombras
- ✅ Captura los 4 bordes del documento completo
- ✅ Evita reflejos o brillos en la superficie
- ❌ No uses imágenes borrosas o inclinadas

### Tamaño de Archivo
- Máximo: **8 MB** por imagen
- Formatos: JPG, PNG, HEIC

### Procesamiento
- Cada documento se procesa **independientemente**
- Puedes procesar uno primero y el otro después
- No es necesario subir ambos si solo tienes uno
- El orden de procesamiento no importa

### Edición Manual
- Todos los campos pueden ser editados manualmente después del OCR
- Si el OCR falla o los datos son incorrectos, puedes corregirlos manualmente

---

## 🐛 Solución de Problemas

### Problema: "OCR の結果を読み取れませんでした"

**Causa**: El OCR no pudo extraer datos del documento

**Solución**:
1. Verifica que la imagen sea clara y legible
2. Asegura que el documento esté completo en la foto
3. Intenta con mejor iluminación
4. Prueba con una imagen de mayor resolución

### Problema: Campos no se rellenan después del OCR

**Causa**: Los campos del documento no fueron detectados correctamente

**Solución**:
1. Revisa el panel de "Azure OCR 詳細データを表示" para ver qué se detectó
2. Completa manualmente los campos faltantes
3. Intenta con una imagen de mejor calidad

### Problema: Datos del segundo documento sobrescriben el primero

**Causa**: Esto no debería pasar - Zairyu Card tiene prioridad

**Solución**:
1. Verifica que subiste Zairyu Card primero
2. Si el problema persiste, reporta el bug con capturas de pantalla

### Problema: Foto no se extrae

**Causa**: El sistema de detección de rostros no encontró la foto

**Solución**:
1. Sube la foto manualmente usando el campo de "写真"
2. Asegura que la foto del documento sea visible y clara

---

## 🔧 Para Desarrolladores

### Arquitectura

**Frontend**:
- Componente: `AzureOCRUploader.tsx`
- Página: `/app/(dashboard)/candidates/rirekisho/page.tsx`
- Función: `combineOCRResults()` - Combina datos RAW de múltiples documentos
- Callback: `handleAzureOcrComplete()` - Mapea campos OCR → formulario

**Backend**:
- Endpoint: `/api/azure-ocr/process`
- Servicio: `azure_ocr_service.py`
- Método Zairyu: `_parse_zairyu_card()`
- Método License: `_parse_license()`

### Flujo de Datos

```
Usuario sube imagen → Azure OCR API → Resultado RAW
                                           ↓
                              combineOCRResults()
                           (combina ambos documentos)
                                           ↓
                         handleAzureOcrComplete()
                          (mapea campos al formulario)
                                           ↓
                             Formulario actualizado
```

### Testing

Ver `IMPLEMENTATION_SUMMARY.md` para:
- Casos de prueba recomendados
- Ejemplos de datos combinados
- Validación de prioridad de campos

---

## 📚 Referencias

- **Archivo de implementación**: `/frontend-nextjs/components/AzureOCRUploader.tsx`
- **Resumen técnico**: `/IMPLEMENTATION_SUMMARY.md`
- **Documentación backend**: `/backend/app/services/azure_ocr_service.py`
- **Formulario rirekisho**: `/frontend-nextjs/app/(dashboard)/candidates/rirekisho/page.tsx`

---

## ✅ Resumen de Mejoras

| Antes | Después |
|-------|---------|
| ❌ Solo 1 documento a la vez | ✅ Múltiples documentos en una sesión |
| ❌ Había que elegir qué documento procesar | ✅ Procesa ambos y combina datos |
| ❌ Datos de Menkyo-sho sobrescribían Zairyu | ✅ Zairyu Card tiene prioridad automática |
| ❌ Campos de licencia no se capturaban bien | ✅ Campos específicos de licencia siempre se agregan |
| ❌ UI confusa | ✅ 2 secciones claras, una por documento |

---

**Última actualización**: 2025-10-24

**Versión**: 4.2.1

🤖 **Documentación generada con Claude Code**
