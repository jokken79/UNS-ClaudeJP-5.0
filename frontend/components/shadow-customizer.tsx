"use client";

import * as React from "react";
import { Box, Copy, Plus, Trash2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Shadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface ShadowPreset {
  name: string;
  shadows: Omit<Shadow, "id">[];
}

const SHADOW_PRESETS: ShadowPreset[] = [
  {
    name: "Soft",
    shadows: [
      {
        x: 0,
        y: 4,
        blur: 12,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
    ],
  },
  {
    name: "Hard",
    shadows: [
      {
        x: 8,
        y: 8,
        blur: 0,
        spread: 0,
        color: "#000000",
        opacity: 1,
        inset: false,
      },
    ],
  },
  {
    name: "Elevation",
    shadows: [
      {
        x: 0,
        y: 28,
        blur: 70,
        spread: 0,
        color: "#0F172A",
        opacity: 0.15,
        inset: false,
      },
    ],
  },
  {
    name: "Glow",
    shadows: [
      {
        x: 0,
        y: 0,
        blur: 20,
        spread: 0,
        color: "#6366F1",
        opacity: 0.6,
        inset: false,
      },
    ],
  },
  {
    name: "Inset",
    shadows: [
      {
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: true,
      },
    ],
  },
  {
    name: "Layered",
    shadows: [
      {
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
        color: "#000000",
        opacity: 0.06,
        inset: false,
      },
      {
        x: 0,
        y: 8,
        blur: 16,
        spread: 0,
        color: "#000000",
        opacity: 0.08,
        inset: false,
      },
      {
        x: 0,
        y: 16,
        blur: 32,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
    ],
  },
  {
    name: "Neumorphic",
    shadows: [
      {
        x: -8,
        y: -8,
        blur: 16,
        spread: 0,
        color: "#FFFFFF",
        opacity: 0.7,
        inset: false,
      },
      {
        x: 8,
        y: 8,
        blur: 16,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
    ],
  },
  {
    name: "Neon",
    shadows: [
      {
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
        color: "#FF00FF",
        opacity: 0.8,
        inset: false,
      },
      {
        x: 0,
        y: 0,
        blur: 30,
        spread: 0,
        color: "#00FFFF",
        opacity: 0.5,
        inset: false,
      },
    ],
  },
];

export function ShadowCustomizer() {
  const { toast } = useToast();

  const [shadows, setShadows] = React.useState<Shadow[]>([
    {
      id: "1",
      x: 0,
      y: 4,
      blur: 12,
      spread: 0,
      color: "#000000",
      opacity: 0.1,
      inset: false,
    },
  ]);

  // Generate CSS box-shadow string
  const shadowCSS = React.useMemo(() => {
    return shadows
      .map((shadow) => {
        const rgba = hexToRgba(shadow.color, shadow.opacity);
        const insetPrefix = shadow.inset ? "inset " : "";
        return `${insetPrefix}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
      })
      .join(", ");
  }, [shadows]);

  // Helper: Convert hex to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${opacity})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Add new shadow
  const addShadow = () => {
    if (shadows.length >= 5) {
      toast({
        title: "Maximum Reached",
        description: "You can have a maximum of 5 shadows.",
        variant: "destructive",
      });
      return;
    }

    const newShadow: Shadow = {
      id: Date.now().toString(),
      x: 0,
      y: 4,
      blur: 12,
      spread: 0,
      color: "#000000",
      opacity: 0.1,
      inset: false,
    };

    setShadows([...shadows, newShadow]);
  };

  // Remove shadow
  const removeShadow = (id: string) => {
    if (shadows.length <= 1) {
      toast({
        title: "Minimum Required",
        description: "You need at least 1 shadow.",
        variant: "destructive",
      });
      return;
    }
    setShadows(shadows.filter((s) => s.id !== id));
  };

  // Update shadow property
  const updateShadow = (id: string, updates: Partial<Shadow>) => {
    setShadows(
      shadows.map((shadow) =>
        shadow.id === id ? { ...shadow, ...updates } : shadow
      )
    );
  };

  // Apply preset
  const applyPreset = (preset: ShadowPreset) => {
    const newShadows = preset.shadows.map((shadow, index) => ({
      ...shadow,
      id: Date.now().toString() + index,
    }));
    setShadows(newShadows);
    toast({
      title: "Preset Applied",
      description: `"${preset.name}" shadow loaded.`,
    });
  };

  // Copy CSS to clipboard
  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(`box-shadow: ${shadowCSS};`);
      toast({
        title: "Copied!",
        description: "CSS shadow code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Shadow Customizer
        </CardTitle>
        <CardDescription>
          Create stunning box shadows with live preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div className="space-y-2">
          <Label>Live Preview</Label>
          <div className="w-full h-64 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-8">
            <div
              className="w-48 h-48 bg-background rounded-xl transition-all duration-300"
              style={{ boxShadow: shadowCSS }}
            >
              <div className="h-full flex items-center justify-center">
                <Box className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Shadow Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Shadow Layers</Label>
            <Badge variant="secondary">{shadows.length} layer(s)</Badge>
          </div>

          {shadows.map((shadow, index) => (
            <div
              key={shadow.id}
              className="p-4 border rounded-lg space-y-4 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Layer {index + 1}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`inset-${shadow.id}`}
                      checked={shadow.inset}
                      onCheckedChange={(checked) =>
                        updateShadow(shadow.id, { inset: checked as boolean })
                      }
                    />
                    <label
                      htmlFor={`inset-${shadow.id}`}
                      className="text-xs cursor-pointer"
                    >
                      Inset
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeShadow(shadow.id)}
                    disabled={shadows.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* X Offset */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>X Offset</Label>
                  <span className="text-muted-foreground">{shadow.x}px</span>
                </div>
                <Slider
                  value={[shadow.x]}
                  onValueChange={([value]) =>
                    updateShadow(shadow.id, { x: value })
                  }
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>

              {/* Y Offset */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Y Offset</Label>
                  <span className="text-muted-foreground">{shadow.y}px</span>
                </div>
                <Slider
                  value={[shadow.y]}
                  onValueChange={([value]) =>
                    updateShadow(shadow.id, { y: value })
                  }
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>

              {/* Blur Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Blur Radius</Label>
                  <span className="text-muted-foreground">{shadow.blur}px</span>
                </div>
                <Slider
                  value={[shadow.blur]}
                  onValueChange={([value]) =>
                    updateShadow(shadow.id, { blur: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Spread Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Spread Radius</Label>
                  <span className="text-muted-foreground">{shadow.spread}px</span>
                </div>
                <Slider
                  value={[shadow.spread]}
                  onValueChange={([value]) =>
                    updateShadow(shadow.id, { spread: value })
                  }
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>

              {/* Color & Opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={shadow.color}
                      onChange={(e) =>
                        updateShadow(shadow.id, { color: e.target.value })
                      }
                      className="h-10 w-16 rounded border cursor-pointer"
                    />
                    <Input
                      value={shadow.color}
                      onChange={(e) =>
                        updateShadow(shadow.id, { color: e.target.value })
                      }
                      className="font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Label>Opacity</Label>
                    <span className="text-muted-foreground">
                      {Math.round(shadow.opacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[shadow.opacity * 100]}
                    onValueChange={([value]) =>
                      updateShadow(shadow.id, { opacity: value / 100 })
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="pt-2"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={addShadow}
            disabled={shadows.length >= 5}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shadow Layer
          </Button>
        </div>

        {/* Preset Shadows */}
        <div className="space-y-3">
          <Label>Preset Shadows</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SHADOW_PRESETS.map((preset) => {
              const presetCSS = preset.shadows
                .map((shadow) => {
                  const rgba = hexToRgba(shadow.color, shadow.opacity);
                  const insetPrefix = shadow.inset ? "inset " : "";
                  return `${insetPrefix}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
                })
                .join(", ");

              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="h-20 rounded-lg border-2 border-border hover:border-primary transition-all bg-background group relative overflow-hidden"
                >
                  <div
                    className="absolute inset-4 rounded bg-card transition-all"
                    style={{ boxShadow: presetCSS }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {preset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 pt-4 border-t">
          <Button onClick={copyCSS} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy CSS
          </Button>
        </div>

        {/* CSS Code Display */}
        <div className="space-y-2">
          <Label>CSS Code</Label>
          <div className="relative">
            <code className="block p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
              box-shadow: {shadowCSS};
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
