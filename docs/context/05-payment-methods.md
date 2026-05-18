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

## Current management UI

Implemented in `SettingsScreen`:

- Add payment method.
- Add payment submethod.
- Disable payment method.
- Active payment methods and submethods are shown in transaction forms.

## Current behavior

Payment methods and submethods are usable for both expenses and incomes. There is no transaction-type restriction.

## Known gaps

- Payment method edit/rename is not implemented.
- Payment submethod edit/disable is not implemented in the UI.
- No duplicate-name validation exists.
- The product decision for expense-only, income-only, or both is still pending in the requirements.
