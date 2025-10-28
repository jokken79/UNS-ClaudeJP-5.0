# Frontend Library Structure

Esta carpeta contiene todas las utilidades, servicios y funciones compartidas del frontend de UNS-ClaudeJP 5.0.

## Estructura Organizada (Nueva)

A partir de 2025-10-28, hemos organizado las librerías en carpetas temáticas para mejorar la mantenibilidad y claridad del código.

```
lib/
├── api/                    # Cliente API y servicios
│   ├── api.ts             # Cliente axios principal (en raíz por retrocompatibilidad)
│   ├── database.ts        # Servicio de gestión de base de datos
│   └── index.ts           # ✅ Barrel export
│
├── theme-system/          # Sistema de temas
│   └── index.ts           # ✅ Re-exporta: themes.ts, custom-themes.ts, theme-utils.ts
│
├── template-system/       # Sistema de plantillas
│   └── index.ts           # ✅ Re-exporta: templates.ts, custom-templates.ts, template-export.ts
│
├── styling/               # Utilidades de estilos
│   └── index.ts           # ✅ Re-exporta: color-utils.ts, css-export.ts, preset-combinations.ts
│
├── motion/                # Animaciones
│   └── index.ts           # ✅ Re-exporta: animations.ts, form-animations.ts, route-transitions.ts, view-transitions.ts
│
├── utilities/             # Utilidades generales
│   └── index.ts           # ✅ Re-exporta: utils.ts, font-utils.ts, loading-utils.ts
│
├── data/                  # Datos y fixtures
│   └── index.ts           # ✅ Re-exporta: dashboard-data.ts
│
├── observability/         # Telemetría y monitoreo
│   └── index.ts           # ✅ Re-exporta: telemetry.ts
│
├── constants/             # Constantes (ya existía)
│   └── dashboard-config.ts
│
├── hooks/                 # React hooks (ya existía)
│   └── use-sidebar.ts
│
└── [archivos en raíz]     # Archivos originales (retrocompatibilidad)
    ├── api.ts
    ├── themes.ts
    ├── custom-themes.ts
    ├── templates.ts
    ├── ...
```

## Guía de Migración

### Opción 1: Imports Nuevos (Recomendado)

Usa los barrel exports de las carpetas temáticas:

```typescript
// ✅ NUEVO - Importa desde carpetas temáticas
import { themes, getCustomThemes, applyTheme } from '@/lib/theme-system';
import { templates, createCustomTemplate } from '@/lib/template-system';
import { hexToHSL, exportToCSS } from '@/lib/styling';
import { fadeIn, formAnimations } from '@/lib/motion';
import { cn, loadFont } from '@/lib/utilities';
import { dashboardStats } from '@/lib/data';
import { trackEvent } from '@/lib/observability';
import api, { databaseService } from '@/lib/api';
```

### Opción 2: Imports Antiguos (Retrocompatibilidad)

Los imports antiguos SIGUEN FUNCIONANDO por retrocompatibilidad:

```typescript
// ⚠️ ANTIGUO - Aún funciona pero no recomendado
import { themes } from '@/lib/themes';
import { templates } from '@/lib/templates';
import { hexToHSL } from '@/lib/color-utils';
import api from '@/lib/api';
```

## Catálogo de Módulos

### 🎨 theme-system
Sistema completo de temas con 12 temas predefinidos y temas personalizados ilimitados.

**Archivos incluidos:**
- `themes.ts` - 12 temas predefinidos (default-light, default-dark, uns-kikaku, etc.)
- `custom-themes.ts` - Gestión de temas personalizados (crear, guardar, eliminar)
- `theme-utils.ts` - Utilidades para aplicar y validar temas

**Uso:**
```typescript
import { themes, getCustomThemes, applyTheme, saveCustomTheme } from '@/lib/theme-system';

// Obtener tema predefinido
const theme = themes.find(t => t.name === 'uns-kikaku');

// Aplicar tema
applyTheme(theme);

// Crear tema personalizado
saveCustomTheme({ name: 'mi-tema', colors: { ... } });
```

### 📄 template-system
Sistema de plantillas para personalizar diseño visual y layout.

**Archivos incluidos:**
- `templates.ts` - Plantillas predefinidas (53KB - el más grande!)
- `custom-templates.ts` - Creación de plantillas personalizadas
- `template-export.ts` - Exportar/importar plantillas como JSON

**Uso:**
```typescript
import { templates, createCustomTemplate, exportTemplate } from '@/lib/template-system';

// Aplicar plantilla
const template = templates[0];
applyTemplateToDocument(template);

// Exportar plantilla
const json = exportTemplate(template);
```

### 🎨 styling
Utilidades para manipulación de colores, CSS y combinaciones de presets.

**Archivos incluidos:**
- `color-utils.ts` - Conversión de colores (hex to HSL, validación)
- `css-export.ts` - Exportar temas/templates como CSS
- `preset-combinations.ts` - Combinaciones predefinidas de tema+plantilla

**Uso:**
```typescript
import { hexToHSL, exportToCSS, presetCombinations } from '@/lib/styling';

// Convertir color
const hsl = hexToHSL('#FF5733');

// Exportar a CSS
const css = exportToCSS(theme, template);
```

### 🎬 motion
Animaciones con Framer Motion para toda la aplicación.

**Archivos incluidos:**
- `animations.ts` - Variantes generales (fadeIn, slideIn, etc.)
- `form-animations.ts` - Animaciones específicas para formularios
- `route-transitions.ts` - Transiciones entre rutas
- `view-transitions.ts` - View Transitions API

