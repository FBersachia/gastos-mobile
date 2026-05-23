# Reports and CSV Export Context

## Requirement

The app must provide basic reports and allow CSV export with filters by date range, transaction type, and currency.

## Current reports

Implemented in `ReportsScreen`.

Current report sections:

- Expenses by category.
- Expenses by payment method.

Monthly balance and income by category are partially represented by dashboard summaries but not yet as separate report sections.

## Current filters

Current CSV filters:

- Selected month.
- Transaction type: all, expenses, income.
- Currency: all or one existing currency.

Custom date range and previous-month presets are not implemented yet. Month selection is controlled by the global header.

## CSV export

Implemented through `transactionsToCsv` in `mobile/src/utils.ts`.

The export includes:

- Transaction ID.
- Date.
- Type.
- Amount.
- Currency.
- Category.
- Subcategory.
- Payment method.
- Payment submethod.
- Description.
- Installment group ID.
- Installment number.
- Total installments.
- Created date.
- Updated date.

File creation and sharing are handled with:

- `expo-file-system/legacy`.
- `expo-sharing`.

Income rows keep the payment columns empty because income transactions do not use payment methods.

## Known gaps

- Custom date range export is not implemented.
- Previous-month export shortcut is not implemented.
- There is no export success history.
- CSV generation is not covered by automated tests.
