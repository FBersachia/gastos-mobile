import { AppData, BudgetSummary, CategorySummary, CurrencySummary, Transaction } from './types';

export const generateId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

export const dateOnly = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const todayInput = (): Date => dateOnly(new Date());

export const dateInputFromDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const dateFromInput = (dateInput: string): Date | undefined => {
  const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return undefined;
  }

  const [, yearInput, monthInput, dayInput] = match;
  const year = Number(yearInput);
  const month = Number(monthInput);
  const day = Number(dayInput);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

export const monthStartInput = (date = new Date()): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (dateInput: Date, amount: number): Date =>
  new Date(dateInput.getFullYear(), dateInput.getMonth() + amount, dateInput.getDate());

export const shiftMonth = (dateInput: Date, amount: number): Date => addMonths(dateInput, amount);

export const getMonthParts = (dateInput: Date): { month: number; year: number } => {
  const year = dateInput.getFullYear();
  const month = dateInput.getMonth() + 1;

  return { month, year };
};

export const isInMonth = (dateInput: Date, selectedMonth: Date): boolean => {
  const item = getMonthParts(dateInput);
  const selected = getMonthParts(selectedMonth);

  return item.month === selected.month && item.year === selected.year;
};

export const monthLabel = (dateInput: Date, locale = 'en-US'): string =>
  new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(dateInput);

export const normalizeCurrency = (currency: string): string =>
  currency.trim().toUpperCase().slice(0, 3) || 'ARS';

export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

export const applyInstallmentInterest = (total: number, interestRate = 0): number => {
  const safeRate = Number.isFinite(interestRate) && interestRate > 0 ? interestRate : 0;

  return roundMoney(total * (1 + safeRate / 100));
};

export const splitInstallments = (total: number, count: number): number[] => {
  const totalCents = Math.round(total * 100);
  const base = Math.trunc(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) => {
    const cents = base + (index === count - 1 ? remainder : 0);

    return cents / 100;
  });
};

export const splitInstallmentsWithInterest = (
  total: number,
  count: number,
  interestRate = 0,
): { financedTotal: number; amounts: number[] } => {
  const financedTotal = applyInstallmentInterest(total, interestRate);

  return {
    financedTotal,
    amounts: splitInstallments(financedTotal, count),
  };
};

export const normalizeTransactionTextFields = (
  name: unknown,
  description: unknown,
): { name: string; description: string } => {
  const storedName = typeof name === 'string' ? name : undefined;
  const storedDescription = typeof description === 'string' ? description : '';

  return {
    name: storedName ?? storedDescription,
    description: storedName === undefined ? '' : storedDescription,
  };
};

export const installmentTransactionName = (
  name: string,
  installmentNumber: number,
  totalInstallments: number,
): string => `${name.trim() || 'Installment purchase'} - Installment ${installmentNumber}/${totalInstallments}`;

export const formatMoney = (amount: number, currency: string): string =>
  `${currency} ${roundMoney(amount).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const categoryName = (data: AppData, categoryId?: string): string =>
  categoryId
    ? data.categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized'
    : 'Uncategorized';

export const subcategoryName = (data: AppData, subcategoryId?: string): string =>
  subcategoryId
    ? data.subcategories.find((subcategory) => subcategory.id === subcategoryId)?.name ?? ''
    : '';

export const paymentMethodName = (data: AppData, paymentMethodId?: string): string =>
  paymentMethodId
    ? data.paymentMethods.find((method) => method.id === paymentMethodId)?.name ?? 'Payment method'
    : '';

export const paymentSubmethodName = (data: AppData, paymentSubmethodId?: string): string =>
  paymentSubmethodId
    ? data.paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId)?.name ?? ''
    : '';

export const personName = (data: AppData, personId?: string): string =>
  personId ? data.people.find((person) => person.id === personId)?.name ?? '' : '';

export const deactivateById = <T extends { id: string; active: boolean; updatedAt: Date }>(
  items: T[],
  itemId: string,
  updatedAt = new Date(),
): T[] =>
  items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          active: false,
          updatedAt,
        }
      : item,
  );

export const monthlyTransactions = (data: AppData, selectedMonth: Date): Transaction[] =>
  data.transactions
    .filter((transaction) => isInMonth(transaction.date, selectedMonth))
    .sort((left, right) => right.date.getTime() - left.date.getTime());

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

export const summarizeBudgets = (data: AppData, selectedMonth: Date): BudgetSummary[] => {
  const { month, year } = getMonthParts(selectedMonth);
  const monthTransactions = monthlyTransactions(data, selectedMonth).filter(
    (transaction) => transaction.type === 'expense',
  );

  return data.budgets
    .filter((budget) => budget.month === month && budget.year === year)
    .map((budget) => {
      const subcategory = budget.subcategoryId
        ? data.subcategories.find((item) => item.id === budget.subcategoryId)
        : undefined;
      const categoryId = subcategory?.categoryId ?? budget.categoryId;
      const requiresSubcategory = !subcategory;
      const spent = roundMoney(
        requiresSubcategory
          ? 0
          : monthTransactions
              .filter(
                (transaction) =>
                  transaction.subcategoryId === budget.subcategoryId &&
                  transaction.currency === budget.currency,
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
        categoryName: categoryName(data, categoryId),
        subcategoryName: subcategoryName(data, budget.subcategoryId),
        requiresSubcategory,
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
    'Assigned person',
    'Name',
    'Description',
    'Installment group ID',
    'Installment number',
    'Total installments',
    'Installment interest rate',
    'Installment base amount',
    'Installment financed total',
    'Created date',
    'Updated date',
  ];

  const rows = transactions.map((transaction) => [
    transaction.id,
    dateInputFromDate(transaction.date),
    transaction.type,
    transaction.amount,
    transaction.currency,
    categoryName(data, transaction.categoryId),
    subcategoryName(data, transaction.subcategoryId),
    transaction.type === 'expense' ? paymentMethodName(data, transaction.paymentMethodId) : '',
    transaction.type === 'expense' ? paymentSubmethodName(data, transaction.paymentSubmethodId) : '',
    transaction.type === 'expense' ? personName(data, transaction.assignedPersonId) : '',
    transaction.name,
    transaction.description,
    transaction.installmentGroupId,
    transaction.installmentNumber,
    transaction.totalInstallments,
    transaction.installmentInterestRate,
    transaction.installmentBaseAmount,
    transaction.installmentFinancedTotal,
    transaction.createdAt.toISOString(),
    transaction.updatedAt.toISOString(),
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
};
