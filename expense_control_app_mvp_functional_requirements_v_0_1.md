# Functional Requirements Document — Expense Control App MVP v0.1

## 1. Document Purpose

This document defines the MVP functional requirements for a personal expense control Android app.

The goal is to create a simple, intuitive mobile app to register, classify, analyze and export personal expenses and incomes from a Samsung S24 FE or equivalent Android device.

The document is intended to be reviewed by the product owner and later used as input for Codex to start the technical development process.

---

## 2. Product Overview

### 2.1 Product Name
Pending definition.

### 2.2 Platform
Android mobile application.

### 2.3 Target Device
Samsung Galaxy S24 FE.

The app must be responsive enough to work correctly on similar Android phones, but the primary reference device for design and testing will be the S24 FE.

### 2.4 Usage Type
Personal use.

### 2.5 Data Storage
All data must be stored locally on the device.

The MVP will not include cloud synchronization, multi-device access, web access or external account integration.

### 2.6 Interface Language
The app interface must be in English.

### 2.7 Visual Identity
The app must use Inflatrack brand colors.

The MVP must use the following Inflatrack brand palette:

- Primary red: `#F55252`.
- Black: `#000000`.
- Medium gray: `#9E9E9E`.
- Deep blue: `#2B2D42`.
- Alternate red: `#BF0426`.

The primary typeface should be Poppins, using Regular, Medium and Bold weights.

---

## 3. MVP Scope

The MVP must allow the user to:

- Access the app using biometric authentication.
- Register expenses manually.
- Register incomes manually.
- Manage categories and subcategories for expenses and incomes.
- Manage payment methods and submethods.
- Register transactions using multiple currencies.
- Divide expenses into monthly installments automatically.
- Define monthly budgets by category.
- Receive visual alerts when a budget is reached or exceeded.
- View basic financial summaries.
- Export transaction data to CSV.

---

## 4. Out of Scope for MVP

The following items are excluded from the MVP:

- Bank account integration.
- Automatic transaction import.
- Cloud synchronization.
- Multi-user access.
- Web version.
- Shared wallets.
- AI-based categorization.
- OCR receipt scanning.
- PDF reports.
- Push notifications.
- Recurring transactions, unless later included in a future version.
- Advanced investment tracking.
- Debt management.
- Tax reports.

---

# 5. Functional Modules

---

## Module 1 — Authentication

### 1.1 Objective
Protect access to the app using biometric authentication.

### 1.2 Functional Requirements

#### FR-AUTH-001 — Biometric Access
The app must require biometric authentication when opened.

Supported biometric methods depend on the Android device capabilities, such as fingerprint or face unlock.

#### FR-AUTH-002 — Device-Level Biometric Dependency
The app must use the biometric configuration already available on the Android device.

The app does not need to manage biometric enrollment.

#### FR-AUTH-003 — Authentication Failure
If biometric authentication fails, the app must allow the user to retry.

#### FR-AUTH-004 — Fallback Access
Pending definition: define whether the app should allow fallback using device PIN, pattern or password.

### 1.3 Acceptance Criteria

- The user cannot access financial data without authenticating.
- The biometric prompt appears when the app is opened.
- Failed biometric authentication does not expose app content.

---

## Module 2 — Dashboard

### 2.1 Objective
Provide a simple summary of the user's current financial situation.

### 2.2 Functional Requirements

#### FR-DASH-001 — Monthly Summary
The dashboard must show a summary for the selected month.

The default month must be the current month.

#### FR-DASH-002 — Summary Values
The dashboard must show:

- Total income.
- Total expenses.
- Monthly balance.
- Expenses by category.
- Budget usage status.

#### FR-DASH-003 — Month Selector
The user must be able to change the selected month.

#### FR-DASH-004 — Quick Action
The dashboard must include a visible action to add a new transaction.

### 2.3 Acceptance Criteria

- The user can understand the month status at a glance.
- The user can quickly access transaction creation.
- The dashboard remains simple and uncluttered.

---

## Module 3 — Transactions

### 3.1 Objective
Allow the user to manually register expenses and incomes.

### 3.2 Transaction Types

The app must support two transaction types:

- Expense.
- Income.

### 3.3 Transaction Fields

Each transaction must contain:

- Transaction type: Expense or Income.
- Amount.
- Currency.
- Date.
- Category.
- Subcategory.
- Payment method.
- Payment submethod.
- Description.
- Installment configuration, only when applicable.

### 3.4 Functional Requirements

#### FR-TRX-001 — Create Transaction
The user must be able to create a new expense or income manually.

#### FR-TRX-002 — Edit Transaction
The user must be able to edit an existing transaction.

#### FR-TRX-003 — Delete Transaction
The user must be able to delete an existing transaction.

