# Open Decisions and Gaps Context

## Product decisions still pending

From the requirements document:

- Biometric fallback through PIN/password.
- Full default category and subcategory list.
- Whether cash boxes should become user-managed beyond the fixed default catalog.
- Whether unused categories can be hard deleted.
- Whether payment methods can be restricted by transaction type.
- Editing behavior for installment groups.
- Deleting behavior for installment groups.
- Budget alert thresholds.
- Whether currencies require manual exchange rates.
- Whether dashboard totals should be grouped by currency or converted to default currency.

## Defaults currently chosen in code

- App public name: Inflatrack.
- Biometric lock: optional, default enabled.
- Device passcode fallback: allowed.
- Category deletion: disable only.
- Payment method/submethod deletion: soft delete only.
- Subcategory/person deletion: soft delete only.
- Payment methods: expense transactions only.
- Assigned people: expense transactions only, with reports by assigned person.
- Cash boxes: fixed expense-category groupers for Basic, Fun, Education, Savings, Investment, and Charity. Users can reassign active expense categories to another fixed cash box.
- Installment interest: total percentage applied before splitting.
- Installment rounding: remainder goes to last installment.
- Installment edit: individual generated installments are not editable.
- Installment delete: full group delete.
- Budget near-limit threshold: 80 percent.
- Exchange rates: none.
- Dashboard totals: grouped by currency.

## Implementation gaps by priority

High:

- Split `App.tsx` into screens, components, hooks, and domain actions.
- Broaden automated tests for budgets, storage defaults, and UI flows.
- Add a real date picker and money input handling.
- Validate loaded persisted data before using it.

Medium:

- Add transaction detail screen.
- Add custom date range filters for reports and CSV export.
- Add transaction type/currency filters for monthly export.
- Add custom cash box create/edit/delete management if the product moves beyond the fixed catalog.
- Add CSV export access from Settings.
- Add app-resume biometric locking.

Low:

- Add richer empty states.
- Add charts.
- Add screenshot QA.
- Replace generated Expo placeholder icons with Inflatrack-aligned assets.
