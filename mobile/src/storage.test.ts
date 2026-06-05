import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDefaultData } from './defaults';
import { loadAppData, saveAppData } from './storage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

const mockedAsyncStorage = vi.mocked(AsyncStorage);

describe('app data storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads clean defaults when no persisted data exists', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const data = await loadAppData();

    expect(data.transactions).toHaveLength(0);
    expect(data.budgets).toHaveLength(0);
    expect(data.cashBoxes).toHaveLength(6);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.paymentMethods.length).toBeGreaterThan(0);
  });

  it('restores default cash boxes for legacy persisted categories', async () => {
    const defaultData = createDefaultData();
    const { cashBoxes: _cashBoxes, ...legacyData } = defaultData;

    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        ...legacyData,
        categories: legacyData.categories.map(({ cashBoxId: _cashBoxId, ...category }) => category),
      }),
    );

    const data = await loadAppData();

    expect(data.cashBoxes.map((cashBox) => cashBox.id)).toEqual(defaultData.cashBoxes.map((cashBox) => cashBox.id));
    expect(data.categories.find((category) => category.id === 'cat-exp-food')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-shopping')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-sports')?.cashBoxId).toBe('cashbox-basic');
    expect(data.categories.find((category) => category.id === 'cat-exp-charity')?.cashBoxId).toBe('cashbox-charity');
  });

  it('preserves persisted user data instead of resetting it on load', async () => {
    const persistedData = createDefaultData();
    const transactionDate = '2026-05-29';
    const timestamp = '2026-05-29T12:00:00.000Z';
    const category = persistedData.categories.find((item) => item.type === 'expense') ?? persistedData.categories[0];
    const subcategory =
      persistedData.subcategories.find((item) => item.categoryId === category.id) ?? persistedData.subcategories[0];
    const paymentSubmethod = persistedData.paymentSubmethods[0];
    const paymentMethod = persistedData.paymentMethods.find((item) => item.id === paymentSubmethod.paymentMethodId);

    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        ...persistedData,
        transactions: [
          {
            id: 'trx-user-1',
            type: 'expense',
            amount: 1234.56,
            currency: 'ARS',
            date: transactionDate,
            categoryId: category.id,
            subcategoryId: subcategory.id,
            paymentMethodId: paymentMethod?.id,
            paymentSubmethodId: paymentSubmethod.id,
            name: 'Persisted expense',
            description: 'Should survive app updates',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      }),
    );

    const data = await loadAppData();

    expect(data.transactions).toHaveLength(1);
    expect(data.transactions[0]).toMatchObject({
      id: 'trx-user-1',
      amount: 1234.56,
      name: 'Persisted expense',
      description: 'Should survive app updates',
    });
    expect(data.transactions[0].date).toBeInstanceOf(Date);
  });

  it('saves under the existing storage key used by installed apps', async () => {
    mockedAsyncStorage.setItem.mockResolvedValue();

    await saveAppData(createDefaultData());

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      'expense-control-app-data-v3',
      expect.any(String),
    );
  });
});
