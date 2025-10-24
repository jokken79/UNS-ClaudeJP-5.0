"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  Download,
  Upload,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Box,
  Layers,
  Sparkles,
  Wand2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { TemplatePreview } from "@/components/template-preview";
import {
  templates,
  type TemplateDefinition,
  type TemplateVariables,
  getTemplateById,
  applyTemplateToDocument,
  toTemplateLike,
  setActiveTemplateSelection,
  defaultTemplateVariables,
} from "@/lib/templates";
import { themes } from "@/lib/themes";
import { downloadAsJSON, exportCurrentCustomization } from "@/lib/template-export";
import { useToast } from "@/hooks/use-toast";

export default function CustomizerPage() {
  const { theme: activeTheme, setTheme } = useTheme();
  const { toast } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = React.useState(templates[0].id);
  const [customVariables, setCustomVariables] = React.useState<Partial<TemplateVariables>>({});
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const selectedTemplate = getTemplateById(selectedTemplateId);
  const currentVariables = selectedTemplate
    ? { ...selectedTemplate.variables, ...customVariables }
    : defaultTemplateVariables;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCustomVariables({});
  };

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };

  const handleVariableChange = (key: keyof TemplateVariables, value: string) => {
    setCustomVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyAll = () => {
    if (!selectedTemplate) return;

    const finalTemplate = {
      ...selectedTemplate,
      variables: currentVariables,
    };

    applyTemplateToDocument(toTemplateLike(finalTemplate));
    setActiveTemplateSelection({ type: 'preset', id: selectedTemplate.id });

    toast({
      title: "Customization Applied",
      description: `Template "${selectedTemplate.name}" and theme "${activeTheme}" have been applied.`,
    });
  };

  const handleReset = () => {
    setCustomVariables({});
    toast({
      title: "Reset Complete",
      description: "All customizations have been reset to template defaults.",
    });
  };

  const handleExport = async () => {
    if (!selectedTemplate) return;

    const selectedTheme = themes.find((t) => t.name === activeTheme);
    const data = await exportCurrentCustomization(
      { ...selectedTemplate, variables: currentVariables },
      selectedTheme,
      customVariables
    );

    downloadAsJSON(data, `customization-${selectedTemplate.id}`);

    toast({
      title: "Export Complete",
      description: "Your customization has been downloaded as JSON.",
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Left Panel - Controls */}
      <div className="w-96 flex flex-col bg-card border rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Customizer</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Customize templates and themes in real-time
          </p>
        </div>

        {/* Controls */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Template Selector */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Template
              </Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.tagline}
                </p>
              )}
            </div>

            {/* Theme Selector */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </Label>
              <Select value={activeTheme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {themes.map((theme) => (
                    <SelectItem key={theme.name} value={theme.name}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Customization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Quick Customization</Label>
                <Badge variant="secondary">Basic</Badge>
              </div>

              {/* Card Radius */}
              <div className="space-y-2">
                <Label className="text-sm">Card Radius</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[parseInt(currentVariables['--layout-card-radius'] || '18')]}
                    onValueChange={([value]) =>
                      handleVariableChange('--layout-card-radius', `${value}px`)
                    }
                    min={0}
                    max={32}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    value={currentVariables['--layout-card-radius']}
                    onChange={(e) =>
                      handleVariableChange('--layout-card-radius', e.target.value)
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Button Radius */}
              <div className="space-y-2">
                <Label className="text-sm">Button Radius</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[parseInt(currentVariables['--layout-button-radius'] || '18')]}
                    onValueChange={([value]) =>
                      handleVariableChange('--layout-button-radius', `${value}px`)
                    }
                    min={0}
                    max={999}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    value={currentVariables['--layout-button-radius']}
                    onChange={(e) =>
                      handleVariableChange('--layout-button-radius', e.target.value)
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Panel Blur */}
              <div className="space-y-2">
                <Label className="text-sm">Panel Blur</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[parseInt(currentVariables['--layout-panel-blur'] || '18')]}
                    onValueChange={([value]) =>
                      handleVariableChange('--layout-panel-blur', `${value}px`)
                    }
                    min={0}
                    max={40}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    value={currentVariables['--layout-panel-blur']}
                    onChange={(e) =>
                      handleVariableChange('--layout-panel-blur', e.target.value)
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Design Tools Section */}
            <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Advanced Design Tools</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Professional tools for creating gradients, shadows, color palettes, and more
              </p>
              <Link href="/design-tools" className="block">
                <Button variant="default" className="w-full" size="sm">
                  <Palette className="h-4 w-4 mr-2" />
                  Open Design Tools
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Design System Documentation */}
            <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Design System</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Complete documentation of all design tokens, colors, typography, and spacing
              </p>
              <Link href="/design-system" className="block">
                <Button variant="default" className="w-full" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Documentation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Advanced Options
                </span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showAdvanced && (
                <Accordion type="single" collapsible className="w-full">
                  {/* Typography */}
                  <AccordionItem value="typography">
                    <AccordionTrigger className="text-sm">
                      <span className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Typography
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Heading Font</Label>
                        <Input
                          value={currentVariables['--layout-font-heading']}
                          onChange={(e) =>
                            handleVariableChange('--layout-font-heading', e.target.value)
                          }
                          placeholder="var(--font-inter)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Body Font</Label>
                        <Input
                          value={currentVariables['--layout-font-body']}
                          onChange={(e) =>
                            handleVariableChange('--layout-font-body', e.target.value)
                          }
                          placeholder="var(--font-manrope)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">UI Font</Label>
                        <Input
                          value={currentVariables['--layout-font-ui']}
                          onChange={(e) =>
                            handleVariableChange('--layout-font-ui', e.target.value)
                          }
                          placeholder="var(--font-space-grotesk)"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Spacing */}
                  <AccordionItem value="spacing">
                    <AccordionTrigger className="text-sm">
                      <span className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Spacing
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Container Max Width</Label>
                        <Input
                          value={currentVariables['--layout-container-max']}
                          onChange={(e) =>
                            handleVariableChange('--layout-container-max', e.target.value)
                          }
                          placeholder="1240px"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Section Gap</Label>
                        <Input
                          value={currentVariables['--layout-section-gap']}
                          onChange={(e) =>
                            handleVariableChange('--layout-section-gap', e.target.value)
                          }
                          placeholder="3.5rem"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Shadows & Effects */}
                  <AccordionItem value="effects">
                    <AccordionTrigger className="text-sm">
                      Shadows & Effects
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Card Shadow</Label>
                        <Input
                          value={currentVariables['--layout-card-shadow']}
                          onChange={(e) =>
                            handleVariableChange('--layout-card-shadow', e.target.value)
                          }
                          placeholder="0 35px 80px rgba(15, 23, 42, 0.15)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Button Shadow</Label>
                        <Input
                          value={currentVariables['--layout-button-shadow']}
                          onChange={(e) =>
                            handleVariableChange('--layout-button-shadow', e.target.value)
                          }
                          placeholder="0 18px 45px rgba(59, 130, 246, 0.25)"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-6 border-t space-y-2">
          <Button size="lg" className="w-full" onClick={handleApplyAll}>
            <Check className="h-4 w-4 mr-2" />
            Apply All
          </Button>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-lg overflow-hidden">
        {/* Preview Header */}
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge>Live Preview</Badge>
            {selectedTemplate && (
              <span className="text-sm text-muted-foreground">
                {selectedTemplate.name}
              </span>
            )}
          </div>
          <Badge variant="outline">Updates in Real-time</Badge>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto">
          {selectedTemplate && (
            <TemplatePreview
              template={{ ...selectedTemplate, variables: currentVariables }}
              showDeviceToggle={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
