"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  TEMPLATE_EVENT_NAME,
  TEMPLATE_STORAGE_KEY,
  CUSTOM_TEMPLATE_STORAGE_KEY,
  applyTemplateToDocument,
  getActiveTemplateSelection,
  getDefaultTemplate,
  setActiveTemplateSelection,
  toTemplateLike,
  type TemplateSelection,
} from '@/lib/templates';
import {
  deleteCustomTemplate,
  getCustomTemplates,
  type CustomTemplate,
} from '@/lib/custom-templates';
import { Check, Layers, Sparkles, Trash2 } from 'lucide-react';

interface CustomTemplateCollectionProps {
  refreshKey: number;
  onTemplatesChange?: () => void;
}

export function CustomTemplateCollection({ refreshKey, onTemplatesChange }: CustomTemplateCollectionProps) {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [activeSelection, setActiveSelection] = useState<TemplateSelection>(() => getActiveTemplateSelection());

  useEffect(() => {
    const templates = getCustomTemplates();
    setCustomTemplates(templates);
  }, [refreshKey]);

  useEffect(() => {
    const updateSelection = () => {
      try {
        setActiveSelection(getActiveTemplateSelection());
      } catch (error) {
        console.warn('Error updating active template:', error);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TEMPLATE_STORAGE_KEY || event.key === CUSTOM_TEMPLATE_STORAGE_KEY) {
        updateSelection();
      }
    };

    updateSelection();
    window.addEventListener(TEMPLATE_EVENT_NAME, updateSelection);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(TEMPLATE_EVENT_NAME, updateSelection);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleApplyTemplate = (template: CustomTemplate) => {
    try {
      applyTemplateToDocument({ ...template, isCustom: true });
      setActiveTemplateSelection({ type: 'custom', id: template.id });
      setActiveSelection({ type: 'custom', id: template.id });
      toast.success(`Plantilla personalizada "${template.name}" activada`);
    } catch (error) {
      toast.error('No se pudo activar la plantilla');
      console.warn('Error applying custom template:', error);
    }
  };

  const handleDeleteTemplate = (template: CustomTemplate) => {
    if (!confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
      return;
    }

    try {
      deleteCustomTemplate(template.id);
      const updated = getCustomTemplates();
      setCustomTemplates(updated);
      onTemplatesChange?.();

      if (activeSelection.type === 'custom' && activeSelection.id === template.id) {
        const fallback = getDefaultTemplate();
        setActiveTemplateSelection({ type: 'preset', id: fallback.id });
        applyTemplateToDocument(toTemplateLike(fallback));
        setActiveSelection({ type: 'preset', id: fallback.id });
        toast.success('Plantilla eliminada. Se restauró el formato premium por defecto.');
      } else {
        toast.success('Plantilla personalizada eliminada');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la plantilla');
      console.warn('Error deleting custom template:', error);
    }
  };

  if (customTemplates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Aún no tienes plantillas personalizadas
          </CardTitle>
          <CardDescription>
            Guarda un diseño desde el diseñador premium para construir tu biblioteca exclusiva.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {customTemplates.map((template) => {
        const isActive = activeSelection.type === 'custom' && activeSelection.id === template.id;

        return (
          <Card
            key={template.id}
            className={cn(
              'overflow-hidden border border-dashed border-primary/30 bg-white/40 shadow-lg shadow-primary/10 backdrop-blur transition-all duration-500 hover:-translate-y-1',
              isActive && 'ring-2 ring-primary shadow-primary/30'
            )}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Custom
                </Badge>
              </div>
              <CardDescription>
                Formato diseñado por ti con variables exclusivas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/40 p-5 shadow-md" style={{
                background: template.variables['--layout-card-surface'],
                boxShadow: template.variables['--layout-card-shadow'],
                borderColor: template.variables['--layout-card-border'],
              }}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Preview</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gradiente hero: <span className="font-medium text-foreground">{template.variables['--layout-hero-gradient']}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Blur panel: <span className="font-medium text-foreground">{template.variables['--layout-panel-blur']}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleApplyTemplate(template)}
                  variant={isActive ? 'outline' : 'default'}
                  disabled={isActive}
                >
                  {isActive ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Activa
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Activar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteTemplate(template)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
