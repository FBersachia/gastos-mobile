# Settings Context

## Requirement

Settings must expose core app behavior such as default currency, biometric lock, category management, payment method management, and CSV export access.

## Current behavior

Implemented in `SettingsScreen`.

Settings currently includes:

- A settings menu with individual buttons for each management area.
- Core settings screen: default currency update and biometric lock status message.
- Monthly budgets screen: monthly budget creation and update.
- Categories screen: category creation and category disable.
- Subcategories screen: subcategory creation and active subcategory listing.
- Payment methods screen: payment method creation, payment submethod creation, and payment method disable.

CSV export is currently located in Reports, not Settings.

## Current settings data

Defined in `AppSettings`:

- `defaultCurrency`.
- `biometricLockEnabled`, fixed to `true`.
- `budgetNearLimitThreshold`, default `0.8`.

`storage.ts` forces `biometricLockEnabled: true` when loading persisted data.

## Known gaps

- There is no language selector, matching MVP scope.
- There is no biometric lock toggle, matching current mandatory policy.
- CSV export shortcut from Settings is not implemented.
- Category/payment method editing is not implemented.
- Budget threshold configuration is not implemented.
