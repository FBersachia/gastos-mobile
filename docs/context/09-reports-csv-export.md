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

Custom date range and previous-month presets are not implemented yet. Month selection is controlled by the global header; report detail headers must not render their own month navigation controls.

## CSV export

Implemented through `transactionsToCsv` in `mobile/src/utils.ts`.

The app keeps transaction dates and audit timestamps as `Date` values in memory. CSV generation serializes transaction dates as `YYYY-MM-DD` and audit timestamps as full ISO datetime strings.

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
- Assigned person.
- Name.
- Description.
- Installment group ID.
- Installment number.
- Total installments.
- Installment interest rate.
- Installment base amount.
- Installment financed total.
- Created date.
- Updated date.

File creation and sharing are handled with:

- `expo-file-system/legacy`.
- `expo-sharing`.

Income rows keep the payment columns empty because income transactions do not use payment methods. Name and description are exported as separate columns.

## Known gaps

- Custom date range export is not implemented.
- Previous-month export shortcut is not implemented.
- There is no export success history.
- Custom report sections for assigned people are not implemented.
