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
- Responsive helpers in `App.tsx` classify mobile widths as compact, regular, or large through `useWindowDimensions`.
- Brand red is used for primary actions.
- Deep blue is used for dashboard summary bands.
- Cards use small radius and restrained borders.
- Settings uses individual menu buttons that open one management screen at a time.

## Responsive behavior

- Compact mobile is width below `360`; regular is `360` to `429`; large mobile is `430` and above.
- Header, bottom navigation, dashboard summary, forms, transaction rows, report rows, settings management rows, expense keypad, calendar, and transaction modals adapt spacing, wrapping, and sizing for compact screens.
- Form grids collapse from two columns to one column on compact screens.
- The expense subcategory grid uses more columns on large mobile and tighter icon sizing on compact mobile.

## Transaction creation UX

The new expense entry screen is designed to keep daily capture on one screen:

- Header with back action and expense title.
- Scrollable subcategory icon grid with specific icons per known subcategory and keyword fallback for custom names.
- Currency, payment, and installment selectors with custom numeric input after subcategory selection.
- Memo row with selected category icon and amount preview.
- Date key that opens an in-app calendar selector.
- Fixed numeric keypad.
- Brand-colored confirm action.

Category rows and category selector chips include an icon, with the category name rendered smaller than the icon.

## Known gaps

- Money input masking is not implemented.
- No formal component library exists yet.
- Screens are not split into dedicated files yet.
- Accessibility labels exist on main buttons, but deeper accessibility review is still needed.
- Empty states are textual only.
