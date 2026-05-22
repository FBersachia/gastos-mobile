export type TransactionType = 'expense' | 'income';

export type BudgetStatus = 'available' | 'near-limit' | 'exceeded';

export type TabKey = 'dashboard' | 'transactions' | 'reports' | 'settings';

export type AppLanguage = 'en' | 'es-AR';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmethod {
  id: string;
  paymentMethodId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  categoryId: string;
  subcategoryId?: string;
  paymentMethodId: string;
  paymentSubmethodId?: string;
  description: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultCurrency: string;
  language: AppLanguage;
  biometricLockEnabled: boolean;
  budgetNearLimitThreshold: number;
}

export interface AppData {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  paymentMethods: PaymentMethod[];
  paymentSubmethods: PaymentSubmethod[];
  budgets: Budget[];
  settings: AppSettings;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  categoryId: string;
  subcategoryId?: string;
  paymentMethodId: string;
  paymentSubmethodId?: string;
  description: string;
  installmentCount?: number;
  firstInstallmentDate?: string;
}

export interface CurrencySummary {
  currency: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: string;
}

export interface BudgetSummary {
  budget: Budget;
  categoryName: string;
  spent: number;
  usage: number;
  status: BudgetStatus;
}
