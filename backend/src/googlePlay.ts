import { google } from 'googleapis';

import {
  GoogleInAppPurchaseData,
  GoogleSubscriptionData,
  inactivePremiumResult,
  PremiumVerificationInput,
  PremiumVerificationResult,
  premiumProductTypeForId,
  verifyInAppPurchaseData,
  verifySubscriptionData,
} from './premium.js';

const androidPublisherScope = 'https://www.googleapis.com/auth/androidpublisher';
const defaultPackageName = 'com.suats.gastoscontrol';

type AndroidPublisherClient = {
  purchases: {
    products: {
      get: (args: { packageName: string; productId: string; token: string }) => Promise<{ data: GoogleInAppPurchaseData }>;
    };
    subscriptionsv2: {
      get: (args: { packageName: string; token: string }) => Promise<{ data: GoogleSubscriptionData }>;
    };
  };
};

export type PremiumVerifier = (input: PremiumVerificationInput) => Promise<PremiumVerificationResult>;

type GoogleApiError = {
  code?: number;
  response?: {
    status?: number;
  };
};

const googleErrorStatus = (error: unknown): number | undefined => {
  const candidate = error as GoogleApiError;
  return candidate.code ?? candidate.response?.status;
};

const isInvalidPurchaseError = (error: unknown): boolean => {
  const status = googleErrorStatus(error);
  return status === 400 || status === 404;
};

export const createGooglePlayVerifier = ({
  packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME ?? defaultPackageName,
  client,
}: {
  packageName?: string;
  client?: AndroidPublisherClient;
} = {}): PremiumVerifier => {
  const androidPublisher =
    client ??
    (google.androidpublisher({
      version: 'v3',
      auth: new google.auth.GoogleAuth({ scopes: [androidPublisherScope] }),
    }) as unknown as AndroidPublisherClient);

  return async ({ productId, purchaseToken }) => {
    const productType = premiumProductTypeForId(productId);

    try {
      if (productType === 'inapp') {
        const response = await androidPublisher.purchases.products.get({
          packageName,
          productId,
          token: purchaseToken,
        });

        return verifyInAppPurchaseData(productId, response.data);
      }

      const response = await androidPublisher.purchases.subscriptionsv2.get({
        packageName,
        token: purchaseToken,
      });

      return verifySubscriptionData(productId, response.data);
    } catch (error) {
      if (isInvalidPurchaseError(error)) {
        return inactivePremiumResult(productId, 'invalid-purchase-token');
      }

      throw error;
    }
  };
};
