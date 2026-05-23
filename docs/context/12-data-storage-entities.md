# Data Storage and Entities Context

## Requirement

All data must be stored locally on the device. There is no cloud sync, multi-user access, account integration, or web backend in the MVP.

## Current persistence

Implemented in `mobile/src/storage.ts`.

- Storage provider: AsyncStorage.
- Storage key: `expense-control-app-data-v3`.
- Persisted shape: one `AppData` JSON object.
- `loadAppData` returns defaults when no data exists.
- `withDefaults` merges missing stored sections with default data.
- `withDefaults` preserves stored `biometricLockEnabled` booleans and defaults older/invalid settings to enabled.
- `withDefaults` normalizes budgets to subcategory budgets when a stored legacy category budget can be matched to an existing subcategory.
- `saveAppData` writes the full app data object after mutations.

Current seed note:

- Defaults are loaded from the May 2026 sample dataset in `mobile/src/sampleData.ts`.
- The seed expands the CSV row marked `6cuotas` into six monthly installment transactions.
- The default seed excludes the removed drug/cannabis subcategory and related sample rows.

## Current entities

Defined in `mobile/src/types.ts`.

- `Transaction`.
- `Category`.
- `Subcategory`.
- `PaymentMethod`.
- `PaymentSubmethod`.
- `Budget`.
- `AppSettings`.
- `AppData`.

## Current functional entities not persisted separately

- `InstallmentGroup` is represented through transaction fields, not a separate persisted object.
- Reports and dashboard summaries are derived at runtime.

## Data rules

- Dates are stored as `YYYY-MM-DD` strings for transactions and selected month.
- Budget month/year are stored as numbers, and new budgets use `subcategoryId` as their scope.
- Currencies are stored as uppercase 3-character strings.
- Money is rounded to two decimals.
- Installment splitting is done in cents to avoid visible rounding drift.
- `paymentMethodId` and `paymentSubmethodId` are optional on transactions; expenses require them in the UI, incomes leave them empty.

## Known gaps

- No schema version/migration system exists beyond the storage key.
- No database indexes or query layer exist.
- No import/export restore flow exists.
- No data backup exists.
- No validation library or parser protects loaded JSON.
