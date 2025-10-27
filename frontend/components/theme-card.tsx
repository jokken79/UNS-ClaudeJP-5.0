"use client";

import * as React from "react";
import { Check, Eye, Heart, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/themes";
import type { CustomTheme } from "@/lib/custom-themes";

interface ThemeCardProps {
  theme: Theme | CustomTheme;
  isActive: boolean;
  isFavorite?: boolean;
  onPreview: () => void;
  onApply: () => void;
  onToggleFavorite?: () => void;
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

export function ThemeCard({
  theme,
  isActive,
  isFavorite = false,
  onPreview,
  onApply,
  onToggleFavorite,
  metadata = {
    emoji: '🎨',
    label: theme.name,
    description: 'Custom theme',
    category: 'custom',
  },
}: ThemeCardProps) {
  const primaryColor = hslToRgb(theme.colors["--primary"]);
  const bgColor = hslToRgb(theme.colors["--background"]);
  const cardColor = hslToRgb(theme.colors["--card"]);
  const accentColor = hslToRgb(theme.colors["--accent"]);
  const secondaryColor = hslToRgb(theme.colors["--secondary"]);
  const mutedColor = hslToRgb(theme.colors["--muted"]);

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${isActive ? 'border-primary shadow-xl ring-4 ring-primary/20 scale-105' : 'border-border hover:border-primary/50 hover:shadow-lg'}
      `}
    >
      {/* Preview Background */}
      <div
        className="h-32 w-full relative"
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${cardColor} 100%)`,
        }}
      >
        {/* Color Swatches Preview */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Top Row - Sample UI Elements */}
          <div className="flex gap-2">
            <div
              className="h-8 flex-1 rounded-lg border border-white/20 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="h-8 flex-1 rounded-lg border border-white/20 shadow-sm"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          {/* Bottom Row - Color Dots */}
          <div className="flex gap-1.5">
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: primaryColor }}
              title="Primary"
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: secondaryColor }}
              title="Secondary"
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: accentColor }}
              title="Accent"
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: mutedColor }}
              title="Muted"
            />
          </div>
        </div>

        {/* Overlay Buttons (show on hover) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="shadow-lg"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            className="shadow-lg"
          >
            <Check className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 rounded-full bg-primary p-2 shadow-lg ring-2 ring-white">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <div className="rounded-full bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-colors">
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </div>
          </button>
        )}
      </div>

      {/* Theme Info */}
      <div className="p-4 bg-card space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{metadata.emoji}</span>
              <h3 className="font-semibold text-base truncate">
                {metadata.label}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {metadata.description}
            </p>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {metadata.category}
          </Badge>
        </div>

        {/* Color Palette Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-muted-foreground truncate">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-muted-foreground truncate">Accent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
