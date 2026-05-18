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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Home,
  List,
  Lock,
  Pencil,
  Plus,
  Save,
  Settings as SettingsIcon,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { loadAppData, saveAppData } from './src/storage';
import { colors, fonts, radius, spacing } from './src/theme';
import {
  AppData,
  BudgetSummary,
  Category,
  PaymentMethod,
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

export default function App() {
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

  const handleAddSubcategory = (categoryId: string, name: string) => {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <Header selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
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
            />
          ) : null}
          {activeTab === 'reports' ? <ReportsScreen data={data} selectedMonth={selectedMonth} /> : null}
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
  const categorySummaries = useMemo(
    () => summarizeExpensesByCategory(data, transactions),
    [data, transactions],
  );
  const budgetSummaries = useMemo(() => summarizeBudgets(data, selectedMonth), [data, selectedMonth]);

  return (
    <ScreenScroll>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Monthly summary</Text>
          <Text style={styles.sectionSubtitle}>Totals stay separated by currency.</Text>
        </View>
        <AppButton label="Add" Icon={Plus} compact onPress={onAddTransaction} />
      </View>

      {currencySummaries.length ? (
        currencySummaries.map((summary) => (
          <View key={summary.currency} style={styles.summaryBand}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryCurrency}>{summary.currency}</Text>
              <Text
                style={[
                  styles.summaryBalance,
                  summary.balance < 0 ? styles.negativeText : styles.positiveText,
                ]}
              >
                {formatMoney(summary.balance, summary.currency)}
              </Text>
            </View>
            <View style={styles.metricGrid}>
              <Metric label="Income" value={formatMoney(summary.income, summary.currency)} />
              <Metric label="Expenses" value={formatMoney(summary.expenses, summary.currency)} danger />
            </View>
          </View>
        ))
      ) : (
        <EmptyState title="No movements this month" />
      )}

      <Text style={styles.sectionTitle}>Expenses by category</Text>
      {categorySummaries.length ? (
        categorySummaries.slice(0, 6).map((summary) => (
          <View key={`${summary.categoryId}-${summary.currency}`} style={styles.listRow}>
            <Text style={styles.rowTitle}>{summary.categoryName}</Text>
            <Text style={styles.rowAmount}>{formatMoney(summary.amount, summary.currency)}</Text>
          </View>
        ))
      ) : (
        <EmptyState title="No category spending yet" />
      )}

      <Text style={styles.sectionTitle}>Budget status</Text>
      {budgetSummaries.length ? (
        budgetSummaries.map((budget) => <BudgetStatusRow key={budget.budget.id} summary={budget} />)
      ) : (
        <EmptyState title="No budgets defined for this month" />
      )}
    </ScreenScroll>
  );
}

