# Guía de Prueba para la Solución de Impresión del Formulario de Candidatos

## Resumen de la Solución

Se ha implementado una solución completa para los problemas de impresión del formulario de candidatos (rirekisho). La solución incluye:

1. **Nueva página de impresión dedicada**: `/candidates/[id]/print/page.tsx`
2. **Mejoras en el formulario rirekisho**: `/candidates/rirekisho/page.tsx`
3. **Estilos de impresión optimizados**: `/candidates/rirekisho/print-styles.css`

## Problemas Resueltos

### 1. Impresión de elementos del dashboard
- **Problema**: Al imprimir el formulario, se incluían elementos del dashboard como menús, barras de navegación, etc.
- **Solución**: Se implementaron media queries específicas que ocultan todos los elementos del dashboard excepto el formulario durante la impresión.

### 2. Orientación de página incorrecta
- **Problema**: El formulario se configuraba para impresión horizontal (landscape) cuando debería ser vertical (portrait).
- **Solución**: Se cambió la configuración a A4 vertical con márgenes optimizados.

### 3. Formato de fecha incorrecto
- **Problema**: Las fechas se mostraban en formato ISO (YYYY-MM-DD) en lugar del formato japonés (YYYY年MM月DD日).
- **Solución**: Se implementó una función de conversión que muestra las fechas en formato japonés solo durante la impresión.

### 4. Elementos interactivos visibles
- **Problema**: Los bordes de los inputs, selects y checkboxes se mostraban en la impresión.
- **Solución**: Se aplicaron estilos que ocultan bordes y elementos interactivos durante la impresión.

## Cómo Probar la Solución

### Método 1: Desde el formulario de creación de candidatos

1. Navega a `/candidates/rirekisho`
2. Completa el formulario con información de prueba
3. Haz clic en el botón "印刷する" (Imprimir)
4. En el diálogo de impresión del navegador:
   - Selecciona "Guardar como PDF" para probar sin imprimir
   - Verifica que solo el formulario sea visible
   - Confirma que la orientación sea vertical
   - Verifica que las fechas aparezcan en formato japonés

### Método 2: Desde la lista de candidatos

1. Navega a `/candidates`
2. Busca un candidato existente
3. Haz clic en el botón de impresión junto al candidato
4. Verifica que se abra la página de impresión dedicada
5. Sigue los pasos del Método 1 para verificar la impresión

### Método 3: Vista previa de impresión del navegador

1. Abre el formulario de candidatos
2. Presiona `Ctrl+P` (Windows) o `Cmd+P` (Mac)
3. Verifica la vista previa de impresión
4. Confirma que solo el formulario sea visible

## Validaciones a Realizar

### Validaciones Visuales

- [ ] Solo el formulario es visible en la vista previa
- [ ] No aparecen elementos del dashboard
- [ ] La orientación es vertical (A4 portrait)
- [ ] Las fechas aparecen en formato japonés
- [ ] Los bordes de inputs y selects no son visibles
- [ ] Las checkboxes muestran el símbolo ✓ cuando están marcadas

### Validaciones de Contenido

- [ ] Todos los campos del formulario son visibles
- [ ] La información ingresada se muestra correctamente
- [ ] Las tablas mantienen su estructura
- [ ] Las imágenes (foto del candidato) se muestran correctamente

### Validaciones Técnicas

- [ ] No hay errores de JavaScript en la consola
- [ ] Los estilos CSS se aplican correctamente
- [ ] La impresión funciona en diferentes navegadores (Chrome, Firefox, Safari, Edge)

## Solución de Problemas Comunes

### Las fechas no se formatean correctamente

**Causa**: El evento `beforeprint` puede no activarse correctamente en algunos navegadores.

**Solución**: 
1. Asegúrate de que el formulario tenga datos en los campos de fecha
2. Intenta recargar la página y volver a imprimir
3. Si el problema persiste, prueba con un navegador diferente

### El formulario se corta en varias páginas

**Causa**: El contenido del formulario excede el tamaño de una página A4.

**Solución**:
1. Reduce la cantidad de datos en secciones como "職務経歴" o "家族構成"
2. Ajusta los márgenes en la configuración de impresión del navegador
3. Considera imprimir en modo "Ajustar a página" si está disponible

### Los bordes de las tablas no se muestran

**Causa**: Los estilos CSS pueden no estar aplicándose correctamente.

**Solución**:
1. Verifica que no haya extensiones del navegador que bloqueen estilos CSS
2. Recarga la página e intenta imprimir de nuevo
3. Limpia la caché del navegador

## Personalización Adicional

### Cambiar márgenes de impresión

Para ajustar los márgenes de impresión, modifica la siguiente línea en el archivo CSS:

```css
@page {
  size: A4 portrait;
  margin: 10mm; /* Ajusta este valor según sea necesario */
}
```

### Cambiar tamaño de fuente en impresión

Para ajustar el tamaño de fuente en la impresión, modifica las siguientes clases en el archivo CSS:

```css
@media print {
  th, td {
    font-size: 9pt !important; /* Ajusta este valor según sea necesario */
  }
}
```

## Soporte

Si encuentras algún problema durante las pruebas, por favor:

1. Captura una pantalla de la vista previa de impresión
2. Anota el navegador y la versión que estás utilizando
3. Describe los pasos que seguiste para reproducir el problema
4. Reporta el problema al equipo de desarrollo con esta información

## Conclusión

La solución de impresión implementada debería proporcionar una experiencia de impresión limpia y profesional para los formularios de candidatos, mostrando solo el contenido relevante en el formato correcto.