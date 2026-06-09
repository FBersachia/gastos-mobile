import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { ErrorCode, finishTransaction as finishStoreTransaction, getAvailablePurchases as getStoreAvailablePurchases, useIAP } from 'expo-iap';
import type { Product, ProductSubscription, Purchase } from 'expo-iap';
import * as FileSystem from 'expo-file-system/legacy';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Apple,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Beer,
  Bike,
  Bone,
  Briefcase,
  BusFront,
  CakeSlice,
  Cannabis,
  Car,
  CarTaxiFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Delete,
  DollarSign,
  Dumbbell,
  Film,
  Gamepad2,
  GraduationCap,
  Globe2,
  Hamburger,
  HandCoins,
  HeartPulse,
  Home,
  HousePlug,
  Info,
  LampDesk,
  List,
  Lock,
  MoreHorizontal,
  Music,
  Package,
  Pencil,
  Phone,
  Pill,
  Pizza,
  Plus,
  PawPrint,
  Receipt,
  RefreshCcw,
  Repeat,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trophy,
  Trash2,
  Utensils,
  UtensilsCrossed,
  UserRound,
  WashingMachine,
  WalletCards,
  X,
  Zap,
} from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import appConfig from './app.json';
import { AppSafeAreaProvider, AppSafeAreaView } from './src/AppSafeArea';
import { appDataFromDevFixturePayload, type DevAppDataPayload } from './src/devFixtures';
import {
  canSelectThemeMode,
  canUsePremiumFeature,
  DEFAULT_PREMIUM_ENTITLEMENT,
  isPremiumActive,
  isPremiumProductId,
  PREMIUM_IN_APP_PRODUCT_IDS,
  PREMIUM_SUBSCRIPTION_PRODUCT_IDS,
} from './src/premium';
import { loadAppData, saveAppData } from './src/storage';
import { AppThemeColors, fonts, getThemeColors, lightColors, radius, spacing } from './src/theme';
import {
  AppData,
  AppLanguage,
  BudgetSummary,
  CashBox,
  CashBoxSummary,
  Category,
  CategorySummary,
  CurrencySummary,
  PaymentMethod,
  PaymentSubmethod,
  Person,
  PersonSummary,
  PremiumEntitlement,
  PremiumProductId,
  PremiumProductType,
  Subcategory,
  TabKey,
  ThemeMode,
  Transaction,
  TransactionInput,
  TransactionType,
} from './src/types';
import {
  addMonths,
  amountExpressionNeedsResolution,
  applyInstallmentInterest,
  calendarWeeksForMonth,
  dateFromInput,
  deactivateById,
  dateInputFromDate,
  evaluateAmountExpression,
  formatAmountPreview,
  formatMoney,
  generateId,
  getMonthParts,
  installmentTransactionName,
  monthlyReportToCsv,
  monthlyReportToHtml,
  monthLabel,
  monthStartInput,
  monthlyTransactions,
  normalizeCurrency,
  paymentMethodIdForTransaction,
  roundMoney,
  shiftMonth,
  splitInstallmentsWithInterest,
  personName,
  summarizeBudgets,
  summarizeByCurrency,
  summarizeExpensesByCashBox,
  summarizeExpensesByCategory,
  summarizeExpensesByParentPaymentMethod,
  summarizeExpensesByPerson,
  todayInput,
} from './src/utils';

type AuthStatus = 'checking' | 'authenticated' | 'locked' | 'unavailable';
type ScreenSize = 'compact' | 'regular' | 'large';

type ResponsiveInfo = {
  width: number;
  height: number;
  screenSize: ScreenSize;
  isCompact: boolean;
  isLarge: boolean;
};

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type PremiumPurchaseBusyState = PremiumProductId | 'restore' | undefined;

type PremiumProductDisplay = {
  productId: PremiumProductId;
  productType: PremiumProductType;
  title: string;
  displayPrice?: string;
  available: boolean;
};

type PremiumVerificationResponse = PremiumEntitlement & {
  reason?: string;
};

const getScreenSize = (width: number): ScreenSize => {
  if (width < 360) return 'compact';
  if (width < 430) return 'regular';
  return 'large';
};

const defaultResponsive: ResponsiveInfo = {
  width: 390,
  height: 844,
  screenSize: 'regular',
  isCompact: false,
  isLarge: false,
};

const ResponsiveContext = createContext<ResponsiveInfo>(defaultResponsive);

const useResponsive = () => useContext(ResponsiveContext);

