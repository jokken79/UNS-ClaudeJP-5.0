# Configuración de Azure Computer Vision OCR

Esta guía explica cómo habilitar el proveedor de Azure Computer Vision en UNS-ClaudeJP 4.2 para
obtener mayor precisión en el reconocimiento óptico de caracteres (OCR) de documentos japoneses.

## 1. Crear recursos en Azure
1. Ingresa al [portal de Azure](https://portal.azure.com/).
2. Crea un **resource group** (si aún no tienes uno) en la región más cercana a tus usuarios.
3. Crea un recurso **Computer Vision** (tipo "Cognitive Services").
4. Copia el **endpoint** y la **key primaria** desde la sección *Keys and Endpoint*.

## 2. Actualizar variables de entorno
Agrega los valores obtenidos al archivo `.env` (o exporta las variables en tu entorno CI/CD):

```env
AZURE_COMPUTER_VISION_ENDPOINT=https://<tu-endpoint>.cognitiveservices.azure.com/
AZURE_COMPUTER_VISION_KEY=<tu-api-key>
AZURE_COMPUTER_VISION_API_VERSION=2023-02-01-preview
```

> 💡 `generate_env.py` deja estas variables vacías por defecto. Solo necesitas editar el `.env`
> generado y volver a levantar los contenedores.

## 3. Reiniciar servicios
1. Ejecuta `docker compose down` para detener los servicios actuales.
2. Ejecuta `docker compose up -d --build` para reconstruir los contenedores con las nuevas variables.

El backend mostrará ahora el log `AzureOCRService initialized with credentials` y las peticiones a
`/api/azure-ocr/process` usarán Azure como proveedor principal.

## 4. Verificar funcionamiento
- Accede a `http://localhost:8000/api/health` y comprueba que `azure_ocr` aparezca en `services`.
- Desde el frontend, utiliza el formulario de candidatos para subir una imagen de *zairyū card*.
- Revisa los logs del backend (`docker compose logs backend -f`) para confirmar que no hay
  advertencias de credenciales faltantes.

## 5. Fallback automático
Si en algún momento eliminas las credenciales, el sistema volverá a usar EasyOCR/Tesseract como
fallback automático. No se generarán errores fatales, pero la precisión disminuirá al 60-70%.

Para mantener la calidad máxima en producción, asegúrate de que las variables anteriores estén
siempre definidas.
