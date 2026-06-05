import {
  AppData,
  AppLanguage,
  BudgetSummary,
  CashBoxSummary,
  CategorySummary,
  CurrencySummary,
  PersonSummary,
  Transaction,
} from './types';

type LocalizedDefaultName = Record<AppLanguage, string>;

const defaultCategoryNames: Record<string, LocalizedDefaultName> = {
  'cat-exp-food': { en: 'Food', 'es-AR': 'Comida' },
  'cat-exp-transport': { en: 'Transport', 'es-AR': 'Transporte' },
  'cat-exp-housing': { en: 'Housing', 'es-AR': 'Hogar' },
  'cat-exp-services': { en: 'Services', 'es-AR': 'Servicios' },
  'cat-exp-health': { en: 'Health', 'es-AR': 'Salud' },
  'cat-exp-entertainment': { en: 'Entertainment', 'es-AR': 'Entretenimiento' },
  'cat-exp-shopping': { en: 'Shopping', 'es-AR': 'Compras' },
  'cat-exp-education': { en: 'Education', 'es-AR': 'Educacion' },
  'cat-exp-sports': { en: 'Sports', 'es-AR': 'Deporte' },
  'cat-exp-insurance': { en: 'Insurance', 'es-AR': 'Seguros' },
  'cat-exp-pets': { en: 'Pets', 'es-AR': 'Mascotas' },
  'cat-exp-personal': { en: 'Personal', 'es-AR': 'Personal' },
  'cat-exp-savings': { en: 'Savings', 'es-AR': 'Ahorro' },
  'cat-exp-investment': { en: 'Investment', 'es-AR': 'Inversion' },
  'cat-exp-charity': { en: 'Charity', 'es-AR': 'Caridad' },
  'cat-exp-other': { en: 'Other', 'es-AR': 'Otros' },
  'cat-inc-salary': { en: 'Salary', 'es-AR': 'Salario' },
  'cat-inc-freelance': { en: 'Freelance', 'es-AR': 'Prestaciones' },
  'cat-inc-sales': { en: 'Sales', 'es-AR': 'Ventas' },
  'cat-inc-refunds': { en: 'Refunds', 'es-AR': 'Reembolsos' },
  'cat-inc-other': { en: 'Other', 'es-AR': 'Otros' },
};

const defaultCashBoxNames: Record<string, LocalizedDefaultName> = {
  'cashbox-basic': { en: 'Basic', 'es-AR': 'Basico' },
  'cashbox-fun': { en: 'Fun', 'es-AR': 'Diversion' },
  'cashbox-education': { en: 'Education', 'es-AR': 'Educacion' },
  'cashbox-savings': { en: 'Savings', 'es-AR': 'Ahorro' },
  'cashbox-investment': { en: 'Investment', 'es-AR': 'Inversion' },
  'cashbox-charity': { en: 'Charity', 'es-AR': 'Caridad' },
};