const translations = {
  en: {
    addCategory: 'Add category',
    addMethod: 'Add method',
    addPerson: 'Add person',
    addSubcategory: 'Add subcategory',
    addSubmethod: 'Add submethod',
    addTransaction: 'Add transaction',
    allInstallments: 'All installments',
    amount: 'Amount',
    assignedPerson: 'Assigned person',
    about: 'About',
    aboutAppByInflatrack: 'An Inflatrack app.',
    aboutIntro:
      'Inflatrack helps track personal expenses, income, budgets and payment methods on this device.',
    aboutSubtitle: 'Inflatrack, legal and version',
    activeCategories: 'active categories',
    activeInstallmentPlans: 'active installment plans',
    activeMethods: 'active methods',
    activePeople: 'active people',
    activeSubcategories: 'active subcategories',
    actionCannotBeUndone: 'This action cannot be undone.',
    balance: 'Balance',
    backToDashboard: 'Back to dashboard',
    backToReports: 'Back to reports',
    backToSettings: 'Back to settings',
    biometricLock: 'Biometric access',
    biometricLockDescription: 'Require device authentication when opening the app.',
    biometricLockDisabled: 'Off',
    biometricLockEnabled: 'On',
    budgetInvalidMessage: 'Select a subcategory and enter an amount greater than zero.',
    budgetInvalidTitle: 'Invalid budget',
    budgetNeedsSubcategoryMessage: 'Choose a subcategory to activate this budget.',
    budgetNeedsSubcategoryStatus: 'Needs subcategory',
    budgetProgressOf: 'of',
    budgetStatusAvailable: 'Available',
    budgetStatusExceeded: 'Exceeded',
    budgetStatusNearLimit: 'Near limit',
    budgets: 'Monthly budgets',
    budgetListTitle: 'Budget list',
    byCategory: 'By category',
    byCashBox: 'By cash box',
    byPerson: 'By assigned person',
    byPaymentMethod: 'By payment method',
    byPaymentSubmethod: 'By payment submethod',
    bySubcategory: 'By subcategory',
    cancel: 'Cancel',
    cancelEdit: 'Cancel edit',
    categories: 'Categories',
    categoryListTitle: 'Category list',
    categoryName: 'Category name',
    cashBox: 'Cash box',
    cashBoxCategoryAssignments: 'Cash box category assignments',
    cashBoxes: 'Cash boxes',
    cashBoxesWithExpenses: 'cash boxes with expenses',
    changeSubcategory: 'Change subcategory',
    chooseSubcategory: 'Choose subcategory',
    closeTransactionDetail: 'Close transaction detail',
    closeTransactionForm: 'Close transaction form',
    closeMoreOptions: 'Close more options',
    confirm: 'Confirm',
    coreSettings: 'Core settings',
    currency: 'Currency',
    custom: 'Custom',
    date: 'Date',
    calculateAmount: 'Calculate amount',
    defaultCurrency: 'Default currency',
    defaultPaymentMethod: 'Default payment',
    defaultPayment: 'Default',
    delete: 'Delete',
    deleteBudget: 'Delete budget',
    deleteInstallmentGroup: 'Delete installment group',
    deleteLastDigit: 'Delete last digit',
    deleteMethod: 'Delete payment method',
    deletePerson: 'Delete person',
    deleteSubcategory: 'Delete subcategory',
    deleteSubmethod: 'Delete payment submethod',
    deleteTransaction: 'Delete transaction',
    description: 'Description',
    disable: 'Disable',
    edit: 'Edit',
    editBudget: 'Edit budget',
    editTransaction: 'Edit transaction',
    exportCsv: 'Export CSV',
    exportFailedMessage: 'The monthly report could not be exported.',
    exportFailedTitle: 'Export failed',
    exportPdf: 'Export PDF',
    devFixtureLoadFailedMessage: 'Start the local fixture server or set EXPO_PUBLIC_DEV_FIXTURE_URL.',
    devFixtureLoadFailedTitle: 'Dev data not loaded',
    devFixtureLoadedMessage: 'June 2026 local data is ready in Reports.',
    devFixtureLoadedTitle: 'Dev data loaded',
    expense: 'Expense',
    expenseCategory: 'Expense category',
    expenseSubcategory: 'Expense subcategory',
    expenses: 'Expenses',
    fixedCashBoxes: 'fixed cash boxes',
    icon: 'Icon',
    income: 'Income',
    incomeCategory: 'Income category',
    installments: 'Installments',
    installmentInterest: 'Installment interest',
    invalidAmountMessage: 'Enter an amount greater than zero.',
    invalidAmountTitle: 'Invalid amount',
    invalidDateMessage: 'Use YYYY-MM-DD format.',
    invalidDateTitle: 'Invalid date',
    invalidInterestMessage: 'Use an interest rate equal to or greater than zero.',
    invalidInterestTitle: 'Invalid interest',
    invalidInstallmentsMessage: 'Use two or more installments.',
    invalidInstallmentsTitle: 'Invalid installments',
    language: 'Language',
    languageEnglish: 'English',
    languageSpanishArgentina: 'Español (Argentina)',
    loadDevMonthlyReportFixture: 'Load June 2026 dev data',
    memo: 'Memo',
    missingFieldsMessage: 'Category and subcategory are required. Expenses also need a payment submethod.',
    missingFieldsTitle: 'Missing fields',
    moreOptions: 'More options',
    monthlyExport: 'Monthly export',
    monthlyExportSubtitle: 'CSV and PDF for the selected month',
    monthlyReport: 'Monthly report',
    premium: 'Premium',
    premiumActive: 'Premium active',
    premiumBadge: 'Premium',
    premiumBackendMissing: 'Set EXPO_PUBLIC_PREMIUM_API_URL to enable purchases.',
    premiumBuyLifetime: 'Buy lifetime access',
    premiumFeatureCashBoxReport: 'Cash box report',
    premiumFeatureCsv: 'CSV export',
    premiumFeatureDarkMode: 'Dark mode',
    premiumFeaturePdf: 'PDF export',
    premiumInactive: 'Free plan',
    premiumLifetime: 'Lifetime Premium',
    premiumLockedMessage: 'Unlock Premium to use this feature.',
    premiumLockedSubtitle: 'Premium feature',
    premiumMonthly: 'Monthly Premium',
    premiumNotAvailable: 'Premium is available on Android through Google Play.',
    premiumProductUnavailable: 'This product is not available from Google Play yet.',
    premiumPurchaseFailedMessage: 'The purchase could not be completed or verified.',
    premiumPurchaseFailedTitle: 'Purchase failed',
    premiumPurchaseSuccessMessage: 'Premium is active on this device.',
    premiumPurchaseSuccessTitle: 'Premium active',
    premiumRestore: 'Restore purchases',
    premiumRestoreFailedMessage: 'Purchases could not be restored.',
    premiumRestoreNone: 'No active Premium purchase was found.',
    premiumRestoreSuccess: 'Premium purchase restored.',
    premiumStoreLoading: 'Connecting to Google Play.',
    premiumStatus: 'Status',
    premiumSubtitle: 'Dark mode, cash boxes and exports',
    premiumVerifying: 'Verifying purchase',
    premiumYearly: 'Yearly Premium',
    newCategory: 'New category',
    newMethod: 'New method',
    newPerson: 'New person',
    newSubcategory: 'New subcategory',
    newSubmethod: 'New submethod',
    newTransaction: 'New transaction',
    noActiveCategories: 'No active categories available',
    nextMonth: 'Next month',
    noActivePaymentSubmethods: 'No active payment submethods available.',
    noActivePeople: 'No active people available.',
    noActiveSubcategories: 'No active subcategories available',
    noActiveSubmethods: 'No active submethods.',
    noCategoryExpenses: 'No category expenses this month',
    noCashBox: 'No cash box',
    noCashBoxExpenses: 'No cash box expenses this month',
    noExpenses: 'No expenses this month',
    noExpensesFound: 'No expenses found',
    noInstallments: 'No active installments this month',
    noMovements: 'No movements this month',
    noParentCategory: 'No parent category',
    noPaymentMethodExpenses: 'No payment method expenses this month',
    noPaymentOptions: 'No payment options',
    noPerson: 'No person',
    noPersonExpenses: 'No assigned person expenses this month',
    noDefaultPayment: 'No default payment selected',
    noSubcategoryExpenses: 'No subcategory expenses this month',
    noSubmethodExpenses: 'No submethod expenses this month',
    noTransactions: 'No transactions in the selected month',
    of: 'of',
    optional: 'Optional',
    parentCategory: 'Parent category',
    parentPaymentMethod: 'Parent payment method',
    payment: 'Payment',
    paymentMethodListTitle: 'Payment method list',
    paymentMethodName: 'Payment method name',
    paymentMethods: 'Payment methods',
    paymentMethodsWithExpenses: 'payment methods with expenses',
    paymentSubmethod: 'Payment submethod',
    people: 'People',
    peopleWithExpenses: 'people with expenses',
    personName: 'Person name',
    previousMonth: 'Previous month',
    reports: 'Reports',
    save: 'Save',
    saveBudget: 'Save budget',
    saveCurrency: 'Save currency',
    saveDefaultPayment: 'Save default payment',
    setDefaultPayment: 'Set default',
    saveExpense: 'Save expense',
    saveIncome: 'Save income',
    cancelBudgetEdit: 'Cancel budget edit',
    settings: 'Settings',
    single: 'Single',
    softDeleteMessage: 'It will be hidden from new entries, while historical transactions keep their references.',
    storageErrorMessage: 'The local data store could not be loaded.',
    storageErrorSaveMessage: 'The last change could not be saved locally.',
    storageErrorTitle: 'Storage error',
    subcategories: 'Subcategories',
    subcategoryListTitle: 'Subcategory list',
    submethodsWithExpenses: 'submethods with expenses',
    categoriesWithExpenses: 'categories with expenses',
    subcategoriesWithExpenses: 'subcategories with expenses',
    subcategoryName: 'Subcategory name',
    categoriesAssigned: 'categories assigned',
    noCashBoxCategories: 'No active categories assigned to this cash box',
    today: 'Today',
    termsBody:
      'By using this app you agree to use it responsibly and to verify the information you enter. The app is provided as a financial organization tool and does not replace accounting, tax or legal advice. Inflatrack may update functionality, correct errors or change availability in future versions.',
    termsTitle: 'Terms and conditions',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    transactions: 'Transactions',
    transactionName: 'Reference',
    type: 'Type',
    uncategorized: 'Uncategorized',
    updated: 'Updated',
    updateBudget: 'Update budget',
    created: 'Created',
    none: 'None',
    installment: 'Installment',
    total: 'total',
    totalFinanced: 'Total financed',
    version: 'Version',
    website: 'Website',
    privacyBody:
      'Inflatrack stores your financial records locally on this device. Inflatrack does not create accounts, upload your records to its own servers, use analytics, show ads, sell information, or access your local records. CSV/PDF exports are created only when you choose to export or share them. Premium purchase verification contacts the Inflatrack backend with the Google Play product ID and purchase token only; it does not send movements, amounts, categories, budgets, notes, or other financial records. You can delete local data by clearing app storage or uninstalling the app. Privacy inquiries: privacidad@inflatrack.com.ar.',
    privacyPolicyLink: 'Privacy policy URL',
    privacyTitle: 'Privacy policy',
  },
  'es-AR': {
    addCategory: 'Agregar categoría',
    addMethod: 'Agregar método',
    addPerson: 'Agregar persona',
    addSubcategory: 'Agregar subcategoría',
    addSubmethod: 'Agregar submétodo',
    addTransaction: 'Agregar movimiento',
    allInstallments: 'Todas las cuotas',
    amount: 'Importe',
    assignedPerson: 'Persona asignada',
    about: 'Acerca de',
    aboutAppByInflatrack: 'Una app de Inflatrack.',
    aboutIntro:
      'Inflatrack ayuda a registrar gastos, ingresos, presupuestos y medios de pago en este dispositivo.',
    aboutSubtitle: 'Inflatrack, legales y versión',
    activeCategories: 'categorías activas',
    activeInstallmentPlans: 'planes de cuotas activos',
    activeMethods: 'métodos activos',
    activePeople: 'personas activas',
    activeSubcategories: 'subcategorías activas',
    actionCannotBeUndone: 'Esta acción no se puede deshacer.',
    balance: 'Saldo',
    backToDashboard: 'Volver al tablero',
    backToReports: 'Volver a reportes',
    backToSettings: 'Volver a ajustes',
    biometricLock: 'Acceso biometrico',
    biometricLockDescription: 'Solicitar autenticacion del dispositivo al abrir la app.',
    biometricLockDisabled: 'Desactivado',
    biometricLockEnabled: 'Activado',
    budgetInvalidMessage: 'Selecciona una subcategoria e ingresa un importe mayor que cero.',
    budgetNeedsSubcategoryMessage: 'ElegÃ­ una subcategorÃ­a para activar este presupuesto.',
    budgetNeedsSubcategoryStatus: 'Requiere subcategorÃ­a',
    budgetInvalidTitle: 'Presupuesto inválido',
    budgetProgressOf: 'de',
    budgetStatusAvailable: 'Disponible',
    budgetStatusExceeded: 'Excedido',
    budgetStatusNearLimit: 'Cerca del límite',
    budgets: 'Presupuestos mensuales',
    budgetListTitle: 'Listado de presupuestos',
    byCategory: 'Por categoría',
    byCashBox: 'Por caja',
    byPerson: 'Por persona asignada',
    byPaymentMethod: 'Por método de pago',
    byPaymentSubmethod: 'Por submétodo de pago',
    bySubcategory: 'Por subcategoría',
    cancel: 'Cancelar',
    cancelEdit: 'Cancelar edición',
    categories: 'Categorías',
    categoryListTitle: 'Listado de categorías',
    categoryName: 'Nombre de categoría',
    cashBox: 'Caja',
    cashBoxCategoryAssignments: 'Asignación de categorías a cajas',
    cashBoxes: 'Cajas',
    cashBoxesWithExpenses: 'cajas con gastos',
    changeSubcategory: 'Cambiar subcategoria',
    chooseSubcategory: 'Elegir subcategoria',
    closeTransactionDetail: 'Cerrar detalle del movimiento',
    closeTransactionForm: 'Cerrar formulario de movimiento',
    closeMoreOptions: 'Cerrar mas opciones',
    confirm: 'Confirmar',
    coreSettings: 'Ajustes principales',
    currency: 'Moneda',
    custom: 'Personalizado',
    date: 'Fecha',
    calculateAmount: 'Calcular importe',
    defaultCurrency: 'Moneda predeterminada',
    defaultPaymentMethod: 'Pago predeterminado',
    defaultPayment: 'Predeterminado',
    delete: 'Eliminar',
    deleteBudget: 'Eliminar presupuesto',
    deleteInstallmentGroup: 'Eliminar grupo de cuotas',
    deleteLastDigit: 'Borrar último dígito',
    deleteMethod: 'Eliminar metodo de pago',
    deletePerson: 'Eliminar persona',
    deleteSubcategory: 'Eliminar subcategoria',
    deleteSubmethod: 'Eliminar submetodo de pago',
    deleteTransaction: 'Eliminar movimiento',
    description: 'Descripción',
    disable: 'Desactivar',
    edit: 'Editar',
    editBudget: 'Editar presupuesto',
    editTransaction: 'Editar movimiento',
    exportCsv: 'Exportar CSV',
    exportFailedMessage: 'No se pudo exportar el reporte mensual.',
    exportFailedTitle: 'Error de exportacion',
    exportPdf: 'Exportar PDF',
    devFixtureLoadFailedMessage: 'Inicia el servidor local de fixture o configura EXPO_PUBLIC_DEV_FIXTURE_URL.',
    devFixtureLoadFailedTitle: 'No se cargaron los datos dev',
    devFixtureLoadedMessage: 'Los datos locales de junio 2026 estan listos en Reportes.',
    devFixtureLoadedTitle: 'Datos dev cargados',
    expense: 'Gasto',
    expenseCategory: 'Categoría de gasto',
    expenseSubcategory: 'Subcategoria de gasto',
    expenses: 'Gastos',
    fixedCashBoxes: 'cajas fijas',
    icon: 'Ícono',
    income: 'Ingreso',
    incomeCategory: 'Categoria de ingreso',
    installments: 'Cuotas',
    installmentInterest: 'Interes en cuotas',
    invalidAmountMessage: 'Ingresá un importe mayor que cero.',
    invalidAmountTitle: 'Importe inválido',
    invalidDateMessage: 'Usá el formato YYYY-MM-DD.',
    invalidDateTitle: 'Fecha inválida',
    invalidInterestMessage: 'Usa un interes igual o mayor que cero.',
    invalidInterestTitle: 'Interes invalido',
    invalidInstallmentsMessage: 'Usá dos o más cuotas.',
    invalidInstallmentsTitle: 'Cuotas inválidas',
    language: 'Idioma',
    languageEnglish: 'English',
    languageSpanishArgentina: 'Español (Argentina)',
    loadDevMonthlyReportFixture: 'Cargar datos dev junio 2026',
    memo: 'Nota',
    missingFieldsMessage: 'La categoría y la subcategoría son obligatorias. Los gastos también necesitan submétodo de pago.',
    missingFieldsTitle: 'Faltan datos',
    moreOptions: 'Mas opciones',
    monthlyExport: 'Exportacion mensual',
    monthlyExportSubtitle: 'CSV y PDF del mes seleccionado',
    monthlyReport: 'Reporte mensual',
    premium: 'Premium',
    premiumActive: 'Premium activo',
    premiumBadge: 'Premium',
    premiumBackendMissing: 'Configura EXPO_PUBLIC_PREMIUM_API_URL para habilitar compras.',
    premiumBuyLifetime: 'Comprar acceso permanente',
    premiumFeatureCashBoxReport: 'Reporte por cajas',
    premiumFeatureCsv: 'Exportacion CSV',
    premiumFeatureDarkMode: 'Modo oscuro',
    premiumFeaturePdf: 'Exportacion PDF',
    premiumInactive: 'Plan gratis',
    premiumLifetime: 'Premium permanente',
    premiumLockedMessage: 'Desbloquea Premium para usar esta funcion.',
    premiumLockedSubtitle: 'Funcion Premium',
    premiumMonthly: 'Premium mensual',
    premiumNotAvailable: 'Premium esta disponible en Android a traves de Google Play.',
    premiumProductUnavailable: 'Este producto todavia no esta disponible en Google Play.',
    premiumPurchaseFailedMessage: 'No se pudo completar o verificar la compra.',
    premiumPurchaseFailedTitle: 'Error de compra',
    premiumPurchaseSuccessMessage: 'Premium esta activo en este dispositivo.',
    premiumPurchaseSuccessTitle: 'Premium activo',
    premiumRestore: 'Restaurar compras',
    premiumRestoreFailedMessage: 'No se pudieron restaurar las compras.',
    premiumRestoreNone: 'No se encontro una compra Premium activa.',
    premiumRestoreSuccess: 'Compra Premium restaurada.',
    premiumStoreLoading: 'Conectando con Google Play.',
    premiumStatus: 'Estado',
    premiumSubtitle: 'Modo oscuro, cajas y exportaciones',
    premiumVerifying: 'Verificando compra',
    premiumYearly: 'Premium anual',
    newCategory: 'Nueva categoría',
    newMethod: 'Nuevo método',
    newPerson: 'Nueva persona',
    newSubcategory: 'Nueva subcategoría',
    newSubmethod: 'Nuevo submétodo',
    newTransaction: 'Nuevo movimiento',
    noActiveCategories: 'No hay categorías activas disponibles',
    nextMonth: 'Mes siguiente',
    noActivePaymentSubmethods: 'No hay submétodos de pago activos.',
    noActivePeople: 'No hay personas activas.',
    noActiveSubcategories: 'No hay subcategorías activas disponibles',
    noActiveSubmethods: 'No hay submétodos activos.',
    noCategoryExpenses: 'No hay gastos por categoría este mes',
    noCashBox: 'Sin caja',
    noCashBoxExpenses: 'No hay gastos por caja este mes',
    noExpenses: 'No hay gastos este mes',
    noExpensesFound: 'No se encontraron gastos',
    noInstallments: 'No hay cuotas activas este mes',
    noMovements: 'No hay movimientos este mes',
    noParentCategory: 'Sin categoría padre',
    noPaymentMethodExpenses: 'No hay gastos por método de pago este mes',
    noPaymentOptions: 'No hay opciones de pago',
    noPerson: 'Sin persona',
    noPersonExpenses: 'No hay gastos por persona este mes',
    noDefaultPayment: 'Sin pago predeterminado',
    noSubcategoryExpenses: 'No hay gastos por subcategoría este mes',
    noSubmethodExpenses: 'No hay gastos por submétodo este mes',
    noTransactions: 'No hay movimientos en el mes seleccionado',
    of: 'de',
    optional: 'Opcional',
    parentCategory: 'Categoría padre',
    parentPaymentMethod: 'Método de pago padre',
    payment: 'Pago',
    paymentMethodListTitle: 'Listado de métodos de pago',
    paymentMethodName: 'Nombre del método de pago',
    paymentMethods: 'Métodos de pago',
    paymentMethodsWithExpenses: 'métodos con gastos',
    paymentSubmethod: 'Submétodo de pago',
    people: 'Personas',
    peopleWithExpenses: 'personas con gastos',
    personName: 'Nombre de persona',
    previousMonth: 'Mes anterior',
    reports: 'Reportes',
    save: 'Guardar',
    saveBudget: 'Guardar presupuesto',
    saveCurrency: 'Guardar moneda',
    saveDefaultPayment: 'Guardar pago predeterminado',
    setDefaultPayment: 'Usar por defecto',
    saveExpense: 'Guardar gasto',
    saveIncome: 'Guardar ingreso',
    cancelBudgetEdit: 'Cancelar edición',
    settings: 'Ajustes',
    single: 'Única',
    softDeleteMessage: 'Se ocultara en nuevas cargas y los movimientos historicos conservaran sus referencias.',
    storageErrorMessage: 'No se pudo cargar el almacenamiento local.',
    storageErrorSaveMessage: 'No se pudo guardar el último cambio localmente.',
    storageErrorTitle: 'Error de almacenamiento',
    subcategories: 'Subcategorías',
    subcategoryListTitle: 'Listado de subcategorías',
    submethodsWithExpenses: 'submétodos con gastos',
    categoriesWithExpenses: 'categorías con gastos',
    subcategoriesWithExpenses: 'subcategorías con gastos',
    subcategoryName: 'Nombre de subcategoría',
    categoriesAssigned: 'categorías asignadas',
    noCashBoxCategories: 'No hay categorías activas asignadas a esta caja',
    today: 'Hoy',
    termsBody:
      'Al usar esta app aceptás utilizarla de forma responsable y verificar la información que cargás. La app se entrega como una herramienta de organización financiera y no reemplaza asesoramiento contable, impositivo ni legal. Inflatrack puede actualizar funcionalidades, corregir errores o cambiar disponibilidad en versiones futuras.',
    termsTitle: 'Términos y condiciones',
    theme: 'Tema',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    transactions: 'Movimientos',
    transactionName: 'Referencia',
    type: 'Tipo',
    uncategorized: 'Sin categoría',
    updated: 'Actualizado',
    updateBudget: 'Actualizar presupuesto',
    created: 'Creado',
    none: 'Ninguno',
    installment: 'Cuota',
    total: 'total',
    totalFinanced: 'Total financiado',
    version: 'Versión',
    website: 'Sitio web',
    privacyBody:
      'Inflatrack guarda tus registros financieros localmente en este dispositivo. Inflatrack no crea cuentas, no sube tus registros a servidores propios, no usa analytics, no muestra publicidad, no vende informacion ni accede a tus registros locales. Los CSV/PDF se crean solo cuando elegis exportarlos o compartirlos. La verificacion de compras Premium contacta el backend de Inflatrack solo con el ID de producto de Google Play y el token de compra; no envia movimientos, importes, categorias, presupuestos, notas ni otros registros financieros. Podes eliminar los datos locales borrando el almacenamiento de la app o desinstalandola. Consultas de privacidad: privacidad@inflatrack.com.ar.',
    privacyPolicyLink: 'URL de política de privacidad',
    privacyTitle: 'Política de privacidad',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

type TranslationKey = keyof typeof translations.en;
type Translator = (key: TranslationKey) => string;

const getTranslator = (language: AppLanguage): Translator => (key) => translations[language][key];
const APP_NAME = appConfig.expo.name ?? 'Inflatrack';
const APP_VERSION = appConfig.expo.version ?? '0.0.0';
const INFLATRACK_URL = 'https://www.inflatrack.com.ar';
const INFLATRACK_DISPLAY_URL = 'www.inflatrack.com.ar';
const INFLATRACK_PRIVACY_URL = 'https://www.inflatrack.com.ar/privacy-policy';
const INFLATRACK_PRIVACY_DISPLAY_URL = 'www.inflatrack.com.ar/privacy-policy';
const JUNE_2026_MONTH = new Date(2026, 5, 1);
const JUNE_2026_FIXTURE_FILE = 'monthly-report-2026-06.fixture.json';
let colors = lightColors;

type LocalizedDefaultName = Record<AppLanguage, string>;

const localeForLanguage = (language: AppLanguage): string => (language === 'es-AR' ? 'es-AR' : 'en-US');

const publicEnv = (key: string): string | undefined =>
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key];

const devFixturesEnabled = (): boolean =>
  __DEV__ && publicEnv('EXPO_PUBLIC_ENABLE_DEV_FIXTURES') === '1';

const premiumApiUrl = (): string | undefined => publicEnv('EXPO_PUBLIC_PREMIUM_API_URL')?.replace(/\/+$/, '');

const devFixtureUrl = (): string =>
  publicEnv('EXPO_PUBLIC_DEV_FIXTURE_URL') ??
  `${Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost'}:49206/${JUNE_2026_FIXTURE_FILE}`;

const confirmDestructiveAction = ({
  title,
  message,
  cancelLabel,
  confirmLabel,
  onConfirm,
}: {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
}) => {
  if (Platform.OS === 'web') {
    const browserConfirm = (globalThis as typeof globalThis & { confirm?: (message?: string) => boolean }).confirm;
    if (browserConfirm?.(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

const defaultCategoryNames: Record<string, LocalizedDefaultName> = {
  'cat-exp-food': { en: 'Food', 'es-AR': 'Comida' },
  'cat-exp-transport': { en: 'Transport', 'es-AR': 'Transporte' },
  'cat-exp-housing': { en: 'Housing', 'es-AR': 'Hogar' },
  'cat-exp-services': { en: 'Services', 'es-AR': 'Servicios' },
  'cat-exp-health': { en: 'Health', 'es-AR': 'Salud' },
  'cat-exp-entertainment': { en: 'Entertainment', 'es-AR': 'Entretenimiento' },
  'cat-exp-shopping': { en: 'Shopping', 'es-AR': 'Compras' },
  'cat-exp-education': { en: 'Education', 'es-AR': 'Educación' },
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
  'sub-transport-public-transit': { en: 'Public Transit', 'es-AR': 'Transporte público' },
  'sub-housing-home-goods': { en: 'Home Goods', 'es-AR': 'Insumos hogar' },
  'sub-housing-repairments': { en: 'Repairments', 'es-AR': 'Arreglos' },
  'sub-services-mobile-phone': { en: 'Mobile Phone', 'es-AR': 'Celular' },
  'sub-services-subscriptions': { en: 'Subscriptions', 'es-AR': 'Suscripciones' },
  'sub-health-personal-care': { en: 'Personal Care', 'es-AR': 'Cuidado Personal' },
  'sub-health-hospital': { en: 'Hospital', 'es-AR': 'Hospital' },
  'sub-health-meds': { en: 'Meds', 'es-AR': 'Medicación' },
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
  'sub-personal-drugs': { en: 'Drugs', 'es-AR': 'Drogas' },
  'sub-other-interests': { en: 'Interests', 'es-AR': 'Intereses' },
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

const appLogo = require('./assets/icon.png');
const inflatrackLogo = require('./assets/inflatrack-icon.png');

const tabs: Array<{ key: TabKey; label: string; Icon: IconComponent }> = [
  { key: 'dashboard', label: 'Dashboard', Icon: Home },
  { key: 'reports', label: 'Reports', Icon: BarChart3 },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon },
];

const categoryIconMap: Record<string, IconComponent> = {
  'cat-exp-food': Utensils,
  'cat-exp-transport': Car,
  'cat-exp-housing': Home,
  'cat-exp-services': Zap,
  'cat-exp-health': HeartPulse,
  'cat-exp-entertainment': Film,
  'cat-exp-shopping': ShoppingBag,
  'cat-exp-education': GraduationCap,
  'cat-exp-sports': Dumbbell,
  'cat-exp-insurance': ShieldCheck,
  'cat-exp-pets': PawPrint,
  'cat-exp-personal': UserRound,
  'cat-exp-savings': Banknote,
  'cat-exp-investment': BadgeDollarSign,
  'cat-exp-charity': HandCoins,
  'cat-exp-other': MoreHorizontal,
  'cat-inc-salary': Banknote,
  'cat-inc-freelance': Briefcase,
  'cat-inc-sales': Store,
  'cat-inc-refunds': RefreshCcw,
  'cat-inc-other': MoreHorizontal,
};

const subcategoryIconMap: Record<string, IconComponent> = {
  'sub-food-groceries': ShoppingCart,
  'sub-food-delivery': Package,
  'sub-food-breakfast': Coffee,
  'sub-food-lunch': UtensilsCrossed,
  'sub-food-dinner': Pizza,
  'sub-food-snacks': Cookie,
  'sub-food-burgers': Hamburger,
  'sub-food-beverages': CupSoda,
  'sub-food-drinks': CupSoda,
  'sub-food-cravings': CakeSlice,
  'sub-transport-rides': CarTaxiFront,
  'sub-transport-public-transit': BusFront,
  'sub-housing-home-goods': LampDesk,
  'sub-housing-repairments': HousePlug,
  'sub-services-mobile-phone': Phone,
  'sub-services-subscriptions': Repeat,
  'sub-health-personal-care': Pill,
  'sub-health-hospital': HeartPulse,
  'sub-health-meds': Pill,
  'sub-entertainment-movies': Film,
  'sub-entertainment-games': Gamepad2,
  'sub-entertainment-concerts': Music,
  'sub-shopping-clothing': ShoppingBag,
  'sub-shopping-laundry': WashingMachine,
  'sub-education-books': GraduationCap,
  'sub-education-courses': GraduationCap,
  'sub-education-university': GraduationCap,
  'sub-sports-football': Trophy,
  'sub-sports-gym': Dumbbell,
  'sub-insurance-car': ShieldCheck,
  'sub-pets-food': Bone,
  'sub-savings-reserve': Banknote,
  'sub-investment-assets': BadgeDollarSign,
  'sub-charity-donations': HandCoins,
  'sub-personal-drugs': Pill,
  'sub-other-interests': MoreHorizontal,
  'sub-income-payroll': BadgeDollarSign,
  'sub-income-freelance-projects': Briefcase,
  'sub-income-sales-sales': Store,
  'sub-income-refunds-reimbursements': RefreshCcw,
  'sub-income-other-misc': MoreHorizontal,
};

const categoryAccentMap: Record<string, string> = {
  'cat-exp-food': '#51C7AE',
  'cat-exp-transport': '#51C7AE',
  'cat-exp-housing': '#8CCF5F',
  'cat-exp-services': '#55BBD1',
  'cat-exp-health': '#F0B84D',
  'cat-exp-entertainment': '#55BBD1',
  'cat-exp-shopping': '#F0B84D',
  'cat-exp-education': '#6A8FD8',
  'cat-exp-sports': '#8F75D6',
  'cat-exp-insurance': '#6A8FD8',
  'cat-exp-pets': '#8CCF5F',
  'cat-exp-personal': '#8F75D6',
  'cat-exp-savings': '#51C7AE',
  'cat-exp-investment': '#6A8FD8',
  'cat-exp-charity': '#F0B84D',
  'cat-exp-other': '#7EC8B4',
};

const cashBoxIconMap: Record<string, IconComponent> = {
  'cashbox-basic': Home,
  'cashbox-fun': Film,
  'cashbox-education': GraduationCap,
  'cashbox-savings': Banknote,
  'cashbox-investment': BadgeDollarSign,
  'cashbox-charity': HandCoins,
};

const categoryAccentPalette = ['#51C7AE', '#55BBD1', '#8CCF5F', '#F0B84D', '#8F75D6'];

const categoryIconRules: Array<{ keywords: string[]; Icon: IconComponent }> = [
  { keywords: ['grocer', 'supermarket', 'cart'], Icon: ShoppingCart },
  { keywords: ['food', 'meal', 'restaurant'], Icon: Utensils },
  { keywords: ['fuel'], Icon: Zap },
  { keywords: ['public transit', 'bus', 'sube', 'train'], Icon: BusFront },
  { keywords: ['ride', 'taxi', 'uber', 'didi'], Icon: CarTaxiFront },
  { keywords: ['transport', 'car'], Icon: Car },
  { keywords: ['housing', 'rent', 'home'], Icon: Home },
  { keywords: ['home goods', 'lamp', 'furniture'], Icon: LampDesk },
  { keywords: ['phone', 'mobile'], Icon: Phone },
  { keywords: ['service', 'electric', 'internet', 'utility'], Icon: Zap },
  { keywords: ['health', 'medical', 'pharmacy', 'care'], Icon: HeartPulse },
  { keywords: ['movie', 'streaming'], Icon: Film },
  { keywords: ['game'], Icon: Gamepad2 },
  { keywords: ['entertainment'], Icon: Film },
  { keywords: ['laundry'], Icon: WashingMachine },
  { keywords: ['clothing', 'clothes', 'shirt'], Icon: ShoppingBag },
  { keywords: ['shopping', 'store'], Icon: Store },
  { keywords: ['education', 'course', 'school'], Icon: GraduationCap },
  { keywords: ['music'], Icon: Music },
  { keywords: ['subscription', 'recurring'], Icon: Repeat },
  { keywords: ['sport', 'soccer', 'football'], Icon: Dumbbell },
  { keywords: ['insurance', 'bike'], Icon: ShieldCheck },
  { keywords: ['dog', 'pet food'], Icon: Bone },
  { keywords: ['pet', 'dog'], Icon: PawPrint },
  { keywords: ['saving', 'savings', 'reserve', 'ahorro'], Icon: Banknote },
  { keywords: ['investment', 'asset', 'invest'], Icon: BadgeDollarSign },
  { keywords: ['charity', 'donation', 'donate'], Icon: HandCoins },
  { keywords: ['personal', 'ana'], Icon: UserRound },
  { keywords: ['salary', 'payroll'], Icon: Banknote },
  { keywords: ['freelance', 'project', 'work'], Icon: Briefcase },
  { keywords: ['sale', 'marketplace'], Icon: Store },
  { keywords: ['refund', 'reimbursement'], Icon: RefreshCcw },
  { keywords: ['other', 'misc'], Icon: MoreHorizontal },
];

const subcategoryIconRules: Array<{ keywords: string[]; Icon: IconComponent }> = [
  { keywords: ['grocer', 'supermarket'], Icon: ShoppingCart },
  { keywords: ['delivery'], Icon: Package },
  { keywords: ['breakfast', 'coffee'], Icon: Coffee },
  { keywords: ['lunch'], Icon: UtensilsCrossed },
  { keywords: ['dinner'], Icon: Pizza },
  { keywords: ['snack'], Icon: Cookie },
  { keywords: ['bakery', 'bread'], Icon: Croissant },
  { keywords: ['burger', 'hamburger'], Icon: Hamburger },
  { keywords: ['beverage', 'drink', 'soda'], Icon: CupSoda },
  { keywords: ['craving', 'dessert'], Icon: CakeSlice },
  { keywords: ['ride', 'taxi'], Icon: CarTaxiFront },
  { keywords: ['public transit', 'bus', 'sube', 'train'], Icon: BusFront },
  { keywords: ['home goods', 'lamp'], Icon: LampDesk },
  { keywords: ['repair', 'repairment'], Icon: HousePlug },
  { keywords: ['phone', 'mobile'], Icon: Phone },
  { keywords: ['subscription', 'recurring'], Icon: Repeat },
  { keywords: ['hospital'], Icon: HeartPulse },
  { keywords: ['personal care', 'pharmacy', 'med', 'medicine'], Icon: Pill },
  { keywords: ['clothing', 'clothes'], Icon: ShoppingBag },
  { keywords: ['laundry'], Icon: WashingMachine },
  { keywords: ['concert'], Icon: Music },
  { keywords: ['streaming'], Icon: Film },
  { keywords: ['marketplace'], Icon: Store },
  { keywords: ['music'], Icon: Music },
  { keywords: ['gym'], Icon: Dumbbell },
  { keywords: ['soccer', 'football'], Icon: Trophy },
  { keywords: ['car insurance', 'insurance'], Icon: ShieldCheck },
  { keywords: ['pet food'], Icon: Bone },
  { keywords: ['saving', 'savings', 'reserve', 'ahorro'], Icon: Banknote },
  { keywords: ['investment', 'asset', 'invest'], Icon: BadgeDollarSign },
  { keywords: ['charity', 'donation', 'donate'], Icon: HandCoins },
  { keywords: ['drug', 'cannabis'], Icon: Pill },
  { keywords: ['interest'], Icon: MoreHorizontal },
  { keywords: ['payroll', 'salary'], Icon: BadgeDollarSign },
  { keywords: ['cash', 'wallet'], Icon: HandCoins },
  { keywords: ['home', 'housing'], Icon: HousePlug },
  { keywords: ['fruit'], Icon: Apple },
  { keywords: ['beer'], Icon: Beer },
];

const SUBCATEGORY_ICON_OPTIONS: Array<{ key: string; Icon: IconComponent }> = [
  { key: 'apple', Icon: Apple },
  { key: 'badge-dollar', Icon: BadgeDollarSign },
  { key: 'banknote', Icon: Banknote },
  { key: 'beer', Icon: Beer },
  { key: 'bike', Icon: Bike },
  { key: 'bone', Icon: Bone },
  { key: 'briefcase', Icon: Briefcase },
  { key: 'bus', Icon: BusFront },
  { key: 'cake', Icon: CakeSlice },
  { key: 'cannabis', Icon: Cannabis },
  { key: 'car', Icon: Car },
  { key: 'car-taxi', Icon: CarTaxiFront },
  { key: 'coffee', Icon: Coffee },
  { key: 'cookie', Icon: Cookie },
  { key: 'croissant', Icon: Croissant },
  { key: 'cup-soda', Icon: CupSoda },
  { key: 'dollar', Icon: DollarSign },
  { key: 'dumbbell', Icon: Dumbbell },
  { key: 'film', Icon: Film },
  { key: 'gamepad', Icon: Gamepad2 },
  { key: 'graduation-cap', Icon: GraduationCap },
  { key: 'hamburger', Icon: Hamburger },
  { key: 'hand-coins', Icon: HandCoins },
  { key: 'heart-pulse', Icon: HeartPulse },
  { key: 'home', Icon: Home },
  { key: 'house-plug', Icon: HousePlug },
  { key: 'lamp-desk', Icon: LampDesk },
  { key: 'more', Icon: MoreHorizontal },
  { key: 'music', Icon: Music },
  { key: 'package', Icon: Package },
  { key: 'paw-print', Icon: PawPrint },
  { key: 'phone', Icon: Phone },
  { key: 'pill', Icon: Pill },
  { key: 'pizza', Icon: Pizza },
  { key: 'receipt', Icon: Receipt },
  { key: 'refresh', Icon: RefreshCcw },
  { key: 'repeat', Icon: Repeat },
  { key: 'shield-check', Icon: ShieldCheck },
  { key: 'shopping-bag', Icon: ShoppingBag },
  { key: 'shopping-cart', Icon: ShoppingCart },
  { key: 'store', Icon: Store },
  { key: 'trophy', Icon: Trophy },
  { key: 'utensils', Icon: Utensils },
  { key: 'utensils-crossed', Icon: UtensilsCrossed },
  { key: 'user-round', Icon: UserRound },
  { key: 'washing-machine', Icon: WashingMachine },
  { key: 'wallet-cards', Icon: WalletCards },
  { key: 'zap', Icon: Zap },
];

const subcategoryIconRegistry: Record<string, IconComponent> = Object.fromEntries(
  SUBCATEGORY_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon]),
);

const getCategoryIcon = (category?: Category): IconComponent => {
  if (!category) {
    return MoreHorizontal;
  }

  if (category.icon) {
    const registryIcon = subcategoryIconRegistry[category.icon];
    if (registryIcon) return registryIcon;
  }

  const mappedIcon = categoryIconMap[category.id];

  if (mappedIcon) {
    return mappedIcon;
  }

  const normalizedName = category.name.toLowerCase();
  const rule = categoryIconRules.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  if (rule) {
    return rule.Icon;
  }

  return category.type === 'income' ? DollarSign : Receipt;
};

const getSubcategoryIcon = (subcategory?: Subcategory, category?: Category): IconComponent => {
  if (!subcategory) {
    return getCategoryIcon(category);
  }

  if (subcategory.icon) {
    const registryIcon = subcategoryIconRegistry[subcategory.icon];
    if (registryIcon) return registryIcon;
  }

  const mappedIcon = subcategoryIconMap[subcategory.id];

  if (mappedIcon) {
    return mappedIcon;
  }

  const normalizedName = subcategory.name.toLowerCase();
  const rule = subcategoryIconRules.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  return rule ? rule.Icon : getCategoryIcon(category);
};

const getCashBoxIcon = (cashBox?: CashBox): IconComponent => {
  if (!cashBox) {
    return Package;
  }

  return cashBoxIconMap[cashBox.id] ?? Package;
};

const getCategoryAccentColor = (category?: Category): string => {
  if (!category) {
    return categoryAccentPalette[0];
  }

  const mappedColor = categoryAccentMap[category.id];

  if (mappedColor) {
    return mappedColor;
  }

  const hash = category.name
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return categoryAccentPalette[hash % categoryAccentPalette.length];
};

type TransactionDayGroup = {
  date: Date;
  dateKey: string;
  transactions: Transaction[];
  totalsByCurrency: Array<{ currency: string; income: number; expenses: number; balance: number }>;
};

type SettingsSection =
  | 'menu'
  | 'core'
  | 'premium'
  | 'budgets'
  | 'categories'
  | 'cashboxes'
  | 'subcategories'
  | 'payments'
  | 'people'
  | 'about';

const formatDashboardDate = (date: Date, language: AppLanguage): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = new Intl.DateTimeFormat(localeForLanguage(language), { weekday: 'short' }).format(date);
  const dayMonth =
    language === 'es-AR'
      ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
      : `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;

  return `${dayMonth} ${weekday}`;
};

const formatShortInputDate = (date: Date, language: AppLanguage): string =>
  new Intl.DateTimeFormat(localeForLanguage(language), {
    day: 'numeric',
    month: 'numeric',
  }).format(date);

const formatShortWeekday = (date: Date, language: AppLanguage): string =>
  new Intl.DateTimeFormat(localeForLanguage(language), {
    weekday: 'short',
  }).format(date);

const amountOperatorPattern = /[+-]$/;

const groupTransactionsByDate = (transactions: Transaction[]): TransactionDayGroup[] => {
  const groups = new Map<
    string,
    {
      date: Date;
      transactions: Transaction[];
      totalsByCurrency: Map<string, { income: number; expenses: number; balance: number }>;
    }
  >();

  transactions.forEach((transaction) => {
    const dateKey = dateInputFromDate(transaction.date);
    const current =
      groups.get(dateKey) ??
      ({
        date: transaction.date,
        transactions: [],
        totalsByCurrency: new Map<string, { income: number; expenses: number; balance: number }>(),
      } satisfies {
        date: Date;
        transactions: Transaction[];
        totalsByCurrency: Map<string, { income: number; expenses: number; balance: number }>;
      });

    const totals =
      current.totalsByCurrency.get(transaction.currency) ??
      ({
        income: 0,
        expenses: 0,
        balance: 0,
      } satisfies { income: number; expenses: number; balance: number });

    if (transaction.type === 'income') {
      totals.income = roundMoney(totals.income + transaction.amount);
    } else {
      totals.expenses = roundMoney(totals.expenses + transaction.amount);
    }

    totals.balance = roundMoney(totals.income - totals.expenses);
    current.transactions.push(transaction);
    current.totalsByCurrency.set(transaction.currency, totals);
    groups.set(dateKey, current);
  });

  return Array.from(groups.entries()).map(([dateKey, group]) => ({
    date: group.date,
    dateKey,
    transactions: group.transactions,
    totalsByCurrency: Array.from(group.totalsByCurrency.entries()).map(([currency, totals]) => ({
      currency,
      ...totals,
    })),
  }));
};

const formatExpenseTotals = (totals: TransactionDayGroup['totalsByCurrency']): string =>
  totals.map((total) => formatMoney(total.expenses, total.currency)).join(' | ');

const formatMovementTotals = (totals: TransactionDayGroup['totalsByCurrency']): string =>
  totals
    .flatMap((total) => [
      total.income > 0 ? `+ ${formatMoney(total.income, total.currency)}` : undefined,
      total.expenses > 0 ? `- ${formatMoney(total.expenses, total.currency)}` : undefined,
    ])
    .filter((item): item is string => Boolean(item))
    .join(' | ');

const displayDefaultName = <T extends { id: string; name: string }>(
  item: T | undefined,
  defaults: Record<string, LocalizedDefaultName>,
  language: AppLanguage,
): string | undefined => {
  if (!item) {
    return undefined;
  }

  const defaultName = defaults[item.id];

  return defaultName && item.name === defaultName.en ? defaultName[language] : item.name;
};

const displayCategoryName = (category: Category | undefined, language: AppLanguage): string | undefined =>
  displayDefaultName(category, defaultCategoryNames, language);

const displayCashBoxName = (cashBox: CashBox | undefined, language: AppLanguage): string | undefined =>
  displayDefaultName(cashBox, defaultCashBoxNames, language);

const displaySubcategoryName = (subcategory: Subcategory | undefined, language: AppLanguage): string | undefined =>
  displayDefaultName(subcategory, defaultSubcategoryNames, language);

const displayPaymentMethodName = (method: PaymentMethod | undefined, language: AppLanguage): string | undefined =>
  displayDefaultName(method, defaultPaymentMethodNames, language);

const displayPaymentSubmethodName = (
  submethod: PaymentSubmethod | undefined,
  language: AppLanguage,
): string | undefined => displayDefaultName(submethod, defaultPaymentSubmethodNames, language);

const categoryDisplayName = (data: AppData, categoryId?: string): string | undefined =>
  displayCategoryName(
    categoryId ? data.categories.find((category) => category.id === categoryId) : undefined,
    data.settings.language,
  );

const cashBoxDisplayName = (data: AppData, cashBoxId?: string): string | undefined =>
  displayCashBoxName(
    cashBoxId ? data.cashBoxes.find((cashBox) => cashBox.id === cashBoxId) : undefined,
    data.settings.language,
  );

const subcategoryDisplayName = (data: AppData, subcategoryId?: string): string | undefined =>
  displaySubcategoryName(
    subcategoryId ? data.subcategories.find((subcategory) => subcategory.id === subcategoryId) : undefined,
    data.settings.language,
  );

const transactionCategoryDisplayName = (data: AppData, transaction: Transaction): string | undefined =>
  subcategoryDisplayName(data, transaction.subcategoryId) || categoryDisplayName(data, transaction.categoryId);

const transactionDisplayName = (data: AppData, transaction: Transaction): string | undefined => {
  const categoryName = transactionCategoryDisplayName(data, transaction);
  const rawName = transaction.name || categoryName;

  if (!rawName || !transaction.installmentGroupId || !transaction.installmentNumber || !transaction.totalInstallments) {
    return rawName;
  }

  const baseName = rawName.replace(/\s+-\s+(Installment|Cuota)\s+\d+\/\d+$/i, '').trim();
  const fallbackBase =
    /^(Installment purchase|Compra en cuotas)$/i.test(baseName) || !baseName
      ? ''
      : baseName;

  return installmentTransactionName(
    fallbackBase,
    transaction.installmentNumber,
    transaction.totalInstallments,
    data.settings.language,
  );
};

const paymentMethodDisplayName = (data: AppData, paymentMethodId?: string): string | undefined =>
  displayPaymentMethodName(
    paymentMethodId ? data.paymentMethods.find((method) => method.id === paymentMethodId) : undefined,
    data.settings.language,
  );

const paymentSubmethodDisplayName = (data: AppData, paymentSubmethodId?: string): string | undefined =>
  displayPaymentSubmethodName(
    paymentSubmethodId
      ? data.paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId)
      : undefined,
    data.settings.language,
  );

const personDisplayName = (data: AppData, personId?: string): string | undefined =>
  personName(data, personId) || undefined;

const compareDisplayName =
  <T extends { id: string; name: string }>(defaults: Record<string, LocalizedDefaultName>, language: AppLanguage) =>
  (left: T, right: T): number => {
    const leftName = displayDefaultName(left, defaults, language) ?? left.name;
    const rightName = displayDefaultName(right, defaults, language) ?? right.name;

    return (
      leftName.localeCompare(rightName, language, { sensitivity: 'base' }) ||
      left.id.localeCompare(right.id)
    );
  };

const compareCategoryDisplayName = (language: AppLanguage) =>
  compareDisplayName<Category>(defaultCategoryNames, language);

const compareCashBoxDisplayName = (language: AppLanguage) =>
  compareDisplayName<CashBox>(defaultCashBoxNames, language);

const compareSubcategoryDisplayName = (language: AppLanguage) =>
  compareDisplayName<Subcategory>(defaultSubcategoryNames, language);

export default function App() {
  return (
    <AppSafeAreaProvider>
      <AppRoot />
    </AppSafeAreaProvider>
  );
}

function AppRoot() {
  const { width, height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(monthStartInput());
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>();
  const [editingTransactionId, setEditingTransactionId] = useState<string | undefined>();
  const [requestedSettingsSection, setRequestedSettingsSection] = useState<SettingsSection | undefined>();
  const initialAuthResolved = useRef(false);
  const responsive = useMemo(() => {
    const screenSize = getScreenSize(width);

    return {
      width,
      height,
      screenSize,
      isCompact: screenSize === 'compact',
      isLarge: screenSize === 'large',
    };
  }, [height, width]);
  const t = getTranslator(data?.settings.language ?? 'en');

  useEffect(() => {
    void loadAppData()
      .then(setData)
      .catch(() => {
        Alert.alert(translations.en.storageErrorTitle, translations.en.storageErrorMessage);
      });
  }, []);

  const requestAuthentication = async () => {
    setAuthStatus('checking');

    if (Platform.OS === 'web') {
      setAuthStatus('authenticated');
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setAuthStatus('unavailable');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock ${APP_NAME}`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use device passcode',
        disableDeviceFallback: false,
      });

      setAuthStatus(result.success ? 'authenticated' : 'locked');
    } catch {
      setAuthStatus('locked');
    }
  };

  useEffect(() => {
    if (!data || initialAuthResolved.current) {
      return;
    }

    initialAuthResolved.current = true;

    if (!data.settings.biometricLockEnabled) {
      setAuthStatus('authenticated');
      return;
    }

    void requestAuthentication();
  }, [data]);

  const persistData = (updater: (current: AppData) => AppData) => {
    setData((current) => {
      if (!current) {
        return current;
      }

      const next = updater(current);
      void saveAppData(next).catch(() => {
        const t = getTranslator(next.settings.language);
        Alert.alert(t('storageErrorTitle'), t('storageErrorSaveMessage'));
      });

      return next;
    });
  };

  const updatePremiumEntitlement = useCallback(
    (premiumEntitlement: PremiumEntitlement) => {
      persistData((current) => ({
        ...current,
        settings: {
          ...current.settings,
          premiumEntitlement,
        },
      }));
    },
    [],
  );

  const verifyPremiumPurchase = useCallback(
    async (purchase: Purchase): Promise<PremiumVerificationResponse> => {
      const productId = purchase.productId;

      if (!isPremiumProductId(productId) || !purchase.purchaseToken) {
        return { active: false, reason: 'unsupported-purchase' };
      }

      const apiUrl = premiumApiUrl();
      if (!apiUrl) {
        throw new Error('Premium API URL is not configured.');
      }

      const response = await fetch(`${apiUrl}/v1/google-play/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          purchaseToken: purchase.purchaseToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Premium verification failed with status ${response.status}.`);
      }

      return (await response.json()) as PremiumVerificationResponse;
    },
    [],
  );

  const handleVerifiedPremiumPurchase = useCallback(
    async (purchase: Purchase, showSuccessAlert = true): Promise<boolean> => {
      const t = getTranslator(data?.settings.language ?? 'en');
      const verification = await verifyPremiumPurchase(purchase);

      if (!verification.active || !verification.productId || !verification.productType) {
        return false;
      }

      const entitlement: PremiumEntitlement = {
        active: true,
        productId: verification.productId,
        productType: verification.productType,
        verifiedAt: verification.verifiedAt ?? new Date().toISOString(),
        ...(verification.expiresAt ? { expiresAt: verification.expiresAt } : {}),
      };

      updatePremiumEntitlement(entitlement);
      await finishStoreTransaction({ purchase, isConsumable: false });
      if (showSuccessAlert) {
        Alert.alert(t('premiumPurchaseSuccessTitle'), t('premiumPurchaseSuccessMessage'));
      }
      return true;
    },
    [data?.settings.language, updatePremiumEntitlement, verifyPremiumPurchase],
  );

  const [premiumPurchaseBusy, setPremiumPurchaseBusy] = useState<PremiumPurchaseBusyState>();
  const [premiumStoreError, setPremiumStoreError] = useState<string | undefined>();

  const {
    connected: premiumStoreConnected,
    products: premiumStoreProducts,
    subscriptions: premiumStoreSubscriptions,
    fetchProducts: fetchPremiumProducts,
    requestPurchase: requestPremiumPurchase,
  } = useIAP({
    onPurchaseSuccess: (purchase) => {
      void handleVerifiedPremiumPurchase(purchase)
        .then((verified) => {
          if (!verified) {
            const t = getTranslator(data?.settings.language ?? 'en');
            Alert.alert(t('premiumPurchaseFailedTitle'), t('premiumPurchaseFailedMessage'));
          }
        })
        .catch((error) => {
          console.warn(error);
          const t = getTranslator(data?.settings.language ?? 'en');
          Alert.alert(t('premiumPurchaseFailedTitle'), t('premiumPurchaseFailedMessage'));
        })
        .finally(() => setPremiumPurchaseBusy(undefined));
    },
    onPurchaseError: (error) => {
      setPremiumPurchaseBusy(undefined);
      if (error.code !== ErrorCode.UserCancelled) {
        const t = getTranslator(data?.settings.language ?? 'en');
        Alert.alert(t('premiumPurchaseFailedTitle'), error.message || t('premiumPurchaseFailedMessage'));
      }
    },
    onError: (error) => {
      setPremiumStoreError(error.message);
    },
  });

  useEffect(() => {
    if (Platform.OS !== 'android' || !premiumStoreConnected) {
      return;
    }

    void fetchPremiumProducts({ skus: PREMIUM_IN_APP_PRODUCT_IDS, type: 'in-app' }).catch((error) => {
      console.warn(error);
      setPremiumStoreError(error.message);
    });
    void fetchPremiumProducts({ skus: PREMIUM_SUBSCRIPTION_PRODUCT_IDS, type: 'subs' }).catch((error) => {
      console.warn(error);
      setPremiumStoreError(error.message);
    });
  }, [fetchPremiumProducts, premiumStoreConnected]);

  const premiumProductDisplays = useMemo<PremiumProductDisplay[]>(() => {
    const lifetime = premiumStoreProducts.find((product) => product.id === 'premium_lifetime');
    const monthly = premiumStoreSubscriptions.find((subscription) => subscription.id === 'premium_monthly');
    const yearly = premiumStoreSubscriptions.find((subscription) => subscription.id === 'premium_yearly');
    const displayPrice = (product?: Product | ProductSubscription): string | undefined =>
      product?.subscriptionOffers?.[0]?.displayPrice ?? product?.displayPrice;

    return [
      {
        productId: 'premium_lifetime',
        productType: 'inapp',
        title: t('premiumBuyLifetime'),
        displayPrice: displayPrice(lifetime),
        available: Boolean(lifetime),
      },
      {
        productId: 'premium_monthly',
        productType: 'subs',
        title: t('premiumMonthly'),
        displayPrice: displayPrice(monthly),
        available: Boolean(monthly),
      },
      {
        productId: 'premium_yearly',
        productType: 'subs',
        title: t('premiumYearly'),
        displayPrice: displayPrice(yearly),
        available: Boolean(yearly),
      },
    ];
  }, [premiumStoreProducts, premiumStoreSubscriptions, t]);

  const startPremiumPurchase = async (productId: PremiumProductId) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    if (Platform.OS !== 'android') {
      Alert.alert(t('premium'), t('premiumNotAvailable'));
      return;
    }

    if (!premiumApiUrl()) {
      Alert.alert(t('premium'), t('premiumBackendMissing'));
      return;
    }

    if (productId === 'premium_lifetime') {
      const product = premiumStoreProducts.find((item) => item.id === productId);
      if (!product) {
        Alert.alert(t('premium'), t('premiumProductUnavailable'));
        return;
      }

      setPremiumPurchaseBusy(productId);
      await requestPremiumPurchase({
        type: 'in-app',
        request: {
          google: { skus: [productId] },
        },
      }).catch((error) => {
        console.warn(error);
        setPremiumPurchaseBusy(undefined);
        Alert.alert(t('premiumPurchaseFailedTitle'), t('premiumPurchaseFailedMessage'));
      });
      return;
    }

    const subscription = premiumStoreSubscriptions.find((item) => item.id === productId);
    const offerToken = subscription?.subscriptionOffers?.[0]?.offerTokenAndroid;
    if (!subscription || !offerToken) {
      Alert.alert(t('premium'), t('premiumProductUnavailable'));
      return;
    }

    setPremiumPurchaseBusy(productId);
    await requestPremiumPurchase({
      type: 'subs',
      request: {
        google: {
          skus: [productId],
          subscriptionOffers: [{ sku: productId, offerToken }],
        },
      },
    }).catch((error) => {
      console.warn(error);
      setPremiumPurchaseBusy(undefined);
      Alert.alert(t('premiumPurchaseFailedTitle'), t('premiumPurchaseFailedMessage'));
    });
  };

  const restorePremiumPurchases = async () => {
    const t = getTranslator(data?.settings.language ?? 'en');

    if (Platform.OS !== 'android') {
      Alert.alert(t('premium'), t('premiumNotAvailable'));
      return;
    }

    if (!premiumApiUrl()) {
      Alert.alert(t('premium'), t('premiumBackendMissing'));
      return;
    }

    setPremiumPurchaseBusy('restore');
    try {
      const purchases = await getStoreAvailablePurchases();
      const premiumPurchases = purchases.filter((purchase) => isPremiumProductId(purchase.productId));

      for (const purchase of premiumPurchases) {
        const restored = await handleVerifiedPremiumPurchase(purchase, false);
        if (restored) {
          Alert.alert(t('premiumPurchaseSuccessTitle'), t('premiumRestoreSuccess'));
          return;
        }
      }

      updatePremiumEntitlement(DEFAULT_PREMIUM_ENTITLEMENT);
      Alert.alert(t('premium'), t('premiumRestoreNone'));
    } catch (error) {
      console.warn(error);
      Alert.alert(t('premiumPurchaseFailedTitle'), t('premiumRestoreFailedMessage'));
    } finally {
      setPremiumPurchaseBusy(undefined);
    }
  };

  const openPremiumSettings = () => {
    setRequestedSettingsSection('premium');
    setActiveTab('settings');
  };

  const handleSaveTransaction = (input: TransactionInput, editingTransaction?: Transaction) => {
    const timestamp = new Date();
    const normalizedCurrency = normalizeCurrency(input.currency);
    const paymentMethodId = input.type === 'expense' ? input.paymentMethodId : undefined;
    const paymentSubmethodId = input.type === 'expense' ? input.paymentSubmethodId : undefined;
    const assignedPersonId = input.type === 'expense' ? input.assignedPersonId : undefined;
    const transactionName = input.name.trim();
    const transactionDescription = input.description.trim();

    if (editingTransaction) {
      persistData((current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === editingTransaction.id
            ? {
                ...transaction,
                ...input,
                amount: roundMoney(input.amount),
                currency: normalizedCurrency,
                paymentMethodId,
                paymentSubmethodId,
                assignedPersonId,
                name: transactionName,
                description: transactionDescription,
                updatedAt: timestamp,
              }
            : transaction,
        ),
      }));
      return;
    }

    const isInstallment =
      input.type === 'expense' && input.installmentCount !== undefined && input.installmentCount > 1;
    const groupId = isInstallment ? generateId('installment') : undefined;
    const installmentInterestRate =
      isInstallment && input.installmentInterestRate && input.installmentInterestRate > 0
        ? input.installmentInterestRate
        : undefined;
    const installmentResult = isInstallment
      ? splitInstallmentsWithInterest(input.amount, input.installmentCount ?? 1, installmentInterestRate ?? 0)
      : undefined;
    const amounts = installmentResult?.amounts ?? [input.amount];
    const installmentBaseAmount = isInstallment ? roundMoney(input.amount) : undefined;
    const installmentFinancedTotal = installmentResult?.financedTotal;
    const startDate = input.firstInstallmentDate || input.date;

    const transactions: Transaction[] = amounts.map((amount, index) => ({
      id: generateId('trx'),
      type: input.type,
      amount: roundMoney(amount),
      currency: normalizedCurrency,
      date: isInstallment ? addMonths(startDate, index) : input.date,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      paymentMethodId,
      paymentSubmethodId,
      assignedPersonId,
      name: isInstallment
        ? installmentTransactionName(transactionName, index + 1, amounts.length, data?.settings.language ?? 'en')
        : transactionName,
      description: transactionDescription,
      installmentGroupId: groupId,
      installmentNumber: isInstallment ? index + 1 : undefined,
      totalInstallments: isInstallment ? amounts.length : undefined,
      installmentInterestRate,
      installmentBaseAmount,
      installmentFinancedTotal,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    persistData((current) => ({
      ...current,
      transactions: [...transactions, ...current.transactions],
    }));
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    const t = getTranslator(data?.settings.language ?? 'en');
    const deleteLabel = transaction.installmentGroupId ? t('deleteInstallmentGroup') : t('deleteTransaction');

    confirmDestructiveAction({
      title: deleteLabel,
      message: t('actionCannotBeUndone'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          transactions: current.transactions.filter((item) =>
            transaction.installmentGroupId
              ? item.installmentGroupId !== transaction.installmentGroupId
              : item.id !== transaction.id,
          ),
        })),
    });
  };

  const handleSaveBudget = (subcategoryId: string, amount: number, currency: string, budgetId?: string) => {
    const timestamp = new Date();
    const { month, year } = getMonthParts(selectedMonth);
    const normalizedCurrency = normalizeCurrency(currency);

    persistData((current) => {
      const subcategory = current.subcategories.find((item) => item.id === subcategoryId);

      if (!subcategory) {
        return current;
      }

      if (budgetId) {
        const editingBudget = current.budgets.find((budget) => budget.id === budgetId);

        if (!editingBudget) {
          return current;
        }

        const targetCurrency = normalizedCurrency;
        const existing = current.budgets.find(
          (budget) =>
            budget.id !== budgetId &&
            budget.subcategoryId === subcategoryId &&
            budget.currency === targetCurrency &&
            budget.month === editingBudget.month &&
            budget.year === editingBudget.year,
        );

        if (existing) {
          return {
            ...current,
            budgets: current.budgets.flatMap((budget) => {
              if (budget.id === existing.id) {
                return [
                  {
                    ...budget,
                    subcategoryId,
                    categoryId: subcategory.categoryId,
                    amount: roundMoney(amount),
                    updatedAt: timestamp,
                  },
                ];
              }

              return budget.id === budgetId ? [] : [budget];
            }),
          };
        }

        return {
          ...current,
          budgets: current.budgets.map((budget) =>
            budget.id === budgetId
              ? {
                  ...budget,
                  subcategoryId,
                  categoryId: subcategory.categoryId,
                  amount: roundMoney(amount),
                  currency: targetCurrency,
                  updatedAt: timestamp,
                }
              : budget,
          ),
        };
      }

      const existing = current.budgets.find(
        (budget) =>
          budget.subcategoryId === subcategoryId &&
          budget.currency === normalizedCurrency &&
          budget.month === month &&
          budget.year === year,
      );

      if (existing) {
        return {
          ...current,
          budgets: current.budgets.map((budget) =>
            budget.id === existing.id
              ? {
                  ...budget,
                  amount: roundMoney(amount),
                  updatedAt: timestamp,
                }
              : budget,
          ),
        };
      }

      return {
        ...current,
        budgets: [
          ...current.budgets,
          {
            id: generateId('budget'),
            subcategoryId,
            categoryId: subcategory.categoryId,
            amount: roundMoney(amount),
            currency: normalizedCurrency,
            month,
            year,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      };
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    confirmDestructiveAction({
      title: t('deleteBudget'),
      message: t('actionCannotBeUndone'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          budgets: current.budgets.filter((budget) => budget.id !== budgetId),
        })),
    });
  };

  const handleSetDefaultCurrency = (currency: string) => {
    persistData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        defaultCurrency: normalizeCurrency(currency),
      },
    }));
  };

  const handleSetDefaultPaymentSubmethod = (paymentSubmethodId: string) => {
    persistData((current) => {
      const submethod = current.paymentSubmethods.find(
        (item) => item.id === paymentSubmethodId && item.active,
      );
      const method = current.paymentMethods.find(
        (item) => item.id === submethod?.paymentMethodId && item.active,
      );

      if (!submethod || !method) {
        return current;
      }

      return {
        ...current,
        settings: {
          ...current.settings,
          defaultPaymentSubmethodId: paymentSubmethodId,
        },
      };
    });
  };

  const handleSetLanguage = (language: AppLanguage) => {
    persistData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        language,
      },
    }));
  };

  const handleSetThemeMode = (themeMode: ThemeMode) => {
    persistData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        themeMode,
      },
    }));
  };

  const handleSetBiometricLockEnabled = (enabled: boolean) => {
    persistData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        biometricLockEnabled: enabled,
      },
    }));
  };

  const handleAddCategory = (type: TransactionType, name: string, icon?: string, cashBoxId?: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date();

    persistData((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: generateId(`cat-${type}`),
          name: trimmed,
          type,
          cashBoxId: type === 'expense' ? cashBoxId : undefined,
          icon,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleUpdateCategory = (
    categoryId: string,
    type: TransactionType,
    name: string,
    icon?: string,
    cashBoxId?: string,
  ) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    persistData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              type,
              name: trimmed,
              cashBoxId: type === 'expense' ? cashBoxId : undefined,
              icon,
              updatedAt: new Date(),
            }
          : category,
      ),
    }));
  };

  const handleAssignCategoryCashBox = (categoryId: string, cashBoxId: string) => {
    persistData((current) => {
      if (!current.cashBoxes.some((cashBox) => cashBox.id === cashBoxId && cashBox.active)) {
        return current;
      }

      return {
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId && category.type === 'expense'
            ? {
                ...category,
                cashBoxId,
                updatedAt: new Date(),
              }
            : category,
        ),
      };
    });
  };

  const handleAddSubcategory = (categoryId: string, name: string, icon?: string) => {
    const trimmed = name.trim();
    if (!categoryId || !trimmed) {
      return;
    }

    const timestamp = new Date();

    persistData((current) => ({
      ...current,
      subcategories: [
        ...current.subcategories,
        {
          id: generateId('subcat'),
          categoryId,
          name: trimmed,
          icon,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleUpdateSubcategory = (subcategoryId: string, categoryId: string, name: string, icon?: string) => {
    const trimmed = name.trim();
    if (!categoryId || !trimmed) {
      return;
    }

    persistData((current) => ({
      ...current,
      subcategories: current.subcategories.map((subcategory) =>
        subcategory.id === subcategoryId
          ? {
              ...subcategory,
              categoryId,
              name: trimmed,
              icon,
              updatedAt: new Date(),
            }
          : subcategory,
      ),
    }));
  };

  const handleDisableCategory = (categoryId: string) => {
    persistData((current) => ({
      ...current,
      categories: deactivateById(current.categories, categoryId),
    }));
  };

  const handleDisableSubcategory = (subcategoryId: string) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    confirmDestructiveAction({
      title: t('deleteSubcategory'),
      message: t('softDeleteMessage'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          subcategories: deactivateById(current.subcategories, subcategoryId),
        })),
    });
  };

  const handleAddPaymentMethod = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date();

    persistData((current) => ({
      ...current,
      paymentMethods: [
        ...current.paymentMethods,
        {
          id: generateId('pay'),
          name: trimmed,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleUpdatePaymentMethod = (paymentMethodId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    persistData((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((method) =>
        method.id === paymentMethodId
          ? {
              ...method,
              name: trimmed,
              updatedAt: new Date(),
            }
          : method,
      ),
    }));
  };

  const handleAddPaymentSubmethod = (paymentMethodId: string, name: string) => {
    const trimmed = name.trim();
    if (!paymentMethodId || !trimmed) {
      return;
    }

    const timestamp = new Date();

    persistData((current) => ({
      ...current,
      paymentSubmethods: [
        ...current.paymentSubmethods,
        {
          id: generateId('subpay'),
          paymentMethodId,
          name: trimmed,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleUpdatePaymentSubmethod = (paymentSubmethodId: string, paymentMethodId: string, name: string) => {
    const trimmed = name.trim();
    if (!paymentMethodId || !trimmed) {
      return;
    }

    persistData((current) => ({
      ...current,
      paymentSubmethods: current.paymentSubmethods.map((submethod) =>
        submethod.id === paymentSubmethodId
          ? {
              ...submethod,
              paymentMethodId,
              name: trimmed,
              updatedAt: new Date(),
            }
          : submethod,
      ),
    }));
  };

  const handleDisablePaymentMethod = (paymentMethodId: string) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    confirmDestructiveAction({
      title: t('deleteMethod'),
      message: t('softDeleteMessage'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          paymentMethods: deactivateById(current.paymentMethods, paymentMethodId),
        })),
    });
  };

  const handleDisablePaymentSubmethod = (paymentSubmethodId: string) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    confirmDestructiveAction({
      title: t('deleteSubmethod'),
      message: t('softDeleteMessage'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          paymentSubmethods: deactivateById(current.paymentSubmethods, paymentSubmethodId),
        })),
    });
  };

  const handleAddPerson = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date();

    persistData((current) => ({
      ...current,
      people: [
        ...current.people,
        {
          id: generateId('person'),
          name: trimmed,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleUpdatePerson = (personId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    persistData((current) => ({
      ...current,
      people: current.people.map((person) =>
        person.id === personId
          ? {
              ...person,
              name: trimmed,
              updatedAt: new Date(),
            }
          : person,
      ),
    }));
  };

  const handleDisablePerson = (personId: string) => {
    const t = getTranslator(data?.settings.language ?? 'en');

    confirmDestructiveAction({
      title: t('deletePerson'),
      message: t('softDeleteMessage'),
      cancelLabel: t('cancel'),
      confirmLabel: t('delete'),
      onConfirm: () =>
        persistData((current) => ({
          ...current,
          people: deactivateById(current.people, personId),
        })),
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (editingTransactionId) {
        setEditingTransactionId(undefined);
        return true;
      }

      if (selectedTransactionId) {
        setSelectedTransactionId(undefined);
        return true;
      }

      if (activeTab === 'reports' || activeTab === 'settings') {
        return false;
      }

      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return true;
      }

      return true;
    });

    return () => subscription.remove();
  }, [activeTab, editingTransactionId, selectedTransactionId]);

  if (!fontsLoaded || !data) {
    return <LoadingScreen />;
  }

  colors = getThemeColors(data.settings.themeMode);
  styles = createAppStyles(colors);
  const isDarkTheme = data.settings.themeMode === 'dark';
  const appTheme = { colors, styles, isDark: isDarkTheme };

  if (authStatus === 'checking') {
    return <LoadingScreen />;
  }

  if (authStatus !== 'authenticated') {
    return <AuthScreen status={authStatus} onRetry={requestAuthentication} />;
  }

  const selectedTransaction = data.transactions.find((transaction) => transaction.id === selectedTransactionId);
  const editingTransaction = data.transactions.find((transaction) => transaction.id === editingTransactionId);
  const isDevFixturesEnabled = devFixturesEnabled();
  const handleLoadDevMonthlyReportFixture = isDevFixturesEnabled
    ? async () => {
        try {
          const response = await fetch(devFixtureUrl());

          if (!response.ok) {
            throw new Error(`Fixture request failed with status ${response.status}`);
          }

          const payload = (await response.json()) as DevAppDataPayload;
          const next = appDataFromDevFixturePayload(payload);

          await saveAppData(next);
          setData(next);
          setSelectedMonth(JUNE_2026_MONTH);
          setActiveTab('reports');
          Alert.alert(t('devFixtureLoadedTitle'), t('devFixtureLoadedMessage'));
        } catch (error) {
          console.warn(error);
          Alert.alert(t('devFixtureLoadFailedTitle'), t('devFixtureLoadFailedMessage'));
        }
      }
    : undefined;
  const appShell = (
    <View style={styles.appShell}>
      {activeTab === 'transactions' ? null : (
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} t={t} language={data.settings.language} />
      )}
      <View style={styles.content}>
        {activeTab === 'dashboard' ? (
          <DashboardScreen
            data={data}
            t={t}
            selectedMonth={selectedMonth}
            onAddTransaction={() => setActiveTab('transactions')}
            onSelectTransaction={(transaction) => setSelectedTransactionId(transaction.id)}
          />
        ) : null}
        {activeTab === 'transactions' ? (
          <TransactionsScreen
            data={data}
            t={t}
            selectedMonth={selectedMonth}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSelectTransaction={(transaction) => setSelectedTransactionId(transaction.id)}
            onClose={() => setActiveTab('dashboard')}
          />
        ) : null}
        {activeTab === 'reports' ? (
          <ReportsScreen
            data={data}
            t={t}
            selectedMonth={selectedMonth}
            deferHardwareBack={Boolean(selectedTransactionId || editingTransactionId)}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onOpenPremium={openPremiumSettings}
            onSelectTransaction={(transaction) => setSelectedTransactionId(transaction.id)}
          />
        ) : null}
        {activeTab === 'settings' ? (
          <SettingsScreen
            data={data}
            t={t}
            selectedMonth={selectedMonth}
            deferHardwareBack={Boolean(selectedTransactionId || editingTransactionId)}
            devFixturesEnabled={isDevFixturesEnabled}
            requestedSettingsSection={requestedSettingsSection}
            onRequestedSettingsSectionConsumed={() => setRequestedSettingsSection(undefined)}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onLoadDevMonthlyReportFixture={handleLoadDevMonthlyReportFixture}
            premiumProducts={premiumProductDisplays}
            premiumPurchaseBusy={premiumPurchaseBusy}
            premiumStoreConnected={premiumStoreConnected}
            premiumStoreError={premiumStoreError}
            onStartPremiumPurchase={(productId) => {
              void startPremiumPurchase(productId);
            }}
            onRestorePremiumPurchases={() => {
              void restorePremiumPurchases();
            }}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            onSetDefaultCurrency={handleSetDefaultCurrency}
            onSetDefaultPaymentSubmethod={handleSetDefaultPaymentSubmethod}
            onSetLanguage={handleSetLanguage}
            onSetThemeMode={handleSetThemeMode}
            onSetBiometricLockEnabled={handleSetBiometricLockEnabled}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onAssignCategoryCashBox={handleAssignCategoryCashBox}
            onAddSubcategory={handleAddSubcategory}
            onUpdateSubcategory={handleUpdateSubcategory}
            onDisableCategory={handleDisableCategory}
            onDisableSubcategory={handleDisableSubcategory}
            onAddPaymentMethod={handleAddPaymentMethod}
            onUpdatePaymentMethod={handleUpdatePaymentMethod}
            onAddPaymentSubmethod={handleAddPaymentSubmethod}
            onUpdatePaymentSubmethod={handleUpdatePaymentSubmethod}
            onDisablePaymentMethod={handleDisablePaymentMethod}
            onDisablePaymentSubmethod={handleDisablePaymentSubmethod}
            onAddPerson={handleAddPerson}
            onUpdatePerson={handleUpdatePerson}
            onDisablePerson={handleDisablePerson}
          />
        ) : null}
      </View>
      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} t={t} />
    </View>
  );

  return (
    <ThemeContext.Provider value={appTheme}>
      <ResponsiveContext.Provider value={responsive}>
        <AppSafeAreaView style={[styles.safeArea, Platform.OS === 'web' && ({ height: '100vh', overflow: 'hidden' } as any)]}>
          <StatusBar backgroundColor={colors.surface} style={appTheme.isDark ? 'light' : 'dark'} translucent={false} />
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding">
              {appShell}
            </KeyboardAvoidingView>
          ) : (
            appShell
          )}
          <TransactionDetailModal
            data={data}
            t={t}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransactionId(undefined)}
            onEdit={(transaction) => setEditingTransactionId(transaction.id)}
            onDelete={(transaction) => {
              handleDeleteTransaction(transaction);
              setSelectedTransactionId(undefined);
            }}
          />
          <TransactionEditModal
            data={data}
            t={t}
            transaction={editingTransaction}
            onClose={() => setEditingTransactionId(undefined)}
            onSave={(input, transaction) => {
              handleSaveTransaction(input, transaction);
              setSelectedTransactionId(undefined);
              setEditingTransactionId(undefined);
              setActiveTab('dashboard');
            }}
          />
        </AppSafeAreaView>
      </ResponsiveContext.Provider>
    </ThemeContext.Provider>
  );
}

function LoadingScreen() {
  return (
    <AppSafeAreaView style={styles.centerScreen}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Loading {APP_NAME}</Text>
    </AppSafeAreaView>
  );
}

function AuthScreen({ status, onRetry }: { status: AuthStatus; onRetry: () => void }) {
  const title = status === 'unavailable' ? 'Biometric lock unavailable' : `${APP_NAME} locked`;
  const message =
    status === 'unavailable'
      ? 'Enroll fingerprint or face unlock on this Android device to access local financial data.'
      : 'Authenticate to view your dashboard and transactions.';

  return (
    <AppSafeAreaView style={styles.centerScreen}>
      <View style={styles.lockBadge}>
        <Lock color={colors.onPrimary} size={36} strokeWidth={2.4} />
      </View>
      <Text style={styles.lockTitle}>{title}</Text>
      <Text style={styles.lockMessage}>{message}</Text>
      <AppButton label="Retry" Icon={Lock} onPress={onRetry} />
    </AppSafeAreaView>
  );
}

function Header({
  selectedMonth,
  onMonthChange,
  t,
  language,
}: {
  selectedMonth: Date;
  onMonthChange: (value: Date) => void;
  t: Translator;
  language: AppLanguage;
}) {
  const { isCompact } = useResponsive();

  return (
    <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
      <View style={styles.headerTextGroup}>
        <View style={styles.headerBrand}>
          <Image source={appLogo} style={styles.headerLogo} />
          <Text style={styles.eyebrow} numberOfLines={1}>{APP_NAME}</Text>
        </View>
        <Text style={[styles.headerTitle, isCompact ? styles.headerTitleCompact : null]} numberOfLines={2} adjustsFontSizeToFit>
          {monthLabel(selectedMonth, localeForLanguage(language))}
        </Text>
      </View>
      <View style={[styles.monthControls, isCompact ? styles.monthControlsCompact : null]}>
        <IconButton
          accessibilityLabel={t('previousMonth')}
          Icon={ChevronLeft}
          onPress={() => onMonthChange(shiftMonth(selectedMonth, -1))}
        />
        <IconButton
          accessibilityLabel={t('nextMonth')}
          Icon={ChevronRight}
          onPress={() => onMonthChange(shiftMonth(selectedMonth, 1))}
        />
      </View>
    </View>
  );
}

function BottomNavigation({
  activeTab,
  onChange,
  t,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  t: Translator;
}) {
  const { isCompact } = useResponsive();
  const insets = useSafeAreaInsets();
  // Android 15+ can place system navigation over tappable UI even with edge-to-edge disabled.
  const androidNeedsBottomInset = Platform.OS === 'android' && Number(Platform.Version) >= 35;
  const bottomInset = Platform.OS === 'ios' || androidNeedsBottomInset ? insets.bottom : 0;
  const baseBottomPadding = isCompact ? spacing.xs : spacing.sm;
  const tabLabels: Record<TabKey, string> = {
    dashboard: 'Dashboard',
    transactions: t('transactions'),
    reports: t('reports'),
    settings: t('settings'),
  };

  return (
    <View
      style={[
        styles.bottomNav,
        isCompact ? styles.bottomNavCompact : null,
        { paddingBottom: baseBottomPadding + bottomInset },
      ]}
    >
      {tabs.map(({ key, Icon }) => {
        const active = activeTab === key;
        const label = tabLabels[key];

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => onChange(key)}
            style={[styles.navItem, isCompact ? styles.navItemCompact : null, active ? styles.navItemActive : null]}
          >
            <Icon color={active ? colors.primary : colors.textMuted} size={isCompact ? 20 : 22} strokeWidth={2.2} />
            <Text
              style={[styles.navLabel, isCompact ? styles.navLabelCompact : null, active ? styles.navLabelActive : null]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DashboardScreen({
  data,
  t,
  selectedMonth,
  onAddTransaction,
  onSelectTransaction,
}: {
  data: AppData;
  t: Translator;
  selectedMonth: Date;
  onAddTransaction: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
}) {
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);
  const currencySummaries = useMemo(() => summarizeByCurrency(transactions), [transactions]);
  const transactionGroups = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  return (
    <View style={styles.dashboardRoot}>
      <ScreenScroll>
        {currencySummaries.length ? (
          currencySummaries.map((summary) => (
            <DashboardSummaryCard key={summary.currency} summary={summary} t={t} />
          ))
        ) : (
          <EmptyState title={t('noMovements')} />
        )}

        {transactionGroups.length ? (
          transactionGroups.map((group) => (
            <ExpenseDayCard
              key={group.dateKey}
              data={data}
              t={t}
              group={group}
              showAllMovements
              onSelectTransaction={onSelectTransaction}
            />
          ))
        ) : (
          <EmptyState title={t('noMovements')} />
        )}
        <View style={styles.dashboardFabSpacer} />
      </ScreenScroll>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('addTransaction')}
        onPress={onAddTransaction}
        style={styles.dashboardFab}
      >
        <Plus color={colors.onPrimary} size={30} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function TransactionsScreen({
  data,
  t,
  selectedMonth,
  onSaveTransaction,
  onDeleteTransaction,
  onSelectTransaction,
  onClose,
}: {
  data: AppData;
  t: Translator;
  selectedMonth: Date;
  onSaveTransaction: (input: TransactionInput, editingTransaction?: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onClose: () => void;
}) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);
  const transactionForm = (
    <TransactionForm
      data={data}
      t={t}
      editingTransaction={editingTransaction}
      onCancelEdit={() => setEditingTransaction(undefined)}
      onClose={onClose}
      onSave={(input) => {
        onSaveTransaction(input, editingTransaction);
        setEditingTransaction(undefined);
        onClose();
      }}
    />
  );

  if (!editingTransaction) {
    return transactionForm;
  }

  return (
    <ScreenScroll>
      {transactionForm}

      <Text style={styles.sectionTitle}>{t('transactions')}</Text>
      {transactions.length ? (
        transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            data={data}
            t={t}
            transaction={transaction}
            onView={() => onSelectTransaction(transaction)}
            onEdit={() => setEditingTransaction(transaction)}
            onDelete={() => onDeleteTransaction(transaction)}
          />
        ))
      ) : (
        <EmptyState title={t('noTransactions')} />
      )}
    </ScreenScroll>
  );
}

function ExpenseSubcategoryGrid({
  categories,
  contentContainerStyle,
  emptyTitle,
  language,
  scroll,
  selectedSubcategoryId,
  subcategories,
  onSelect,
}: {
  categories: Category[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyTitle: string;
  language: AppLanguage;
  scroll?: boolean;
  selectedSubcategoryId?: string;
  subcategories: Subcategory[];
  onSelect: (subcategory: Subcategory) => void;
}) {
  const { isCompact, isLarge } = useResponsive();
  const categoryItemWidth = isCompact ? '33.3333%' : isLarge ? '20%' : '25%';
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  if (!subcategories.length) {
    return scroll ? (
      <ScrollView
        style={styles.expenseCategoryScroller}
        contentContainerStyle={[styles.expenseCategoryGrid, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState title={emptyTitle} />
      </ScrollView>
    ) : (
      <EmptyState title={emptyTitle} />
    );
  }

  const content = subcategories.map((subcategory) => {
    const category = categoriesById.get(subcategory.categoryId);
    const Icon = getSubcategoryIcon(subcategory, category);
    const selected = selectedSubcategoryId === subcategory.id;

    return (
      <Pressable
        key={subcategory.id}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onSelect(subcategory)}
        style={[
          styles.expenseCategoryItem,
          isCompact ? styles.expenseCategoryItemCompact : null,
          { width: categoryItemWidth },
        ]}
      >
        <View
          style={[
            styles.expenseCategoryIcon,
            isCompact ? styles.expenseCategoryIconCompact : null,
            selected ? styles.expenseCategoryIconSelected : null,
          ]}
        >
          <Icon
            color={selected ? colors.onPrimary : colors.textMuted}
            size={isCompact ? 26 : 32}
            strokeWidth={2}
          />
        </View>
        <Text
          style={[
            styles.expenseCategoryLabel,
            selected ? styles.expenseCategoryLabelSelected : null,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {displaySubcategoryName(subcategory, language) ?? subcategory.name}
        </Text>
      </Pressable>
    );
  });

  if (scroll) {
    return (
      <ScrollView
        style={styles.expenseCategoryScroller}
        contentContainerStyle={[styles.expenseCategoryGrid, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.expenseCategoryGrid, contentContainerStyle]}>{content}</View>;
}

function TransactionForm({
  data,
  t,
  editingTransaction,
  onCancelEdit,
  onClose,
  onSave,
}: {
  data: AppData;
  t: Translator;
  editingTransaction?: Transaction;
  onCancelEdit: () => void;
  onClose: () => void;
  onSave: (input: TransactionInput) => void;
}) {
  const { isCompact } = useResponsive();
  const [type, setType] = useState<TransactionType>('expense');
  const switchType = (next: TransactionType) => {
    setType(next);
    setCategoryId('');
    setSubcategoryId(undefined);
    setCategorySelectorExpanded(false);
    setMoreOptionsVisible(false);
    if (next === 'income') {
      setPaymentMethodId('');
      setPaymentSubmethodId(undefined);
      setAssignedPersonId(undefined);
      setInstallmentsEnabled(false);
      setInstallmentCount('1');
      setInstallmentInterestRate('');
    }
  };
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(data.settings.defaultCurrency);
  const [date, setDate] = useState(() => todayInput());
  const [dateInputText, setDateInputText] = useState(() => dateInputFromDate(todayInput()));
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentSubmethodId, setPaymentSubmethodId] = useState<string | undefined>();
  const [assignedPersonId, setAssignedPersonId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('1');
  const [installmentInterestRate, setInstallmentInterestRate] = useState('');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(() => todayInput());
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => monthStartInput());
  const [categorySelectorExpanded, setCategorySelectorExpanded] = useState(false);
  const isNewEntry = !editingTransaction;
  const isExpenseEntry = type === 'expense';

  const categories = useMemo(
    () =>
      data.categories
        .filter((category) => category.type === type && category.active)
        .sort(compareCategoryDisplayName(data.settings.language)),
    [data.categories, data.settings.language, type],
  );
  const subcategories = useMemo(
    () => {
      const categoryIds = new Set(categories.map((category) => category.id));

      return data.subcategories
        .filter((subcategory) => categoryIds.has(subcategory.categoryId) && subcategory.active)
        .sort(compareSubcategoryDisplayName(data.settings.language));
    },
    [categories, data.settings.language, data.subcategories],
  );
  const subcategoryGroups = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          subcategories: subcategories.filter((subcategory) => subcategory.categoryId === category.id),
        }))
        .filter((group) => group.subcategories.length > 0),
    [categories, subcategories],
  );
  const paymentMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.active),
    [data.paymentMethods],
  );
  const paymentSubmethods = useMemo(
    () => {
      const methodIds = new Set(paymentMethods.map((method) => method.id));

      return data.paymentSubmethods.filter(
        (submethod) => methodIds.has(submethod.paymentMethodId) && submethod.active,
      );
    },
    [data.paymentSubmethods, paymentMethods],
  );
  const activePeople = useMemo(
    () =>
      data.people
        .filter((person) => person.active)
        .sort((left, right) => left.name.localeCompare(right.name, data.settings.language, { sensitivity: 'base' })),
    [data.people, data.settings.language],
  );
  const currentSubcategory = subcategories.find((subcategory) => subcategory.id === subcategoryId);
  const currentCategory = data.categories.find((category) => category.id === (currentSubcategory?.categoryId ?? categoryId));
  const currentSubcategoryLabel =
    displaySubcategoryName(currentSubcategory, data.settings.language) ?? currentSubcategory?.name ?? t('chooseSubcategory');
  const currentCategoryLabel =
    displayCategoryName(currentCategory, data.settings.language) ?? currentCategory?.name ?? t('uncategorized');
  const currencyOptions = useMemo(
    () =>
      Array.from(
        new Set([
          normalizeCurrency(data.settings.defaultCurrency),
          normalizeCurrency(currency),
          'ARS',
          'USD',
          'EUR',
          ...data.transactions.map((transaction) => normalizeCurrency(transaction.currency)),
        ]),
      ),
    [currency, data.settings.defaultCurrency, data.transactions],
  );
  const selectedInstallmentCount = installmentsEnabled ? Number.parseInt(installmentCount, 10) : 1;
  const amountDisplay = formatAmountPreview(amount);
  const amountNeedsResolution = amountExpressionNeedsResolution(amount);
  const selectedDateIsToday = dateInputFromDate(date) === dateInputFromDate(todayInput());
  const dateButtonLabel = selectedDateIsToday ? t('today') : formatShortInputDate(date, data.settings.language);
  const dateButtonSubtext = selectedDateIsToday
    ? formatShortInputDate(date, data.settings.language)
    : formatShortWeekday(date, data.settings.language);
  const selectedPersonName = personDisplayName(data, assignedPersonId);
  const optionSummary = [
    normalizeCurrency(currency),
    isExpenseEntry && assignedPersonId ? selectedPersonName : undefined,
    isExpenseEntry && installmentsEnabled ? `${selectedInstallmentCount}x` : undefined,
    isExpenseEntry && installmentsEnabled && installmentInterestRate.trim()
      ? `${installmentInterestRate.replace(',', '.')}%`
      : undefined,
  ]
    .filter((item): item is string => Boolean(item))
    .join(' - ');
  const shouldShowControls = isNewEntry ? Boolean(subcategoryId) : true;

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCurrency(editingTransaction.currency);
      setDate(editingTransaction.date);
      setDateInputText(dateInputFromDate(editingTransaction.date));
      setFirstInstallmentDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setSubcategoryId(editingTransaction.subcategoryId);
      setPaymentMethodId(editingTransaction.paymentMethodId ?? '');
      setPaymentSubmethodId(editingTransaction.paymentSubmethodId);
      setAssignedPersonId(editingTransaction.assignedPersonId);
      setName(editingTransaction.name);
      setDescription(editingTransaction.description);
      setInstallmentsEnabled(false);
      setInstallmentInterestRate(
        editingTransaction.installmentInterestRate !== undefined
          ? String(editingTransaction.installmentInterestRate)
          : '',
      );
      setCategorySelectorExpanded(false);
      setMoreOptionsVisible(false);
      return;
    }

    setAmount('');
    setCurrency(data.settings.defaultCurrency);
    const today = todayInput();
    setDate(today);
    setDateInputText(dateInputFromDate(today));
    setFirstInstallmentDate(today);
    setName('');
    setDescription('');
    setAssignedPersonId(undefined);
    setInstallmentsEnabled(false);
    setInstallmentCount('1');
    setInstallmentInterestRate('');
    setCategorySelectorExpanded(false);
    setMoreOptionsVisible(false);
  }, [data.settings.defaultCurrency, editingTransaction]);

  useEffect(() => {
    const selectedSubcategory = subcategories.find((subcategory) => subcategory.id === subcategoryId);

    if (selectedSubcategory) {
      if (categoryId !== selectedSubcategory.categoryId) {
        setCategoryId(selectedSubcategory.categoryId);
      }
      return;
    }

    if (isNewEntry) {
      if (categoryId && !categories.some((category) => category.id === categoryId)) {
        setCategoryId('');
      }

      setSubcategoryId(undefined);
      return;
    }

    if (editingTransaction) {
      if (categoryId && !categories.some((category) => category.id === categoryId)) {
        setCategoryId('');
      }

      return;
    }

    const firstSubcategory = subcategories[0];

    if (firstSubcategory) {
      setSubcategoryId(firstSubcategory.id);
      setCategoryId(firstSubcategory.categoryId);
      return;
    }

    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? '');
    }

    setSubcategoryId(undefined);
  }, [categories, categoryId, editingTransaction, isNewEntry, subcategories, subcategoryId]);

  useEffect(() => {
    if (!isExpenseEntry) {
      if (paymentMethodId || paymentSubmethodId) {
        setPaymentMethodId('');
        setPaymentSubmethodId(undefined);
      }
      return;
    }

    const selectedSubmethod = paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId);

    if (selectedSubmethod) {
      if (paymentMethodId !== selectedSubmethod.paymentMethodId) {
        setPaymentMethodId(selectedSubmethod.paymentMethodId);
      }
      return;
    }

    if (editingTransaction) {
      if (paymentMethodId && !paymentMethods.some((method) => method.id === paymentMethodId)) {
        setPaymentMethodId('');
      }

      return;
    }

    const defaultSubmethod =
      paymentSubmethods.find((submethod) => submethod.id === data.settings.defaultPaymentSubmethodId) ??
      paymentSubmethods[0];

    if (defaultSubmethod) {
      setPaymentSubmethodId(defaultSubmethod.id);
      setPaymentMethodId(defaultSubmethod.paymentMethodId);
      return;
    }

    if (!paymentMethods.some((method) => method.id === paymentMethodId)) {
      setPaymentMethodId(paymentMethods[0]?.id ?? '');
    }

    setPaymentSubmethodId(undefined);
  }, [
    data.settings.defaultPaymentSubmethodId,
    editingTransaction,
    isExpenseEntry,
    paymentMethodId,
    paymentMethods,
    paymentSubmethodId,
    paymentSubmethods,
  ]);

  useEffect(() => {
    if (!isExpenseEntry) {
      if (assignedPersonId) {
        setAssignedPersonId(undefined);
      }
      return;
    }

    if (assignedPersonId && !activePeople.some((person) => person.id === assignedPersonId)) {
      setAssignedPersonId(undefined);
    }
  }, [activePeople, assignedPersonId, isExpenseEntry]);

  const handleAmountKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmount((current) => current.slice(0, -1));
      return;
    }

    if (key === '+' || key === '-') {
      setAmount((current) => {
        if (!current || current === '0') {
          return current;
        }

        return amountOperatorPattern.test(current) ? `${current.slice(0, -1)}${key}` : `${current}${key}`;
      });
      return;
    }

    if (key === '.') {
      setAmount((current) => {
        const amountParts = current.split(/[+-]/);
        const currentTerm = amountParts[amountParts.length - 1] ?? '';

        if (currentTerm.includes('.')) {
          return current;
        }

        return !current || amountOperatorPattern.test(current) ? `${current}0.` : `${current}.`;
      });
      return;
    }

    setAmount((current) => {
      if (current.replace(/\D/g, '').length >= 15) {
        return current;
      }

      return current === '0' ? key : `${current}${key}`;
    });
  };

  const handleSelectExpenseDate = (nextDate: Date) => {
    setDate(nextDate);
    setDateInputText(dateInputFromDate(nextDate));
    setFirstInstallmentDate(nextDate);
    setCalendarVisible(false);
  };

  const handleSelectInstallments = (count: number) => {
    setInstallmentsEnabled(count > 1);
    setInstallmentCount(String(count));
  };

  const handleInstallmentInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    const count = Number.parseInt(digits, 10);

    setInstallmentCount(digits);
    setInstallmentsEnabled(Number.isFinite(count) && count > 1);
  };

  const handleResolveAmount = () => {
    const parsedAmount = evaluateAmountExpression(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('invalidAmountTitle'), t('invalidAmountMessage'));
      return;
    }

    setAmount(String(roundMoney(parsedAmount)));
  };

  const handleSubmit = () => {
    const parsedAmount = evaluateAmountExpression(amount);
    const parsedInstallments = Number.parseInt(installmentCount, 10);
    const parsedDate = dateFromInput(dateInputText);
    const parsedInterestRate = installmentInterestRate.trim()
      ? Number(installmentInterestRate.replace(',', '.'))
      : 0;

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('invalidAmountTitle'), t('invalidAmountMessage'));
      return;
    }

    if (!parsedDate) {
      Alert.alert(t('invalidDateTitle'), t('invalidDateMessage'));
      return;
    }

    if (!categoryId || !subcategoryId || (type === 'expense' && (!paymentMethodId || !paymentSubmethodId))) {
      Alert.alert(t('missingFieldsTitle'), t('missingFieldsMessage'));
      return;
    }

    if (installmentsEnabled && (!Number.isFinite(parsedInstallments) || parsedInstallments < 2)) {
      Alert.alert(t('invalidInstallmentsTitle'), t('invalidInstallmentsMessage'));
      return;
    }

    if (type === 'expense' && installmentsEnabled && (!Number.isFinite(parsedInterestRate) || parsedInterestRate < 0)) {
      Alert.alert(t('invalidInterestTitle'), t('invalidInterestMessage'));
      return;
    }

    onSave({
      type,
      amount: parsedAmount,
      currency: normalizeCurrency(currency),
      date: parsedDate,
      categoryId,
      subcategoryId,
      paymentMethodId: type === 'expense' ? paymentMethodId : undefined,
      paymentSubmethodId: type === 'expense' ? paymentSubmethodId : undefined,
      assignedPersonId: type === 'expense' ? assignedPersonId : undefined,
      name: name.trim(),
      description: description.trim(),
      installmentCount: type === 'expense' && installmentsEnabled ? parsedInstallments : undefined,
      installmentInterestRate:
        type === 'expense' && installmentsEnabled ? roundMoney(parsedInterestRate) : undefined,
      firstInstallmentDate: type === 'expense' && installmentsEnabled ? firstInstallmentDate : undefined,
    });

    if (!editingTransaction) {
      setAmount('');
      const today = todayInput();
      setDate(today);
      setDateInputText(dateInputFromDate(today));
      setFirstInstallmentDate(today);
      setCategoryId('');
      setSubcategoryId(undefined);
      setName('');
      setDescription('');
      setAssignedPersonId(undefined);
      setInstallmentsEnabled(false);
      setInstallmentCount('1');
      setInstallmentInterestRate('');
      setMoreOptionsVisible(false);
    }
  };

  return (
    <View style={styles.expenseEntryPanel}>
      <View style={[styles.expenseEntryHeader, isCompact ? styles.expenseEntryHeaderCompact : null]}>
        <IconButton
          accessibilityLabel={editingTransaction ? t('cancelEdit') : t('backToDashboard')}
          Icon={ChevronLeft}
          onPress={editingTransaction ? onCancelEdit : onClose}
        />
        {editingTransaction ? (
          <Text style={[styles.expenseEntryTitle, isCompact ? styles.expenseEntryTitleCompact : null]} numberOfLines={1}>
            {t('editTransaction')}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('expense')} / ${t('income')}`}
            onPress={() => switchType(type === 'expense' ? 'income' : 'expense')}
            style={styles.expenseEntryTitleGroup}
          >
            <Text style={[styles.expenseEntryTitle, isCompact ? styles.expenseEntryTitleCompact : null]} numberOfLines={1}>
              {type === 'expense' ? t('expenses') : t('income')}
            </Text>
            <ChevronDown color={colors.textMuted} size={20} strokeWidth={2.2} />
          </Pressable>
        )}
      </View>

      {isNewEntry ? (
        <ExpenseSubcategoryGrid
          categories={data.categories}
          emptyTitle={t('noActiveSubcategories')}
          language={data.settings.language}
          scroll
          selectedSubcategoryId={subcategoryId}
          subcategories={subcategories}
          onSelect={(subcategory) => {
            setSubcategoryId(subcategory.id);
            setCategoryId(subcategory.categoryId);
          }}
        />
      ) : (
        <View style={[styles.expenseEditCategoryPanel, isCompact ? styles.expenseEditCategoryPanelCompact : null]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('changeSubcategory')}
            onPress={() => setCategorySelectorExpanded((current) => !current)}
            style={styles.expenseEditCategoryTrigger}
          >
            <CategoryIconBadge category={currentCategory} subcategory={currentSubcategory} accent />
            <View style={styles.expenseEditCategoryText}>
              <Text style={styles.expenseOptionLabel}>{type === 'expense' ? t('expenseCategory') : t('incomeCategory')}</Text>
              <Text style={styles.rowTitle} numberOfLines={1}>{currentSubcategoryLabel}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>{currentCategoryLabel}</Text>
            </View>
            {categorySelectorExpanded ? (
              <ChevronDown color={colors.textMuted} size={20} strokeWidth={2.2} />
            ) : (
              <ChevronRight color={colors.textMuted} size={20} strokeWidth={2.2} />
            )}
          </Pressable>
          {categorySelectorExpanded ? (
            <View style={styles.expenseEditCategoryList}>
              {subcategoryGroups.length ? (
                subcategoryGroups.map((group) => (
                  <View key={group.category.id} style={styles.expenseEditCategoryGroup}>
                    <Text style={styles.expenseEditCategoryGroupTitle} numberOfLines={1}>
                      {displayCategoryName(group.category, data.settings.language)}
                    </Text>
                    <View style={styles.chipRow}>
                      {group.subcategories.map((subcategory) => (
                        <Chip
                          key={subcategory.id}
                          label={displaySubcategoryName(subcategory, data.settings.language) ?? subcategory.name}
                          selected={subcategoryId === subcategory.id}
                          onPress={() => {
                            setSubcategoryId(subcategory.id);
                            setCategoryId(subcategory.categoryId);
                            setCategorySelectorExpanded(false);
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.rowMeta}>{t('noActiveSubcategories')}</Text>
              )}
            </View>
          ) : null}
        </View>
      )}

      {shouldShowControls ? (
        <>
          {isExpenseEntry ? (
            <View style={[styles.expenseOptionsPanel, isCompact ? styles.expenseOptionsPanelCompact : null]}>
              <View style={styles.expenseOptionSection}>
                <Text style={styles.expenseOptionLabel}>{t('payment')}</Text>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.expenseOptionChips}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                >
                  {paymentSubmethods.length ? (
                    paymentSubmethods.map((submethod) => {
                      const selected = paymentSubmethodId === submethod.id;

                      return (
                        <Pressable
                          key={submethod.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          onPress={() => {
                            setPaymentSubmethodId(submethod.id);
                            setPaymentMethodId(submethod.paymentMethodId);
                          }}
                          style={[
                            styles.expenseOptionChip,
                            isCompact ? styles.expenseOptionChipCompact : null,
                            selected ? styles.expenseOptionChipSelected : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.expenseOptionChipText,
                              selected ? styles.expenseOptionChipTextSelected : null,
                            ]}
                            numberOfLines={1}
                          >
                            {displayPaymentSubmethodName(submethod, data.settings.language)}
                          </Text>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Text style={styles.expenseOptionEmpty}>{t('noPaymentOptions')}</Text>
                  )}
                </ScrollView>
              </View>
            </View>
          ) : null}

          <View style={[styles.expenseEntryComposer, isCompact ? styles.expenseEntryComposerCompact : null]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('moreOptions')}
              accessibilityHint={optionSummary || t('optional')}
              onPress={() => setMoreOptionsVisible(true)}
              style={[styles.moreOptionsIconButton, isCompact ? styles.moreOptionsIconButtonCompact : null]}
            >
              <MoreHorizontal color={colors.primary} size={22} strokeWidth={2.6} />
            </Pressable>
            <View style={styles.transactionReferenceField}>
              <Text
                style={[styles.transactionSubcategoryLabel, isCompact ? styles.transactionSubcategoryLabelCompact : null]}
                numberOfLines={2}
              >
                {currentSubcategoryLabel}
              </Text>
              <View style={styles.transactionNameField}>
                <Pencil color={colors.gray} size={16} strokeWidth={2} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('transactionName')}
                  placeholderTextColor={colors.gray}
                  style={[styles.transactionNameInput, isCompact ? styles.transactionNameInputCompact : null]}
                />
              </View>
            </View>
            <Text
              style={[styles.expenseAmountPreview, isCompact ? styles.expenseAmountPreviewCompact : null]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {amountDisplay}
            </Text>
          </View>

          <View style={styles.expenseKeypad}>
            <View style={[styles.expenseKeypadRow, isCompact ? styles.expenseKeypadRowCompact : null]}>
              <AmountKey label="7" onPress={() => handleAmountKeyPress('7')} />
              <AmountKey label="8" onPress={() => handleAmountKeyPress('8')} />
              <AmountKey label="9" onPress={() => handleAmountKeyPress('9')} />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCalendarMonth(monthStartInput(date));
                  setCalendarVisible(true);
                }}
                style={[styles.expenseKey, isCompact ? styles.expenseKeyCompact : null]}
              >
                <Text style={[styles.expenseKeyText, isCompact ? styles.expenseKeyTextCompact : null]} numberOfLines={1} adjustsFontSizeToFit>
                  {dateButtonLabel}
                </Text>
                <Text style={styles.expenseKeySubtext}>{dateButtonSubtext}</Text>
              </Pressable>
            </View>
            <View style={[styles.expenseKeypadRow, isCompact ? styles.expenseKeypadRowCompact : null]}>
              <AmountKey label="4" onPress={() => handleAmountKeyPress('4')} />
              <AmountKey label="5" onPress={() => handleAmountKeyPress('5')} />
              <AmountKey label="6" onPress={() => handleAmountKeyPress('6')} />
              <AmountKey label="+" onPress={() => handleAmountKeyPress('+')} />
            </View>
            <View style={[styles.expenseKeypadRow, isCompact ? styles.expenseKeypadRowCompact : null]}>
              <AmountKey label="1" onPress={() => handleAmountKeyPress('1')} />
              <AmountKey label="2" onPress={() => handleAmountKeyPress('2')} />
              <AmountKey label="3" onPress={() => handleAmountKeyPress('3')} />
              <AmountKey label="-" onPress={() => handleAmountKeyPress('-')} />
            </View>
            <View style={[styles.expenseKeypadRow, isCompact ? styles.expenseKeypadRowCompact : null]}>
              <AmountKey label="." onPress={() => handleAmountKeyPress('.')} />
              <AmountKey label="0" onPress={() => handleAmountKeyPress('0')} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('deleteLastDigit')}
                onPress={() => handleAmountKeyPress('backspace')}
                style={[styles.expenseKey, isCompact ? styles.expenseKeyCompact : null]}
              >
                <Delete color={colors.text} size={24} strokeWidth={2.4} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  amountNeedsResolution ? t('calculateAmount') : type === 'expense' ? t('saveExpense') : t('saveIncome')
                }
                onPress={amountNeedsResolution ? handleResolveAmount : handleSubmit}
                style={[styles.expenseKey, isCompact ? styles.expenseKeyCompact : null, styles.expenseConfirmKey]}
              >
                {amountNeedsResolution ? (
                  <Text style={[styles.expenseKeyText, styles.expenseResolveKeyText]}>=</Text>
                ) : (
                  <Check color={colors.onPrimary} size={32} strokeWidth={2.2} />
                )}
              </Pressable>
            </View>
          </View>
          <CalendarModal
            visible={calendarVisible}
            t={t}
            language={data.settings.language}
            selectedDate={date}
            viewMonth={calendarMonth}
            onClose={() => setCalendarVisible(false)}
            onMonthChange={setCalendarMonth}
            onSelectDate={handleSelectExpenseDate}
          />
          <TransactionMoreOptionsModal
            activePeople={activePeople}
            amount={amount}
            assignedPersonId={assignedPersonId}
            currency={currency}
            currencyOptions={currencyOptions}
            description={description}
            editingTransaction={editingTransaction}
            installmentCount={installmentCount}
            installmentInterestRate={installmentInterestRate}
            installmentsEnabled={installmentsEnabled}
            selectedInstallmentCount={selectedInstallmentCount}
            t={t}
            type={type}
            visible={moreOptionsVisible}
            onAssignedPersonChange={setAssignedPersonId}
            onClose={() => setMoreOptionsVisible(false)}
            onCurrencyChange={setCurrency}
            onDescriptionChange={setDescription}
            onInstallmentCountChange={handleInstallmentInputChange}
            onInstallmentInterestRateChange={setInstallmentInterestRate}
            onSelectInstallments={handleSelectInstallments}
          />
        </>
      ) : null}
    </View>
  );
}

function TransactionMoreOptionsModal({
  activePeople,
  amount,
  assignedPersonId,
  currency,
  currencyOptions,
  description,
  editingTransaction,
  installmentCount,
  installmentInterestRate,
  installmentsEnabled,
  selectedInstallmentCount,
  t,
  type,
  visible,
  onAssignedPersonChange,
  onClose,
  onCurrencyChange,
  onDescriptionChange,
  onInstallmentCountChange,
  onInstallmentInterestRateChange,
  onSelectInstallments,
}: {
  activePeople: Person[];
  amount: string;
  assignedPersonId?: string;
  currency: string;
  currencyOptions: string[];
  description: string;
  editingTransaction?: Transaction;
  installmentCount: string;
  installmentInterestRate: string;
  installmentsEnabled: boolean;
  selectedInstallmentCount: number;
  t: Translator;
  type: TransactionType;
  visible: boolean;
  onAssignedPersonChange: (personId?: string) => void;
  onClose: () => void;
  onCurrencyChange: (currency: string) => void;
  onDescriptionChange: (description: string) => void;
  onInstallmentCountChange: (count: string) => void;
  onInstallmentInterestRateChange: (interestRate: string) => void;
  onSelectInstallments: (count: number) => void;
}) {
  const { isCompact } = useResponsive();
  const normalizedCurrency = normalizeCurrency(currency);
  const parsedAmount = evaluateAmountExpression(amount);
  const parsedInterestRate = installmentInterestRate.trim()
    ? Number(installmentInterestRate.replace(',', '.'))
    : 0;
  const showFinancedTotal =
    type === 'expense' &&
    installmentsEnabled &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isFinite(parsedInterestRate) &&
    parsedInterestRate >= 0;
  const financedTotal = showFinancedTotal
    ? applyInstallmentInterest(parsedAmount, parsedInterestRate)
    : undefined;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="none"
        onPress={onClose}
        style={[styles.transactionModalOverlay, isCompact ? styles.transactionModalOverlayCompact : null]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => undefined}
          style={[styles.moreOptionsPanel, isCompact ? styles.moreOptionsPanelCompact : null]}
        >
          <View style={styles.moreOptionsHeader}>
            <Text style={styles.sectionTitle}>{t('moreOptions')}</Text>
            <IconButton accessibilityLabel={t('closeMoreOptions')} Icon={X} onPress={onClose} />
          </View>
          <ScrollView
            contentContainerStyle={styles.moreOptionsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Field label={t('currency')}>
              <ScrollView
                horizontal
                contentContainerStyle={styles.expenseOptionChips}
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
              >
                {currencyOptions.map((option) => {
                  const selected = normalizedCurrency === option;

                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onCurrencyChange(option)}
                      style={[
                        styles.expenseOptionChip,
                        isCompact ? styles.expenseOptionChipCompact : null,
                        selected ? styles.expenseOptionChipSelected : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.expenseOptionChipText,
                          selected ? styles.expenseOptionChipTextSelected : null,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Field>

            <Field label={t('description')}>
              <TextInput
                value={description}
                onChangeText={onDescriptionChange}
                placeholder={t('optional')}
                placeholderTextColor={colors.gray}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </Field>

            {type === 'expense' && !editingTransaction ? (
              <Field label={t('installments')}>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.expenseOptionChips}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                >
                  {[1, 2, 3, 6, 12].map((count) => {
                    const selected = selectedInstallmentCount === count;

                    return (
                      <Pressable
                        key={count}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => onSelectInstallments(count)}
                        style={[
                          styles.expenseOptionChip,
                          isCompact ? styles.expenseOptionChipCompact : null,
                          selected ? styles.expenseOptionChipSelected : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.expenseOptionChipText,
                            selected ? styles.expenseOptionChipTextSelected : null,
                          ]}
                        >
                          {count === 1 ? t('single') : `${count}x`}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <View style={styles.expenseInstallmentInputWrap}>
                    <TextInput
                      keyboardType="number-pad"
                      value={installmentCount}
                      onChangeText={onInstallmentCountChange}
                      placeholder={t('custom')}
                      placeholderTextColor={colors.gray}
                      style={styles.expenseInstallmentInput}
                    />
                    <Text style={styles.expenseInstallmentSuffix}>x</Text>
                  </View>
                </ScrollView>
              </Field>
            ) : null}

            {type === 'expense' && !editingTransaction && installmentsEnabled ? (
              <Field label={t('installmentInterest')}>
                <TextInput
                  keyboardType="decimal-pad"
                  value={installmentInterestRate}
                  onChangeText={onInstallmentInterestRateChange}
                  placeholder="0"
                  placeholderTextColor={colors.gray}
                  style={styles.input}
                />
                {financedTotal !== undefined ? (
                  <Text style={styles.rowMeta}>
                    {t('totalFinanced')}: {formatMoney(financedTotal, normalizedCurrency)}
                  </Text>
                ) : null}
              </Field>
            ) : null}

            {type === 'expense' ? (
              <Field label={t('assignedPerson')}>
                <View style={styles.chipRow}>
                  <Chip
                    label={t('noPerson')}
                    selected={!assignedPersonId}
                    onPress={() => onAssignedPersonChange(undefined)}
                  />
                  {activePeople.map((person) => (
                    <Chip
                      key={person.id}
                      label={person.name}
                      selected={assignedPersonId === person.id}
                      onPress={() => onAssignedPersonChange(person.id)}
                    />
                  ))}
                </View>
                {activePeople.length ? null : <Text style={styles.rowMeta}>{t('noActivePeople')}</Text>}
              </Field>
            ) : null}
          </ScrollView>
          <View style={styles.moreOptionsFooter}>
            <AppButton label={t('confirm')} Icon={Check} onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TransactionRow({
  data,
  t,
  transaction,
  onView,
  onEdit,
  onDelete,
}: {
  data: AppData;
  t: Translator;
  transaction: Transaction;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { isCompact } = useResponsive();
  const displayCategory = transactionCategoryDisplayName(data, transaction) ?? t('uncategorized');
  const displayName = transactionDisplayName(data, transaction) || displayCategory;
  const displayPerson = transaction.type === 'expense' ? personDisplayName(data, transaction.assignedPersonId) : undefined;
  const displayPayment =
    transaction.type === 'expense'
      ? paymentSubmethodDisplayName(data, transaction.paymentSubmethodId) ||
        paymentMethodDisplayName(data, transaction.paymentMethodId)
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onView}
      style={[styles.transactionRow, isCompact ? styles.transactionRowCompact : null]}
    >
      <View style={styles.transactionMain}>
        <Text style={styles.rowTitle}>
          {displayName}
        </Text>
        {transaction.name ? (
          <Text style={styles.rowMeta} numberOfLines={2}>
            {displayCategory}
          </Text>
        ) : null}
        {transaction.description ? (
          <Text style={styles.rowMeta} numberOfLines={2}>
            {transaction.description}
          </Text>
        ) : null}
        <Text style={styles.rowMeta} numberOfLines={1}>
          {dateInputFromDate(transaction.date)}
        </Text>
        {displayPerson ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {displayPerson}
          </Text>
        ) : null}
        {displayPayment ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {displayPayment}
          </Text>
        ) : null}
      </View>
      <View style={[styles.rowActions, isCompact ? styles.rowActionsCompact : null]}>
        <Text
          style={[styles.rowAmount, transaction.type === 'expense' ? styles.negativeText : styles.positiveText]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {transaction.type === 'expense' ? '-' : '+'}
          {formatMoney(transaction.amount, transaction.currency)}
        </Text>
        <View style={styles.iconRow}>
          <IconButton accessibilityLabel={t('editTransaction')} Icon={Pencil} onPress={onEdit} />
          <IconButton accessibilityLabel={t('deleteTransaction')} Icon={Trash2} danger onPress={onDelete} />
        </View>
      </View>
    </Pressable>
  );
}

function TransactionDetailModal({
  data,
  t,
  transaction,
  onClose,
  onEdit,
  onDelete,
}: {
  data: AppData;
  t: Translator;
  transaction?: Transaction;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  const { isCompact } = useResponsive();

  if (!transaction) {
    return null;
  }

  const category = data.categories.find((item) => item.id === transaction.categoryId);
  const subcategory = data.subcategories.find((item) => item.id === transaction.subcategoryId);
  const displayCategory = transactionCategoryDisplayName(data, transaction) ?? t('uncategorized');
  const displayParentCategory = displayCategoryName(category, data.settings.language);
  const displayPayment =
    transaction.type === 'expense'
      ? paymentSubmethodDisplayName(data, transaction.paymentSubmethodId) ||
        paymentMethodDisplayName(data, transaction.paymentMethodId)
      : undefined;
  const displayPerson = transaction.type === 'expense' ? personDisplayName(data, transaction.assignedPersonId) : undefined;
  const displayName = transactionDisplayName(data, transaction) || displayCategory;
  const amountPrefix = transaction.type === 'expense' ? '-' : '+';

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="none"
        onPress={onClose}
        style={[styles.transactionModalOverlay, isCompact ? styles.transactionModalOverlayCompact : null]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => undefined}
          style={[styles.transactionDetailPanel, isCompact ? styles.transactionDetailPanelCompact : null]}
        >
          <View style={styles.transactionDetailHeader}>
            <View style={styles.transactionDetailTitleGroup}>
              <CategoryIconBadge category={category} subcategory={subcategory} accent />
              <View style={styles.transactionDetailTitleText}>
                <Text style={styles.transactionDetailTitle} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.rowMeta}>{dateInputFromDate(transaction.date)}</Text>
              </View>
            </View>
            <IconButton accessibilityLabel={t('closeTransactionDetail')} Icon={X} onPress={onClose} />
          </View>

          <Text
            style={[
              styles.transactionDetailAmount,
              isCompact ? styles.transactionDetailAmountCompact : null,
              transaction.type === 'expense' ? styles.negativeText : styles.positiveText,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {amountPrefix}
            {formatMoney(transaction.amount, transaction.currency)}
          </Text>

          <View style={styles.transactionDetailLines}>
            <TransactionDetailLine label={t('type')} value={transaction.type} />
            <TransactionDetailLine label={t('date')} value={dateInputFromDate(transaction.date)} />
            <TransactionDetailLine label={t('categories')} value={displayParentCategory || t('uncategorized')} />
            <TransactionDetailLine label={t('subcategories')} value={displayCategory || t('none')} />
            {transaction.description ? (
              <TransactionDetailLine label={t('description')} value={transaction.description} />
            ) : null}
            {transaction.type === 'expense' ? (
              <TransactionDetailLine label={t('payment')} value={displayPayment || t('none')} />
            ) : null}
            {transaction.type === 'expense' ? (
              <TransactionDetailLine label={t('assignedPerson')} value={displayPerson || t('none')} />
            ) : null}
            <TransactionDetailLine label={t('currency')} value={transaction.currency} />
            <TransactionDetailLine label={t('created')} value={dateInputFromDate(transaction.createdAt)} />
            <TransactionDetailLine label={t('updated')} value={dateInputFromDate(transaction.updatedAt)} />
            {transaction.installmentGroupId ? (
              <TransactionDetailLine
                label={t('installment')}
                value={`${transaction.installmentNumber ?? '-'} ${t('of')} ${transaction.totalInstallments ?? '-'}`}
              />
            ) : null}
            {transaction.installmentInterestRate !== undefined ? (
              <TransactionDetailLine
                label={t('installmentInterest')}
                value={`${transaction.installmentInterestRate}%`}
              />
            ) : null}
            {transaction.installmentFinancedTotal !== undefined ? (
              <TransactionDetailLine
                label={t('totalFinanced')}
                value={formatMoney(transaction.installmentFinancedTotal, transaction.currency)}
              />
            ) : null}
          </View>

          <View style={[styles.transactionDetailActions, isCompact ? styles.transactionDetailActionsCompact : null]}>
            <AppButton label={t('edit')} Icon={Pencil} onPress={() => onEdit(transaction)} />
            <AppButton label={t('delete')} Icon={Trash2} variant="secondary" onPress={() => onDelete(transaction)} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TransactionEditModal({
  data,
  t,
  transaction,
  onClose,
  onSave,
}: {
  data: AppData;
  t: Translator;
  transaction?: Transaction;
  onClose: () => void;
  onSave: (input: TransactionInput, transaction: Transaction) => void;
}) {
  const { isCompact } = useResponsive();

  if (!transaction) {
    return null;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={[styles.transactionModalOverlay, isCompact ? styles.transactionModalOverlayCompact : null]}>
        <View style={[styles.transactionEditPanel, isCompact ? styles.transactionEditPanelCompact : null]}>
          <ScrollView
            contentContainerStyle={isCompact ? styles.transactionEditScrollCompact : null}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TransactionForm
              data={data}
              t={t}
              editingTransaction={transaction}
              onCancelEdit={onClose}
              onClose={onClose}
              onSave={(input) => onSave(input, transaction)}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TransactionDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.transactionDetailLine}>
      <Text style={styles.transactionDetailLabel}>{label}</Text>
      <Text style={styles.transactionDetailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const UNASSIGNED_CASH_BOX_REPORT_ID = '__unassigned_cash_box__';
const UNASSIGNED_PERSON_REPORT_ID = '__unassigned_person__';
const UNASSIGNED_PAYMENT_METHOD_REPORT_ID = '__unassigned_payment_method__';

type ReportSection =
  | 'menu'
  | 'paymethod'
  | 'subpaymethod'
  | 'category'
  | 'cashbox'
  | 'person'
  | 'subcategory'
  | 'installments'
  | 'export';

type SelectedReportItem = {
  label: string;
  type: ReportSection;
  id: string;
  currency?: string;
} | null;

function ReportsScreen({
  data,
  t,
  selectedMonth,
  deferHardwareBack,
  onBackToDashboard,
  onOpenPremium,
  onSelectTransaction,
}: {
  data: AppData;
  t: Translator;
  selectedMonth: Date;
  deferHardwareBack: boolean;
  onBackToDashboard: () => void;
  onOpenPremium: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
}) {
  const { isCompact } = useResponsive();
  const [activeReport, setActiveReport] = useState<ReportSection>('menu');
  const [selectedItem, setSelectedItem] = useState<SelectedReportItem>(null);
  const canUseCashBoxReport = canUsePremiumFeature(data.settings.premiumEntitlement, 'cashBoxReport');
  const canUseMonthlyCsvExport = canUsePremiumFeature(data.settings.premiumEntitlement, 'monthlyCsvExport');
  const canUseMonthlyPdfExport = canUsePremiumFeature(data.settings.premiumEntitlement, 'monthlyPdfExport');
  const canUseMonthlyExport = canUseMonthlyCsvExport && canUseMonthlyPdfExport;

  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);

  const categorySummaries = useMemo(
    () => summarizeExpensesByCategory(data, transactions),
    [data, transactions],
  );

  const cashBoxSummaries = useMemo<CashBoxSummary[]>(
    () => summarizeExpensesByCashBox(data, transactions),
    [data, transactions],
  );

  const personSummaries = useMemo<PersonSummary[]>(
    () => summarizeExpensesByPerson(data, transactions),
    [data, transactions],
  );

  const paymentMethodSummaries = useMemo(
    () => summarizeExpensesByParentPaymentMethod(data, transactions, data.settings.language),
    [data, transactions],
  );

  const subcategorySummaries = useMemo(() => {
    const bySubcat = new Map<string, { subcategoryId: string; name: string; categoryId: string; amount: number; currency: string }>();
    transactions
      .filter((t) => t.type === 'expense' && t.subcategoryId)
      .forEach((t) => {
        const key = `${t.subcategoryId}-${t.currency}`;
        const sub = data.subcategories.find((s) => s.id === t.subcategoryId);
        const current = bySubcat.get(key) ?? {
          subcategoryId: t.subcategoryId!,
          name: sub?.name ?? t.subcategoryId!,
          categoryId: t.categoryId,
          amount: 0,
          currency: t.currency,
        };
        current.amount += t.amount;
        bySubcat.set(key, current);
      });
    return Array.from(bySubcat.values()).sort((a, b) => b.amount - a.amount);
  }, [data, transactions]);

  const submethodSummaries = useMemo(() => {
    const bySubmethod = new Map<string, { submethodId: string; name: string; amount: number; currency: string }>();
    transactions
      .filter((t) => t.type === 'expense' && t.paymentSubmethodId)
      .forEach((t) => {
        const key = `${t.paymentSubmethodId}-${t.currency}`;
        const current = bySubmethod.get(key) ?? {
          submethodId: t.paymentSubmethodId!,
          name: paymentSubmethodDisplayName(data, t.paymentSubmethodId) ?? t.paymentSubmethodId!,
          amount: 0,
          currency: t.currency,
        };
        current.amount += t.amount;
        bySubmethod.set(key, current);
      });
    return Array.from(bySubmethod.values()).sort((a, b) => b.amount - a.amount);
  }, [data, transactions]);

  const installmentGroups = useMemo(() => {
    const groups = new Map<string, { groupId: string; description: string; currency: string; installmentAmount: number; total: number; current: number; transactions: Transaction[] }>();
    data.transactions
      .filter((t) => t.installmentGroupId)
      .forEach((t) => {
        const groupId = t.installmentGroupId!;
        const existing = groups.get(groupId);
        if (existing) {
          existing.transactions.push(t);
          existing.total = Math.max(existing.total, t.totalInstallments ?? 0);
        } else {
          groups.set(groupId, {
            groupId,
            description: t.name || t.description,
            currency: t.currency,
            installmentAmount: t.amount,
            total: t.totalInstallments ?? 0,
            current: 0,
            transactions: [t],
          });
        }
      });
    const { year, month } = getMonthParts(selectedMonth);
    const selectedMonthIndex = year * 12 + (month - 1);
    return Array.from(groups.values())
      .filter((g) => {
        const paid = g.transactions.filter((t) => {
          const transactionMonthIndex = t.date.getFullYear() * 12 + t.date.getMonth();
          return transactionMonthIndex < selectedMonthIndex;
        }).length;
        return g.total - paid > 0;
      })
      .map((g) => {
        const paid = g.transactions.filter((t) => {
          const transactionMonthIndex = t.date.getFullYear() * 12 + t.date.getMonth();
          return transactionMonthIndex < selectedMonthIndex;
        }).length;
        return { ...g, current: paid + 1 };
      })
      .sort((a, b) => a.current - b.current);
  }, [data.transactions, selectedMonth]);

  const drillTransactions = useMemo(() => {
    if (!selectedItem) return [];
    const base = selectedItem.type === 'installments' ? data.transactions : transactions;
    return base.filter((t) => {
      if (selectedItem.type === 'cashbox') {
        const category = data.categories.find((item) => item.id === t.categoryId);
        const cashBoxId = category?.cashBoxId ?? UNASSIGNED_CASH_BOX_REPORT_ID;
        return cashBoxId === selectedItem.id && t.currency === selectedItem.currency;
      }
      if (selectedItem.type === 'category') return t.categoryId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'person') {
        const personId = t.assignedPersonId ?? UNASSIGNED_PERSON_REPORT_ID;
        return t.type === 'expense' && personId === selectedItem.id && t.currency === selectedItem.currency;
      }
      if (selectedItem.type === 'subcategory') return t.subcategoryId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'paymethod') {
        const paymentMethodId = paymentMethodIdForTransaction(data, t) ?? UNASSIGNED_PAYMENT_METHOD_REPORT_ID;
        return t.type === 'expense' && paymentMethodId === selectedItem.id && t.currency === selectedItem.currency;
      }
      if (selectedItem.type === 'subpaymethod') return t.paymentSubmethodId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'installments') return t.installmentGroupId === selectedItem.id;
      return false;
    });
  }, [selectedItem, transactions, data, data.transactions]);

  const drillGroups = useMemo(() => groupTransactionsByDate(drillTransactions), [drillTransactions]);

  const toMonth = (month: Date) => monthLabel(month, localeForLanguage(data.settings.language));
  const exportMonthlyReport = async (format: 'csv' | 'pdf') => {
    try {
      const exportDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!exportDirectory || !sharingAvailable) {
        throw new Error('File sharing is not available on this device.');
      }

      const { month, year } = getMonthParts(selectedMonth);
      const monthSlug = `${year}-${String(month).padStart(2, '0')}`;
      const title = `${t('monthlyReport')} - ${toMonth(selectedMonth)}`;

      if (format === 'csv') {
        const uri = `${exportDirectory}monthly-report-${monthSlug}.csv`;
        await FileSystem.writeAsStringAsync(uri, monthlyReportToCsv(data, transactions, data.settings.language), {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(uri, {
          dialogTitle: title,
          mimeType: 'text/csv',
        });
        return;
      }

      const printed = await Print.printToFileAsync({
        html: monthlyReportToHtml(data, transactions, title, data.settings.language),
      });
      const uri = `${exportDirectory}monthly-report-${monthSlug}.pdf`;
      await FileSystem.copyAsync({ from: printed.uri, to: uri });
      await Sharing.shareAsync(uri, {
        dialogTitle: title,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      console.warn(error);
      Alert.alert(t('exportFailedTitle'), t('exportFailedMessage'));
    }
  };

  const goBack = () => {
    if (selectedItem) { setSelectedItem(null); return; }
    setActiveReport('menu');
  };

  const reportTitle: Record<ReportSection, string> = {
    menu: '',
    paymethod: t('byPaymentMethod'),
    subpaymethod: t('byPaymentSubmethod'),
    cashbox: t('byCashBox'),
    category: t('byCategory'),
    person: t('byPerson'),
    subcategory: t('bySubcategory'),
    installments: t('installments'),
    export: t('monthlyExport'),
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (deferHardwareBack) {
        return false;
      }

      if (selectedItem) {
        setSelectedItem(null);
        return true;
      }

      if (activeReport !== 'menu') {
        setActiveReport('menu');
        return true;
      }

      onBackToDashboard();
      return true;
    });

    return () => subscription.remove();
  }, [activeReport, deferHardwareBack, onBackToDashboard, selectedItem]);

  const DetailHeader = ({ title }: { title: string }) => (
    <View style={styles.settingsDetailHeader}>
      <IconButton accessibilityLabel={t('backToReports')} Icon={ChevronLeft} onPress={goBack} />
      <View style={styles.reportDetailTitle}>
        <Text style={styles.sectionTitle} numberOfLines={1}>{title}</Text>
      </View>
    </View>
  );

  if (selectedItem) {
    return (
      <ScreenScroll>
        <DetailHeader title={selectedItem.label} />
        <Text style={styles.reportMonthLabel}>
          {selectedItem.type === 'installments' ? t('allInstallments') : toMonth(selectedMonth)}
        </Text>
        {drillGroups.length ? (
          drillGroups.map((group) => (
            <ExpenseDayCard
              key={group.dateKey}
              data={data}
              t={t}
              group={group}
              onSelectTransaction={onSelectTransaction}
            />
          ))
        ) : (
          <EmptyState title={t('noExpensesFound')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'menu') {
    return (
      <ScreenScroll>
        <Text style={styles.sectionTitle}>{t('reports')}</Text>
        <View style={styles.settingsMenu}>
          <SettingsMenuButton
            title={t('byPaymentMethod')}
            subtitle={`${paymentMethodSummaries.length} ${t('paymentMethodsWithExpenses')}`}
            Icon={WalletCards}
            onPress={() => setActiveReport('paymethod')}
          />
          <SettingsMenuButton
            title={t('byPaymentSubmethod')}
            subtitle={`${submethodSummaries.length} ${t('submethodsWithExpenses')}`}
            Icon={WalletCards}
            onPress={() => setActiveReport('subpaymethod')}
          />
          <SettingsMenuButton
            title={t('byCashBox')}
            subtitle={canUseCashBoxReport ? `${cashBoxSummaries.length} ${t('cashBoxesWithExpenses')}` : t('premiumLockedSubtitle')}
            Icon={Package}
            badgeLabel={canUseCashBoxReport ? undefined : t('premiumBadge')}
            onPress={() => (canUseCashBoxReport ? setActiveReport('cashbox') : onOpenPremium())}
          />
          <SettingsMenuButton
            title={t('byCategory')}
            subtitle={`${categorySummaries.length} ${t('categoriesWithExpenses')}`}
            Icon={List}
            onPress={() => setActiveReport('category')}
          />
          <SettingsMenuButton
            title={t('byPerson')}
            subtitle={`${personSummaries.length} ${t('peopleWithExpenses')}`}
            Icon={UserRound}
            onPress={() => setActiveReport('person')}
          />
          <SettingsMenuButton
            title={t('bySubcategory')}
            subtitle={`${subcategorySummaries.length} ${t('subcategoriesWithExpenses')}`}
            Icon={Receipt}
            onPress={() => setActiveReport('subcategory')}
          />
          <SettingsMenuButton
            title={t('installments')}
            subtitle={`${installmentGroups.length} ${t('activeInstallmentPlans')}`}
            Icon={Repeat}
            onPress={() => setActiveReport('installments')}
          />
          <SettingsMenuButton
            title={t('monthlyExport')}
            subtitle={canUseMonthlyExport ? t('monthlyExportSubtitle') : t('premiumLockedSubtitle')}
            Icon={Save}
            badgeLabel={canUseMonthlyExport ? undefined : t('premiumBadge')}
            onPress={() => (canUseMonthlyExport ? setActiveReport('export') : onOpenPremium())}
          />
        </View>
      </ScreenScroll>
    );
  }

  if (activeReport === 'paymethod') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.paymethod} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {paymentMethodSummaries.length ? (
          paymentMethodSummaries.map((summary) => (
            <Pressable
              key={`${summary.paymentMethodId ?? UNASSIGNED_PAYMENT_METHOD_REPORT_ID}-${summary.currency}`}
              accessibilityRole="button"
              onPress={() =>
                setSelectedItem({
                  type: 'paymethod',
                  id: summary.paymentMethodId ?? UNASSIGNED_PAYMENT_METHOD_REPORT_ID,
                  currency: summary.currency,
                  label: summary.paymentMethodName,
                })
              }
              style={[styles.listRow, isCompact ? styles.listRowCompact : null]}
            >
              <View style={styles.managementIconBadge}>
                <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
              </View>
              <Text style={[styles.rowTitle, styles.reportRowName]} numberOfLines={2}>
                {summary.paymentMethodName}
              </Text>
              <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(summary.amount, summary.currency)}
              </Text>
            </Pressable>
          ))
        ) : (
          <EmptyState title={t('noPaymentMethodExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'subpaymethod') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.subpaymethod} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {submethodSummaries.length ? (
          submethodSummaries.map((s) => (
            <Pressable
              key={`${s.submethodId}-${s.currency}`}
              accessibilityRole="button"
              onPress={() => setSelectedItem({ type: 'subpaymethod', id: s.submethodId, currency: s.currency, label: s.name })}
              style={[styles.listRow, isCompact ? styles.listRowCompact : null]}
            >
              <View style={styles.managementIconBadge}>
                <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
              </View>
              <Text style={[styles.rowTitle, styles.reportRowName]} numberOfLines={2}>{s.name}</Text>
              <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(s.amount, s.currency)}</Text>
            </Pressable>
          ))
        ) : (
          <EmptyState title={t('noSubmethodExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'cashbox') {
    if (!canUseCashBoxReport) {
      return <PremiumLockedScreen t={t} onOpenPremium={onOpenPremium} />;
    }

    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.cashbox} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {cashBoxSummaries.length ? (
          cashBoxSummaries.map((summary) => {
            const cashBox = data.cashBoxes.find((item) => item.id === summary.cashBoxId);
            const CashBoxIcon = getCashBoxIcon(cashBox);
            const cashBoxLabel = cashBoxDisplayName(data, summary.cashBoxId) ?? t('noCashBox');

            return (
              <Pressable
                key={`${summary.cashBoxId ?? UNASSIGNED_CASH_BOX_REPORT_ID}-${summary.currency}`}
                accessibilityRole="button"
                onPress={() =>
                  setSelectedItem({
                    type: 'cashbox',
                    id: summary.cashBoxId ?? UNASSIGNED_CASH_BOX_REPORT_ID,
                    currency: summary.currency,
                    label: cashBoxLabel,
                  })
                }
                style={[styles.listRow, isCompact ? styles.listRowCompact : null]}
              >
                <View style={styles.managementIconBadge}>
                  <CashBoxIcon color={colors.primary} size={18} strokeWidth={2.2} />
                </View>
                <Text style={[styles.rowTitle, styles.reportRowName]} numberOfLines={2}>{cashBoxLabel}</Text>
                <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(summary.amount, summary.currency)}</Text>
              </Pressable>
            );
          })
        ) : (
          <EmptyState title={t('noCashBoxExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'category') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.category} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {categorySummaries.length ? (
          categorySummaries.map((summary) => {
            const categoryLabel = categoryDisplayName(data, summary.categoryId) ?? summary.categoryName;

            return (
              <Pressable
                key={`${summary.categoryId}-${summary.currency}`}
                accessibilityRole="button"
                onPress={() => setSelectedItem({ type: 'category', id: summary.categoryId, currency: summary.currency, label: categoryLabel })}
              >
                <CategorySummaryRow data={data} summary={summary} />
              </Pressable>
            );
          })
        ) : (
          <EmptyState title={t('noCategoryExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'person') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.person} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {personSummaries.length ? (
          personSummaries.map((summary) => {
            const personLabel = summary.personId ? personDisplayName(data, summary.personId) ?? summary.personName : t('noPerson');

            return (
              <Pressable
                key={`${summary.personId ?? UNASSIGNED_PERSON_REPORT_ID}-${summary.currency}`}
                accessibilityRole="button"
                onPress={() =>
                  setSelectedItem({
                    type: 'person',
                    id: summary.personId ?? UNASSIGNED_PERSON_REPORT_ID,
                    currency: summary.currency,
                    label: personLabel,
                  })
                }
                style={[styles.listRow, isCompact ? styles.listRowCompact : null]}
              >
                <View style={styles.managementIconBadge}>
                  <UserRound color={colors.primary} size={18} strokeWidth={2.2} />
                </View>
                <Text style={[styles.rowTitle, styles.reportRowName]} numberOfLines={2}>{personLabel}</Text>
                <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(summary.amount, summary.currency)}</Text>
              </Pressable>
            );
          })
        ) : (
          <EmptyState title={t('noPersonExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'subcategory') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.subcategory} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {subcategorySummaries.length ? (
          subcategorySummaries.map((s) => {
            const parentCategory = data.categories.find((c) => c.id === s.categoryId);
            const subcategory = data.subcategories.find((sub) => sub.id === s.subcategoryId);
            const SubIcon = getSubcategoryIcon(subcategory, parentCategory);
            const subcategoryLabel = displaySubcategoryName(subcategory, data.settings.language) ?? s.name;
            const parentCategoryLabel = displayCategoryName(parentCategory, data.settings.language) ?? '';
            return (
              <Pressable
                key={`${s.subcategoryId}-${s.currency}`}
                accessibilityRole="button"
                onPress={() => setSelectedItem({ type: 'subcategory', id: s.subcategoryId, currency: s.currency, label: subcategoryLabel })}
                style={[styles.listRow, isCompact ? styles.listRowCompact : null]}
              >
                <View style={styles.managementIconBadge}>
                  <SubIcon color={colors.primary} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.reportRowMeta}>
                  <Text style={styles.rowTitle} numberOfLines={2}>{subcategoryLabel}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>{parentCategoryLabel}</Text>
                </View>
                <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(s.amount, s.currency)}</Text>
              </Pressable>
            );
          })
        ) : (
          <EmptyState title={t('noSubcategoryExpenses')} />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'export') {
    if (!canUseMonthlyExport) {
      return <PremiumLockedScreen t={t} onOpenPremium={onOpenPremium} />;
    }

    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.export} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        <View style={styles.exportActions}>
          <AppButton
            label={t('exportCsv')}
            Icon={Save}
            onPress={() => {
              void exportMonthlyReport('csv');
            }}
          />
          <AppButton
            label={t('exportPdf')}
            Icon={Receipt}
            variant="secondary"
            onPress={() => {
              void exportMonthlyReport('pdf');
            }}
          />
        </View>
      </ScreenScroll>
    );
  }

  if (activeReport === 'installments') {
    return (
      <ScreenScroll>
        <DetailHeader title={reportTitle.installments} />
        <Text style={styles.reportMonthLabel}>{toMonth(selectedMonth)}</Text>
        {installmentGroups.length ? (
          installmentGroups.map((g) => (
            <Pressable
              key={g.groupId}
              accessibilityRole="button"
              onPress={() => setSelectedItem({ type: 'installments', id: g.groupId, label: g.description })}
              style={styles.installmentRow}
            >
              <View style={[styles.installmentRowTop, isCompact ? styles.installmentRowTopCompact : null]}>
                <Text style={styles.rowTitle} numberOfLines={2}>{g.description}</Text>
                <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>{formatMoney(g.installmentAmount, g.currency)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.round((g.current / g.total) * 100)}%` }]} />
              </View>
              <Text style={styles.rowMeta}>
                {t('installment')} {g.current} {t('of')} {g.total} · {formatMoney(g.installmentAmount * g.total, g.currency)} {t('total')}
              </Text>
            </Pressable>
          ))
        ) : (
          <EmptyState title={t('noInstallments')} />
        )}
      </ScreenScroll>
    );
  }

  return null;
}

