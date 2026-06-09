import { describe, expect, it } from 'vitest';

import {
  verifyInAppPurchaseData,
  verifySubscriptionData,
} from './premium.js';

describe('premium verification helpers', () => {
  it('accepts an active lifetime purchase', () => {
    expect(verifyInAppPurchaseData('premium_lifetime', { purchaseState: 0 })).toEqual({
      active: true,
      productId: 'premium_lifetime',
      productType: 'inapp',
    });
  });

  it('rejects a cancelled or refunded lifetime purchase', () => {
    expect(verifyInAppPurchaseData('premium_lifetime', { purchaseState: 1 })).toEqual({
      active: false,
      productId: 'premium_lifetime',
      productType: 'inapp',
      reason: 'purchase-not-active',
    });
  });

  it('accepts an active subscription and returns its expiry', () => {
    const expiresAt = '2030-01-01T00:00:00Z';

    expect(
      verifySubscriptionData('premium_monthly', {
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
        lineItems: [{ productId: 'premium_monthly', expiryTime: expiresAt }],
      }),
    ).toEqual({
      active: true,
      productId: 'premium_monthly',
      productType: 'subs',
      expiresAt,
    });
  });

  it('rejects an expired subscription', () => {
    const expiresAt = '2026-01-01T00:00:00Z';

    expect(
      verifySubscriptionData(
        'premium_yearly',
        {
          subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
          lineItems: [{ productId: 'premium_yearly', expiryTime: expiresAt }],
        },
        new Date('2026-06-09T00:00:00Z'),
      ),
    ).toEqual({
      active: false,
      productId: 'premium_yearly',
      productType: 'subs',
      expiresAt,
      reason: 'subscription-expired',
    });
  });

  it('rejects a subscription token for a different premium product', () => {
    expect(
      verifySubscriptionData('premium_monthly', {
        subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
        lineItems: [{ productId: 'premium_yearly', expiryTime: '2030-01-01T00:00:00Z' }],
      }),
    ).toEqual({
      active: false,
      productId: 'premium_monthly',
      productType: 'subs',
      reason: 'product-mismatch',
    });
  });
});
