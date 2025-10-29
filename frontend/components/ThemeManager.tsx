"use client";

import * as React from "react";
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
  const [isTransitioning, setIsTransitioning] = React.useState(false);

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
        // Start transition
        setIsTransitioning(true);
        root.setAttribute('data-theme-transitioning', 'true');

        // Apply theme colors with smooth transition
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(key, value as string);
        });

        // Apply theme font if available
        if (selectedTheme.font) {
          // Convert font name to CSS variable format
          // "Work Sans" → "--font-work-sans"
          // "IBM Plex Sans" → "--font-ibm-plex-sans"
          const fontVariable = selectedTheme.font
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          const fontVarRef = `--font-${fontVariable}`;

          // Apply to all layout font variables
          root.style.setProperty('--layout-font-body', `var(${fontVarRef})`);
          root.style.setProperty('--layout-font-heading', `var(${fontVarRef})`);
          root.style.setProperty('--layout-font-ui', `var(${fontVarRef})`);
        }

        // End transition after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
          root.removeAttribute('data-theme-transitioning');
        }, 300);
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