# Play Store Readiness Review - Inflatrack

Date: 2026-06-09
Branch: `mvp`
Release candidate: `1.0.16` / `versionCode` 17
Application ID: `com.suats.gastoscontrol`
Account type assumed: Google Play organization account

## Current Status

- Status: Not ready for production submission until external Play Console and public policy tasks are completed.
- Internal APK: generated locally.
- Play artifact: generated locally as AAB with `bundleRelease`.
- Public app name: Inflatrack.
- Data model: local-only; no accounts, analytics, ads, backend, or server sync.
- Local verification passed: `npx tsc --noEmit`, `npm test`, `npx expo-doctor`, APK build, AAB build, and APK permission inspection.

## Blockers

- Public privacy policy URL must be live, non-PDF, non-editable, and not geoblocked before Play review. Use `docs/PRIVACY_POLICY.md` as the source and publish it at `https://www.inflatrack.com.ar/privacy-policy`.
- A production AAB must be built and signed with Play App Signing or a real upload key. The local debug keystore is acceptable only for internal APK testing.
- Play Console App content must be completed: Data safety, Financial features declaration, content rating, target audience, ads declaration, and privacy policy URL.

## High Priority Findings

- Generated release APK permissions were validated. Current permissions are only biometric/fingerprint plus Android's internal dynamic receiver permission.
- Verify Play Console accepts the AAB and reports target SDK 36 / API requirement compliance.
- Store listing must be completed with Inflatrack branding: app name, short description, full description, Finance category, screenshots, feature graphic, icon, and support/contact details.
- Run manual QA on at least one real Android device before promoting beyond internal testing.

## Medium Priority Findings

- `npm audit --omit=dev` currently reports moderate Expo/toolchain advisories whose automated fix requires a major Expo upgrade. Track separately and do not apply `npm audit fix --force` inside the release branch.
- App architecture is still concentrated in `mobile/App.tsx`; this is maintainability risk, not a Play Store blocker by itself.
- Screenshot/visual regression testing is not automated yet.

## Play Console Declaration Draft

Data safety:

- App does not collect or share user data with Inflatrack servers.
- User-entered financial data is stored locally on the device.
- CSV/PDF files are shared only when the user starts export/share.
- No analytics, ads, account creation, location, contacts, camera, microphone, health data, SMS, or call logs.
- Security practice: data is stored locally by the platform; data in transit is not used for Inflatrack servers.

Financial features:

- Declare the app as a personal finance/budget tracking tool.
- Do not declare personal loans, loan facilitation, banking, payments, money transfer, trading, crypto, insurance, credit monitoring, or financial advice unless those features are added later.

## Manual QA Checklist

- Fresh install opens with default catalogs and no demo transactions.
- Existing install updates without resetting local storage.
- Biometric lock enabled/disabled both work without flashing locked UI when disabled.
- Dashboard totals, transaction create/edit/delete, installments, budgets, reports, CSV/PDF export, Settings, Cajas, dark mode, calendar, and Android back behavior pass the scenarios in `docs/context/13-testing-verification.md`.
- CSV/PDF export still works after release permission cleanup.
- Bottom navigation is usable on Android API 34, 35, and 36 or the closest available emulator/device set.

## Completion Criteria

- `npx tsc --noEmit` passes.
- `npm test` passes.
- `npx expo-doctor` passes with Node 20.19.4.
- `npm audit --omit=dev` has no high/critical vulnerabilities.
- Release APK/AAB build succeeds from a clean temp copy with `mobile/dev-local` removed.
- `aapt2 dump permissions` does not show storage, overlay, vibration, or internet permissions in the internal APK used for manifest inspection.
- AAB is uploaded to Play Console internal testing without policy or signing blockers.

## Latest Local Artifacts

- APK: `C:\tmp\gastos-mobile-local-build\artifacts\inflatrack-v1.0.16-17-internal.apk`
- AAB: `C:\tmp\gastos-mobile-local-build\artifacts\inflatrack-v1.0.16-17-release.aab`
- APK size: `68,614,602` bytes.
- AAB size: `46,880,135` bytes.
- APK SHA256: `F295B0839FBE62795050ED968363E706713080A027847196442039B229DEDBF3`
- AAB SHA256: `ACDD71C64069CB292F092D874F8735F80C3E605C5D52E6336985ACFE37D3D289`
