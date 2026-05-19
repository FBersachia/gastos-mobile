# Transactions Context

## Requirement

The app must allow manual creation, editing, deletion, listing, and detail viewing for expenses and incomes. Required fields are type, amount, currency, date, category, and payment method.

## Current behavior

Implemented in `TransactionsScreen`, `TransactionForm`, and `TransactionRow` in `mobile/App.tsx`.

Supported fields:

- Amount.
- Currency selector in the new expense screen and currency input in the fallback form.
- Date.
- New expense subcategory grid with icons. The entry controls stay hidden until a subcategory is selected.
- Payment submethod selector in the new expense screen.
- Description.
- Installment selector in the new expense screen, including suggested values and a custom numeric input.

The default Transactions tab surface is optimized for adding a new expense: header, scrollable subcategory grid, currency, payment and installment controls after subcategory selection, memo row, amount preview, fixed numeric keypad, and an in-app calendar selector opened from the date key.

## Validation

The form validates:

- Amount must be numeric and greater than zero.
- Date must match `YYYY-MM-DD`.
- Subcategory is required.
- Payment submethod is required.
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
- Date input is still plain text in the fallback edit form; the new expense screen has a calendar selector.
- Amount input is plain text, not a masked money field.
- Editing an installment parent purchase and regenerating future installments is not implemented.
