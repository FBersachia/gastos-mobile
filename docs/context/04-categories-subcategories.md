# Categories and Subcategories Context

## Requirement

The app must support expense and income categories, with subcategories under each category. Used categories should not be hard deleted directly; the preferred MVP behavior is disabling them.

## Current data model

Defined in `mobile/src/types.ts`:

- `Category` has `id`, `name`, `type`, `active`, `createdAt`, `updatedAt`.
- `Subcategory` has `id`, `categoryId`, `name`, `active`, `createdAt`, `updatedAt`.

## Defaults

Created in `mobile/src/defaults.ts`.

Default expense categories:

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

Default income categories:

- Salary.
- Freelance.
- Sales.
- Refunds.
- Other.

Default subcategories are included for common first-use paths such as groceries, fuel, rent, internet, payroll, and projects.

## Current management UI

Implemented in `SettingsScreen`:

- Add category.
- Add subcategory.
- Disable category.
- Active categories are shown in forms and settings.
- Category UI uses lucide icons for default and keyword-matched categories. Category names are displayed smaller than the icon.
- Subcategory UI has its own icon map and keyword fallback, so expense entry and dashboard rows can show more specific icons such as groceries, delivery, breakfast, rides, public transit, laundry, music, soccer, bike insurance, pet food, and payroll.

## Current deletion policy

Hard delete is not exposed. Disable is used for categories.

## Known gaps

- Category edit/rename is not implemented.
- Subcategory disable/edit is not implemented in the UI.
- No validation prevents duplicate names.
- No reassign flow exists for historical transactions.
