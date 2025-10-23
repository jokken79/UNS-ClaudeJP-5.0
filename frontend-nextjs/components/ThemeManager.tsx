"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Import themes with error handling
let themes: any[] = [];
let getCustomThemes: () => any[] = () => [];

try {
  const themesModule = require('@/lib/themes');
  themes = themesModule.themes || [];
} catch (error) {
  console.warn('Error loading themes in ThemeManager:', error);
}

try {
  const customThemesModule = require('@/lib/custom-themes');
  getCustomThemes = customThemesModule.getCustomThemes || (() => []);
} catch (error) {
  console.warn('Error loading custom themes in ThemeManager:', error);
}

const themeAliases: Record<string, string> = {
  dark: "default-dark",
  light: "default-light",
};

export function ThemeManager() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;

    try {
      const normalizedTheme = themeAliases[theme] ?? theme;
      const root = document.documentElement;

      // First check pre-defined themes
      let selectedTheme = themes.find((t) => t.name === normalizedTheme);

      // If not found, check custom themes
      if (!selectedTheme) {
        const customThemes = getCustomThemes();
        selectedTheme = customThemes.find((t) => t.name === normalizedTheme);
      }

      if (selectedTheme) {
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
          // Type assertion to fix TypeScript error
          root.style.setProperty(key, value as string);
        });
      } else if (themes.length > 0) {
        // Fallback to default if theme not found
        Object.keys(themes[0].colors).forEach((key) => {
          root.style.removeProperty(key);
        });
      }

      root.classList.toggle("dark", normalizedTheme === "default-dark");
    } catch (error) {
      console.warn('Error applying theme:', error);
    }
  }, [theme]);

  return null; // This component does not render anything
}