/**
 * Basic tests for Google Fonts utility
 */

import {
  GOOGLE_FONTS,
  ALL_GOOGLE_FONTS,
  getFontCategory,
  ESSENTIAL_FONTS,
  FONT_PAIRINGS,
} from './googleFonts';

describe('Google Fonts Utility', () => {
  test('should have all font categories', () => {
    expect(GOOGLE_FONTS).toHaveProperty('Sans Serif');
    expect(GOOGLE_FONTS).toHaveProperty('Serif');
    expect(GOOGLE_FONTS).toHaveProperty('Monospace');
    expect(GOOGLE_FONTS).toHaveProperty('Display');
    expect(GOOGLE_FONTS).toHaveProperty('Handwriting');
  });

  test('should flatten all fonts correctly', () => {
    expect(ALL_GOOGLE_FONTS.length).toBeGreaterThan(40);
    expect(ALL_GOOGLE_FONTS).toContain('Inter');
    expect(ALL_GOOGLE_FONTS).toContain('Roboto');
    expect(ALL_GOOGLE_FONTS).toContain('Montserrat');
  });

  test('should get font category correctly', () => {
    expect(getFontCategory('Inter')).toBe('Sans Serif');
    expect(getFontCategory('Playfair Display')).toBe('Serif');
    expect(getFontCategory('Roboto Mono')).toBe('Monospace');
    expect(getFontCategory('NonExistentFont')).toBeNull();
  });

  test('should have essential fonts defined', () => {
    expect(ESSENTIAL_FONTS.length).toBeGreaterThan(0);
    expect(ESSENTIAL_FONTS).toContain('Inter');
  });

  test('should have font pairings', () => {
    expect(FONT_PAIRINGS.length).toBeGreaterThan(0);
    expect(FONT_PAIRINGS[0]).toHaveProperty('name');
    expect(FONT_PAIRINGS[0]).toHaveProperty('heading');
    expect(FONT_PAIRINGS[0]).toHaveProperty('body');
  });
});
