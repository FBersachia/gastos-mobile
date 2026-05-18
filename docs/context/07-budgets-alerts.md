# Budgets and Alerts Context

## Requirement

The app must support monthly budgets by expense category and visually show available, near-limit, or exceeded status.

## Current data model

Defined in `mobile/src/types.ts`:

- `Budget` has `id`, `categoryId`, `amount`, `currency`, `month`, `year`, `createdAt`, `updatedAt`.
- `BudgetSummary` adds category name, spent amount, usage, and status.

## Current behavior

Implemented in `SettingsScreen`, `DashboardScreen`, and `summarizeBudgets`.

- Budgets are created or updated from Settings for the currently selected month.
- Budgets are category and currency specific.
- Spending is calculated from selected-month expense transactions matching category and currency.
- Dashboard and Settings both show budget status rows.

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
- Budget deletion is not implemented.
- No budget history or carry-over exists.
- No automated tests cover budget status boundaries.
