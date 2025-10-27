'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Palette, Sparkles, Paintbrush, Grid3x3, Layers, ArrowLeft, Home, Gem, PenTool, Sun, Moon } from 'lucide-react';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { CustomThemeBuilder } from './components/custom-theme-builder';
import { CustomThemesList } from './components/custom-themes-list';
import { PremiumTemplateGallery } from './components/premium-template-gallery';
import { CustomTemplateDesigner } from './components/custom-template-designer';
import { CustomTemplateCollection } from './components/custom-template-collection';

// Theme metadata with emojis and descriptions
const themeMetadata: Record<string, { emoji: string; label: string; description: string; category: string }> = {
  // DEFAULT THEMES
  "default-light": {
    emoji: "☀️",
    label: "Claro Predeterminado",
    description: "Tema claro profesional con acentos azules",
    category: "Predeterminado"
  },
  "default-dark": {
    emoji: "🌙",
    label: "Oscuro Predeterminado",
    description: "Tema oscuro para reducir fatiga visual",
    category: "Predeterminado"
  },

  // UNS-KIKAKU THEMES
  "uns-kikaku-light": {
    emoji: "🏢",
    label: "UNS-Kikaku Claro",
    description: "Tema corporativo claro con azul profesional",
    category: "Corporativo"
  },
  "uns-kikaku-dark": {
    emoji: "🏢",
    label: "UNS-Kikaku Oscuro",
    description: "Tema corporativo oscuro elegante",
    category: "Corporativo"
  },

  // OCEAN BLUE THEMES
  "ocean-blue-light": {
    emoji: "🌊",
    label: "Océano Azul Claro",
    description: "Olas tranquilas en día soleado",
    category: "Naturaleza"
  },
  "ocean-blue-dark": {
    emoji: "🌊",
    label: "Océano Azul Oscuro",
    description: "Profundidades del océano de noche",
    category: "Naturaleza"
  },

  // SUNSET THEMES
  "sunset-light": {
    emoji: "🌅",
    label: "Atardecer Claro",
    description: "Colores cálidos de atardecer inspiradores",
    category: "Naturaleza"
  },
  "sunset-dark": {
    emoji: "🌅",
    label: "Atardecer Oscuro",
    description: "Tonos profundos del crepúsculo",
    category: "Naturaleza"
  },

  // MINT GREEN THEMES
  "mint-green-light": {
    emoji: "🌿",
    label: "Verde Menta Claro",
    description: "Frescura de menta revitalizante",
    category: "Naturaleza"
  },
  "mint-green-dark": {
    emoji: "🌿",
    label: "Verde Menta Oscuro",
    description: "Bosque de menta en la noche",
    category: "Naturaleza"
  },

  // ROYAL PURPLE THEMES
  "royal-purple-light": {
    emoji: "👑",
    label: "Púrpura Real Claro",
    description: "Majestuosidad púrpura premium",
    category: "Premium"
  },
  "royal-purple-dark": {
    emoji: "👑",
    label: "Púrpura Real Oscuro",
    description: "Elegancia real en la oscuridad",
    category: "Premium"
  },

  // INDUSTRIAL THEMES
  "industrial-light": {
    emoji: "🏭",
    label: "Industrial Claro",
    description: "Azul acero profesional para trabajo serio",
    category: "Profesional"
  },
  "industrial-dark": {
    emoji: "🏭",
    label: "Industrial Oscuro",
    description: "Tonos industriales oscuros potentes",
    category: "Profesional"
  },

  // VIBRANT CORAL THEMES
  "vibrant-coral-light": {
    emoji: "🪸",
    label: "Coral Vibrante Claro",
    description: "Energía coral para impulsar productividad",
    category: "Vibrante"
  },
  "vibrant-coral-dark": {
    emoji: "🪸",
    label: "Coral Vibrante Oscuro",
    description: "Coral brillante en fondo oscuro",
    category: "Vibrante"
  },

  // FOREST GREEN THEMES
  "forest-green-light": {
    emoji: "🌲",
    label: "Verde Bosque Claro",
    description: "Tonos naturales para concentración",
    category: "Naturaleza"
  },
  "forest-green-dark": {
    emoji: "🌲",
    label: "Verde Bosque Oscuro",
    description: "Profundidad del bosque nocturno",
    category: "Naturaleza"
  },

  // MONOCHROME THEMES
  "monochrome-light": {
    emoji: "⚫",
    label: "Monocromo Claro",
    description: "Elegancia en blanco y negro atemporal",
    category: "Minimalista"
  },
  "monochrome-dark": {
    emoji: "⚫",
    label: "Monocromo Oscuro",
    description: "Sofisticación monocromática oscura",
    category: "Minimalista"
  },

  // ESPRESSO THEMES
  "espresso-light": {
    emoji: "☕",
    label: "Espresso Claro",
    description: "Tonos de café cálidos y acogedores",
    category: "Cálido"
  },
  "espresso-dark": {
    emoji: "☕",
    label: "Espresso Oscuro",
    description: "Café profundo para productividad nocturna",
    category: "Cálido"
  },

  // JPKKEN THEMES
  "jpkken-light": {
    emoji: "🎨",
    label: "JPKKen Claro",
    description: "Tema personalizado con acentos vibrantes",
    category: "Personalizado"
  },
  "jpkken-dark": {
    emoji: "🎨",
    label: "JPKKen Oscuro",
    description: "Diseño personalizado para modo oscuro",
    category: "Personalizado"
  },
};

