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

- Add either a payment method or a payment submethod through a segmented creation control, so both ABM forms are not visible at the same time.
- Edit payment method names.
- Edit payment submethods and change their parent payment method.
- Delete payment methods and payment submethods with confirmation. These are soft deletes that set `active=false`.
- Active payment methods and submethods are shown in transaction forms.
- Core settings can mark one active payment submethod as the default payment. New expense forms preselect that submethod and derive its parent payment method.
- Default payment labels follow the active app language in forms, transaction detail, reports, and settings.
- Payment method lists use one expanded submethod list at a time; opening another method collapses the previous one and clears competing inline edit panels.
- Payment methods show a visually distinct list subtitle below the creation form.

## Current behavior

Payment methods and submethods are used only by expense transactions. Income transactions do not require or display payment, and CSV export leaves payment columns blank for income rows.

## Known gaps

- No duplicate-name validation exists.
