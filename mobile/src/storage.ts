import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultData } from './defaults';
import {
  AppData,
  AppLanguage,
  Budget,
  Category,
  PaymentMethod,
  PaymentSubmethod,
  Person,
  Subcategory,
  Transaction,
} from './types';
import {
  dateFromInput,
  dateInputFromDate,
  dateOnly,
  isValidDate,
  normalizeTransactionTextFields,
  todayInput,
} from './utils';

const STORAGE_KEY = 'expense-control-app-data-v3';

const isAppLanguage = (value: unknown): value is AppLanguage => value === 'en' || value === 'es-AR';

type StoredCategory = Omit<Category, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredSubcategory = Omit<Subcategory, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredPaymentMethod = Omit<PaymentMethod, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredPaymentSubmethod = Omit<PaymentSubmethod, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredPerson = Omit<Person, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredTransaction = Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
  date?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredBudget = Omit<Budget, 'createdAt' | 'updatedAt'> & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

type StoredAppData = Partial<
  Omit<
    AppData,
    | 'transactions'
    | 'categories'
    | 'subcategories'
    | 'paymentMethods'
    | 'paymentSubmethods'
    | 'people'
    | 'budgets'
  > & {
    transactions: StoredTransaction[];
    categories: StoredCategory[];
    subcategories: StoredSubcategory[];
    paymentMethods: StoredPaymentMethod[];
    paymentSubmethods: StoredPaymentSubmethod[];
    people: StoredPerson[];
    budgets: StoredBudget[];
  }
>;

const cloneDate = (date: Date): Date => new Date(date.getTime());

const asArray = <T>(value: T[] | undefined): T[] | undefined => (Array.isArray(value) ? value : undefined);

const hydrateAuditDate = (value: unknown, fallback: Date): Date => {
  if (value instanceof Date && isValidDate(value)) {
    return cloneDate(value);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);

    if (isValidDate(date)) {
      return date;
    }
  }

  return cloneDate(fallback);
};

const hydrateDateOnly = (value: unknown, fallback: Date): Date => {
  if (value instanceof Date && isValidDate(value)) {
    return dateOnly(value);
  }

  if (typeof value === 'string') {
    const inputDate = dateFromInput(value);

    if (inputDate) {
      return inputDate;
    }

    const isoDate = new Date(value);

    if (isValidDate(isoDate)) {
      return dateOnly(isoDate);
    }
  }

  if (typeof value === 'number') {
    const epochDate = new Date(value);

    if (isValidDate(epochDate)) {
      return dateOnly(epochDate);
    }
  }

  return dateOnly(fallback);
};

const hydrateCategory = (category: StoredCategory | Category): Category => {
  const fallback = new Date();

  return {
    ...category,
    createdAt: hydrateAuditDate(category.createdAt, fallback),
    updatedAt: hydrateAuditDate(category.updatedAt, fallback),
  };
};

const hydrateSubcategory = (subcategory: StoredSubcategory | Subcategory): Subcategory => {
  const fallback = new Date();

  return {
    ...subcategory,
    createdAt: hydrateAuditDate(subcategory.createdAt, fallback),
    updatedAt: hydrateAuditDate(subcategory.updatedAt, fallback),
  };
};

const hydratePaymentMethod = (method: StoredPaymentMethod | PaymentMethod): PaymentMethod => {
  const fallback = new Date();

  return {
    ...method,
    createdAt: hydrateAuditDate(method.createdAt, fallback),
    updatedAt: hydrateAuditDate(method.updatedAt, fallback),
  };
};

const hydratePaymentSubmethod = (submethod: StoredPaymentSubmethod | PaymentSubmethod): PaymentSubmethod => {
  const fallback = new Date();

  return {
    ...submethod,
    createdAt: hydrateAuditDate(submethod.createdAt, fallback),
    updatedAt: hydrateAuditDate(submethod.updatedAt, fallback),
  };
};

const hydratePerson = (person: StoredPerson | Person): Person => {
  const fallback = new Date();

  return {
    ...person,
    createdAt: hydrateAuditDate(person.createdAt, fallback),
    updatedAt: hydrateAuditDate(person.updatedAt, fallback),
  };
};

const hydrateTransaction = (transaction: StoredTransaction | Transaction): Transaction => {
  const fallback = new Date();
  const textFields = normalizeTransactionTextFields(transaction.name, transaction.description);

  return {
    ...transaction,
    ...textFields,
    date: hydrateDateOnly(transaction.date, todayInput()),
    createdAt: hydrateAuditDate(transaction.createdAt, fallback),
    updatedAt: hydrateAuditDate(transaction.updatedAt, fallback),
  };
};

