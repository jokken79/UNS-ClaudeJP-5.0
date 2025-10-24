"use client";

import * as React from "react";
import { X, Check, Download, Share2, Code, Palette, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Theme } from "@/lib/themes";
import type { CustomTheme } from "@/lib/custom-themes";

interface ThemeDetailModalProps {
  theme: Theme | CustomTheme | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (theme: Theme | CustomTheme) => void;
  metadata?: {
    emoji: string;
    label: string;
    description: string;
    category: string;
  };
}

function hslToRgb(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));
  const hue = h / 360;
  const sat = s / 100;
  const lig = l / 100;

  let r, g, b;

  if (sat === 0) {
    r = g = b = lig;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
    const p = 2 * lig - q;

    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function ThemeDetailModal({
  theme,
  isOpen,
  onClose,
  onApply,
  metadata = {
    emoji: '🎨',
    label: 'Custom Theme',
    description: 'Custom color scheme',
    category: 'custom',
  },
}: ThemeDetailModalProps) {
  const [showCode, setShowCode] = React.useState(false);

  if (!theme) return null;

  const handleApply = () => {
    onApply(theme);
    onClose();
  };

  const handleExport = () => {
    const data = {
      name: theme.name,
      colors: theme.colors,
      metadata: {
        exportedAt: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${theme.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.label,
          text: metadata.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const colorEntries = Object.entries(theme.colors);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">{metadata.emoji}</span>
                {metadata.label}
                <Badge variant="outline" className="capitalize">
                  {metadata.category}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {metadata.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={!showCode ? 'default' : 'outline'}
                  onClick={() => setShowCode(false)}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  Colors
                </Button>
                <Button
                  size="sm"
                  variant={showCode ? 'default' : 'outline'}
                  onClick={() => setShowCode(true)}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Code
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {showCode ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">CSS Variables</h3>
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>
                        {`:root {\n${colorEntries
                          .map(([key, value]) => `  ${key}: ${value};`)
                          .join('\n')}\n}`}
                      </code>
                    </pre>

                    <div className="pt-4">
                      <h3 className="font-semibold text-lg mb-3">Usage</h3>
                      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>
                          {`// Import in your CSS or apply via JavaScript\n\n// CSS:\n.my-element {\n  background: hsl(var(--background));\n  color: hsl(var(--foreground));\n}\n\n// Tailwind:\n<div className="bg-primary text-primary-foreground">\n  Button\n</div>`}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Color Palette */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Full Color Palette
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {colorEntries.map(([key, value]) => {
                          const colorName = key.replace('--', '').replace(/-/g, ' ');
                          const rgbColor = hslToRgb(value);

                          return (
                            <div key={key} className="space-y-2">
                              <div
                                className="h-20 rounded-lg border-2 border-border shadow-sm"
                                style={{ backgroundColor: rgbColor }}
                              />
                              <div>
                                <div className="text-sm font-medium capitalize">
                                  {colorName}
                                </div>
                                <code className="text-xs text-muted-foreground block mt-1">
                                  {key}
                                </code>
                                <code className="text-xs text-muted-foreground block">
                                  hsl({value})
                                </code>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sample UI Components */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Preview Components</h3>
                      <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                        <div className="flex gap-2">
                          <div
                            className="px-4 py-2 rounded-md font-medium"
                            style={{
                              backgroundColor: hslToRgb(theme.colors['--primary']),
                              color: hslToRgb(theme.colors['--primary-foreground']),
                            }}
                          >
                            Primary Button
                          </div>
                          <div
                            className="px-4 py-2 rounded-md font-medium"
                            style={{
                              backgroundColor: hslToRgb(theme.colors['--secondary']),
                              color: hslToRgb(theme.colors['--secondary-foreground']),
                            }}
                          >
                            Secondary
                          </div>
                          <div
                            className="px-4 py-2 rounded-md font-medium border-2"
                            style={{
                              backgroundColor: hslToRgb(theme.colors['--accent']),
                              color: hslToRgb(theme.colors['--accent-foreground']),
                            }}
                          >
                            Accent
                          </div>
                        </div>

                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: hslToRgb(theme.colors['--card']),
                            color: hslToRgb(theme.colors['--card-foreground']),
                            border: `1px solid ${hslToRgb(theme.colors['--border'])}`,
                          }}
                        >
                          <div className="font-semibold mb-2">Card Component</div>
                          <p className="text-sm" style={{ color: hslToRgb(theme.colors['--muted-foreground']) }}>
                            This is how text looks on a card with this theme.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-background space-y-3">
          <Button size="lg" className="w-full" onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Apply Theme
          </Button>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
