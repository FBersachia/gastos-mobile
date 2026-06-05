# UI, UX, and Branding Context

## Requirement

The app must be simple, fast, mobile-first, low clutter, and optimized for daily transaction registration. The interface supports English and Spanish Argentina.

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
- Three bottom tabs: Dashboard, Reports, Settings. Transaction creation is opened from the Dashboard `+` action.
- Reusable controls in `App.tsx`: `AppButton`, `IconButton`, `Chip`, `Field`, `EmptyState`, `ScreenScroll`.
- Responsive helpers in `App.tsx` classify mobile widths as compact, regular, or large through `useWindowDimensions`.
- Brand red is used for primary actions.
- Deep blue is used for dashboard summary bands.
- Cards use small radius and restrained borders.
- Settings uses individual menu buttons that open one management screen at a time.

## Settings management UX patterns

Settings management screens should stay low-clutter and progressive:

- Show one primary creation task at a time. When two ABM flows are mutually exclusive, use a segmented control instead of rendering both forms.
- Collapse resolved selectors into summary rows with `Edit` or `Change` actions, such as selected parent category, selected icon, or selected budget subcategory.
- Keep list headings visually distinct with `listSectionTitle` so creation/edit forms and existing records do not blend together.
- Keep only one nested list/accordion expanded in a group when multiple expanded lists would compete for attention.
- Prefer inline editing only when the edit surface follows the same compact flow as creation.
- Use native `Alert.alert` for destructive confirmations and a web-compatible `window.confirm` fallback when running on Expo web.

## Responsive behavior

- Compact mobile is width below `360`; regular is `360` to `429`; large mobile is `430` and above.
- Header, bottom navigation, dashboard summary, forms, transaction rows, report rows, settings management rows, expense keypad, calendar, and transaction modals adapt spacing, wrapping, and sizing for compact screens.
- Form grids collapse from two columns to one column on compact screens.
- The expense subcategory grid uses more columns on large mobile and tighter icon sizing on compact mobile. Subcategory labels can wrap to two lines so common names such as "Cuidado Personal" and "Comida mascotas" remain readable. The same icon grid is reused for monthly budget subcategory selection, then collapses once a subcategory is selected so only the budget form remains.
- The edit transaction flow keeps category/subcategory collapsed by default to prioritize amount and memo edits.
- Settings subcategories are grouped under parent-category accordions so unrelated subcategories are not mixed in one list.
- Reports detail headers show only the back action and report title; month navigation stays in the global header to avoid duplicate controls.
- Android hardware back navigates inside the app: detail/edit modals close, report/settings detail screens go back to their menu, and top-level tabs return to Dashboard instead of exiting.
- Android keeps the root safe area free of the bottom inset to avoid duplicated blank space. Bottom navigation consumes the Android bottom inset only on API 35+ where Android enforces edge-to-edge for target SDK 35; older Android versions keep zero bottom inset. iOS still uses the bottom inset.
- Android must not wrap the full app shell and bottom navigation in a global `KeyboardAvoidingView`; keyboard avoidance stays iOS-only because Android already uses `softwareKeyboardLayoutMode: "pan"` and global keyboard offsets can leave sporadic blank space below the bottom tabs.

## Transaction creation UX

The new expense entry screen is designed to keep daily capture on one screen:

- Header with back action and expense title.
- Scrollable subcategory icon grid with specific icons per known subcategory and keyword fallback for custom names.
- Payment selector after subcategory selection, using the configured default when available. Currency and installments live in More options.
- Composer row with icon-only More options, selected subcategory context, reference input, and amount preview.
- The amount preview formats simple numeric values with Argentine dot thousands separators and no decimals while keeping the underlying keypad input unmasked.
- Date key that opens an in-app calendar selector.
- Fixed numeric keypad.
- Brand-colored confirm action.
- The keypad delete key uses the lucide `Delete` icon to match a backspace-style affordance.

Category rows and category selector chips include an icon, with the category name rendered smaller than the icon. User-selected category icons take precedence over default and keyword-matched icons.

## Known gaps

- Money input masking is not implemented.
- No formal component library exists yet.
- Screens are not split into dedicated files yet.
- Accessibility labels exist on main buttons, but deeper accessibility review is still needed.
- Empty states are textual only.
