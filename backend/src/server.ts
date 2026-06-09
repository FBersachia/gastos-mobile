import express from 'express';

import { createGooglePlayVerifier, PremiumVerifier } from './googlePlay.js';
import { inactivePremiumResult, isPremiumProductId, premiumProductTypeForId } from './premium.js';

const sanitizeVerificationError = (error: unknown): { message: string; status?: number } => {
  const candidate = error as { message?: string; code?: number; response?: { status?: number } };

  return {
    message: candidate.message ?? 'Unknown Google Play verification error',
    status: candidate.code ?? candidate.response?.status,
  };
};

export const createApp = (verifier: PremiumVerifier = createGooglePlayVerifier()) => {
  const app = express();

  app.use(express.json({ limit: '16kb' }));

  app.get('/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.post('/v1/google-play/verify', async (request, response) => {
    const body = request.body as { productId?: unknown; purchaseToken?: unknown };

    if (!isPremiumProductId(body.productId)) {
      response.status(400).json({ active: false, reason: 'unsupported-product' });
      return;
    }

    if (typeof body.purchaseToken !== 'string' || body.purchaseToken.trim().length === 0) {
      response.status(400).json(inactivePremiumResult(body.productId, 'missing-purchase-token'));
      return;
    }

    try {
      const result = await verifier({
        productId: body.productId,
        purchaseToken: body.purchaseToken.trim(),
      });

      response.json(result);
    } catch (error) {
      console.error('Google Play verification failed', sanitizeVerificationError(error));
      response.status(502).json({
        active: false,
        productId: body.productId,
        productType: premiumProductTypeForId(body.productId),
        reason: 'verification-error',
      });
    }
  });

  return app;
};
