# Product and Architecture Context

## Product

Expense Control is an Android-first personal finance app for manually tracking expenses and incomes. It is designed for local-only use on a Samsung Galaxy S24 FE or similar Android phone.

The UI language is English. The visual identity uses the Inflatrack palette and Poppins typography.

## Current stack

- Framework: Expo React Native with TypeScript.
- Runtime target: Android through Expo Go or a future native build.
- State: React local state in `App.tsx`.
- Persistence: `@react-native-async-storage/async-storage`.
- Authentication: `expo-local-authentication`.
- CSV file creation/sharing: `expo-file-system/legacy` and `expo-sharing`.
- Icons: `lucide-react-native`.
- Fonts: `@expo-google-fonts/poppins`.

## App structure

- `mobile/App.tsx` owns boot, authentication, tab navigation, screens, handlers, and styles.
- `mobile/src/types.ts` defines all core entities and derived summary types.
- `mobile/src/defaults.ts` creates first-use categories, subcategories, payment methods, submethods, and settings.
- `mobile/src/storage.ts` loads and saves the single local data object.
- `mobile/src/utils.ts` contains date, money, installment, summary, lookup, and CSV helpers.
- `mobile/src/theme.ts` defines brand colors, fonts, radius, and spacing.

## Current navigation

The app uses a simple internal tab state with four tabs:

- Dashboard.
- Transactions.
- Reports.
- Settings.

There is no external navigation library yet. Add one only when screen depth requires stack navigation, modals, or route persistence.

## Implementation status

The app has a functional MVP slice for:

- Biometric gate.
- Local data initialization and persistence.
- Dashboard summaries.
- Create/edit/delete transactions.
- Installment generation.
- Category and payment method management.
- Monthly budgets.
- Basic reports.
- CSV export.

The implementation is not production hardened yet. It needs stronger tests, screen extraction, more polished input controls, and Android device QA.
