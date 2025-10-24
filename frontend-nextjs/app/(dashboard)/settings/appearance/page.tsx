"use client";

import * as React from "react";
import { Palette, LayoutGrid, Sparkles, Settings2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { themes } from "@/lib/themes";
import { getCustomThemes } from "@/lib/custom-themes";
import { templates, getActiveTemplateSelection, setActiveTemplateSelection, applyTemplateToDocument, toTemplateLike } from "@/lib/templates";
import { getCustomTemplates } from "@/lib/custom-templates";
import { CustomThemeBuilder } from "@/components/custom-theme-builder";
import { useToast } from "@/hooks/use-toast";
import { hslToRgb } from "@/lib/theme-utils";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [customThemes, setCustomThemes] = React.useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = React.useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = React.useState<string | null>(null);

  // Quick customization state
  const [quickPrimaryColor, setQuickPrimaryColor] = React.useState("#3B82F6");
  const [quickAccentColor, setQuickAccentColor] = React.useState("#3B82F6");
  const [borderRadius, setBorderRadius] = React.useState(18);

  React.useEffect(() => {
    setMounted(true);
    setCustomThemes(getCustomThemes());
    setCustomTemplates(getCustomTemplates());

    const selection = getActiveTemplateSelection();
    setActiveTemplate(selection.id);
  }, []);

  // Apply quick customization
  const applyQuickCustom = () => {
    const root = document.documentElement;

    // Apply border radius
    root.style.setProperty('--layout-card-radius', `${borderRadius}px`);
    root.style.setProperty('--layout-button-radius', `${borderRadius}px`);

    toast({
      title: "Customization Applied",
      description: "Your quick customization has been applied",
    });
  };

  // Export all settings
  const exportSettings = () => {
    const settings = {
      theme: theme,
      template: getActiveTemplateSelection(),
      customization: {
        borderRadius,
        quickPrimaryColor,
        quickAccentColor,
      },
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appearance-settings.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Settings Exported",
      description: "Your appearance settings have been exported",
    });
  };

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        if (settings.theme) {
          setTheme(settings.theme);
        }

        if (settings.template) {
          setActiveTemplateSelection(settings.template);
        }

        if (settings.customization) {
          setBorderRadius(settings.customization.borderRadius || 18);
          setQuickPrimaryColor(settings.customization.quickPrimaryColor || "#3B82F6");
          setQuickAccentColor(settings.customization.quickAccentColor || "#3B82F6");
        }

        toast({
          title: "Settings Imported",
          description: "Your appearance settings have been restored",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid settings file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const allThemes = [...themes, ...customThemes];
  const allTemplates = [...templates, ...customTemplates];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings2 className="h-8 w-8" />
          Appearance Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize the look and feel of your application
        </p>
      </div>

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup & Restore</CardTitle>
          <CardDescription>
            Export or import your appearance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={exportSettings} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-settings" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
              <input
                id="import-settings"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importSettings}
              />
            </label>
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Selection
              </CardTitle>
              <CardDescription className="mt-1.5">
                Choose from {allThemes.length} available themes
              </CardDescription>
            </div>
            <Badge variant="outline">
              {allThemes.length} themes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">Active Theme</Label>
            <Select value={theme || undefined} onValueChange={setTheme}>
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {allThemes.map((t) => (
                  <SelectItem key={t.name} value={t.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: hslToRgb(t.colors["--primary"]) }}
                      />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allThemes.slice(0, 8).map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${theme === t.name ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
                `}
              >
                <div
                  className="h-16 rounded-md mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${hslToRgb(t.colors["--background"])}, ${hslToRgb(t.colors["--card"])})`,
                  }}
                >
                  <div className="flex gap-1 p-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: hslToRgb(t.colors["--primary"]) }}
                    />
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: hslToRgb(t.colors["--accent"]) }}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium truncate">{t.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Template Selection
              </CardTitle>
              <CardDescription className="mt-1.5">
                Choose from {allTemplates.length} premium templates
              </CardDescription>
            </div>
            <Badge variant="outline">
              {allTemplates.length} templates
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Active Template</Label>
            <Select
              value={activeTemplate || undefined}
              onValueChange={(id) => {
                const template = allTemplates.find(t => t.id === id);
                if (template) {
                  const templateLike = 'category' in template
                    ? toTemplateLike(template)
                    : { ...template, isCustom: true };

                  const selection = {
                    type: 'category' in template ? ('preset' as const) : ('custom' as const),
                    id: template.id,
                  };

                  setActiveTemplateSelection(selection);
                  applyTemplateToDocument(templateLike);
                  setActiveTemplate(template.id);

                  toast({
                    title: "Template Applied",
                    description: `"${template.name}" has been applied`,
                  });
                }
              }}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {allTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {'category' in t && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t.category}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allTemplates.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  const templateLike = 'category' in t
                    ? toTemplateLike(t)
                    : { ...t, isCustom: true };

                  const selection = {
                    type: 'category' in t ? ('preset' as const) : ('custom' as const),
                    id: t.id,
                  };

                  setActiveTemplateSelection(selection);
                  applyTemplateToDocument(templateLike);
                  setActiveTemplate(t.id);
                }}
                className={`
                  relative overflow-hidden rounded-lg border-2 transition-all text-left
                  ${activeTemplate === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
                `}
              >
                <div
                  className="h-24 p-2 flex flex-col gap-1"
                  style={{
                    background: 'category' in t
                      ? t.preview.gradient
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <div
                    className="bg-white/20 backdrop-blur-sm p-2 rounded"
                    style={{ borderRadius: t.variables["--layout-card-radius"] }}
                  >
                    <div className="h-1 w-12 bg-white/40 rounded-full"></div>
                  </div>
                </div>
                <div className="p-2 bg-card">
                  <p className="text-xs font-medium truncate">{t.name}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Quick Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Customization
          </CardTitle>
          <CardDescription>
            Make quick adjustments to the current theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="text"
                  value={quickPrimaryColor}
                  onChange={(e) => setQuickPrimaryColor(e.target.value)}
                  className="font-mono"
                />
                <input
                  type="color"
                  value={quickPrimaryColor}
                  onChange={(e) => setQuickPrimaryColor(e.target.value)}
                  className="h-10 w-16 rounded-md border cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent-color"
                  type="text"
                  value={quickAccentColor}
                  onChange={(e) => setQuickAccentColor(e.target.value)}
                  className="font-mono"
                />
                <input
                  type="color"
                  value={quickAccentColor}
                  onChange={(e) => setQuickAccentColor(e.target.value)}
                  className="h-10 w-16 rounded-md border cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="border-radius">Border Radius</Label>
              <span className="text-sm text-muted-foreground">{borderRadius}px</span>
            </div>
            <Slider
              id="border-radius"
              min={0}
              max={32}
              step={2}
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sharp (0px)</span>
              <span>Round (32px)</span>
            </div>
          </div>

          <Button onClick={applyQuickCustom} className="w-full">
            Apply Changes
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Theme Builder */}
      <CustomThemeBuilder />
    </div>
  );
}
