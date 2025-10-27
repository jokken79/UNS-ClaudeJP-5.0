/**
 * Google Fonts API Integration
 *
 * Provides dynamic loading of Google Fonts with caching and preloading support.
 * Uses <link> tag injection to load fonts from Google Fonts API.
 */

/**
 * Popular Google Fonts collection (50 fonts)
 * Categorized by type: Sans Serif, Serif, Monospace, Display, Handwriting
 */
export const GOOGLE_FONTS = {
  'Sans Serif': [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Nunito',
    'PT Sans',
    'Source Sans 3',
    'Work Sans',
    'Fira Sans',
    'Rubik',
    'Libre Franklin',
    'IBM Plex Sans',
    'Outfit',
    'Plus Jakarta Sans',
    'DM Sans',
    'Urbanist',
    'Manrope',
  ],
  'Serif': [
    'Merriweather',
    'Playfair Display',
    'Lora',
    'PT Serif',
    'Crimson Text',
    'Libre Baskerville',
    'Cormorant',
    'EB Garamond',
    'Bitter',
    'Spectral',
  ],
  'Monospace': [
    'Roboto Mono',
    'Fira Code',
    'JetBrains Mono',
    'Source Code Pro',
    'IBM Plex Mono',
    'Space Mono',
    'Inconsolata',
  ],
  'Display': [
    'Bebas Neue',
    'Archivo Black',
    'Righteous',
    'Fredoka',
    'Comfortaa',
  ],
  'Handwriting': [
    'Caveat',
    'Pacifico',
    'Dancing Script',
    'Shadows Into Light',
    'Satisfy',
    'Kalam',
  ],
};

/**
 * Flatten all fonts into a single array
 */
export const ALL_GOOGLE_FONTS = Object.values(GOOGLE_FONTS).flat();

/**
 * Get category for a specific font
 */
export function getFontCategory(fontName: string): string | null {
  for (const [category, fonts] of Object.entries(GOOGLE_FONTS)) {
    if (fonts.includes(fontName)) {
      return category;
    }
  }
  return null;
}

/**
 * Cache to track loaded fonts
 */
const loadedFontsCache = new Set<string>();

/**
 * Cache to track fonts currently loading (to prevent duplicate requests)
 */
const loadingFontsCache = new Map<string, Promise<void>>();

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if a font is already loaded
 * @param fontFamily - Font family name (e.g., 'Inter', 'Roboto Mono')
 * @returns true if font is loaded, false otherwise
 */
export function isFontLoaded(fontFamily: string): boolean {
  if (!isBrowser()) return false;
  return loadedFontsCache.has(fontFamily);
}

/**
 * Add font to loaded cache
 */
function addToLoadedCache(fontFamily: string): void {
  loadedFontsCache.add(fontFamily);
}

/**
 * Load a Google Font dynamically
 *
 * This function injects a <link> tag into the document head to load
 * the specified font from Google Fonts API.
 *
 * @param fontFamily - Font family name (e.g., 'Inter', 'Roboto Mono')
 * @returns Promise that resolves when font is loaded
 *
 * @example
 * await loadGoogleFont('Inter');
 * // Font is now available for use
 */
export function loadGoogleFont(fontFamily: string): Promise<void> {
  // SSR check
  if (!isBrowser()) {
    return Promise.resolve();
  }

  // Check if already loaded
  if (isFontLoaded(fontFamily)) {
    return Promise.resolve();
  }

  // Check if currently loading (prevent duplicate requests)
  if (loadingFontsCache.has(fontFamily)) {
    return loadingFontsCache.get(fontFamily)!;
  }

  // Create loading promise
  const loadingPromise = new Promise<void>((resolve, reject) => {
    try {
      // Check if link already exists
      const existingLink = document.querySelector(
        `link[href*="family=${fontFamily.replace(/ /g, '+')}"]`
      );

      if (existingLink) {
        addToLoadedCache(fontFamily);
        resolve();
        return;
      }

      // Create link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
        / /g,
        '+'
      )}:wght@300;400;500;600;700;800&display=swap`;

      // Handle load success
      link.onload = () => {
        addToLoadedCache(fontFamily);
        loadingFontsCache.delete(fontFamily);
        resolve();
      };

      // Handle load error
      link.onerror = (error) => {
        loadingFontsCache.delete(fontFamily);
        console.error(`Failed to load Google Font: ${fontFamily}`, error);
        reject(new Error(`Failed to load Google Font: ${fontFamily}`));
      };

      // Append to document head
      document.head.appendChild(link);
    } catch (error) {
      loadingFontsCache.delete(fontFamily);
      console.error(`Error loading Google Font: ${fontFamily}`, error);
      reject(error);
    }
  });

  // Cache the loading promise
  loadingFontsCache.set(fontFamily, loadingPromise);

  return loadingPromise;
}

/**
 * Preload multiple fonts
 * @param fonts - Array of font family names
 * @returns Promise that resolves when all fonts are loaded
 */
export function preloadFonts(fonts: string[]): Promise<void[]> {
  return Promise.all(fonts.map((font) => loadGoogleFont(font)));
}

/**
 * Essential fonts to preload on app initialization
 * These are the most commonly used fonts
 */
export const ESSENTIAL_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
];

/**
 * Preload essential fonts on app load
 * Call this in your app initialization (e.g., _app.tsx or layout.tsx)
 *
 * @example
 * useEffect(() => {
 *   preloadEssentialFonts();
 * }, []);
 */
export async function preloadEssentialFonts(): Promise<void> {
  try {
    await preloadFonts(ESSENTIAL_FONTS);
    console.log('Essential fonts preloaded successfully');
  } catch (error) {
    console.error('Error preloading essential fonts:', error);
  }
}

/**
 * Get font loading statistics
 * Useful for debugging
 */
export function getFontStats() {
  return {
    totalAvailable: ALL_GOOGLE_FONTS.length,
    loaded: loadedFontsCache.size,
    loading: loadingFontsCache.size,
    loadedFonts: Array.from(loadedFontsCache),
  };
}

/**
 * Clear font cache (useful for testing)
 */
export function clearFontCache(): void {
  loadedFontsCache.clear();
  loadingFontsCache.clear();
}

/**
 * Font pairing suggestions
 * Recommended font combinations for professional designs
 */
export const FONT_PAIRINGS = [
  {
    name: 'Modern & Clean',
    heading: 'Inter',
    body: 'Open Sans',
  },
  {
    name: 'Corporate Professional',
    heading: 'Montserrat',
    body: 'Lato',
  },
  {
    name: 'Editorial Style',
    heading: 'Playfair Display',
    body: 'Lora',
  },
  {
    name: 'Tech & Innovation',
    heading: 'IBM Plex Sans',
    body: 'Roboto',
  },
  {
    name: 'Friendly & Approachable',
    heading: 'Poppins',
    body: 'Nunito',
  },
  {
    name: 'Bold & Minimal',
    heading: 'Bebas Neue',
    body: 'Work Sans',
  },
  {
    name: 'Classic & Elegant',
    heading: 'Playfair Display',
    body: 'Merriweather',
  },
  {
    name: 'Modern Geometric',
    heading: 'Outfit',
    body: 'Plus Jakarta Sans',
  },
];

/**
 * Get random font pairing
 */
export function getRandomFontPairing() {
  return FONT_PAIRINGS[Math.floor(Math.random() * FONT_PAIRINGS.length)];
}
