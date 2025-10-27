"use client";

import { useEffect } from 'react';
import {
  TEMPLATE_EVENT_NAME,
  TEMPLATE_STORAGE_KEY,
  CUSTOM_TEMPLATE_STORAGE_KEY,
  applyTemplateToDocument,
  getActiveTemplateSelection,
  getDefaultTemplate,
  getTemplateById,
  setActiveTemplateSelection,
  toTemplateLike,
  type TemplateLike,
  type TemplateSelection,
} from '@/lib/templates';
import { getCustomTemplateById } from '@/lib/custom-templates';

const resolveTemplate = (selection: TemplateSelection): TemplateLike | undefined => {
  if (selection.type === 'preset') {
    const template = getTemplateById(selection.id);
    return template ? toTemplateLike(template) : undefined;
  }

  const customTemplate = getCustomTemplateById(selection.id);
  if (customTemplate) {
    return { ...customTemplate, isCustom: true };
  }

  return undefined;
};

export function TemplateManager() {
  useEffect(() => {
    const applyActiveTemplate = () => {
      try {
        const selection = getActiveTemplateSelection();
        const template = resolveTemplate(selection) ?? toTemplateLike(getDefaultTemplate());

        if (!template) {
          return;
        }

        applyTemplateToDocument(template);
      } catch (error) {
        console.warn('Error applying template:', error);
      }
    };

    const ensureValidSelection = () => {
      const selection = getActiveTemplateSelection();
      const template = resolveTemplate(selection);

      if (!template) {
        const fallback = getDefaultTemplate();
        setActiveTemplateSelection({ type: 'preset', id: fallback.id });
        applyTemplateToDocument(toTemplateLike(fallback));
        return false;
      }

      return true;
    };

    ensureValidSelection();
    applyActiveTemplate();

    const handleTemplateChange = () => {
      if (ensureValidSelection()) {
        applyActiveTemplate();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TEMPLATE_STORAGE_KEY || event.key === CUSTOM_TEMPLATE_STORAGE_KEY) {
        handleTemplateChange();
      }
    };

    window.addEventListener(TEMPLATE_EVENT_NAME, handleTemplateChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(TEMPLATE_EVENT_NAME, handleTemplateChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}
