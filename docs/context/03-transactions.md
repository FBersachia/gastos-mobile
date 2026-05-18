# Transactions Context

## Requirement

The app must allow manual creation, editing, deletion, listing, and detail viewing for expenses and incomes. Required fields are type, amount, currency, date, category, and payment method.

## Current behavior

Implemented in `TransactionsScreen`, `TransactionForm`, and `TransactionRow` in `mobile/App.tsx`.

Supported fields:

- Type: expense or income.
- Amount.
- Currency.
- Date.
- Category.
- Subcategory.
- Payment method.
- Payment submethod.
- Description.
- Installment count and first installment date for new expenses.

## Validation

The form validates:

- Amount must be numeric and greater than zero.
- Date must match `YYYY-MM-DD`.
- Category is required.
- Payment method is required.
- Installment count must be at least 2 when enabled.

## Creation

`handleSaveTransaction` creates one normal transaction or multiple generated installment transactions.

Each transaction receives:

- Generated id.
- Normalized currency.
- Rounded amount.
- Created and updated timestamps.

## Editing

Editing is currently allowed only for non-installment transactions. The edit flow uses the same `TransactionForm`.

Installment transactions are not individually editable in the current UI.

## Deletion

Deletion uses a confirmation alert.

- Normal transactions delete only the selected transaction.
- Installment transactions delete the full installment group.

## Listing

Transactions are filtered by selected month and sorted newest to oldest through `monthlyTransactions`.

## Known gaps

- There is no separate transaction detail screen yet.
- There is no search or filter UI inside the transaction list.
- Date input is plain text, not a date picker.
- Amount input is plain text, not a masked money field.
- Editing an installment parent purchase and regenerating future installments is not implemented.
