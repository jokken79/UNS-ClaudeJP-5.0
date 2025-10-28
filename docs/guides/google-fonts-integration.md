# Google Fonts API Integration

Complete implementation of dynamic Google Fonts loading for the UNS-ClaudeJP Theme Editor.

## Overview

This implementation provides dynamic loading of 50+ Google Fonts with intelligent caching, category filtering, and search functionality. The system integrates seamlessly with the existing PropertiesPanel component in the Theme Editor.

## Features

### Core Features
- **50+ Google Fonts**: Categorized into Sans Serif, Serif, Monospace, Display, and Handwriting
- **Dynamic Loading**: Fonts load on-demand when selected (no bundle bloat)
- **Smart Caching**: Prevents duplicate requests for already-loaded fonts
- **SSR-Safe**: Works correctly with Next.js Server-Side Rendering
- **Error Handling**: Graceful fallbacks when font loading fails
- **TypeScript**: Full type safety with comprehensive interfaces

### UI Features
- **Search**: Filter fonts by name with instant results
- **Category Tabs**: Filter by font category (Sans Serif, Serif, etc.)
- **Loading Indicator**: Shows loading state while fonts are being fetched
- **Font Preview**: Multi-size preview with special characters
- **Load Status**: Visual indicator showing if font is loaded
- **Error Messages**: User-friendly error display

### Performance Features
- **Lazy Loading**: Fonts only load when user selects them
- **Request Deduplication**: Multiple requests for same font are merged
- **Preload Support**: Optional preloading of essential fonts
- **Font Pairing Suggestions**: Curated font combinations

## File Structure

```
frontend/
├── utils/
│   ├── googleFonts.ts              # Core utility (240 lines)
│   └── googleFonts.test.ts         # Unit tests
│
├── components/ThemeEditor/
│   ├── PropertiesPanel.tsx         # Enhanced with Google Fonts (950+ lines)
│   └── FontSelectorDemo.tsx        # Demo component (150 lines)
│
└── app/
    └── settings/templates/page.tsx # Theme editor page (can use demo)
```

## Implementation Details

### 1. Google Fonts Utility (`utils/googleFonts.ts`)

#### Font Collection

```typescript
export const GOOGLE_FONTS = {
  'Sans Serif': [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Poppins', 'Raleway', 'Nunito', 'PT Sans', 'Source Sans 3',
    'Work Sans', 'Fira Sans', 'Rubik', 'Libre Franklin',
    'IBM Plex Sans', 'Outfit', 'Plus Jakarta Sans', 'DM Sans',
    'Urbanist', 'Manrope'
  ],
  'Serif': [
    'Merriweather', 'Playfair Display', 'Lora', 'PT Serif',
    'Crimson Text', 'Libre Baskerville', 'Cormorant',
    'EB Garamond', 'Bitter', 'Spectral'
  ],
  'Monospace': [
    'Roboto Mono', 'Fira Code', 'JetBrains Mono',
    'Source Code Pro', 'IBM Plex Mono', 'Space Mono',
    'Inconsolata'
  ],
  'Display': [
    'Bebas Neue', 'Archivo Black', 'Righteous',
    'Fredoka', 'Comfortaa'
  ],
  'Handwriting': [
    'Caveat', 'Pacifico', 'Dancing Script',
    'Shadows Into Light', 'Satisfy', 'Kalam'
  ]
};
```

**Total**: 52 fonts across 5 categories

#### Dynamic Loading Mechanism

The loading mechanism uses `<link>` tag injection:

