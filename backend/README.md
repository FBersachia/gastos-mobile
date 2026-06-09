# Premium backend

Express service used by the mobile app to verify Google Play Premium purchases.

## Environment

- `GOOGLE_PLAY_PACKAGE_NAME`: defaults to `com.suats.gastoscontrol`.
- `GOOGLE_APPLICATION_CREDENTIALS`: service account JSON path with Android Publisher API access.
- `PORT`: defaults to `3000`.

## Commands

- `npm run dev`
- `npm run typecheck`
- `npm test`

The service does not store purchase tokens, transactions, amounts, categories, or local financial data.
