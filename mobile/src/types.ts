export type TransactionType = 'expense' | 'income';

export type BudgetStatus = 'available' | 'near-limit' | 'exceeded';

export type TabKey = 'dashboard' | 'transactions' | 'reports' | 'settings';

export type AppLanguage = 'en' | 'es-AR';

export type ThemeMode = 'light' | 'dark';

export type PremiumProductId = 'premium_lifetime' | 'premium_monthly' | 'premium_yearly';

export type PremiumFeature = 'darkMode' | 'cashBoxReport' | 'monthlyCsvExport' | 'monthlyPdfExport';

export type PremiumProductType = 'inapp' | 'subs';

export interface PremiumEntitlement {
  active: boolean;
  productId?: PremiumProductId;
  productType?: PremiumProductType;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  cashBoxId?: string;
  icon?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashBox {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  icon?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSubmethod {
  id: string;
  paymentMethodId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: Date;
  categoryId: string;
  subcategoryId?: string;
  paymentMethodId?: string;
  paymentSubmethodId?: string;
  assignedPersonId?: string;
  name: string;
  description: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentInterestRate?: number;
  installmentBaseAmount?: number;
  installmentFinancedTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  subcategoryId?: string;
  categoryId?: string;
  amount: number;
  currency: string;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  defaultCurrency: string;
  defaultPaymentSubmethodId?: string;
  language: AppLanguage;
  themeMode: ThemeMode;
  premiumEntitlement: PremiumEntitlement;
  biometricLockEnabled: boolean;
  budgetNearLimitThreshold: number;
}

export interface AppData {
  transactions: Transaction[];
  cashBoxes: CashBox[];
  categories: Category[];
  subcategories: Subcategory[];
  paymentMethods: PaymentMethod[];
  paymentSubmethods: PaymentSubmethod[];
  people: Person[];
  budgets: Budget[];
  settings: AppSettings;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  currency: string;
  date: Date;
  categoryId: string;
  subcategoryId?: string;
  paymentMethodId?: string;
  paymentSubmethodId?: string;
  assignedPersonId?: string;
  name: string;
  description: string;
  installmentCount?: number;
  installmentInterestRate?: number;
  firstInstallmentDate?: Date;
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

export interface CashBoxSummary {
  cashBoxId?: string;
  cashBoxName: string;
  amount: number;
  currency: string;
}

export interface PersonSummary {
  personId?: string;
  personName: string;
  amount: number;
  currency: string;
}

export interface BudgetSummary {
  budget: Budget;
  categoryName: string;
  subcategoryName: string;
  requiresSubcategory: boolean;
  spent: number;
  usage: number;
  status: BudgetStatus;
}
