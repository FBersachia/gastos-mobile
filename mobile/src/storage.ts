import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultData } from './defaults';
import { AppData, AppLanguage } from './types';

const STORAGE_KEY = 'expense-control-app-data-v3';

const isAppLanguage = (value: unknown): value is AppLanguage => value === 'en' || value === 'es-AR';

const deprecatedDefaultCategoryNames: Record<string, string> = {
  'cat-exp-subscriptions': 'Subscriptions',
};

const deprecatedDefaultSubcategoryNames: Record<string, string> = {
  'sub-food-bakery': 'Bakery',
  'sub-subscriptions-streaming': 'Streaming',
  'sub-subscriptions-marketplace': 'Marketplace',
  'sub-subscriptions-delivery': 'Delivery Plus',
  'sub-subscriptions-music': 'Music',
  'sub-subscriptions-rides': 'Ride Subscription',
  'sub-sports-soccer': 'Soccer',
  'sub-insurance-bike': 'Bike Insurance',
  'sub-personal-ana': 'Ana',
  'sub-other-cannabis': 'Cannabis',
  'sub-income-sales-marketplace': 'Marketplace Sales',
};

const mergeMissingDefaults = <T extends { id: string }>(stored: T[] | undefined, defaults: T[]): T[] => {
  if (!stored?.length) {
    return defaults;
  }

  const storedIds = new Set(stored.map((item) => item.id));
  return [...stored, ...defaults.filter((item) => !storedIds.has(item.id))];
};

const deactivateDeprecatedDefaults = <T extends { id: string; name: string; active: boolean }>(
  items: T[],
  deprecatedDefaults: Record<string, string>,
): T[] =>
  items.map((item) =>
    item.active && deprecatedDefaults[item.id] === item.name
      ? {
          ...item,
          active: false,
        }
      : item,
  );

const withDefaults = (stored: Partial<AppData>): AppData => {
  const defaults = createDefaultData();
  const categories = mergeMissingDefaults(stored.categories, defaults.categories);
  const subcategories = mergeMissingDefaults(stored.subcategories, defaults.subcategories);

  return {
    transactions: stored.transactions ?? defaults.transactions,
    categories: deactivateDeprecatedDefaults(categories, deprecatedDefaultCategoryNames),
    subcategories: deactivateDeprecatedDefaults(subcategories, deprecatedDefaultSubcategoryNames),
    paymentMethods: stored.paymentMethods?.length ? stored.paymentMethods : defaults.paymentMethods,
    paymentSubmethods: stored.paymentSubmethods?.length
      ? stored.paymentSubmethods
      : defaults.paymentSubmethods,
    budgets: stored.budgets ?? defaults.budgets,
    settings: {
      ...defaults.settings,
      ...stored.settings,
      language: isAppLanguage(stored.settings?.language) ? stored.settings.language : defaults.settings.language,
      biometricLockEnabled:
        typeof stored.settings?.biometricLockEnabled === 'boolean'
          ? stored.settings.biometricLockEnabled
          : defaults.settings.biometricLockEnabled,
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
