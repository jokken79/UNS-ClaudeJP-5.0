"use client";

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2 } from 'lucide-react';
import {
  applyTemplateToDocument,
  setActiveTemplateSelection,
  type TemplateVariables,
} from '@/lib/templates';
import {
  getMaxCustomTemplates,
  saveCustomTemplate,
  type CustomTemplate,
} from '@/lib/custom-templates';

interface CustomTemplateDesignerProps {
  onTemplateSaved?: (template: CustomTemplate) => void;
}

const initialState = {
  name: '',
  primaryColor: '#4f46e5',
  secondaryColor: '#14b8a6',
  accentColor: '#f97316',
  surfaceColor: '#ffffff',
  overlayStrength: 32,
  blurIntensity: 26,
  radius: 28,
  shadowPower: 38,
  gradientAngle: 138,
  sectionGap: 3.6,
  containerWidth: 1280,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(2)})`;
};

const buildVariables = (state: typeof initialState): TemplateVariables => {
  const overlayAlpha = state.overlayStrength / 100;
  const heroAngle = clamp(state.gradientAngle, 60, 180);
  const radius = `${Math.round(state.radius)}px`;
  const buttonRadius = `${Math.round(state.radius * 0.9 + 10)}px`;
  const shadowBase = clamp(state.shadowPower, 12, 60);
  const blur = `${Math.round(state.blurIntensity)}px`;
  const primary = state.primaryColor;
  const secondary = state.secondaryColor;
  const accent = state.accentColor;
  const surface = state.surfaceColor;

  return {
    '--layout-card-radius': radius,
    '--layout-card-shadow': `0 ${Math.round(shadowBase)}px ${Math.round(shadowBase * 2.4)}px ${withAlpha(primary, 0.32)}`,
    '--layout-card-border': withAlpha(primary, 0.24),
    '--layout-card-surface': `linear-gradient(${heroAngle - 12}deg, ${withAlpha(surface, 0.96)} 0%, ${withAlpha(surface, 0.85)} 100%)`,
    '--layout-button-radius': buttonRadius,
    '--layout-button-shadow': `0 ${Math.round(shadowBase * 0.85)}px ${Math.round(shadowBase * 1.9)}px ${withAlpha(accent, 0.38)}`,
    '--layout-surface-gradient': `radial-gradient(circle at 18% -8%, ${withAlpha(primary, overlayAlpha)} 0%, transparent 58%), radial-gradient(circle at 80% -6%, ${withAlpha(accent, overlayAlpha * 0.85)} 0%, transparent 62%)`,
    '--layout-surface-overlay': withAlpha(primary, overlayAlpha * 0.42),
    '--layout-panel-blur': blur,
    '--layout-hero-gradient': `linear-gradient(${heroAngle}deg, ${withAlpha(primary, 0.92)} 0%, ${withAlpha(secondary, 0.85)} 50%, ${withAlpha(accent, 0.8)} 100%)`,
    '--layout-hero-glow': `0 ${Math.round(shadowBase * 2.6)}px ${Math.round(shadowBase * 3.1)}px ${withAlpha(secondary, 0.42)}`,
    '--layout-container-max': `${clamp(state.containerWidth, 1080, 1440)}px`,
    '--layout-section-gap': `${clamp(state.sectionGap, 2.5, 5.5).toFixed(1)}rem`,
    '--layout-navbar-background': withAlpha(primary, 0.62),
    '--layout-navbar-shadow': `0 ${Math.round(shadowBase * 1.1)}px ${Math.round(shadowBase * 2.6)}px ${withAlpha(primary, 0.28)}`,
    '--layout-divider-glow': `linear-gradient(90deg, ${withAlpha(primary, 0)} 0%, ${withAlpha(accent, 0.55)} 45%, ${withAlpha(secondary, 0)} 100%)`,
    '--layout-list-stripe': `linear-gradient(90deg, ${withAlpha(primary, 0.18)} 0%, ${withAlpha(secondary, 0.32)} 100%)`,
    '--layout-focus-ring': `0 0 0 4px ${withAlpha(accent, 0.45)}`,
    '--layout-badge-glow': `0 0 0 4px ${withAlpha(accent, 0.42)}`,
  };
};

export function CustomTemplateDesigner({ onTemplateSaved }: CustomTemplateDesignerProps) {
  const [formState, setFormState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const liveVariables = useMemo(() => buildVariables(formState), [formState]);

  const handleChange = (key: keyof typeof initialState, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePreview = () => {
    try {
      const variables = buildVariables(formState);
      applyTemplateToDocument({ id: 'custom-preview', name: formState.name || 'Vista previa', variables, isCustom: true });
      toast.success('Vista previa aplicada. Explora la app para ver el nuevo formato.');
    } catch (error) {
      toast.error('No se pudo aplicar la vista previa');
      console.warn('Error applying preview template:', error);
    }
  };

  const handleReset = () => {
    setFormState(initialState);
    toast.success('Diseñador reiniciado');
  };

  const handleSave = async () => {
    const trimmedName = formState.name.trim();

    if (!trimmedName) {
      toast.error('Asigna un nombre a tu plantilla premium');
      return;
    }

    if (trimmedName.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      const variables = buildVariables(formState);
      const template = saveCustomTemplate({
        name: trimmedName,
        variables,
      });

      applyTemplateToDocument({ ...template, isCustom: true });
      setActiveTemplateSelection({ type: 'custom', id: template.id });
      toast.success(`Plantilla "${template.name}" guardada y activada`);
      onTemplateSaved?.(template);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la plantilla');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-primary/20">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Diseña tu propia plantilla premium
          </CardTitle>
          <CardDescription>
            Ajusta luces, gradientes y profundidad para crear un formato visual único.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs uppercase tracking-[0.2em]">
          Hasta {getMaxCustomTemplates()} plantillas personales
        </Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/40 p-6 shadow-lg shadow-primary/10 backdrop-blur">
            <div className="space-y-3">
              <Label htmlFor="template-name">Nombre de la plantilla</Label>
              <Input
                id="template-name"
                value={formState.name}
                maxLength={40}
                placeholder="Ej: Aurora Diplomática"
                onChange={(event) => handleChange('name', event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Elige un nombre distintivo para identificar tu diseño exclusivo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Color base</Label>
                <Input
                  id="primary-color"
                  type="color"
                  value={formState.primaryColor}
                  onChange={(event) => handleChange('primaryColor', event.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Color secundario</Label>
                <Input
                  id="secondary-color"
                  type="color"
                  value={formState.secondaryColor}
                  onChange={(event) => handleChange('secondaryColor', event.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color">Color de acento</Label>
                <Input
                  id="accent-color"
                  type="color"
                  value={formState.accentColor}
                  onChange={(event) => handleChange('accentColor', event.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surface-color">Color de superficie</Label>
                <Input
                  id="surface-color"
                  type="color"
                  value={formState.surfaceColor}
                  onChange={(event) => handleChange('surfaceColor', event.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Intensidad de iluminación ({formState.overlayStrength}%)</Label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={formState.overlayStrength}
                  onChange={(event) => handleChange('overlayStrength', Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
              <div>
                <Label>Blur de cristal ({formState.blurIntensity}px)</Label>
                <input
                  type="range"
                  min={8}
                  max={40}
                  step={1}
                  value={formState.blurIntensity}
                  onChange={(event) => handleChange('blurIntensity', Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
              <div>
                <Label>Radio de bordes ({formState.radius}px)</Label>
                <input
                  type="range"
                  min={18}
                  max={48}
                  step={1}
                  value={formState.radius}
                  onChange={(event) => handleChange('radius', Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
              <div>
                <Label>Poder de la sombra ({formState.shadowPower})</Label>
                <input
                  type="range"
                  min={18}
                  max={60}
                  step={1}
                  value={formState.shadowPower}
                  onChange={(event) => handleChange('shadowPower', Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                    Vista previa dinámica
                  </p>
                  <h3 className="text-2xl font-bold text-foreground">Dashboard de lujo</h3>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Live Mode
                </Badge>
              </div>
              <div className="mt-6 space-y-4">
                <div
                  className="overflow-hidden rounded-3xl border border-white/20 p-6 shadow-lg"
                  style={{
                    background: liveVariables['--layout-hero-gradient'],
                    boxShadow: liveVariables['--layout-hero-glow'],
                  }}
                >
                  <p className="text-sm uppercase tracking-[0.35em] text-white/70">Hero principal</p>
                  <h4 className="mt-2 text-2xl font-semibold text-white">
                    {formState.name || 'Tu próxima plantilla premium'}
                  </h4>
                  <p className="mt-1 text-sm text-white/70">
                    Experiencia envolvente con gradientes profesionales y capas de cristal.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <span
                      className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium text-white/85"
                      style={{
                        background: liveVariables['--layout-card-surface'],
                        boxShadow: liveVariables['--layout-button-shadow'],
                      }}
                    >
                      <Wand2 className="mr-2 h-3.5 w-3.5" /> Hero luminoso
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium text-white/85"
                      style={{
                        background: liveVariables['--layout-surface-gradient'],
                        boxShadow: liveVariables['--layout-card-shadow'],
                      }}
                    >
                      Sombras cinematográficas
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/20 p-4 shadow-lg"
                      style={{
                        background: liveVariables['--layout-card-surface'],
                        boxShadow: liveVariables['--layout-card-shadow'],
                        borderColor: liveVariables['--layout-card-border'],
                      }}
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/80">
                        Widget {index + 1}
                      </p>
                      <h5 className="mt-2 text-lg font-semibold text-foreground">Brillo adaptable</h5>
                      <p className="text-sm text-muted-foreground">
                        Tarjetas flotantes con radios fluidos y luces envolventes.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Separación entre secciones ({formState.sectionGap.toFixed(1)}rem)</Label>
                <input
                  type="range"
                  min={2.4}
                  max={5.5}
                  step={0.1}
                  value={formState.sectionGap}
                  onChange={(event) => handleChange('sectionGap', Number(Number(event.target.value).toFixed(1)))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
              <div>
                <Label>Ancho máximo de contenedor ({formState.containerWidth}px)</Label>
                <input
                  type="range"
                  min={1080}
                  max={1440}
                  step={20}
                  value={formState.containerWidth}
                  onChange={(event) => handleChange('containerWidth', Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handlePreview}>
                Vista previa instantánea
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reiniciar diseñador
              </Button>
              <Button type="button" disabled={isSaving} onClick={handleSave}>
                {isSaving ? 'Guardando...' : 'Guardar y activar'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
