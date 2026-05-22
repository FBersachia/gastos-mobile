import type {
  AppData,
  Category,
  PaymentMethod,
  PaymentSubmethod,
  Subcategory,
  Transaction,
  TransactionType,
} from './types';

const TIMESTAMP = '2026-05-31T12:00:00.000Z';
const CURRENCY = 'ARS';

type SourceRow = {
  date: string;
  type: TransactionType;
  sourceCategory: string;
  description: string;
  amount: number;
};

const category = (id: string, name: string, type: Category['type']): Category => ({
  id,
  name,
  type,
  active: true,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
});

const subcategory = (id: string, categoryId: string, name: string): Subcategory => ({
  id,
  categoryId,
  name,
  active: true,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
});

const paymentMethod = (id: string, name: string): PaymentMethod => ({
  id,
  name,
  active: true,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
});

const paymentSubmethod = (id: string, paymentMethodId: string, name: string): PaymentSubmethod => ({
  id,
  paymentMethodId,
  name,
  active: true,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
});

const categories: Category[] = [
  category('cat-exp-food', 'Food', 'expense'),
  category('cat-exp-transport', 'Transport', 'expense'),
  category('cat-exp-housing', 'Housing', 'expense'),
  category('cat-exp-services', 'Services', 'expense'),
  category('cat-exp-health', 'Health', 'expense'),
  category('cat-exp-entertainment', 'Entertainment', 'expense'),
  category('cat-exp-shopping', 'Shopping', 'expense'),
  category('cat-exp-education', 'Education', 'expense'),
  category('cat-exp-sports', 'Sports', 'expense'),
  category('cat-exp-insurance', 'Insurance', 'expense'),
  category('cat-exp-pets', 'Pets', 'expense'),
  category('cat-exp-personal', 'Personal', 'expense'),
  category('cat-exp-other', 'Other', 'expense'),
  category('cat-inc-salary', 'Salary', 'income'),
  category('cat-inc-freelance', 'Freelance', 'income'),
  category('cat-inc-sales', 'Sales', 'income'),
  category('cat-inc-refunds', 'Refunds', 'income'),
  category('cat-inc-other', 'Other', 'income'),
];

const subcategories: Subcategory[] = [
  subcategory('sub-food-groceries', 'cat-exp-food', 'Groceries'),
  subcategory('sub-food-delivery', 'cat-exp-food', 'Delivery'),
  subcategory('sub-food-breakfast', 'cat-exp-food', 'Breakfast'),
  subcategory('sub-food-lunch', 'cat-exp-food', 'Lunch'),
  subcategory('sub-food-dinner', 'cat-exp-food', 'Dinner'),
  subcategory('sub-food-snacks', 'cat-exp-food', 'Snacks'),
  subcategory('sub-food-burgers', 'cat-exp-food', 'Burgers'),
  subcategory('sub-food-beverages', 'cat-exp-food', 'Beverages'),
  subcategory('sub-food-drinks', 'cat-exp-food', 'Drinks'),
  subcategory('sub-food-cravings', 'cat-exp-food', 'Cravings'),
  subcategory('sub-transport-rides', 'cat-exp-transport', 'Rides'),
  subcategory('sub-transport-public-transit', 'cat-exp-transport', 'Public Transit'),
  subcategory('sub-housing-home-goods', 'cat-exp-housing', 'Home Goods'),
  subcategory('sub-housing-repairments', 'cat-exp-housing', 'Repairments'),
  subcategory('sub-services-mobile-phone', 'cat-exp-services', 'Mobile Phone'),
  subcategory('sub-services-subscriptions', 'cat-exp-services', 'Subscriptions'),
  subcategory('sub-health-personal-care', 'cat-exp-health', 'Personal Care'),
  subcategory('sub-health-hospital', 'cat-exp-health', 'Hospital'),
  subcategory('sub-health-meds', 'cat-exp-health', 'Meds'),
  subcategory('sub-entertainment-movies', 'cat-exp-entertainment', 'Movies'),
  subcategory('sub-entertainment-games', 'cat-exp-entertainment', 'Games'),
  subcategory('sub-entertainment-concerts', 'cat-exp-entertainment', 'Concerts'),
  subcategory('sub-shopping-clothing', 'cat-exp-shopping', 'Clothing'),
  subcategory('sub-shopping-laundry', 'cat-exp-shopping', 'Laundry'),
  subcategory('sub-education-books', 'cat-exp-education', 'Books'),
  subcategory('sub-education-courses', 'cat-exp-education', 'Courses'),
  subcategory('sub-education-university', 'cat-exp-education', 'University'),
  subcategory('sub-sports-football', 'cat-exp-sports', 'Football'),
  subcategory('sub-sports-gym', 'cat-exp-sports', 'Gym'),
  subcategory('sub-insurance-car', 'cat-exp-insurance', 'Car Insurance'),
  subcategory('sub-pets-food', 'cat-exp-pets', 'Pet Food'),
  subcategory('sub-other-interests', 'cat-exp-other', 'Interests'),
  subcategory('sub-income-payroll', 'cat-inc-salary', 'Payroll'),
  subcategory('sub-income-freelance-projects', 'cat-inc-freelance', 'Projects'),
  subcategory('sub-income-sales-sales', 'cat-inc-sales', 'Sales'),
  subcategory('sub-income-refunds-reimbursements', 'cat-inc-refunds', 'Reimbursements'),
  subcategory('sub-income-other-misc', 'cat-inc-other', 'Misc Income'),
];

