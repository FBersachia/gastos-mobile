# Testing and Verification Context

## Current checks

The current implementation has been verified with:

- `npx tsc --noEmit`
- `npx expo-doctor`
- Android bundle request from Metro at `http://localhost:8081/index.bundle?platform=android&dev=true&minify=false`
- May 2026 sample data validation: 69 CSV rows produce 74 transactions, including six generated installments and no missing category/payment references.

At the time of initial implementation, the Android bundle request returned HTTP 200.

## Manual acceptance scenarios

Authentication:

- App blocks access until biometric authentication succeeds.
- Failed authentication keeps financial data hidden.
- Retry action opens authentication again.
- Disabling biometric access in Settings allows the next app start to enter without an authentication prompt.

Dashboard:

- Current month loads by default.
- Previous/next month buttons change the selected month.
- Income, expenses, and balance are grouped by currency.
- Budget rows change visual status based on spending.
- Daily dashboard movement cards show both expenses and income, with expenses as negative amounts and income as positive amounts.

Transactions:

- Create an expense with required fields.
- Create an income with required fields and confirm no payment method is requested or shown.
- Enter an amount using `+` and `-` in the keypad and confirm the saved value matches the calculated result.
- Edit a non-installment transaction.
- Edit a transaction with Transfer or Credit Card payment and confirm saving without payment changes preserves the original payment submethod.
- Delete a transaction after confirmation.
- Create an installment expense and confirm one transaction per month.
- Delete an installment and confirm the full group is removed.
- Confirm the May 2026 default seed shows the salary income, imported expenses, Visa/Amex/Transfer/Cash methods, and generated future installments.
- Confirm the May 2026 default seed does not include the removed drug/cannabis category or related sample transactions.
- Switch language to Spanish and confirm the calendar month, weekday labels, payment defaults, and subcategory/payment lists display in Spanish without renaming stored custom data.

Responsive mobile:

- Verify dashboard, new expense entry, transaction edit/list, reports, and settings at 320x568, 360x640, 390x844, and 430x932.
- Confirm bottom navigation remains usable, forms stay reachable with scroll, and text, buttons, icons, and amounts do not overlap.
- On Android, press hardware Back from transaction detail/edit, Reports detail, Settings detail, and non-dashboard tabs; confirm it navigates back inside the app instead of exiting.

Categories and payment methods:

- Add a category and use it in a transaction.
- Add a subcategory and use it in a transaction.
- In Settings > Subcategories, switch between expense and income and confirm parent category choices update before creating the subcategory.
- In Settings > Categories, switch between expense and income and confirm the visible category list changes.
- Disable a category and confirm it no longer appears in active form choices.
- Add a payment method/submethod and use it in a transaction.

Budgets:

- Add a monthly category budget.
- Add expenses below 80 percent, above 80 percent, and above 100 percent.
- Confirm available, near-limit, and exceeded statuses.
- Switch language to Spanish and confirm budget status/progress text is translated.
- Edit an existing budget and confirm only the amount changes.
- Delete a budget and confirm it is removed after confirmation.

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
