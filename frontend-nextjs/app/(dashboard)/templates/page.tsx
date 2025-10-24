"use client";

import * as React from "react";
import {
  LayoutGrid,
  Search,
  X,
  SlidersHorizontal,
  Heart,
  TrendingUp,
  Sparkles,
  Grid3x3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCard } from "@/components/template-card";
import { TemplateDetailModal } from "@/components/template-detail-modal";
import {
  templates,
  type TemplateDefinition,
  setActiveTemplateSelection,
  applyTemplateToDocument,
  toTemplateLike,
} from "@/lib/templates";
import { getCustomTemplates, type CustomTemplate } from "@/lib/custom-templates";

type CategoryFilter = 'all' | 'Corporativo' | 'Creativo' | 'Minimalista' | 'Futurista' | 'Tecnológico' | 'Luxury' | 'Startup' | 'Inmersivo' | 'Editorial' | 'Experimental' | 'Landing Page';
type SortOption = 'name' | 'category' | 'price' | 'popular';

const CATEGORY_FILTERS: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Templates', emoji: '🎨' },
  { id: 'Corporativo', label: 'Corporate', emoji: '🏢' },
  { id: 'Creativo', label: 'Creative', emoji: '✨' },
  { id: 'Minimalista', label: 'Minimal', emoji: '⚪' },
  { id: 'Futurista', label: 'Futuristic', emoji: '🚀' },
  { id: 'Tecnológico', label: 'Tech', emoji: '💻' },
  { id: 'Luxury', label: 'Luxury', emoji: '👑' },
  { id: 'Startup', label: 'Startup', emoji: '⚡' },
];

const FEATURED_TEMPLATES = ['tokyo-neon-grid', 'gradient-mesh-futurism', 'holographic-iridescent'];

export default function TemplatesPage() {
  const [customTemplates, setCustomTemplates] = React.useState<CustomTemplate[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('name');
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    loadCustomTemplates();
    loadFavorites();
  }, []);

  const loadCustomTemplates = () => {
    const temps = getCustomTemplates();
    setCustomTemplates(temps);
  };

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('template-favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
    }
  };

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(f => f !== templateId)
      : [...favorites, templateId];

    setFavorites(newFavorites);
    localStorage.setItem('template-favorites', JSON.stringify(newFavorites));
  };

  const applyTemplate = (template: TemplateDefinition | CustomTemplate) => {
    const templateLike = 'category' in template
      ? toTemplateLike(template)
      : { ...template, isCustom: true };

    const selection = {
      type: 'category' in template ? ('preset' as const) : ('custom' as const),
      id: template.id,
    };

    setActiveTemplateSelection(selection);
    applyTemplateToDocument(templateLike);
  };

  const openPreview = (template: TemplateDefinition) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const allTemplates = [...templates, ...customTemplates];

  // Filter templates
  const filteredTemplates = allTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('tagline' in t && t.tagline?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ('description' in t && t.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    const category = 'category' in t ? t.category : 'Custom';
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        const catA = 'category' in a ? a.category : 'Custom';
        const catB = 'category' in b ? b.category : 'Custom';
        return catA.localeCompare(catB);
      case 'price':
        const priceA = 'price' in a ? parseInt(a.price.replace(/\D/g, '')) : 0;
        const priceB = 'price' in b ? parseInt(b.price.replace(/\D/g, '')) : 0;
        return priceB - priceA;
      case 'popular':
        // Featured first, then favorites
        const aFeatured = FEATURED_TEMPLATES.includes(a.id) ? 1 : 0;
        const bFeatured = FEATURED_TEMPLATES.includes(b.id) ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      default:
        return 0;
    }
  });

  const favoriteTemplates = sortedTemplates.filter(t => favorites.includes(t.id));
  const featuredTemplates = templates.filter(t => FEATURED_TEMPLATES.includes(t.id));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Design Templates Gallery</h1>
          </div>
          <p className="text-lg text-white/90 mb-6">
            Choose from 17 professionally designed templates to transform your application's appearance instantly.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Sparkles className="h-4 w-4 mr-1" />
              {templates.length} Templates
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Grid3x3 className="h-4 w-4 mr-1" />
              12 Themes
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Unlimited Customization
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
              placeholder="Search templates by name, category, or features..."
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

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filters */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {CATEGORY_FILTERS.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {cat.id === 'all'
                    ? allTemplates.length
                    : allTemplates.filter(t => 'category' in t && t.category === cat.id).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sortedTemplates.length} of {allTemplates.length} templates
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/dashboard/template-builder'}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Create Custom Template
        </Button>
      </div>

      {/* Favorites Section */}
      {favoriteTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <h2 className="text-2xl font-bold">Your Favorites</h2>
            <Badge>{favoriteTemplates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteTemplates.slice(0, 4).map((template) => (
              'category' in template && (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isActive={false}
                  isFavorite={true}
                  onPreview={() => openPreview(template)}
                  onApply={() => applyTemplate(template)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* Featured Templates */}
      {categoryFilter === 'all' && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Featured Templates</h2>
            <Badge variant="secondary">Trending</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isActive={false}
                isFeatured={true}
                isFavorite={favorites.includes(template.id)}
                onPreview={() => openPreview(template)}
                onApply={() => applyTemplate(template)}
                onToggleFavorite={() => toggleFavorite(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <h2 className="text-2xl font-bold">
            {categoryFilter === 'all' ? 'All Templates' : `${CATEGORY_FILTERS.find(c => c.id === categoryFilter)?.label} Templates`}
          </h2>
          <Badge>{sortedTemplates.length}</Badge>
        </div>

        {sortedTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
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
            {sortedTemplates.map((template) => (
              'category' in template && (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isActive={false}
                  isFavorite={favorites.includes(template.id)}
                  onPreview={() => openPreview(template)}
                  onApply={() => applyTemplate(template)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      <TemplateDetailModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={applyTemplate}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedTemplate ? favorites.includes(selectedTemplate.id) : false}
      />
    </div>
  );
}
