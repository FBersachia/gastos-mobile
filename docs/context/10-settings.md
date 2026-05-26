# Settings Context

## Requirement

Settings must expose core app behavior such as default currency, biometric lock, category management, payment method management, and CSV export access.

## Current behavior

Implemented in `SettingsScreen`.

Settings currently includes:

- A settings menu with individual buttons for each management area. Language is managed inside Core settings, not as a separate menu item.
- Core settings screen: language selection, default currency update, and biometric lock toggle.
- Monthly budgets screen: expense subcategory budget creation/editing with the same icon grid used by expense entry. After selecting a subcategory, the grid collapses into a summary row and the amount/currency form takes focus. Budgets can be deleted with native/web-compatible confirmation, and legacy category budgets must be assigned to a subcategory before save.
- Categories screen: category creation, edit, and disable, with the expense/income toggle filtering the creation type and visible list.
- Subcategories screen: subcategory creation and edit with expense/income parent-category toggle, compact parent/icon summary rows after selection, and active subcategories grouped by independent parent-category accordions filtered by selected type. Parent-category accordions can be fully collapsed after opening and are not auto-opened by category selection effects.
- Payment methods screen: segmented creation flow for either payment method or payment submethod, payment method edit/disable, payment submethod edit, and one expanded submethod list at a time.
- Categories, subcategories, payment methods, and budgets show visually distinct list subtitles below their creation forms.

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
- Subcategory disable and payment submethod disable are not implemented.
- Budget threshold configuration is not implemented.
