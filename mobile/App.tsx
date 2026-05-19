import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import * as LocalAuthentication from 'expo-local-authentication';
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
  Dog,
  DollarSign,
  Download,
  Dumbbell,
  Film,
  Gamepad2,
  GraduationCap,
  Hamburger,
  HandCoins,
  HeartPulse,
  Home,
  HousePlug,
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
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { loadAppData, saveAppData } from './src/storage';
import { colors, fonts, radius, spacing } from './src/theme';
import {
  AppData,
  BudgetSummary,
  Category,
  CategorySummary,
  CurrencySummary,
  Subcategory,
  TabKey,
  Transaction,
  TransactionInput,
  TransactionType,
} from './src/types';
import {
  addMonths,
  categoryName,
  formatMoney,
  generateId,
  getMonthParts,
  monthLabel,
  monthStartInput,
  monthlyTransactions,
  normalizeCurrency,
  paymentMethodName,
  paymentSubmethodName,
  roundMoney,
  shiftMonth,
  splitInstallments,
  subcategoryName,
  summarizeBudgets,
  summarizeByCurrency,
  summarizeExpensesByCategory,
  todayInput,
  transactionsToCsv,
} from './src/utils';

type AuthStatus = 'checking' | 'authenticated' | 'locked' | 'unavailable';

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const tabs: Array<{ key: TabKey; label: string; Icon: IconComponent }> = [
  { key: 'dashboard', label: 'Dashboard', Icon: Home },
  { key: 'transactions', label: 'Transactions', Icon: List },
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
  'cat-exp-subscriptions': Repeat,
  'cat-exp-sports': Dumbbell,
  'cat-exp-insurance': ShieldCheck,
  'cat-exp-pets': PawPrint,
  'cat-exp-personal': UserRound,
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
  'sub-food-bakery': Croissant,
  'sub-food-burgers': Hamburger,
  'sub-food-drinks': CupSoda,
  'sub-food-cravings': CakeSlice,
  'sub-transport-rides': CarTaxiFront,
  'sub-transport-public-transit': BusFront,
  'sub-housing-home-goods': LampDesk,
  'sub-services-mobile-phone': Phone,
  'sub-health-personal-care': Pill,
  'sub-shopping-clothing': ShoppingBag,
  'sub-shopping-laundry': WashingMachine,
  'sub-subscriptions-streaming': Film,
  'sub-subscriptions-marketplace': Store,
  'sub-subscriptions-delivery': Package,
  'sub-subscriptions-music': Music,
  'sub-subscriptions-rides': CarTaxiFront,
  'sub-sports-soccer': Trophy,
  'sub-insurance-bike': Bike,
  'sub-pets-food': Bone,
  'sub-personal-ana': UserRound,
  'sub-other-cannabis': Cannabis,
  'sub-income-payroll': BadgeDollarSign,
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
  'cat-exp-subscriptions': '#8F75D6',
  'cat-exp-other': '#7EC8B4',
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
  { keywords: ['snack', 'bakery', 'bread'], Icon: Croissant },
  { keywords: ['burger', 'hamburger'], Icon: Hamburger },
  { keywords: ['drink', 'soda'], Icon: CupSoda },
  { keywords: ['craving', 'dessert'], Icon: CakeSlice },
  { keywords: ['ride', 'taxi'], Icon: CarTaxiFront },
  { keywords: ['public transit', 'bus', 'sube', 'train'], Icon: BusFront },
  { keywords: ['home goods', 'lamp'], Icon: LampDesk },
  { keywords: ['phone', 'mobile'], Icon: Phone },
  { keywords: ['personal care', 'pharmacy'], Icon: Pill },
  { keywords: ['clothing', 'clothes'], Icon: ShoppingBag },
  { keywords: ['laundry'], Icon: WashingMachine },
  { keywords: ['streaming'], Icon: Film },
  { keywords: ['marketplace'], Icon: Store },
  { keywords: ['music'], Icon: Music },
  { keywords: ['soccer', 'football'], Icon: Trophy },
  { keywords: ['bike insurance'], Icon: Bike },
  { keywords: ['pet food'], Icon: Bone },
  { keywords: ['cannabis'], Icon: Cannabis },
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

type ExpenseDayGroup = {
  date: string;
  transactions: Transaction[];
  totalsByCurrency: Array<{ currency: string; amount: number }>;
};

type SettingsSection = 'menu' | 'core' | 'budgets' | 'categories' | 'subcategories' | 'payments';

const formatDashboardDate = (dateInput: string): string => {
  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);

  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} ${weekday}`;
};

const formatShortInputDate = (dateInput: string): string => {
  const [, month, day] = dateInput.split('-').map(Number);

  return `${month}/${day}`;
};

const toDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const monthStartFromInput = (dateInput: string): string => {
  const [year, month] = dateInput.split('-');

  return `${year}-${month}-01`;
};

const calendarDaysForMonth = (
  monthInput: string,
): Array<{ dateInput: string; day: number; currentMonth: boolean }> => {
  const { month, year } = getMonthParts(monthInput);
  const firstDay = new Date(year, month - 1, 1);
  const startDate = new Date(year, month - 1, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);

    return {
      dateInput: toDateInput(date),
      day: date.getDate(),
      currentMonth: date.getMonth() === month - 1,
    };
  });
};

const groupExpensesByDate = (transactions: Transaction[]): ExpenseDayGroup[] => {
  const groups = new Map<string, { transactions: Transaction[]; totalsByCurrency: Map<string, number> }>();

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const current =
        groups.get(transaction.date) ??
        ({
          transactions: [],
          totalsByCurrency: new Map<string, number>(),
        } satisfies { transactions: Transaction[]; totalsByCurrency: Map<string, number> });

      current.transactions.push(transaction);
      current.totalsByCurrency.set(
        transaction.currency,
        roundMoney((current.totalsByCurrency.get(transaction.currency) ?? 0) + transaction.amount),
      );
      groups.set(transaction.date, current);
    });

  return Array.from(groups.entries()).map(([date, group]) => ({
    date,
    transactions: group.transactions,
    totalsByCurrency: Array.from(group.totalsByCurrency.entries()).map(([currency, amount]) => ({
      currency,
      amount,
    })),
  }));
};

const formatExpenseTotals = (totals: ExpenseDayGroup['totalsByCurrency']): string =>
  totals.map((total) => formatMoney(total.amount, total.currency)).join(' | ');

const formatDashboardMoney = (amount: number, currency: string): string =>
  `${currency} ${Math.round(amount).toLocaleString('en', {
    maximumFractionDigits: 0,
  })}`;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(monthStartInput());

  useEffect(() => {
    void loadAppData()
      .then(setData)
      .catch(() => {
        Alert.alert('Storage error', 'The local data store could not be loaded.');
      });
  }, []);

  useEffect(() => {
    void requestAuthentication();
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
        promptMessage: 'Unlock Expense Control',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use device passcode',
        disableDeviceFallback: false,
      });

      setAuthStatus(result.success ? 'authenticated' : 'locked');
    } catch {
      setAuthStatus('locked');
    }
  };

  const persistData = (updater: (current: AppData) => AppData) => {
    setData((current) => {
      if (!current) {
        return current;
      }

      const next = updater(current);
      void saveAppData(next).catch(() => {
        Alert.alert('Storage error', 'The last change could not be saved locally.');
      });

      return next;
    });
  };

  const handleSaveTransaction = (input: TransactionInput, editingTransaction?: Transaction) => {
    const timestamp = new Date().toISOString();

    if (editingTransaction) {
      persistData((current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === editingTransaction.id
            ? {
                ...transaction,
                ...input,
                amount: roundMoney(input.amount),
                currency: normalizeCurrency(input.currency),
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
    const amounts = isInstallment ? splitInstallments(input.amount, input.installmentCount ?? 1) : [input.amount];
    const startDate = input.firstInstallmentDate || input.date;

    const transactions: Transaction[] = amounts.map((amount, index) => ({
      id: generateId('trx'),
      type: input.type,
      amount: roundMoney(amount),
      currency: normalizeCurrency(input.currency),
      date: isInstallment ? addMonths(startDate, index) : input.date,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      paymentMethodId: input.paymentMethodId,
      paymentSubmethodId: input.paymentSubmethodId,
      description: isInstallment
        ? `${input.description || 'Installment purchase'} - Installment ${index + 1}/${amounts.length}`
        : input.description,
      installmentGroupId: groupId,
      installmentNumber: isInstallment ? index + 1 : undefined,
      totalInstallments: isInstallment ? amounts.length : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    persistData((current) => ({
      ...current,
      transactions: [...transactions, ...current.transactions],
    }));
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    const deleteLabel = transaction.installmentGroupId ? 'Delete installment group' : 'Delete transaction';

    Alert.alert(deleteLabel, 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          persistData((current) => ({
            ...current,
            transactions: current.transactions.filter((item) =>
              transaction.installmentGroupId
                ? item.installmentGroupId !== transaction.installmentGroupId
                : item.id !== transaction.id,
            ),
          })),
      },
    ]);
  };

  const handleSaveBudget = (categoryId: string, amount: number, currency: string) => {
    const timestamp = new Date().toISOString();
    const { month, year } = getMonthParts(selectedMonth);
    const normalizedCurrency = normalizeCurrency(currency);

    persistData((current) => {
      const existing = current.budgets.find(
        (budget) =>
          budget.categoryId === categoryId &&
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
            categoryId,
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

  const handleSetDefaultCurrency = (currency: string) => {
    persistData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        defaultCurrency: normalizeCurrency(currency),
      },
    }));
  };

  const handleAddCategory = (type: TransactionType, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toISOString();

    persistData((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: generateId(`cat-${type}`),
          name: trimmed,
          type,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    }));
  };

  const handleAddSubcategory = (categoryId: string, name: string, icon?: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toISOString();

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

  const handleDisableCategory = (categoryId: string) => {
    persistData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              active: false,
              updatedAt: new Date().toISOString(),
            }
          : category,
      ),
    }));
  };

  const handleAddPaymentMethod = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toISOString();

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

  const handleAddPaymentSubmethod = (paymentMethodId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toISOString();

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

  const handleDisablePaymentMethod = (paymentMethodId: string) => {
    persistData((current) => ({
      ...current,
      paymentMethods: current.paymentMethods.map((method) =>
        method.id === paymentMethodId
          ? {
              ...method,
              active: false,
              updatedAt: new Date().toISOString(),
            }
          : method,
      ),
    }));
  };

  if (!fontsLoaded || !data) {
    return <LoadingScreen />;
  }

  if (authStatus !== 'authenticated') {
    return <AuthScreen status={authStatus} onRetry={requestAuthentication} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, Platform.OS === 'web' && ({ height: '100vh', overflow: 'hidden' } as any)]}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        {activeTab === 'transactions' ? null : (
          <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        )}
        <View style={styles.content}>
          {activeTab === 'dashboard' ? (
            <DashboardScreen
              data={data}
              selectedMonth={selectedMonth}
              onAddTransaction={() => setActiveTab('transactions')}
            />
          ) : null}
          {activeTab === 'transactions' ? (
            <TransactionsScreen
              data={data}
              selectedMonth={selectedMonth}
              onSaveTransaction={handleSaveTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onClose={() => setActiveTab('dashboard')}
            />
          ) : null}
          {activeTab === 'reports' ? <ReportsScreen data={data} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} /> : null}
          {activeTab === 'settings' ? (
            <SettingsScreen
              data={data}
              selectedMonth={selectedMonth}
              onSaveBudget={handleSaveBudget}
              onSetDefaultCurrency={handleSetDefaultCurrency}
              onAddCategory={handleAddCategory}
              onAddSubcategory={handleAddSubcategory}
              onDisableCategory={handleDisableCategory}
              onAddPaymentMethod={handleAddPaymentMethod}
              onAddPaymentSubmethod={handleAddPaymentSubmethod}
              onDisablePaymentMethod={handleDisablePaymentMethod}
            />
          ) : null}
        </View>
        <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.centerScreen}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Loading Expense Control</Text>
    </SafeAreaView>
  );
}

function AuthScreen({ status, onRetry }: { status: AuthStatus; onRetry: () => void }) {
  const title = status === 'unavailable' ? 'Biometric lock unavailable' : 'Expense Control locked';
  const message =
    status === 'unavailable'
      ? 'Enroll fingerprint or face unlock on this Android device to access local financial data.'
      : 'Authenticate to view your dashboard and transactions.';

  return (
    <SafeAreaView style={styles.centerScreen}>
      <View style={styles.lockBadge}>
        <Lock color={colors.surface} size={36} strokeWidth={2.4} />
      </View>
      <Text style={styles.lockTitle}>{title}</Text>
      <Text style={styles.lockMessage}>{message}</Text>
      <AppButton label="Retry" Icon={Lock} onPress={onRetry} />
    </SafeAreaView>
  );
}

function Header({
  selectedMonth,
  onMonthChange,
}: {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>Expense Control</Text>
        <Text style={styles.headerTitle}>{monthLabel(selectedMonth)}</Text>
      </View>
      <View style={styles.monthControls}>
        <IconButton
          accessibilityLabel="Previous month"
          Icon={ChevronLeft}
          onPress={() => onMonthChange(shiftMonth(selectedMonth, -1))}
        />
        <IconButton
          accessibilityLabel="Next month"
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
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => onChange(key)}
            style={[styles.navItem, active ? styles.navItemActive : null]}
          >
            <Icon color={active ? colors.primary : colors.textMuted} size={22} strokeWidth={2.2} />
            <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DashboardScreen({
  data,
  selectedMonth,
  onAddTransaction,
}: {
  data: AppData;
  selectedMonth: string;
  onAddTransaction: () => void;
}) {
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);
  const currencySummaries = useMemo(() => summarizeByCurrency(transactions), [transactions]);
  const expenseGroups = useMemo(() => groupExpensesByDate(transactions), [transactions]);

  return (
    <View style={styles.dashboardRoot}>
      <ScreenScroll>
        {currencySummaries.length ? (
          currencySummaries.map((summary) => (
            <DashboardSummaryCard key={summary.currency} summary={summary} />
          ))
        ) : (
          <EmptyState title="No movements this month" />
        )}

        {expenseGroups.length ? (
          expenseGroups.map((group) => (
            <ExpenseDayCard key={group.date} data={data} group={group} />
          ))
        ) : (
          <EmptyState title="No expenses this month" />
        )}
        <View style={styles.dashboardFabSpacer} />
      </ScreenScroll>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={onAddTransaction}
        style={styles.dashboardFab}
      >
        <Plus color={colors.surface} size={30} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

function TransactionsScreen({
  data,
  selectedMonth,
  onSaveTransaction,
  onDeleteTransaction,
  onClose,
}: {
  data: AppData;
  selectedMonth: string;
  onSaveTransaction: (input: TransactionInput, editingTransaction?: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onClose: () => void;
}) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);
  const transactionForm = (
    <TransactionForm
      data={data}
      editingTransaction={editingTransaction}
      onCancelEdit={() => setEditingTransaction(undefined)}
      onClose={onClose}
      onSave={(input) => {
        onSaveTransaction(input, editingTransaction);
        setEditingTransaction(undefined);
      }}
    />
  );

  if (!editingTransaction) {
    return transactionForm;
  }

  return (
    <ScreenScroll>
      {transactionForm}

      <Text style={styles.sectionTitle}>Transactions</Text>
      {transactions.length ? (
        transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            data={data}
            transaction={transaction}
            onEdit={() => setEditingTransaction(transaction)}
            onDelete={() => onDeleteTransaction(transaction)}
          />
        ))
      ) : (
        <EmptyState title="No transactions in the selected month" />
      )}
    </ScreenScroll>
  );
}

function TransactionForm({
  data,
  editingTransaction,
  onCancelEdit,
  onClose,
  onSave,
}: {
  data: AppData;
  editingTransaction?: Transaction;
  onCancelEdit: () => void;
  onClose: () => void;
  onSave: (input: TransactionInput) => void;
}) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(data.settings.defaultCurrency);
  const [date, setDate] = useState(todayInput());
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentSubmethodId, setPaymentSubmethodId] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('1');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(todayInput());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(monthStartInput());
  const isNewExpenseEntry = !editingTransaction && type === 'expense';

  const categories = useMemo(
    () => data.categories.filter((category) => category.type === type && category.active),
    [data.categories, type],
  );
  const subcategories = useMemo(
    () => {
      const categoryIds = new Set(categories.map((category) => category.id));

      return data.subcategories.filter(
        (subcategory) => categoryIds.has(subcategory.categoryId) && subcategory.active,
      );
    },
    [categories, data.subcategories],
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
  const currentSubcategory = subcategories.find((subcategory) => subcategory.id === subcategoryId);
  const currentCategory = data.categories.find((category) => category.id === (currentSubcategory?.categoryId ?? categoryId));
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
  const amountDisplay = amount || '0';

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCurrency(editingTransaction.currency);
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setSubcategoryId(editingTransaction.subcategoryId);
      setPaymentMethodId(editingTransaction.paymentMethodId);
      setPaymentSubmethodId(editingTransaction.paymentSubmethodId);
      setDescription(editingTransaction.description);
      setInstallmentsEnabled(false);
      return;
    }

    setAmount('');
    setCurrency(data.settings.defaultCurrency);
    setDate(todayInput());
    setFirstInstallmentDate(todayInput());
    setDescription('');
    setInstallmentsEnabled(false);
    setInstallmentCount('1');
  }, [data.settings.defaultCurrency, editingTransaction]);

  useEffect(() => {
    const selectedSubcategory = subcategories.find((subcategory) => subcategory.id === subcategoryId);

    if (selectedSubcategory) {
      if (categoryId !== selectedSubcategory.categoryId) {
        setCategoryId(selectedSubcategory.categoryId);
      }
      return;
    }

    if (isNewExpenseEntry) {
      if (categoryId && !categories.some((category) => category.id === categoryId)) {
        setCategoryId('');
      }

      setSubcategoryId(undefined);
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
  }, [categories, categoryId, isNewExpenseEntry, subcategories, subcategoryId]);

  useEffect(() => {
    const selectedSubmethod = paymentSubmethods.find((submethod) => submethod.id === paymentSubmethodId);

    if (selectedSubmethod) {
      if (paymentMethodId !== selectedSubmethod.paymentMethodId) {
        setPaymentMethodId(selectedSubmethod.paymentMethodId);
      }
      return;
    }

    const firstSubmethod = paymentSubmethods[0];

    if (firstSubmethod) {
      setPaymentSubmethodId(firstSubmethod.id);
      setPaymentMethodId(firstSubmethod.paymentMethodId);
      return;
    }

    if (!paymentMethods.some((method) => method.id === paymentMethodId)) {
      setPaymentMethodId(paymentMethods[0]?.id ?? '');
    }

    setPaymentSubmethodId(undefined);
  }, [paymentMethodId, paymentMethods, paymentSubmethodId, paymentSubmethods]);

  const handleAmountKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmount((current) => current.slice(0, -1));
      return;
    }

    if (key === '+' || key === '-') {
      return;
    }

    if (key === '.') {
      setAmount((current) => (current.includes('.') ? current : `${current || '0'}.`));
      return;
    }

    setAmount((current) => {
      if (current.replace('.', '').length >= 10) {
        return current;
      }

      return current === '0' ? key : `${current}${key}`;
    });
  };

  const handleSelectExpenseDate = (nextDate: string) => {
    setDate(nextDate);
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

  const handleSubmit = () => {
    const parsedAmount = Number(amount.replace(',', '.'));
    const parsedInstallments = Number.parseInt(installmentCount, 10);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD format.');
      return;
    }

    if (!categoryId || !subcategoryId || !paymentMethodId || !paymentSubmethodId) {
      Alert.alert('Missing fields', 'Subcategory and payment submethod are required.');
      return;
    }

    if (installmentsEnabled && (!Number.isFinite(parsedInstallments) || parsedInstallments < 2)) {
      Alert.alert('Invalid installments', 'Use two or more installments.');
      return;
    }

    onSave({
      type,
      amount: parsedAmount,
      currency: normalizeCurrency(currency),
      date,
      categoryId,
      subcategoryId,
      paymentMethodId,
      paymentSubmethodId,
      description: description.trim(),
      installmentCount: type === 'expense' && installmentsEnabled ? parsedInstallments : undefined,
      firstInstallmentDate: type === 'expense' && installmentsEnabled ? firstInstallmentDate : undefined,
    });

    if (!editingTransaction) {
      setAmount('');
      setDate(todayInput());
      setFirstInstallmentDate(todayInput());
      setCategoryId('');
      setSubcategoryId(undefined);
      setDescription('');
      setInstallmentsEnabled(false);
      setInstallmentCount('1');
    }
  };

  if (!editingTransaction && type === 'expense') {
    return (
      <View style={styles.expenseEntryPanel}>
        <View style={styles.expenseEntryHeader}>
          <IconButton accessibilityLabel="Back to dashboard" Icon={ChevronLeft} onPress={onClose} />
          <View style={styles.expenseEntryTitleGroup}>
            <Text style={styles.expenseEntryTitle}>Expenses</Text>
            <ChevronDown color={colors.textMuted} size={20} strokeWidth={2.2} />
          </View>
        </View>

        <ScrollView
          style={styles.expenseCategoryScroller}
          contentContainerStyle={styles.expenseCategoryGrid}
          showsVerticalScrollIndicator={false}
        >
          {subcategories.length ? (
            subcategories.map((subcategory) => {
              const category = data.categories.find((item) => item.id === subcategory.categoryId);
              const Icon = getSubcategoryIcon(subcategory, category);
              const selected = subcategoryId === subcategory.id;

              return (
                <Pressable
                  key={subcategory.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setSubcategoryId(subcategory.id);
                    setCategoryId(subcategory.categoryId);
                  }}
                  style={styles.expenseCategoryItem}
                >
                  <View
                    style={[
                      styles.expenseCategoryIcon,
                      selected ? styles.expenseCategoryIconSelected : null,
                    ]}
                  >
                    <Icon
                      color={selected ? colors.surface : colors.textMuted}
                      size={32}
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.expenseCategoryLabel,
                      selected ? styles.expenseCategoryLabelSelected : null,
                    ]}
                    numberOfLines={1}
                  >
                    {subcategory.name}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <EmptyState title="No active subcategories available" />
          )}
        </ScrollView>

        {subcategoryId ? (
          <>
            <View style={styles.expenseOptionsPanel}>
              <View style={styles.expenseOptionSection}>
                <Text style={styles.expenseOptionLabel}>Currency</Text>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.expenseOptionChips}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                >
                  {currencyOptions.map((option) => {
                    const selected = normalizeCurrency(currency) === option;

                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setCurrency(option)}
                        style={[styles.expenseOptionChip, selected ? styles.expenseOptionChipSelected : null]}
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
              </View>

              <View style={styles.expenseOptionSection}>
                <Text style={styles.expenseOptionLabel}>Payment</Text>
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
                          style={[styles.expenseOptionChip, selected ? styles.expenseOptionChipSelected : null]}
                        >
                          <Text
                            style={[
                              styles.expenseOptionChipText,
                              selected ? styles.expenseOptionChipTextSelected : null,
                            ]}
                            numberOfLines={1}
                          >
                            {submethod.name}
                          </Text>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Text style={styles.expenseOptionEmpty}>No payment options</Text>
                  )}
                </ScrollView>
              </View>

              <View style={styles.expenseOptionSection}>
                <Text style={styles.expenseOptionLabel}>Installments</Text>
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
                        onPress={() => handleSelectInstallments(count)}
                        style={[styles.expenseOptionChip, selected ? styles.expenseOptionChipSelected : null]}
                      >
                        <Text
                          style={[
                            styles.expenseOptionChipText,
                            selected ? styles.expenseOptionChipTextSelected : null,
                          ]}
                        >
                          {count === 1 ? 'Single' : `${count}x`}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <View style={styles.expenseInstallmentInputWrap}>
                    <TextInput
                      keyboardType="number-pad"
                      value={installmentCount}
                      onChangeText={handleInstallmentInputChange}
                      placeholder="Custom"
                      placeholderTextColor={colors.gray}
                      style={styles.expenseInstallmentInput}
                    />
                    <Text style={styles.expenseInstallmentSuffix}>x</Text>
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.expenseEntryComposer}>
              <CategoryIconBadge category={currentCategory} subcategory={currentSubcategory} accent />
              <View style={styles.expenseMemoField}>
                <Pencil color={colors.gray} size={17} strokeWidth={2} />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Memo"
                  placeholderTextColor={colors.gray}
                  style={styles.expenseMemoInput}
                />
              </View>
              <Text style={styles.expenseAmountPreview} numberOfLines={1} adjustsFontSizeToFit>
                {amountDisplay}
              </Text>
            </View>

            <View style={styles.expenseKeypad}>
              <View style={styles.expenseKeypadRow}>
                <AmountKey label="7" onPress={() => handleAmountKeyPress('7')} />
                <AmountKey label="8" onPress={() => handleAmountKeyPress('8')} />
                <AmountKey label="9" onPress={() => handleAmountKeyPress('9')} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setCalendarMonth(monthStartFromInput(date));
                    setCalendarVisible(true);
                  }}
                  style={styles.expenseKey}
                >
                  <Text style={styles.expenseKeyText}>Today</Text>
                  <Text style={styles.expenseKeySubtext}>{formatShortInputDate(date)}</Text>
                </Pressable>
              </View>
              <View style={styles.expenseKeypadRow}>
                <AmountKey label="4" onPress={() => handleAmountKeyPress('4')} />
                <AmountKey label="5" onPress={() => handleAmountKeyPress('5')} />
                <AmountKey label="6" onPress={() => handleAmountKeyPress('6')} />
                <AmountKey label="+" onPress={() => handleAmountKeyPress('+')} />
              </View>
              <View style={styles.expenseKeypadRow}>
                <AmountKey label="1" onPress={() => handleAmountKeyPress('1')} />
                <AmountKey label="2" onPress={() => handleAmountKeyPress('2')} />
                <AmountKey label="3" onPress={() => handleAmountKeyPress('3')} />
                <AmountKey label="-" onPress={() => handleAmountKeyPress('-')} />
              </View>
              <View style={styles.expenseKeypadRow}>
                <AmountKey label="." onPress={() => handleAmountKeyPress('.')} />
                <AmountKey label="0" onPress={() => handleAmountKeyPress('0')} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete last digit"
                  onPress={() => handleAmountKeyPress('backspace')}
                  style={styles.expenseKey}
                >
                  <X color={colors.text} size={24} strokeWidth={2.4} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save expense"
                  onPress={handleSubmit}
                  style={[styles.expenseKey, styles.expenseConfirmKey]}
                >
                  <Check color={colors.surface} size={32} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
            <CalendarModal
              visible={calendarVisible}
              selectedDate={date}
              viewMonth={calendarMonth}
              onClose={() => setCalendarVisible(false)}
              onMonthChange={setCalendarMonth}
              onSelectDate={handleSelectExpenseDate}
            />
          </>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.formPanel}>
      <View style={styles.formHeader}>
        <Text style={styles.sectionTitle}>{editingTransaction ? 'Edit transaction' : 'New transaction'}</Text>
        {editingTransaction ? <IconButton accessibilityLabel="Cancel edit" Icon={X} onPress={onCancelEdit} /> : null}
      </View>

      <View style={styles.chipRow}>
        <Chip label="Expense" selected={type === 'expense'} onPress={() => setType('expense')} />
        <Chip label="Income" selected={type === 'income'} onPress={() => setType('income')} />
      </View>

      <View style={styles.formGrid}>
        <Field label="Amount" grid>
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <Field label="Currency" grid>
          <TextInput
            autoCapitalize="characters"
            value={currency}
            onChangeText={setCurrency}
            maxLength={3}
            placeholder="ARS"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
      </View>

      <Field label="Subcategory">
        {subcategories.length ? (
          <View style={styles.chipRow}>
            {subcategories.map((subcategory) => (
              <Chip
                key={subcategory.id}
                label={subcategory.name}
                selected={subcategoryId === subcategory.id}
                onPress={() => {
                  setSubcategoryId(subcategory.id);
                  setCategoryId(subcategory.categoryId);
                }}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.rowMeta}>No active subcategories available.</Text>
        )}
      </Field>

      <Field label="Payment submethod">
        {paymentSubmethods.length ? (
          <View style={styles.chipRow}>
            {paymentSubmethods.map((submethod) => (
              <Chip
                key={submethod.id}
                label={submethod.name}
                selected={paymentSubmethodId === submethod.id}
                onPress={() => {
                  setPaymentSubmethodId(submethod.id);
                  setPaymentMethodId(submethod.paymentMethodId);
                }}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.rowMeta}>No active payment submethods available.</Text>
        )}
      </Field>

      <Field label="Date">
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.gray}
          style={styles.input}
        />
      </Field>

      <Field label="Description">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
          placeholderTextColor={colors.gray}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </Field>

      {type === 'expense' && !editingTransaction ? (
        <View style={styles.installmentPanel}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: installmentsEnabled }}
            onPress={() => setInstallmentsEnabled((value) => !value)}
            style={styles.toggleRow}
          >
            <View style={[styles.checkbox, installmentsEnabled ? styles.checkboxSelected : null]} />
            <Text style={styles.toggleLabel}>Split into monthly installments</Text>
          </Pressable>

          {installmentsEnabled ? (
            <View style={styles.formGrid}>
              <Field label="Installments" grid>
                <TextInput
                  keyboardType="number-pad"
                  value={installmentCount}
                  onChangeText={setInstallmentCount}
                  style={styles.input}
                />
              </Field>
              <Field label="First date" grid>
                <TextInput
                  value={firstInstallmentDate}
                  onChangeText={setFirstInstallmentDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.gray}
                  style={styles.input}
                />
              </Field>
            </View>
          ) : null}
        </View>
      ) : null}

      <AppButton label={editingTransaction ? 'Save' : 'Add transaction'} Icon={Save} onPress={handleSubmit} />
    </View>
  );
}

function TransactionRow({
  data,
  transaction,
  onEdit,
  onDelete,
}: {
  data: AppData;
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canEdit = !transaction.installmentGroupId;
  const displayCategory = subcategoryName(data, transaction.subcategoryId) || categoryName(data, transaction.categoryId);
  const displayPayment =
    paymentSubmethodName(data, transaction.paymentSubmethodId) ||
    paymentMethodName(data, transaction.paymentMethodId);

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionMain}>
        <Text style={styles.rowTitle}>
          {transaction.description || displayCategory}
        </Text>
        <Text style={styles.rowMeta}>
          {transaction.date} - {displayCategory}
        </Text>
        <Text style={styles.rowMeta}>
          {displayPayment}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <Text style={[styles.rowAmount, transaction.type === 'expense' ? styles.negativeText : styles.positiveText]}>
          {transaction.type === 'expense' ? '-' : '+'}
          {formatMoney(transaction.amount, transaction.currency)}
        </Text>
        <View style={styles.iconRow}>
          {canEdit ? <IconButton accessibilityLabel="Edit transaction" Icon={Pencil} onPress={onEdit} /> : null}
          <IconButton accessibilityLabel="Delete transaction" Icon={Trash2} danger onPress={onDelete} />
        </View>
      </View>
    </View>
  );
}

type ReportSection = 'menu' | 'subpaymethod' | 'category' | 'subcategory' | 'installments';

type SelectedReportItem = {
  label: string;
  type: ReportSection;
  id: string;
  currency?: string;
} | null;

function ReportsScreen({
  data,
  selectedMonth,
  onMonthChange,
}: {
  data: AppData;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}) {
  const [activeReport, setActiveReport] = useState<ReportSection>('menu');
  const [selectedItem, setSelectedItem] = useState<SelectedReportItem>(null);

  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);

  const categorySummaries = useMemo(
    () => summarizeExpensesByCategory(data, transactions),
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
          name: paymentSubmethodName(data, t.paymentSubmethodId) ?? t.paymentSubmethodId!,
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
            description: t.description,
            currency: t.currency,
            installmentAmount: t.amount,
            total: t.totalInstallments ?? 0,
            current: 0,
            transactions: [t],
          });
        }
      });
    const [year, month] = selectedMonth.split('-').map(Number);
    return Array.from(groups.values())
      .filter((g) => {
        const paid = g.transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() * 12 + d.getMonth() < year * 12 + (month - 1);
        }).length;
        return g.total - paid > 0;
      })
      .map((g) => {
        const paid = g.transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() * 12 + d.getMonth() < year * 12 + (month - 1);
        }).length;
        return { ...g, current: paid + 1 };
      })
      .sort((a, b) => a.current - b.current);
  }, [data.transactions, selectedMonth]);

  const drillTransactions = useMemo(() => {
    if (!selectedItem) return [];
    const base = selectedItem.type === 'installments' ? data.transactions : transactions;
    return base.filter((t) => {
      if (selectedItem.type === 'category') return t.categoryId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'subcategory') return t.subcategoryId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'subpaymethod') return t.paymentSubmethodId === selectedItem.id && t.currency === selectedItem.currency;
      if (selectedItem.type === 'installments') return t.installmentGroupId === selectedItem.id;
      return false;
    });
  }, [selectedItem, transactions, data.transactions]);

  const drillGroups = useMemo(() => groupExpensesByDate(drillTransactions), [drillTransactions]);

  const toMonth = (month: string) => {
    const [y, m] = month.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const goBack = () => {
    if (selectedItem) { setSelectedItem(null); return; }
    setActiveReport('menu');
  };

  const reportTitle: Record<ReportSection, string> = {
    menu: '',
    subpaymethod: 'By payment submethod',
    category: 'By category',
    subcategory: 'By subcategory',
    installments: 'Installments',
  };

  const DetailHeader = ({ title }: { title: string }) => (
    <View style={styles.settingsDetailHeader}>
      <IconButton Icon={ChevronLeft} onPress={goBack} />
      <View style={styles.reportDetailTitle}>
        <Text style={styles.sectionTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.monthControls}>
        <IconButton Icon={ChevronLeft} onPress={prevMonth} />
        <IconButton Icon={ChevronRight} onPress={nextMonth} />
      </View>
    </View>
  );

  if (selectedItem) {
    return (
      <ScreenScroll>
        <DetailHeader title={selectedItem.label} />
        <Text style={styles.reportMonthLabel}>
          {selectedItem.type === 'installments' ? 'All installments' : toMonth(selectedMonth)}
        </Text>
        {drillGroups.length ? (
          drillGroups.map((group) => (
            <ExpenseDayCard key={group.date} data={data} group={group} />
          ))
        ) : (
          <EmptyState title="No expenses found" />
        )}
      </ScreenScroll>
    );
  }

  if (activeReport === 'menu') {
    return (
      <ScreenScroll>
        <Text style={styles.sectionTitle}>Reports</Text>
        <View style={styles.settingsMenu}>
          <SettingsMenuButton
            title="By payment submethod"
            subtitle={`${submethodSummaries.length} submethods with expenses`}
            Icon={WalletCards}
            onPress={() => setActiveReport('subpaymethod')}
          />
          <SettingsMenuButton
            title="By category"
            subtitle={`${categorySummaries.length} categories with expenses`}
            Icon={List}
            onPress={() => setActiveReport('category')}
          />
          <SettingsMenuButton
            title="By subcategory"
            subtitle={`${subcategorySummaries.length} subcategories with expenses`}
            Icon={Receipt}
            onPress={() => setActiveReport('subcategory')}
          />
          <SettingsMenuButton
            title="Installments"
            subtitle={`${installmentGroups.length} active installment plans`}
            Icon={Repeat}
            onPress={() => setActiveReport('installments')}
          />
        </View>
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
              style={styles.listRow}
            >
              <View style={styles.managementIconBadge}>
                <WalletCards color={colors.primary} size={18} strokeWidth={2.2} />
              </View>
              <Text style={[styles.rowTitle, styles.reportRowName]}>{s.name}</Text>
              <Text style={styles.rowAmount}>{formatMoney(s.amount, s.currency)}</Text>
            </Pressable>
          ))
        ) : (
          <EmptyState title="No submethod expenses this month" />
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
          categorySummaries.map((summary) => (
            <Pressable
              key={`${summary.categoryId}-${summary.currency}`}
              accessibilityRole="button"
              onPress={() => setSelectedItem({ type: 'category', id: summary.categoryId, currency: summary.currency, label: summary.categoryName })}
            >
              <CategorySummaryRow data={data} summary={summary} />
            </Pressable>
          ))
        ) : (
          <EmptyState title="No category expenses this month" />
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
            return (
              <Pressable
                key={`${s.subcategoryId}-${s.currency}`}
                accessibilityRole="button"
                onPress={() => setSelectedItem({ type: 'subcategory', id: s.subcategoryId, currency: s.currency, label: s.name })}
                style={styles.listRow}
              >
                <View style={styles.managementIconBadge}>
                  <SubIcon color={colors.primary} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.reportRowMeta}>
                  <Text style={styles.rowTitle}>{s.name}</Text>
                  <Text style={styles.rowMeta}>{parentCategory?.name ?? ''}</Text>
                </View>
                <Text style={styles.rowAmount}>{formatMoney(s.amount, s.currency)}</Text>
              </Pressable>
            );
          })
        ) : (
          <EmptyState title="No subcategory expenses this month" />
        )}
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
              <View style={styles.installmentRowTop}>
                <Text style={styles.rowTitle} numberOfLines={1}>{g.description}</Text>
                <Text style={styles.rowAmount}>{formatMoney(g.installmentAmount, g.currency)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.round((g.current / g.total) * 100)}%` }]} />
              </View>
              <Text style={styles.rowMeta}>
                Installment {g.current} of {g.total} · {formatMoney(g.installmentAmount * g.total, g.currency)} total
              </Text>
            </Pressable>
          ))
        ) : (
          <EmptyState title="No active installments this month" />
        )}
      </ScreenScroll>
    );
  }

  return null;
}

