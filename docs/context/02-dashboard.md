# Dashboard Context

## Requirement

The dashboard must show the selected month's financial status, defaulting to the current month. It must include income, expenses, balance, month selection, a quick action to add a transaction, and a main list containing the selected month's movements.

## Current behavior

Implemented in `DashboardScreen` in `mobile/App.tsx`.

- Reads `selectedMonth` from app state.
- Uses `monthlyTransactions(data, selectedMonth)` from `mobile/src/utils.ts`.
- Uses `summarizeByCurrency` to produce income, expenses, and balance grouped by currency.
- Groups selected-month transactions by date.
- Each date group shows movement totals by currency and rows with category icon, title, signed amount, and income/expense color.
- Includes a floating Add action that switches to the Transactions tab.

## Month selection

Implemented in `Header`:

- Displays `monthLabel(selectedMonth)`.
- Previous/next buttons call `shiftMonth(selectedMonth, -1)` or `shiftMonth(selectedMonth, 1)`.
- The stored month format is `YYYY-MM-01`.

## Currency rule

Dashboard totals are not mixed across currencies. Each currency gets its own summary block.

## Known gaps

- No charts yet.
- No empty-state illustration or richer guidance.
- The dashboard does not currently support custom date ranges.
