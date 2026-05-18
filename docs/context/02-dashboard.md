# Dashboard Context

## Requirement

The dashboard must show the selected month's financial status, defaulting to the current month. It must include income, expenses, balance, expenses by category, budget status, month selection, and a quick action to add a transaction.

## Current behavior

Implemented in `DashboardScreen` in `mobile/App.tsx`.

- Reads `selectedMonth` from app state.
- Uses `monthlyTransactions(data, selectedMonth)` from `mobile/src/utils.ts`.
- Uses `summarizeByCurrency` to produce income, expenses, and balance grouped by currency.
- Uses `summarizeExpensesByCategory` for category totals.
- Uses `summarizeBudgets` for visual budget status.
- Includes an Add action that switches to the Transactions tab.

## Month selection

Implemented in `Header`:

- Displays `monthLabel(selectedMonth)`.
- Previous/next buttons call `shiftMonth(selectedMonth, -1)` or `shiftMonth(selectedMonth, 1)`.
- The stored month format is `YYYY-MM-01`.

## Currency rule

Dashboard totals are not mixed across currencies. Each currency gets its own summary block.

## Known gaps

- No charts yet.
- Category summary is limited to a simple sorted list.
- No empty-state illustration or richer guidance.
- The dashboard does not currently support custom date ranges.
