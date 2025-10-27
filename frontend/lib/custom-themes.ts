import { Theme } from './themes';

export interface CustomTheme extends Theme {
  id: string;
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'uns-custom-themes';
const MAX_CUSTOM_THEMES = 10;

/**
 * Get all custom themes from localStorage
 */
export function getCustomThemes(): CustomTheme[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const themes = JSON.parse(stored);
    return Array.isArray(themes) ? themes : [];
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
}

/**
 * Save a new custom theme
 */
export function saveCustomTheme(theme: Omit<CustomTheme, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): CustomTheme {
  const themes = getCustomThemes();

  // Check if max limit reached
  if (themes.length >= MAX_CUSTOM_THEMES) {
    throw new Error(`Maximum ${MAX_CUSTOM_THEMES} custom themes allowed`);
  }

  // Check if name already exists
  if (themes.some(t => t.name === theme.name)) {
    throw new Error('A theme with this name already exists');
  }

  const now = new Date().toISOString();
  const newTheme: CustomTheme = {
    ...theme,
    id: generateThemeId(),
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  themes.push(newTheme);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error('Error saving custom theme:', error);
    throw new Error('Failed to save custom theme');
  }

  return newTheme;
}

/**
 * Update an existing custom theme
 */
export function updateCustomTheme(id: string, updates: Partial<Omit<CustomTheme, 'id' | 'isCustom' | 'createdAt'>>): CustomTheme {
  const themes = getCustomThemes();
  const index = themes.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error('Theme not found');
  }

  // Check if name already exists (excluding current theme)
  if (updates.name && themes.some(t => t.id !== id && t.name === updates.name)) {
    throw new Error('A theme with this name already exists');
  }

  const updatedTheme: CustomTheme = {
    ...themes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  themes[index] = updatedTheme;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error('Error updating custom theme:', error);
    throw new Error('Failed to update custom theme');
  }

  return updatedTheme;
}

/**
 * Delete a custom theme
 */
export function deleteCustomTheme(id: string): void {
  const themes = getCustomThemes();
  const filtered = themes.filter(t => t.id !== id);

  if (filtered.length === themes.length) {
    throw new Error('Theme not found');
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    throw new Error('Failed to delete custom theme');
  }
}

/**
 * Apply a custom theme to the document
 */
export function applyCustomTheme(theme: CustomTheme): void {
  try {
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    // Apply custom theme font if available
    if (theme.font) {
      const fontVariable = theme.font
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const fontVarRef = `--font-${fontVariable}`;
      root.style.setProperty('--layout-font-body', `var(${fontVarRef})`);
      root.style.setProperty('--layout-font-heading', `var(${fontVarRef})`);
      root.style.setProperty('--layout-font-ui', `var(${fontVarRef})`);
    }
  } catch (error) {
    console.error('Error applying custom theme:', error);
    throw new Error('Failed to apply custom theme');
  }
}

/**
 * Create a theme object from color inputs
 */
export interface ThemeColorInputs {
  primary: string; // hex
  background: string; // hex
  foreground: string; // hex
  card: string; // hex
  secondary: string; // hex
  accent: string; // hex
  border: string; // hex
  muted: string; // hex
  destructive?: string; // hex (optional, will use default)
  font?: string; // font name (optional)
}

export function createThemeFromColors(name: string, colors: ThemeColorInputs, font?: string): Omit<CustomTheme, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> {
  try {
    // Import color utilities with error handling
    let hexToHsl: (hex: string) => string;
    let getContrastColor: (hex: string) => string;
    
    try {
      const colorUtils = require('./color-utils');
      hexToHsl = colorUtils.hexToHsl;
      getContrastColor = colorUtils.getContrastColor;
    } catch (error) {
      console.error('Error loading color utilities:', error);
      throw new Error('Failed to load color utilities');
    }

    // Get contrasting foreground colors
    const primaryFg = getContrastColor(colors.primary);
    const secondaryFg = getContrastColor(colors.secondary);
    const accentFg = getContrastColor(colors.accent);
    const destructiveFg = '#FFFFFF';

    // Convert hex to HSL
    const themeColors = {
      "--background": hexToHsl(colors.background),
      "--foreground": hexToHsl(colors.foreground),
      "--card": hexToHsl(colors.card),
      "--card-foreground": hexToHsl(colors.foreground),
      "--popover": hexToHsl(colors.card),
      "--popover-foreground": hexToHsl(colors.foreground),
      "--primary": hexToHsl(colors.primary),
      "--primary-foreground": hexToHsl(primaryFg),
      "--secondary": hexToHsl(colors.secondary),
      "--secondary-foreground": hexToHsl(secondaryFg),
      "--muted": hexToHsl(colors.muted),
      "--muted-foreground": hexToHsl(colors.foreground).replace(/\d+%\s+\d+%$/, '50% 50%'), // Make muted-fg lighter
      "--accent": hexToHsl(colors.accent),
      "--accent-foreground": hexToHsl(accentFg),
      "--destructive": colors.destructive ? hexToHsl(colors.destructive) : "0 84.2% 60.2%",
      "--destructive-foreground": hexToHsl(destructiveFg),
      "--border": hexToHsl(colors.border),
      "--input": hexToHsl(colors.border),
      "--ring": hexToHsl(colors.primary),
    };

    const theme: Omit<CustomTheme, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> = {
      name,
      colors: themeColors,
    };

    // Include font if provided (prioritize parameter, fallback to colors.font)
    const themeFont = font || colors.font;
    if (themeFont) {
      theme.font = themeFont;
    }

    return theme;
  } catch (error) {
    console.error('Error creating theme from colors:', error);
    throw new Error('Failed to create theme from colors');
  }
}

/**
 * Get default color values for the theme builder
 */
export function getDefaultColorInputs(): ThemeColorInputs {
  return {
    primary: '#3B82F6',      // Blue
    background: '#FFFFFF',   // White
    foreground: '#0F172A',   // Dark gray
    card: '#F8FAFC',         // Light gray
    secondary: '#F1F5F9',    // Light blue gray
    accent: '#3B82F6',       // Blue (same as primary)
    border: '#E2E8F0',       // Light border
    muted: '#F1F5F9',        // Light muted
  };
}

/**
 * Check if theme limit is reached
 */
export function isThemeLimitReached(): boolean {
  try {
    return getCustomThemes().length >= MAX_CUSTOM_THEMES;
  } catch (error) {
    console.error('Error checking theme limit:', error);
    return false;
  }
}

/**
 * Get maximum theme limit
 */
export function getMaxThemes(): number {
  return MAX_CUSTOM_THEMES;
}

/**
 * Generate a unique ID for themes
 */
function generateThemeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
