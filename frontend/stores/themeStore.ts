'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { Theme } from '@/lib/themes';

/**
 * Element Configuration for layout elements (header, sidebar, footer, etc.)
 */
export interface ElementConfig {
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  padding: string;
  margin: string;
  borderRadius: string;
  boxShadow: string;
  borderColor: string;
  borderWidth: string;
}

/**
 * Typography Configuration
 */
export interface TypographyConfig {
  fontFamily: {
    heading: string;
    body: string;
    ui: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * Spacing Configuration
 */
export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Shadow Configuration
 */
export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

/**
 * Border Radius Configuration
 */
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

/**
 * Complete Theme Configuration for the Theme Editor
 */
export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  colors: Theme['colors'];
  typography: TypographyConfig;
  layout: {
    header: ElementConfig;
    sidebar: ElementConfig;
    main: ElementConfig;
    footer: ElementConfig;
    card: ElementConfig;
  };
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
}

/**
 * Default Element Configuration
 */
const defaultElementConfig: ElementConfig = {
  backgroundColor: 'var(--background)',
  textColor: 'var(--foreground)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  fontWeight: '400',
  padding: '1rem',
  margin: '0',
  borderRadius: '0.5rem',
  boxShadow: 'none',
  borderColor: 'var(--border)',
  borderWidth: '1px',
};

/**
 * Default Theme Configuration
 */
const defaultThemeConfig: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  version: '1.0.0',
  colors: {
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%',
    '--card': '0 0% 100%',
    '--card-foreground': '222 47% 11%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222 47% 11%',
    '--primary': '221 83% 53%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 40% 96%',
    '--secondary-foreground': '222 47% 11%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215 16% 47%',
    '--accent': '221 83% 53%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '214 32% 91%',
    '--input': '214 32% 91%',
    '--ring': '221 83% 53%',
  },
  typography: {
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
  },
  layout: {
    header: { ...defaultElementConfig },
    sidebar: { ...defaultElementConfig },
    main: { ...defaultElementConfig },
    footer: { ...defaultElementConfig },
    card: { ...defaultElementConfig },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
};

/**
 * Helper function to get nested property value
 * @param obj - Object to get property from
 * @param path - Dot-separated path (e.g., "layout.header.backgroundColor")
 * @returns The value at the path or undefined
 */
function getProperty(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Helper function to set nested property value (immutably)
 * @param obj - Object to set property on
 * @param path - Dot-separated path (e.g., "layout.header.backgroundColor")
 * @param value - Value to set
 * @returns New object with updated value
 */
function setProperty(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone

  let current = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
}

/**
 * Theme Store State Interface
 */
interface ThemeStoreState {
  // Current theme being edited
  currentTheme: ThemeConfig;

  // Selected element in the editor (e.g., "header", "sidebar", "main")
  selectedElement: string | null;

  // History for undo/redo (max 50 entries)
  history: ThemeConfig[];
  historyIndex: number;

  // Preview mode
  isPreviewMode: boolean;

  // Available saved themes
  availableThemes: ThemeConfig[];

  // Dirty flag
  hasUnsavedChanges: boolean;

  // Actions

  /**
   * Load a theme into the editor
   * @param theme - Theme to load
   */
  setTheme: (theme: ThemeConfig) => void;

  /**
   * Update a single theme property by path
   * @param path - Dot-separated path (e.g., "colors.--primary" or "layout.header.backgroundColor")
   * @param value - New value
   */
  updateThemeProperty: (path: string, value: any) => void;

  /**
   * Select an element for editing
   * @param elementId - Element ID (e.g., "header", "sidebar") or null to deselect
   */
  selectElement: (elementId: string | null) => void;

  /**
   * Undo the last change
   */
  undo: () => void;

  /**
   * Redo the last undone change
   */
  redo: () => void;

  /**
   * Check if undo is available
   */
  canUndo: () => boolean;

  /**
   * Check if redo is available
   */
  canRedo: () => boolean;

  /**
   * Save current theme to available themes
   * @param name - Theme name
   * @returns The saved theme
   */
  saveTheme: (name: string) => ThemeConfig;

  /**
   * Load a saved theme by ID
   * @param themeId - Theme ID to load
   */
  loadTheme: (themeId: string) => void;

  /**
   * Delete a saved theme
   * @param themeId - Theme ID to delete
   */
  deleteTheme: (themeId: string) => void;

  /**
   * Reset to default theme
   */
  resetTheme: () => void;

  /**
   * Toggle preview mode
   */
  togglePreviewMode: () => void;

  /**
   * Export current theme as JSON
   * @returns JSON string of the theme
   */
  exportTheme: () => string;

  /**
   * Import theme from JSON
   * @param json - JSON string of the theme
   */
  importTheme: (json: string) => void;

  /**
   * Get a property value from current theme
   * @param path - Dot-separated path
   * @returns Property value
   */
  getProperty: (path: string) => any;

  /**
   * Clear unsaved changes flag
   */
  markAsSaved: () => void;

  /**
   * Load available themes from storage
   */
  loadAvailableThemes: () => void;
}

/**
 * Maximum history entries (for undo/redo)
 */
const MAX_HISTORY = 50;

/**
 * Storage key for available themes
 */
const THEMES_STORAGE_KEY = 'uns-theme-editor-themes';

/**
 * Create storage handler for SSR compatibility
 */
const createStorage = (): StateStorage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return localStorage;
};

/**
 * Load themes from localStorage
 */
function loadThemesFromStorage(): ThemeConfig[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(THEMES_STORAGE_KEY);
    if (!stored) return [];

    const themes = JSON.parse(stored);
    return Array.isArray(themes) ? themes : [];
  } catch (error) {
    console.error('Error loading themes from storage:', error);
    return [];
  }
}

