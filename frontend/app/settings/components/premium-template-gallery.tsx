"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TEMPLATE_EVENT_NAME,
  TEMPLATE_STORAGE_KEY,
  CUSTOM_TEMPLATE_STORAGE_KEY,
  applyTemplateToDocument,
  getActiveTemplateSelection,
  setActiveTemplateSelection,
  templates,
  toTemplateLike,
  type TemplateDefinition,
  type TemplateSelection,
} from '@/lib/templates';
import toast from 'react-hot-toast';
import { Check, MousePointerClick, Sparkles, Star, Type, Wand2 } from 'lucide-react';

const formatFeatures = (features: string[]) => {
  if (features.length <= 3) {
    return features;
  }

  return features.slice(0, 3);
};

export function PremiumTemplateGallery() {
  const [activeSelection, setActiveSelection] = useState<TemplateSelection>(() => getActiveTemplateSelection());

  useEffect(() => {
    const updateSelection = () => {
      try {
        setActiveSelection(getActiveTemplateSelection());
      } catch (error) {
        console.warn('Error updating template selection:', error);
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

  const handleApplyTemplate = (template: TemplateDefinition) => {
    try {
      applyTemplateToDocument({ ...toTemplateLike(template) });
      setActiveTemplateSelection({ type: 'preset', id: template.id });
      setActiveSelection({ type: 'preset', id: template.id });
      toast.success(`Plantilla "${template.name}" activada con éxito`);
    } catch (error) {
      toast.error('No se pudo activar la plantilla');
      console.warn('Error activating template:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const isActive = activeSelection.type === 'preset' && activeSelection.id === template.id;
        const featureList = formatFeatures(template.features);

        return (
          <Card
            key={template.id}
            className={cn(
              'group overflow-hidden border border-white/10 bg-transparent transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20',
              isActive && 'ring-2 ring-primary shadow-2xl shadow-primary/30'
            )}
          >
            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: template.preview.gradient,
                  filter: 'saturate(1.05)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: template.preview.spotlight, mixBlendMode: 'screen' }}
              />
              <div
                className="absolute inset-0 opacity-90"
                style={{ background: template.preview.accentShape }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur">
                    {template.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Star className="h-4 w-4" />
                    {template.price}
                  </span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-white drop-shadow-lg">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-white/80">
                    {template.tagline}
                  </CardDescription>
                </div>
                {isActive && (
                  <Badge className="w-fit bg-white/20 text-white">
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Activo
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Detalles de la plantilla
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Experiencia
                </p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {featureList.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Wand2 className="mt-0.5 h-4 w-4 text-primary/80" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[template.palette.primary, template.palette.secondary, template.palette.accent, template.palette.background].map((color, index) => (
                  <div key={`${template.id}-${color}-${index}`} className="rounded-lg border border-white/10 p-2 text-center text-xs font-medium text-muted-foreground">
                    <div className="h-8 w-full rounded-md" style={{ background: color }} />
                    <span className="mt-1 block truncate" title={color}>
                      {color}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tipografías</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(template.fonts).map(([role, font]) => (
                      <Badge key={`${template.id}-${role}`} variant="outline" className="flex items-center gap-1">
                        <Type className="h-3.5 w-3.5 text-primary" />
                        <span className="capitalize">{role}</span>
                        <span className="text-muted-foreground">• {font}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Iconografía</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {template.iconography.map((icon) => (
                      <Badge key={`${template.id}-${icon}`} variant="secondary" className="flex items-center gap-1 bg-muted/60">
                        <Wand2 className="h-3.5 w-3.5 text-primary" />
                        <span>{icon}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Variantes de botón</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.buttonStyles.map((style) => (
                    <Badge key={`${template.id}-${style}`} variant="outline" className="flex items-center gap-1">
                      <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                      <span>{style}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handleApplyTemplate(template)}
                variant={isActive ? 'outline' : 'default'}
                disabled={isActive}
              >
                {isActive ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Plantilla activa
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Activar formato premium
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
