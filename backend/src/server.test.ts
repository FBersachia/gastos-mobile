import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './server.js';
import { PremiumVerifier } from './googlePlay.js';

describe('premium backend API', () => {
  it('responds to health checks', async () => {
    const app = createApp(vi.fn() as PremiumVerifier);

    await request(app).get('/health').expect(200, { ok: true });
  });

  it('verifies an active lifetime purchase', async () => {
    const verifier = vi.fn<PremiumVerifier>().mockResolvedValue({
      active: true,
      productId: 'premium_lifetime',
      productType: 'inapp',
    });
    const app = createApp(verifier);

    await request(app)
      .post('/v1/google-play/verify')
      .send({ productId: 'premium_lifetime', purchaseToken: 'token-123' })
      .expect(200, {
        active: true,
        productId: 'premium_lifetime',
        productType: 'inapp',
      });

    expect(verifier).toHaveBeenCalledWith({ productId: 'premium_lifetime', purchaseToken: 'token-123' });
  });

  it('rejects unsupported product ids', async () => {
    const verifier = vi.fn<PremiumVerifier>();
    const app = createApp(verifier);

    await request(app)
      .post('/v1/google-play/verify')
      .send({ productId: 'not_premium', purchaseToken: 'token-123' })
      .expect(400, { active: false, reason: 'unsupported-product' });

    expect(verifier).not.toHaveBeenCalled();
  });

  it('rejects missing purchase tokens', async () => {
    const verifier = vi.fn<PremiumVerifier>();
    const app = createApp(verifier);

    await request(app)
      .post('/v1/google-play/verify')
      .send({ productId: 'premium_monthly' })
      .expect(400, {
        active: false,
        productId: 'premium_monthly',
        productType: 'subs',
        reason: 'missing-purchase-token',
      });

    expect(verifier).not.toHaveBeenCalled();
  });

  it('returns inactive when the verifier reports an invalid token', async () => {
    const verifier = vi.fn<PremiumVerifier>().mockResolvedValue({
      active: false,
      productId: 'premium_lifetime',
      productType: 'inapp',
      reason: 'invalid-purchase-token',
    });
    const app = createApp(verifier);

    await request(app)
      .post('/v1/google-play/verify')
      .send({ productId: 'premium_lifetime', purchaseToken: 'bad-token' })
      .expect(200, {
        active: false,
        productId: 'premium_lifetime',
        productType: 'inapp',
        reason: 'invalid-purchase-token',
      });
  });

  it('does not leak tokens on verifier failures', async () => {
    const verifier = vi.fn<PremiumVerifier>().mockRejectedValue(new Error('google failed'));
    const app = createApp(verifier);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      await request(app)
        .post('/v1/google-play/verify')
        .send({ productId: 'premium_yearly', purchaseToken: 'secret-token' })
        .expect(502, {
          active: false,
          productId: 'premium_yearly',
          productType: 'subs',
          reason: 'verification-error',
        });

      expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret-token');
    } finally {
      consoleError.mockRestore();
    }
  });
});
