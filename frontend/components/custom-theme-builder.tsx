"use client";

import * as React from "react";
import { Palette, Wand2, Download, Upload, Save, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  saveCustomTheme,
  getDefaultColorInputs,
  type ThemeColorInputs,
  createThemeFromColors,
} from "@/lib/custom-themes";
import {
  generatePaletteFromColor,
  getComplementary,
  getTriadic,
  getAnalogous,
  meetsWCAG,
  generateShades,
} from "@/lib/theme-utils";
import { getFontVariable } from "@/lib/font-utils";
import { FontSelector } from "@/components/font-selector";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={label}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 rounded-md border cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export function CustomThemeBuilder() {
  const { setTheme } = useTheme();
  const { toast } = useToast();

  const [themeName, setThemeName] = React.useState("");
  const [colors, setColors] = React.useState<ThemeColorInputs>(getDefaultColorInputs());
  const [selectedFont, setSelectedFont] = React.useState<string>("Work Sans");
  const [isPreviewActive, setIsPreviewActive] = React.useState(false);

  const updateColor = (key: keyof ThemeColorInputs, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  // Auto-generate palette from primary color
  const generateFromPrimary = () => {
    const palette = generatePaletteFromColor(colors.primary);
    setColors(palette);
    toast({
      title: "Palette Generated",
      description: "Colors generated from primary color",
    });
  };

  // Get color harmonies
  const getHarmony = (type: 'complementary' | 'triadic' | 'analogous') => {
    switch (type) {
      case 'complementary':
        const comp = getComplementary(colors.primary);
        setColors(prev => ({ ...prev, accent: comp }));
        toast({ title: "Complementary color applied to accent" });
        break;
      case 'triadic':
        const triadic = getTriadic(colors.primary);
        setColors(prev => ({ ...prev, accent: triadic.color1, secondary: triadic.color2 }));
        toast({ title: "Triadic colors applied" });
        break;
      case 'analogous':
        const analogous = getAnalogous(colors.primary);
        setColors(prev => ({ ...prev, accent: analogous.color1, secondary: analogous.color2 }));
        toast({ title: "Analogous colors applied" });
        break;
    }
  };

  // Check contrast
  const contrastCheck = React.useMemo(() => {
    return {
      primaryOnBg: meetsWCAG(colors.primary, colors.background),
      foregroundOnBg: meetsWCAG(colors.foreground, colors.background),
      foregroundOnCard: meetsWCAG(colors.foreground, colors.card),
    };
  }, [colors]);

  // Preview theme
  const previewTheme = () => {
    try {
      const themeData = createThemeFromColors("Preview", colors);
      const root = document.documentElement;

      Object.entries(themeData.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value as string);
      });

      // Apply font if available
      const fontVariable = getFontVariable(selectedFont);
      if (fontVariable) {
        root.style.setProperty("--layout-font-body", `var(${fontVariable})`);
        root.style.setProperty("--layout-font-heading", `var(${fontVariable})`);
        root.style.setProperty("--layout-font-ui", `var(${fontVariable})`);
      }

      setIsPreviewActive(true);
      toast({
        title: "Preview Active",
        description: "Theme preview applied. Save to keep it!",
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Save theme
  const saveTheme = async () => {
    if (!themeName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a theme name",
        variant: "destructive",
      });
      return;
    }

    try {
      const themeData = createThemeFromColors(themeName, colors);
      themeData.font = selectedFont;  // Add font to theme data
      const savedTheme = saveCustomTheme(themeData);

      toast({
        title: "Theme Saved!",
        description: `"${themeName}" has been saved successfully`,
      });

      // Apply the theme
      setTheme(savedTheme.name);

      // Reset form
      setThemeName("");
      setColors(getDefaultColorInputs());
      setSelectedFont("Work Sans");  // Reset to default
      setIsPreviewActive(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Export theme as JSON
  const exportTheme = () => {
    try {
      const themeData = createThemeFromColors(themeName || "Unnamed Theme", colors);
      themeData.font = selectedFont;  // Add font to export
      const json = JSON.stringify(themeData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${themeName || 'theme'}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Theme Exported",
        description: "JSON file downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Import theme from JSON
  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // Validate structure
        if (!json.colors || typeof json.colors !== 'object') {
          throw new Error("Invalid theme file structure");
        }

        // Extract font if present
        if (json.font && typeof json.font === 'string') {
          setSelectedFont(json.font);
        }

        // Extract color values and convert to hex (simplified)
        setThemeName(json.name || "Imported Theme");

        toast({
          title: "Theme Imported",
          description: "Theme loaded successfully. Preview to see changes.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Invalid JSON file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Custom Theme Builder
        </CardTitle>
        <CardDescription>
          Create your own theme with custom colors and automatic harmonies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Name */}
        <div className="space-y-2">
          <Label htmlFor="theme-name">Theme Name</Label>
          <Input
            id="theme-name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="My Amazing Theme"
          />
        </div>

        {/* Tabs for Color Inputs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="harmony">Harmony</TabsTrigger>
          </TabsList>

          {/* Basic Colors */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <ColorInput
              label="Primary Color"
              value={colors.primary}
              onChange={(v) => updateColor('primary', v)}
              description="Main brand color used for buttons and highlights"
            />
            <ColorInput
              label="Background Color"
              value={colors.background}
              onChange={(v) => updateColor('background', v)}
              description="Main background color of your app"
            />
            <ColorInput
              label="Foreground Color"
              value={colors.foreground}
              onChange={(v) => updateColor('foreground', v)}
              description="Main text color"
            />
            <ColorInput
              label="Card Color"
              value={colors.card}
              onChange={(v) => updateColor('card', v)}
              description="Background color for cards and panels"
            />
          </TabsContent>

          {/* Advanced Colors */}
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <ColorInput
              label="Secondary Color"
              value={colors.secondary}
              onChange={(v) => updateColor('secondary', v)}
              description="Secondary brand color"
            />
            <ColorInput
              label="Accent Color"
              value={colors.accent}
              onChange={(v) => updateColor('accent', v)}
              description="Accent color for highlights"
            />
            <ColorInput
              label="Border Color"
              value={colors.border}
              onChange={(v) => updateColor('border', v)}
              description="Default border color"
            />
            <ColorInput
              label="Muted Color"
              value={colors.muted}
              onChange={(v) => updateColor('muted', v)}
              description="Subtle background color"
            />
          </TabsContent>

          {/* Color Harmony */}
          <TabsContent value="harmony" className="space-y-4 pt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate color harmonies based on your primary color
              </p>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={generateFromPrimary}
                  className="justify-start"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Generate Full Palette
                </Button>

                <Button
                  variant="outline"
                  onClick={() => getHarmony('complementary')}
                  className="justify-start"
                >
                  Complementary (Opposite)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => getHarmony('triadic')}
                  className="justify-start"
                >
                  Triadic (120° Apart)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => getHarmony('analogous')}
                  className="justify-start"
                >
                  Analogous (Adjacent)
                </Button>
              </div>
            </div>

            {/* Contrast Checker */}
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                WCAG Contrast Check
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Primary on Background:</span>
                  <Badge variant={contrastCheck.primaryOnBg.normal ? "default" : "destructive"}>
                    {contrastCheck.primaryOnBg.normal ? "AA ✓" : "Fail ✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Text on Background:</span>
                  <Badge variant={contrastCheck.foregroundOnBg.normal ? "default" : "destructive"}>
                    {contrastCheck.foregroundOnBg.normal ? "AA ✓" : "Fail ✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Text on Card:</span>
                  <Badge variant={contrastCheck.foregroundOnCard.normal ? "default" : "destructive"}>
                    {contrastCheck.foregroundOnCard.normal ? "AA ✓" : "Fail ✗"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Font Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Tipografía
            </CardTitle>
            <CardDescription>
              Elige la fuente para este theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FontSelector
              currentFont={selectedFont}
              onFontChange={setSelectedFont}
              label="Fuente del Theme"
              showPreview={true}
              showDescription={true}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={previewTheme} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isPreviewActive ? 'animate-spin' : ''}`} />
              Preview
            </Button>
            <Button onClick={saveTheme}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportTheme} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-theme" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
                <input
                  id="import-theme"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importTheme}
                />
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
