"use client";

import * as React from "react";
import { Palette, Search, X, Heart, Sparkles, Grid3x3, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeCard } from "@/components/theme-card";
import { themes } from "@/lib/themes";
import { getCustomThemes, type CustomTheme } from "@/lib/custom-themes";
import { useRouter } from "next/navigation";

// Theme metadata
const themeMetadata: Record<string, { emoji: string; label: string; description: string; category: string }> = {
  "uns-kikaku": { emoji: "🏢", label: "UNS Kikaku", description: "Corporate official theme", category: "corporate" },
  "default-light": { emoji: "☀️", label: "Light Default", description: "Classic light theme", category: "minimal" },
  "default-dark": { emoji: "🌙", label: "Dark Default", description: "Classic dark theme", category: "minimal" },
  "ocean-blue": { emoji: "🌊", label: "Ocean Blue", description: "Calming ocean waves", category: "creative" },
  "sunset": { emoji: "🌅", label: "Sunset", description: "Warm sunset colors", category: "creative" },
  "mint-green": { emoji: "🌿", label: "Mint Green", description: "Fresh mint vibes", category: "creative" },
  "royal-purple": { emoji: "👑", label: "Royal Purple", description: "Majestic purple tones", category: "creative" },
  "industrial": { emoji: "🏭", label: "Industrial", description: "Professional steel blue", category: "corporate" },
  "vibrant-coral": { emoji: "🪸", label: "Vibrant Coral", description: "Energetic coral pink", category: "creative" },
  "forest-green": { emoji: "🌲", label: "Forest Green", description: "Natural forest tones", category: "creative" },
  "monochrome": { emoji: "⚫", label: "Monochrome", description: "Black and white elegance", category: "minimal" },
  "espresso": { emoji: "☕", label: "Espresso", description: "Warm coffee tones", category: "creative" },
};

type CategoryFilter = 'all' | 'corporate' | 'creative' | 'minimal' | 'custom';

const CATEGORY_FILTERS: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Themes', emoji: '🎨' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'creative', label: 'Creative', emoji: '✨' },
  { id: 'minimal', label: 'Minimal', emoji: '⚪' },
  { id: 'custom', label: 'Custom', emoji: '🎯' },
];

export default function ThemesPage() {
  const { theme: activeTheme, setTheme } = useTheme();
  const router = useRouter();
  const [customThemes, setCustomThemes] = React.useState<CustomTheme[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all');
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [previewTheme, setPreviewTheme] = React.useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    loadCustomThemes();
    loadFavorites();
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }
    };
  }, [previewTimeout]);

  const loadCustomThemes = () => {
    const themes = getCustomThemes();
    setCustomThemes(themes);
  };

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('theme-favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
    }
  };

  const toggleFavorite = (themeName: string) => {
    const newFavorites = favorites.includes(themeName)
      ? favorites.filter(f => f !== themeName)
      : [...favorites, themeName];

    setFavorites(newFavorites);
    localStorage.setItem('theme-favorites', JSON.stringify(newFavorites));
  };

  const startPreview = (themeName: string) => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    const timeout = setTimeout(() => {
      setPreviewTheme(themeName);
      setTheme(themeName);
    }, 500);

    setPreviewTimeout(timeout);
  };

  const cancelPreview = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }

    if (previewTheme && activeTheme !== previewTheme) {
      if (activeTheme) {
        setTheme(activeTheme);
      }
      setPreviewTheme(null);
    }
  };

  const applyTheme = (themeName: string) => {
    setTheme(themeName);
    cancelPreview();
  };

  const allThemes = [...themes, ...customThemes];

  // Filter themes
  const filteredThemes = allThemes.filter((t) => {
    const meta = themeMetadata[t.name] || {
      emoji: '🎨',
      label: t.name,
      description: 'Custom theme',
      category: 'custom',
    };

    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meta.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meta.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isCustom = !themeMetadata[t.name];
    const category = isCustom ? 'custom' : meta.category;
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort: favorites first, then alphabetically
  const sortedThemes = [...filteredThemes].sort((a, b) => {
    const aIsFav = favorites.includes(a.name);
    const bIsFav = favorites.includes(b.name);

    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;

    return a.name.localeCompare(b.name);
  });

  const favoriteThemes = sortedThemes.filter(t => favorites.includes(t.name));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Theme Gallery</h1>
          </div>
          <p className="text-lg text-white/90 mb-6">
            Explore 12 predefined color themes and create unlimited custom themes to match your brand.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Grid3x3 className="h-4 w-4 mr-1" />
              {themes.length} Predefined Themes
            </Badge>
            {customThemes.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Sparkles className="h-4 w-4 mr-1" />
                {customThemes.length} Custom Themes
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Palette className="h-4 w-4 mr-1" />
              Hover to Preview
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search themes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <Button onClick={() => router.push('/dashboard/settings/appearance')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Theme
          </Button>
        </div>

        {/* Category Filters */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {CATEGORY_FILTERS.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {cat.id === 'all'
                    ? allThemes.length
                    : cat.id === 'custom'
                    ? customThemes.length
                    : allThemes.filter(t => {
                        const meta = themeMetadata[t.name];
                        return meta && meta.category === cat.id;
                      }).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sortedThemes.length} of {allThemes.length} themes
        </span>
        {favorites.length > 0 && (
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Favorites Section */}
      {favoriteThemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <h2 className="text-2xl font-bold">Your Favorites</h2>
            <Badge>{favoriteThemes.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteThemes.slice(0, 4).map((themeOption) => (
              <ThemeCard
                key={themeOption.name}
                theme={themeOption}
                isActive={activeTheme === themeOption.name}
                isFavorite={true}
                metadata={themeMetadata[themeOption.name]}
                onPreview={() => startPreview(themeOption.name)}
                onApply={() => applyTheme(themeOption.name)}
                onToggleFavorite={() => toggleFavorite(themeOption.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Themes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h2 className="text-2xl font-bold">
            {categoryFilter === 'all' ? 'All Themes' : `${CATEGORY_FILTERS.find(c => c.id === categoryFilter)?.label} Themes`}
          </h2>
          <Badge>{sortedThemes.length}</Badge>
        </div>

        {sortedThemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Palette className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No themes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedThemes.map((themeOption) => (
              <ThemeCard
                key={themeOption.name}
                theme={themeOption}
                isActive={activeTheme === themeOption.name}
                isFavorite={favorites.includes(themeOption.name)}
                metadata={themeMetadata[themeOption.name]}
                onPreview={() => startPreview(themeOption.name)}
                onApply={() => applyTheme(themeOption.name)}
                onToggleFavorite={() => toggleFavorite(themeOption.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-12 p-6 bg-muted/50 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-3">How to Use Themes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Click</strong> to apply a theme immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Hover</strong> over a theme card to see a live preview (applies after 500ms)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Double-click</strong> the heart icon to add to favorites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span><strong>Create custom themes</strong> from the Appearance settings to match your brand</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
