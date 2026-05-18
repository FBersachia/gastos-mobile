# UI, UX, and Branding Context

## Requirement

The app must be simple, fast, mobile-first, low clutter, and optimized for daily transaction registration. The interface language is English.

## Brand system

Defined in `mobile/src/theme.ts`.

Colors:

- Primary red: `#F55252`.
- Alternate red: `#BF0426`.
- Deep blue: `#2B2D42`.
- Black: `#000000`.
- Medium gray: `#9E9E9E`.
- Background: `#F7F8FA`.
- Surface: `#FFFFFF`.

Typography:

- Poppins Regular.
- Poppins Medium.
- Poppins Bold.

## Current UI structure

- Header with app name and selected month.
- Four bottom tabs: Dashboard, Transactions, Reports, Settings.
- Reusable controls in `App.tsx`: `AppButton`, `IconButton`, `Chip`, `Field`, `EmptyState`, `ScreenScroll`.
- Brand red is used for primary actions.
- Deep blue is used for dashboard summary bands.
- Cards use small radius and restrained borders.

## Transaction creation UX

The transaction form is designed to keep common actions on one screen:

- Type selector.
- Amount and currency.
- Category and subcategory.
- Payment method and submethod.
- Date.
- Description.
- Optional installments.
- Save action.

## Known gaps

- Date picker and money input masking are not implemented.
- No formal component library exists yet.
- Screens are not split into dedicated files yet.
- Accessibility labels exist on main buttons, but deeper accessibility review is still needed.
- Empty states are textual only.