/**
 * Save themes to localStorage
 */
function saveThemesToStorage(themes: ThemeConfig[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error('Error saving themes to storage:', error);
  }
}

/**
 * Theme Editor Store
 */
export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTheme: defaultThemeConfig,
      selectedElement: null,
      history: [defaultThemeConfig],
      historyIndex: 0,
      isPreviewMode: false,
      availableThemes: [],
      hasUnsavedChanges: false,

      // Actions

      setTheme: (theme) => {
        set({
          currentTheme: theme,
          history: [theme],
          historyIndex: 0,
          hasUnsavedChanges: false,
        });
      },

      updateThemeProperty: (path, value) => {
        const state = get();
        const newTheme = setProperty(state.currentTheme, path, value);

        // Add to history (remove any redo history)
        const newHistory = [
          ...state.history.slice(0, state.historyIndex + 1),
          newTheme,
        ];

        // Limit history size
        const limitedHistory = newHistory.length > MAX_HISTORY
          ? newHistory.slice(newHistory.length - MAX_HISTORY)
          : newHistory;

        set({
          currentTheme: newTheme,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
          hasUnsavedChanges: true,
        });
      },

      selectElement: (elementId) => {
        set({ selectedElement: elementId });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            currentTheme: state.history[newIndex],
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          set({
            currentTheme: state.history[newIndex],
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      saveTheme: (name) => {
        const state = get();
        const themeToSave: ThemeConfig = {
          ...state.currentTheme,
          id: `theme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name,
        };

        const updatedThemes = [...state.availableThemes, themeToSave];
        saveThemesToStorage(updatedThemes);

        set({
          availableThemes: updatedThemes,
          hasUnsavedChanges: false,
        });

        return themeToSave;
      },

      loadTheme: (themeId) => {
        const state = get();
        const theme = state.availableThemes.find((t) => t.id === themeId);

        if (theme) {
          set({
            currentTheme: theme,
            history: [theme],
            historyIndex: 0,
            hasUnsavedChanges: false,
          });
        } else {
          console.warn(`Theme with ID ${themeId} not found`);
        }
      },

      deleteTheme: (themeId) => {
        const state = get();
        const updatedThemes = state.availableThemes.filter((t) => t.id !== themeId);
        saveThemesToStorage(updatedThemes);

        set({ availableThemes: updatedThemes });
      },

      resetTheme: () => {
        set({
          currentTheme: defaultThemeConfig,
          history: [defaultThemeConfig],
          historyIndex: 0,
          hasUnsavedChanges: false,
          selectedElement: null,
        });
      },

      togglePreviewMode: () => {
        set((state) => ({ isPreviewMode: !state.isPreviewMode }));
      },

      exportTheme: () => {
        const state = get();
        return JSON.stringify(state.currentTheme, null, 2);
      },

      importTheme: (json) => {
        try {
          const theme = JSON.parse(json) as ThemeConfig;

          // Validate theme structure
          if (!theme.id || !theme.name || !theme.colors) {
            throw new Error('Invalid theme format');
          }

          set({
            currentTheme: theme,
            history: [theme],
            historyIndex: 0,
            hasUnsavedChanges: true,
          });
        } catch (error) {
          console.error('Error importing theme:', error);
          throw new Error('Failed to import theme. Invalid JSON format.');
        }
      },

      getProperty: (path) => {
        const state = get();
        return getProperty(state.currentTheme, path);
      },

      markAsSaved: () => {
        set({ hasUnsavedChanges: false });
      },

      loadAvailableThemes: () => {
        const themes = loadThemesFromStorage();
        set({ availableThemes: themes });
      },
    }),
    {
      name: 'uns-theme-editor-storage',
      storage: createJSONStorage(createStorage),
      // Only persist UI state, not the full theme or history (to save space)
      partialize: (state) => ({
        selectedElement: state.selectedElement,
        isPreviewMode: state.isPreviewMode,
      }),
    }
  )
);

// Initialize available themes on first load
if (typeof window !== 'undefined') {
  useThemeStore.getState().loadAvailableThemes();
}
