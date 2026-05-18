# Settings Context

## Requirement

Settings must expose core app behavior such as default currency, biometric lock, category management, payment method management, and CSV export access.

## Current behavior

Implemented in `SettingsScreen`.

Settings currently includes:

- Default currency update.
- Biometric lock status message.
- Monthly budget creation and update.
- Category creation.
- Subcategory creation.
- Category disable.
- Payment method creation.
- Payment submethod creation.
- Payment method disable.

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
