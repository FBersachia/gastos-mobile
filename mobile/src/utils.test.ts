import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { appDataFromDevFixturePayload, type DevAppDataPayload } from './devFixtures';
import type { AppData, PaymentMethod, PaymentSubmethod, Subcategory } from './types';
import {
  cashBoxNameForCategory,
  deactivateById,
  formatAmountValue,
  formatMoney,
  formatReportMoney,
  installmentTransactionName,
  monthlyReportToCsv,
  monthlyReportToHtml,
  normalizeTransactionTextFields,
  paymentMethodName,
  paymentSubmethodName,
  splitInstallmentsWithInterest,
  subcategoryName,
  summarizeExpensesByCashBox,
  summarizeExpensesByPaymentMethod,
  summarizeExpensesByPerson,
  transactionsToCsv,
} from './utils';

const timestamp = new Date('2026-05-28T12:00:00.000Z');
const movementDate = new Date(2026, 4, 28);

const baseData = (): AppData => ({
  transactions: [],
  cashBoxes: [
    {
      id: 'cashbox-basic',
      name: 'Basic',
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
  categories: [
    {
      id: 'cat-food',
      name: 'Food',
      type: 'expense',
      cashBoxId: 'cashbox-basic',
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

const loadJune2026Fixture = (): AppData => {
  const fixturePath = fileURLToPath(`${new URL('../dev-local/monthly-report-2026-06.fixture.json', import.meta.url)}`);
  const raw = readFileSync(fixturePath, 'utf8');
  const payload = JSON.parse(raw) as DevAppDataPayload;

  return appDataFromDevFixturePayload(payload);
};

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

describe('money formatting', () => {
  it('formats plain visible amounts with dot thousands separators', () => {
    expect(formatAmountValue(2500)).toBe('2.500');
  });

  it('uses dots as thousands separators for visible amounts', () => {
    expect(formatMoney(2250000, 'ARS')).toBe('ARS 2.250.000');
  });

  it('rounds cents only for display', () => {
    expect(formatMoney(2250000.5, 'ARS')).toBe('ARS 2.250.001');
  });

  it('does not add thousands separators to small amounts', () => {
    expect(formatMoney(999, 'ARS')).toBe('ARS 999');
  });

  it('formats report money with comma decimals only when cents exist', () => {
    expect(formatReportMoney(1234, 'ARS')).toBe('ARS 1.234');
    expect(formatReportMoney(1234.5, 'ARS')).toBe('ARS 1.234,50');
    expect(formatReportMoney(2000.25, 'USD')).toBe('USD 2.000,25');
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

describe('expense reports', () => {
  it('summarizes expenses by cash box and assigned person', () => {
    const data = baseData();
    const transactions = [
      {
        id: 'trx-1',
        type: 'expense' as const,
        amount: 1000,
        currency: 'ARS',
        date: movementDate,
        categoryId: 'cat-food',
        subcategoryId: 'sub-groceries',
        paymentMethodId: 'pay-card',
        paymentSubmethodId: 'subpay-visa',
        assignedPersonId: 'person-friend',
        name: 'Groceries',
        description: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'trx-2',
        type: 'expense' as const,
        amount: 250,
        currency: 'ARS',
        date: movementDate,
        categoryId: 'cat-food',
        subcategoryId: 'sub-groceries',
        paymentMethodId: 'pay-card',
        paymentSubmethodId: 'subpay-visa',
        name: 'Snacks',
        description: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    expect(cashBoxNameForCategory(data, 'cat-food')).toBe('Basic');
    expect(summarizeExpensesByCashBox(data, transactions)).toEqual([
      { cashBoxId: 'cashbox-basic', cashBoxName: 'Basic', amount: 1250, currency: 'ARS' },
    ]);
    expect(summarizeExpensesByPerson(data, transactions)).toEqual([
      { personId: 'person-friend', personName: 'Friend', amount: 1000, currency: 'ARS' },
      { personId: undefined, personName: 'No person', amount: 250, currency: 'ARS' },
    ]);
    expect(summarizeExpensesByPaymentMethod(data, transactions)).toEqual([
      {
        paymentMethodId: 'pay-card',
        paymentSubmethodId: 'subpay-visa',
        paymentMethodName: 'Credit Card',
        paymentSubmethodName: 'Visa',
        amount: 1250,
        currency: 'ARS',
      },
    ]);
  });

  it('exports a monthly report CSV with summary sections and transaction rows', () => {
    const base = baseData();
    const data: AppData = {
      ...base,
      categories: [
        ...base.categories,
        {
          id: 'cat-income',
          name: 'Salary',
          type: 'income',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      subcategories: [
        ...base.subcategories,
        {
          id: 'sub-income-payroll',
          categoryId: 'cat-income',
          name: 'Payroll',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
    const expenseTransaction = {
      id: 'trx-1',
      type: 'expense' as const,
      amount: 1000,
      currency: 'ARS',
      date: movementDate,
      categoryId: 'cat-food',
      subcategoryId: 'sub-groceries',
      paymentMethodId: 'pay-card',
      paymentSubmethodId: 'subpay-visa',
      assignedPersonId: 'person-friend',
      name: 'Groceries',
      description: 'Monthly run',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const incomeTransaction = {
      id: 'trx-2',
      type: 'income' as const,
      amount: 5000,
      currency: 'ARS',
      date: movementDate,
      categoryId: 'cat-income',
      subcategoryId: 'sub-income-payroll',
      name: 'Salary',
      description: 'Monthly income',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const transactions = [expenseTransaction, incomeTransaction];
    const csv = monthlyReportToCsv({ ...data, transactions }, transactions);

    expect(csv).toContain('"Expenses by cash box","Basic","1000","ARS","cashbox-basic"');
    expect(csv).toContain('"Expenses by assigned person","Friend","1000","ARS","person-friend"');
    expect(csv).toContain('"Income by category","Salary","5000","ARS","cat-income"');
    expect(csv).toContain('"Transactions","Groceries","1000","ARS","trx-1","trx-1"');
    expect(csv).toContain('"Transactions","Salary","5000","ARS","trx-2","trx-2","2026-05-28","Income","","Salary","Payroll"');
    expect(csv).toContain('"Basic","Food","Groceries","Credit Card","Visa","Friend"');
  });

  it('exports monthly report CSV and PDF HTML using the selected Spanish language', () => {
    const base = baseData();
    const data: AppData = {
      ...base,
      settings: {
        ...base.settings,
        language: 'es-AR',
      },
      cashBoxes: [
        {
          id: 'cashbox-basic',
          name: 'Basic',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      categories: [
        {
          id: 'cat-exp-food',
          name: 'Food',
          type: 'expense',
          cashBoxId: 'cashbox-basic',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: 'cat-inc-salary',
          name: 'Salary',
          type: 'income',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      subcategories: [
        {
          id: 'sub-food-groceries',
          categoryId: 'cat-exp-food',
          name: 'Groceries',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: 'sub-income-payroll',
          categoryId: 'cat-inc-salary',
          name: 'Payroll',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      paymentMethods: [
        {
          id: 'pay-credit-card',
          name: 'Credit Card',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      paymentSubmethods: [
        {
          id: 'subpay-credit-visa',
          paymentMethodId: 'pay-credit-card',
          name: 'Visa',
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
    const transaction = {
      id: 'trx-1',
      type: 'expense' as const,
      amount: 1000,
      currency: 'ARS',
      date: movementDate,
      categoryId: 'cat-exp-food',
      subcategoryId: 'sub-food-groceries',
      paymentMethodId: 'pay-credit-card',
      paymentSubmethodId: 'subpay-credit-visa',
      name: 'Compra mensual',
      description: 'Mercado',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const incomeTransaction = {
      id: 'trx-2',
      type: 'income' as const,
      amount: 5000,
      currency: 'ARS',
      date: movementDate,
      categoryId: 'cat-inc-salary',
      subcategoryId: 'sub-income-payroll',
      name: 'Sueldo',
      description: 'Ingreso mensual',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const transactions = [transaction, incomeTransaction];
    const csv = monthlyReportToCsv({ ...data, transactions }, transactions, 'es-AR');
    const html = monthlyReportToHtml({ ...data, transactions }, transactions, 'Reporte mensual', 'es-AR');

    expect(csv.split('\n')[0]).toContain('"Seccion","Item","Importe","Moneda"');
    expect(csv).toContain('"Gastos por caja","Basico","1000","ARS","cashbox-basic"');
    expect(csv).toContain('"Ingresos por categoria","Salario","5000","ARS","cat-inc-salary"');
    expect(csv).toContain('"Movimientos","Compra mensual","1000","ARS","trx-1","trx-1","2026-05-28","Gasto"');
    expect(csv).toContain('"Movimientos","Sueldo","5000","ARS","trx-2","trx-2","2026-05-28","Ingreso","","Salario","Sueldo"');
    expect(csv).toContain('"Basico","Comida","Mercado","Tarjeta de credito","Visa",""');
    expect(html).toContain('<h2>ARS</h2>');
    expect(html).toContain('<h3>Totales mensuales</h3>');
    expect(html).toContain('<h3>Gastos por caja</h3>');
    expect(html).toContain('<h3>Gastos por metodo de pago</h3>');
    expect(html).toContain('<th>Caja</th>');
    expect(html).toContain('<td>Gasto</td>');
    expect(html).toContain('<td>Ingreso</td>');
    expect(html).toContain('<td>Comida</td>');
    expect(html).toContain('<td>Salario</td>');
    expect(html).toContain('<td class="amount-cell">ARS 5.000</td>');
    expect(html).toContain('<td class="amount-cell">ARS 1.000</td>');
  });

  it('exports the June 2026 PDF fixture grouped by ordered currency sections', () => {
    const data = loadJune2026Fixture();
    const html = monthlyReportToHtml(data, data.transactions, 'Reporte mensual - junio de 2026', 'es-AR');

    expect(html.indexOf('<h2>ARS</h2>')).toBeLessThan(html.indexOf('<h2>USD</h2>'));
    expect(html).toContain('<h3>Totales mensuales</h3>');
    expect(html).toContain('<h3>Gastos por categoria</h3>');
    expect(html).toContain('<h3>Ingresos por categoria</h3>');
    expect(html).toContain('<h3>Gastos por metodo de pago</h3>');
    expect(html).toContain('<h3>Gastos por caja</h3>');
    expect(html).toContain('<h3>Gastos por persona asignada</h3>');
    expect(html).toContain('<h3>Movimientos</h3>');
    expect(html).toContain('ARS 2.683.356,33');
    expect(html).toContain('ARS 43.100');
    expect(html).toContain('USD 154,80');
    expect(html).toContain('USD 300');
    expect(html).toContain('<td>Ingreso</td>');
    expect(html).toContain('Compra 300usd');
    expect(html).toContain('Transferencia bancaria');
  });
});
