# Transactions Context

## Requirement

The app must allow manual creation, editing, deletion, listing, and detail viewing for expenses and incomes. Required fields are type, amount, currency, date, category, and subcategory. Payment method is required only for expenses.

## Current behavior

Implemented in `TransactionsScreen`, `TransactionForm`, and `TransactionRow` in `mobile/App.tsx`.

Supported fields:

- Amount.
- Currency, managed from the More options modal.
- Date.
- Expense and income subcategory grid with icons. Entry controls stay hidden until a subcategory is selected.
- Payment submethod selector in the main expense flow, preselected from the default payment setting when available. Income creation does not ask for payment.
- Transaction reference (`name`), shown in the main creation step beside the amount composer.
- Description, managed only from More options.
- Installment selector in More options for new expenses, including suggested values and a custom numeric input.
- Optional assigned person for expense transactions.
- Optional total installment interest percentage for new expense installments.
- Numeric keypad with inline addition and subtraction support for quick amount calculation.

The transaction creation surface is opened from Dashboard's `+` action, not from a bottom navigation tab. It uses the same compact creation experience for expenses and incomes: header, scrollable subcategory grid, icon-only More options button at the left of the composer, selected-subcategory context, reference input, amount preview, fixed numeric keypad, and an in-app calendar selector opened from the date key. Expenses keep payment selection visible in the main flow because it is required.

The in-app calendar follows the active app language. Spanish uses localized month/day labels and a Monday-first week.

## Validation

The form validates:

- Amount must be numeric and greater than zero.
- Amount can be entered as a simple `+`/`-` expression and is evaluated before saving.
- Fallback date text input must match `YYYY-MM-DD`; saved transaction dates are `Date` values in memory.
- Subcategory is required.
- Payment submethod is required only for expenses.
- Installment count must be at least 2 when enabled.
- Installment interest must be zero or a positive number when installments are enabled.

## Creation

`handleSaveTransaction` creates one normal transaction or multiple generated installment transactions.

Each transaction receives:

- Generated id.
- Normalized currency.
- Rounded amount.
- `Date` transaction date.
- Created and updated `Date` timestamps.
- Optional `assignedPersonId` for expenses.
- `name` for the transaction title.
- `description` for optional notes.
- Optional installment interest, base amount, and financed total for installment expenses.

## Editing

Editing is currently allowed only for non-installment transactions. Expense editing uses a compact selected-subcategory row by default, with grouped category/subcategory choices opened only when the user taps the row.

When editing, the existing payment method, submethod, name, description, currency, and assigned person are preserved unless the user explicitly changes them.

Income transactions do not display payment in lists, detail, or CSV export. Older income rows that still have payment data are preserved on load, but saving an edited income clears payment fields.

Installment transactions are not individually editable in the current UI.

## Deletion

Deletion uses a confirmation alert.

- Normal transactions delete only the selected transaction.
- Installment transactions delete the full installment group.

## Listing

Transactions are filtered by selected month `Date` and sorted newest to oldest through `monthlyTransactions`.

Transaction rows use `name` as the primary title. The full subcategory remains visible as metadata, and description appears only as secondary detail when present.

## Known gaps

- There is no separate transaction detail screen yet.
- There is no search or filter UI inside the transaction list.
- Amount input is plain text, not a masked money field.
- Editing an installment parent purchase and regenerating future installments is not implemented.