function SettingsScreen({
  data,
  selectedMonth,
  onSaveBudget,
  onSetDefaultCurrency,
  onAddCategory,
  onAddSubcategory,
  onDisableCategory,
  onAddPaymentMethod,
  onAddPaymentSubmethod,
  onDisablePaymentMethod,
}: {
  data: AppData;
  selectedMonth: string;
  onSaveBudget: (categoryId: string, amount: number, currency: string) => void;
  onSetDefaultCurrency: (currency: string) => void;
  onAddCategory: (type: TransactionType, name: string) => void;
  onAddSubcategory: (categoryId: string, name: string, icon?: string) => void;
  onDisableCategory: (categoryId: string) => void;
  onAddPaymentMethod: (name: string) => void;
  onAddPaymentSubmethod: (paymentMethodId: string, name: string) => void;
  onDisablePaymentMethod: (paymentMethodId: string) => void;
}) {
  const [defaultCurrency, setDefaultCurrency] = useState(data.settings.defaultCurrency);
  const [budgetCategoryId, setBudgetCategoryId] = useState(
    data.categories.find((category) => category.type === 'expense' && category.active)?.id ?? '',
  );
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState(data.settings.defaultCurrency);
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState(
    data.categories.find((category) => category.active)?.id ?? '',
  );
  const [subcategoryNameInput, setSubcategoryNameInput] = useState('');
  const [subcategoryIconInput, setSubcategoryIconInput] = useState<string | undefined>();
  const [paymentMethodInput, setPaymentMethodInput] = useState('');
  const [paymentSubmethodMethodId, setPaymentSubmethodMethodId] = useState(
    data.paymentMethods.find((method) => method.active)?.id ?? '',
  );
  const [paymentSubmethodInput, setPaymentSubmethodInput] = useState('');
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>('menu');

  const activeCategories = data.categories.filter((category) => category.active);
  const expenseCategories = activeCategories.filter((category) => category.type === 'expense');
  const activeSubcategories = data.subcategories.filter((subcategory) => subcategory.active);
  const activePaymentMethods = data.paymentMethods.filter((method) => method.active);
  const budgets = summarizeBudgets(data, selectedMonth);
  const settingsSectionTitles: Record<Exclude<SettingsSection, 'menu'>, string> = {
    core: 'Core settings',
    budgets: 'Monthly budgets',
    categories: 'Categories',
    subcategories: 'Subcategories',
    payments: 'Payment methods',
  };

  const saveBudget = () => {
    const parsedAmount = Number(budgetAmount.replace(',', '.'));

    if (!budgetCategoryId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid budget', 'Select a category and enter an amount greater than zero.');
      return;
    }

    onSaveBudget(budgetCategoryId, parsedAmount, budgetCurrency);
    setBudgetAmount('');
  };

  if (activeSettingsSection === 'menu') {
    return (
      <ScreenScroll>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsMenu}>
          <SettingsMenuButton
            title="Core settings"
            subtitle={`Default currency: ${data.settings.defaultCurrency}`}
            Icon={SettingsIcon}
            onPress={() => setActiveSettingsSection('core')}
          />
          <SettingsMenuButton
            title="Monthly budgets"
            subtitle={monthLabel(selectedMonth)}
            Icon={BarChart3}
            onPress={() => setActiveSettingsSection('budgets')}
          />
          <SettingsMenuButton
            title="Categories"
            subtitle={`${activeCategories.length} active categories`}
            Icon={List}
            onPress={() => setActiveSettingsSection('categories')}
          />
          <SettingsMenuButton
            title="Subcategories"
            subtitle={`${activeSubcategories.length} active subcategories`}
            Icon={Receipt}
            onPress={() => setActiveSettingsSection('subcategories')}
          />
          <SettingsMenuButton
            title="Payment methods"
            subtitle={`${activePaymentMethods.length} active methods`}
            Icon={WalletCards}
            onPress={() => setActiveSettingsSection('payments')}
          />
        </View>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <View style={styles.settingsDetailHeader}>
        <IconButton
          accessibilityLabel="Back to settings"
          Icon={ChevronLeft}
          onPress={() => setActiveSettingsSection('menu')}
        />
        <Text style={styles.sectionTitle}>{settingsSectionTitles[activeSettingsSection]}</Text>
      </View>

      {activeSettingsSection === 'core' ? (
        <View style={styles.formPanel}>
        <Field label="Default currency">
          <TextInput
            autoCapitalize="characters"
            maxLength={3}
            value={defaultCurrency}
            onChangeText={setDefaultCurrency}
            style={styles.input}
          />
        </Field>
        <AppButton label="Save currency" Icon={Save} onPress={() => onSetDefaultCurrency(defaultCurrency)} />
        <View style={styles.lockSettingRow}>
          <Lock color={colors.primary} size={20} />
          <Text style={styles.rowMeta}>Biometric lock is mandatory for the MVP.</Text>
        </View>
        </View>
      ) : null}

      {activeSettingsSection === 'budgets' ? (
        <View style={styles.formPanel}>
        <Text style={styles.sectionSubtitle}>{monthLabel(selectedMonth)}</Text>
        <Field label="Expense category">
          <View style={styles.chipRow}>
            {expenseCategories.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                selected={budgetCategoryId === category.id}
                onPress={() => setBudgetCategoryId(category.id)}
              />
            ))}
          </View>
        </Field>
        <View style={styles.formGrid}>
          <Field label="Amount" grid>
            <TextInput
              keyboardType="decimal-pad"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder="0.00"
              placeholderTextColor={colors.gray}
              style={styles.input}
            />
          </Field>
          <Field label="Currency" grid>
            <TextInput
              autoCapitalize="characters"
              maxLength={3}
              value={budgetCurrency}
              onChangeText={setBudgetCurrency}
              style={styles.input}
            />
          </Field>
        </View>
        <AppButton label="Save budget" Icon={Save} onPress={saveBudget} />

        {budgets.map((budget) => (
          <BudgetStatusRow
            key={budget.budget.id}
            summary={budget}
            category={data.categories.find((category) => category.id === budget.budget.categoryId)}
          />
        ))}
        </View>
      ) : null}

      {activeSettingsSection === 'categories' ? (
        <View style={styles.formPanel}>
        <View style={styles.chipRow}>
          <Chip label="Expense" selected={categoryType === 'expense'} onPress={() => setCategoryType('expense')} />
          <Chip label="Income" selected={categoryType === 'income'} onPress={() => setCategoryType('income')} />
        </View>
        <Field label="New category">
          <TextInput
            value={categoryNameInput}
            onChangeText={setCategoryNameInput}
            placeholder="Category name"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <AppButton
          label="Add category"
          Icon={Plus}
          onPress={() => {
            onAddCategory(categoryType, categoryNameInput);
            setCategoryNameInput('');
          }}
        />

        {activeCategories.map((category) => (
          <CategoryManagementRow
            key={category.id}
            category={category}
            onDisable={() => onDisableCategory(category.id)}
          />
        ))}
        </View>
      ) : null}

      {activeSettingsSection === 'subcategories' ? (
        <View style={styles.formPanel}>
        <Field label="Parent category">
          <View style={styles.chipRow}>
            {activeCategories.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                selected={subcategoryCategoryId === category.id}
                onPress={() => setSubcategoryCategoryId(category.id)}
              />
            ))}
          </View>
        </Field>
        <Field label="New subcategory">
          <TextInput
            value={subcategoryNameInput}
            onChangeText={setSubcategoryNameInput}
            placeholder="Subcategory name"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <Field label="Icon">
          <View style={styles.iconPickerGrid}>
            {SUBCATEGORY_ICON_OPTIONS.map(({ key, Icon }) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                onPress={() => setSubcategoryIconInput(subcategoryIconInput === key ? undefined : key)}
                style={[styles.iconPickerItem, subcategoryIconInput === key && styles.iconPickerItemSelected]}
              >
                <Icon
                  color={subcategoryIconInput === key ? colors.primary : colors.textMuted}
                  size={20}
                  strokeWidth={2.2}
                />
              </Pressable>
            ))}
          </View>
        </Field>
        <AppButton
          label="Add subcategory"
          Icon={Plus}
          onPress={() => {
            onAddSubcategory(subcategoryCategoryId, subcategoryNameInput, subcategoryIconInput);
            setSubcategoryNameInput('');
            setSubcategoryIconInput(undefined);
          }}
        />

        {activeSubcategories.map((subcategory) => {
          const parentCategory = data.categories.find((category) => category.id === subcategory.categoryId);
          const SubcatIcon = getSubcategoryIcon(subcategory, parentCategory);

          return (
            <ManagementRow
              key={subcategory.id}
              Icon={SubcatIcon}
              title={subcategory.name}
              subtitle={parentCategory ? parentCategory.name : 'No parent category'}
            />
          );
        })}
        </View>
      ) : null}

      {activeSettingsSection === 'payments' ? (
        <View style={styles.formPanel}>
        <Field label="New method">
          <TextInput
            value={paymentMethodInput}
            onChangeText={setPaymentMethodInput}
            placeholder="Payment method"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <AppButton
          label="Add method"
          Icon={WalletCards}
          onPress={() => {
            onAddPaymentMethod(paymentMethodInput);
            setPaymentMethodInput('');
          }}
        />

        <Field label="New submethod">
          <View style={styles.chipRow}>
            {activePaymentMethods.map((method) => (
              <Chip
                key={method.id}
                label={method.name}
                selected={paymentSubmethodMethodId === method.id}
                onPress={() => setPaymentSubmethodMethodId(method.id)}
              />
            ))}
          </View>
          <TextInput
            value={paymentSubmethodInput}
            onChangeText={setPaymentSubmethodInput}
            placeholder="Submethod name"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <AppButton
          label="Add submethod"
          Icon={Plus}
          onPress={() => {
            onAddPaymentSubmethod(paymentSubmethodMethodId, paymentSubmethodInput);
            setPaymentSubmethodInput('');
          }}
        />

        {activePaymentMethods.map((method) => (
          <ManagementRow
            key={method.id}
            title={method.name}
            subtitle={`${data.paymentSubmethods.filter((item) => item.paymentMethodId === method.id && item.active).length} submethods`}
            onDisable={() => onDisablePaymentMethod(method.id)}
          />
        ))}
        </View>
      ) : null}
    </ScreenScroll>
  );
}

