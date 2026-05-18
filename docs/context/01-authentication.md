# Authentication Context

## Requirement

The app must protect financial data with biometric authentication when opened. It should rely on device-level biometric enrollment and not manage enrollment itself.

## Current behavior

Implemented in `mobile/App.tsx`:

- `AuthStatus` tracks `checking`, `authenticated`, `locked`, and `unavailable`.
- `requestAuthentication` calls `LocalAuthentication.hasHardwareAsync`.
- It then calls `LocalAuthentication.isEnrolledAsync`.
- If hardware or enrollment is unavailable, the app shows an unavailable lock screen.
- If available, it calls `LocalAuthentication.authenticateAsync`.
- The biometric prompt allows device fallback through `fallbackLabel: 'Use device passcode'` and `disableDeviceFallback: false`.
- On web, authentication is bypassed to keep local development possible.

## UX surface

- `LoadingScreen` is shown while fonts/data/auth are loading.
- `AuthScreen` blocks access until authentication succeeds.
- Failed authentication keeps the app locked and exposes only the retry action.

## Current policy decisions

- Biometric lock is mandatory in settings.
- Device passcode fallback is currently allowed.
- The app does not allow disabling biometric lock.

## Known gaps

- The fallback policy is still listed as pending in the requirements.
- No app-resume re-authentication exists yet.
- No timeout or background lock behavior exists yet.
- No automated tests cover auth state transitions.