Before deletion, the app must ask for confirmation.

#### FR-TRX-004 — Transaction List
The app must provide a transaction list.

The list must allow the user to view transactions ordered by date, from newest to oldest.

#### FR-TRX-005 — Transaction Detail
The user must be able to open a transaction and view its full details.

#### FR-TRX-006 — Transaction Description
The user must be able to add a free-text description to each transaction.

No tags are included in the MVP.

#### FR-TRX-007 — Required Fields
The app must validate required fields before saving a transaction.

Minimum required fields:

- Type.
- Amount.
- Currency.
- Date.
- Category.
- Payment method.

### 3.5 Acceptance Criteria

- The user can register an expense in less than 30 seconds.
- The user can distinguish clearly between expenses and incomes.
- Invalid or incomplete transactions cannot be saved.

---

## Module 4 — Categories and Subcategories

### 4.1 Objective
Allow the user to organize expenses and incomes using categories and subcategories.

### 4.2 Functional Requirements

#### FR-CAT-001 — Category Management
The user must be able to create, edit, delete and disable categories.

#### FR-CAT-002 — Subcategory Management
The user must be able to create, edit, delete and disable subcategories.

#### FR-CAT-003 — Category Type
Each category must belong to one transaction type:

- Expense.
- Income.

#### FR-CAT-004 — Subcategory Association
Each subcategory must belong to one parent category.

#### FR-CAT-005 — Prevent Invalid Deletion
If a category or subcategory is already used in transactions, the app must not delete it directly.

The app should offer one of these options:

- Disable the category.
- Reassign existing transactions to another category.

Preferred MVP behavior: disable instead of hard delete.

#### FR-CAT-006 — Default Categories
The app may include default categories for first use.

Pending definition: define the default category list.

### 4.3 Suggested Default Expense Categories

- Food.
- Transport.
- Housing.
- Services.
- Health.
- Entertainment.
- Shopping.
- Education.
- Subscriptions.
- Other.

### 4.4 Suggested Default Income Categories

- Salary.
- Freelance.
- Sales.
- Refunds.
- Other.

### 4.5 Acceptance Criteria

- The user can organize transactions with at least two hierarchy levels.
- Expense and income categories are clearly separated.
- Used categories are not accidentally lost.

---

## Module 5 — Payment Methods and Submethods

### 5.1 Objective
Allow the user to classify transactions according to how money was paid or received.

### 5.2 Default Payment Methods

The MVP must include the following payment methods:

- Cash.
- Transfer.
- Credit card.
- Debit card.

### 5.3 Functional Requirements

#### FR-PAY-001 — Payment Method Management
The user must be able to create, edit, disable and manage payment methods.

#### FR-PAY-002 — Payment Submethod Management
The user must be able to create, edit, disable and manage payment submethods.

Examples:

- Credit card > Visa BBVA.
- Credit card > Mastercard Galicia.
- Transfer > Mercado Pago.
- Transfer > Bank transfer.
- Cash > Wallet.

#### FR-PAY-003 — Payment Method Type
Payment methods and submethods must be usable for expenses and incomes.

Pending definition: whether the user can restrict a method to expenses only, incomes only or both.

#### FR-PAY-004 — Used Payment Method Handling
If a method or submethod was already used in transactions, it should not be hard deleted.

Preferred MVP behavior: disable instead of hard delete.

### 5.4 Acceptance Criteria

- The user can classify each transaction by method and submethod.
- Default methods are available from first use.
- Used payment methods remain historically consistent.

---

## Module 6 — Installments

### 6.1 Objective
Allow the user to divide an expense into monthly installments automatically.

### 6.2 Functional Requirements

#### FR-INS-001 — Enable Installments
When creating an expense, the user must be able to indicate whether the expense has installments.

Installments apply to expenses only in the MVP.

#### FR-INS-002 — Number of Installments
The user must define the number of installments.

Example: 3, 6, 12.

#### FR-INS-003 — First Installment Date
The user must select the date from which the first installment will be counted.

#### FR-INS-004 — Automatic Monthly Distribution
The app must automatically generate one installment per month, starting from the selected first installment date.

#### FR-INS-005 — Equal Amount Split
By default, the app must divide the total amount into equal installments.

Pending definition: how to handle rounding differences.

Suggested MVP behavior:

- Divide the amount equally.
- Apply any rounding difference to the last installment.

#### FR-INS-006 — Installment Identification
Each generated installment must be identifiable as part of the original expense.

Example:

- Laptop purchase — Installment 1/6.
- Laptop purchase — Installment 2/6.

#### FR-INS-007 — Editing Installment Purchases
Pending definition: decide whether editing one installment affects only that installment or the whole installment group.

