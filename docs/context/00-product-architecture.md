# Product and Architecture Context

## Product

Inflatrack is an Android-first personal finance app for manually tracking expenses and incomes. It is designed for local-only use on a Samsung Galaxy S24 FE or similar Android phone.

The app supports English and Spanish Argentina. The visual identity uses the Inflatrack palette and Poppins typography.

## Current stack

- Framework: Expo React Native with TypeScript.
- Runtime target: Android through Expo Go for development, APK for internal testing, and AAB for Google Play release.
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

The app uses a simple internal tab state with three visible bottom tabs:

- Dashboard.
- Reports.
- Settings.

Transactions remains an internal full-screen surface opened from the Dashboard floating `+` action, not a bottom navigation tab.

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
- CSV/PDF export.

The implementation is preparing for Google Play release. Large internal refactors such as screen extraction remain useful, but Play Store readiness is evaluated by release artifacts, permissions, privacy disclosures, core workflow QA, and Android device validation.