function DashboardSummaryCard({ summary }: { summary: CurrencySummary }) {
  return (
    <View style={styles.dashboardSummaryCard}>
      <View style={styles.dashboardMetric}>
        <Text style={styles.dashboardMetricLabel}>Income</Text>
        <Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatDashboardMoney(summary.income, summary.currency)}
        </Text>
      </View>
      <View style={styles.dashboardMetricDivider} />
      <View style={styles.dashboardMetric}>
        <Text style={styles.dashboardMetricLabel}>Expenses</Text>
        <Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatDashboardMoney(summary.expenses, summary.currency)}
        </Text>
      </View>
      <View style={styles.dashboardMetricDivider} />
      <View style={styles.dashboardMetric}>
        <Text style={styles.dashboardMetricLabel}>Balance</Text>
        <Text style={styles.dashboardMetricValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatDashboardMoney(summary.balance, summary.currency)}
        </Text>
      </View>
    </View>
  );
}

function ExpenseDayCard({ data, group }: { data: AppData; group: ExpenseDayGroup }) {
  return (
    <View style={styles.expenseDayCard}>
      <View style={styles.expenseDayHeader}>
        <Text style={styles.expenseDayDate}>{formatDashboardDate(group.date)}</Text>
        <Text style={styles.expenseDayTotal} numberOfLines={1}>
          Expenses: {formatExpenseTotals(group.totalsByCurrency)}
        </Text>
      </View>
      {group.transactions.map((transaction, index) => (
        <DashboardExpenseRow
          key={transaction.id}
          data={data}
          transaction={transaction}
          withDivider={index > 0}
        />
      ))}
    </View>
  );
}