const defaultSubcategoryNames: Record<string, LocalizedDefaultName> = {
  'sub-food-groceries': { en: 'Groceries', 'es-AR': 'Mercado' },
  'sub-food-delivery': { en: 'Delivery', 'es-AR': 'Delivery' },
  'sub-food-breakfast': { en: 'Breakfast', 'es-AR': 'Desayuno' },
  'sub-food-lunch': { en: 'Lunch', 'es-AR': 'Almuerzo' },
  'sub-food-dinner': { en: 'Dinner', 'es-AR': 'Cena' },
  'sub-food-snacks': { en: 'Snacks', 'es-AR': 'Aperitivos' },
  'sub-food-burgers': { en: 'Burgers', 'es-AR': 'Hamburguesas' },
  'sub-food-beverages': { en: 'Beverages', 'es-AR': 'Bebidas' },
  'sub-food-drinks': { en: 'Drinks', 'es-AR': 'Tragos' },
  'sub-food-cravings': { en: 'Cravings', 'es-AR': 'Bajon' },
  'sub-transport-rides': { en: 'Rides', 'es-AR': 'Auto' },
  'sub-transport-public-transit': { en: 'Public Transit', 'es-AR': 'Transporte publico' },
  'sub-housing-home-goods': { en: 'Home Goods', 'es-AR': 'Insumos hogar' },
  'sub-housing-repairments': { en: 'Repairments', 'es-AR': 'Arreglos' },
  'sub-services-mobile-phone': { en: 'Mobile Phone', 'es-AR': 'Celular' },
  'sub-services-subscriptions': { en: 'Subscriptions', 'es-AR': 'Suscripciones' },
  'sub-health-personal-care': { en: 'Personal Care', 'es-AR': 'Cuidado Personal' },
  'sub-health-hospital': { en: 'Hospital', 'es-AR': 'Hospital' },
  'sub-health-meds': { en: 'Meds', 'es-AR': 'Medicacion' },
  'sub-entertainment-movies': { en: 'Movies', 'es-AR': 'Cine' },
  'sub-entertainment-games': { en: 'Games', 'es-AR': 'Juegos' },
  'sub-entertainment-concerts': { en: 'Concerts', 'es-AR': 'Recitales' },
  'sub-shopping-clothing': { en: 'Clothing', 'es-AR': 'Ropa' },
  'sub-shopping-laundry': { en: 'Laundry', 'es-AR': 'Lavadero' },
  'sub-education-books': { en: 'Books', 'es-AR': 'Libros' },
  'sub-education-courses': { en: 'Courses', 'es-AR': 'Cursos' },
  'sub-education-university': { en: 'University', 'es-AR': 'Universidad' },
  'sub-sports-football': { en: 'Football', 'es-AR': 'Futbol' },
  'sub-sports-gym': { en: 'Gym', 'es-AR': 'Gimnasio' },
  'sub-insurance-car': { en: 'Car Insurance', 'es-AR': 'Seguro auto' },
  'sub-pets-food': { en: 'Pet Food', 'es-AR': 'Comida mascotas' },
  'sub-savings-reserve': { en: 'Reserve', 'es-AR': 'Reserva' },
  'sub-investment-assets': { en: 'Assets', 'es-AR': 'Activos' },
  'sub-charity-donations': { en: 'Donations', 'es-AR': 'Donaciones' },
  'sub-income-payroll': { en: 'Payroll', 'es-AR': 'Sueldo' },
  'sub-income-freelance-projects': { en: 'Projects', 'es-AR': 'Trabajos' },
  'sub-income-sales-sales': { en: 'Sales', 'es-AR': 'Ventas' },
  'sub-income-refunds-reimbursements': { en: 'Reimbursements', 'es-AR': 'Reembolsos' },
  'sub-income-other-misc': { en: 'Misc Income', 'es-AR': 'Ingresos varios' },
};

const defaultPaymentMethodNames: Record<string, LocalizedDefaultName> = {
  'pay-cash': { en: 'Cash', 'es-AR': 'Efectivo' },
  'pay-transfer': { en: 'Transfer', 'es-AR': 'Transferencia' },
  'pay-credit-card': { en: 'Credit Card', 'es-AR': 'Tarjeta de credito' },
  'pay-debit-card': { en: 'Debit Card', 'es-AR': 'Tarjeta de debito' },
};

const defaultPaymentSubmethodNames: Record<string, LocalizedDefaultName> = {
  'subpay-cash-wallet': { en: 'Wallet', 'es-AR': 'Billetera' },
  'subpay-transfer-mercado-pago': { en: 'Mercado Pago', 'es-AR': 'Mercado Pago' },
  'subpay-transfer-bank': { en: 'Bank Transfer', 'es-AR': 'Transferencia bancaria' },
  'subpay-credit-visa': { en: 'Visa', 'es-AR': 'Visa' },
  'subpay-credit-mastercard': { en: 'Mastercard', 'es-AR': 'Mastercard' },
  'subpay-credit-amex': { en: 'Amex', 'es-AR': 'Amex' },
  'subpay-debit-bank': { en: 'Bank debit', 'es-AR': 'Debito bancario' },
};

