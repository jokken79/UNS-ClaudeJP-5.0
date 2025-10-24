"use client";

import * as React from "react";
import { Check, Eye, Sparkles, Heart, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TemplateDefinition } from "@/lib/templates";
import type { CustomTemplate } from "@/lib/custom-templates";

interface TemplateCardProps {
  template: TemplateDefinition | CustomTemplate;
  isActive: boolean;
  isFeatured?: boolean;
  onPreview: () => void;
  onApply: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function TemplateCard({
  template,
  isActive,
  isFeatured = false,
  onPreview,
  onApply,
  onToggleFavorite,
  isFavorite = false,
}: TemplateCardProps) {
  const isCustom = 'createdAt' in template;
  const templateDef = isCustom ? null : (template as TemplateDefinition);

  const colorPalette = templateDef?.palette || {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    neutral: '#64748B',
    background: '#F8FAFC',
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${isActive ? 'border-primary shadow-2xl ring-4 ring-primary/20 scale-105' : 'border-border hover:border-primary/50 hover:shadow-xl'}
        ${isFeatured ? 'lg:col-span-2 lg:row-span-2' : ''}
      `}
    >
      {/* Preview Area */}
      <div
        className={`relative w-full overflow-hidden ${isFeatured ? 'h-64' : 'h-48'}`}
        style={{
          background: templateDef?.preview.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Spotlight Effect */}
        {templateDef?.preview.spotlight && (
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: templateDef.preview.spotlight }}
          />
        )}

        {/* Accent Shape */}
        {templateDef?.preview.accentShape && (
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: templateDef.preview.accentShape }}
          />
        )}

        {/* Template Preview Elements */}
        <div className={`relative w-full h-full p-6 flex flex-col gap-3 ${isFeatured ? 'gap-4 p-8' : ''}`}>
          {/* Sample Card */}
          <div
            className="bg-white/15 backdrop-blur-md p-4 shadow-2xl"
            style={{
              borderRadius: template.variables["--layout-card-radius"],
              border: `1px solid ${template.variables["--layout-card-border"]}`,
            }}
          >
            <div className="h-3 w-24 bg-white/50 rounded-full mb-3"></div>
            <div className="h-2 w-32 bg-white/40 rounded-full mb-2"></div>
            <div className="h-2 w-28 bg-white/30 rounded-full"></div>
          </div>

          {/* Sample Buttons */}
          <div className="flex gap-2">
            <div
              className="bg-white/25 backdrop-blur-sm px-5 py-2.5 shadow-lg"
              style={{
                borderRadius: template.variables["--layout-button-radius"],
              }}
            >
              <div className="h-2 w-16 bg-white/70 rounded-full"></div>
            </div>
            <div
              className="bg-white/15 backdrop-blur-sm px-5 py-2.5 border border-white/30"
              style={{
                borderRadius: template.variables["--layout-button-radius"],
              }}
            >
              <div className="h-2 w-12 bg-white/60 rounded-full"></div>
            </div>
          </div>

          {/* Font Preview (on featured cards) */}
          {isFeatured && templateDef && (
            <div className="mt-auto">
              <div className="text-white/90 text-sm font-medium mb-1">Heading</div>
              <div className="text-white/70 text-xs">Body text preview</div>
            </div>
          )}
        </div>

        {/* Overlay Buttons (show on hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
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
          <div className="absolute top-3 right-3 rounded-full bg-primary p-2 shadow-lg ring-2 ring-white">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Custom Badge */}
        {isCustom && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-purple-500/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Custom
            </Badge>
          </div>
        )}

        {/* Featured Badge */}
        {isFeatured && !isCustom && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white backdrop-blur-sm">
              Featured
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Template Info */}
      <div className="p-4 bg-card space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold truncate ${isFeatured ? 'text-lg' : 'text-base'}`}>
              {template.name}
            </h3>
            {templateDef && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {templateDef.tagline}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {templateDef && (
              <>
                <Badge variant="outline" className="text-xs">
                  {templateDef.category}
                </Badge>
                <span className="text-xs font-semibold text-primary">
                  {templateDef.price}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description (for featured) */}
        {isFeatured && templateDef && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {templateDef.description}
          </p>
        )}

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          {Object.entries(colorPalette).slice(0, 5).map(([key, color]) => (
            <div
              key={key}
              className="h-6 w-6 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: color }}
              title={key}
            />
          ))}
        </div>

        {/* Font Preview */}
        {templateDef && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Code className="h-3 w-3" />
            <span className="truncate">
              {templateDef.fonts.heading} • {templateDef.fonts.body}
            </span>
          </div>
        )}

        {/* Features Tags (for featured) */}
        {isFeatured && templateDef && (
          <div className="flex flex-wrap gap-1.5">
            {templateDef.features.slice(0, 3).map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature.length > 30 ? feature.substring(0, 30) + '...' : feature}
              </Badge>
            ))}
          </div>
        )}

        {/* Template Properties */}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded">
            Radius: {template.variables["--layout-card-radius"]}
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            Blur: {template.variables["--layout-panel-blur"]}
          </span>
        </div>
      </div>
    </div>
  );
}
