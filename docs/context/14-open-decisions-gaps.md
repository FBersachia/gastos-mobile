# Open Decisions and Gaps Context

## Product decisions still pending

From the requirements document:

- Final app name.
- Biometric fallback through PIN/password.
- Full default category and subcategory list.
- Whether unused categories can be hard deleted.
- Whether payment methods can be restricted by transaction type.
- Editing behavior for installment groups.
- Deleting behavior for installment groups.
- Budget alert thresholds.
- Whether currencies require manual exchange rates.
- Whether dashboard totals should be grouped by currency or converted to default currency.
- Whether biometric lock is mandatory or optional.

## Defaults currently chosen in code

- App working name: Expense Control.
- Biometric lock: mandatory.
- Device passcode fallback: allowed.
- Category deletion: disable only.
- Payment method deletion: disable only.
- Payment methods: usable for both expenses and incomes.
- Installment rounding: remainder goes to last installment.
- Installment edit: individual generated installments are not editable.
- Installment delete: full group delete.
- Budget near-limit threshold: 80 percent.
- Exchange rates: none.
- Dashboard totals: grouped by currency.

## Implementation gaps by priority

High:

- Split `App.tsx` into screens, components, hooks, and domain actions.
- Add automated tests for money, installments, budgets, CSV export, and storage defaults.
- Add a real date picker and money input handling.
- Validate loaded persisted data before using it.

Medium:

- Add transaction detail screen.
- Add category/payment edit flows.
- Add subcategory/payment submethod disable flows.
- Add custom date range filters for reports and CSV export.
- Add CSV export access from Settings.
- Add app-resume biometric locking.

Low:

- Add richer empty states.
- Add charts.
- Add screenshot QA.
- Replace generated Expo placeholder icons with Inflatrack-aligned assets.
