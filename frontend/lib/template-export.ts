import type { TemplateDefinition, TemplateLike, TemplateVariables } from './templates';
import type { Theme } from './themes';
import QRCode from 'qrcode';

export interface ExportData {
  version: string;
  template?: {
    id: string;
    name: string;
    variables: TemplateVariables;
  };
  theme?: {
    name: string;
    colors: Theme['colors'];
  };
  customization?: {
    variables: Partial<TemplateVariables>;
  };
  metadata: {
    exportedAt: string;
    exportedBy?: string;
  };
}

export async function exportCurrentCustomization(
  template?: TemplateLike,
  theme?: Theme,
  customVariables?: Partial<TemplateVariables>
): Promise<ExportData> {
  return {
    version: '1.0.0',
    template: template ? {
      id: template.id,
      name: template.name,
      variables: template.variables,
    } : undefined,
    theme: theme ? {
      name: theme.name,
      colors: theme.colors,
    } : undefined,
    customization: customVariables ? {
      variables: customVariables,
    } : undefined,
    metadata: {
      exportedAt: new Date().toISOString(),
    },
  };
}

export function downloadAsJSON(data: ExportData, filename: string = 'customization') {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function encodeToBase64(data: ExportData): string {
  const json = JSON.stringify(data);
  if (typeof window !== 'undefined') {
    return btoa(json);
  }
  return Buffer.from(json).toString('base64');
}

export function decodeFromBase64(encoded: string): ExportData | null {
  try {
    let json: string;
    if (typeof window !== 'undefined') {
      json = atob(encoded);
    } else {
      json = Buffer.from(encoded, 'base64').toString();
    }
    return JSON.parse(json) as ExportData;
  } catch (error) {
    console.error('Error decoding base64:', error);
    return null;
  }
}

export function generateShareURL(data: ExportData, baseURL?: string): string {
  const encoded = encodeToBase64(data);
  const base = baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/customizer?import=${encoded}`;
}

export async function generateShareQRCode(data: ExportData, baseURL?: string): Promise<string> {
  const url = generateShareURL(data, baseURL);
  try {
    return await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function copyShareURLToClipboard(data: ExportData, baseURL?: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    const url = generateShareURL(data, baseURL);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

export function importFromJSON(json: string): ExportData | null {
  try {
    const data = JSON.parse(json) as ExportData;
    // Validate the structure
    if (!data.version || !data.metadata) {
      throw new Error('Invalid export data structure');
    }
    return data;
  } catch (error) {
    console.error('Error importing JSON:', error);
    return null;
  }
}

export function importFromFile(file: File): Promise<ExportData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(importFromJSON(text));
    };
    reader.onerror = () => {
      console.error('Error reading file');
      resolve(null);
    };
    reader.readAsText(file);
  });
}

export async function downloadTemplateAsCSS(template: TemplateLike, filename?: string) {
  const cssContent = `:root {\n${Object.entries(template.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')}\n}`;

  const blob = new Blob([cssContent], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${template.id}.css`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadThemeAsCSS(theme: Theme, filename?: string) {
  const cssContent = `:root {\n${Object.entries(theme.colors)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')}\n}`;

  const blob = new Blob([cssContent], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${theme.name}.css`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
