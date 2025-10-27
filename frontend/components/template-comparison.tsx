"use client";

import * as React from "react";
import { X, Check, GitCompare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplatePreview } from "./template-preview";
import { templates, type TemplateDefinition } from "@/lib/templates";

interface ComparisonSlot {
  template: TemplateDefinition | null;
}

export function TemplateComparison() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [slots, setSlots] = React.useState<ComparisonSlot[]>([
    { template: null },
    { template: null },
  ]);

  const handleTemplateSelect = (index: number, templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const newSlots = [...slots];
      newSlots[index] = { template };
      setSlots(newSlots);
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length <= 2) {
      const newSlots = [...slots];
      newSlots[index] = { template: null };
      setSlots(newSlots);
    } else {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleAddSlot = () => {
    if (slots.length < 3) {
      setSlots([...slots, { template: null }]);
    }
  };

  const allSelected = slots.every((slot) => slot.template !== null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Compare Templates
              <Badge variant="outline">{slots.length} Templates</Badge>
            </DialogTitle>
            {slots.length < 3 && (
              <Button size="sm" variant="outline" onClick={handleAddSlot}>
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Template Selectors */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}>
              {slots.map((slot, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Template {index + 1}
                    </label>
                    {slots.length > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Select
                    value={slot.template?.id || ''}
                    onValueChange={(value) => handleTemplateSelect(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Split Preview */}
            {allSelected && (
              <div className="space-y-6">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}>
                  {slots.map((slot, index) => (
                    <div key={index} className="space-y-2">
                      {slot.template && (
                        <>
                          <div className="text-center">
                            <h3 className="font-semibold">{slot.template.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {slot.template.tagline}
                            </p>
                          </div>
                          <div className="border-2 border-border rounded-lg overflow-hidden">
                            <TemplatePreview
                              template={slot.template}
                              scale={0.5}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Feature Comparison Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Feature</th>
                        {slots.map((slot, index) => (
                          <th key={index} className="p-3 text-center text-sm font-semibold">
                            {slot.template?.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Category */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Category</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <Badge variant="outline">{slot.template?.category}</Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Price */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Price</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center font-semibold text-primary">
                            {slot.template?.price}
                          </td>
                        ))}
                      </tr>

                      {/* Card Radius */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Card Radius</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {slot.template?.variables['--layout-card-radius']}
                            </code>
                          </td>
                        ))}
                      </tr>

                      {/* Button Radius */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Button Radius</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {slot.template?.variables['--layout-button-radius']}
                            </code>
                          </td>
                        ))}
                      </tr>

                      {/* Panel Blur */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Panel Blur</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {slot.template?.variables['--layout-panel-blur']}
                            </code>
                          </td>
                        ))}
                      </tr>

                      {/* Heading Font */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Heading Font</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center text-sm">
                            {slot.template?.fonts.heading}
                          </td>
                        ))}
                      </tr>

                      {/* Body Font */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Body Font</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center text-sm">
                            {slot.template?.fonts.body}
                          </td>
                        ))}
                      </tr>

                      {/* Primary Color */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Primary Color</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className="h-6 w-6 rounded border-2 border-border"
                                style={{ backgroundColor: slot.template?.palette.primary }}
                              />
                              <code className="text-xs">{slot.template?.palette.primary}</code>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Features Count */}
                      <tr>
                        <td className="p-3 text-sm font-medium">Features</td>
                        {slots.map((slot, index) => (
                          <td key={index} className="p-3 text-center">
                            <Badge variant="secondary">
                              {slot.template?.features.length} features
                            </Badge>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Color Palette Comparison */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Color Palettes</h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}>
                    {slots.map((slot, index) => (
                      <div key={index} className="space-y-2">
                        {slot.template && (
                          <div className="p-4 border rounded-lg space-y-2">
                            {Object.entries(slot.template.palette).map(([key, color]) => (
                              <div key={key} className="flex items-center gap-2">
                                <div
                                  className="h-8 w-8 rounded border-2 border-border shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium capitalize">{key}</div>
                                  <code className="text-[10px] text-muted-foreground">{color}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!allSelected && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Select templates to compare side by side
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
