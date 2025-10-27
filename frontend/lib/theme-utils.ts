/**
 * Theme utility functions for color manipulation and harmony
 */

/**
 * Convert HSL string (from themes) to RGB for display
 */
export function hslToRgb(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));

  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsWCAG(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): {
  normal: boolean;
  large: boolean;
} {
  const ratio = getContrastRatio(foreground, background);

  return {
    normal: level === 'AA' ? ratio >= 4.5 : ratio >= 7,
    large: level === 'AA' ? ratio >= 3 : ratio >= 4.5,
  };
}

/**
 * Generate complementary color (opposite on color wheel)
 */
export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Convert to HSL, rotate hue by 180°, convert back
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newHue = (hsl.h + 180) % 360;
  const complementaryRgb = hslToRgbValues(newHue, hsl.s, hsl.l);

  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
}

/**
 * Generate triadic colors (120° apart on color wheel)
 */
export function getTriadic(hex: string): { color1: string; color2: string } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { color1: hex, color2: hex };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hue1 = (hsl.h + 120) % 360;
  const hue2 = (hsl.h + 240) % 360;

  const rgb1 = hslToRgbValues(hue1, hsl.s, hsl.l);
  const rgb2 = hslToRgbValues(hue2, hsl.s, hsl.l);

  return {
    color1: rgbToHex(rgb1.r, rgb1.g, rgb1.b),
    color2: rgbToHex(rgb2.r, rgb2.g, rgb2.b),
  };
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function getAnalogous(hex: string): { color1: string; color2: string } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { color1: hex, color2: hex };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hue1 = (hsl.h + 30) % 360;
  const hue2 = (hsl.h - 30 + 360) % 360;

  const rgb1 = hslToRgbValues(hue1, hsl.s, hsl.l);
  const rgb2 = hslToRgbValues(hue2, hsl.s, hsl.l);

  return {
    color1: rgbToHex(rgb1.r, rgb1.g, rgb1.b),
    color2: rgbToHex(rgb2.r, rgb2.g, rgb2.b),
  };
}

/**
 * Generate color shades (lighter and darker variants)
 */
export function generateShades(hex: string, count: number = 5): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shades: string[] = [];

  for (let i = 0; i < count; i++) {
    const lightness = hsl.l + (50 - hsl.l) * (i / (count - 1)) - 25;
    const clampedLightness = Math.max(0, Math.min(100, lightness));
    const shadeRgb = hslToRgbValues(hsl.h, hsl.s, clampedLightness);
    shades.push(rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b));
  }

  return shades;
}

/**
 * Helper: Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Helper: Convert HSL to RGB values
 */
function hslToRgbValues(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Auto-generate theme palette from a single primary color
 */
export function generatePaletteFromColor(primaryHex: string): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  border: string;
  muted: string;
} {
  const analogous = getAnalogous(primaryHex);
  const shades = generateShades(primaryHex, 7);

  return {
    primary: primaryHex,
    secondary: shades[2], // Lighter shade
    accent: analogous.color1,
    background: '#FFFFFF',
    foreground: '#0F172A',
    card: '#F8FAFC',
    border: '#E2E8F0',
    muted: '#F1F5F9',
  };
}

/**
 * Theme categories for organization
 */
export const THEME_CATEGORIES = [
  { id: 'all', label: 'All Themes', emoji: '🎨' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'creative', label: 'Creative', emoji: '✨' },
  { id: 'minimal', label: 'Minimal', emoji: '⚪' },
  { id: 'futuristic', label: 'Futuristic', emoji: '🚀' },
  { id: 'custom', label: 'Custom', emoji: '🎨' },
] as const;

/**
 * Categorize theme based on name
 */
export function getCategoryForTheme(themeName: string): string {
  const name = themeName.toLowerCase();

  if (name.includes('uns') || name.includes('corporate') || name.includes('industrial')) {
    return 'corporate';
  }
  if (name.includes('sunset') || name.includes('coral') || name.includes('aurora')) {
    return 'creative';
  }
  if (name.includes('minimal') || name.includes('monochrome') || name.includes('default')) {
    return 'minimal';
  }
  if (name.includes('neon') || name.includes('cyber') || name.includes('tokyo')) {
    return 'futuristic';
  }
  if (name.includes('custom')) {
    return 'custom';
  }

  return 'all';
}
