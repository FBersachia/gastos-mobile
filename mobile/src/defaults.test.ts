import { describe, expect, it } from 'vitest';

import { createDefaultData } from './defaults';

describe('default app data', () => {
  it('starts new builds with clean user-entered data', () => {
    const data = createDefaultData();

    expect(data.transactions).toHaveLength(0);
    expect(data.budgets).toHaveLength(0);
  });

  it('keeps required catalogs and settings available on first run', () => {
    const data = createDefaultData();

    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.cashBoxes.map((cashBox) => cashBox.id)).toEqual([
      'cashbox-basic',
      'cashbox-fun',
      'cashbox-education',
      'cashbox-savings',
      'cashbox-investment',
      'cashbox-charity',
    ]);
    expect(data.categories.find((category) => category.id === 'cat-exp-food')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-entertainment')?.cashBoxId).toBe('cashbox-fun');
    expect(data.categories.find((category) => category.id === 'cat-exp-shopping')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-education')?.cashBoxId).toBe('cashbox-education');
    expect(data.categories.find((category) => category.id === 'cat-exp-sports')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-savings')?.cashBoxId).toBe('cashbox-savings');
    expect(data.categories.find((category) => category.id === 'cat-exp-investment')?.cashBoxId).toBe('cashbox-investment');
    expect(data.categories.find((category) => category.id === 'cat-exp-charity')?.cashBoxId).toBe('cashbox-charity');
    expect(data.subcategories.length).toBeGreaterThan(0);
    expect(data.paymentMethods.length).toBeGreaterThan(0);
    expect(data.paymentSubmethods.length).toBeGreaterThan(0);
    expect(data.settings.defaultCurrency).toBe('ARS');
    expect(data.settings.defaultPaymentSubmethodId).toBeTruthy();
    expect(data.settings.themeMode).toBe('light');
    expect(data.settings.premiumEntitlement).toEqual({ active: false });
  });
});
