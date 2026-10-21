# GymPilot Frontend

Native React Native + TypeScript client for GymPilot Vision. The project is Android-first because camera tracking and scheduled notifications use native modules.

## Included foundation

- React Navigation native stack and main bottom tabs
- Axios clients for the Spring Boot API and Python vision service
- React Hook Form + Zod validation
- Zustand authentication/session state
- Keychain/Keystore token storage via `react-native-keychain`
- AsyncStorage for future non-sensitive preferences
- Vision Camera for the Sprint 3 workout-camera flow
- SVG, Gifted Charts and Linear Gradient for future progress views
- Notifee for local workout, hydration, bedtime and sleep reminders

Firebase Messaging and Image Picker are deliberately not installed because the plan marks server push and progress photos as optional/stretch work.

## Prerequisites

- Node.js 22.11 or newer (the generated React Native 0.88 template requirement)
- JDK 17 for the Android React Native toolchain
- Android Studio, Android SDK and an emulator or USB-debuggable phone
- Spring Boot API on port `8080`
- GymPilot vision service on port `8000`

## Install and run

```powershell
npm install
npm start
```

In a second terminal:

```powershell
npm run android
```

The Android emulator uses `10.0.2.2` to reach services on the development computer. For a physical phone, change `DEVELOPMENT_HOST` in `src/config/environment.ts` to the computer's LAN address and ensure the phone is on the same network.

## Expected Week 1 API contract

The starter UI expects:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile/me`
- `PUT /api/profile`

Register/login should return an access token, optional refresh token and user session:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "member@example.com",
    "onboardingComplete": false
  }
}
```

The endpoint paths and DTO fields are typed starter contracts; align them with the Spring Boot implementation when the auth/profile stories are built.

## Checks

```powershell
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

## Project layout

```text
src/
  components/    shared UI primitives
  config/        API/vision base URLs
  navigation/    auth stack and main tabs
  screens/       auth, onboarding and main feature shells
  services/      Axios clients and secure token vault
  store/         Zustand stores
  theme/         design tokens
  types/         shared TypeScript contracts
```
