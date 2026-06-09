import { PremiumEntitlement, PremiumFeature, PremiumProductId, PremiumProductType, ThemeMode } from './types';

export const PREMIUM_PRODUCT_IDS: PremiumProductId[] = ['premium_lifetime', 'premium_monthly', 'premium_yearly'];

export const PREMIUM_IN_APP_PRODUCT_IDS: PremiumProductId[] = ['premium_lifetime'];

export const PREMIUM_SUBSCRIPTION_PRODUCT_IDS: PremiumProductId[] = ['premium_monthly', 'premium_yearly'];

export const DEFAULT_PREMIUM_ENTITLEMENT: PremiumEntitlement = { active: false };

export const PREMIUM_FEATURES: Record<PremiumFeature, { productIds: PremiumProductId[] }> = {
  darkMode: { productIds: PREMIUM_PRODUCT_IDS },
  cashBoxReport: { productIds: PREMIUM_PRODUCT_IDS },
  monthlyCsvExport: { productIds: PREMIUM_PRODUCT_IDS },
  monthlyPdfExport: { productIds: PREMIUM_PRODUCT_IDS },
};

export const isPremiumProductId = (value: unknown): value is PremiumProductId =>
  typeof value === 'string' && PREMIUM_PRODUCT_IDS.includes(value as PremiumProductId);

export const premiumProductTypeForId = (productId: PremiumProductId): PremiumProductType =>
  productId === 'premium_lifetime' ? 'inapp' : 'subs';

export const isPremiumProductType = (value: unknown): value is PremiumProductType =>
  value === 'inapp' || value === 'subs';

export const isPremiumActive = (entitlement?: PremiumEntitlement): boolean => {
  if (!entitlement?.active) {
    return false;
  }

  if (!entitlement.expiresAt) {
    return true;
  }

  const expiry = new Date(entitlement.expiresAt);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > Date.now();
};

export const canUsePremiumFeature = (
  entitlement: PremiumEntitlement | undefined,
  feature: PremiumFeature,
): boolean => Boolean(PREMIUM_FEATURES[feature]) && isPremiumActive(entitlement);

export const canSelectThemeMode = (
  entitlement: PremiumEntitlement | undefined,
  currentThemeMode: ThemeMode,
  requestedThemeMode: ThemeMode,
): boolean => requestedThemeMode === 'light' || currentThemeMode === 'dark' || canUsePremiumFeature(entitlement, 'darkMode');
