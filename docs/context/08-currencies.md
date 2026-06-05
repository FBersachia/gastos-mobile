# Currencies Context

## Requirement

The app must support multiple currencies and avoid combining totals without conversion.

## Current behavior

Implemented across `TransactionForm`, `DashboardScreen`, `ReportsScreen`, and `utils.ts`.

- Every transaction stores a `currency` string.
- Currency input is normalized by `normalizeCurrency`.
- The default currency is stored in settings and defaults to `ARS`.
- Dashboard summaries are grouped by currency.
- Category, payment, and budget summaries stay currency-aware.
- CSV export includes the original currency per transaction.
- Visible money amounts use Argentine-style grouping with dot thousands separators and no decimals, for example `ARS 2.250.000`.

## Current policy

There is no exchange-rate integration. The app keeps original transaction currencies and avoids conversion.
Visible formatting does not change stored amounts, calculations, or CSV numeric exports.

## Known gaps

- Currency selection is plain text, not a curated selector.
- No manual exchange-rate table exists.
- No conversion to default currency exists.
- No validation confirms ISO currency codes beyond trimming, uppercasing, and length limiting.
