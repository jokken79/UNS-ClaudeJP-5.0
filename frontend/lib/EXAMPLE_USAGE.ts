/**
 * EXAMPLE USAGE - Nueva Estructura de /lib/
 *
 * Este archivo demuestra cómo usar los nuevos barrel exports
 * de la estructura reorganizada de /lib/
 *
 * NOTA: Este archivo es solo de ejemplo y NO debe importarse en producción.
 */

// ============================================================================
// ANTES (Imports Antiguos - Todavía Funcionan)
// ============================================================================

// import { themes } from '@/lib/themes';
// import { applyTheme } from '@/lib/theme-utils';
// import { getCustomThemes, saveCustomTheme } from '@/lib/custom-themes';
// import { templates } from '@/lib/templates';
// import { exportTemplate } from '@/lib/template-export';
// import { hexToHSL } from '@/lib/color-utils';
// import { exportToCSS } from '@/lib/css-export';
// import { fadeIn, slideIn } from '@/lib/animations';
// import { formAnimations } from '@/lib/form-animations';
// import { cn } from '@/lib/utils';
// import { loadFont } from '@/lib/font-utils';
// import api from '@/lib/api';
// import { databaseService } from '@/lib/api/database';

// ============================================================================
// DESPUÉS (Imports Nuevos - Recomendado)
// ============================================================================

// 🎨 Theme System - Todo lo relacionado con temas
import {
  themes,              // 12 temas predefinidos
  applyTheme,          // Aplicar tema al documento
  getCustomThemes,     // Obtener temas personalizados
  saveCustomTheme,     // Guardar tema personalizado
  deleteCustomTheme,   // Eliminar tema personalizado
  type Theme           // Tipo TypeScript
} from '@/lib/theme-system';

// 📄 Template System - Todo lo relacionado con plantillas
import {
  templates,           // Plantillas predefinidas
  exportTemplate,      // Exportar plantilla como JSON
  importTemplate,      // Importar plantilla desde JSON
  applyTemplateToDocument,
  type TemplateVariables
} from '@/lib/template-system';

// 🎨 Styling - Utilidades de estilos y colores
import {
  hexToHSL,           // Convertir hex a HSL
  hslToHex,           // Convertir HSL a hex
  exportToCSS,        // Exportar tema como CSS
  presetCombinations  // Combinaciones predefinidas
} from '@/lib/styling';

// 🎬 Motion - Todas las animaciones
import {
  fadeIn,             // Animación fade in
  slideIn,            // Animación slide in
  formAnimations,     // Animaciones para formularios
  routeVariants,      // Variantes para transiciones de ruta
  springConfigs       // Configuraciones de spring
} from '@/lib/motion';

// 🛠️ Utilities - Utilidades generales
import {
  cn,                 // Combinar classNames
  loadFont,           // Cargar fuente de Google Fonts
  showLoading,        // Mostrar indicador de carga
  hideLoading         // Ocultar indicador de carga
} from '@/lib/utilities';

// 📊 Data - Datos y fixtures
import {
  dashboardStats,     // Estadísticas de dashboard
  mockEmployees       // Empleados mock
} from '@/lib/data';

// 📡 Observability - Telemetría
import {
  trackEvent,         // Trackear evento
  logError            // Log de errores
} from '@/lib/observability';

// 🌐 API - Cliente API y servicios
import api, { databaseService } from '@/lib/api';

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/**
 * Ejemplo 1: Aplicar un tema predefinido
 */
export function exampleApplyTheme() {
  // Obtener tema UNS Kikaku
  const unsTheme = themes.find(t => t.name === 'uns-kikaku');

  if (unsTheme) {
    applyTheme(unsTheme);
    console.log('✅ Tema UNS Kikaku aplicado');
  }
}

/**
 * Ejemplo 2: Crear y guardar tema personalizado
 */
export function exampleCreateCustomTheme() {
  const myTheme: Theme = {
    name: 'mi-tema-personalizado',
    font: 'Inter',
    colors: {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96.1%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96.1%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96.1%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '221.2 83.2% 53.3%',
    }
  };

  saveCustomTheme(myTheme);
  console.log('✅ Tema personalizado guardado');
}