function SettingsScreen({
  data,
  t,
  selectedMonth,
  deferHardwareBack,
  devFixturesEnabled,
  requestedSettingsSection,
  onBackToDashboard,
  onRequestedSettingsSectionConsumed,
  onLoadDevMonthlyReportFixture,
  premiumProducts,
  premiumPurchaseBusy,
  premiumStoreConnected,
  premiumStoreError,
  onStartPremiumPurchase,
  onRestorePremiumPurchases,
  onSaveBudget,
  onDeleteBudget,
  onSetDefaultCurrency,
  onSetDefaultPaymentSubmethod,
  onSetLanguage,
  onSetThemeMode,
  onSetBiometricLockEnabled,
  onAddCategory,
  onUpdateCategory,
  onAssignCategoryCashBox,
  onAddSubcategory,
  onUpdateSubcategory,
  onDisableCategory,
  onDisableSubcategory,
  onAddPaymentMethod,
  onUpdatePaymentMethod,
  onAddPaymentSubmethod,
  onUpdatePaymentSubmethod,
  onDisablePaymentMethod,
  onDisablePaymentSubmethod,
  onAddPerson,
  onUpdatePerson,
  onDisablePerson,
}: {
  data: AppData;
  t: Translator;
  selectedMonth: Date;
  deferHardwareBack: boolean;
  devFixturesEnabled: boolean;
  requestedSettingsSection?: SettingsSection;
  onBackToDashboard: () => void;
  onRequestedSettingsSectionConsumed: () => void;
  onLoadDevMonthlyReportFixture?: () => void;
  premiumProducts: PremiumProductDisplay[];
  premiumPurchaseBusy: PremiumPurchaseBusyState;
  premiumStoreConnected: boolean;
  premiumStoreError?: string;
  onStartPremiumPurchase: (productId: PremiumProductId) => void;
  onRestorePremiumPurchases: () => void;
  onSaveBudget: (subcategoryId: string, amount: number, currency: string, budgetId?: string) => void;
  onDeleteBudget: (budgetId: string) => void;
  onSetDefaultCurrency: (currency: string) => void;
  onSetDefaultPaymentSubmethod: (paymentSubmethodId: string) => void;
  onSetLanguage: (language: AppLanguage) => void;
  onSetThemeMode: (themeMode: ThemeMode) => void;
  onSetBiometricLockEnabled: (enabled: boolean) => void;
  onAddCategory: (type: TransactionType, name: string, icon?: string, cashBoxId?: string) => void;
  onUpdateCategory: (
    categoryId: string,
    type: TransactionType,
    name: string,
    icon?: string,
    cashBoxId?: string,
  ) => void;
  onAssignCategoryCashBox: (categoryId: string, cashBoxId: string) => void;
  onAddSubcategory: (categoryId: string, name: string, icon?: string) => void;
  onUpdateSubcategory: (subcategoryId: string, categoryId: string, name: string, icon?: string) => void;
  onDisableCategory: (categoryId: string) => void;
  onDisableSubcategory: (subcategoryId: string) => void;
  onAddPaymentMethod: (name: string) => void;
  onUpdatePaymentMethod: (paymentMethodId: string, name: string) => void;
  onAddPaymentSubmethod: (paymentMethodId: string, name: string) => void;
  onUpdatePaymentSubmethod: (paymentSubmethodId: string, paymentMethodId: string, name: string) => void;
  onDisablePaymentMethod: (paymentMethodId: string) => void;
  onDisablePaymentSubmethod: (paymentSubmethodId: string) => void;
  onAddPerson: (name: string) => void;
  onUpdatePerson: (personId: string, name: string) => void;
  onDisablePerson: (personId: string) => void;
}) {
  const { isCompact } = useResponsive();
  const settingsScrollRef = useRef<ScrollView>(null);
  const [defaultCurrency, setDefaultCurrency] = useState(data.settings.defaultCurrency);
  const [defaultPaymentPickerOpen, setDefaultPaymentPickerOpen] = useState(false);
  const [budgetSubcategoryId, setBudgetSubcategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState(data.settings.defaultCurrency);
  const [budgetCurrencyPickerOpen, setBudgetCurrencyPickerOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | undefined>();
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryCashBoxId, setCategoryCashBoxId] = useState(
    data.cashBoxes.find((cashBox) => cashBox.active)?.id ?? '',
  );
  const [categoryIconInput, setCategoryIconInput] = useState<string | undefined>();
  const [categoryIconPickerOpen, setCategoryIconPickerOpen] = useState(true);
  const [subcategoryType, setSubcategoryType] = useState<TransactionType>('expense');
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState(
    data.categories.find((category) => category.type === 'expense' && category.active)?.id ?? '',
  );
  const [subcategoryNameInput, setSubcategoryNameInput] = useState('');
  const [subcategoryIconInput, setSubcategoryIconInput] = useState<string | undefined>();
  const [paymentMethodInput, setPaymentMethodInput] = useState('');
  const [paymentCreationMode, setPaymentCreationMode] = useState<'method' | 'submethod'>('method');
  const [paymentSubmethodMethodId, setPaymentSubmethodMethodId] = useState(
    data.paymentMethods.find((method) => method.active)?.id ?? '',
  );
  const [expandedPaymentMethodId, setExpandedPaymentMethodId] = useState<string | undefined>();
  const [paymentSubmethodInput, setPaymentSubmethodInput] = useState('');
  const [personNameInput, setPersonNameInput] = useState('');
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>('menu');
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>();
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryType, setEditingCategoryType] = useState<TransactionType>('expense');
  const [editingCategoryCashBoxId, setEditingCategoryCashBoxId] = useState('');
  const [editingCategoryIcon, setEditingCategoryIcon] = useState<string | undefined>();
  const [editingCategoryIconPickerOpen, setEditingCategoryIconPickerOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | undefined>();
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');
  const [editingSubcategoryCategoryId, setEditingSubcategoryCategoryId] = useState('');
  const [editingSubcategoryIcon, setEditingSubcategoryIcon] = useState<string | undefined>();
  const [editingSubcategoryParentPickerOpen, setEditingSubcategoryParentPickerOpen] = useState(false);
  const [editingSubcategoryIconPickerOpen, setEditingSubcategoryIconPickerOpen] = useState(false);
  const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<string | undefined>();
  const [editingPaymentMethodName, setEditingPaymentMethodName] = useState('');
  const [editingPaymentSubmethodId, setEditingPaymentSubmethodId] = useState<string | undefined>();
  const [editingPaymentSubmethodName, setEditingPaymentSubmethodName] = useState('');
  const [editingPaymentSubmethodMethodId, setEditingPaymentSubmethodMethodId] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | undefined>();
  const [editingPersonName, setEditingPersonName] = useState('');
  const [expandedSubcategoryCategoryIds, setExpandedSubcategoryCategoryIds] = useState<string[]>([]);
  const [expandedCashBoxId, setExpandedCashBoxId] = useState<string | undefined>();
  const [subcategoryParentPickerOpen, setSubcategoryParentPickerOpen] = useState(false);
  const [subcategoryIconPickerOpen, setSubcategoryIconPickerOpen] = useState(true);

  const activeCategories = useMemo(
    () =>
      data.categories
        .filter((category) => category.active)
        .sort(compareCategoryDisplayName(data.settings.language)),
    [data.categories, data.settings.language],
  );
  const activeCashBoxes = useMemo(
    () =>
      data.cashBoxes
        .filter((cashBox) => cashBox.active)
        .sort(compareCashBoxDisplayName(data.settings.language)),
    [data.cashBoxes, data.settings.language],
  );
  const defaultActiveCashBoxId = activeCashBoxes[0]?.id ?? '';
  const expenseCategories = useMemo(
    () => activeCategories.filter((category) => category.type === 'expense'),
    [activeCategories],
  );
  const visibleCategories = useMemo(
    () => activeCategories.filter((category) => category.type === categoryType),
    [activeCategories, categoryType],
  );
  const subcategoryParentCategories = useMemo(
    () => activeCategories.filter((category) => category.type === subcategoryType),
    [activeCategories, subcategoryType],
  );
  const activeSubcategories = useMemo(
    () =>
      data.subcategories
        .filter((subcategory) => subcategory.active)
        .sort(compareSubcategoryDisplayName(data.settings.language)),
    [data.settings.language, data.subcategories],
  );
  const expenseCategoryIds = useMemo(
    () => new Set(expenseCategories.map((category) => category.id)),
    [expenseCategories],
  );
  const expenseSubcategories = useMemo(
    () => activeSubcategories.filter((subcategory) => expenseCategoryIds.has(subcategory.categoryId)),
    [activeSubcategories, expenseCategoryIds],
  );
  const subcategoryGroups = useMemo(
    () =>
      subcategoryParentCategories.map((category) => ({
        category,
        subcategories: activeSubcategories.filter((subcategory) => subcategory.categoryId === category.id),
      })),
    [activeSubcategories, subcategoryParentCategories],
  );
  const activePaymentMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.active),
    [data.paymentMethods],
  );
  const activePaymentSubmethods = useMemo(() => {
    const activePaymentMethodIds = new Set(activePaymentMethods.map((method) => method.id));

    return data.paymentSubmethods
      .filter((submethod) => activePaymentMethodIds.has(submethod.paymentMethodId) && submethod.active)
      .sort((left, right) => {
        const leftLabel = displayPaymentSubmethodName(left, data.settings.language) ?? left.name;
        const rightLabel = displayPaymentSubmethodName(right, data.settings.language) ?? right.name;

        return leftLabel.localeCompare(rightLabel, data.settings.language, { sensitivity: 'base' });
      });
  }, [activePaymentMethods, data.paymentSubmethods, data.settings.language]);
  const selectedDefaultPaymentSubmethod = activePaymentSubmethods.find(
    (submethod) => submethod.id === data.settings.defaultPaymentSubmethodId,
  );
  const selectedDefaultPaymentMethod = activePaymentMethods.find(
    (method) => method.id === selectedDefaultPaymentSubmethod?.paymentMethodId,
  );
  const selectedDefaultPaymentSubmethodLabel =
    displayPaymentSubmethodName(selectedDefaultPaymentSubmethod, data.settings.language) ??
    selectedDefaultPaymentSubmethod?.name;
  const selectedDefaultPaymentMethodLabel =
    displayPaymentMethodName(selectedDefaultPaymentMethod, data.settings.language) ??
    selectedDefaultPaymentMethod?.name;
  const budgetCurrencyOptions = useMemo(
    () =>
      Array.from(
        new Set([
          normalizeCurrency(data.settings.defaultCurrency),
          normalizeCurrency(budgetCurrency),
          'ARS',
          'USD',
          'EUR',
          ...data.transactions.map((transaction) => normalizeCurrency(transaction.currency)),
          ...data.budgets.map((budget) => normalizeCurrency(budget.currency)),
        ]),
      ),
    [budgetCurrency, data.budgets, data.settings.defaultCurrency, data.transactions],
  );
  const activePeople = useMemo(
    () =>
      data.people
        .filter((person) => person.active)
        .sort((left, right) => left.name.localeCompare(right.name, data.settings.language, { sensitivity: 'base' })),
    [data.people, data.settings.language],
  );
  const selectedPaymentMethod =
    activePaymentMethods.find((method) => method.id === paymentSubmethodMethodId) ?? activePaymentMethods[0];
  const selectedPaymentMethodId = selectedPaymentMethod?.id ?? '';
  const selectedSubcategoryParent = subcategoryParentCategories.find(
    (category) => category.id === subcategoryCategoryId,
  );
  const selectedEditingSubcategoryParent = subcategoryParentCategories.find(
    (category) => category.id === editingSubcategoryCategoryId,
  );
  const budgets = summarizeBudgets(data, selectedMonth);
  const editingBudget = budgets.find((budget) => budget.budget.id === editingBudgetId);
  const editingBudgetSubcategory = data.subcategories.find(
    (subcategory) => subcategory.id === editingBudget?.budget.subcategoryId,
  );
  const editingBudgetCategory = data.categories.find(
    (category) => category.id === (editingBudgetSubcategory?.categoryId ?? editingBudget?.budget.categoryId),
  );
  const selectedBudgetSubcategory = data.subcategories.find((subcategory) => subcategory.id === budgetSubcategoryId);
  const selectedBudgetCategory = data.categories.find((category) => category.id === selectedBudgetSubcategory?.categoryId);
  const selectedBudgetSubcategoryLabel =
    displaySubcategoryName(selectedBudgetSubcategory, data.settings.language) ??
    selectedBudgetSubcategory?.name ??
    editingBudget?.subcategoryName ??
    t('chooseSubcategory');
  const selectedBudgetCategoryLabel =
    displayCategoryName(selectedBudgetCategory, data.settings.language) ??
    selectedBudgetCategory?.name ??
    editingBudget?.categoryName;
  const editingBudgetRequiresSubcategory = Boolean(editingBudget?.requiresSubcategory);
  const premiumActive = isPremiumActive(data.settings.premiumEntitlement);
  const premiumStatusLabel = premiumActive ? t('premiumActive') : t('premiumInactive');
  const canActivateDarkTheme = canSelectThemeMode(
    data.settings.premiumEntitlement,
    data.settings.themeMode,
    'dark',
  );
  const premiumFeatureLabels = [
    t('premiumFeatureDarkMode'),
    t('premiumFeatureCashBoxReport'),
    t('premiumFeaturePdf'),
    t('premiumFeatureCsv'),
  ];
  const settingsSectionTitles: Record<Exclude<SettingsSection, 'menu'>, string> = {
    core: t('coreSettings'),
    premium: t('premium'),
    budgets: t('budgets'),
    categories: t('categories'),
    cashboxes: t('cashBoxes'),
    subcategories: t('subcategories'),
    payments: t('paymentMethods'),
    people: t('people'),
    about: t('about'),
  };

  useEffect(() => {
    if (!requestedSettingsSection) {
      return;
    }

    setActiveSettingsSection(requestedSettingsSection);
    onRequestedSettingsSectionConsumed();
  }, [onRequestedSettingsSectionConsumed, requestedSettingsSection]);

  useEffect(() => {
    if (editingBudgetId) {
      return;
    }

    if (budgetSubcategoryId && !expenseSubcategories.some((subcategory) => subcategory.id === budgetSubcategoryId)) {
      setBudgetSubcategoryId('');
    }
  }, [budgetSubcategoryId, editingBudgetId, expenseSubcategories]);

  useEffect(() => {
    if (!subcategoryParentCategories.some((category) => category.id === subcategoryCategoryId)) {
      setSubcategoryCategoryId(subcategoryParentCategories[0]?.id ?? '');
    }

    const parentCategoryIds = new Set(subcategoryParentCategories.map((category) => category.id));
    const validExpandedCategoryIds = expandedSubcategoryCategoryIds.filter((categoryId) =>
      parentCategoryIds.has(categoryId),
    );

    if (validExpandedCategoryIds.length !== expandedSubcategoryCategoryIds.length) {
      setExpandedSubcategoryCategoryIds(validExpandedCategoryIds);
    }
  }, [expandedSubcategoryCategoryIds, subcategoryCategoryId, subcategoryParentCategories]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (deferHardwareBack) {
        return false;
      }

      if (activeSettingsSection !== 'menu') {
        setActiveSettingsSection('menu');
        return true;
      }

      onBackToDashboard();
      return true;
    });

    return () => subscription.remove();
  }, [activeSettingsSection, deferHardwareBack, onBackToDashboard]);

  const clearBudgetEdit = () => {
    setEditingBudgetId(undefined);
    setBudgetAmount('');
    setBudgetCurrency(data.settings.defaultCurrency);
    setBudgetCurrencyPickerOpen(false);
    setBudgetSubcategoryId('');
  };

  const startBudgetEdit = (budget: BudgetSummary) => {
    setEditingBudgetId(budget.budget.id);
    setBudgetSubcategoryId(budget.budget.subcategoryId ?? '');
    setBudgetCurrency(budget.budget.currency);
    setBudgetAmount(String(budget.budget.amount));
    requestAnimationFrame(() => settingsScrollRef.current?.scrollTo({ y: 0, animated: true }));
  };

  const saveBudget = () => {
    const parsedAmount = Number(budgetAmount.replace(',', '.'));

    if (!budgetSubcategoryId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t('budgetInvalidTitle'), t('budgetInvalidMessage'));
      return;
    }

    onSaveBudget(budgetSubcategoryId, parsedAmount, budgetCurrency, editingBudgetId);
    if (editingBudgetId) {
      clearBudgetEdit();
      return;
    }

    setBudgetAmount('');
    setBudgetCurrency(data.settings.defaultCurrency);
    setBudgetCurrencyPickerOpen(false);
    setBudgetSubcategoryId('');
  };

  useEffect(() => {
    if (editingBudgetId && !editingBudget) {
      clearBudgetEdit();
    }
  }, [editingBudget, editingBudgetId]);

  useEffect(() => {
    if (
      categoryType === 'expense' &&
      defaultActiveCashBoxId &&
      !activeCashBoxes.some((cashBox) => cashBox.id === categoryCashBoxId)
    ) {
      setCategoryCashBoxId(defaultActiveCashBoxId);
    }
  }, [activeCashBoxes, categoryCashBoxId, categoryType, defaultActiveCashBoxId]);

  useEffect(() => {
    if (
      editingCategoryId &&
      editingCategoryType === 'expense' &&
      defaultActiveCashBoxId &&
      !activeCashBoxes.some((cashBox) => cashBox.id === editingCategoryCashBoxId)
    ) {
      setEditingCategoryCashBoxId(defaultActiveCashBoxId);
    }
  }, [activeCashBoxes, defaultActiveCashBoxId, editingCategoryCashBoxId, editingCategoryId, editingCategoryType]);

  const startCategoryEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryType(category.type);
    setEditingCategoryCashBoxId(category.cashBoxId ?? defaultActiveCashBoxId);
    setEditingCategoryIcon(category.icon);
    setEditingCategoryIconPickerOpen(!category.icon);
  };

  const clearCategoryEdit = () => {
    setEditingCategoryId(undefined);
    setEditingCategoryName('');
    setEditingCategoryType('expense');
    setEditingCategoryCashBoxId('');
    setEditingCategoryIcon(undefined);
    setEditingCategoryIconPickerOpen(false);
  };

  const handleCategoryTypeChange = (next: TransactionType) => {
    setCategoryType(next);
    if (next === 'expense' && defaultActiveCashBoxId) {
      setCategoryCashBoxId((current) =>
        activeCashBoxes.some((cashBox) => cashBox.id === current) ? current : defaultActiveCashBoxId,
      );
    }
    clearCategoryEdit();
  };

  const saveCategoryEdit = () => {
    if (!editingCategoryId) {
      return;
    }

    onUpdateCategory(
      editingCategoryId,
      editingCategoryType,
      editingCategoryName,
      editingCategoryIcon,
      editingCategoryType === 'expense' ? editingCategoryCashBoxId || defaultActiveCashBoxId : undefined,
    );
    clearCategoryEdit();
  };

  const startSubcategoryEdit = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setEditingSubcategoryName(subcategory.name);
    setEditingSubcategoryCategoryId(subcategory.categoryId);
    setEditingSubcategoryIcon(subcategory.icon);
    setEditingSubcategoryParentPickerOpen(false);
    setEditingSubcategoryIconPickerOpen(!subcategory.icon);
  };

  const clearSubcategoryEdit = () => {
    setEditingSubcategoryId(undefined);
    setEditingSubcategoryName('');
    setEditingSubcategoryCategoryId('');
    setEditingSubcategoryIcon(undefined);
    setEditingSubcategoryParentPickerOpen(false);
    setEditingSubcategoryIconPickerOpen(false);
  };

  const handleSubcategoryTypeChange = (next: TransactionType) => {
    setSubcategoryType(next);
    setExpandedSubcategoryCategoryIds([]);
    setSubcategoryParentPickerOpen(false);
    clearSubcategoryEdit();
  };

  const saveSubcategoryEdit = () => {
    if (!editingSubcategoryId) {
      return;
    }

    onUpdateSubcategory(
      editingSubcategoryId,
      editingSubcategoryCategoryId,
      editingSubcategoryName,
      editingSubcategoryIcon,
    );
    clearSubcategoryEdit();
  };

  const startPaymentMethodEdit = (methodId: string, methodName: string) => {
    setEditingPaymentMethodId(methodId);
    setEditingPaymentMethodName(methodName);
    setExpandedPaymentMethodId(undefined);
    clearPaymentSubmethodEdit();
  };

  const clearPaymentMethodEdit = () => {
    setEditingPaymentMethodId(undefined);
    setEditingPaymentMethodName('');
  };

  const savePaymentMethodEdit = () => {
    if (!editingPaymentMethodId) {
      return;
    }

    onUpdatePaymentMethod(editingPaymentMethodId, editingPaymentMethodName);
    clearPaymentMethodEdit();
  };

  const startPaymentSubmethodEdit = (submethodId: string, methodId: string, submethodName: string) => {
    setEditingPaymentSubmethodId(submethodId);
    setEditingPaymentSubmethodMethodId(methodId);
    setEditingPaymentSubmethodName(submethodName);
    setEditingPaymentMethodId(undefined);
    setEditingPaymentMethodName('');
    setExpandedPaymentMethodId(methodId);
  };

  const clearPaymentSubmethodEdit = () => {
    setEditingPaymentSubmethodId(undefined);
    setEditingPaymentSubmethodMethodId('');
    setEditingPaymentSubmethodName('');
  };

  const savePaymentSubmethodEdit = () => {
    if (!editingPaymentSubmethodId) {
      return;
    }

    onUpdatePaymentSubmethod(
      editingPaymentSubmethodId,
      editingPaymentSubmethodMethodId,
      editingPaymentSubmethodName,
    );
    clearPaymentSubmethodEdit();
  };

  const startPersonEdit = (person: Person) => {
    setEditingPersonId(person.id);
    setEditingPersonName(person.name);
  };

  const clearPersonEdit = () => {
    setEditingPersonId(undefined);
    setEditingPersonName('');
  };

  const savePersonEdit = () => {
    if (!editingPersonId) {
      return;
    }

    onUpdatePerson(editingPersonId, editingPersonName);
    clearPersonEdit();
  };

  const toggleExpandedPaymentMethod = (methodId: string) => {
    clearPaymentMethodEdit();
    clearPaymentSubmethodEdit();
    setPaymentSubmethodMethodId(methodId);
    setExpandedPaymentMethodId((current) => (current === methodId ? undefined : methodId));
  };

  if (activeSettingsSection === 'menu') {
    return (
      <ScreenScroll>
        <Text style={styles.sectionTitle}>{t('settings')}</Text>
        <View style={styles.settingsMenu}>
          <SettingsMenuButton
            title={t('coreSettings')}
            subtitle={`${t('defaultCurrency')}: ${data.settings.defaultCurrency} · ${t('language')}: ${t(data.settings.language === 'es-AR' ? 'languageSpanishArgentina' : 'languageEnglish')} · ${t('theme')}: ${t(data.settings.themeMode === 'dark' ? 'themeDark' : 'themeLight')}`}
            Icon={SettingsIcon}
            onPress={() => setActiveSettingsSection('core')}
          />
          <SettingsMenuButton
            title={t('premium')}
            subtitle={`${premiumStatusLabel} - ${t('premiumSubtitle')}`}
            Icon={BadgeDollarSign}
            badgeLabel={premiumActive ? undefined : t('premiumBadge')}
            onPress={() => setActiveSettingsSection('premium')}
          />
          <SettingsMenuButton
            title={t('budgets')}
            subtitle={monthLabel(selectedMonth, localeForLanguage(data.settings.language))}
            Icon={BarChart3}
            onPress={() => setActiveSettingsSection('budgets')}
          />
          <SettingsMenuButton
            title={t('categories')}
            subtitle={`${activeCategories.length} ${t('activeCategories')}`}
            Icon={List}
            onPress={() => setActiveSettingsSection('categories')}
          />
          <SettingsMenuButton
            title={t('cashBoxes')}
            subtitle={`${activeCashBoxes.length} ${t('fixedCashBoxes')}`}
            Icon={Package}
            onPress={() => setActiveSettingsSection('cashboxes')}
          />
          <SettingsMenuButton
            title={t('subcategories')}
            subtitle={`${activeSubcategories.length} ${t('activeSubcategories')}`}
            Icon={Receipt}
            onPress={() => setActiveSettingsSection('subcategories')}
          />
          <SettingsMenuButton
            title={t('paymentMethods')}
            subtitle={`${activePaymentMethods.length} ${t('activeMethods')}`}
            Icon={WalletCards}
            onPress={() => setActiveSettingsSection('payments')}
          />
          <SettingsMenuButton
            title={t('people')}
            subtitle={`${activePeople.length} ${t('activePeople')}`}
            Icon={UserRound}
            onPress={() => setActiveSettingsSection('people')}
          />
          <SettingsMenuButton
            title={t('about')}
            subtitle={t('aboutSubtitle')}
            Icon={Info}
            onPress={() => setActiveSettingsSection('about')}
          />
        </View>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll scrollRef={settingsScrollRef}>
      <View style={styles.settingsDetailHeader}>
        <IconButton
          accessibilityLabel={t('backToSettings')}
          Icon={ChevronLeft}
          onPress={() => setActiveSettingsSection('menu')}
        />
        <Text style={styles.sectionTitle}>{settingsSectionTitles[activeSettingsSection]}</Text>
      </View>

      {activeSettingsSection === 'core' ? (
        <View style={styles.formPanel}>
        <Field label={t('language')}>
          <View style={styles.chipRow}>
            <Chip
              label={t('languageEnglish')}
              selected={data.settings.language === 'en'}
              onPress={() => onSetLanguage('en')}
            />
            <Chip
              label={t('languageSpanishArgentina')}
              selected={data.settings.language === 'es-AR'}
              onPress={() => onSetLanguage('es-AR')}
            />
          </View>
        </Field>
        <Field label={t('theme')}>
          <View style={styles.chipRow}>
            <Chip
              label={t('themeLight')}
              selected={data.settings.themeMode === 'light'}
              onPress={() => onSetThemeMode('light')}
            />
            <Chip
              label={canActivateDarkTheme ? t('themeDark') : `${t('themeDark')} Premium`}
              selected={data.settings.themeMode === 'dark'}
              onPress={() => {
                if (canActivateDarkTheme) {
                  onSetThemeMode('dark');
                  return;
                }

                setActiveSettingsSection('premium');
              }}
            />
          </View>
        </Field>
        <Field label={t('defaultCurrency')}>
          <TextInput
            autoCapitalize="characters"
            maxLength={3}
            value={defaultCurrency}
            onChangeText={setDefaultCurrency}
            style={styles.input}
          />
        </Field>
        <AppButton label={t('saveCurrency')} Icon={Save} onPress={() => onSetDefaultCurrency(defaultCurrency)} />
        <Field label={t('defaultPaymentMethod')}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: defaultPaymentPickerOpen }}
            disabled={!activePaymentSubmethods.length}
            onPress={() => setDefaultPaymentPickerOpen((current) => !current)}
            style={styles.selectedOptionRow}
          >
            <View style={styles.selectedOptionInfo}>
              <View style={styles.managementIconBadge}>
                <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
              </View>
              <View style={styles.managementText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {selectedDefaultPaymentSubmethodLabel ??
                    (activePaymentSubmethods.length ? t('noDefaultPayment') : t('noPaymentOptions'))}
                </Text>
                {selectedDefaultPaymentMethodLabel ? (
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {selectedDefaultPaymentMethodLabel}
                  </Text>
                ) : null}
              </View>
            </View>
            {activePaymentSubmethods.length ? (
              defaultPaymentPickerOpen ? (
                <ChevronDown color={colors.textMuted} size={18} strokeWidth={2.2} />
              ) : (
                <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
              )
            ) : null}
          </Pressable>
          {defaultPaymentPickerOpen ? (
            <View style={styles.defaultPaymentPickerList}>
              {activePaymentSubmethods.map((submethod) => {
                const parentMethod = activePaymentMethods.find((method) => method.id === submethod.paymentMethodId);
                const selected = selectedDefaultPaymentSubmethod?.id === submethod.id;

                return (
                  <Pressable
                    key={submethod.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onSetDefaultPaymentSubmethod(submethod.id);
                      setDefaultPaymentPickerOpen(false);
                    }}
                    style={[styles.defaultPaymentChoice, selected ? styles.defaultPaymentChoiceSelected : null]}
                  >
                    <View style={styles.selectedOptionInfo}>
                      <View style={styles.managementIconBadge}>
                        <WalletCards color={selected ? colors.primary : colors.textMuted} size={18} strokeWidth={2.2} />
                      </View>
                      <View style={styles.managementText}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {displayPaymentSubmethodName(submethod, data.settings.language) ?? submethod.name}
                        </Text>
                        <Text style={styles.rowMeta} numberOfLines={1}>
                          {displayPaymentMethodName(parentMethod, data.settings.language) ?? parentMethod?.name ?? t('parentPaymentMethod')}
                        </Text>
                      </View>
                    </View>
                    {selected ? <Check color={colors.primary} size={18} strokeWidth={2.4} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Field>
        <Field label={t('biometricLock')}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: data.settings.biometricLockEnabled }}
            onPress={() => onSetBiometricLockEnabled(!data.settings.biometricLockEnabled)}
            style={styles.toggleSettingRow}
          >
            <View style={styles.toggleSettingInfo}>
              <Lock color={colors.primary} size={20} />
              <View style={styles.managementText}>
                <Text style={styles.rowTitle}>
                  {data.settings.biometricLockEnabled ? t('biometricLockEnabled') : t('biometricLockDisabled')}
                </Text>
                <Text style={styles.rowMeta}>{t('biometricLockDescription')}</Text>
              </View>
            </View>
            <View
              style={[
                styles.switchTrack,
                data.settings.biometricLockEnabled ? styles.switchTrackEnabled : null,
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  data.settings.biometricLockEnabled ? styles.switchThumbEnabled : null,
                ]}
              />
            </View>
          </Pressable>
        </Field>
        </View>
      ) : null}

      {activeSettingsSection === 'premium' ? (
        <View style={styles.formPanel}>
          <View style={styles.premiumStatusCard}>
            <View style={styles.managementIconBadge}>
              <BadgeDollarSign color={colors.primary} size={20} strokeWidth={2.2} />
            </View>
            <View style={styles.managementText}>
              <Text style={styles.rowTitle}>{t('premiumStatus')}</Text>
              <Text style={styles.rowMeta}>{premiumStatusLabel}</Text>
            </View>
            <Text style={[styles.premiumBadge, premiumActive ? styles.premiumBadgeActive : null]}>
              {premiumActive ? t('premiumActive') : t('premiumBadge')}
            </Text>
          </View>

          <Field label={t('premiumSubtitle')}>
            <View style={styles.premiumFeatureList}>
              {premiumFeatureLabels.map((label) => (
                <View key={label} style={styles.premiumFeatureRow}>
                  <Check color={colors.primary} size={18} strokeWidth={2.4} />
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </Field>

          {Platform.OS === 'android' ? (
            <Field label={t('premium')}>
              {!premiumStoreConnected ? <Text style={styles.rowMeta}>{t('premiumStoreLoading')}</Text> : null}
              {premiumStoreError ? <Text style={styles.rowMeta}>{premiumStoreError}</Text> : null}
              <View style={styles.premiumProductList}>
                {premiumProducts.map((product) => {
                  const busy = premiumPurchaseBusy === product.productId;
                  const disabled = Boolean(premiumPurchaseBusy) || !premiumStoreConnected || !product.available;
                  const label = busy
                    ? t('premiumVerifying')
                    : product.displayPrice
                      ? `${product.title} - ${product.displayPrice}`
                      : product.available
                        ? product.title
                        : `${product.title} - ${t('premiumProductUnavailable')}`;

                  return (
                    <AppButton
                      key={product.productId}
                      label={label}
                      Icon={BadgeDollarSign}
                      variant={product.productType === 'inapp' ? 'primary' : 'secondary'}
                      disabled={disabled}
                      onPress={() => onStartPremiumPurchase(product.productId)}
                    />
                  );
                })}
              </View>
              <AppButton
                label={premiumPurchaseBusy === 'restore' ? t('premiumVerifying') : t('premiumRestore')}
                Icon={RefreshCcw}
                variant="secondary"
                disabled={Boolean(premiumPurchaseBusy)}
                onPress={onRestorePremiumPurchases}
              />
            </Field>
          ) : (
            <Text style={styles.rowMeta}>{t('premiumNotAvailable')}</Text>
          )}
        </View>
      ) : null}

      {activeSettingsSection === 'about' ? (
        <AboutPanel
          t={t}
          devFixturesEnabled={devFixturesEnabled}
          onLoadDevMonthlyReportFixture={onLoadDevMonthlyReportFixture}
        />
      ) : null}

      {activeSettingsSection === 'budgets' ? (
        <View style={styles.formPanel}>
        {!budgetSubcategoryId ? (
          <Field label={t('expenseSubcategory')}>
            {editingBudgetRequiresSubcategory ? (
              <Text style={styles.rowMeta}>{t('budgetNeedsSubcategoryMessage')}</Text>
            ) : null}
            <ExpenseSubcategoryGrid
              categories={data.categories}
              contentContainerStyle={styles.budgetSubcategoryGrid}
              emptyTitle={t('noActiveSubcategories')}
              language={data.settings.language}
              selectedSubcategoryId={budgetSubcategoryId}
              subcategories={expenseSubcategories}
              onSelect={(subcategory) => setBudgetSubcategoryId(subcategory.id)}
            />
          </Field>
        ) : null}

        {budgetSubcategoryId ? (
          <View style={styles.budgetEntryPanel}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setBudgetSubcategoryId('')}
              style={styles.budgetSelectedRow}
            >
              <View style={styles.selectedOptionInfo}>
                <CategoryIconBadge category={selectedBudgetCategory ?? editingBudgetCategory} subcategory={selectedBudgetSubcategory ?? editingBudgetSubcategory} />
                <View style={styles.managementText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {selectedBudgetSubcategoryLabel}
                  </Text>
                  {selectedBudgetCategoryLabel ? (
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {selectedBudgetCategoryLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.changeLink}>{t('changeSubcategory')}</Text>
            </Pressable>
            <View style={[styles.formGrid, isCompact ? styles.formGridCompact : null]}>
              <Field label={t('amount')} grid>
                <TextInput
                  keyboardType="decimal-pad"
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.gray}
                  style={styles.input}
                />
              </Field>
              <Field label={t('currency')} grid>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: budgetCurrencyPickerOpen }}
                  onPress={() => setBudgetCurrencyPickerOpen((current) => !current)}
                  style={styles.selectedOptionRow}
                >
                  <Text style={styles.rowTitle}>{normalizeCurrency(budgetCurrency)}</Text>
                  {budgetCurrencyPickerOpen ? (
                    <ChevronDown color={colors.textMuted} size={18} strokeWidth={2.2} />
                  ) : (
                    <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
                  )}
                </Pressable>
                {budgetCurrencyPickerOpen ? (
                  <View style={styles.chipRow}>
                    {budgetCurrencyOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        selected={normalizeCurrency(budgetCurrency) === option}
                        onPress={() => {
                          setBudgetCurrency(option);
                          setBudgetCurrencyPickerOpen(false);
                        }}
                      />
                    ))}
                  </View>
                ) : null}
              </Field>
            </View>
            <View style={styles.budgetFormActions}>
              <AppButton label={editingBudget ? t('updateBudget') : t('saveBudget')} Icon={Save} onPress={saveBudget} />
              {editingBudget ? (
                <AppButton label={t('cancelBudgetEdit')} variant="secondary" onPress={clearBudgetEdit} />
              ) : null}
            </View>
          </View>
        ) : null}

        <Text style={styles.listSectionTitle}>{t('budgetListTitle')}</Text>

        {budgets.map((budget) => {
          const subcategory = data.subcategories.find((item) => item.id === budget.budget.subcategoryId);
          const category = data.categories.find(
            (item) => item.id === (subcategory?.categoryId ?? budget.budget.categoryId),
          );

          return (
            <BudgetStatusRow
              key={budget.budget.id}
              summary={budget}
              category={category}
              subcategory={subcategory}
              t={t}
              language={data.settings.language}
              onEdit={() => startBudgetEdit(budget)}
              onDelete={() => onDeleteBudget(budget.budget.id)}
            />
          );
        })}
        </View>
      ) : null}

      {activeSettingsSection === 'categories' ? (
        <View style={styles.formPanel}>
        <View style={styles.chipRow}>
          <Chip label={t('expense')} selected={categoryType === 'expense'} onPress={() => handleCategoryTypeChange('expense')} />
          <Chip label={t('income')} selected={categoryType === 'income'} onPress={() => handleCategoryTypeChange('income')} />
        </View>
        <Field label={t('newCategory')}>
          <TextInput
            value={categoryNameInput}
            onChangeText={setCategoryNameInput}
            placeholder={t('categoryName')}
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        {categoryType === 'expense' ? (
          <Field label={t('cashBox')}>
            {activeCashBoxes.length ? (
              <View style={styles.chipRow}>
                {activeCashBoxes.map((cashBox) => (
                  <Chip
                    key={cashBox.id}
                    label={displayCashBoxName(cashBox, data.settings.language) ?? cashBox.name}
                    selected={categoryCashBoxId === cashBox.id}
                    onPress={() => setCategoryCashBoxId(cashBox.id)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.rowMeta}>{t('noCashBox')}</Text>
            )}
          </Field>
        ) : null}
        <Field label={t('icon')}>
          <IconPickerField
            selectedIconKey={categoryIconInput}
            pickerOpen={categoryIconPickerOpen}
            t={t}
            onPickerOpenChange={setCategoryIconPickerOpen}
            onSelectIcon={setCategoryIconInput}
          />
        </Field>
        <AppButton
          label={t('addCategory')}
          Icon={Plus}
          onPress={() => {
            onAddCategory(
              categoryType,
              categoryNameInput,
              categoryIconInput,
              categoryType === 'expense' ? categoryCashBoxId || defaultActiveCashBoxId : undefined,
            );
            setCategoryNameInput('');
            setCategoryCashBoxId(defaultActiveCashBoxId);
            setCategoryIconInput(undefined);
            setCategoryIconPickerOpen(true);
          }}
        />

        <Text style={styles.listSectionTitle}>{t('categoryListTitle')}</Text>

        {visibleCategories.length ? visibleCategories.map((category) => (
          <View key={category.id} style={styles.managementEditGroup}>
            <CategoryManagementRow
              category={category}
              cashBox={data.cashBoxes.find((cashBox) => cashBox.id === category.cashBoxId)}
              t={t}
              language={data.settings.language}
              onEdit={() => startCategoryEdit(category)}
              onDisable={() => onDisableCategory(category.id)}
            />
            {editingCategoryId === category.id ? (
              <View style={styles.inlineEditPanel}>
                <View style={styles.chipRow}>
                  <Chip
                    label={t('expense')}
                    selected={editingCategoryType === 'expense'}
                    onPress={() => {
                      setEditingCategoryType('expense');
                      setEditingCategoryCashBoxId((current) =>
                        activeCashBoxes.some((cashBox) => cashBox.id === current) ? current : defaultActiveCashBoxId,
                      );
                    }}
                  />
                  <Chip
                    label={t('income')}
                    selected={editingCategoryType === 'income'}
                    onPress={() => setEditingCategoryType('income')}
                  />
                </View>
                <Field label={t('categoryName')}>
                  <TextInput
                    value={editingCategoryName}
                    onChangeText={setEditingCategoryName}
                    placeholder={t('categoryName')}
                    placeholderTextColor={colors.gray}
                    style={styles.input}
                  />
                </Field>
                {editingCategoryType === 'expense' ? (
                  <Field label={t('cashBox')}>
                    {activeCashBoxes.length ? (
                      <View style={styles.chipRow}>
                        {activeCashBoxes.map((cashBox) => (
                          <Chip
                            key={cashBox.id}
                            label={displayCashBoxName(cashBox, data.settings.language) ?? cashBox.name}
                            selected={editingCategoryCashBoxId === cashBox.id}
                            onPress={() => setEditingCategoryCashBoxId(cashBox.id)}
                          />
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.rowMeta}>{t('noCashBox')}</Text>
                    )}
                  </Field>
                ) : null}
                <Field label={t('icon')}>
                  <IconPickerField
                    selectedIconKey={editingCategoryIcon}
                    pickerOpen={editingCategoryIconPickerOpen}
                    t={t}
                    onPickerOpenChange={setEditingCategoryIconPickerOpen}
                    onSelectIcon={setEditingCategoryIcon}
                  />
                </Field>
                <View style={styles.inlineEditActions}>
                  <AppButton label={t('cancel')} compact variant="secondary" onPress={clearCategoryEdit} />
                  <AppButton label={t('save')} compact Icon={Save} onPress={saveCategoryEdit} />
                </View>
              </View>
            ) : null}
          </View>
        )) : (
          <Text style={styles.rowMeta}>{t('noActiveCategories')}</Text>
        )}
        </View>
      ) : null}

      {activeSettingsSection === 'cashboxes' ? (
        <View style={styles.formPanel}>
          <Text style={styles.listSectionTitle}>{t('cashBoxCategoryAssignments')}</Text>
          {activeCashBoxes.map((cashBox) => {
            const assignedCategories = expenseCategories.filter((category) => category.cashBoxId === cashBox.id);
            const expanded = expandedCashBoxId === cashBox.id;
            const CashBoxIcon = getCashBoxIcon(cashBox);

            return (
              <View key={cashBox.id} style={styles.paymentMethodGroup}>
                <View style={[styles.managementRow, isCompact ? styles.managementRowCompact : null, expanded ? styles.managementRowSelected : null]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => setExpandedCashBoxId((current) => (current === cashBox.id ? undefined : cashBox.id))}
                    style={styles.managementSelectArea}
                  >
                    <View style={styles.managementIconBadge}>
                      <CashBoxIcon color={colors.primary} size={18} strokeWidth={2.2} />
                    </View>
                    <View style={styles.managementText}>
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {displayCashBoxName(cashBox, data.settings.language) ?? cashBox.name}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {assignedCategories.length} {t('categoriesAssigned')}
                      </Text>
                    </View>
                    {expanded ? (
                      <ChevronDown color={colors.textMuted} size={18} strokeWidth={2.2} />
                    ) : (
                      <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
                    )}
                  </Pressable>
                </View>
                {expanded ? (
                  <View style={styles.paymentSubmethodList}>
                    {assignedCategories.length ? (
                      assignedCategories.map((category) => (
                        <View key={category.id} style={styles.paymentSubmethodItem}>
                          <View style={styles.paymentSubmethodRow}>
                            <CategoryIconBadge category={category} />
                            <Text style={[styles.rowTitle, styles.paymentSubmethodName]} numberOfLines={2}>
                              {displayCategoryName(category, data.settings.language)}
                            </Text>
                          </View>
                          <View style={styles.chipRow}>
                            {activeCashBoxes.map((option) => (
                              <Chip
                                key={option.id}
                                label={displayCashBoxName(option, data.settings.language) ?? option.name}
                                selected={category.cashBoxId === option.id}
                                onPress={() => onAssignCategoryCashBox(category.id, option.id)}
                              />
                            ))}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.rowMeta}>{t('noCashBoxCategories')}</Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {activeSettingsSection === 'subcategories' ? (
        <View style={styles.formPanel}>
        <View style={styles.chipRow}>
          <Chip label={t('expense')} selected={subcategoryType === 'expense'} onPress={() => handleSubcategoryTypeChange('expense')} />
          <Chip label={t('income')} selected={subcategoryType === 'income'} onPress={() => handleSubcategoryTypeChange('income')} />
        </View>
        <Field label={t('parentCategory')}>
          {selectedSubcategoryParent && !subcategoryParentPickerOpen ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSubcategoryParentPickerOpen(true)}
              style={styles.selectedOptionRow}
            >
              <View style={styles.selectedOptionInfo}>
                <CategoryIconBadge category={selectedSubcategoryParent} />
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {displayCategoryName(selectedSubcategoryParent, data.settings.language)}
                </Text>
              </View>
              <Text style={styles.changeLink}>{t('edit')}</Text>
            </Pressable>
          ) : (
            <View style={styles.chipRow}>
              {subcategoryParentCategories.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  language={data.settings.language}
                  selected={subcategoryCategoryId === category.id}
                  onPress={() => {
                    setSubcategoryCategoryId(category.id);
                    setSubcategoryParentPickerOpen(false);
                  }}
                />
              ))}
            </View>
          )}
          {subcategoryParentCategories.length ? null : (
            <Text style={styles.rowMeta}>{t('noActiveCategories')}</Text>
          )}
        </Field>
        <Field label={t('newSubcategory')}>
          <TextInput
            value={subcategoryNameInput}
            onChangeText={setSubcategoryNameInput}
            placeholder={t('subcategoryName')}
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <Field label={t('icon')}>
          <IconPickerField
            selectedIconKey={subcategoryIconInput}
            pickerOpen={subcategoryIconPickerOpen}
            t={t}
            onPickerOpenChange={setSubcategoryIconPickerOpen}
            onSelectIcon={setSubcategoryIconInput}
          />
        </Field>
        <AppButton
          label={t('addSubcategory')}
          Icon={Plus}
          onPress={() => {
            onAddSubcategory(subcategoryCategoryId, subcategoryNameInput, subcategoryIconInput);
            setSubcategoryNameInput('');
            setSubcategoryIconInput(undefined);
            setSubcategoryIconPickerOpen(true);
          }}
        />

        <Text style={styles.listSectionTitle}>{t('subcategoryListTitle')}</Text>

        {subcategoryGroups.map(({ category, subcategories }) => {
          const expanded = expandedSubcategoryCategoryIds.includes(category.id);

          return (
            <View key={category.id} style={styles.subcategoryAccordionGroup}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                hitSlop={8}
                onPress={() =>
                  setExpandedSubcategoryCategoryIds((current) =>
                    current.includes(category.id)
                      ? current.filter((categoryId) => categoryId !== category.id)
                      : [...current, category.id],
                  )
                }
                style={styles.subcategoryAccordionHeader}
              >
                <CategoryIconBadge category={category} />
                <View style={styles.managementText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {displayCategoryName(category, data.settings.language)}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {subcategories.length} {t('activeSubcategories')}
                  </Text>
                </View>
                {expanded ? (
                  <ChevronDown color={colors.textMuted} size={18} strokeWidth={2.2} />
                ) : (
                  <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
                )}
              </Pressable>
              {expanded ? (
                <View style={styles.subcategoryAccordionList}>
                  {subcategories.length ? (
                    subcategories.map((subcategory) => {
                      const SubcatIcon = getSubcategoryIcon(subcategory, category);

                      return (
                        <View key={subcategory.id} style={styles.managementEditGroup}>
                          <ManagementRow
                            Icon={SubcatIcon}
                            t={t}
                            title={displaySubcategoryName(subcategory, data.settings.language) ?? subcategory.name}
                            subtitle={displayCategoryName(category, data.settings.language) ?? t('noParentCategory')}
                            onEdit={() => startSubcategoryEdit(subcategory)}
                            onDisable={() => onDisableSubcategory(subcategory.id)}
                          />
                          {editingSubcategoryId === subcategory.id ? (
                            <View style={styles.inlineEditPanel}>
                              <Field label={t('parentCategory')}>
                                {selectedEditingSubcategoryParent && !editingSubcategoryParentPickerOpen ? (
                                  <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setEditingSubcategoryParentPickerOpen(true)}
                                    style={styles.selectedOptionRow}
                                  >
                                    <View style={styles.selectedOptionInfo}>
                                      <CategoryIconBadge category={selectedEditingSubcategoryParent} />
                                      <Text style={styles.rowTitle} numberOfLines={1}>
                                        {displayCategoryName(selectedEditingSubcategoryParent, data.settings.language)}
                                      </Text>
                                    </View>
                                    <Text style={styles.changeLink}>{t('edit')}</Text>
                                  </Pressable>
                                ) : (
                                  <View style={styles.chipRow}>
                                    {subcategoryParentCategories.map((item) => (
                                      <CategoryChip
                                        key={item.id}
                                        category={item}
                                        language={data.settings.language}
                                        selected={editingSubcategoryCategoryId === item.id}
                                        onPress={() => {
                                          setEditingSubcategoryCategoryId(item.id);
                                          setEditingSubcategoryParentPickerOpen(false);
                                        }}
                                      />
                                    ))}
                                  </View>
                                )}
                              </Field>
                              <Field label={t('subcategoryName')}>
                                <TextInput
                                  value={editingSubcategoryName}
                                  onChangeText={setEditingSubcategoryName}
                                  placeholder={t('subcategoryName')}
                                  placeholderTextColor={colors.gray}
                                  style={styles.input}
                                />
                              </Field>
                              <Field label={t('icon')}>
                                <IconPickerField
                                  selectedIconKey={editingSubcategoryIcon}
                                  pickerOpen={editingSubcategoryIconPickerOpen}
                                  t={t}
                                  onPickerOpenChange={setEditingSubcategoryIconPickerOpen}
                                  onSelectIcon={setEditingSubcategoryIcon}
                                />
                              </Field>
                              <View style={styles.inlineEditActions}>
                                <AppButton label={t('cancel')} compact variant="secondary" onPress={clearSubcategoryEdit} />
                                <AppButton label={t('save')} compact Icon={Save} onPress={saveSubcategoryEdit} />
                              </View>
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.rowMeta}>{t('noActiveSubcategories')}</Text>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
        </View>
      ) : null}

      {activeSettingsSection === 'payments' ? (
        <View style={styles.formPanel}>
        <View style={styles.segmentedControl}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: paymentCreationMode === 'method' }}
            onPress={() => setPaymentCreationMode('method')}
            style={[styles.segmentedOption, paymentCreationMode === 'method' ? styles.segmentedOptionSelected : null]}
          >
            <Text
              style={[
                styles.segmentedOptionText,
                paymentCreationMode === 'method' ? styles.segmentedOptionTextSelected : null,
              ]}
            >
              {t('newMethod')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: paymentCreationMode === 'submethod' }}
            onPress={() => setPaymentCreationMode('submethod')}
            style={[styles.segmentedOption, paymentCreationMode === 'submethod' ? styles.segmentedOptionSelected : null]}
          >
            <Text
              style={[
                styles.segmentedOptionText,
                paymentCreationMode === 'submethod' ? styles.segmentedOptionTextSelected : null,
              ]}
            >
              {t('newSubmethod')}
            </Text>
          </Pressable>
        </View>

        {paymentCreationMode === 'method' ? (
          <View style={styles.compactCreationPanel}>
            <Field label={t('newMethod')}>
              <TextInput
                value={paymentMethodInput}
                onChangeText={setPaymentMethodInput}
                placeholder={t('paymentMethods')}
                placeholderTextColor={colors.gray}
                style={styles.input}
              />
            </Field>
            <AppButton
              label={t('addMethod')}
              Icon={WalletCards}
              onPress={() => {
                onAddPaymentMethod(paymentMethodInput);
                setPaymentMethodInput('');
              }}
            />
          </View>
        ) : (
          <View style={styles.compactCreationPanel}>
            <Field label={t('parentPaymentMethod')}>
              <View style={styles.chipRow}>
                {activePaymentMethods.map((method) => (
                  <Chip
                    key={method.id}
                    label={displayPaymentMethodName(method, data.settings.language) ?? method.name}
                    selected={selectedPaymentMethodId === method.id}
                    onPress={() => setPaymentSubmethodMethodId(method.id)}
                  />
                ))}
              </View>
            </Field>
            <Field label={t('newSubmethod')}>
              <TextInput
                value={paymentSubmethodInput}
                onChangeText={setPaymentSubmethodInput}
                placeholder={t('newSubmethod')}
                placeholderTextColor={colors.gray}
                style={styles.input}
              />
            </Field>
            <AppButton
              label={t('addSubmethod')}
              Icon={Plus}
              onPress={() => {
                onAddPaymentSubmethod(selectedPaymentMethodId, paymentSubmethodInput);
                setPaymentSubmethodInput('');
              }}
            />
          </View>
        )}

        <Text style={styles.listSectionTitle}>{t('paymentMethodListTitle')}</Text>

        {activePaymentMethods.map((method) => {
          const submethods = data.paymentSubmethods.filter(
            (item) => item.paymentMethodId === method.id && item.active,
          );
          const selected = expandedPaymentMethodId === method.id;
          const editingMethod = editingPaymentMethodId === method.id;

          return (
            <View key={method.id} style={styles.paymentMethodGroup}>
              <PaymentMethodManagementRow
                methodName={displayPaymentMethodName(method, data.settings.language) ?? method.name}
                t={t}
                submethodCount={submethods.length}
                selected={selected}
                onSelect={() => toggleExpandedPaymentMethod(method.id)}
                onEdit={() => startPaymentMethodEdit(method.id, method.name)}
                onDisable={() => onDisablePaymentMethod(method.id)}
              />
              {editingMethod ? (
                <View style={styles.inlineEditPanel}>
                  <Field label={t('paymentMethodName')}>
                    <TextInput
                      value={editingPaymentMethodName}
                      onChangeText={setEditingPaymentMethodName}
                      placeholder={t('paymentMethods')}
                      placeholderTextColor={colors.gray}
                      style={styles.input}
                    />
                  </Field>
                  <View style={styles.inlineEditActions}>
                    <AppButton label={t('cancel')} compact variant="secondary" onPress={clearPaymentMethodEdit} />
                    <AppButton label={t('save')} compact Icon={Save} onPress={savePaymentMethodEdit} />
                  </View>
                </View>
              ) : null}
              {selected && !editingMethod ? (
                <View style={styles.paymentSubmethodList}>
                  {submethods.length ? (
                    submethods.map((submethod) => {
                      return (
                      <View key={submethod.id} style={styles.paymentSubmethodItem}>
                        <View style={styles.paymentSubmethodRow}>
                          <View style={styles.managementIconBadge}>
                            <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
                          </View>
                          <Text style={[styles.rowTitle, styles.paymentSubmethodName]} numberOfLines={2}>
                            {displayPaymentSubmethodName(submethod, data.settings.language) ?? submethod.name}
                          </Text>
                          <AppButton
                            label={t('edit')}
                            compact
                            variant="secondary"
                            onPress={() => startPaymentSubmethodEdit(submethod.id, method.id, submethod.name)}
                          />
                          <AppButton
                            label={t('delete')}
                            compact
                            variant="secondary"
                            onPress={() => onDisablePaymentSubmethod(submethod.id)}
                          />
                        </View>
                        {editingPaymentSubmethodId === submethod.id ? (
                          <View style={styles.inlineEditPanel}>
                            <Field label={t('parentPaymentMethod')}>
                              <View style={styles.chipRow}>
                                {activePaymentMethods.map((paymentMethod) => (
                                  <Chip
                                    key={paymentMethod.id}
                                    label={displayPaymentMethodName(paymentMethod, data.settings.language) ?? paymentMethod.name}
                                    selected={editingPaymentSubmethodMethodId === paymentMethod.id}
                                    onPress={() => setEditingPaymentSubmethodMethodId(paymentMethod.id)}
                                  />
                                ))}
                              </View>
                            </Field>
                            <Field label={t('newSubmethod')}>
                              <TextInput
                                value={editingPaymentSubmethodName}
                                onChangeText={setEditingPaymentSubmethodName}
                                placeholder={t('newSubmethod')}
                                placeholderTextColor={colors.gray}
                                style={styles.input}
                              />
                            </Field>
                            <View style={styles.inlineEditActions}>
                              <AppButton label={t('cancel')} compact variant="secondary" onPress={clearPaymentSubmethodEdit} />
                              <AppButton label={t('save')} compact Icon={Save} onPress={savePaymentSubmethodEdit} />
                            </View>
                          </View>
                        ) : null}
                      </View>
                    );
                    })
                  ) : (
                    <Text style={styles.rowMeta}>{t('noActiveSubmethods')}</Text>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
        </View>
      ) : null}

      {activeSettingsSection === 'people' ? (
        <View style={styles.formPanel}>
          <Field label={t('newPerson')}>
            <TextInput
              value={personNameInput}
              onChangeText={setPersonNameInput}
              placeholder={t('personName')}
              placeholderTextColor={colors.gray}
              style={styles.input}
            />
          </Field>
          <AppButton
            label={t('addPerson')}
            Icon={UserRound}
            onPress={() => {
              onAddPerson(personNameInput);
              setPersonNameInput('');
            }}
          />

          <Text style={styles.listSectionTitle}>{t('people')}</Text>

          {activePeople.length ? (
            activePeople.map((person) => (
              <View key={person.id} style={styles.managementEditGroup}>
                <ManagementRow
                  Icon={UserRound}
                  t={t}
                  title={person.name}
                  subtitle={t('assignedPerson')}
                  onEdit={() => startPersonEdit(person)}
                  onDisable={() => onDisablePerson(person.id)}
                />
                {editingPersonId === person.id ? (
                  <View style={styles.inlineEditPanel}>
                    <Field label={t('personName')}>
                      <TextInput
                        value={editingPersonName}
                        onChangeText={setEditingPersonName}
                        placeholder={t('personName')}
                        placeholderTextColor={colors.gray}
                        style={styles.input}
                      />
                    </Field>
                    <View style={styles.inlineEditActions}>
                      <AppButton label={t('cancel')} compact variant="secondary" onPress={clearPersonEdit} />
                      <AppButton label={t('save')} compact Icon={Save} onPress={savePersonEdit} />
                    </View>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.rowMeta}>{t('noActivePeople')}</Text>
          )}
        </View>
      ) : null}
    </ScreenScroll>
  );
}

function AboutPanel({
  t,
  devFixturesEnabled,
  onLoadDevMonthlyReportFixture,
}: {
  t: Translator;
  devFixturesEnabled: boolean;
  onLoadDevMonthlyReportFixture?: () => void;
}) {
  return (
    <View style={styles.aboutPanel}>
      <View style={styles.aboutHero}>
        <Image source={inflatrackLogo} style={styles.aboutLogo} />
        <View style={styles.aboutHeroText}>
          <Text style={styles.aboutBrand}>Inflatrack</Text>
          <Text style={styles.rowMeta}>{t('aboutAppByInflatrack')}</Text>
        </View>
      </View>

      <Text style={styles.aboutBody}>{t('aboutIntro')}</Text>

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(INFLATRACK_URL)}
        style={styles.aboutLinkRow}
      >
        <Globe2 color={colors.primary} size={18} strokeWidth={2.2} />
        <View style={styles.aboutLinkTextGroup}>
          <Text style={styles.aboutLabel}>{t('website')}</Text>
          <Text style={styles.aboutLink}>{INFLATRACK_DISPLAY_URL}</Text>
        </View>
        <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
      </Pressable>

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(INFLATRACK_PRIVACY_URL)}
        style={styles.aboutLinkRow}
      >
        <ShieldCheck color={colors.primary} size={18} strokeWidth={2.2} />
        <View style={styles.aboutLinkTextGroup}>
          <Text style={styles.aboutLabel}>{t('privacyPolicyLink')}</Text>
          <Text style={styles.aboutLink}>{INFLATRACK_PRIVACY_DISPLAY_URL}</Text>
        </View>
        <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.aboutInfoRow}>
        <Text style={styles.aboutLabel}>{t('version')}</Text>
        <Text style={styles.aboutValue}>{APP_VERSION}</Text>
      </View>

      {devFixturesEnabled && onLoadDevMonthlyReportFixture ? (
        <AppButton
          label={t('loadDevMonthlyReportFixture')}
          Icon={RefreshCcw}
          variant="secondary"
          onPress={onLoadDevMonthlyReportFixture}
        />
      ) : null}

      <AboutLegalSection title={t('termsTitle')} body={t('termsBody')} />
      <AboutLegalSection title={t('privacyTitle')} body={t('privacyBody')} />
    </View>
  );
}

function AboutLegalSection({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.aboutLegalSection}>
      <Text style={styles.aboutLegalTitle}>{title}</Text>
      <Text style={styles.aboutBody}>{body}</Text>
    </View>
  );
}

function DashboardSummaryCard({ summary, t }: { summary: CurrencySummary; t: Translator }) {
  const { isCompact } = useResponsive();
  const metrics = [
    { label: t('income'), value: formatMoney(summary.income, summary.currency) },
    { label: t('expenses'), value: formatMoney(summary.expenses, summary.currency) },
    { label: t('balance'), value: formatMoney(summary.balance, summary.currency) },
  ];

  return (
    <View style={[styles.dashboardSummaryCard, isCompact ? styles.dashboardSummaryCardCompact : null]}>
      {metrics.map((metric, index) => (
        <View key={metric.label} style={styles.dashboardMetricGroup}>
          {index > 0 && !isCompact ? <View style={styles.dashboardMetricDivider} /> : null}
          <View style={[styles.dashboardMetric, isCompact ? styles.dashboardMetricCompact : null]}>
            <Text style={styles.dashboardMetricLabel}>{metric.label}</Text>
            <Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit>
              {metric.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ExpenseDayCard({
  data,
  t,
  group,
  showAllMovements,
  onSelectTransaction,
}: {
  data: AppData;
  t: Translator;
  group: TransactionDayGroup;
  showAllMovements?: boolean;
  onSelectTransaction: (transaction: Transaction) => void;
}) {
  return (
    <View style={styles.expenseDayCard}>
      <View style={styles.expenseDayHeader}>
        <Text style={styles.expenseDayDate}>{formatDashboardDate(group.date, data.settings.language)}</Text>
        <Text style={styles.expenseDayTotal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
          {showAllMovements
            ? `${t('transactions')}: ${formatMovementTotals(group.totalsByCurrency)}`
            : `${t('expenses')}: ${formatExpenseTotals(group.totalsByCurrency)}`}
        </Text>
      </View>
      {group.transactions.map((transaction, index) => (
        <DashboardExpenseRow
          key={transaction.id}
          data={data}
          transaction={transaction}
          withDivider={index > 0}
          onPress={() => onSelectTransaction(transaction)}
        />
      ))}
    </View>
  );
}

function DashboardExpenseRow({
  data,
  transaction,
  withDivider,
  onPress,
}: {
  data: AppData;
  transaction: Transaction;
  withDivider: boolean;
  onPress: () => void;
}) {
  const { isCompact } = useResponsive();
  const category = data.categories.find((item) => item.id === transaction.categoryId);
  const subcategory = data.subcategories.find((item) => item.id === transaction.subcategoryId);
  const title = transactionDisplayName(data, transaction) || transactionCategoryDisplayName(data, transaction) || '';
  const amountPrefix = transaction.type === 'expense' ? '-' : '+';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.dashboardExpenseRow,
        isCompact ? styles.dashboardExpenseRowCompact : null,
        withDivider ? styles.dashboardExpenseRowDivider : null,
      ]}
    >
      <View style={styles.dashboardExpenseMain}>
        <CategoryIconBadge category={category} subcategory={subcategory} accent />
        <Text style={styles.dashboardExpenseTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.dashboardExpenseAmount,
          isCompact ? styles.dashboardExpenseAmountCompact : null,
          transaction.type === 'expense' ? styles.negativeText : styles.positiveText,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {amountPrefix} {formatMoney(transaction.amount, transaction.currency)}
      </Text>
    </Pressable>
  );
}

function CategoryIconBadge({
  category,
  subcategory,
  accent,
}: {
  category?: Category;
  subcategory?: Subcategory;
  accent?: boolean;
}) {
  const Icon = getSubcategoryIcon(subcategory, category);
  const backgroundColor = accent ? getCategoryAccentColor(category) : colors.surfaceAlt;
  const iconColor = accent ? colors.onPrimary : colors.deepBlue;

  return (
    <View style={[styles.categoryIconBadge, { backgroundColor }]}>
      <Icon color={iconColor} size={24} strokeWidth={2.2} />
    </View>
  );
}

function CategorySummaryRow({ data, summary }: { data: AppData; summary: CategorySummary }) {
  const { isCompact } = useResponsive();
  const category = data.categories.find((item) => item.id === summary.categoryId);
  const categoryLabel = displayCategoryName(category, data.settings.language) ?? summary.categoryName;

  return (
    <View style={[styles.listRow, isCompact ? styles.listRowCompact : null]}>
      <View style={styles.categoryRowLabel}>
        <CategoryIconBadge category={category} />
        <Text style={styles.categoryRowTitle} numberOfLines={1}>
          {categoryLabel}
        </Text>
      </View>
      <Text style={styles.rowAmount} numberOfLines={1} adjustsFontSizeToFit>
        {formatMoney(summary.amount, summary.currency)}
      </Text>
    </View>
  );
}

function BudgetStatusRow({
  summary,
  category,
  subcategory,
  t,
  language,
  onEdit,
  onDelete,
}: {
  summary: BudgetSummary;
  category?: Category;
  subcategory?: Subcategory;
  t: Translator;
  language: AppLanguage;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColor = summary.requiresSubcategory
    ? colors.warning
    : summary.status === 'exceeded'
      ? colors.danger
      : summary.status === 'near-limit'
        ? colors.warning
        : colors.success;
  const percentage = Math.round(summary.usage * 100);

  return (
    <View style={styles.budgetRow}>
      <View style={styles.budgetHeader}>
        <View style={styles.categoryRowLabel}>
          <CategoryIconBadge category={category} subcategory={subcategory} />
          <View style={styles.managementText}>
            <Text style={styles.categoryRowTitle} numberOfLines={1}>
              {displaySubcategoryName(subcategory, language) ||
                summary.subcategoryName ||
                displayCategoryName(category, language) ||
                summary.categoryName}
            </Text>
            {subcategory || summary.subcategoryName ? (
              <Text style={styles.rowMeta} numberOfLines={1}>
                {displayCategoryName(category, language) ?? summary.categoryName}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={[styles.budgetStatus, { color: statusColor }]}>
          {summary.requiresSubcategory
            ? t('budgetNeedsSubcategoryStatus')
            : summary.status === 'exceeded'
              ? t('budgetStatusExceeded')
              : summary.status === 'near-limit'
                ? t('budgetStatusNearLimit')
                : t('budgetStatusAvailable')}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: statusColor, width: `${Math.min(100, percentage)}%` }]} />
      </View>
      {summary.requiresSubcategory ? (
        <Text style={styles.rowMeta}>{t('budgetNeedsSubcategoryMessage')}</Text>
      ) : (
        <Text style={styles.rowMeta}>
          {formatMoney(summary.spent, summary.budget.currency)} {t('budgetProgressOf')}{' '}
          {formatMoney(summary.budget.amount, summary.budget.currency)} · {percentage}%
        </Text>
      )}
      <View style={styles.budgetActions}>
        <AppButton label={t('editBudget')} Icon={Pencil} compact variant="secondary" onPress={onEdit} />
        <AppButton label={t('deleteBudget')} Icon={Trash2} compact variant="secondary" onPress={onDelete} />
      </View>
    </View>
  );
}

function CategoryManagementRow({
  category,
  cashBox,
  t,
  language,
  onEdit,
  onDisable,
}: {
  category: Category;
  cashBox?: CashBox;
  t: Translator;
  language: AppLanguage;
  onEdit: () => void;
  onDisable: () => void;
}) {
  const { isCompact } = useResponsive();
  const cashBoxLabel = category.type === 'expense' ? displayCashBoxName(cashBox, language) : undefined;

  return (
    <View style={[styles.managementRow, isCompact ? styles.managementRowCompact : null]}>
      <View style={styles.managementInfo}>
        <CategoryIconBadge category={category} />
        <View style={styles.managementText}>
          <Text style={styles.categoryRowTitle} numberOfLines={2}>
            {displayCategoryName(category, language)}
          </Text>
          <Text style={styles.rowMeta}>
            {category.type === 'expense'
              ? `${t('expense')} - ${cashBoxLabel ?? t('noCashBox')}`
              : t('income')}
          </Text>
        </View>
      </View>
      <View style={[styles.managementActions, isCompact ? styles.managementActionsCompact : null]}>
        <AppButton label={t('edit')} compact variant="secondary" onPress={onEdit} />
        <AppButton label={t('disable')} compact variant="secondary" onPress={onDisable} />
      </View>
    </View>
  );
}

function ManagementRow({
  title,
  subtitle,
  Icon,
  t = getTranslator('en'),
  onEdit,
  onDisable,
}: {
  title: string;
  subtitle: string;
  Icon?: IconComponent;
  t?: Translator;
  onEdit?: () => void;
  onDisable?: () => void;
}) {
  const { isCompact } = useResponsive();

  return (
    <View style={[styles.managementRow, isCompact ? styles.managementRowCompact : null]}>
      <View style={styles.managementInfo}>
        {Icon ? (
          <View style={styles.managementIconBadge}>
            <Icon color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
        ) : null}
        <View style={styles.managementText}>
          <Text style={styles.rowTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.rowMeta} numberOfLines={1}>{subtitle}</Text>
        </View>
      </View>
      {onEdit || onDisable ? (
        <View style={[styles.managementActions, isCompact ? styles.managementActionsCompact : null]}>
          {onEdit ? <AppButton label={t('edit')} compact variant="secondary" onPress={onEdit} /> : null}
          {onDisable ? <AppButton label={t('delete')} compact variant="secondary" onPress={onDisable} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function PaymentMethodManagementRow({
  methodName,
  t,
  submethodCount,
  selected,
  onSelect,
  onEdit,
  onDisable,
}: {
  methodName: string;
  t: Translator;
  submethodCount: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDisable: () => void;
}) {
  const { isCompact } = useResponsive();

  return (
    <View style={[styles.managementRow, isCompact ? styles.managementRowCompact : null, selected ? styles.managementRowSelected : null]}>
      <Pressable accessibilityRole="button" onPress={onSelect} style={styles.managementSelectArea}>
        <View style={styles.managementIconBadge}>
          <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.managementText}>
          <Text style={styles.rowTitle} numberOfLines={2}>{methodName}</Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {submethodCount} {submethodCount === 1 ? 'submethod' : 'submethods'}
          </Text>
        </View>
        {selected ? (
          <ChevronDown color={colors.textMuted} size={18} strokeWidth={2.2} />
        ) : (
          <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
        )}
      </Pressable>
      <View style={[styles.managementActions, isCompact ? styles.managementActionsCompact : null]}>
        <AppButton label={t('edit')} compact variant="secondary" onPress={onEdit} />
        <AppButton label={t('delete')} compact variant="secondary" onPress={onDisable} />
      </View>
    </View>
  );
}

function SettingsMenuButton({
  title,
  subtitle,
  Icon,
  badgeLabel,
  onPress,
}: {
  title: string;
  subtitle: string;
  Icon: IconComponent;
  badgeLabel?: string;
  onPress: () => void;
}) {
  const { isCompact } = useResponsive();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.settingsMenuButton, isCompact ? styles.settingsMenuButtonCompact : null]}
    >
      <View style={[styles.settingsMenuIcon, isCompact ? styles.settingsMenuIconCompact : null]}>
        <Icon color={colors.primary} size={isCompact ? 20 : 24} strokeWidth={2.2} />
      </View>
      <View style={styles.settingsMenuText}>
        <View style={styles.settingsMenuTitleRow}>
          <Text style={styles.settingsMenuTitle} numberOfLines={1}>
            {title}
          </Text>
          {badgeLabel ? <Text style={styles.premiumBadge}>{badgeLabel}</Text> : null}
        </View>
        <Text style={styles.settingsMenuSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight color={colors.textMuted} size={20} strokeWidth={2.2} />
    </Pressable>
  );
}

function Field({
  label,
  children,
  grid,
}: {
  label: string;
  children: React.ReactNode;
  grid?: boolean;
}) {
  return (
    <View style={[styles.field, grid ? styles.formGridField : null]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function CategoryChip({
  category,
  language,
  selected,
  onPress,
}: {
  category: Category;
  language: AppLanguage;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = getCategoryIcon(category);
  const contentColor = selected ? colors.primary : colors.deepBlue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.categoryChip, selected ? styles.categoryChipSelected : null]}
    >
      <Icon color={contentColor} size={26} strokeWidth={2.2} />
      <Text style={[styles.categoryChipText, selected ? styles.categoryChipTextSelected : null]} numberOfLines={1}>
        {displayCategoryName(category, language)}
      </Text>
    </Pressable>
  );
}

function IconPickerField({
  selectedIconKey,
  pickerOpen,
  t,
  onPickerOpenChange,
  onSelectIcon,
}: {
  selectedIconKey?: string;
  pickerOpen: boolean;
  t: Translator;
  onPickerOpenChange: (open: boolean) => void;
  onSelectIcon: (icon?: string) => void;
}) {
  const selectedIcon = SUBCATEGORY_ICON_OPTIONS.find((item) => item.key === selectedIconKey);

  if (selectedIcon && !pickerOpen) {
    const SelectedIcon = selectedIcon.Icon;

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => onPickerOpenChange(true)}
        style={styles.selectedOptionRow}
      >
        <View style={styles.selectedOptionInfo}>
          <View style={styles.managementIconBadge}>
            <SelectedIcon color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
          <Text style={styles.rowTitle}>{t('icon')}</Text>
        </View>
        <Text style={styles.changeLink}>{t('edit')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.iconPickerGrid}>
      {SUBCATEGORY_ICON_OPTIONS.map(({ key, Icon }) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedIconKey === key }}
          onPress={() => {
            const nextIcon = selectedIconKey === key ? undefined : key;
            onSelectIcon(nextIcon);
            onPickerOpenChange(!nextIcon);
          }}
          style={[styles.iconPickerItem, selectedIconKey === key && styles.iconPickerItemSelected]}
        >
          <Icon color={selectedIconKey === key ? colors.primary : colors.textMuted} size={20} strokeWidth={2.2} />
        </Pressable>
      ))}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function CalendarModal({
  visible,
  t,
  language,
  selectedDate,
  viewMonth,
  onClose,
  onMonthChange,
  onSelectDate,
}: {
  visible: boolean;
  t: Translator;
  language: AppLanguage;
  selectedDate: Date;
  viewMonth: Date;
  onClose: () => void;
  onMonthChange: (dateInput: Date) => void;
  onSelectDate: (dateInput: Date) => void;
}) {
  const { isCompact } = useResponsive();
  const weeks = calendarWeeksForMonth(viewMonth, language === 'es-AR' ? 1 : 0);
  const selectedDateInput = dateInputFromDate(selectedDate);
  const today = dateInputFromDate(todayInput());
  const weekdays = language === 'es-AR'
    ? ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="none"
        onPress={onClose}
        style={[styles.calendarOverlay, isCompact ? styles.calendarOverlayCompact : null]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => undefined}
          style={[styles.calendarPanel, isCompact ? styles.calendarPanelCompact : null]}
        >
          <View style={styles.calendarHeader}>
            <IconButton
              accessibilityLabel={t('previousMonth')}
              Icon={ChevronLeft}
              onPress={() => onMonthChange(shiftMonth(viewMonth, -1))}
            />
            <Text style={styles.calendarTitle}>{monthLabel(viewMonth, localeForLanguage(language))}</Text>
            <IconButton
              accessibilityLabel={t('nextMonth')}
              Icon={ChevronRight}
              onPress={() => onMonthChange(shiftMonth(viewMonth, 1))}
            />
          </View>
          <View style={styles.calendarWeekdays}>
            {weekdays.map((weekday) => (
              <Text key={weekday} style={styles.calendarWeekday}>
                {weekday}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.calendarWeekRow}>
                {week.map((day) => {
                  const selected = day.dateInput === selectedDateInput;
                  const isToday = day.dateInput === today;

                  return (
                    <Pressable
                      key={day.dateInput}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onSelectDate(day.date)}
                      style={[
                        styles.calendarDay,
                        isCompact ? styles.calendarDayCompact : null,
                        !day.currentMonth ? styles.calendarDayOutside : null,
                        isToday ? styles.calendarDayToday : null,
                        selected ? styles.calendarDaySelected : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          !day.currentMonth ? styles.calendarDayTextOutside : null,
                          selected ? styles.calendarDayTextSelected : null,
                        ]}
                      >
                        {day.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AmountKey({ label, onPress }: { label: string; onPress: () => void }) {
  const { isCompact } = useResponsive();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.expenseKey, isCompact ? styles.expenseKeyCompact : null]}>
      <Text style={[styles.expenseKeyText, isCompact ? styles.expenseKeyTextCompact : null]}>{label}</Text>
    </Pressable>
  );
}

function AppButton({
  label,
  Icon,
  onPress,
  variant = 'primary',
  compact,
  disabled,
}: {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  compact?: boolean;
  disabled?: boolean;
}) {
  const { isCompact } = useResponsive();
  const primary = variant === 'primary';
  const iconColor = disabled ? colors.textMuted : primary ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        isCompact ? styles.buttonResponsiveCompact : null,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        compact ? styles.buttonCompact : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {Icon ? <Icon color={iconColor} size={compact || isCompact ? 16 : 18} strokeWidth={2.4} /> : null}
      <Text
        style={[
          styles.buttonText,
          isCompact ? styles.buttonTextCompact : null,
          primary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
          disabled ? styles.buttonTextDisabled : null,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IconButton({
  accessibilityLabel,
  Icon,
  onPress,
  danger,
}: {
  accessibilityLabel: string;
  Icon: IconComponent;
  onPress: () => void;
  danger?: boolean;
}) {
  const { isCompact } = useResponsive();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.iconButton, isCompact ? styles.iconButtonCompact : null]}
    >
      <Icon color={danger ? colors.danger : colors.deepBlue} size={isCompact ? 18 : 20} strokeWidth={2.2} />
    </Pressable>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{title}</Text>
    </View>
  );
}

function PremiumLockedScreen({ t, onOpenPremium }: { t: Translator; onOpenPremium: () => void }) {
  return (
    <ScreenScroll>
      <View style={styles.premiumLockedPanel}>
        <View style={styles.managementIconBadge}>
          <BadgeDollarSign color={colors.primary} size={24} strokeWidth={2.2} />
        </View>
        <Text style={styles.sectionTitle}>{t('premiumLockedSubtitle')}</Text>
        <Text style={styles.rowMeta}>{t('premiumLockedMessage')}</Text>
        <AppButton label={t('premium')} Icon={BadgeDollarSign} onPress={onOpenPremium} />
      </View>
    </ScreenScroll>
  );
}

function ScreenScroll({
  children,
  contentContainerStyle,
  scrollRef,
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const { isCompact } = useResponsive();
  const theme = useAppTheme();

  return (
    <ScrollView
      ref={scrollRef}
      style={theme.styles.screen}
      contentContainerStyle={[
        theme.styles.screenContent,
        isCompact ? theme.styles.screenContentCompact : null,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const createAppStyles = (colors: AppThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
    minHeight: 0,
  },
  appShell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  lockBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  lockTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  lockMessage: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCompact: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerBrand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  headerLogo: {
    borderRadius: radius.sm,
    height: 28,
    width: 28,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  headerTitleCompact: {
    fontSize: 19,
    lineHeight: 23,
  },
  monthControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  monthControlsCompact: {
    flexShrink: 0,
    gap: spacing.xs,
  },
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bottomNavCompact: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.xs,
    minHeight: 56,
    justifyContent: 'center',
  },
  navItemCompact: {
    gap: 2,
    minHeight: 50,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  navLabelCompact: {
    fontSize: 10,
    maxWidth: 74,
  },
  navLabelActive: {
    color: colors.primary,
  },
  screen: {
    flex: 1,
    minHeight: 0,
  },
  screenContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  screenContentCompact: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  incomeFormScrollContent: {
    paddingBottom: spacing.xl * 3,
  },
  expenseEntryPanel: {
    backgroundColor: colors.surface,
    flex: 1,
    overflow: 'hidden',
  },
  expenseEntryHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  expenseEntryHeaderCompact: {
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
  },
  expenseEntryTitleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  expenseEntryTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  expenseEntryTitleCompact: {
    fontSize: 19,
  },
  expenseCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  expenseCategoryScroller: {
    flex: 1,
  },
  expenseCategoryItem: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
    width: '25%',
  },
  expenseCategoryItemCompact: {
    marginBottom: spacing.lg,
  },
  expenseCategoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.categoryIconBackground,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  expenseCategoryIconCompact: {
    borderRadius: 26,
    height: 52,
    width: 52,
  },
  expenseCategoryIconSelected: {
    backgroundColor: colors.primary,
  },
  expenseCategoryLabel: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    minHeight: 32,
    textAlign: 'center',
  },
  expenseCategoryLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  expenseEditCategoryPanel: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  expenseEditCategoryPanelCompact: {
    padding: spacing.sm,
  },
  expenseEditCategoryTrigger: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.sm,
  },
  expenseEditCategoryText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  expenseEditCategoryList: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  expenseEditCategoryGroup: {
    gap: spacing.sm,
  },
  expenseEditCategoryGroupTitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  expenseOptionsPanel: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  expenseOptionsPanelCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  expenseOptionSection: {
    gap: spacing.xs,
  },
  expenseOptionLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseOptionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  expenseCloseButton: {
    padding: spacing.xs,
  },
  expenseOptionChips: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  expenseOptionChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 68,
    paddingHorizontal: spacing.md,
  },
  expenseOptionChipCompact: {
    minHeight: 30,
    minWidth: 58,
    paddingHorizontal: spacing.sm,
  },
  expenseOptionChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  expenseOptionChipText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  expenseOptionChipTextSelected: {
    color: colors.primary,
  },
  expenseOptionEmpty: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    paddingVertical: spacing.sm,
  },
  expenseInstallmentInputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  expenseInstallmentInput: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
    minHeight: 30,
    minWidth: 64,
    padding: 0,
    textAlign: 'center',
  },
  expenseInstallmentSuffix: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  expenseEntryComposer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    paddingHorizontal: spacing.md,
  },
  expenseEntryComposerCompact: {
    gap: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.sm,
  },
  moreOptionsIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
    minHeight: 46,
    width: 46,
  },
  moreOptionsIconButtonCompact: {
    minHeight: 40,
    width: 40,
  },
  transactionReferenceField: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  transactionSubcategoryLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  transactionSubcategoryLabelCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  transactionNameField: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 30,
    minWidth: 0,
    overflow: 'hidden',
  },
  transactionNameInput: {
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    minHeight: 30,
    minWidth: 0,
    padding: 0,
  },
  transactionNameInputCompact: {
    fontSize: 13,
    minHeight: 28,
  },
  expenseMemoField: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  expenseMemoInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 44,
  },
  expenseMemoInputCompact: {
    fontSize: 14,
    minHeight: 38,
  },
  expenseAmountPreview: {
    color: colors.text,
    flexShrink: 0,
    fontFamily: fonts.regular,
    fontSize: 34,
    maxWidth: 104,
    textAlign: 'right',
    width: 104,
  },
  expenseAmountPreviewCompact: {
    fontSize: 27,
    maxWidth: 82,
    width: 82,
  },
  expenseKeypad: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  expenseKeypadRow: {
    flexDirection: 'row',
    minHeight: 76,
  },
  expenseKeypadRowCompact: {
    minHeight: 60,
  },
  expenseKey: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRightWidth: 1,
    borderTopWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 76,
  },
  expenseKeyCompact: {
    minHeight: 60,
  },
  expenseConfirmKey: {
    backgroundColor: colors.primary,
  },
  expenseKeyText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 26,
    textAlign: 'center',
  },
  expenseResolveKeyText: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 32,
  },
  expenseKeyTextCompact: {
    fontSize: 21,
  },
  expenseKeySubtext: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  calendarOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  calendarOverlayCompact: {
    padding: spacing.md,
  },
  calendarPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.md,
    maxWidth: 360,
    padding: spacing.lg,
    width: '100%',
  },
  calendarPanelCompact: {
    gap: spacing.sm,
    maxHeight: '88%',
    padding: spacing.md,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  calendarWeekdays: {
    flexDirection: 'row',
  },
  calendarWeekday: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  calendarGrid: {
    gap: spacing.xs,
  },
  calendarWeekRow: {
    flexDirection: 'row',
  },
  calendarDay: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  calendarDayCompact: {
    height: 34,
  },
  calendarDayOutside: {
    opacity: 0.38,
  },
  calendarDayToday: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  calendarDayTextOutside: {
    color: colors.textMuted,
  },
  calendarDayTextSelected: {
    color: colors.onPrimary,
  },
  dashboardRoot: {
    flex: 1,
    minHeight: 0,
  },
  dashboardSummaryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    minHeight: 112,
    paddingHorizontal: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  dashboardSummaryCardCompact: {
    alignItems: 'stretch',
    gap: spacing.sm,
    minHeight: 0,
    padding: spacing.md,
  },
  dashboardMetricGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  dashboardMetric: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  dashboardMetricCompact: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    width: '100%',
  },
  dashboardMetricDivider: {
    backgroundColor: colors.gray,
    height: 44,
    opacity: 0.75,
    width: 1,
  },
  dashboardMetricLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  dashboardMetricValue: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    minWidth: 0,
    textAlign: 'center',
  },
  expenseDayCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  expenseDayHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  expenseDayDate: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  expenseDayTotal: {
    color: colors.textMuted,
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  dashboardExpenseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dashboardExpenseRowCompact: {
    gap: spacing.sm,
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dashboardExpenseRowDivider: {
    borderTopColor: colors.surfaceAlt,
    borderTopWidth: 1,
  },
  dashboardExpenseMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  dashboardExpenseTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  dashboardExpenseAmount: {
    color: colors.textMuted,
    flexShrink: 0,
    fontFamily: fonts.medium,
    fontSize: 15,
    textAlign: 'right',
  },
  dashboardExpenseAmountCompact: {
    fontSize: 13,
    maxWidth: 108,
  },
  dashboardFab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 30,
    bottom: spacing.lg,
    elevation: 4,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    width: 60,
  },
  dashboardFabSpacer: {
    height: 72,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  listSectionTitle: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.danger,
  },
  listRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
  },
  listRowCompact: {
    gap: spacing.sm,
    padding: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  rowMeta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  rowAmount: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    textAlign: 'right',
  },
  categoryRowLabel: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  categoryRowTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  categoryIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    maxWidth: 180,
    paddingHorizontal: spacing.md,
  },
  categoryChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  categoryChipTextSelected: {
    color: colors.primary,
  },
  settingsMenu: {
    gap: spacing.md,
  },
  settingsMenuButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md,
  },
  settingsMenuButtonCompact: {
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.sm,
  },
  settingsMenuIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  settingsMenuIconCompact: {
    height: 38,
    width: 38,
  },
  settingsMenuText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  settingsMenuTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  settingsMenuTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  settingsMenuSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  settingsDetailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  formPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  premiumStatusCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    padding: spacing.md,
  },
  premiumBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    color: colors.primary,
    flexShrink: 0,
    fontFamily: fonts.bold,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  premiumBadgeActive: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  premiumFeatureList: {
    gap: spacing.sm,
  },
  premiumFeatureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 32,
  },
  premiumProductList: {
    gap: spacing.sm,
  },
  premiumLockedPanel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  compactCreationPanel: {
    gap: spacing.md,
  },
  aboutPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  aboutHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  aboutLogo: {
    borderRadius: radius.sm,
    height: 88,
    width: 88,
  },
  aboutHeroText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  aboutBrand: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  aboutBody: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  aboutLinkRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.md,
  },
  aboutLinkTextGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  aboutLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  aboutLink: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  aboutInfoRow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  aboutValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  aboutLegalSection: {
    gap: spacing.sm,
  },
  aboutLegalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  filterPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  formHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  formGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formGridCompact: {
    flexDirection: 'column',
  },
  field: {
    gap: spacing.sm,
    minWidth: 0,
    width: '100%',
  },
  formGridField: {
    flex: 1,
    width: 'auto',
  },
  fieldLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    height: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputDisabled: {
    color: colors.textMuted,
    opacity: 0.78,
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  segmentedControl: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  segmentedOption: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  segmentedOptionSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  segmentedOptionText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  segmentedOptionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  selectedOptionRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedOptionInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  defaultPaymentPickerList: {
    gap: spacing.sm,
  },
  defaultPaymentChoice: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  defaultPaymentChoiceSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  changeLink: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  installmentPanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.md,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 36,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: colors.gray,
    borderRadius: 4,
    borderWidth: 2,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  transactionRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  transactionRowCompact: {
    gap: spacing.sm,
    padding: spacing.sm,
  },
  transactionModalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  transactionModalOverlayCompact: {
    padding: spacing.md,
  },
  transactionDetailPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  transactionDetailPanelCompact: {
    gap: spacing.md,
    maxHeight: '88%',
    padding: spacing.md,
  },
  transactionEditPanel: {
    maxHeight: '90%',
    maxWidth: 460,
    width: '100%',
  },
  transactionEditPanelCompact: {
    maxHeight: '88%',
  },
  transactionEditScrollCompact: {
    flexGrow: 1,
  },
  moreOptionsPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    maxHeight: '86%',
    maxWidth: 440,
    padding: spacing.lg,
    width: '100%',
  },
  moreOptionsPanelCompact: {
    maxHeight: '88%',
    padding: spacing.md,
  },
  moreOptionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  moreOptionsContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  moreOptionsFooter: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  transactionDetailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  transactionDetailTitleGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  transactionDetailTitleText: {
    flex: 1,
    minWidth: 0,
  },
  transactionDetailTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  transactionDetailAmount: {
    fontFamily: fonts.bold,
    fontSize: 28,
  },
  transactionDetailAmountCompact: {
    fontSize: 24,
  },
  transactionDetailLines: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  transactionDetailLine: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  transactionDetailLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  transactionDetailValue: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'right',
  },
  transactionDetailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  transactionDetailActionsCompact: {
    flexWrap: 'wrap',
  },
  transactionMain: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  rowActionsCompact: {
    flexShrink: 0,
    maxWidth: 116,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  budgetRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  budgetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStatus: {
    flexShrink: 0,
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  budgetActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  exportActions: {
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  budgetSubcategoryGrid: {
    paddingHorizontal: 0,
    paddingTop: spacing.sm,
  },
  budgetEntryPanel: {
    gap: spacing.md,
  },
  budgetSelectedRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    padding: spacing.sm,
  },
  budgetFormActions: {
    gap: spacing.sm,
  },
  progressTrack: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.sm,
    height: 8,
  },
  managementRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  managementRowCompact: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  managementRowSelected: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  managementInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  managementText: {
    flex: 1,
    minWidth: 0,
  },
  managementActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  managementActionsCompact: {
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  managementSelectArea: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    minWidth: 0,
  },
  paymentMethodGroup: {
    gap: spacing.sm,
  },
  managementEditGroup: {
    gap: spacing.sm,
  },
  subcategoryAccordionGroup: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  subcategoryAccordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  subcategoryAccordionList: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.lg,
  },
  inlineEditPanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.md,
  },
  inlineEditActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  paymentSubmethodList: {
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingBottom: spacing.sm,
  },
  paymentSubmethodItem: {
    gap: spacing.sm,
  },
  paymentSubmethodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 38,
  },
  paymentSubmethodName: {
    flex: 1,
    minWidth: 96,
  },
  toggleSettingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 56,
  },
  toggleSettingInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  switchTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 48,
  },
  switchTrackEnabled: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    backgroundColor: colors.onPrimary,
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  switchThumbEnabled: {
    transform: [{ translateX: 22 }],
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonResponsiveCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  buttonCompact: {
    height: 38,
    paddingHorizontal: spacing.md,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    opacity: 0.72,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  buttonTextCompact: {
    fontSize: 13,
  },
  buttonTextPrimary: {
    color: colors.onPrimary,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconButtonCompact: {
    height: 34,
    width: 34,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 76,
    justifyContent: 'center',
    padding: spacing.md,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  iconPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  iconPickerItem: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconPickerItemSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  reportMonthLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  reportDetailTitle: {
    flex: 1,
  },
  reportRowName: {
    flex: 1,
  },
  reportRowMeta: {
    flex: 1,
  },
  installmentRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  installmentRowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  installmentRowTopCompact: {
    gap: spacing.sm,
  },
  managementIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});

let styles = createAppStyles(colors);

type AppThemeContextValue = {
  colors: AppThemeColors;
  styles: ReturnType<typeof createAppStyles>;
  isDark: boolean;
};

const ThemeContext = createContext<AppThemeContextValue>({
  colors,
  styles,
  isDark: false,
});

const useAppTheme = () => useContext(ThemeContext);