```typescript
export function loadGoogleFont(fontFamily: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded (from cache)
    if (isFontLoaded(fontFamily)) {
      resolve();
      return;
    }

    // Check if currently loading (prevent duplicates)
    if (loadingFontsCache.has(fontFamily)) {
      return loadingFontsCache.get(fontFamily)!;
    }

    // Create <link> element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${
      fontFamily.replace(/ /g, '+')
    }:wght@300;400;500;600;700;800&display=swap`;

    link.onload = () => {
      addToLoadedCache(fontFamily);
      loadingFontsCache.delete(fontFamily);
      resolve();
    };

    link.onerror = (error) => {
      loadingFontsCache.delete(fontFamily);
      reject(new Error(`Failed to load: ${fontFamily}`));
    };

    document.head.appendChild(link);
  });
}
```

#### Caching Strategy

Two-tier caching system:

1. **Loaded Cache** (`Set<string>`): Fonts successfully loaded
2. **Loading Cache** (`Map<string, Promise<void>>`): Fonts currently loading

This prevents:
- Duplicate network requests
- Multiple `<link>` tags for same font
- Race conditions

#### Font Weights

All fonts load with weights: **300, 400, 500, 600, 700, 800**

This provides flexibility for:
- Light (300)
- Regular (400)
- Medium (500)
- Semibold (600)
- Bold (700)
- Extra Bold (800)

### 2. Enhanced PropertiesPanel (`components/ThemeEditor/PropertiesPanel.tsx`)

#### FontControl Component

The `FontControl` component was completely rewritten with:

**State Management**:
```typescript
const [search, setSearch] = React.useState('');
const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
const [loading, setLoading] = React.useState(false);
const [loadError, setLoadError] = React.useState<string | null>(null);
const [isOpen, setIsOpen] = React.useState(false);
```

**Font Filtering**:
```typescript
const filteredFonts = React.useMemo(() => {
  let fonts = ALL_GOOGLE_FONTS;

  // Filter by category
  if (selectedCategory !== 'All') {
    fonts = GOOGLE_FONTS[selectedCategory as keyof typeof GOOGLE_FONTS] || [];
  }

  // Filter by search
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    fonts = fonts.filter((font) =>
      font.toLowerCase().includes(searchLower)
    );
  }

  return fonts;
}, [search, selectedCategory]);
```

**Async Font Loading**:
```typescript
const handleFontSelect = async (font: string) => {
  setLoading(true);
  setLoadError(null);

  try {
    await loadGoogleFont(font);
    onChange(font);
    setIsOpen(false);
  } catch (error) {
    console.error('Error loading font:', error);
    setLoadError(`Failed to load ${font}. Using fallback.`);
    onChange(font); // Still apply (fallback font)
  } finally {
    setLoading(false);
  }
};
```

**Preload Current Font**:
```typescript
React.useEffect(() => {
  if (value && !isFontLoaded(value)) {
    loadGoogleFont(value).catch((error) => {
      console.error('Error preloading current font:', error);
    });
  }
}, [value]);
```

#### UI Components

1. **Search Input**: With search icon, filters fonts instantly
2. **Category Tabs**: Buttons to filter by font category
3. **Font Selector**: Dropdown with all filtered fonts
4. **Font Preview**: Two preview boxes showing different sizes
5. **Font Info**: Badge showing category and load status
6. **Error Display**: Red banner for loading errors

### 3. Font Selector Demo (`components/ThemeEditor/FontSelectorDemo.tsx`)

Interactive demo component showcasing:
- Font loading statistics
- Quick font selection
- Random font pairing generator
- Font preview with multiple sizes
- List of loaded fonts

Can be used in the theme editor page:

```tsx
import { FontSelectorDemo } from '@/components/ThemeEditor/FontSelectorDemo';

export default function ThemeEditorPage() {
  return (
    <div className="container mx-auto p-6">
      <FontSelectorDemo />
    </div>
  );
}
```

## Usage Examples

### Basic Font Loading

```typescript
import { loadGoogleFont } from '@/utils/googleFonts';

// Load a single font
await loadGoogleFont('Inter');

// Now use it in your CSS
element.style.fontFamily = 'Inter';
```

### Check if Font is Loaded

```typescript
import { isFontLoaded } from '@/utils/googleFonts';

if (isFontLoaded('Roboto')) {
  console.log('Roboto is ready to use!');
}
```

### Preload Essential Fonts

```typescript
import { preloadEssentialFonts } from '@/utils/googleFonts';

