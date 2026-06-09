# Reports and CSV Export Context

## Requirement

The app must provide basic reports and allow CSV export with filters by date range, transaction type, and currency.

## Current reports

Implemented in `ReportsScreen`.

Current report sections:

- Expenses by parent payment method.
- Expenses by payment submethod.
- Expenses by cash box.
- Expenses by category.
- Expenses by assigned person.
- Expenses by subcategory.
- Active installment plans.
- Monthly export.

The parent payment method report groups expenses by `paymentMethodId + currency`; when an older expense only has `paymentSubmethodId`, the parent method is resolved from that submethod. The drill-down includes all expenses for the selected method, including expenses from its submethods.

Monthly balance is represented in dashboard summaries and in the exported monthly report. Income by category is not yet a dedicated report screen.

## Current export scope

Report screens and exports use the selected month from the global header. Custom date range, transaction type filters, currency filters, and previous-month presets are not implemented yet. Report detail headers must not render their own month navigation controls.

## CSV and PDF export

Implemented through `transactionsToCsv`, `monthlyReportToCsv`, and `monthlyReportToHtml` in `mobile/src/utils.ts`.

The app keeps transaction dates and audit timestamps as `Date` values in memory. CSV generation serializes transaction dates as `YYYY-MM-DD` and audit timestamps as full ISO datetime strings.

The transaction CSV includes:

- Transaction ID.
- Date.
- Type.
- Amount.
- Currency.
- Cash box.
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

The monthly report CSV/PDF includes monthly totals, expenses by cash box, expenses by category, income by category, expenses by parent payment method, expenses by payment submethod, expenses by assigned person, and selected-month transaction rows for both expenses and income.

The monthly PDF is grouped by currency. The default currency is rendered first and the remaining currencies are ordered alphabetically. Each currency block has separated tables for totals, cash boxes, expense categories, income categories, parent payment methods, payment submethods, assigned people, and movements. PDF money values use Argentine separators (`ARS 1.234`, `ARS 1.234,50`); CSV amount values remain numeric for spreadsheet use.

Monthly report headers, section labels, transaction type labels, empty-person labels, and default catalog names use the selected app language (`en` or `es-AR`). Custom user-entered names are exported as entered.

File creation and sharing are handled with:

- `expo-file-system/legacy`.
- `expo-print` for PDF generation.
- `expo-sharing`.

Income rows keep the payment columns empty because income transactions do not use payment methods. Name and description are exported as separate columns.

## Known gaps

- Custom date range export is not implemented.
- Transaction type and currency export filters are not implemented.
- Previous-month export shortcut is not implemented.
- There is no export success history.