const hydrateBudget = (budget: StoredBudget | Budget): Budget => {
  const fallback = new Date();

  return {
    ...budget,
    createdAt: hydrateAuditDate(budget.createdAt, fallback),
    updatedAt: hydrateAuditDate(budget.updatedAt, fallback),
  };
};

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

const normalizeBudgets = (stored: StoredAppData, defaults: AppData, subcategories: AppData['subcategories']) =>
  (asArray(stored.budgets)?.map(hydrateBudget) ?? defaults.budgets).map((budget) => {
    if (budget.subcategoryId) {
      const subcategory = subcategories.find((item) => item.id === budget.subcategoryId);

      return {
        ...budget,
        categoryId: subcategory?.categoryId ?? budget.categoryId,
      };
    }

    return budget;
  });

const withDefaults = (stored: StoredAppData): AppData => {
  const defaults = createDefaultData();
  const storedCategories = asArray(stored.categories)?.map(hydrateCategory);
  const storedSubcategories = asArray(stored.subcategories)?.map(hydrateSubcategory);
  const storedPaymentMethods = asArray(stored.paymentMethods)?.map(hydratePaymentMethod);
  const storedPaymentSubmethods = asArray(stored.paymentSubmethods)?.map(hydratePaymentSubmethod);
  const storedPeople = asArray(stored.people)?.map(hydratePerson);
  const categories = mergeMissingDefaults(storedCategories, defaults.categories);
  const subcategories = mergeMissingDefaults(storedSubcategories, defaults.subcategories);
  const normalizedCategories = deactivateDeprecatedDefaults(categories, deprecatedDefaultCategoryNames);
  const normalizedSubcategories = deactivateDeprecatedDefaults(subcategories, deprecatedDefaultSubcategoryNames);
  const paymentMethods = storedPaymentMethods?.length ? storedPaymentMethods : defaults.paymentMethods;
  const paymentSubmethods = storedPaymentSubmethods?.length
    ? storedPaymentSubmethods
    : defaults.paymentSubmethods;
  const activePaymentMethodIds = new Set(
    paymentMethods.filter((method) => method.active).map((method) => method.id),
  );
  const activeDefaultPaymentSubmethod = paymentSubmethods.find(
    (submethod) => submethod.active && activePaymentMethodIds.has(submethod.paymentMethodId),
  );
  const storedDefaultPaymentSubmethodId =
    typeof stored.settings?.defaultPaymentSubmethodId === 'string'
      ? stored.settings.defaultPaymentSubmethodId
      : undefined;
  const requestedDefaultPaymentSubmethodId =
    storedDefaultPaymentSubmethodId ?? defaults.settings.defaultPaymentSubmethodId;
  const defaultPaymentSubmethodId =
    paymentSubmethods.some(
      (submethod) =>
        submethod.id === requestedDefaultPaymentSubmethodId &&
        submethod.active &&
        activePaymentMethodIds.has(submethod.paymentMethodId),
    )
      ? requestedDefaultPaymentSubmethodId
      : activeDefaultPaymentSubmethod?.id;

  return {
    transactions: asArray(stored.transactions)?.map(hydrateTransaction) ?? defaults.transactions,
    categories: normalizedCategories,
    subcategories: normalizedSubcategories,
    paymentMethods,
    paymentSubmethods,
    people: storedPeople ?? defaults.people,
    budgets: normalizeBudgets(stored, defaults, normalizedSubcategories),
    settings: {
      ...defaults.settings,
      ...stored.settings,
      defaultPaymentSubmethodId,
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

  return withDefaults(JSON.parse(raw) as StoredAppData);
};

export const saveAppData = async (data: AppData): Promise<void> => {
  const stored = {
    ...data,
    transactions: data.transactions.map((transaction) => ({
      ...transaction,
      date: dateInputFromDate(transaction.date),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    })),
    categories: data.categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    })),
    subcategories: data.subcategories.map((subcategory) => ({
      ...subcategory,
      createdAt: subcategory.createdAt.toISOString(),
      updatedAt: subcategory.updatedAt.toISOString(),
    })),
    paymentMethods: data.paymentMethods.map((method) => ({
      ...method,
      createdAt: method.createdAt.toISOString(),
      updatedAt: method.updatedAt.toISOString(),
    })),
    paymentSubmethods: data.paymentSubmethods.map((submethod) => ({
      ...submethod,
      createdAt: submethod.createdAt.toISOString(),
      updatedAt: submethod.updatedAt.toISOString(),
    })),
    people: data.people.map((person) => ({
      ...person,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    })),
    budgets: data.budgets.map((budget) => ({
      ...budget,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    })),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};
