# Expense Control App Context Pack

This folder is the working context for future implementation sessions. It complements the functional requirements document and records how the current Expo app maps to each MVP module.

## Source of truth

- Product requirements: `expense_control_app_mvp_functional_requirements_v_0_1.md`
- App implementation: `mobile/App.tsx`
- Shared types: `mobile/src/types.ts`
- Defaults: `mobile/src/defaults.ts`
- Cash box/category default mapping: `docs/context/15-cash-box-category-map.md`
- Local persistence: `mobile/src/storage.ts`
- Business helpers: `mobile/src/utils.ts`
- Brand system: `mobile/src/theme.ts`

## Context files

- `00-product-architecture.md`: platform, stack, app shell, current status.
- `01-authentication.md`: biometric lock and fallback behavior.
- `02-dashboard.md`: monthly summary, currency grouping, budget overview.
- `03-transactions.md`: transaction form, list, edit, delete, validation.
- `04-categories-subcategories.md`: category hierarchy, defaults, disable behavior.
- `05-payment-methods.md`: payment methods, submethods, defaults, disable behavior.
- `06-installments.md`: installment generation and current edit/delete policy.
- `07-budgets-alerts.md`: monthly budgets and visual status thresholds.
- `08-currencies.md`: multi-currency rules and totals behavior.
- `09-reports-csv-export.md`: reports, filters, CSV export format.
- `10-settings.md`: settings surface and management entry points.
- `11-ui-ux-branding.md`: navigation, layout, brand colors, typography.
- `12-data-storage-entities.md`: persisted data shape and local storage behavior.
- `13-testing-verification.md`: current checks and acceptance scenarios.
- `14-open-decisions-gaps.md`: known gaps and pending decisions.
- `15-cash-box-category-map.md`: source of truth for default cash boxes and expense category mapping.

## Current implementation note

The first MVP slice is intentionally compact. Most UI and handler logic is currently in `mobile/App.tsx`; shared contracts and pure helpers are already separated under `mobile/src`. Future work should split screens and domain actions into smaller files before the app grows much further.
