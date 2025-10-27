'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';

interface EditorCanvasProps {
  className?: string;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  showGrid?: boolean;
  scale?: number;
}

/**
 * EditorCanvas - The main canvas area where the theme preview is rendered
 *
 * This component displays a live preview of the theme being edited, with support
 * for different device modes, grid overlay, and zoom/scale.
 */
export function EditorCanvas({
  className,
  deviceMode,
  showGrid = false,
  scale = 1
}: EditorCanvasProps) {
  const { currentTheme, selectedElement, selectElement, isPreviewMode } = useThemeStore();

  // Device dimensions
  const deviceSizes = {
    desktop: { width: '100%', maxWidth: '1200px' },
    tablet: { width: '768px', maxWidth: '768px' },
    mobile: { width: '375px', maxWidth: '375px' },
  };

  const deviceSize = deviceSizes[deviceMode];

  // Apply theme colors to the preview
  const previewStyle = {
    '--preview-background': currentTheme.colors['--background'],
    '--preview-foreground': currentTheme.colors['--foreground'],
    '--preview-card': currentTheme.colors['--card'],
    '--preview-primary': currentTheme.colors['--primary'],
    '--preview-border': currentTheme.colors['--border'],
  } as React.CSSProperties;

  const handleElementClick = (elementId: string) => {
    if (!isPreviewMode) {
      selectElement(elementId);
    }
  };

  return (
    <div className={cn('relative overflow-auto bg-muted/20 p-8', className)}>
      {/* Grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Canvas preview container */}
      <div
        className="mx-auto bg-background rounded-lg shadow-xl transition-all duration-300"
        style={{
          width: deviceSize.width,
          maxWidth: deviceSize.maxWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          ...previewStyle,
        }}
      >
        {/* Header Preview */}
        <div
          onClick={() => handleElementClick('header')}
          className={cn(
            'p-4 border-b cursor-pointer transition-all',
            selectedElement === 'header' && !isPreviewMode && 'ring-2 ring-primary ring-inset'
          )}
          style={{
            backgroundColor: `hsl(${currentTheme.layout.header.backgroundColor})`,
            color: `hsl(${currentTheme.layout.header.textColor})`,
            fontSize: currentTheme.layout.header.fontSize,
            fontFamily: currentTheme.layout.header.fontFamily,
            fontWeight: currentTheme.layout.header.fontWeight,
            padding: currentTheme.layout.header.padding,
            borderRadius: `${currentTheme.layout.header.borderRadius} ${currentTheme.layout.header.borderRadius} 0 0`,
            boxShadow: currentTheme.layout.header.boxShadow,
          }}
        >
          <h2 className="font-semibold text-xl">Header</h2>
          <p className="text-sm opacity-80">Application header with navigation</p>
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-[400px]">
          {/* Sidebar Preview */}
          <div
            onClick={() => handleElementClick('sidebar')}
            className={cn(
              'w-48 p-4 border-r cursor-pointer transition-all',
              selectedElement === 'sidebar' && !isPreviewMode && 'ring-2 ring-primary ring-inset'
            )}
            style={{
              backgroundColor: `hsl(${currentTheme.layout.sidebar.backgroundColor})`,
              color: `hsl(${currentTheme.layout.sidebar.textColor})`,
              fontSize: currentTheme.layout.sidebar.fontSize,
              fontFamily: currentTheme.layout.sidebar.fontFamily,
              fontWeight: currentTheme.layout.sidebar.fontWeight,
              padding: currentTheme.layout.sidebar.padding,
              boxShadow: currentTheme.layout.sidebar.boxShadow,
            }}
          >
            <h3 className="font-medium mb-3">Sidebar</h3>
            <ul className="space-y-2 text-sm">
              <li className="py-1">Dashboard</li>
              <li className="py-1">Settings</li>
              <li className="py-1">Profile</li>
            </ul>
          </div>

          {/* Main Content Preview */}
          <div
            onClick={() => handleElementClick('main')}
            className={cn(
              'flex-1 p-6 cursor-pointer transition-all',
              selectedElement === 'main' && !isPreviewMode && 'ring-2 ring-primary ring-inset'
            )}
            style={{
              backgroundColor: `hsl(${currentTheme.layout.main.backgroundColor})`,
              color: `hsl(${currentTheme.layout.main.textColor})`,
              fontSize: currentTheme.layout.main.fontSize,
              fontFamily: currentTheme.layout.main.fontFamily,
              fontWeight: currentTheme.layout.main.fontWeight,
              padding: currentTheme.layout.main.padding,
              boxShadow: currentTheme.layout.main.boxShadow,
            }}
          >
            <h3 className="font-semibold text-lg mb-4">Main Content</h3>

            {/* Card Preview */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleElementClick('card');
              }}
              className={cn(
                'p-4 mb-4 border cursor-pointer transition-all',
                selectedElement === 'card' && !isPreviewMode && 'ring-2 ring-primary ring-inset'
              )}
              style={{
                backgroundColor: `hsl(${currentTheme.layout.card.backgroundColor})`,
                color: `hsl(${currentTheme.layout.card.textColor})`,
                fontSize: currentTheme.layout.card.fontSize,
                fontFamily: currentTheme.layout.card.fontFamily,
                fontWeight: currentTheme.layout.card.fontWeight,
                padding: currentTheme.layout.card.padding,
                borderRadius: currentTheme.layout.card.borderRadius,
                boxShadow: currentTheme.layout.card.boxShadow,
                borderColor: `hsl(${currentTheme.layout.card.borderColor})`,
                borderWidth: currentTheme.layout.card.borderWidth,
              }}
            >
              <h4 className="font-medium mb-2">Card Component</h4>
              <p className="text-sm opacity-80">
                This is a sample card to preview styling
              </p>
            </div>

            <div
              className="p-4 border"
              style={{
                backgroundColor: `hsl(${currentTheme.layout.card.backgroundColor})`,
                borderRadius: currentTheme.layout.card.borderRadius,
                boxShadow: currentTheme.layout.card.boxShadow,
                borderColor: `hsl(${currentTheme.layout.card.borderColor})`,
              }}
            >
              <p className="text-sm">Additional content area</p>
            </div>
          </div>
        </div>

        {/* Footer Preview */}
        <div
          onClick={() => handleElementClick('footer')}
          className={cn(
            'p-4 border-t cursor-pointer transition-all',
            selectedElement === 'footer' && !isPreviewMode && 'ring-2 ring-primary ring-inset'
          )}
          style={{
            backgroundColor: `hsl(${currentTheme.layout.footer.backgroundColor})`,
            color: `hsl(${currentTheme.layout.footer.textColor})`,
            fontSize: currentTheme.layout.footer.fontSize,
            fontFamily: currentTheme.layout.footer.fontFamily,
            fontWeight: currentTheme.layout.footer.fontWeight,
            padding: currentTheme.layout.footer.padding,
            borderRadius: `0 0 ${currentTheme.layout.footer.borderRadius} ${currentTheme.layout.footer.borderRadius}`,
            boxShadow: currentTheme.layout.footer.boxShadow,
          }}
        >
          <p className="text-sm text-center opacity-80">Footer Content</p>
        </div>
      </div>

      {/* Selection indicator label */}
      {selectedElement && !isPreviewMode && (
        <div className="fixed top-20 right-8 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium shadow-lg z-20">
          Selected: {selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}
        </div>
      )}
    </div>
  );
}
