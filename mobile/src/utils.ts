import { AppData, BudgetSummary, CategorySummary, CurrencySummary, Transaction } from './types';

export const generateId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const todayInput = (): string => new Date().toISOString().slice(0, 10);

export const monthStartInput = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}-01`;
};

export const addMonths = (dateInput: string, amount: number): string => {
  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1 + amount, day);

  return date.toISOString().slice(0, 10);
};

export const shiftMonth = (dateInput: string, amount: number): string => addMonths(dateInput, amount);

export const getMonthParts = (dateInput: string): { month: number; year: number } => {
  const [year, month] = dateInput.split('-').map(Number);

  return { month, year };
};

export const isInMonth = (dateInput: string, selectedMonth: string): boolean => {
  const item = getMonthParts(dateInput);
  const selected = getMonthParts(selectedMonth);

  return item.month === selected.month && item.year === selected.year;
};

export const monthLabel = (dateInput: string, locale = 'en-US'): string => {
  const [year, month] = dateInput.split('-').map(Number);

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
};

export const normalizeCurrency = (currency: string): string =>
  currency.trim().toUpperCase().slice(0, 3) || 'ARS';

export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

export const splitInstallments = (total: number, count: number): number[] => {
  const totalCents = Math.round(total * 100);
  const base = Math.trunc(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) => {
    const cents = base + (index === count - 1 ? remainder : 0);

    return cents / 100;
  });
};

export const formatMoney = (amount: number, currency: string): string =>
  `${currency} ${roundMoney(amount).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const categoryName = (data: AppData, categoryId: string): string =>
  data.categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized';

export const subcategoryName = (data: AppData, subcategoryId?: string): string =>
  subcategoryId
    ? data.subcategories.find((subcategory) => subcategory.id === subcategoryId)?.name ?? ''
    : '';

export const paymentMethodName = (data: AppData, paymentMethodId: string): string =>
  data.paymentMethods.find((method) => method.id === paymentMethodId)?.name ?? 'Payment method';

export const paymentSubmethodName = (data: AppData, paymentSubmethodId?: string): string =>
  paymentSubmethodId
    ? data.paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId)?.name ?? ''
    : '';

export const monthlyTransactions = (data: AppData, selectedMonth: string): Transaction[] =>
  data.transactions
    .filter((transaction) => isInMonth(transaction.date, selectedMonth))
    .sort((left, right) => right.date.localeCompare(left.date));

export const summarizeByCurrency = (transactions: Transaction[]): CurrencySummary[] => {
  const byCurrency = new Map<string, CurrencySummary>();

  transactions.forEach((transaction) => {
    const current =
      byCurrency.get(transaction.currency) ??
      ({
        currency: transaction.currency,
        income: 0,
        expenses: 0,
        balance: 0,
      } satisfies CurrencySummary);

    if (transaction.type === 'income') {
      current.income += transaction.amount;
    } else {
      current.expenses += transaction.amount;
    }

    current.balance = current.income - current.expenses;
    byCurrency.set(transaction.currency, current);
  });

  return Array.from(byCurrency.values()).map((summary) => ({
    ...summary,
    income: roundMoney(summary.income),
    expenses: roundMoney(summary.expenses),
    balance: roundMoney(summary.balance),
  }));
};

export const summarizeExpensesByCategory = (
  data: AppData,
  transactions: Transaction[],
): CategorySummary[] => {
  const byCategory = new Map<string, CategorySummary>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const key = `${transaction.categoryId}-${transaction.currency}`;
      const current =
        byCategory.get(key) ??
        ({
          categoryId: transaction.categoryId,
          categoryName: categoryName(data, transaction.categoryId),
          amount: 0,
          currency: transaction.currency,
        } satisfies CategorySummary);

      current.amount += transaction.amount;
      byCategory.set(key, current);
    });

  return Array.from(byCategory.values())
    .map((summary) => ({ ...summary, amount: roundMoney(summary.amount) }))
    .sort((left, right) => right.amount - left.amount);
};

export const summarizeBudgets = (data: AppData, selectedMonth: string): BudgetSummary[] => {
  const { month, year } = getMonthParts(selectedMonth);
  const monthTransactions = monthlyTransactions(data, selectedMonth).filter(
    (transaction) => transaction.type === 'expense',
  );

  return data.budgets
    .filter((budget) => budget.month === month && budget.year === year)
    .map((budget) => {
      const spent = roundMoney(
        monthTransactions
          .filter(
            (transaction) =>
              transaction.categoryId === budget.categoryId && transaction.currency === budget.currency,
          )
          .reduce((total, transaction) => total + transaction.amount, 0),
      );
      const usage = budget.amount > 0 ? spent / budget.amount : 0;
      const status =
        usage > 1
          ? 'exceeded'
          : usage >= data.settings.budgetNearLimitThreshold
            ? 'near-limit'
            : 'available';

      return {
        budget,
        categoryName: categoryName(data, budget.categoryId),
        spent,
        usage,
        status,
      };
    });
};

const csvEscape = (value: string | number | undefined): string => {
  const raw = value === undefined ? '' : String(value);
  const escaped = raw.replaceAll('"', '""');

  return `"${escaped}"`;
};

export const transactionsToCsv = (data: AppData, transactions: Transaction[]): string => {
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Amount',
    'Currency',
    'Category',
    'Subcategory',
    'Payment method',
    'Payment submethod',
    'Description',
    'Installment group ID',
    'Installment number',
    'Total installments',
    'Created date',
    'Updated date',
  ];

  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.date,
    transaction.type,
    transaction.amount,
    transaction.currency,
    categoryName(data, transaction.categoryId),
    subcategoryName(data, transaction.subcategoryId),
    paymentMethodName(data, transaction.paymentMethodId),
    paymentSubmethodName(data, transaction.paymentSubmethodId),
    transaction.description,
    transaction.installmentGroupId,
    transaction.installmentNumber,
    transaction.totalInstallments,
    transaction.createdAt,
    transaction.updatedAt,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
};
