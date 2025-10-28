/**
 * Theme System Module
 *
 * Centralized barrel export for all theme-related utilities.
 * This module provides:
 * - Predefined themes (themes.ts)
 * - Custom theme management (custom-themes.ts)
 * - Theme utilities and helpers (theme-utils.ts)
 *
 * Usage:
 * ```typescript
 * import { themes, getCustomThemes, applyTheme } from '@/lib/theme-system';
 * ```
 */

// Predefined themes (12 built-in themes)
export * from '../themes';

// Custom theme creation and management
export * from '../custom-themes';

// Theme utilities (apply, validate, etc.)
export * from '../theme-utils';
