"use client";

import * as React from "react";
import { LayoutGrid, Check, Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  templates,
  type TemplateDefinition,
  getActiveTemplateSelection,
  setActiveTemplateSelection,
  applyTemplateToDocument,
  toTemplateLike,
  TEMPLATE_EVENT_NAME,
} from "@/lib/templates";
import { getCustomTemplates, type CustomTemplate } from "@/lib/custom-templates";

interface TemplateCardProps {
  template: TemplateDefinition | CustomTemplate;
  isActive: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isActive, onSelect }: TemplateCardProps) {
  const isCustom = 'createdAt' in template;
  const templateDef = isCustom ? null : template as TemplateDefinition;

  return (
    <div
      className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
      onClick={onSelect}
    >
      {/* Card Container */}
      <div className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-200
        ${isActive ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
      `}>
        {/* Preview */}
        <div
          className="h-32 w-full relative flex items-center justify-center"
          style={{
            background: templateDef?.preview.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Template Preview Elements */}
          <div className="relative w-full h-full p-4 flex flex-col gap-2">
            {/* Sample Card */}
            <div
              className="bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-lg"
              style={{
                borderRadius: template.variables["--layout-card-radius"],
                boxShadow: template.variables["--layout-card-shadow"],
              }}
            >
              <div className="h-2 w-16 bg-white/40 rounded-full mb-2"></div>
              <div className="h-1.5 w-24 bg-white/30 rounded-full"></div>
            </div>

            {/* Sample Button */}
            <div
              className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg w-fit shadow-md"
              style={{
                borderRadius: template.variables["--layout-button-radius"],
              }}
            >
              <div className="h-1.5 w-12 bg-white/60 rounded-full"></div>
            </div>
          </div>

          {/* Active Indicator */}
          {isActive && (
            <div className="absolute top-2 right-2 rounded-full bg-primary p-1.5 shadow-lg">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}

          {/* Custom Badge */}
          {isCustom && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Custom
              </Badge>
            </div>
          )}
        </div>

        {/* Template Info */}
        <div className="p-3 bg-card space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">
                {template.name}
              </h4>
              {templateDef && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {templateDef.tagline}
                </p>
              )}
            </div>
            {templateDef && (
              <Badge variant="outline" className="text-xs shrink-0">
                {templateDef.category}
              </Badge>
            )}
          </div>

          {/* Template Properties */}
          <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
            <span className="px-2 py-0.5 bg-muted rounded">
              Radius: {template.variables["--layout-card-radius"]}
            </span>
            <span className="px-2 py-0.5 bg-muted rounded">
              Blur: {template.variables["--layout-panel-blur"]}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Apply Template
        </span>
      </div>
    </div>
  );
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'Corporativo', label: 'Corporate' },
  { id: 'Creativo', label: 'Creative' },
  { id: 'Minimalista', label: 'Minimal' },
  { id: 'Futurista', label: 'Futuristic' },
  { id: 'Tecnológico', label: 'Tech' },
  { id: 'Luxury', label: 'Luxury' },
  { id: 'Startup', label: 'Startup' },
];

export function TemplateSelector() {
  const [mounted, setMounted] = React.useState(false);
  const [customTemplates, setCustomTemplates] = React.useState<CustomTemplate[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTemplate, setActiveTemplate] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    loadCustomTemplates();
    loadActiveTemplate();

    // Listen for template changes
    const handleTemplateChange = () => {
      loadActiveTemplate();
    };

    window.addEventListener(TEMPLATE_EVENT_NAME, handleTemplateChange);

    return () => {
      window.removeEventListener(TEMPLATE_EVENT_NAME, handleTemplateChange);
    };
  }, []);

  const loadCustomTemplates = () => {
    const temps = getCustomTemplates();
    setCustomTemplates(temps);
  };

  const loadActiveTemplate = () => {
    const selection = getActiveTemplateSelection();
    setActiveTemplate(selection.id);
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
    setActiveTemplate(template.id);
  };

  const allTemplates = [...templates, ...customTemplates];

  // Filter templates
  const filteredTemplates = allTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('tagline' in t && t.tagline?.toLowerCase().includes(searchQuery.toLowerCase()));

    const category = 'category' in t ? t.category : 'Custom';
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <LayoutGrid className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Change template"
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="sr-only">Template selector</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Template Gallery
              </DialogTitle>
              <DialogDescription>
                Choose from {allTemplates.length} premium templates
              </DialogDescription>
            </div>
            <Badge variant="outline">
              {filteredTemplates.length} templates
            </Badge>
          </div>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No templates found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isActive={activeTemplate === template.id}
                  onSelect={() => applyTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings/appearance'}
          >
            Create Custom Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
