"use client";

import * as React from "react";
import { Eye, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Theme } from "@/lib/themes";
import { CustomTheme } from "@/lib/custom-themes";
import { hslToRgb } from "@/lib/theme-utils";

interface ThemePreviewModalProps {
  theme: Theme | CustomTheme;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  currentTheme?: string;
}

/**
 * Full-screen theme preview modal
 * Shows sample UI components with the theme applied
 */
export function ThemePreviewModal({
  theme,
  isOpen,
  onClose,
  onApply,
  currentTheme,
}: ThemePreviewModalProps) {
  const isActive = currentTheme === theme.name;

  // Get color previews
  const primaryColor = hslToRgb(theme.colors["--primary"]);
  const bgColor = hslToRgb(theme.colors["--background"]);
  const cardColor = hslToRgb(theme.colors["--card"]);
  const accentColor = hslToRgb(theme.colors["--accent"]);
  const foregroundColor = hslToRgb(theme.colors["--foreground"]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Theme Preview: {theme.name}
              </DialogTitle>
              <DialogDescription>
                Preview how this theme looks across different components
              </DialogDescription>
            </div>
            {isActive && (
              <Badge className="ml-auto">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div
          className="flex-1 overflow-y-auto rounded-lg p-6 space-y-6"
          style={{
            backgroundColor: bgColor,
            color: foregroundColor,
          }}
        >
          {/* Color Palette */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Color Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div
                  className="h-16 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                />
                <p className="text-xs font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div
                  className="h-16 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: accentColor }}
                />
                <p className="text-xs font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div
                  className="h-16 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: cardColor }}
                />
                <p className="text-xs font-medium">Card</p>
              </div>
              <div className="space-y-2">
                <div
                  className="h-16 rounded-lg border-2 border-white shadow-md"
                  style={{ backgroundColor: bgColor }}
                />
                <p className="text-xs font-medium">Background</p>
              </div>
            </div>
          </div>

          {/* Sample Card */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Card Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="rounded-lg p-6 shadow-lg"
                style={{ backgroundColor: cardColor }}
              >
                <h4 className="text-lg font-semibold mb-2">Sample Card</h4>
                <p className="text-sm opacity-70 mb-4">
                  This is how cards will look with this theme
                </p>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-2 rounded-md text-sm font-medium"
                    style={{
                      backgroundColor: primaryColor,
                      color: 'white',
                    }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-md border-2 text-sm font-medium"
                    style={{
                      borderColor: primaryColor,
                      color: foregroundColor,
                    }}
                  >
                    Secondary
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-6 shadow-lg"
                style={{ backgroundColor: cardColor }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Stats Card</h4>
                  <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: accentColor,
                      color: 'white',
                    }}
                  >
                    New
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-sm opacity-70">Total Items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">List Items</h3>
            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: cardColor }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border-b last:border-b-0"
                  style={{
                    borderColor: `${primaryColor}20`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">List Item {i}</h5>
                      <p className="text-sm opacity-70">
                        Description for item {i}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Form */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Form Elements</h3>
            <div
              className="rounded-lg p-6 shadow-lg space-y-4"
              style={{ backgroundColor: cardColor }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Field</label>
                <div
                  className="px-3 py-2 rounded-md border-2"
                  style={{
                    borderColor: `${primaryColor}40`,
                    backgroundColor: bgColor,
                  }}
                >
                  <span className="text-sm opacity-50">Sample input...</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Textarea</label>
                <div
                  className="px-3 py-2 rounded-md border-2 h-20"
                  style={{
                    borderColor: `${primaryColor}40`,
                    backgroundColor: bgColor,
                  }}
                >
                  <span className="text-sm opacity-50">Sample textarea...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onApply} disabled={isActive}>
            <Check className="h-4 w-4 mr-2" />
            {isActive ? 'Already Active' : 'Apply Theme'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
