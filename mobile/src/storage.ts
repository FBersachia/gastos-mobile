import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultData } from './defaults';
import { AppData, AppLanguage } from './types';

const STORAGE_KEY = 'expense-control-app-data-v3';

const isAppLanguage = (value: unknown): value is AppLanguage => value === 'en' || value === 'es-AR';

const withDefaults = (stored: Partial<AppData>): AppData => {
  const defaults = createDefaultData();

  return {
    transactions: stored.transactions ?? defaults.transactions,
    categories: stored.categories?.length ? stored.categories : defaults.categories,
    subcategories: stored.subcategories?.length ? stored.subcategories : defaults.subcategories,
    paymentMethods: stored.paymentMethods?.length ? stored.paymentMethods : defaults.paymentMethods,
    paymentSubmethods: stored.paymentSubmethods?.length
      ? stored.paymentSubmethods
      : defaults.paymentSubmethods,
    budgets: stored.budgets ?? defaults.budgets,
    settings: {
      ...defaults.settings,
      ...stored.settings,
      language: isAppLanguage(stored.settings?.language) ? stored.settings.language : defaults.settings.language,
      biometricLockEnabled: true,
    },
  };
};

export const loadAppData = async (): Promise<AppData> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createDefaultData();
  }

  return withDefaults(JSON.parse(raw) as Partial<AppData>);
};

export const saveAppData = async (data: AppData): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