// Helper function to convert HSL string to RGB for preview
const hslToRgb = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));

  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return `rgb(${red}, ${green}, ${blue})`;
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if current theme is custom
  const isCustomTheme = theme?.startsWith('custom-');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Atrás</span>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Configuración de Temas</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Description */}
        <div className="mb-8">
          <p className="text-muted-foreground text-lg">
            Personaliza la apariencia de tu aplicación con hermosos temas predefinidos o crea tu propio diseño
          </p>
        </div>

        {/* Current Theme */}
        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tema Actual
            </CardTitle>
            <CardDescription>
              El tema que estás utilizando ahora mismo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-4xl">
                {isCustomTheme ? '🎨' : themeMetadata[theme || 'default-light']?.emoji}
              </span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {isCustomTheme ? theme : themeMetadata[theme || 'default-light']?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isCustomTheme
                    ? 'Tema personalizado creado por ti'
                    : themeMetadata[theme || 'default-light']?.description
                  }
                </p>
              </div>
              <Badge variant="secondary" className="px-4 py-2">
                {isCustomTheme ? 'Personalizado' : themeMetadata[theme || 'default-light']?.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dark/Light Mode Toggle */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme?.includes('-dark') ? '🌙' : '☀️'} Modo de Apariencia
            </CardTitle>
            <CardDescription>
              Cambia entre modo claro y oscuro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {theme?.includes('-dark') ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {theme?.includes('-dark')
                    ? 'Reduce el brillo para entornos con poca luz'
                    : 'Maximiza el contraste para entornos luminosos'
                  }
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const currentBase = theme?.replace('-light', '').replace('-dark', '') || 'default';
                  const isDark = theme?.includes('-dark');
                  setTheme(`${currentBase}-${isDark ? 'light' : 'dark'}`);
                  handleThemeChange();
                }}
                className="flex items-center gap-2"
              >
                {theme?.includes('-dark') ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Cambiar a Claro
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Cambiar a Oscuro
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Theme Management */}
        <Tabs defaultValue="predefined" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="predefined" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Temas Predefinidos</span>
              <span className="sm:hidden">Predefinidos</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              <span className="hidden sm:inline">Crear Tema</span>
              <span className="sm:hidden">Crear</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Mis Temas</span>
              <span className="sm:hidden">Mis Temas</span>
            </TabsTrigger>
          </TabsList>

          {/* Pre-defined Themes Tab */}
          <TabsContent value="predefined" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Palette className="h-6 w-6" />
                Todos los Temas
              </h2>
              <p className="text-muted-foreground mb-6">
                Haz clic en "Aplicar" para cambiar el tema de la aplicación
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((themeOption) => {
                const metadata = themeMetadata[themeOption.name];
                const isActive = theme === themeOption.name;

                // Get colors for preview
                const primaryColor = hslToRgb(themeOption.colors["--primary"]);
                const bgColor = hslToRgb(themeOption.colors["--background"]);
                const cardColor = hslToRgb(themeOption.colors["--card"]);
                const foregroundColor = hslToRgb(themeOption.colors["--foreground"]);
                const accentColor = hslToRgb(themeOption.colors["--accent"]);

                return (
                  <Card
                    key={themeOption.name}
                    className={cn(
                      "relative overflow-hidden transition-all hover:shadow-lg",
                      isActive && "ring-2 ring-primary shadow-lg"
                    )}
                  >
                    {isActive && (
                      <Badge
                        variant="default"
                        className="absolute top-4 right-4 z-10 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Activo
                      </Badge>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{metadata?.emoji}</span>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {metadata?.label || themeOption.name}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {metadata?.category}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {metadata?.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Color Preview */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Vista Previa de Colores
                        </p>

                        {/* Main Preview Card */}
                        <div
                          className="rounded-lg p-4 space-y-3 border"
                          style={{
                            backgroundColor: bgColor,
                            color: foregroundColor,
                            borderColor: hslToRgb(themeOption.colors["--border"])
                          }}
                        >
                          <div
                            className="rounded-md p-3"
                            style={{ backgroundColor: cardColor }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <div className="h-2 flex-1 rounded" style={{ backgroundColor: accentColor }} />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor, opacity: 0.6 }} />
                              <div className="h-2 w-1/2 rounded" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
                            </div>
                          </div>
                        </div>

                        {/* Color Swatches */}
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-1">
                            <div
                              className="h-8 rounded border"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <p className="text-xs text-center text-muted-foreground">Primary</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div
                              className="h-8 rounded border"
                              style={{ backgroundColor: cardColor }}
                            />
                            <p className="text-xs text-center text-muted-foreground">Card</p>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div
                              className="h-8 rounded border"
                              style={{ backgroundColor: bgColor }}
                            />
                            <p className="text-xs text-center text-muted-foreground">Background</p>
                          </div>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <Button
                        className="w-full"
                        variant={isActive ? "outline" : "default"}
                        onClick={() => setTheme(themeOption.name)}
                        disabled={isActive}
                      >
                        {isActive ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Tema Actual
                          </>
                        ) : (
                          <>
                            <Palette className="h-4 w-4 mr-2" />
                            Aplicar Tema
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Create Custom Theme Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Paintbrush className="h-6 w-6" />
                Crear Tema Personalizado
              </h2>
              <p className="text-muted-foreground mb-6">
                Diseña tu propio tema eligiendo colores personalizados
              </p>
            </div>

            <CustomThemeBuilder onThemeSaved={handleThemeChange} />
          </TabsContent>

          {/* My Custom Themes Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Layers className="h-6 w-6" />
                Mis Temas Personalizados
              </h2>
              <p className="text-muted-foreground mb-6">
                Gestiona tus temas creados
              </p>
            </div>

            <CustomThemesList key={refreshKey} onThemeDeleted={handleThemeChange} />
          </TabsContent>
        </Tabs>

        <section className="mt-16 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Gem className="h-6 w-6 text-primary" /> Colección de plantillas premium
              </h2>
              <p className="text-muted-foreground">
                Activa formatos de interfaz de nivel profesional diseñados para impresionar a tus clientes.
              </p>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              Selección 2024
            </Badge>
          </div>

          <PremiumTemplateGallery />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <PenTool className="h-6 w-6 text-primary" /> Diseña tu formato a medida
              </h2>
              <p className="text-muted-foreground">
                Personaliza gradientes, difuminados y sombras para crear plantillas exclusivas sin escribir código.
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Toolkit visual avanzado
            </Badge>
          </div>

          <CustomTemplateDesigner onTemplateSaved={() => setTemplatesRefreshKey((value) => value + 1)} />
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Layers className="h-6 w-6 text-primary" /> Mis plantillas personalizadas
            </h2>
            <p className="text-muted-foreground">
              Gestiona tu biblioteca de formatos personalizados, actívalos en un clic o elimínalos cuando ya no los necesites.
            </p>
          </div>

          <CustomTemplateCollection
            refreshKey={templatesRefreshKey}
            onTemplatesChange={() => setTemplatesRefreshKey((value) => value + 1)}
          />
        </section>

        {/* Footer Info */}
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm">
            Los temas se guardan automáticamente en tu navegador y se aplicarán en todas las páginas.
          </p>
        </div>
      </div>
    </div>
  );
}
