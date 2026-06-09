export type PremiumProductId = 'premium_lifetime' | 'premium_monthly' | 'premium_yearly';

export type PremiumProductType = 'inapp' | 'subs';

export type PremiumVerificationInput = {
  productId: PremiumProductId;
  purchaseToken: string;
};

export type PremiumVerificationResult = {
  active: boolean;
  productId: PremiumProductId;
  productType: PremiumProductType;
  expiresAt?: string;
  reason?: string;
};

export type GoogleInAppPurchaseData = {
  purchaseState?: number | null;
};

export type GoogleSubscriptionLineItem = {
  productId?: string | null;
  expiryTime?: string | null;
};

export type GoogleSubscriptionData = {
  subscriptionState?: string | null;
  lineItems?: GoogleSubscriptionLineItem[] | null;
};

const productTypes: Record<PremiumProductId, PremiumProductType> = {
  premium_lifetime: 'inapp',
  premium_monthly: 'subs',
  premium_yearly: 'subs',
};

const activeSubscriptionStates = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
]);

export const isPremiumProductId = (value: unknown): value is PremiumProductId =>
  typeof value === 'string' && value in productTypes;

export const premiumProductTypeForId = (productId: PremiumProductId): PremiumProductType => productTypes[productId];

export const inactivePremiumResult = (
  productId: PremiumProductId,
  reason: string,
  expiresAt?: string,
): PremiumVerificationResult => ({
  active: false,
  productId,
  productType: premiumProductTypeForId(productId),
  ...(expiresAt ? { expiresAt } : {}),
  reason,
});

export const verifyInAppPurchaseData = (
  productId: PremiumProductId,
  data: GoogleInAppPurchaseData,
): PremiumVerificationResult => {
  if (premiumProductTypeForId(productId) !== 'inapp') {
    return inactivePremiumResult(productId, 'product-type-mismatch');
  }

  if (data.purchaseState !== 0) {
    return inactivePremiumResult(productId, 'purchase-not-active');
  }

  return {
    active: true,
    productId,
    productType: 'inapp',
  };
};

export const verifySubscriptionData = (
  productId: PremiumProductId,
  data: GoogleSubscriptionData,
  now = new Date(),
): PremiumVerificationResult => {
  if (premiumProductTypeForId(productId) !== 'subs') {
    return inactivePremiumResult(productId, 'product-type-mismatch');
  }

  const lineItems = data.lineItems ?? [];
  const matchingLineItem = lineItems.find((lineItem) => lineItem.productId === productId);

  if (lineItems.length > 0 && !matchingLineItem) {
    return inactivePremiumResult(productId, 'product-mismatch');
  }

  const expiresAt = matchingLineItem?.expiryTime ?? lineItems[0]?.expiryTime ?? undefined;
  const expiryTime = expiresAt ? new Date(expiresAt).getTime() : undefined;

  if (expiryTime && expiryTime <= now.getTime()) {
    return inactivePremiumResult(productId, 'subscription-expired', expiresAt);
  }

  if (!activeSubscriptionStates.has(data.subscriptionState ?? '')) {
    return inactivePremiumResult(productId, 'subscription-not-active', expiresAt);
  }

  return {
    active: true,
    productId,
    productType: 'subs',
    ...(expiresAt ? { expiresAt } : {}),
  };
};