Suggested MVP behavior:

- Editing the parent purchase regenerates all unpaid/future installments.
- Editing a single generated installment is not allowed in MVP.

#### FR-INS-008 — Deleting Installment Purchases
Pending definition: decide whether deleting one installment deletes the full group.

Suggested MVP behavior:

- The user deletes the installment group, not isolated installments.

### 6.3 Acceptance Criteria

- The user can register a purchase in installments from one form.
- The app automatically places each installment in the correct month.
- Monthly summaries reflect only the installments assigned to that month.

---

## Module 7 — Budgets and Alerts

### 7.1 Objective
Allow the user to define spending limits and visually detect overspending.

### 7.2 Functional Requirements

#### FR-BUD-001 — Monthly Budget by Category
The user must be able to define a monthly budget for expense categories.

#### FR-BUD-002 — Budget Period
Budgets apply monthly.

#### FR-BUD-003 — Budget Usage Calculation
The app must calculate the total expenses assigned to each category during the selected month.

#### FR-BUD-004 — Budget Status
The app must display budget usage status:

- Available.
- Near limit.
- Exceeded.

#### FR-BUD-005 — Visual Alerts
The app must show visual alerts when a category is near or over budget.

Pending definition: thresholds.

Suggested MVP thresholds:

- Near limit: 80% or more.
- Exceeded: over 100%.

#### FR-BUD-006 — No Push Notifications
The MVP will not include push notifications.

Alerts are only visual inside the app.

### 7.3 Acceptance Criteria

- The user can define a category budget.
- The dashboard reflects budget usage.
- The app clearly indicates when a budget is exceeded.

---

## Module 8 — Currencies

### 8.1 Objective
Allow the user to register transactions in multiple currencies.

### 8.2 Functional Requirements

#### FR-CUR-001 — Currency Management
The app must support multiple currencies.

#### FR-CUR-002 — Transaction Currency
Each transaction must have a selected currency.

#### FR-CUR-003 — Default Currency
The user must define a default currency.

Suggested default: ARS.

#### FR-CUR-004 — Exchange Rates
Pending definition: whether the user wants manual exchange rates.

Suggested MVP behavior:

- No automatic exchange-rate integration.
- Each transaction keeps its original currency.
- Dashboard totals can be filtered by currency.

#### FR-CUR-005 — Multi-Currency Dashboard
If transactions exist in multiple currencies, the dashboard must avoid mixing totals without conversion.

Suggested MVP behavior:

- Show totals grouped by currency.

### 8.3 Acceptance Criteria

- The user can register expenses in different currencies.
- The app does not incorrectly combine currencies without conversion.
- The user can identify totals per currency.

---

## Module 9 — Reports and CSV Export

### 9.1 Objective
Allow the user to review and export financial information.

### 9.2 Functional Requirements

#### FR-REP-001 — Basic Reports
The app must provide basic reports for:

- Expenses by category.
- Income by category.
- Monthly balance.
- Expenses by payment method.

#### FR-REP-002 — Date Filters
The user must be able to filter reports by date range.

Minimum filters:

- Current month.
- Previous month.
- Custom range.

#### FR-REP-003 — CSV Export
The user must be able to export transactions to CSV.

#### FR-REP-004 — CSV Export Filters
The CSV export must allow filters by:

- Date range.
- Transaction type.
- Currency.

#### FR-REP-005 — CSV Columns
The exported CSV must include:

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
- Installment group ID, if applicable.
- Installment number, if applicable.
- Total installments, if applicable.
- Created date.
- Updated date.

### 9.3 Acceptance Criteria

- The user can export data and open it in spreadsheet software.
- Exported data preserves enough detail for external analysis.
- The export respects selected filters.

---

## Module 10 — Settings

### 10.1 Objective
Allow the user to configure core app behavior.

### 10.2 Functional Requirements

#### FR-SET-001 — Default Currency
The user must be able to define the default currency.

#### FR-SET-002 — Biometric Lock
The user must be able to enable or disable biometric lock.

Pending definition: whether disabling biometric access is allowed.

Suggested MVP behavior: biometric lock is mandatory.

#### FR-SET-003 — Manage Categories
The user must be able to access category management from settings.

#### FR-SET-004 — Manage Payment Methods
The user must be able to access payment method management from settings.

#### FR-SET-005 — Data Export
The user must be able to access CSV export from settings or reports.

#### FR-SET-006 — App Language
The MVP language is English only.

No language selector is required.

#### FR-SET-007 — Brand Colors
The app must include Inflatrack visual identity using the defined brand palette and Poppins typography.

---

## Module 11 — UI/UX Guidelines

### 11.1 Objective
Ensure the app is simple, fast and intuitive for daily use.

### 11.2 Design Principles

