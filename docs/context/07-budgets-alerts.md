# Budgets and Alerts Context

## Requirement

The app must support monthly budgets by expense subcategory and visually show available, near-limit, or exceeded status.

## Current data model

Defined in `mobile/src/types.ts`:

- `Budget` has `id`, required operational `subcategoryId`, optional legacy/derived `categoryId`, `amount`, `currency`, `month`, `year`, `createdAt`, `updatedAt`.
- `BudgetSummary` adds category name, subcategory name, `requiresSubcategory`, spent amount, usage, and status.

## Current behavior

Implemented in `SettingsScreen` and `summarizeBudgets`.

- Budgets are created, edited, or deleted from Settings for the currently selected month.
- New budgets are subcategory and currency specific, and saving always requires a concrete expense subcategory.
- Editing a valid budget can change subcategory, currency, or amount; month and year remain fixed to the selected month.
- The budget subcategory icon grid is shown only while choosing a subcategory. After selection, the grid collapses into a summary row with a `Change subcategory` action and the amount/currency form remains in focus.
- Spending is calculated from selected-month expense transactions matching subcategory and currency.
- Stored legacy category budgets without `subcategoryId` are not auto-assigned to a first subcategory. They remain visible in Settings as repairable rows and must be assigned to a subcategory before saving.
- Budget calculations never fall back to category-level spending.
- Budget deletion uses a destructive confirmation that works in native builds and Expo web.
- Settings shows budget status rows; Dashboard currently does not render legacy budgets without subcategory.

## Thresholds

The current threshold is stored in `settings.budgetNearLimitThreshold`.

- Available: below 80 percent.
- Near limit: 80 percent or more.
- Exceeded: over 100 percent.

## Visual alerts

Budget rows use color-coded progress bars:

- Green for available.
- Warning color for near limit.
- Brand dark red for exceeded.

No push notifications are implemented, matching MVP scope.

## Known gaps

- Budget threshold is not configurable in the UI.
- No budget history or carry-over exists.
- No automated tests cover budget status boundaries.
