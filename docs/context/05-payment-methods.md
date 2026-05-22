# Payment Methods Context

## Requirement

The app must classify transactions by payment method and optional payment submethod. Default methods are Cash, Transfer, Credit card, and Debit card.

## Current data model

Defined in `mobile/src/types.ts`:

- `PaymentMethod` has `id`, `name`, `active`, `createdAt`, `updatedAt`.
- `PaymentSubmethod` has `id`, `paymentMethodId`, `name`, `active`, `createdAt`, `updatedAt`.

## Defaults

Created in `mobile/src/defaults.ts`.

Default payment methods:

- Cash.
- Transfer.
- Credit card.
- Debit card.

Default payment submethods:

- Cash > Wallet.
- Transfer > Mercado Pago.
- Transfer > Bank transfer.
- Credit card > Visa.
- Credit card > Mastercard.
- Debit card > Bank debit.

Built-in default payment method and submethod names are stored in English and translated at display time by stable id when the app language changes. User-created or renamed payment data is shown exactly as stored.

## Current management UI

Implemented in `SettingsScreen`:

- Add payment method.
- Add payment submethod.
- Disable payment method.
- Active payment methods and submethods are shown in transaction forms.
- Default payment labels follow the active app language in forms, transaction detail, reports, and settings.

## Current behavior

Payment methods and submethods are usable for both expenses and incomes. There is no transaction-type restriction.

## Known gaps

- Payment method edit/rename is not implemented.
- Payment submethod edit/disable is not implemented in the UI.
- No duplicate-name validation exists.
- The product decision for expense-only, income-only, or both is still pending in the requirements.
