# Testing and Verification Context

## Current checks

The current implementation has been verified with:

- `npx tsc --noEmit`
- `npx expo-doctor`
- Android bundle request from Metro at `http://localhost:8081/index.bundle?platform=android&dev=true&minify=false`
- May 2026 sample data validation: 72 CSV rows produce 77 transactions, including six generated installments and no missing category/payment references.

At the time of initial implementation, the Android bundle request returned HTTP 200.

## Manual acceptance scenarios

Authentication:

- App blocks access until biometric authentication succeeds.
- Failed authentication keeps financial data hidden.
- Retry action opens authentication again.

Dashboard:

- Current month loads by default.
- Previous/next month buttons change the selected month.
- Income, expenses, and balance are grouped by currency.
- Budget rows change visual status based on spending.

Transactions:

- Create an expense with required fields.
- Create an income with required fields.
- Edit a non-installment transaction.
- Delete a transaction after confirmation.
- Create an installment expense and confirm one transaction per month.
- Delete an installment and confirm the full group is removed.
- Confirm the May 2026 default seed shows the salary income, imported expenses, Visa/Amex/Transfer/Cash methods, and generated future installments.

Categories and payment methods:

- Add a category and use it in a transaction.
- Add a subcategory and use it in a transaction.
- Disable a category and confirm it no longer appears in active form choices.
- Add a payment method/submethod and use it in a transaction.

Budgets:

- Add a monthly category budget.
- Add expenses below 80 percent, above 80 percent, and above 100 percent.
- Confirm available, near-limit, and exceeded statuses.

CSV export:

- Export all selected-month transactions.
- Export only expenses.
- Export only income.
- Export one currency.
- Confirm CSV columns match requirements.

## Known gaps

- No automated unit tests yet.
- No component tests yet.
- No Android device QA record yet.
- No screenshot or visual regression checks yet.
- `npm audit` reports moderate Expo/Metro/PostCSS issues; npm suggests an incompatible major Expo change, so no automated audit fix was applied.
