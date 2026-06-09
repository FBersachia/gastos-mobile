import { describe, expect, it } from 'vitest';

import {
  canSelectThemeMode,
  canUsePremiumFeature,
  DEFAULT_PREMIUM_ENTITLEMENT,
  premiumProductTypeForId,
} from './premium';

describe('premium gating', () => {
  it('blocks premium features for inactive entitlements', () => {
    expect(canUsePremiumFeature(DEFAULT_PREMIUM_ENTITLEMENT, 'cashBoxReport')).toBe(false);
    expect(canUsePremiumFeature({ active: true, productId: 'premium_lifetime', productType: 'inapp' }, 'cashBoxReport')).toBe(true);
  });

  it('respects existing dark theme for non-premium users but blocks reactivation from light', () => {
    expect(canSelectThemeMode(DEFAULT_PREMIUM_ENTITLEMENT, 'dark', 'dark')).toBe(true);
    expect(canSelectThemeMode(DEFAULT_PREMIUM_ENTITLEMENT, 'dark', 'light')).toBe(true);
    expect(canSelectThemeMode(DEFAULT_PREMIUM_ENTITLEMENT, 'light', 'dark')).toBe(false);
  });

  it('allows premium users to select dark mode from light', () => {
    expect(canSelectThemeMode({ active: true, productId: 'premium_monthly', productType: 'subs' }, 'light', 'dark')).toBe(true);
  });

  it('maps product ids to Google Play product types', () => {
    expect(premiumProductTypeForId('premium_lifetime')).toBe('inapp');
    expect(premiumProductTypeForId('premium_monthly')).toBe('subs');
    expect(premiumProductTypeForId('premium_yearly')).toBe('subs');
  });
});
