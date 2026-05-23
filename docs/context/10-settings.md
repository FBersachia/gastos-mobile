# Settings Context

## Requirement

Settings must expose core app behavior such as default currency, biometric lock, category management, payment method management, and CSV export access.

## Current behavior

Implemented in `SettingsScreen`.

Settings currently includes:

- A settings menu with individual buttons for each management area. Language is managed inside Core settings, not as a separate menu item.
- Core settings screen: language selection, default currency update, and biometric lock toggle.
- Monthly budgets screen: monthly budget creation, amount editing, and deletion.
- Categories screen: category creation and category disable, with the expense/income toggle filtering the visible list.
- Subcategories screen: subcategory creation with expense/income parent-category toggle, plus active subcategories grouped by parent-category accordion filtered by the selected type.
- Payment methods screen: payment method creation, payment submethod creation, and payment method disable.

CSV export is currently located in Reports, not Settings.

## Current settings data

Defined in `AppSettings`:

- `defaultCurrency`.
- `language`.
- `biometricLockEnabled`, boolean, default `true`.
- `budgetNearLimitThreshold`, default `0.8`.

`storage.ts` preserves persisted `biometricLockEnabled` when it is boolean and falls back to the default for older/invalid data.

## Known gaps

- CSV export shortcut from Settings is not implemented.
- Category/payment method editing is not implemented.
- Budget threshold configuration is not implemented.