const paymentMethods: PaymentMethod[] = [
  paymentMethod('pay-cash', 'Cash'),
  paymentMethod('pay-transfer', 'Transfer'),
  paymentMethod('pay-credit-card', 'Credit Card'),
];

const paymentSubmethods: PaymentSubmethod[] = [
  paymentSubmethod('subpay-cash-wallet', 'pay-cash', 'Wallet'),
  paymentSubmethod('subpay-transfer-bank', 'pay-transfer', 'Bank Transfer'),
  paymentSubmethod('subpay-credit-visa', 'pay-credit-card', 'Visa'),
  paymentSubmethod('subpay-credit-amex', 'pay-credit-card', 'Amex'),
];

const sourceRows: SourceRow[] = [
  { date: '2026-05-19', type: 'expense', sourceCategory: 'Transporte', description: 'Uber iyv Quilmes amex g', amount: 5600 },
  { date: '2026-05-19', type: 'expense', sourceCategory: 'Transporte', description: 'SUBE', amount: 5000 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido ganado', amount: 5000 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido perdido', amount: 4500 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Merienda', description: 'Parlamento cafe y medialunas', amount: 7000 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Supermercado', description: 'Transferencia', amount: 20000 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Ana', description: 'Transferencia', amount: 50000 },
  { date: '2026-05-18', type: 'expense', sourceCategory: 'Ana', description: 'Alimento perros amex g', amount: 29000 },
  { date: '2026-05-17', type: 'expense', sourceCategory: 'Ana', description: 'Transferencia', amount: 6000 },
  { date: '2026-05-16', type: 'expense', sourceCategory: 'Cena', description: 'Sanguche focaccia generala', amount: 10000 },
  { date: '2026-05-16', type: 'expense', sourceCategory: 'Bebida', description: 'Fernet generala visa g', amount: 8000 },
  { date: '2026-05-16', type: 'expense', sourceCategory: 'Supermercado', description: 'Papel hig, te, papel coc', amount: 9000 },
  { date: '2026-05-16', type: 'expense', sourceCategory: 'Comida', description: 'Panaderia amex g', amount: 10800 },
  { date: '2026-05-15', type: 'expense', sourceCategory: 'Transporte', description: 'Uber viernes x2 visa g', amount: 13000 },
  { date: '2026-05-15', type: 'expense', sourceCategory: 'Transporte', description: 'Uber estacion visa g', amount: 3000 },
  { date: '2026-05-14', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol ganado partido', amount: 6000 },
  { date: '2026-05-14', type: 'expense', sourceCategory: 'Transporte', description: 'Uber ida y vuelta ducilo visa g', amount: 6700 },
  { date: '2026-05-13', type: 'expense', sourceCategory: 'Servicios', description: 'Personal visa g', amount: 59000 },
  { date: '2026-05-13', type: 'expense', sourceCategory: 'Almuerzo', description: 'Milanesas con pure', amount: 30000 },
  { date: '2026-05-12', type: 'expense', sourceCategory: 'Transporte', description: 'Uber Ducilo visa g ida y vuelta', amount: 7000 },
  { date: '2026-05-12', type: 'expense', sourceCategory: 'Bajonazo', description: 'Baston mooza valu', amount: 5000 },
  { date: '2026-05-12', type: 'expense', sourceCategory: 'Bebida', description: 'Birras con Valu', amount: 10000 },
  { date: '2026-05-11', type: 'expense', sourceCategory: 'Salud', description: 'Shampoo caspa', amount: 8000 },
  { date: '2026-05-11', type: 'expense', sourceCategory: 'Almuerzo', description: 'Sushi x30 oficina py visa g', amount: 13500 },
  { date: '2026-05-11', type: 'expense', sourceCategory: 'Transporte', description: 'Uber ida y vuelta futbol visa g', amount: 4000 },
  { date: '2026-05-11', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido perdido', amount: 5000 },
  { date: '2026-05-10', type: 'expense', sourceCategory: 'Ropa', description: 'Buzo Adidas', amount: 35000 },
  { date: '2026-05-10', type: 'expense', sourceCategory: 'Ropa', description: 'Cuello + guantes', amount: 10000 },
  { date: '2026-05-10', type: 'expense', sourceCategory: 'Ropa', description: 'Campera negra', amount: 59000 },
  { date: '2026-05-10', type: 'expense', sourceCategory: 'Cena', description: 'Coca + delivery', amount: 15000 },
  { date: '2026-05-10', type: 'expense', sourceCategory: 'Ropa', description: 'Medias futbol', amount: 4000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Bebida', description: 'Cerveza visa g', amount: 4000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido perdido', amount: 5000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Casa', description: 'Portalamparad x4 indoor amex g 6cuotas', amount: 17000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Servicios', description: 'Primevideo', amount: 8000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Ana', description: 'Transferencia', amount: 50000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Desayuno', description: 'Pan y facturas visa g', amount: 5050 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Ropa', description: 'Lavadero', amount: 20000 },
  { date: '2026-05-09', type: 'expense', sourceCategory: 'Transporte', description: 'Didi lavadero', amount: 7600 },
  { date: '2026-05-08', type: 'expense', sourceCategory: 'Cena', description: 'Pizza py visa g', amount: 13300 },
  { date: '2026-05-08', type: 'expense', sourceCategory: 'Transporte', description: 'Uber unq visa g', amount: 5700 },
  { date: '2026-05-08', type: 'expense', sourceCategory: 'Servicios', description: 'Pedidosya plus visa g', amount: 6000 },
  { date: '2026-05-07', type: 'expense', sourceCategory: 'Transporte', description: 'Uber lavadero visa g', amount: 10000 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Transporte', description: 'Uber visa g solano', amount: 4500 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Servicios', description: 'Uber one visa g', amount: 8000 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Hamburguesa', description: 'Mc alvarez amex g', amount: 17000 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Transporte', description: 'Uber solano visa g', amount: 4900 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Servicios', description: 'Spotify amex g', amount: 5000 },
  { date: '2026-05-06', type: 'expense', sourceCategory: 'Seguros', description: 'Segurobici amex g', amount: 12300 },
  { date: '2026-05-05', type: 'expense', sourceCategory: 'Transporte', description: 'Uber ida y vuelta antividad visa g', amount: 7000 },
  { date: '2026-05-05', type: 'expense', sourceCategory: 'Almuerzo', description: 'Mila napo oficina', amount: 10000 },
  { date: '2026-05-05', type: 'expense', sourceCategory: 'Transporte', description: 'SUBE', amount: 5000 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Transporte', description: 'Uber partido visa g', amount: 4500 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido ganado', amount: 5000 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Deporte', description: 'Futbol partido ganado', amount: 4500 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Ana', description: 'Ropa feria', amount: 56000 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Ropa', description: 'Ropa feria', amount: 30000 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Transporte', description: 'Uber de villa Mitre', amount: 5400 },
  { date: '2026-05-04', type: 'expense', sourceCategory: 'Transporte', description: 'Uber villa mitre', amount: 5000 },
  { date: '2026-05-03', type: 'expense', sourceCategory: 'Ana', description: 'Efectivo', amount: 2500 },
  { date: '2026-05-03', type: 'expense', sourceCategory: 'Hamburguesa', description: 'Hamburguesa con lauti y coca', amount: 13100 },
  { date: '2026-05-02', type: 'expense', sourceCategory: 'Bebida', description: 'Coca cola', amount: 4000 },
  { date: '2026-05-02', type: 'expense', sourceCategory: 'Bebida', description: 'Coca cola', amount: 2500 },
  { date: '2026-05-02', type: 'expense', sourceCategory: 'Merienda', description: 'Budin', amount: 4000 },
  { date: '2026-05-02', type: 'expense', sourceCategory: 'Servicios', description: 'Mercadolibre plus visa s', amount: 9000 },
  { date: '2026-05-02', type: 'expense', sourceCategory: 'Servicios', description: 'Tuenti', amount: 16500 },
  { date: '2026-05-01', type: 'expense', sourceCategory: 'Hamburguesa', description: 'Betoburger visa s', amount: 18800 },
  { date: '2026-05-01', type: 'expense', sourceCategory: 'Transporte', description: 'Blend uber visa g', amount: 16000 },
  { date: '2026-05-01', type: 'income', sourceCategory: 'Salario', description: 'Sueldo SCES', amount: 2161000 },
];

const addMonths = (dateInput: string, amount: number): string => {
  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1 + amount, day);

  return date.toISOString().slice(0, 10);
};

const splitInstallments = (total: number, count: number): number[] => {
  const totalCents = Math.round(total * 100);
  const base = Math.trunc(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) => {
    const cents = base + (index === count - 1 ? remainder : 0);

    return cents / 100;
  });
};

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const subcategoryFor = (row: SourceRow): string => {
  const description = row.description.toLowerCase();

  if (row.type === 'income') {
    return 'sub-income-payroll';
  }

  switch (row.sourceCategory) {
    case 'Transporte':
      return description.includes('sube') ? 'sub-transport-public-transit' : 'sub-transport-rides';
    case 'Deporte':
      return 'sub-sports-football';
    case 'Supermercado':
      return 'sub-food-groceries';
    case 'Ana':
      return description.includes('perros') ? 'sub-pets-food' : 'sub-other-interests';
    case 'Cena':
      return description.includes('delivery') ? 'sub-food-delivery' : 'sub-food-dinner';
    case 'Bebida':
      return 'sub-food-beverages';
    case 'Comida':
      return 'sub-food-snacks';
    case 'Almuerzo':
      return 'sub-food-lunch';
    case 'Bajonazo':
      return 'sub-food-cravings';
    case 'Salud':
      return 'sub-health-personal-care';
    case 'Ropa':
      return description.includes('lavadero') ? 'sub-shopping-laundry' : 'sub-shopping-clothing';
    case 'Casa':
      return 'sub-housing-home-goods';
    case 'Servicios':
      if (description.includes('prime')) {
        return 'sub-services-subscriptions';
      }
      if (description.includes('mercadolibre')) {
        return 'sub-services-subscriptions';
      }
      if (description.includes('pedidosya')) {
        return 'sub-services-subscriptions';
      }
      if (description.includes('spotify')) {
        return 'sub-services-subscriptions';
      }
      if (description.includes('uber one')) {
        return 'sub-services-subscriptions';
      }
      return 'sub-services-mobile-phone';
    case 'Desayuno':
      return 'sub-food-breakfast';
    case 'Merienda':
      return 'sub-food-snacks';
    case 'Hamburguesa':
      return 'sub-food-burgers';
    case 'Seguros':
      return 'sub-insurance-car';
    default:
      return 'sub-food-snacks';
  }
};

const categoryForSubcategory = (subcategoryId: string): string => {
  const item = subcategories.find((candidate) => candidate.id === subcategoryId);

  if (!item) {
    throw new Error(`Unknown sample subcategory: ${subcategoryId}`);
  }

  return item.categoryId;
};

const paymentFor = (row: SourceRow): { paymentMethodId: string; paymentSubmethodId: string } => {
  const description = row.description.toLowerCase();

  if (description.includes('amex')) {
    return { paymentMethodId: 'pay-credit-card', paymentSubmethodId: 'subpay-credit-amex' };
  }

  if (description.includes('visa')) {
    return { paymentMethodId: 'pay-credit-card', paymentSubmethodId: 'subpay-credit-visa' };
  }

  if (description.includes('transferencia') || row.type === 'income') {
    return { paymentMethodId: 'pay-transfer', paymentSubmethodId: 'subpay-transfer-bank' };
  }

  return { paymentMethodId: 'pay-cash', paymentSubmethodId: 'subpay-cash-wallet' };
};

const installmentCountFor = (description: string): number => {
  const match = description.match(/(\d+)\s*cuotas/i);

  return match ? Number.parseInt(match[1], 10) : 1;
};

const transactionFromRow = (row: SourceRow, index: number): Transaction[] => {
  const subcategoryId = subcategoryFor(row);
  const { paymentMethodId, paymentSubmethodId } = paymentFor(row);
  const totalInstallments = row.type === 'expense' ? installmentCountFor(row.description) : 1;

  if (totalInstallments > 1) {
    const installmentGroupId = `installment-sample-${row.date}-${slug(row.description)}`;

    return splitInstallments(row.amount, totalInstallments).map((amount, installmentIndex) => ({
      id: `trx-sample-${String(index + 1).padStart(3, '0')}-${installmentIndex + 1}`,
      type: row.type,
      amount,
      currency: CURRENCY,
      date: addMonths(row.date, installmentIndex),
      categoryId: categoryForSubcategory(subcategoryId),
      subcategoryId,
      paymentMethodId,
      paymentSubmethodId,
      description: `${row.description} - Installment ${installmentIndex + 1}/${totalInstallments}`,
      installmentGroupId,
      installmentNumber: installmentIndex + 1,
      totalInstallments,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    }));
  }

  return [
    {
      id: `trx-sample-${String(index + 1).padStart(3, '0')}`,
      type: row.type,
      amount: row.amount,
      currency: CURRENCY,
      date: row.date,
      categoryId: categoryForSubcategory(subcategoryId),
      subcategoryId,
      paymentMethodId,
      paymentSubmethodId,
      description: row.description,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ];
};

export const createMay2026SampleData = (): AppData => ({
  transactions: sourceRows.flatMap(transactionFromRow),
  categories: categories.map((item) => ({ ...item })),
  subcategories: subcategories.map((item) => ({ ...item })),
  paymentMethods: paymentMethods.map((item) => ({ ...item })),
  paymentSubmethods: paymentSubmethods.map((item) => ({ ...item })),
  budgets: [],
  settings: {
    defaultCurrency: CURRENCY,
    language: 'en',
    biometricLockEnabled: true,
    budgetNearLimitThreshold: 0.8,
  },
});