The app must prioritize:

- Fast transaction registration.
- Clear hierarchy.
- Minimal text.
- Large touch targets.
- Mobile-first layouts.
- One primary action per screen.
- Simple language.
- Clear contrast.
- Low visual clutter.

### 11.3 Main Navigation

Suggested MVP navigation:

- Dashboard.
- Transactions.
- Reports.
- Settings.

### 11.4 Transaction Creation UX

The transaction creation screen must be optimized for speed.

Suggested flow:

1. Select Expense or Income.
2. Enter amount.
3. Select currency.
4. Select category and subcategory.
5. Select payment method and submethod.
6. Select date.
7. Add optional description.
8. Configure installments if applicable.
9. Save.

### 11.5 Visual Style

The app must follow Inflatrack brand identity.

Defined visual inputs:

- Primary color: `#F55252` for accents, buttons and primary actions.
- Secondary color: `#2B2D42` for highlighted backgrounds and strong visual contrast.
- Accent color: `#BF0426` for alternate emphasis when needed.
- Neutral colors: `#000000` for primary text and `#9E9E9E` for secondary text, dividers and supporting UI.
- Background approach: prefer clean white or light neutral surfaces with enough spacing; use deep blue only for selected highlighted areas.
- Font: Poppins Regular, Medium and Bold.

---

# 12. Data Entities — Functional View

## 12.1 Transaction

Represents one financial movement.

Fields:

- id.
- type.
- amount.
- currency.
- date.
- category_id.
- subcategory_id.
- payment_method_id.
- payment_submethod_id.
- description.
- installment_group_id.
- installment_number.
- total_installments.
- created_at.
- updated_at.

## 12.2 Category

Fields:

- id.
- name.
- type.
- active.
- created_at.
- updated_at.

## 12.3 Subcategory

Fields:

- id.
- category_id.
- name.
- active.
- created_at.
- updated_at.

## 12.4 Payment Method

Fields:

- id.
- name.
- active.
- created_at.
- updated_at.

## 12.5 Payment Submethod

Fields:

- id.
- payment_method_id.
- name.
- active.
- created_at.
- updated_at.

## 12.6 Budget

Fields:

- id.
- category_id.
- amount.
- currency.
- month.
- year.
- created_at.
- updated_at.

## 12.7 Installment Group

Fields:

- id.
- original_amount.
- currency.
- first_installment_date.
- total_installments.
- description.
- category_id.
- subcategory_id.
- payment_method_id.
- payment_submethod_id.
- created_at.
- updated_at.

---

# 13. Pending Definitions

The following items must be defined before moving to technical specification:

1. App name.
2. Whether biometric fallback through PIN/password is allowed.
3. Default category and subcategory list.
4. Whether categories can be hard deleted if unused.
5. Whether payment methods can be restricted by transaction type.
6. Rounding behavior for installments.
7. Editing behavior for installment groups.
8. Deleting behavior for installment groups.
9. Budget alert thresholds.
10. Whether currencies require manual exchange rates.
11. Whether dashboard totals should show grouped by currency or converted to default currency.
12. Whether biometric lock is mandatory or optional.

---

# 14. Suggested MVP Priority

## Priority 1 — Core Use

- Biometric access.
- Local database.
- Create/edit/delete transactions.
- Categories and subcategories.
- Payment methods and submethods.
- Multiple currencies.

## Priority 2 — Expense Planning

- Installments.
- Monthly budgets.
- Visual budget alerts.

## Priority 3 — Analysis

- Dashboard.
- Basic reports.
- CSV export.

## Priority 4 — Polish

- Inflatrack visual identity.
- Improved UX details.
- Empty states.
- Error states.
- Confirmation messages.

---

# 15. Initial User Stories

## US-001 — Open App Securely
As a user, I want to open the app using biometric authentication so that my financial data remains private.

## US-002 — Register an Expense
As a user, I want to register an expense manually so that I can track where my money goes.

## US-003 — Register an Income
As a user, I want to register an income manually so that I can calculate my monthly balance.

## US-004 — Classify Transactions
As a user, I want to assign categories and subcategories to transactions so that I can analyze my spending and income structure.

## US-005 — Select Payment Method
As a user, I want to assign a payment method and submethod to each transaction so that I can understand how I pay or receive money.

## US-006 — Create Installment Expense
As a user, I want to enter a purchase in installments once and let the app distribute it monthly so that my monthly expense view is accurate.

## US-007 — Set Category Budget
As a user, I want to define a monthly budget by category so that I can control overspending.

## US-008 — Export CSV
As a user, I want to export transactions to CSV so that I can analyze my data externally.

---

# 16. Version Notes

## v0.1
Initial functional requirements document based on MVP definition.