const reportCopy = {
  en: {
    assignedPerson: 'Assigned person',
    amount: 'Amount',
    balance: 'Balance',
    cashBox: 'Cash box',
    category: 'Category',
    currency: 'Currency',
    date: 'Date',
    description: 'Description',
    expense: 'Expense',
    expenses: 'Expenses',
    expensesByAssignedPerson: 'Expenses by assigned person',
    expensesByCashBox: 'Expenses by cash box',
    expensesByCategory: 'Expenses by category',
    expensesByPaymentMethod: 'Expenses by payment method',
    income: 'Income',
    incomeByCategory: 'Income by category',
    item: 'Item',
    monthlyTotals: 'Monthly totals',
    name: 'Name',
    noCashBox: 'No cash box',
    noPaymentMethod: 'No payment method',
    noPerson: 'No person',
    paymentMethod: 'Payment method',
    paymentSubmethod: 'Payment submethod',
    referenceId: 'Reference ID',
    section: 'Section',
    subcategory: 'Subcategory',
    summary: 'Summary',
    transactionId: 'Transaction ID',
    transactions: 'Transactions',
    type: 'Type',
  },
  'es-AR': {
    assignedPerson: 'Persona asignada',
    amount: 'Importe',
    balance: 'Saldo',
    cashBox: 'Caja',
    category: 'Categoria',
    currency: 'Moneda',
    date: 'Fecha',
    description: 'Descripcion',
    expense: 'Gasto',
    expenses: 'Gastos',
    expensesByAssignedPerson: 'Gastos por persona asignada',
    expensesByCashBox: 'Gastos por caja',
    expensesByCategory: 'Gastos por categoria',
    expensesByPaymentMethod: 'Gastos por metodo de pago',
    income: 'Ingreso',
    incomeByCategory: 'Ingresos por categoria',
    item: 'Item',
    monthlyTotals: 'Totales mensuales',
    name: 'Referencia',
    noCashBox: 'Sin caja',
    noPaymentMethod: 'Sin metodo de pago',
    noPerson: 'Sin persona',
    paymentMethod: 'Metodo de pago',
    paymentSubmethod: 'Submetodo de pago',
    referenceId: 'ID de referencia',
    section: 'Seccion',
    subcategory: 'Subcategoria',
    summary: 'Resumen',
    transactionId: 'ID de movimiento',
    transactions: 'Movimientos',
    type: 'Tipo',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

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

export const formatAmountValue = (amount: number): string =>
  Math.round(amount).toLocaleString('es-AR', {
    maximumFractionDigits: 0,
  });

export const formatMoney = (amount: number, currency: string): string =>
  `${currency} ${formatAmountValue(amount)}`;

export const formatReportAmountValue = (amount: number): string => {
  const rounded = roundMoney(amount);
  const cents = Math.abs(Math.round(rounded * 100) % 100);
  const fractionDigits = cents > 0 ? 2 : 0;

  return rounded.toLocaleString('es-AR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

export const formatReportMoney = (amount: number, currency: string): string =>
  `${currency} ${formatReportAmountValue(amount)}`;

const displayDefaultName = <T extends { id: string; name: string }>(
  item: T | undefined,
  defaults: Record<string, LocalizedDefaultName>,
  language?: AppLanguage,
): string | undefined => {
  if (!item) {
    return undefined;
  }

  const defaultName = defaults[item.id];

  return language && defaultName && item.name === defaultName.en ? defaultName[language] : item.name;
};

export const categoryName = (data: AppData, categoryId?: string, language?: AppLanguage): string =>
  categoryId
    ? displayDefaultName(
        data.categories.find((category) => category.id === categoryId),
        defaultCategoryNames,
        language,
      ) ?? 'Uncategorized'
    : 'Uncategorized';

export const cashBoxName = (data: AppData, cashBoxId?: string, language?: AppLanguage): string =>
  cashBoxId
    ? displayDefaultName(
        data.cashBoxes.find((cashBox) => cashBox.id === cashBoxId),
        defaultCashBoxNames,
        language,
      ) ?? reportCopy[language ?? 'en'].noCashBox
    : reportCopy[language ?? 'en'].noCashBox;

export const cashBoxNameForCategory = (data: AppData, categoryId?: string, language?: AppLanguage): string => {
  const category = categoryId ? data.categories.find((item) => item.id === categoryId) : undefined;

  return cashBoxName(data, category?.cashBoxId, language);
};

export const subcategoryName = (data: AppData, subcategoryId?: string, language?: AppLanguage): string =>
  subcategoryId
    ? displayDefaultName(
        data.subcategories.find((subcategory) => subcategory.id === subcategoryId),
        defaultSubcategoryNames,
        language,
      ) ?? ''
    : '';

export const paymentMethodName = (data: AppData, paymentMethodId?: string, language?: AppLanguage): string =>
  paymentMethodId
    ? displayDefaultName(
        data.paymentMethods.find((method) => method.id === paymentMethodId),
        defaultPaymentMethodNames,
        language,
      ) ?? 'Payment method'
    : '';

export const paymentSubmethodName = (data: AppData, paymentSubmethodId?: string, language?: AppLanguage): string =>
  paymentSubmethodId
    ? displayDefaultName(
        data.paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId),
        defaultPaymentSubmethodNames,
        language,
      ) ?? ''
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
  language?: AppLanguage,
): CategorySummary[] => {
  const byCategory = summarizeByTransactionTypeCategory(data, transactions, 'expense', language);

  return byCategory;
};

export const summarizeIncomeByCategory = (
  data: AppData,
  transactions: Transaction[],
  language?: AppLanguage,
): CategorySummary[] => {
  const byCategory = summarizeByTransactionTypeCategory(data, transactions, 'income', language);

  return byCategory;
};

const summarizeByTransactionTypeCategory = (
  data: AppData,
  transactions: Transaction[],
  type: Transaction['type'],
  language?: AppLanguage,
): CategorySummary[] => {
  const byCategory = new Map<string, CategorySummary>();

  transactions
    .filter((transaction) => transaction.type === type)
    .forEach((transaction) => {
      const key = `${transaction.categoryId}-${transaction.currency}`;
      const current =
        byCategory.get(key) ??
        ({
          categoryId: transaction.categoryId,
          categoryName: categoryName(data, transaction.categoryId, language),
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

export const summarizeExpensesByCashBox = (
  data: AppData,
  transactions: Transaction[],
  language?: AppLanguage,
): CashBoxSummary[] => {
  const byCashBox = new Map<string, CashBoxSummary>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = data.categories.find((item) => item.id === transaction.categoryId);
      const cashBoxId = category?.cashBoxId;
      const key = `${cashBoxId ?? 'unassigned'}-${transaction.currency}`;
      const current =
        byCashBox.get(key) ??
        ({
          cashBoxId,
          cashBoxName: cashBoxName(data, cashBoxId, language),
          amount: 0,
          currency: transaction.currency,
        } satisfies CashBoxSummary);

      current.amount += transaction.amount;
      byCashBox.set(key, current);
    });

  return Array.from(byCashBox.values())
    .map((summary) => ({ ...summary, amount: roundMoney(summary.amount) }))
    .sort((left, right) => right.amount - left.amount);
};

export const summarizeExpensesByPerson = (
  data: AppData,
  transactions: Transaction[],
  language?: AppLanguage,
): PersonSummary[] => {
  const byPerson = new Map<string, PersonSummary>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const personId = transaction.assignedPersonId;
      const key = `${personId ?? 'unassigned'}-${transaction.currency}`;
      const current =
        byPerson.get(key) ??
        ({
          personId,
          personName: personName(data, personId) || reportCopy[language ?? 'en'].noPerson,
          amount: 0,
          currency: transaction.currency,
        } satisfies PersonSummary);

      current.amount += transaction.amount;
      byPerson.set(key, current);
    });

  return Array.from(byPerson.values())
    .map((summary) => ({ ...summary, amount: roundMoney(summary.amount) }))
    .sort((left, right) => right.amount - left.amount);
};

type PaymentMethodSummary = {
  paymentMethodId?: string;
  paymentSubmethodId?: string;
  paymentMethodName: string;
  paymentSubmethodName: string;
  amount: number;
  currency: string;
};

export const summarizeExpensesByPaymentMethod = (
  data: AppData,
  transactions: Transaction[],
  language?: AppLanguage,
): PaymentMethodSummary[] => {
  const byPaymentMethod = new Map<string, PaymentMethodSummary>();
  const copy = reportCopy[language ?? 'en'];

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const submethod = transaction.paymentSubmethodId
        ? data.paymentSubmethods.find((item) => item.id === transaction.paymentSubmethodId)
        : undefined;
      const paymentMethodId = transaction.paymentMethodId ?? submethod?.paymentMethodId;
      const paymentMethod = paymentMethodId
        ? data.paymentMethods.find((item) => item.id === paymentMethodId)
        : undefined;
      const key = `${paymentMethodId ?? 'unassigned'}-${transaction.paymentSubmethodId ?? 'unassigned'}-${transaction.currency}`;
      const current =
        byPaymentMethod.get(key) ??
        ({
          paymentMethodId,
          paymentSubmethodId: transaction.paymentSubmethodId,
          paymentMethodName:
            displayDefaultName(paymentMethod, defaultPaymentMethodNames, language) ?? copy.noPaymentMethod,
          paymentSubmethodName:
            displayDefaultName(submethod, defaultPaymentSubmethodNames, language) ?? '',
          amount: 0,
          currency: transaction.currency,
        } satisfies PaymentMethodSummary);

      current.amount += transaction.amount;
      byPaymentMethod.set(key, current);
    });

  return Array.from(byPaymentMethod.values())
    .map((summary) => ({ ...summary, amount: roundMoney(summary.amount) }))
    .sort(
      (left, right) =>
        right.amount - left.amount ||
        left.paymentMethodName.localeCompare(right.paymentMethodName, language, { sensitivity: 'base' }) ||
        left.paymentSubmethodName.localeCompare(right.paymentSubmethodName, language, { sensitivity: 'base' }),
    );
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
    'Cash box',
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
    cashBoxNameForCategory(data, transaction.categoryId),
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

const reportSummaryRows = (
  data: AppData,
  transactions: Transaction[],
  language: AppLanguage,
): Array<Array<string | number | undefined>> => {
  const copy = reportCopy[language];
  const currencyRows = summarizeByCurrency(transactions).flatMap((summary) => [
    [copy.monthlyTotals, copy.income, summary.income, summary.currency, ''],
    [copy.monthlyTotals, copy.expenses, summary.expenses, summary.currency, ''],
    [copy.monthlyTotals, copy.balance, summary.balance, summary.currency, ''],
  ]);
  const cashBoxRows = summarizeExpensesByCashBox(data, transactions, language).map((summary) => [
    copy.expensesByCashBox,
    summary.cashBoxName,
    summary.amount,
    summary.currency,
    summary.cashBoxId,
  ]);
  const paymentMethodRows = summarizeExpensesByPaymentMethod(data, transactions, language).map((summary) => [
    copy.expensesByPaymentMethod,
    [summary.paymentMethodName, summary.paymentSubmethodName].filter(Boolean).join(' / '),
    summary.amount,
    summary.currency,
    [summary.paymentMethodId, summary.paymentSubmethodId].filter(Boolean).join('/'),
  ]);
  const categoryRows = summarizeExpensesByCategory(data, transactions, language).map((summary) => [
    copy.expensesByCategory,
    summary.categoryName,
    summary.amount,
    summary.currency,
    summary.categoryId,
  ]);
  const incomeCategoryRows = summarizeIncomeByCategory(data, transactions, language).map((summary) => [
    copy.incomeByCategory,
    summary.categoryName,
    summary.amount,
    summary.currency,
    summary.categoryId,
  ]);
  const personRows = summarizeExpensesByPerson(data, transactions, language).map((summary) => [
    copy.expensesByAssignedPerson,
    summary.personName,
    summary.amount,
    summary.currency,
    summary.personId,
  ]);

  return [...currencyRows, ...cashBoxRows, ...paymentMethodRows, ...categoryRows, ...incomeCategoryRows, ...personRows];
};

export const monthlyReportToCsv = (
  data: AppData,
  transactions: Transaction[],
  language: AppLanguage = data.settings.language,
): string => {
  const copy = reportCopy[language];
  const headers = [
    copy.section,
    copy.item,
    copy.amount,
    copy.currency,
    copy.referenceId,
    copy.transactionId,
    copy.date,
    copy.type,
    copy.cashBox,
    copy.category,
    copy.subcategory,
    copy.paymentMethod,
    copy.paymentSubmethod,
    copy.assignedPerson,
    copy.name,
    copy.description,
  ];
  const summaryRows = reportSummaryRows(data, transactions, language).map((row) => [...row, '', '', '', '', '', '', '', '', '', '', '']);
  const transactionRows = transactions.map((transaction) => [
    copy.transactions,
    transaction.name,
    transaction.amount,
    transaction.currency,
    transaction.id,
    transaction.id,
    dateInputFromDate(transaction.date),
    transaction.type === 'expense' ? copy.expense : copy.income,
    transaction.type === 'expense' ? cashBoxNameForCategory(data, transaction.categoryId, language) : '',
    categoryName(data, transaction.categoryId, language),
    subcategoryName(data, transaction.subcategoryId, language),
    transaction.type === 'expense' ? paymentMethodName(data, transaction.paymentMethodId, language) : '',
    transaction.type === 'expense' ? paymentSubmethodName(data, transaction.paymentSubmethodId, language) : '',
    transaction.type === 'expense' ? personName(data, transaction.assignedPersonId) : '',
    transaction.name,
    transaction.description,
  ]);

  return [headers, ...summaryRows, ...transactionRows].map((row) => row.map(csvEscape).join(',')).join('\n');
};

const htmlEscape = (value: string | number | undefined): string =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const htmlTableRows = (
  rows: Array<Array<string | number | undefined>>,
  numericColumnIndexes: number[] = [],
): string =>
  rows
    .map(
      (row) =>
        `<tr>${row
          .map((value, index) => `<td${numericColumnIndexes.includes(index) ? ' class="amount-cell"' : ''}>${htmlEscape(value)}</td>`)
          .join('')}</tr>`,
    )
    .join('');

const htmlTable = (
  headers: string[],
  rows: Array<Array<string | number | undefined>>,
  numericColumnIndexes: number[] = [],
): string => `
    <table>
      <thead><tr>${headers
        .map((header, index) => `<th${numericColumnIndexes.includes(index) ? ' class="amount-cell"' : ''}>${htmlEscape(header)}</th>`)
        .join('')}</tr></thead>
      <tbody>${htmlTableRows(rows, numericColumnIndexes)}</tbody>
    </table>`;

const htmlReportSection = (
  title: string,
  headers: string[],
  rows: Array<Array<string | number | undefined>>,
  numericColumnIndexes: number[] = [],
): string => `
      <section class="report-section">
        <h3>${htmlEscape(title)}</h3>
        ${htmlTable(headers, rows, numericColumnIndexes)}
      </section>`;

const orderedReportCurrencies = (data: AppData, transactions: Transaction[]): string[] => {
  const defaultCurrency = normalizeCurrency(data.settings.defaultCurrency);
  const currencies = Array.from(
    new Set(transactions.map((transaction) => normalizeCurrency(transaction.currency))),
  );

  if (!currencies.length) {
    return [defaultCurrency];
  }

  return currencies.sort((left, right) => {
    if (left === defaultCurrency && right !== defaultCurrency) return -1;
    if (right === defaultCurrency && left !== defaultCurrency) return 1;

    return left.localeCompare(right);
  });
};

export const monthlyReportToHtml = (
  data: AppData,
  transactions: Transaction[],
  title: string,
  language: AppLanguage = data.settings.language,
): string => {
  const copy = reportCopy[language];
  const totalsByCurrency = summarizeByCurrency(transactions);
  const currencies = orderedReportCurrencies(data, transactions);
  const currencySections = currencies
    .map((currency) => {
      const currencyTransactions = transactions.filter(
        (transaction) => normalizeCurrency(transaction.currency) === currency,
      );
      const totals = totalsByCurrency.find((summary) => normalizeCurrency(summary.currency) === currency);
      const totalRows = [
        [copy.income, formatReportMoney(totals?.income ?? 0, currency)],
        [copy.expenses, formatReportMoney(totals?.expenses ?? 0, currency)],
        [copy.balance, formatReportMoney(totals?.balance ?? 0, currency)],
      ];
      const cashBoxRows = summarizeExpensesByCashBox(data, currencyTransactions, language).map((summary) => [
        summary.cashBoxName,
        formatReportMoney(summary.amount, currency),
      ]);
      const expenseCategoryRows = summarizeExpensesByCategory(data, currencyTransactions, language).map((summary) => [
        summary.categoryName,
        formatReportMoney(summary.amount, currency),
      ]);
      const incomeCategoryRows = summarizeIncomeByCategory(data, currencyTransactions, language).map((summary) => [
        summary.categoryName,
        formatReportMoney(summary.amount, currency),
      ]);
      const paymentMethodRows = summarizeExpensesByPaymentMethod(data, currencyTransactions, language).map((summary) => [
        summary.paymentMethodName,
        summary.paymentSubmethodName,
        formatReportMoney(summary.amount, currency),
      ]);
      const personRows = summarizeExpensesByPerson(data, currencyTransactions, language).map((summary) => [
        summary.personName,
        formatReportMoney(summary.amount, currency),
      ]);
      const transactionRows = currencyTransactions.map((transaction) => [
        dateInputFromDate(transaction.date),
        transaction.type === 'expense' ? copy.expense : copy.income,
        formatReportMoney(transaction.amount, currency),
        transaction.type === 'expense' ? cashBoxNameForCategory(data, transaction.categoryId, language) : '',
        categoryName(data, transaction.categoryId, language),
        subcategoryName(data, transaction.subcategoryId, language),
        transaction.type === 'expense' ? paymentMethodName(data, transaction.paymentMethodId, language) : '',
        transaction.type === 'expense' ? paymentSubmethodName(data, transaction.paymentSubmethodId, language) : '',
        transaction.type === 'expense' ? personName(data, transaction.assignedPersonId) || copy.noPerson : '',
        transaction.name,
      ]);

      return `
    <section class="currency-block">
      <h2>${htmlEscape(currency)}</h2>
      ${htmlReportSection(copy.monthlyTotals, [copy.item, copy.amount], totalRows, [1])}
      ${htmlReportSection(copy.expensesByCashBox, [copy.cashBox, copy.amount], cashBoxRows, [1])}
      ${htmlReportSection(copy.expensesByCategory, [copy.category, copy.amount], expenseCategoryRows, [1])}
      ${htmlReportSection(copy.incomeByCategory, [copy.category, copy.amount], incomeCategoryRows, [1])}
      ${htmlReportSection(copy.expensesByPaymentMethod, [copy.paymentMethod, copy.paymentSubmethod, copy.amount], paymentMethodRows, [2])}
      ${htmlReportSection(copy.expensesByAssignedPerson, [copy.assignedPerson, copy.amount], personRows, [1])}
      ${htmlReportSection(
        copy.transactions,
        [
          copy.date,
          copy.type,
          copy.amount,
          copy.cashBox,
          copy.category,
          copy.subcategory,
          copy.paymentMethod,
          copy.paymentSubmethod,
          copy.assignedPerson,
          copy.name,
        ],
        transactionRows,
        [2],
      )}
    </section>`;
    })
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { color: #2B2D42; font-family: Arial, sans-serif; margin: 32px; }
      h1 { color: #BF0426; font-size: 24px; margin: 0 0 18px; }
      h2 { border-bottom: 2px solid #BF0426; font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; }
      h3 { font-size: 13px; margin: 0 0 8px; }
      .currency-block { margin-top: 20px; }
      .report-section { margin-top: 18px; page-break-inside: avoid; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border-bottom: 1px solid #E6E8EE; font-size: 11px; padding: 7px 6px; text-align: left; }
      th { background: #F7F8FA; font-size: 10px; text-transform: uppercase; }
      .amount-cell { text-align: right; white-space: nowrap; }
    </style>
  </head>
  <body>
    <h1>${htmlEscape(title)}</h1>
    ${currencySections}
  </body>
</html>`;
};
