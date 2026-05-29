# Testing and Verification Context

## Current checks

The current implementation has been verified with:

- `npx tsc --noEmit`
- `npm test` using Vitest for pure helper coverage.
- `npx expo-doctor`
- Local Android release APK build with Gradle using JDK 17 and the local Android SDK.
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
- The bottom navigation does not show Movements/Transactions; transaction creation opens from the Dashboard `+` action.

Transactions:

- Create an expense with required fields.
- Configure a default payment submethod in Settings > Core settings and confirm new expenses preselect it.
- Create an income with the same grid/keypad flow used by expenses and confirm no payment method is requested or shown.
- Open More options and confirm currency and description save for expenses and incomes.
- Enter a transaction reference in the main step and confirm it appears as the transaction title while the selected subcategory remains visible.
- Create an expense with installments and total interest, then confirm the financed total is split across monthly transactions.
- Assign a person to an expense and confirm it appears in transaction detail/list metadata and CSV export.
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
- In Reports detail screens, confirm only the global header has month navigation controls.
- On Android API 35+ with 3-button navigation, confirm the system navigation bar does not cover bottom tab icons or labels.
- On Android API 35+ with gesture navigation, confirm the bottom tab bar is usable without an excessive blank strip below it.
- On Android API 34 or lower, confirm the old duplicated bottom gap does not return.
- On Android, open the expense form, focus and close text inputs, return to Dashboard, and confirm no blank space remains below the bottom tabs.
- On Android, press hardware Back from transaction detail/edit, Reports detail, Settings detail, and non-dashboard tabs; confirm it navigates back inside the app instead of exiting.

Categories and payment methods:

- Add and edit a category with a selected icon, then use it in a transaction and confirm the chosen icon is shown.
- Add and edit a subcategory, then use it in a transaction.
- Delete a subcategory and confirm it disappears from active choices while historical transactions still show its name.
- In Settings > Subcategories, switch between expense and income and confirm parent category choices update before creating the subcategory.
- In Settings > Subcategories, confirm parent category and icon selectors collapse into summary rows after selection in both create and edit flows.
- In Settings > Categories, switch between expense and income and confirm the visible category list changes.
- In Settings > Categories, confirm the category icon selector collapses into a summary row after selection in both create and edit flows.
- In Settings > Categories and Settings > Subcategories, confirm visually distinct list subtitles separate creation forms from existing records.
- Disable a category and confirm it no longer appears in active form choices.
- Add and edit a payment method/submethod and use it in a transaction.
- Delete a payment method/submethod and confirm it disappears from active choices while historical transactions still show its name.
- In Settings > Payment methods, confirm the segmented control shows either the new method form or the new submethod form, not both.
- In Settings > Payment methods, expand one method's submethod list, then another, and confirm only one list remains open.
- In Settings > Payment methods, confirm the list subtitle separates the creation form from existing methods.
- Add, edit, and delete a person in Settings > People.

Budgets:

- Add a monthly expense subcategory budget from the icon grid and confirm amount/currency inputs appear only after selecting a subcategory.
- Select budget currency from the dropdown selector, not from free-text input.
- Confirm the budget subcategory icon grid collapses after selection and the selected subcategory appears as a summary row with a change action.
- Add expenses below 80 percent, above 80 percent, and above 100 percent.
- Confirm available, near-limit, and exceeded statuses.
- Confirm spending from sibling subcategories does not affect the selected subcategory budget.
- Edit a budget, change its subcategory and currency, and confirm it updates without creating duplicates.
- Confirm a legacy category budget without subcategory is shown as requiring subcategory selection and cannot be saved until one is chosen.
- Switch language to Spanish and confirm budget status/progress text is translated.
- Edit an existing budget and confirm the icon grid scrolls into view with the current selection loaded.
- Confirm the budget list subtitle separates the budget form from existing budgets.
- Delete a budget and confirm it is removed after confirmation in native builds and Expo web.

Local Android APK builds:

- `mobile/android` can produce an internal APK with `.\gradlew.bat clean assembleRelease` when `JAVA_HOME` points to JDK 17 and `ANDROID_HOME` / `ANDROID_SDK_ROOT` point to the local SDK.
- Native Android `versionName` and `versionCode` are read from `mobile/app.json`.
- Release APK filenames include the current `versionName` and `versionCode`.
- Native edge-to-edge flags stay disabled to match `app.json`; React Native still applies the bottom navigation inset on Android API 35+ where system bars can cover tappable UI.
- Internal release APKs use the project debug keystore; do not commit production signing credentials or generated APK artifacts.

CSV export:

- Export all selected-month transactions.
- Export only expenses.
- Export only income.
- Export one currency.
- Confirm CSV columns match requirements.
- Confirm CSV exports Name and Description as separate columns.

## Known gaps

- No component tests yet.
- No Android device QA record yet.
- No screenshot or visual regression checks yet.
- `npm audit` reports moderate Expo/Metro/PostCSS issues; npm suggests an incompatible major Expo change, so no automated audit fix was applied.