function DashboardExpenseRow({
  data,
  transaction,
  withDivider,
}: {
  data: AppData;
  transaction: Transaction;
  withDivider: boolean;
}) {
  const category = data.categories.find((item) => item.id === transaction.categoryId);
  const subcategory = data.subcategories.find((item) => item.id === transaction.subcategoryId);
  const title = transaction.description || subcategoryName(data, transaction.subcategoryId) || categoryName(data, transaction.categoryId);

  return (
    <View style={[styles.dashboardExpenseRow, withDivider ? styles.dashboardExpenseRowDivider : null]}>
      <View style={styles.dashboardExpenseMain}>
        <CategoryIconBadge category={category} subcategory={subcategory} accent />
        <Text style={styles.dashboardExpenseTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <Text style={styles.dashboardExpenseAmount} numberOfLines={1}>
        - {formatMoney(transaction.amount, transaction.currency)}
      </Text>
    </View>
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
  const iconColor = accent ? colors.surface : colors.deepBlue;

  return (
    <View style={[styles.categoryIconBadge, { backgroundColor }]}>
      <Icon color={iconColor} size={24} strokeWidth={2.2} />
    </View>
  );
}

function CategorySummaryRow({ data, summary }: { data: AppData; summary: CategorySummary }) {
  const category = data.categories.find((item) => item.id === summary.categoryId);

  return (
    <View style={styles.listRow}>
      <View style={styles.categoryRowLabel}>
        <CategoryIconBadge category={category} />
        <Text style={styles.categoryRowTitle} numberOfLines={1}>
          {summary.categoryName}
        </Text>
      </View>
      <Text style={styles.rowAmount}>{formatMoney(summary.amount, summary.currency)}</Text>
    </View>
  );
}

function BudgetStatusRow({ summary, category }: { summary: BudgetSummary; category?: Category }) {
  const statusColor =
    summary.status === 'exceeded'
      ? colors.danger
      : summary.status === 'near-limit'
        ? colors.warning
        : colors.success;
  const percentage = Math.round(summary.usage * 100);

  return (
    <View style={styles.budgetRow}>
      <View style={styles.budgetHeader}>
        <View style={styles.categoryRowLabel}>
          <CategoryIconBadge category={category} />
          <Text style={styles.categoryRowTitle} numberOfLines={1}>
            {summary.categoryName}
          </Text>
        </View>
        <Text style={[styles.budgetStatus, { color: statusColor }]}>{summary.status}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: statusColor, width: `${Math.min(100, percentage)}%` }]} />
      </View>
      <Text style={styles.rowMeta}>
        {formatMoney(summary.spent, summary.budget.currency)} of{' '}
        {formatMoney(summary.budget.amount, summary.budget.currency)} · {percentage}%
      </Text>
    </View>
  );
}