function TransactionsScreen({
  data,
  selectedMonth,
  onSaveTransaction,
  onDeleteTransaction,
}: {
  data: AppData;
  selectedMonth: string;
  onSaveTransaction: (input: TransactionInput, editingTransaction?: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);

  return (
    <ScreenScroll>
      <TransactionForm
        data={data}
        editingTransaction={editingTransaction}
        onCancelEdit={() => setEditingTransaction(undefined)}
        onSave={(input) => {
          onSaveTransaction(input, editingTransaction);
          setEditingTransaction(undefined);
        }}
      />

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
  onSave,
}: {
  data: AppData;
  editingTransaction?: Transaction;
  onCancelEdit: () => void;
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
  const [installmentCount, setInstallmentCount] = useState('3');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(todayInput());

  const categories = useMemo(
    () => data.categories.filter((category) => category.type === type && category.active),
    [data.categories, type],
  );
  const subcategories = useMemo(
    () =>
      data.subcategories.filter(
        (subcategory) => subcategory.categoryId === categoryId && subcategory.active,
      ),
    [data.subcategories, categoryId],
  );
  const paymentMethods = useMemo(
    () => data.paymentMethods.filter((method) => method.active),
    [data.paymentMethods],
  );
  const paymentSubmethods = useMemo(
    () =>
      data.paymentSubmethods.filter(
        (submethod) => submethod.paymentMethodId === paymentMethodId && submethod.active,
      ),
    [data.paymentSubmethods, paymentMethodId],
  );

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
    setDescription('');
    setInstallmentsEnabled(false);
  }, [data.settings.defaultCurrency, editingTransaction]);

  useEffect(() => {
    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? '');
      setSubcategoryId(undefined);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (!paymentMethods.some((method) => method.id === paymentMethodId)) {
      setPaymentMethodId(paymentMethods[0]?.id ?? '');
      setPaymentSubmethodId(undefined);
    }
  }, [paymentMethods, paymentMethodId]);

  useEffect(() => {
    if (!subcategories.some((subcategory) => subcategory.id === subcategoryId)) {
      setSubcategoryId(undefined);
    }
  }, [subcategories, subcategoryId]);

  useEffect(() => {
    if (!paymentSubmethods.some((submethod) => submethod.id === paymentSubmethodId)) {
      setPaymentSubmethodId(undefined);
    }
  }, [paymentSubmethods, paymentSubmethodId]);

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

    if (!categoryId || !paymentMethodId) {
      Alert.alert('Missing fields', 'Category and payment method are required.');
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
  };

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
        <Field label="Amount">
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <Field label="Currency">
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

      <Field label="Category">
        <View style={styles.chipRow}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>
      </Field>

      {subcategories.length ? (
        <Field label="Subcategory">
          <View style={styles.chipRow}>
            <Chip label="None" selected={!subcategoryId} onPress={() => setSubcategoryId(undefined)} />
            {subcategories.map((subcategory) => (
              <Chip
                key={subcategory.id}
                label={subcategory.name}
                selected={subcategoryId === subcategory.id}
                onPress={() => setSubcategoryId(subcategory.id)}
              />
            ))}
          </View>
        </Field>
      ) : null}

      <Field label="Payment method">
        <View style={styles.chipRow}>
          {paymentMethods.map((method) => (
            <Chip
              key={method.id}
              label={method.name}
              selected={paymentMethodId === method.id}
              onPress={() => setPaymentMethodId(method.id)}
            />
          ))}
        </View>
      </Field>

      {paymentSubmethods.length ? (
        <Field label="Payment submethod">
          <View style={styles.chipRow}>
            <Chip
              label="None"
              selected={!paymentSubmethodId}
              onPress={() => setPaymentSubmethodId(undefined)}
            />
            {paymentSubmethods.map((submethod) => (
              <Chip
                key={submethod.id}
                label={submethod.name}
                selected={paymentSubmethodId === submethod.id}
                onPress={() => setPaymentSubmethodId(submethod.id)}
              />
            ))}
          </View>
        </Field>
      ) : null}

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
              <Field label="Installments">
                <TextInput
                  keyboardType="number-pad"
                  value={installmentCount}
                  onChangeText={setInstallmentCount}
                  style={styles.input}
                />
              </Field>
              <Field label="First date">
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

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionMain}>
        <Text style={styles.rowTitle}>
          {transaction.description || categoryName(data, transaction.categoryId)}
        </Text>
        <Text style={styles.rowMeta}>
          {transaction.date} · {categoryName(data, transaction.categoryId)}
          {subcategoryName(data, transaction.subcategoryId)
            ? ` / ${subcategoryName(data, transaction.subcategoryId)}`
            : ''}
        </Text>
        <Text style={styles.rowMeta}>
          {paymentMethodName(data, transaction.paymentMethodId)}
          {paymentSubmethodName(data, transaction.paymentSubmethodId)
            ? ` / ${paymentSubmethodName(data, transaction.paymentSubmethodId)}`
            : ''}
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

