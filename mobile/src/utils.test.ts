import { describe, expect, it } from 'vitest';

import type { AppData, PaymentMethod, PaymentSubmethod, Subcategory } from './types';
import {
  deactivateById,
  installmentTransactionName,
  normalizeTransactionTextFields,
  paymentMethodName,
  paymentSubmethodName,
  splitInstallmentsWithInterest,
  subcategoryName,
  transactionsToCsv,
} from './utils';

const timestamp = new Date('2026-05-28T12:00:00.000Z');
const movementDate = new Date(2026, 4, 28);

const baseData = (): AppData => ({
  transactions: [],
  categories: [
    {
      id: 'cat-food',
      name: 'Food',
      type: 'expense',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  subcategories: [
    {
      id: 'sub-groceries',
      categoryId: 'cat-food',
      name: 'Groceries',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  paymentMethods: [
    {
      id: 'pay-card',
      name: 'Credit Card',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  paymentSubmethods: [
    {
      id: 'subpay-visa',
      paymentMethodId: 'pay-card',
      name: 'Visa',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  people: [
    {
      id: 'person-friend',
      name: 'Friend',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  budgets: [],
  settings: {
    defaultCurrency: 'ARS',
    defaultPaymentSubmethodId: 'subpay-visa',
    language: 'en',
    biometricLockEnabled: false,
    budgetNearLimitThreshold: 0.8,
  },
});

describe('installment helpers', () => {
  it('applies a total interest rate before splitting installments', () => {
    const result = splitInstallmentsWithInterest(1000, 3, 10);

    expect(result.financedTotal).toBe(1100);
    expect(result.amounts).toEqual([366.66, 366.66, 366.68]);
  });

  it('uses the transaction name when generating installment names', () => {
    expect(installmentTransactionName('Laptop', 2, 6)).toBe('Laptop - Installment 2/6');
  });
});

describe('transaction text migration', () => {
  it('moves legacy descriptions into the transaction name', () => {
    expect(normalizeTransactionTextFields(undefined, 'Legacy memo')).toEqual({
      name: 'Legacy memo',
      description: '',
    });
  });

  it('keeps separated name and description when name already exists', () => {
    expect(normalizeTransactionTextFields('Dinner', 'With clients')).toEqual({
      name: 'Dinner',
      description: 'With clients',
    });
  });
});

describe('soft delete helpers', () => {
  it('deactivates payment entities without losing historical names', () => {
    const data = baseData();
    const updatedAt = new Date('2026-05-29T12:00:00.000Z');
    const paymentMethods = deactivateById<PaymentMethod>(data.paymentMethods, 'pay-card', updatedAt);
    const paymentSubmethods = deactivateById<PaymentSubmethod>(
      data.paymentSubmethods,
      'subpay-visa',
      updatedAt,
    );

    expect(paymentMethods[0]).toMatchObject({ id: 'pay-card', active: false, updatedAt });
    expect(paymentSubmethods[0]).toMatchObject({ id: 'subpay-visa', active: false, updatedAt });
    expect(paymentMethodName({ ...data, paymentMethods }, 'pay-card')).toBe('Credit Card');
    expect(paymentSubmethodName({ ...data, paymentSubmethods }, 'subpay-visa')).toBe('Visa');
  });

  it('keeps inactive subcategory and person references visible in historical exports', () => {
    const data = baseData();
    const subcategories = deactivateById<Subcategory>(data.subcategories, 'sub-groceries', timestamp);
    const people = deactivateById(data.people, 'person-friend', timestamp);
    const transaction = {
      id: 'trx-1',
      type: 'expense' as const,
      amount: 1500,
      currency: 'ARS',
      date: movementDate,
      categoryId: 'cat-food',
      subcategoryId: 'sub-groceries',
      paymentMethodId: 'pay-card',
      paymentSubmethodId: 'subpay-visa',
      assignedPersonId: 'person-friend',
      name: 'Groceries run',
      description: 'Shared purchase',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const exportedData = { ...data, people, subcategories, transactions: [transaction] };
    const csv = transactionsToCsv(exportedData, exportedData.transactions);

    expect(subcategoryName(exportedData, 'sub-groceries')).toBe('Groceries');
    expect(csv.split('\n')[0]).toContain('"Name","Description"');
    expect(csv).toContain('"Groceries run"');
    expect(csv).toContain('"Groceries"');
    expect(csv).toContain('"Friend"');
    expect(csv).toContain('"Shared purchase"');
  });
});
