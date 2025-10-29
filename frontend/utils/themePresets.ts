/**
 * Theme Presets Utility
 *
 * Provides utilities for converting existing Theme objects from lib/themes.ts
 * to the new ThemeConfig format used by the Theme Editor.
 */

import { Theme, themes } from '@/lib/themes';
import type {
  ThemeConfig,
  ElementConfig,
  TypographyConfig,
  SpacingConfig,
  BorderRadiusConfig,
  ShadowConfig,
} from '@/stores/themeStore';

/**
 * Default Element Configuration
 * Used as base configuration for all layout elements
 */
const defaultElementConfig: ElementConfig = {
  backgroundColor: 'var(--background)',
  textColor: 'var(--foreground)',
  fontSize: '1rem',
  fontFamily: 'Inter, sans-serif',
  fontWeight: '400',
  padding: '1rem',
  margin: '0',
  borderRadius: '0.5rem',
  boxShadow: 'none',
  borderColor: 'var(--border)',
  borderWidth: '1px',
};

/**
 * Default Typography Configuration
 */
const defaultTypography: TypographyConfig = {
  fontFamily: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    ui: 'Inter, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

/**
 * Default Spacing Configuration
 */
const defaultSpacing: SpacingConfig = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

/**
 * Default Border Radius Configuration
 */
const defaultBorderRadius: BorderRadiusConfig = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

/**
 * Default Shadow Configuration
 */
const defaultShadows: ShadowConfig = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

/**
 * Converts a Theme object to ThemeConfig format
 *
 * @param theme - Theme object from lib/themes.ts
 * @returns ThemeConfig object for the Theme Editor
 */
export function convertThemeToThemeConfig(theme: Theme): ThemeConfig {
  const fontFamily = theme.font || 'Inter';
  const fontFamilyWithFallback = `${fontFamily}, sans-serif`;

  // Create element configurations with theme-specific font
  const createElementConfig = (overrides: Partial<ElementConfig> = {}): ElementConfig => ({
    ...defaultElementConfig,
    fontFamily: fontFamilyWithFallback,
    ...overrides,
  });

  // Generate unique ID from theme name
  const id = theme.name.toLowerCase().replace(/\s+/g, '-');

  return {
    id,
    name: theme.name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    version: '1.0.0',
    colors: theme.colors,
    typography: {
      ...defaultTypography,
      fontFamily: {
        heading: fontFamilyWithFallback,
        body: fontFamilyWithFallback,
        ui: fontFamilyWithFallback,
      },
    },
    layout: {
      header: createElementConfig({
        fontSize: '1rem',
        fontWeight: '500',
        padding: '1rem',
        borderRadius: '0',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        borderWidth: '0 0 1px 0',
      }),
      sidebar: createElementConfig({
        backgroundColor: 'var(--card)',
        fontSize: '0.875rem',
        padding: '1.5rem 1rem',
        borderRadius: '0',
        boxShadow: 'none',
        borderWidth: '0 1px 0 0',
      }),
      main: createElementConfig({
        fontSize: '1rem',
        padding: '2rem',
        borderRadius: '0',
        boxShadow: 'none',
        borderColor: 'transparent',
        borderWidth: '0',
      }),
      footer: createElementConfig({
        backgroundColor: 'var(--card)',
        textColor: 'var(--muted-foreground)',
        fontSize: '0.875rem',
        padding: '1.5rem 2rem',
        borderRadius: '0',
        boxShadow: 'none',
        borderWidth: '1px 0 0 0',
      }),
      card: createElementConfig({
        backgroundColor: 'var(--card)',
        textColor: 'var(--card-foreground)',
        fontSize: '1rem',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        borderWidth: '1px',
      }),
    },
    spacing: defaultSpacing,
    borderRadius: defaultBorderRadius,
    shadows: defaultShadows,
  };
}

/**
 * Array of all preset themes converted to ThemeConfig format
 */
export const PRESET_THEMES: ThemeConfig[] = themes.map(convertThemeToThemeConfig);

/**
 * Get a preset theme by name
 *
 * @param themeName - Name of the theme (e.g., "default-light", "ocean-blue-dark")
 * @returns ThemeConfig object if found, undefined otherwise
 */
export function getPresetTheme(themeName: string): ThemeConfig | undefined {
  return PRESET_THEMES.find((theme) => theme.id === themeName);
}

/**
 * Get all preset theme names
 *
 * @returns Array of theme names
 */
export function getPresetThemeNames(): string[] {
  return PRESET_THEMES.map((theme) => theme.id);
}

/**
 * Default Theme constant (default-light theme)
 */
export const DEFAULT_THEME: ThemeConfig = getPresetTheme('default-light') || PRESET_THEMES[0];

/**
 * Get themes by category
 *
 * Categories are inferred from theme names:
 * - default: Default themes
 * - uns-kikaku: Corporate themes
 * - ocean-blue, mint-green, forest-green: Nature themes
 * - sunset, espresso: Warm themes
 * - royal-purple, vibrant-coral: Vibrant themes
 * - industrial: Industrial themes
 * - monochrome: Minimal themes
 * - jpkken: Custom brand themes
 *
 * @param category - Category name
 * @returns Array of ThemeConfig objects in that category
 */
export function getThemesByCategory(category: string): ThemeConfig[] {
  const categoryMap: Record<string, string[]> = {
    default: ['default'],
    corporate: ['uns-kikaku', 'industrial'],
    nature: ['ocean-blue', 'mint-green', 'forest-green'],
    warm: ['sunset', 'espresso'],
    vibrant: ['royal-purple', 'vibrant-coral'],
    minimal: ['monochrome'],
    brand: ['jpkken'],
  };

  const prefixes = categoryMap[category.toLowerCase()] || [];

  return PRESET_THEMES.filter((theme) =>
    prefixes.some((prefix) => theme.id.startsWith(prefix))
  );
}

/**
 * Get light/dark variant of a theme
 *
 * @param themeId - Theme ID
 * @param variant - "light" or "dark"
 * @returns ThemeConfig object if found, undefined otherwise
 */
export function getThemeVariant(
  themeId: string,
  variant: 'light' | 'dark'
): ThemeConfig | undefined {
  // Remove existing light/dark suffix if present
  const baseName = themeId.replace(/-(?:light|dark)$/, '');
  const variantName = `${baseName}-${variant}`;

  return getPresetTheme(variantName);
}

/**
 * Check if a theme has both light and dark variants
 *
 * @param themeId - Theme ID (can be with or without -light/-dark suffix)
 * @returns True if both variants exist
 */
export function hasLightDarkVariants(themeId: string): boolean {
  const baseName = themeId.replace(/-(?:light|dark)$/, '');
  const lightVariant = getPresetTheme(`${baseName}-light`);
  const darkVariant = getPresetTheme(`${baseName}-dark`);

  return lightVariant !== undefined && darkVariant !== undefined;
}

/**
 * Get the base theme name (without -light or -dark suffix)
 *
 * @param themeId - Theme ID
 * @returns Base theme name
 */
export function getBaseThemeName(themeId: string): string {
  return themeId.replace(/-(?:light|dark)$/, '');
}

/**
 * Get the variant of a theme ("light" or "dark")
 *
 * @param themeId - Theme ID
 * @returns "light", "dark", or null if no variant suffix
 */
export function getThemeVariantType(themeId: string): 'light' | 'dark' | null {
  if (themeId.endsWith('-light')) return 'light';
  if (themeId.endsWith('-dark')) return 'dark';
  return null;
}
