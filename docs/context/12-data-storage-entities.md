# Data Storage and Entities Context

## Requirement

All data must be stored locally on the device. There is no cloud sync, multi-user access, account integration, or web backend in the MVP.

## Current persistence

Implemented in `mobile/src/storage.ts`.

- Storage provider: AsyncStorage.
- Storage key: `expense-control-app-data-v3`.
- Persisted shape: one JSON object equivalent to `AppData`, with `Date` fields serialized as strings.
- `loadAppData` returns defaults when no data exists.
- `withDefaults` merges missing stored sections with default data.
- `withDefaults` tolerates older stored data without a `cashBoxes` section and restores default expense-category `cashBoxId` values when legacy categories are missing them.
- `withDefaults` tolerates older stored data without a `people` section by defaulting it to an empty array.
- `withDefaults` tolerates older settings without `defaultPaymentSubmethodId` and resolves the configured default to an active payment submethod when possible.
- `withDefaults` tolerates older settings without `themeMode`, preserves `light` or `dark`, and falls back to `light` for missing/invalid values.
- `withDefaults` tolerates older settings without `premiumEntitlement`, preserves valid Premium entitlement fields, and falls back to inactive for missing/invalid values.
- `withDefaults` preserves stored `biometricLockEnabled` booleans and defaults older/invalid settings to enabled.
- `withDefaults` preserves legacy category budgets without silently assigning them to a first subcategory; they must be repaired through Settings before saving.
- `loadAppData` hydrates persisted date strings into `Date` values for runtime use.
- `loadAppData` migrates legacy transaction text by moving stored `description` into `name` when `name` is missing, leaving `description` empty.
- `saveAppData` writes the full app data object after mutations and serializes dates before JSON storage.

Current default data note:

- First-run defaults are created by `mobile/src/defaults.ts`.
- Production defaults use `mobile/src/sampleData.ts` only as the source for built-in catalogs and settings.
- First-run defaults must keep user-entered data clean: `transactions: []` and `budgets: []`.
- The May 2026 rows in `mobile/src/sampleData.ts` are demo/fixture data, not product default movements for new builds.
- The default catalogs exclude the removed drug/cannabis subcategory.

## Current entities

Defined in `mobile/src/types.ts`.

- `Transaction`.
- `CashBox`.
- `Category`.
- `Subcategory`.
- `PaymentMethod`.
- `PaymentSubmethod`.
- `Person`.
- `Budget`.
- `AppSettings`.
- `AppData`.

## Current functional entities not persisted separately

- `InstallmentGroup` is represented through transaction fields, not a separate persisted object.
- Reports and dashboard summaries are derived at runtime.

## Data rules

- Runtime transaction dates and selected month use `Date` values.
- Persisted transaction dates are stored as `YYYY-MM-DD` strings.
- Persisted created/updated audit timestamps are stored as full ISO datetime strings.
- Budget month/year are stored as numbers. Budget operations use `subcategoryId` as the only spending scope; `categoryId` is retained only as legacy/derived context.
- Expense categories may store `cashBoxId`; income categories do not use cash boxes. Default cash boxes are Basic, Fun, Education, Savings, Investment, and Charity. The default category mapping is maintained in `docs/context/15-cash-box-category-map.md`. Settings > Cash boxes/Cajas updates the relation by changing `Category.cashBoxId`; the cash box catalog itself remains fixed.
- Currencies are stored as uppercase 3-character strings.
- Default payment is stored as `settings.defaultPaymentSubmethodId`; expenses derive the parent method from the selected submethod.
- Manual UI theme mode is stored as `settings.themeMode`; valid values are `light` and `dark`, with `light` as the default/migration fallback.
- Premium entitlement is stored as `settings.premiumEntitlement`; it is a local cache of Google Play verification state, not a financial record. The app stores active state, Product ID, product type, verification timestamp, and optional subscription expiry.
- Money is rounded to two decimals.
- Installment splitting is done in cents to avoid visible rounding drift.
- `paymentMethodId` and `paymentSubmethodId` are optional on transactions; expenses require them in the UI, incomes leave them empty.
- `assignedPersonId` is optional and currently used only by expenses.
- `name` is the short transaction reference shown in lists and the main entry step.
- `description` is an optional longer note shown in More options/detail/CSV.
- Installment expenses can store `installmentInterestRate`, `installmentBaseAmount`, and `installmentFinancedTotal`.
- Payment methods, payment submethods, subcategories, and people use soft delete through `active=false`; historical transaction references remain in storage.

## Known gaps

- No schema version/migration system exists beyond the storage key.
- No database indexes or query layer exist.
- No import/export restore flow exists.
- No data backup exists.
- No validation library or parser protects loaded JSON.
