"use client";

import * as React from "react";
import {
  X,
  Check,
  Sun,
  Moon,
  Code,
  Download,
  Heart,
  Share2,
  Palette,
  Type,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplatePreview } from "./template-preview";
import type { TemplateDefinition } from "@/lib/templates";

interface TemplateDetailModalProps {
  template: TemplateDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: TemplateDefinition) => void;
  onToggleFavorite?: (template: TemplateDefinition) => void;
  isFavorite?: boolean;
}

export function TemplateDetailModal({
  template,
  isOpen,
  onClose,
  onApply,
  onToggleFavorite,
  isFavorite = false,
}: TemplateDetailModalProps) {
  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark'>('light');
  const [showCode, setShowCode] = React.useState(false);

  if (!template) return null;

  const handleApply = () => {
    onApply(template);
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.name,
          text: template.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    const data = {
      name: template.name,
      id: template.id,
      variables: template.variables,
      metadata: {
        category: template.category,
        fonts: template.fonts,
        palette: template.palette,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {template.name}
                <Badge variant="outline">{template.category}</Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {template.tagline}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {template.price}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={previewMode === 'light' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('light')}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'dark' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('dark')}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCode(!showCode)}
                >
                  <Code className="h-4 w-4 mr-1" />
                  {showCode ? 'Preview' : 'Code'}
                </Button>
              </div>
            </div>

            {/* Preview or Code View */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {showCode ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">CSS Variables</h3>
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>
                        {`:root {\n${Object.entries(template.variables)
                          .map(([key, value]) => `  ${key}: ${value};`)
                          .join('\n')}\n}`}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <TemplatePreview
                    template={template}
                    showDeviceToggle={true}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-96 border-l bg-muted/20 flex flex-col">
            <Tabs defaultValue="details" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="fonts">Fonts</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <TabsContent value="details" className="mt-0 space-y-6">
                    {/* Features */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Features
                      </h3>
                      <ul className="space-y-2">
                        {template.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Iconography */}
                    <div>
                      <h3 className="font-semibold mb-3">Icon Styles</h3>
                      <div className="flex flex-wrap gap-2">
                        {template.iconography.map((icon, idx) => (
                          <Badge key={idx} variant="secondary">
                            {icon}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Button Styles */}
                    <div>
                      <h3 className="font-semibold mb-3">Button Styles</h3>
                      <div className="flex flex-wrap gap-2">
                        {template.buttonStyles.map((style, idx) => (
                          <Badge key={idx} variant="outline">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* CSS Properties */}
                    <div>
                      <h3 className="font-semibold mb-3">Key Properties</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Card Radius</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {template.variables['--layout-card-radius']}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Button Radius</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {template.variables['--layout-button-radius']}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Panel Blur</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {template.variables['--layout-panel-blur']}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Container Max</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {template.variables['--layout-container-max']}
                          </code>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="mt-0 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Palette
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(template.palette).map(([key, color]) => (
                          <div key={key} className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <code className="text-xs text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fonts" className="mt-0 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Typography
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Heading Font</div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold mb-2">
                              {template.fonts.heading}
                            </div>
                            <code className="text-xs text-muted-foreground">
                              {template.variables['--layout-font-heading']}
                            </code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Body Font</div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-base mb-2">
                              {template.fonts.body}
                            </div>
                            <code className="text-xs text-muted-foreground">
                              {template.variables['--layout-font-body']}
                            </code>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">UI Font</div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm mb-2">
                              {template.fonts.ui}
                            </div>
                            <code className="text-xs text-muted-foreground">
                              {template.variables['--layout-font-ui']}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-background space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleApply}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Template
              </Button>

              <div className="flex gap-2">
                {onToggleFavorite && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onToggleFavorite(template)}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    {isFavorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