function ReportsScreen({ data, selectedMonth }: { data: AppData; selectedMonth: string }) {
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const transactions = useMemo(() => monthlyTransactions(data, selectedMonth), [data, selectedMonth]);
  const categorySummaries = useMemo(
    () => summarizeExpensesByCategory(data, transactions),
    [data, transactions],
  );
  const paymentSummaries = useMemo(() => {
    const byMethod = new Map<string, { methodId: string; methodName: string; amount: number; currency: string }>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const key = `${transaction.paymentMethodId}-${transaction.currency}`;
        const current =
          byMethod.get(key) ??
          ({
            methodId: transaction.paymentMethodId,
            methodName: paymentMethodName(data, transaction.paymentMethodId),
            amount: 0,
            currency: transaction.currency,
          } satisfies { methodId: string; methodName: string; amount: number; currency: string });

        current.amount += transaction.amount;
        byMethod.set(key, current);
      });

    return Array.from(byMethod.values()).sort((left, right) => right.amount - left.amount);
  }, [data, transactions]);
  const currencies = useMemo(
    () => ['ALL', ...Array.from(new Set(data.transactions.map((transaction) => transaction.currency)))],
    [data.transactions],
  );

  const exportCsv = async () => {
    const filtered = transactions.filter((transaction) => {
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      const currencyMatch = currencyFilter === 'ALL' || transaction.currency === currencyFilter;

      return typeMatch && currencyMatch;
    });

    const csv = transactionsToCsv(data, filtered);
    const fileUri = `${FileSystem.documentDirectory}transactions-${selectedMonth}-${Date.now()}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export transactions CSV',
      });
      return;
    }

    Alert.alert('CSV created', fileUri);
  };

  return (
    <ScreenScroll>
      <Text style={styles.sectionTitle}>Reports</Text>
      <View style={styles.filterPanel}>
        <Text style={styles.fieldLabel}>CSV filters</Text>
        <View style={styles.chipRow}>
          <Chip label="All" selected={typeFilter === 'all'} onPress={() => setTypeFilter('all')} />
          <Chip label="Expenses" selected={typeFilter === 'expense'} onPress={() => setTypeFilter('expense')} />
          <Chip label="Income" selected={typeFilter === 'income'} onPress={() => setTypeFilter('income')} />
        </View>
        <View style={styles.chipRow}>
          {currencies.map((currency) => (
            <Chip
              key={currency}
              label={currency}
              selected={currencyFilter === currency}
              onPress={() => setCurrencyFilter(currency)}
            />
          ))}
        </View>
        <AppButton label="Export CSV" Icon={Download} onPress={() => void exportCsv()} />
      </View>

      <Text style={styles.sectionTitle}>Expenses by category</Text>
      {categorySummaries.length ? (
        categorySummaries.map((summary) => (
          <View key={`${summary.categoryId}-${summary.currency}`} style={styles.listRow}>
            <Text style={styles.rowTitle}>{summary.categoryName}</Text>
            <Text style={styles.rowAmount}>{formatMoney(summary.amount, summary.currency)}</Text>
          </View>
        ))
      ) : (
        <EmptyState title="No expense report data" />
      )}

      <Text style={styles.sectionTitle}>Expenses by payment method</Text>
      {paymentSummaries.length ? (
        paymentSummaries.map((summary) => (
          <View key={`${summary.methodId}-${summary.currency}`} style={styles.listRow}>
            <Text style={styles.rowTitle}>{summary.methodName}</Text>
            <Text style={styles.rowAmount}>{formatMoney(summary.amount, summary.currency)}</Text>
          </View>
        ))
      ) : (
        <EmptyState title="No payment method report data" />
      )}
    </ScreenScroll>
  );
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
  onAddSubcategory: (categoryId: string, name: string) => void;
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
  const [paymentMethodInput, setPaymentMethodInput] = useState('');
  const [paymentSubmethodMethodId, setPaymentSubmethodMethodId] = useState(
    data.paymentMethods.find((method) => method.active)?.id ?? '',
  );
  const [paymentSubmethodInput, setPaymentSubmethodInput] = useState('');

  const activeCategories = data.categories.filter((category) => category.active);
  const expenseCategories = activeCategories.filter((category) => category.type === 'expense');
  const activePaymentMethods = data.paymentMethods.filter((method) => method.active);
  const budgets = summarizeBudgets(data, selectedMonth);

  const saveBudget = () => {
    const parsedAmount = Number(budgetAmount.replace(',', '.'));

    if (!budgetCategoryId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid budget', 'Select a category and enter an amount greater than zero.');
      return;
    }

    onSaveBudget(budgetCategoryId, parsedAmount, budgetCurrency);
    setBudgetAmount('');
  };

  return (
    <ScreenScroll>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.formPanel}>
        <Text style={styles.panelTitle}>Core settings</Text>
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

      <View style={styles.formPanel}>
        <Text style={styles.panelTitle}>Monthly budgets</Text>
        <Text style={styles.sectionSubtitle}>{monthLabel(selectedMonth)}</Text>
        <Field label="Expense category">
          <View style={styles.chipRow}>
            {expenseCategories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={budgetCategoryId === category.id}
                onPress={() => setBudgetCategoryId(category.id)}
              />
            ))}
          </View>
        </Field>
        <View style={styles.formGrid}>
          <Field label="Amount">
            <TextInput
              keyboardType="decimal-pad"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder="0.00"
              placeholderTextColor={colors.gray}
              style={styles.input}
            />
          </Field>
          <Field label="Currency">
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
          <BudgetStatusRow key={budget.budget.id} summary={budget} />
        ))}
      </View>

      <View style={styles.formPanel}>
        <Text style={styles.panelTitle}>Categories</Text>
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

        <Field label="New subcategory">
          <View style={styles.chipRow}>
            {activeCategories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={subcategoryCategoryId === category.id}
                onPress={() => setSubcategoryCategoryId(category.id)}
              />
            ))}
          </View>
          <TextInput
            value={subcategoryNameInput}
            onChangeText={setSubcategoryNameInput}
            placeholder="Subcategory name"
            placeholderTextColor={colors.gray}
            style={styles.input}
          />
        </Field>
        <AppButton
          label="Add subcategory"
          Icon={Plus}
          onPress={() => {
            onAddSubcategory(subcategoryCategoryId, subcategoryNameInput);
            setSubcategoryNameInput('');
          }}
        />

        {activeCategories.map((category) => (
          <ManagementRow
            key={category.id}
            title={category.name}
            subtitle={category.type}
            onDisable={() => onDisableCategory(category.id)}
          />
        ))}
      </View>

      <View style={styles.formPanel}>
        <Text style={styles.panelTitle}>Payment methods</Text>
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
    </ScreenScroll>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, danger ? styles.negativeText : null]}>{value}</Text>
    </View>
  );
}

function BudgetStatusRow({ summary }: { summary: BudgetSummary }) {
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
        <Text style={styles.rowTitle}>{summary.categoryName}</Text>
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

function ManagementRow({
  title,
  subtitle,
  onDisable,
}: {
  title: string;
  subtitle: string;
  onDisable: () => void;
}) {
  return (
    <View style={styles.managementRow}>
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowMeta}>{subtitle}</Text>
      </View>
      <AppButton label="Disable" compact variant="secondary" onPress={onDisable} />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  },
  screenContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  summaryBand: {
    backgroundColor: colors.deepBlue,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  summaryCurrency: {
    color: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  summaryBalance: {
    color: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 26,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  metricLabel: {
    color: '#DDE1EA',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  metricValue: {
    color: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.danger,
  },
  listRow: {
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
    flex: 1,
    gap: spacing.sm,
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
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 72,
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
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  buttonCompact: {
    minHeight: 38,
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
});
