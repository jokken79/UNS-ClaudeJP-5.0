'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { Settings, Palette, Type, Box, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PropertiesPanelProps {
  className?: string;
}

/**
 * PropertiesPanel - Properties editor for the selected theme element
 *
 * Displays and allows editing of the selected element's properties
 * such as colors, typography, spacing, and effects.
 */
export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { selectedElement, currentTheme, updateThemeProperty } = useThemeStore();

  if (!selectedElement) {
    return (
      <div className={cn('flex flex-col border-l bg-background', className)}>
        <div className="border-b p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No element selected</p>
            <p className="text-xs mt-1">Select an element from the canvas or tree</p>
          </div>
        </div>
      </div>
    );
  }

  const elementConfig = (currentTheme.layout as any)[selectedElement];

  if (!elementConfig) {
    return (
      <div className={cn('flex flex-col border-l bg-background', className)}>
        <div className="border-b p-4">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No properties available for this element
          </p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: string) => {
    const path = `layout.${selectedElement}.${property}`;
    updateThemeProperty(path, value);
  };

  return (
    <div className={cn('flex flex-col border-l bg-background', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Properties
        </h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {selectedElement}
        </p>
      </div>

      {/* Properties Tabs */}
      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="style" className="flex-1">
            <Palette className="w-3 h-3 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex-1">
            <Type className="w-3 h-3 mr-1" />
            Type
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex-1">
            <Box className="w-3 h-3 mr-1" />
            Layout
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor" className="text-xs font-medium">
                Background Color
              </Label>
              <Input
                id="backgroundColor"
                value={elementConfig.backgroundColor}
                onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                placeholder="e.g., var(--background) or hsl(0 0% 100%)"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-xs font-medium">
                Text Color
              </Label>
              <Input
                id="textColor"
                value={elementConfig.textColor}
                onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                placeholder="e.g., var(--foreground)"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderColor" className="text-xs font-medium">
                Border Color
              </Label>
              <Input
                id="borderColor"
                value={elementConfig.borderColor}
                onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                placeholder="e.g., var(--border)"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderWidth" className="text-xs font-medium">
                Border Width
              </Label>
              <Input
                id="borderWidth"
                value={elementConfig.borderWidth}
                onChange={(e) => handlePropertyChange('borderWidth', e.target.value)}
                placeholder="e.g., 1px"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boxShadow" className="text-xs font-medium">
                Box Shadow
              </Label>
              <Input
                id="boxShadow"
                value={elementConfig.boxShadow}
                onChange={(e) => handlePropertyChange('boxShadow', e.target.value)}
                placeholder="e.g., 0 2px 4px rgba(0,0,0,0.1)"
                className="text-xs h-8"
              />
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="fontFamily" className="text-xs font-medium">
                Font Family
              </Label>
              <Input
                id="fontFamily"
                value={elementConfig.fontFamily}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                placeholder="e.g., Inter, sans-serif"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-xs font-medium">
                Font Size
              </Label>
              <Input
                id="fontSize"
                value={elementConfig.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                placeholder="e.g., 1rem or 16px"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontWeight" className="text-xs font-medium">
                Font Weight
              </Label>
              <Input
                id="fontWeight"
                value={elementConfig.fontWeight}
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                placeholder="e.g., 400, 500, 600"
                className="text-xs h-8"
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="padding" className="text-xs font-medium">
                Padding
              </Label>
              <Input
                id="padding"
                value={elementConfig.padding}
                onChange={(e) => handlePropertyChange('padding', e.target.value)}
                placeholder="e.g., 1rem or 16px"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin" className="text-xs font-medium">
                Margin
              </Label>
              <Input
                id="margin"
                value={elementConfig.margin}
                onChange={(e) => handlePropertyChange('margin', e.target.value)}
                placeholder="e.g., 1rem or 16px"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderRadius" className="text-xs font-medium">
                Border Radius
              </Label>
              <Input
                id="borderRadius"
                value={elementConfig.borderRadius}
                onChange={(e) => handlePropertyChange('borderRadius', e.target.value)}
                placeholder="e.g., 0.5rem or 8px"
                className="text-xs h-8"
              />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer Tip */}
      <div className="border-t p-3 text-xs text-muted-foreground bg-muted/20">
        <p className="font-medium mb-1">Pro Tip:</p>
        <p>Use CSS variables like <code className="bg-background px-1 py-0.5 rounded">var(--primary)</code> for theme consistency</p>
      </div>
    </div>
  );
}
