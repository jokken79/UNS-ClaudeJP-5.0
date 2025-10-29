'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { Layers, Layout, Square, PanelLeft, PanelBottom } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarTreeProps {
  className?: string;
}

/**
 * SidebarTree - Element tree/layers panel for the theme editor
 *
 * Displays the hierarchical structure of editable theme elements,
 * allowing users to select elements for editing.
 */
export function SidebarTree({ className }: SidebarTreeProps) {
  const { selectedElement, selectElement } = useThemeStore();

  // Define the element tree structure
  const elements = [
    { id: 'header', label: 'Header', icon: Layout, description: 'Top navigation bar' },
    { id: 'sidebar', label: 'Sidebar', icon: PanelLeft, description: 'Side navigation panel' },
    { id: 'main', label: 'Main Content', icon: Square, description: 'Primary content area' },
    { id: 'card', label: 'Card', icon: Layers, description: 'Card component', indent: true },
    { id: 'footer', label: 'Footer', icon: PanelBottom, description: 'Bottom footer bar' },
  ];

  return (
    <div className={cn('flex flex-col border-r bg-background', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Elements
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select an element to edit
        </p>
      </div>

      {/* Element Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {elements.map((element) => {
            const Icon = element.icon;
            const isSelected = selectedElement === element.id;

            return (
              <button
                key={element.id}
                onClick={() => selectElement(element.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors mb-1',
                  'hover:bg-accent hover:text-accent-foreground',
                  'flex items-start gap-2',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  element.indent && 'ml-6'
                )}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{element.label}</div>
                  <div className={cn(
                    'text-xs truncate',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {element.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t p-3 text-xs text-muted-foreground">
        <p>Click an element to edit its properties</p>
      </div>
    </div>
  );
}
