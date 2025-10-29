'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';
import { EditorCanvas } from '@/components/ThemeEditor/EditorCanvas';
import { SidebarTree } from '@/components/ThemeEditor/SidebarTree';
import { PropertiesPanel } from '@/components/ThemeEditor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Monitor,
  Tablet,
  Smartphone,
  Grid3x3,
  Eye,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRESET_THEMES } from '@/utils/themePresets';

/**
 * Theme Editor Page
 *
 * A comprehensive "Figma-style" theme editor with:
 * - 3-column layout (Element Tree | Canvas | Properties Panel)
 * - Top toolbar with undo/redo, save, export, import
 * - Canvas toolbar with device selector, zoom, grid toggle
 * - Keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+S, Escape)
 * - Unsaved changes warning
 */
export default function ThemeEditorPage() {
  const { toast } = useToast();
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    saveTheme,
    loadTheme,
    setTheme,
    exportTheme,
    importTheme,
    resetTheme,
    hasUnsavedChanges,
    availableThemes,
    loadAvailableThemes,
    selectElement,
    togglePreviewMode,
    isPreviewMode,
  } = useThemeStore();

  // Page state
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(0.7);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [importJsonContent, setImportJsonContent] = useState('');
  const [importFileName, setImportFileName] = useState('');

  // Load available themes on mount
  useEffect(() => {
    loadAvailableThemes();
  }, [loadAvailableThemes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
          toast({
            title: 'Undo',
            description: 'Reverted last change',
          });
        }
      }

      // Cmd/Ctrl+Shift+Z - Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
          toast({
            title: 'Redo',
            description: 'Reapplied last change',
          });
        }
      }

      // Cmd/Ctrl+S - Save theme
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setSaveDialogOpen(true);
      }

      // Escape - Deselect element
      if (e.key === 'Escape') {
        selectElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectElement, toast]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle Save Theme
  const handleSaveTheme = useCallback(() => {
    if (!themeName.trim()) {
      toast({
        title: 'Error',
        description: 'Theme name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const savedTheme = saveTheme(themeName);
      toast({
        title: 'Theme Saved',
        description: `"${savedTheme.name}" saved successfully`,
      });
      setSaveDialogOpen(false);
      setThemeName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save theme',
        variant: 'destructive',
      });
    }
  }, [themeName, saveTheme, toast]);

  // Handle Export Theme
  const handleExportTheme = useCallback(() => {
    try {
      const json = exportTheme();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `theme-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Theme Exported',
        description: 'Theme downloaded as JSON file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export theme',
        variant: 'destructive',
      });
    }
  }, [exportTheme, toast]);

  // Handle Import Theme
  const handleImportTheme = useCallback(() => {
    if (!importJsonContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }

    try {
      importTheme(importJsonContent);
      toast({
        title: 'Theme Imported',
        description: 'Theme imported successfully',
      });
      setImportDialogOpen(false);
      setImportJsonContent('');
      setImportFileName('');
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Invalid theme file',
        variant: 'destructive',
      });
    }
  }, [importJsonContent, importTheme, toast]);

  // Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonContent(content);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    };
    reader.readAsText(file);
  };

  // Handle Reset Theme
  const handleResetTheme = useCallback(() => {
    resetTheme();
    toast({
      title: 'Theme Reset',
      description: 'Theme reset to default configuration',
    });
    setResetDialogOpen(false);
  }, [resetTheme, toast]);

  return (
    <motion.div
      className="theme-editor-layout h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Toolbar */}
      <motion.div
        className="border-b bg-card flex items-center justify-between px-4 py-2 gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-semibold text-sm">Theme Editor</h1>
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted-foreground flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Unsaved changes
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Undo/Redo */}
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo (Cmd/Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo (Cmd/Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Palette className="w-4 h-4 mr-2" />
                  Load Theme
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>Preset Themes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRESET_THEMES.slice(0, 12).map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme);
                    toast({
                      title: 'Theme Loaded',
                      description: `"${theme.name}" loaded successfully`,
                    });
                  }}
                >
                  {theme.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Saved Themes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableThemes.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No saved themes
                </div>
              ) : (
                availableThemes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => {
                      loadTheme(theme.id);
                      toast({
                        title: 'Theme Loaded',
                        description: `"${theme.name}" loaded successfully`,
                      });
                    }}
                  >
                    {theme.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
              title="Save Theme (Cmd/Ctrl+S)"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={handleExportTheme}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main 3-column layout */}
      <motion.div
        className="flex flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Left: Element Tree */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <SidebarTree className="w-64" />
        </motion.div>

        {/* Center: Canvas */}
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          {/* Canvas Toolbar */}
          <div className="border-b bg-card px-4 py-2 flex items-center justify-between gap-4">
            {/* Device Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Device:</span>
              <ToggleGroup
                type="single"
                value={deviceMode}
                onValueChange={(value) => {
                  if (value) setDeviceMode(value as typeof deviceMode);
                }}
                size="sm"
              >
                <ToggleGroupItem value="desktop" aria-label="Desktop view">
                  <Monitor className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="tablet" aria-label="Tablet view">
                  <Tablet className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="mobile" aria-label="Mobile view">
                  <Smartphone className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-xs font-medium text-muted-foreground">Zoom:</span>
              <Slider
                value={[scale]}
                onValueChange={(values) => setScale(values[0])}
                min={0.5}
                max={1.5}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Grid & Preview Toggle */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={showGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Grid
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={isPreviewMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={togglePreviewMode}
                >
                  {isPreviewMode ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Canvas */}
          <EditorCanvas
            className="flex-1"
            deviceMode={deviceMode}
            showGrid={showGrid}
            scale={scale}
          />
        </motion.div>

        {/* Right: Properties Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <PropertiesPanel className="w-80" />
        </motion.div>
      </motion.div>

      {/* Save Theme Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Theme</DialogTitle>
            <DialogDescription>
              Give your theme a memorable name. You can load it later from the theme selector.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g., My Custom Theme"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTheme();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTheme} disabled={!themeName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Theme Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Theme</DialogTitle>
            <DialogDescription>
              Upload a theme JSON file to import it into the editor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-file">Theme File</Label>
              <Input
                id="theme-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
              />
              {importFileName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {importFileName}
                </p>
              )}
            </div>

            {importJsonContent && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-muted p-3 rounded-md text-xs font-mono max-h-40 overflow-auto">
                  {importJsonContent.substring(0, 500)}
                  {importJsonContent.length > 500 && '...'}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportJsonContent('');
                setImportFileName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportTheme} disabled={!importJsonContent}>
              <Upload className="w-4 h-4 mr-2" />
              Import Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Theme Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the theme to default configuration?
              This will discard all unsaved changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetTheme}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
