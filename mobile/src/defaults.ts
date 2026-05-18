import { AppData, Category, PaymentMethod, PaymentSubmethod, Subcategory } from './types';

const now = () => new Date().toISOString();

const category = (id: string, name: string, type: Category['type']): Category => ({
  id,
  name,
  type,
  active: true,
  createdAt: now(),
  updatedAt: now(),
});

const subcategory = (id: string, categoryId: string, name: string): Subcategory => ({
  id,
  categoryId,
  name,
  active: true,
  createdAt: now(),
  updatedAt: now(),
});

const paymentMethod = (id: string, name: string): PaymentMethod => ({
  id,
  name,
  active: true,
  createdAt: now(),
  updatedAt: now(),
});

const paymentSubmethod = (id: string, paymentMethodId: string, name: string): PaymentSubmethod => ({
  id,
  paymentMethodId,
  name,
  active: true,
  createdAt: now(),
  updatedAt: now(),
});

export const createDefaultData = (): AppData => ({
  transactions: [],
  categories: [
    category('cat-exp-food', 'Food', 'expense'),
    category('cat-exp-transport', 'Transport', 'expense'),
    category('cat-exp-housing', 'Housing', 'expense'),
    category('cat-exp-services', 'Services', 'expense'),
    category('cat-exp-health', 'Health', 'expense'),
    category('cat-exp-entertainment', 'Entertainment', 'expense'),
    category('cat-exp-shopping', 'Shopping', 'expense'),
    category('cat-exp-education', 'Education', 'expense'),
    category('cat-exp-subscriptions', 'Subscriptions', 'expense'),
    category('cat-exp-other', 'Other', 'expense'),
    category('cat-inc-salary', 'Salary', 'income'),
    category('cat-inc-freelance', 'Freelance', 'income'),
    category('cat-inc-sales', 'Sales', 'income'),
    category('cat-inc-refunds', 'Refunds', 'income'),
    category('cat-inc-other', 'Other', 'income'),
  ],
  subcategories: [
    subcategory('sub-food-groceries', 'cat-exp-food', 'Groceries'),
    subcategory('sub-food-delivery', 'cat-exp-food', 'Delivery'),
    subcategory('sub-transport-fuel', 'cat-exp-transport', 'Fuel'),
    subcategory('sub-transport-rides', 'cat-exp-transport', 'Rides'),
    subcategory('sub-housing-rent', 'cat-exp-housing', 'Rent'),
    subcategory('sub-services-electricity', 'cat-exp-services', 'Electricity'),
    subcategory('sub-services-internet', 'cat-exp-services', 'Internet'),
    subcategory('sub-health-pharmacy', 'cat-exp-health', 'Pharmacy'),
    subcategory('sub-entertainment-streaming', 'cat-exp-entertainment', 'Streaming'),
    subcategory('sub-shopping-clothes', 'cat-exp-shopping', 'Clothes'),
    subcategory('sub-education-courses', 'cat-exp-education', 'Courses'),
    subcategory('sub-subscriptions-software', 'cat-exp-subscriptions', 'Software'),
    subcategory('sub-income-payroll', 'cat-inc-salary', 'Payroll'),
    subcategory('sub-income-projects', 'cat-inc-freelance', 'Projects'),
    subcategory('sub-income-marketplace', 'cat-inc-sales', 'Marketplace'),
    subcategory('sub-income-reimbursements', 'cat-inc-refunds', 'Reimbursements'),
  ],
  paymentMethods: [
    paymentMethod('pay-cash', 'Cash'),
    paymentMethod('pay-transfer', 'Transfer'),
    paymentMethod('pay-credit-card', 'Credit card'),
    paymentMethod('pay-debit-card', 'Debit card'),
  ],
  paymentSubmethods: [
    paymentSubmethod('subpay-cash-wallet', 'pay-cash', 'Wallet'),
    paymentSubmethod('subpay-transfer-mercado-pago', 'pay-transfer', 'Mercado Pago'),
    paymentSubmethod('subpay-transfer-bank', 'pay-transfer', 'Bank transfer'),
    paymentSubmethod('subpay-credit-visa', 'pay-credit-card', 'Visa'),
    paymentSubmethod('subpay-credit-mastercard', 'pay-credit-card', 'Mastercard'),
    paymentSubmethod('subpay-debit-bank', 'pay-debit-card', 'Bank debit'),
  ],
  budgets: [],
  settings: {
    defaultCurrency: 'ARS',
    biometricLockEnabled: true,
    budgetNearLimitThreshold: 0.8,
  },
});
