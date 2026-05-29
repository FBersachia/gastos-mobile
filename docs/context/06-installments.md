# Installments Context

## Requirement

The app must allow expenses to be split into monthly installments. Generated installments must be associated with the original purchase and counted in the correct monthly summaries.

## Current behavior

Implemented in `TransactionForm`, `handleSaveTransaction`, and `TransactionRow`.

- Installments are available only for new expense transactions.
- User enables installments with a checkbox.
- User enters installment count from More options. The first installment date is the selected transaction date.
- User can enter an optional total interest percentage from More options.
- `splitInstallmentsWithInterest(total, count, interestRate)` applies the total interest once and then splits the financed total.
- `splitInstallments(total, count)` divides the total amount in cents.
- Any rounding remainder is applied to the last installment.
- `addMonths(firstInstallmentDate, index)` assigns one `Date` value to each monthly installment.
- Generated transaction names include `Installment N/Total`.
- Generated transactions share `installmentGroupId`.
- Generated transactions include `installmentNumber` and `totalInstallments`.
- Generated transactions include `installmentInterestRate`, `installmentBaseAmount`, and `installmentFinancedTotal` when interest/installment metadata applies.

## Current edit/delete policy

- Individual installment editing is not allowed in the UI.
- Deleting one installment deletes the full group.
- Regenerating future installments from a parent purchase is not implemented.

## Current summary behavior

Monthly summaries include only installments whose generated `Date` falls in the selected month.

## Known gaps

- There is no separate `InstallmentGroup` entity persisted yet.
- There is no parent purchase detail screen.
- No validation exists for end-of-month date rollover behavior.
- No unpaid/future installment concept exists yet.