/**
 * Ejemplo 3: Aplicar plantilla
 */
export function exampleApplyTemplate() {
  const modernTemplate = templates.find(t => t.name === 'modern');

  if (modernTemplate) {
    applyTemplateToDocument(modernTemplate);
    console.log('✅ Plantilla Modern aplicada');
  }
}

/**
 * Ejemplo 4: Convertir color
 */
export function exampleColorConversion() {
  const hex = '#3B82F6';
  const hsl = hexToHSL(hex);

  console.log(`Color ${hex} en HSL: ${hsl}`);
  // Output: "221.2 83.2% 53.3%"
}

/**
 * Ejemplo 5: Usar animaciones
 */
export function exampleAnimations() {
  // En un componente React:
  /*
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    Contenido con fade in
  </motion.div>
  */
}

/**
 * Ejemplo 6: Llamada API
 */
export async function exampleAPICall() {
  try {
    // Obtener empleados
    const response = await api.get('/employees');
    console.log('✅ Empleados:', response.data);

    // Usar servicio de base de datos
    const tables = await databaseService.getTables();
    console.log('✅ Tablas:', tables);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Ejemplo 7: Trackear evento
 */
export function exampleTelemetry() {
  trackEvent('button_clicked', {
    button_id: 'apply-theme',
    theme_name: 'uns-kikaku'
  });
  console.log('✅ Evento trackeado');
}

/**
 * Ejemplo 8: Cargar fuente
 */
export async function exampleLoadFont() {
  await loadFont('Roboto');
  console.log('✅ Fuente Roboto cargada');
}

/**
 * Ejemplo 9: Combinar classNames
 */
export function exampleClassNames() {
  const isActive = true;
  const isDisabled = false;

  const className = cn(
    'base-class',
    isActive && 'active',
    isDisabled && 'disabled'
  );

  console.log('ClassName:', className);
  // Output: "base-class active"
}

/**
 * Ejemplo 10: Exportar tema como CSS
 */
export function exampleExportCSS() {
  const theme = themes[0];
  const template = templates[0];

  const css = exportToCSS(theme, template);

  console.log('✅ CSS generado:');
  console.log(css);
}

// ============================================================================
// COMPARACIÓN: ANTES vs DESPUÉS
// ============================================================================

/*
ANTES (múltiples imports dispersos):

import { themes } from '@/lib/themes';
import { applyTheme } from '@/lib/theme-utils';
import { getCustomThemes } from '@/lib/custom-themes';
import { templates } from '@/lib/templates';
import { hexToHSL } from '@/lib/color-utils';
import { fadeIn } from '@/lib/animations';

✅ 6 líneas de imports
❌ Difícil encontrar qué utilidad está en qué archivo
❌ No está claro qué archivos están relacionados

---

DESPUÉS (imports organizados por módulo):

import { themes, applyTheme, getCustomThemes } from '@/lib/theme-system';
import { templates } from '@/lib/template-system';
import { hexToHSL } from '@/lib/styling';
import { fadeIn } from '@/lib/motion';

✅ 4 líneas de imports
✅ Claro qué funciones pertenecen a qué módulo
✅ Fácil descubrir nuevas utilidades en cada módulo
✅ Mejor para tree-shaking
*/

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/*
1. RETROCOMPATIBILIDAD:
   - Los imports antiguos SIGUEN FUNCIONANDO
   - No hay necesidad de actualizar todo de inmediato
   - Puedes migrar archivos de forma gradual

2. RECOMENDACIÓN:
   - Usa los nuevos imports para código nuevo
   - Actualiza código existente gradualmente
   - Los barrel exports facilitan el descubrimiento de APIs

3. TIPOS TYPESCRIPT:
   - Todos los tipos se re-exportan correctamente
   - El autocompletado funciona igual de bien
   - No hay pérdida de información de tipos

4. TREE-SHAKING:
   - Los barrel exports con export * están optimizados
   - Los bundlers modernos (Webpack, Vite, Turbopack) manejan esto correctamente
   - No hay impacto en el bundle size

5. MIGRACIÓN:
   - Consulta /lib/MIGRATION_GUIDE.md para guía completa
   - Consulta /lib/README.md para documentación de cada módulo
*/
