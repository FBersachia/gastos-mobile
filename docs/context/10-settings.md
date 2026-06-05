# Settings Context

## Requirement

Settings must expose core app behavior such as default currency, biometric lock, category management, payment method management, and CSV export access.

## Current behavior

Implemented in `SettingsScreen`.

Settings currently includes:

- A settings menu with individual buttons for each management area. Language is managed inside Core settings, not as a separate menu item.
- Core settings screen: language selection, manual theme selector, default currency update, default payment submethod selector, and biometric lock toggle.
- Monthly budgets screen: expense subcategory budget creation/editing with the same icon grid used by expense entry. After selecting a subcategory, the grid collapses into a summary row and the amount/currency form takes focus. Budget currency is selected from a dropdown-style selector, not free text. Budgets can be deleted with native/web-compatible confirmation, and legacy category budgets must be assigned to a subcategory before save.
- Categories screen: category creation, edit, expense cash box assignment, optional icon selection, and disable, with the expense/income toggle filtering the creation type and visible list.
- Subcategories screen: subcategory creation, edit, and soft delete with expense/income parent-category toggle, compact parent/icon summary rows after selection, and active subcategories grouped by independent parent-category accordions filtered by selected type. Parent-category accordions can be fully collapsed after opening and are not auto-opened by category selection effects.
- Payment methods screen: segmented creation flow for either payment method or payment submethod, payment method edit/delete, payment submethod edit/delete, and one expanded submethod list at a time.
- People screen: person creation, edit, and soft delete. Active people can be assigned to expense transactions from More options.
- Categories, subcategories, payment methods, and budgets show visually distinct list subtitles below their creation forms.
- About screen: in development only, when `EXPO_PUBLIC_ENABLE_DEV_FIXTURES=1`, shows a secondary action to load the June 2026 monthly-report fixture from a local URL. The fixture data is not imported by the app bundle.

CSV export is currently located in Reports, not Settings.

To use the local dev fixture, run a static server outside the APK flow, for example:

```powershell
python -m http.server 49206 --directory mobile/dev-local
```

On Android emulator the app defaults to `http://10.0.2.2:49206/monthly-report-2026-06.fixture.json`; on web/iOS simulator it defaults to `http://localhost:49206/monthly-report-2026-06.fixture.json`. Physical devices can override the source with `EXPO_PUBLIC_DEV_FIXTURE_URL`.

## Current settings data

Defined in `AppSettings`:

- `defaultCurrency`.
- `defaultPaymentSubmethodId`, optional active payment submethod id used to preselect expense payment.
- `language`.
- `themeMode`, manual UI theme mode. Valid values are `light` and `dark`; default is `light`.
- `biometricLockEnabled`, boolean, default `true`.
- `budgetNearLimitThreshold`, default `0.8`.

`storage.ts` preserves persisted `biometricLockEnabled` when it is boolean and falls back to the default for older/invalid data. It also hydrates missing or invalid `themeMode` values as `light`.

## Known gaps

- CSV export shortcut from Settings is not implemented.
- Cash box create/edit management is not implemented; cash boxes are currently a default catalog used by expense categories.
- Budget threshold configuration is not implemented.
