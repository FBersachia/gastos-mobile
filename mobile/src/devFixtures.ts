import { dateFromInput } from './utils';
import {
  AppData,
  Budget,
  CashBox,
  Category,
  PaymentMethod,
  PaymentSubmethod,
  Person,
  Subcategory,
  Transaction,
} from './types';

type DatedPayload<T extends { createdAt: Date; updatedAt: Date }> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type TransactionPayload = Omit<Transaction, 'date' | 'createdAt' | 'updatedAt'> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

type BudgetPayload = Omit<Budget, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type DevAppDataPayload = Omit<
  AppData,
  | 'transactions'
  | 'cashBoxes'
  | 'categories'
  | 'subcategories'
  | 'paymentMethods'
  | 'paymentSubmethods'
  | 'people'
  | 'budgets'
> & {
  transactions: TransactionPayload[];
  cashBoxes: Array<DatedPayload<CashBox>>;
  categories: Array<DatedPayload<Category>>;
  subcategories: Array<DatedPayload<Subcategory>>;
  paymentMethods: Array<DatedPayload<PaymentMethod>>;
  paymentSubmethods: Array<DatedPayload<PaymentSubmethod>>;
  people: Array<DatedPayload<Person>>;
  budgets: BudgetPayload[];
};

const parseTimestamp = (value: string): Date => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid fixture timestamp: ${value}`);
  }

  return date;
};

const parseLocalDate = (value: string): Date => {
  const date = dateFromInput(value) ?? new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid fixture date: ${value}`);
  }

  return date;
};

const hydrateDatedItem = <T extends { createdAt: Date; updatedAt: Date }>(
  item: DatedPayload<T>,
): T =>
  ({
    ...item,
    createdAt: parseTimestamp(item.createdAt),
    updatedAt: parseTimestamp(item.updatedAt),
  }) as T;

export const appDataFromDevFixturePayload = (payload: DevAppDataPayload): AppData => ({
  ...payload,
  cashBoxes: payload.cashBoxes.map(hydrateDatedItem),
  categories: payload.categories.map(hydrateDatedItem),
  subcategories: payload.subcategories.map(hydrateDatedItem),
  paymentMethods: payload.paymentMethods.map(hydrateDatedItem),
  paymentSubmethods: payload.paymentSubmethods.map(hydrateDatedItem),
  people: payload.people.map(hydrateDatedItem),
  budgets: payload.budgets.map((budget) => ({
    ...budget,
    createdAt: parseTimestamp(budget.createdAt),
    updatedAt: parseTimestamp(budget.updatedAt),
  })),
  transactions: payload.transactions.map((transaction) => ({
    ...transaction,
    date: parseLocalDate(transaction.date),
    createdAt: parseTimestamp(transaction.createdAt),
    updatedAt: parseTimestamp(transaction.updatedAt),
  })),
});
