# Device end-to-end smoke test

The Maestro flow exercises the complete Sprint 1 path: registration, development email verification, onboarding, profile persistence, weekly-plan generation and dashboard loading.

Prerequisites:

1. Start PostgreSQL and the Spring Boot API on port `8080` with development tokens enabled.
2. Install and launch the Android debug app on an emulator.
3. Install Maestro, then run `maestro test e2e/auth-onboarding.yaml` from the frontend directory.

The Android emulator reaches the host API through `10.0.2.2`. Production verification requires a configured email provider rather than the development token returned locally.
