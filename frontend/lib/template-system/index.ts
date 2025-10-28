/**
 * Template System Module
 *
 * Centralized barrel export for all template-related utilities.
 * This module provides:
 * - Predefined templates (templates.ts)
 * - Custom template creation (custom-templates.ts)
 * - Template export/import (template-export.ts)
 *
 * Usage:
 * ```typescript
 * import { templates, createCustomTemplate, exportTemplate } from '@/lib/template-system';
 * ```
 */

// Predefined templates and types
export * from '../templates';

// Custom template creation and management
export * from '../custom-templates';

// Template export/import utilities
export * from '../template-export';