**Uso:**
```typescript
import { fadeIn, formAnimations, routeVariants } from '@/lib/motion';

// En componente
<motion.div variants={fadeIn} initial="initial" animate="animate">
  Content
</motion.div>
```

### 🛠️ utilities
Utilidades generales: classNames, fuentes, estados de carga.

**Archivos incluidos:**
- `utils.ts` - Función `cn()` para classNames (166 bytes)
- `font-utils.ts` - Carga de fuentes de Google Fonts (13KB)
- `loading-utils.ts` - Estados de carga y skeletons (9.8KB)

**Uso:**
```typescript
import { cn, loadFont, showLoading } from '@/lib/utilities';

// Combinar clases
const className = cn('base-class', condition && 'conditional-class');

// Cargar fuente
await loadFont('Roboto');
```

### 📊 data
Datos de dashboard y fixtures para desarrollo.

**Archivos incluidos:**
- `dashboard-data.ts` - Estadísticas y datos mock (13.8KB)

**Uso:**
```typescript
import { dashboardStats, mockEmployees } from '@/lib/data';

// Usar datos mock en desarrollo
const employees = mockEmployees;
```

### 📡 observability
Telemetría, analytics y monitoreo.

**Archivos incluidos:**
- `telemetry.ts` - Tracking de eventos y errores (1.7KB)

**Uso:**
```typescript
import { trackEvent, logError } from '@/lib/observability';

// Trackear evento
trackEvent('button_click', { button_id: 'submit' });

// Log error
logError(new Error('Something went wrong'));
```

### 🌐 api
Cliente API axios con interceptores y servicios.

**Archivos incluidos:**
- `api.ts` - Cliente axios principal (9.7KB)
- `database.ts` - Servicio de gestión de base de datos (2KB)

**Uso:**
```typescript
import api, { databaseService } from '@/lib/api';

// Llamada API
const response = await api.get('/employees');

// Servicio de base de datos
const tables = await databaseService.getTables();
```

## Estado de Migración

### ✅ Fase 1: Estructura Creada (Completada)
- [x] Crear carpetas temáticas
- [x] Crear barrel exports (index.ts)
- [x] Archivos originales permanecen en raíz
- [x] Retrocompatibilidad 100% garantizada

### ⏳ Fase 2: Migración Gradual (Pendiente)
- [ ] Actualizar imports en archivos principales (109 archivos afectados)
- [ ] Mover archivos a sus carpetas correspondientes
- [ ] Eliminar archivos de raíz
- [ ] Actualizar tsconfig paths si es necesario

### 📋 Fase 3: Cleanup (Futuro)
- [ ] Remover exports antiguos
- [ ] Consolidar duplicados
- [ ] Optimizar tree-shaking

## Ventajas de la Nueva Estructura

1. **Organización Clara**: Fácil encontrar utilidades por categoría
2. **Imports Limpios**: Importar múltiples funciones desde un solo módulo
3. **Retrocompatibilidad**: Código existente sigue funcionando
4. **Migración Gradual**: Actualizar archivos uno por uno sin romper nada
5. **Mejor Tree-Shaking**: Bundlers pueden optimizar mejor con barrel exports
6. **Documentación**: Cada módulo tiene su propósito claramente definido

## Archivos en Raíz (Por Retrocompatibilidad)

Estos archivos permanecen en la raíz hasta completar la Fase 2 de migración:

- `api.ts` (9.7KB)
- `animations.ts` (7.6KB)
- `color-utils.ts` (4KB)
- `css-export.ts` (7.3KB)
- `custom-templates.ts` (4KB)
- `custom-themes.ts` (7.7KB)
- `dashboard-data.ts` (13.8KB)
- `font-utils.ts` (13.2KB)
- `form-animations.ts` (5KB)
- `loading-utils.ts` (9.8KB)
- `preset-combinations.ts` (8.6KB)
- `route-transitions.ts` (3.9KB)
- `telemetry.ts` (1.7KB)
- `template-export.ts` (5KB)
- `templates.ts` (53KB - ¡el más grande!)
- `theme-utils.ts` (7.9KB)
- `themes.ts` (25.3KB)
- `utils.ts` (166 bytes)
- `view-transitions.ts` (2.7KB)

**Total**: ~211KB de utilidades reutilizables

## Plan de Migración Recomendado

Para migrar archivos de la raíz a las carpetas temáticas:

1. **Identificar archivos que usan imports antiguos**:
   ```bash
   grep -r "from '@/lib/themes'" frontend/
   ```

2. **Actualizar imports archivo por archivo**:
   ```typescript
   // Antes
   import { themes } from '@/lib/themes';

   // Después
   import { themes } from '@/lib/theme-system';
   ```

3. **Verificar TypeScript**:
   ```bash
   npm run type-check
   ```

4. **Probar en desarrollo**:
   ```bash
   npm run dev
   ```

5. **Una vez todos los imports actualizados, mover archivos**:
   ```bash
   mv lib/themes.ts lib/theme-system/themes.ts
   # Actualizar import en index.ts a './themes' en lugar de '../themes'
   ```

## Soporte

Si encuentras problemas con los imports o la migración:

1. Verifica que estés usando la sintaxis correcta: `@/lib/[carpeta]`
2. Los imports antiguos siguen funcionando: `@/lib/[archivo]`
3. Consulta este README para ejemplos de uso
4. Revisa el código de los index.ts para ver qué exporta cada módulo

---

**Última actualización**: 2025-10-28
**Versión**: 5.0
**Estado**: Fase 1 Completada ✅
