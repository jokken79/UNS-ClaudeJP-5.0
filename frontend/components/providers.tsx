"use client";

import { ThemeProvider } from 'next-themes';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useTelemetry } from '@/lib/telemetry';

// Dynamic imports to prevent chunk loading errors
import dynamic from 'next/dynamic';

// Import themes with error handling
let themes: any[] = [];
let getCustomThemes: () => any[] = () => [];

try {
  const themesModule = require('@/lib/themes');
  themes = themesModule.themes || [];
} catch (error) {
  console.warn('Error loading themes:', error);
}

try {
  const customThemesModule = require('@/lib/custom-themes');
  getCustomThemes = customThemesModule.getCustomThemes || (() => []);
} catch (error) {
  console.warn('Error loading custom themes:', error);
}

const ThemeManager = dynamic(
  () => import('@/components/ThemeManager').then(mod => ({ default: mod.ThemeManager })),
  {
    ssr: false,
    loading: () => null,
  }
);

const TemplateManager = dynamic(
  () => import('@/components/TemplateManager').then(mod => ({ default: mod.TemplateManager })),
  {
    ssr: false,
    loading: () => null,
  }
);

const IS_DEV = process.env.NODE_ENV === 'development';

const ReactQueryDevtools = IS_DEV
  ? dynamic(
      () =>
        import('@tanstack/react-query-devtools').then(mod => ({
          default: mod.ReactQueryDevtools,
        })),
      {
        ssr: false,
      }
    )
  : null;

// Mapa de migración de nombres de temas antiguos a nuevos
const themesMigration: Record<string, string> = {
  'Default Light': 'default-light',
  'Default Dark': 'default-dark',
  'Ocean Blue': 'ocean-blue',
  'Mint Green': 'mint-green',
  'Royal Purple': 'royal-purple',
  'Vibrant Coral': 'vibrant-coral',
  'Forest Green': 'forest-green',
  'Monochrome': 'monochrome',
  'Espresso': 'espresso',
  'Industrial': 'industrial',
  'Sunset': 'sunset',
};

// Get all available themes (pre-defined + custom)
const getAllThemeNames = () => {
  try {
    const customThemes = getCustomThemes();
    return [
      ...themes.map((t: any) => t.name),
      ...customThemes.map((t: any) => t.name)
    ];
  } catch (error) {
    console.warn('Error loading custom themes:', error);
    return themes.map((t: any) => t.name);
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  useTelemetry();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  // Migrate old theme names on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const oldTheme = localStorage.getItem('theme');
        if (oldTheme && themesMigration[oldTheme]) {
          localStorage.setItem('theme', themesMigration[oldTheme]);
        }
      } catch (error) {
        console.warn('Error migrating theme:', error);
      }
    }
  }, []);

  // Memoize theme list with error handling
  const allThemes = useMemo(() => {
    try {
      return getAllThemeNames();
    } catch (error) {
      console.warn('Error getting theme names:', error);
      return ['uns-kikaku']; // Fallback theme
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThemeProvider
        attribute="class"
        defaultTheme="uns-kikaku"
        themes={allThemes}
        disableTransitionOnChange
        enableSystem={false}
      >
        <ThemeManager />
        <TemplateManager />
        <QueryClientProvider client={queryClient}>
          {children}
          {mounted && (
            <>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              {IS_DEV && ReactQueryDevtools && (
                <div className="print:hidden">
                  <ReactQueryDevtools initialIsOpen={false} />
                </div>
              )}
            </>
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </Suspense>
  );
}
