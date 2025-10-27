"use client";

import * as React from "react";
import {
  Palette,
  Sun,
  Droplet,
  Eye,
  Box,
  Type,
  Ruler,
  Sparkles,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GradientBuilder } from "@/components/gradient-builder";
import { ShadowCustomizer } from "@/components/shadow-customizer";
import { ColorPaletteGenerator } from "@/components/color-palette-generator";
import { ContrastChecker } from "@/components/contrast-checker";
import { BorderRadiusVisualizer } from "@/components/border-radius-visualizer";
import { TypographyScaleGenerator } from "@/components/typography-scale-generator";
import { SpacingScaleGenerator } from "@/components/spacing-scale-generator";

export default function DesignToolsPage() {
  const [activeTab, setActiveTab] = React.useState("gradients");

  const tools = [
    {
      id: "gradients",
      label: "Gradients",
      icon: Palette,
      description: "Create beautiful CSS gradients",
      component: GradientBuilder,
    },
    {
      id: "shadows",
      label: "Shadows",
      icon: Sun,
      description: "Customize box shadows",
      component: ShadowCustomizer,
    },
    {
      id: "colors",
      label: "Colors",
      icon: Droplet,
      description: "Generate color palettes",
      component: ColorPaletteGenerator,
    },
    {
      id: "contrast",
      label: "Contrast",
      icon: Eye,
      description: "Check WCAG compliance",
      component: ContrastChecker,
    },
    {
      id: "borders",
      label: "Borders",
      icon: Box,
      description: "Visualize border radius",
      component: BorderRadiusVisualizer,
    },
    {
      id: "typography",
      label: "Typography",
      icon: Type,
      description: "Generate type scales",
      component: TypographyScaleGenerator,
    },
    {
      id: "spacing",
      label: "Spacing",
      icon: Ruler,
      description: "Create spacing scales",
      component: SpacingScaleGenerator,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Design Tools</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Professional design system tools for creating and exporting design tokens
        </p>
      </div>

      {/* Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tabs List */}
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-2 bg-transparent">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tool.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tool Description */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            {(() => {
              const activeTool = tools.find((t) => t.id === activeTab);
              if (!activeTool) return null;
              const Icon = activeTool.icon;
              return (
                <>
                  <Icon className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeTool.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {activeTool.description}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
          <Badge variant="secondary">Professional Tool</Badge>
        </div>

        {/* Tool Content */}
        {tools.map((tool) => {
          const Component = tool.component;
          return (
            <TabsContent key={tool.id} value={tool.id} className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Component />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Footer Info */}
      <div className="mt-12 p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h3 className="text-lg font-semibold mb-2">About Design Tools</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These professional design tools help you create consistent, accessible design systems.
          All tools support exporting in multiple formats including CSS, Tailwind, SCSS, and JSON.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Export Formats</h4>
            <p className="text-muted-foreground">
              CSS Variables, Tailwind Config, SCSS, JSON
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Live Preview</h4>
            <p className="text-muted-foreground">
              All changes update in real-time
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Accessibility</h4>
            <p className="text-muted-foreground">
              WCAG compliance checking built-in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
