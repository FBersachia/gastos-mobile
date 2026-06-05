import { describe, expect, it } from 'vitest';

import { darkColors, getThemeColors, lightColors } from './theme';

describe('theme palette resolution', () => {
  it('resolves light and dark palettes by manual theme mode', () => {
    expect(getThemeColors('light')).toBe(lightColors);
    expect(getThemeColors('dark')).toBe(darkColors);
  });
});
