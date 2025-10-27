import { CUSTOM_TEMPLATE_STORAGE_KEY, type TemplateVariables } from './templates';

export interface CustomTemplate {
  id: string;
  name: string;
  variables: TemplateVariables;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = CUSTOM_TEMPLATE_STORAGE_KEY;
const MAX_CUSTOM_TEMPLATES = 12;

const generateTemplateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }

  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getMaxCustomTemplates = () => MAX_CUSTOM_TEMPLATES;

export const getCustomTemplates = (): CustomTemplate[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((template) => template && template.id && template.variables);
  } catch (error) {
    console.warn('Error reading custom templates:', error);
    return [];
  }
};

export const saveCustomTemplate = (input: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt'>): CustomTemplate => {
  if (typeof window === 'undefined') {
    throw new Error('Custom templates are only available in the browser');
  }

  const templates = getCustomTemplates();

  if (templates.length >= MAX_CUSTOM_TEMPLATES) {
    throw new Error(`Máximo ${MAX_CUSTOM_TEMPLATES} plantillas personalizadas permitidas`);
  }

  if (templates.some((template) => template.name.toLowerCase() === input.name.toLowerCase())) {
    throw new Error('Ya existe una plantilla con este nombre');
  }

  const now = new Date().toISOString();
  const template: CustomTemplate = {
    ...input,
    id: generateTemplateId(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...templates, template]));
  } catch (error) {
    console.warn('Error saving custom template:', error);
    throw new Error('No se pudo guardar la plantilla personalizada');
  }

  return template;
};

export const updateCustomTemplate = (id: string, update: Partial<Omit<CustomTemplate, 'id' | 'createdAt'>>): CustomTemplate => {
  if (typeof window === 'undefined') {
    throw new Error('Custom templates are only available in the browser');
  }

  const templates = getCustomTemplates();
  const index = templates.findIndex((template) => template.id === id);

  if (index === -1) {
    throw new Error('Plantilla no encontrada');
  }

  if (
    update.name &&
    templates.some((template) => template.id !== id && template.name.toLowerCase() === update.name?.toLowerCase())
  ) {
    throw new Error('Ya existe una plantilla con este nombre');
  }

  const updated: CustomTemplate = {
    ...templates[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };

  templates[index] = updated;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.warn('Error updating custom template:', error);
    throw new Error('No se pudo actualizar la plantilla personalizada');
  }

  return updated;
};

export const deleteCustomTemplate = (id: string): void => {
  if (typeof window === 'undefined') {
    throw new Error('Custom templates are only available in the browser');
  }

  const templates = getCustomTemplates();
  const filtered = templates.filter((template) => template.id !== id);

  if (filtered.length === templates.length) {
    throw new Error('Plantilla no encontrada');
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Error deleting custom template:', error);
    throw new Error('No se pudo eliminar la plantilla personalizada');
  }
};

export const getCustomTemplateById = (id: string): CustomTemplate | undefined => {
  return getCustomTemplates().find((template) => template.id === id);
};