function CategoryManagementRow({ category, onDisable }: { category: Category; onDisable: () => void }) {
  return (
    <View style={styles.managementRow}>
      <View style={styles.managementInfo}>
        <CategoryIconBadge category={category} />
        <View style={styles.managementText}>
          <Text style={styles.categoryRowTitle} numberOfLines={1}>
            {category.name}
          </Text>
          <Text style={styles.rowMeta}>{category.type}</Text>
        </View>
      </View>
      <AppButton label="Disable" compact variant="secondary" onPress={onDisable} />
    </View>
  );
}

function ManagementRow({
  title,
  subtitle,
  Icon,
  onDisable,
}: {
  title: string;
  subtitle: string;
  Icon?: IconComponent;
  onDisable?: () => void;
}) {
  return (
    <View style={styles.managementRow}>
      <View style={styles.managementInfo}>
        {Icon ? (
          <View style={styles.managementIconBadge}>
            <Icon color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
        ) : null}
        <View style={styles.managementText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowMeta}>{subtitle}</Text>
        </View>
      </View>
      {onDisable ? <AppButton label="Disable" compact variant="secondary" onPress={onDisable} /> : null}
    </View>
  );
}

function SettingsMenuButton({
  title,
  subtitle,
  Icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  Icon: IconComponent;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.settingsMenuButton}>
      <View style={styles.settingsMenuIcon}>
        <Icon color={colors.primary} size={24} strokeWidth={2.2} />
      </View>
      <View style={styles.settingsMenuText}>
        <Text style={styles.settingsMenuTitle}>{title}</Text>
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
  selected,
  onPress,
}: {
  category: Category;
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
        {category.name}
      </Text>
    </Pressable>
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
  selectedDate,
  viewMonth,
  onClose,
  onMonthChange,
  onSelectDate,
}: {
  visible: boolean;
  selectedDate: string;
  viewMonth: string;
  onClose: () => void;
  onMonthChange: (dateInput: string) => void;
  onSelectDate: (dateInput: string) => void;
}) {
  const days = calendarDaysForMonth(viewMonth);
  const today = todayInput();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.calendarOverlay}>
        <Pressable accessibilityRole="none" onPress={() => undefined} style={styles.calendarPanel}>
          <View style={styles.calendarHeader}>
            <IconButton
              accessibilityLabel="Previous month"
              Icon={ChevronLeft}
              onPress={() => onMonthChange(shiftMonth(viewMonth, -1))}
            />
            <Text style={styles.calendarTitle}>{monthLabel(viewMonth)}</Text>
            <IconButton
              accessibilityLabel="Next month"
              Icon={ChevronRight}
              onPress={() => onMonthChange(shiftMonth(viewMonth, 1))}
            />
          </View>
          <View style={styles.calendarWeekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
              <Text key={weekday} style={styles.calendarWeekday}>
                {weekday}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {days.map((day) => {
              const selected = day.dateInput === selectedDate;
              const isToday = day.dateInput === today;

              return (
                <Pressable
                  key={day.dateInput}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelectDate(day.dateInput)}
                  style={[
                    styles.calendarDay,
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AmountKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.expenseKey}>
      <Text style={styles.expenseKeyText}>{label}</Text>
    </Pressable>
  );
}

function AppButton({
  label,
  Icon,
  onPress,
  variant = 'primary',
  compact,
}: {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  compact?: boolean;
}) {
  const primary = variant === 'primary';
  const iconColor = primary ? colors.surface : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        compact ? styles.buttonCompact : null,
      ]}
    >
      {Icon ? <Icon color={iconColor} size={18} strokeWidth={2.4} /> : null}
      <Text style={[styles.buttonText, primary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
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
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.iconButton}>
      <Icon color={danger ? colors.danger : colors.deepBlue} size={20} strokeWidth={2.2} />
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

function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  monthControls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bottomNav: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.xs,
    minHeight: 56,
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: '#FFEAEA',
  },
  navLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
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
  expenseCategoryIcon: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  expenseCategoryIconSelected: {
    backgroundColor: colors.primary,
  },
  expenseCategoryLabel: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  expenseCategoryLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  expenseOptionsPanel: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  expenseOptionSection: {
    gap: spacing.xs,
  },
  expenseOptionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
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
  expenseOptionChipSelected: {
    backgroundColor: '#FFEAEA',
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
    gap: spacing.md,
    minHeight: 72,
    paddingHorizontal: spacing.md,
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
  expenseAmountPreview: {
    color: colors.text,
    flexShrink: 0,
    fontFamily: fonts.regular,
    fontSize: 34,
    maxWidth: 140,
    textAlign: 'right',
  },
  expenseKeypad: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  expenseKeypadRow: {
    flexDirection: 'row',
    minHeight: 76,
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
  expenseConfirmKey: {
    backgroundColor: colors.primary,
  },
  expenseKeyText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 26,
    textAlign: 'center',
  },
  expenseKeySubtext: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  calendarOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  calendarPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.md,
    maxWidth: 360,
    padding: spacing.lg,
    width: '100%',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: `${100 / 7}%`,
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
    color: colors.surface,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  dashboardMetric: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
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
    shadowColor: colors.black,
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
    shadowColor: colors.black,
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
    backgroundColor: '#FFEAEA',
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
  settingsMenuIcon: {
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  settingsMenuText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  settingsMenuTitle: {
    color: colors.text,
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
    backgroundColor: '#FFEAEA',
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
  transactionMain: {
    flex: 1,
    gap: spacing.xs,
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
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
  lockSettingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  buttonTextPrimary: {
    color: colors.surface,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
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
    backgroundColor: '#FFEAEA',
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
  managementIconBadge: {
    alignItems: 'center',
    backgroundColor: '#F0FAF8',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