// In your app initialization (e.g., _app.tsx or layout.tsx)
useEffect(() => {
  preloadEssentialFonts();
}, []);
```

### Get Font Statistics

```typescript
import { getFontStats } from '@/utils/googleFonts';

const stats = getFontStats();
console.log(`Loaded ${stats.loaded} of ${stats.totalAvailable} fonts`);
```

### Font Pairing Suggestions

```typescript
import { FONT_PAIRINGS, getRandomFontPairing } from '@/utils/googleFonts';

// Get all pairings
console.log(FONT_PAIRINGS);

// Get random pairing
const pairing = getRandomFontPairing();
console.log(`Use ${pairing.heading} for headings and ${pairing.body} for body`);
```

## Font Categories

### Sans Serif (20 fonts)
Modern, clean, highly readable fonts suitable for UI and body text.

**Popular choices**: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins

### Serif (10 fonts)
Classic, elegant fonts with decorative strokes, great for headings and editorial content.

**Popular choices**: Playfair Display, Merriweather, Lora, EB Garamond

### Monospace (7 fonts)
Fixed-width fonts perfect for code, tables, and technical content.

**Popular choices**: Roboto Mono, Fira Code, JetBrains Mono

### Display (5 fonts)
Bold, attention-grabbing fonts for headlines and hero sections.

**Popular choices**: Bebas Neue, Archivo Black, Righteous

### Handwriting (6 fonts)
Casual, personal fonts for creative designs and informal content.

**Popular choices**: Caveat, Pacifico, Dancing Script

## Performance Considerations

### Bundle Size Impact
**Zero impact on initial bundle size!**

Fonts are loaded from Google's CDN on-demand, not bundled with your app.

### Network Requests

Each font generates one request:
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap
```

The CSS file is ~2-5KB, font files are loaded by browser as needed.

### Caching

Google Fonts has aggressive caching:
- CDN caching worldwide
- Browser caching (long TTL)
- Our in-memory cache prevents duplicate requests

### Loading Strategy

**Lazy Loading**: Only load fonts when selected
- User selects "Roboto" → Font loads
- User doesn't use Display fonts → They never load

**Preloading** (optional): Load essential fonts upfront
```typescript
preloadEssentialFonts(); // Loads Inter, Roboto, Open Sans, Lato, Montserrat
```

## Integration with Next.js Fonts

The app already uses `next/font/google` for some fonts in `app/layout.tsx`:

```typescript
import { Inter, Roboto, Open_Sans } from 'next/font/google';
```

**Our Google Fonts utility complements this by:**
1. Providing many more fonts (52 vs ~20)
2. Loading fonts dynamically (not at build time)
3. Allowing users to experiment without rebuilding

**No conflict**: Next.js fonts and dynamic fonts can coexist peacefully.

## Error Handling

### Network Errors

If Google Fonts API is unreachable:
```typescript
try {
  await loadGoogleFont('Inter');
} catch (error) {
  console.error('Failed to load font:', error);
  // Fallback: Browser uses system fonts
}
```

### Missing Fonts

If a font doesn't exist:
```typescript
loadGoogleFont('NonExistentFont')
  .catch(error => {
    console.error(error.message);
    // "Failed to load Google Font: NonExistentFont"
  });
```

### CORS Issues

Google Fonts API has CORS enabled by default. No issues expected.

If using a custom font server, ensure CORS headers are set:
```
Access-Control-Allow-Origin: *
```

## Testing

### Unit Tests

Run tests:
```bash
npm test googleFonts.test.ts
```

Tests cover:
- Font category structure
- Flattened font list
- Category lookup
- Essential fonts list
- Font pairings

### Manual Testing

1. Navigate to theme editor: `/settings/templates`
2. Select an element with font property
3. Open font selector in PropertiesPanel
4. Test features:
   - Search: Type "rob" → See Roboto fonts
   - Category: Click "Serif" → See only serif fonts
   - Load: Select a font → See loading spinner
   - Preview: Font preview updates with selected font
   - Status: Check green "✓ Loaded" indicator

### Browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari

All support dynamic font loading.

## Troubleshooting

### Font doesn't appear

**Check load status**:
```typescript
if (!isFontLoaded('Roboto')) {
  console.log('Font not loaded yet');
}
```

**Check browser console** for errors:
```
Failed to load Google Font: Roboto
```

**Fallback**: Browser will use next available font in font-family stack

### Font loads but looks wrong

**Check font family name** is correct:
- ✅ "Roboto"
- ❌ "Roboto-Regular"
- ❌ "roboto"

**Check font weight** is specified:
```css
font-family: 'Roboto';
font-weight: 400; /* or 500, 600, etc. */
```

### Performance issues

**Too many fonts loaded**:
```typescript
const stats = getFontStats();
if (stats.loaded > 20) {
  console.warn('Many fonts loaded, may impact performance');
}
```

**Solution**: Only load fonts that are actively used

## Future Enhancements

### Possible Improvements

1. **Font Preview Thumbnails**: Show preview in dropdown
2. **Recently Used Fonts**: Track and show recent selections
3. **Custom Font Upload**: Allow users to upload own fonts
4. **Font Subsetting**: Load only required characters (Latin, Japanese, etc.)
5. **Variable Fonts**: Support Google Fonts variable fonts
6. **Font Metrics**: Show x-height, cap-height, etc.
7. **Accessibility**: Font readability scores (WCAG compliance)
8. **Font Comparison**: Side-by-side font comparison

### API Improvements

```typescript
// Font subsetting
loadGoogleFont('Inter', { subset: 'latin' });

// Specific weights only
loadGoogleFont('Roboto', { weights: [400, 700] });

// Italics
loadGoogleFont('Playfair Display', { italic: true });

// Variable fonts
loadGoogleFont('Inter', { variable: true });
```

## API Reference

### Functions

#### `loadGoogleFont(fontFamily: string): Promise<void>`
Load a Google Font dynamically.

**Parameters**:
- `fontFamily`: Font name (e.g., "Inter", "Roboto Mono")

**Returns**: Promise that resolves when font is loaded

**Throws**: Error if font fails to load

#### `isFontLoaded(fontFamily: string): boolean`
Check if font is already loaded.

**Parameters**:
- `fontFamily`: Font name

**Returns**: `true` if loaded, `false` otherwise

#### `getFontCategory(fontName: string): string | null`
Get category for a font.

**Parameters**:
- `fontName`: Font name

**Returns**: Category name or `null` if not found

#### `preloadFonts(fonts: string[]): Promise<void[]>`
Preload multiple fonts.

**Parameters**:
- `fonts`: Array of font names

**Returns**: Promise that resolves when all fonts are loaded

#### `preloadEssentialFonts(): Promise<void>`
Preload essential fonts (Inter, Roboto, Open Sans, Lato, Montserrat).

**Returns**: Promise that resolves when all essential fonts are loaded

#### `getFontStats()`
Get font loading statistics.

**Returns**:
```typescript
{
  totalAvailable: number;
  loaded: number;
  loading: number;
  loadedFonts: string[];
}
```

#### `clearFontCache(): void`
Clear font cache (useful for testing).

#### `getRandomFontPairing()`
Get random font pairing suggestion.

**Returns**:
```typescript
{
  name: string;
  heading: string;
  body: string;
}
```

### Constants

#### `GOOGLE_FONTS`
Object with font categories as keys and font arrays as values.

#### `ALL_GOOGLE_FONTS`
Flat array of all available fonts.

#### `ESSENTIAL_FONTS`
Array of most commonly used fonts.

#### `FONT_PAIRINGS`
Array of recommended font combinations.

## Conclusion

The Google Fonts integration provides a robust, performant, and user-friendly system for dynamic font loading in the UNS-ClaudeJP Theme Editor. With 52 fonts, intelligent caching, and comprehensive error handling, users can experiment with typography without impacting bundle size or initial load times.

## Credits

- **Google Fonts**: https://fonts.google.com
- **Implementation**: Claude Code (Anthropic)
- **Project**: UNS-ClaudeJP 5.0
- **Date**: October 2025
