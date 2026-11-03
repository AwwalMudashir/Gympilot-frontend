# GymPilot Frontend

React Native + TypeScript mobile client for the GymPilot Vision fitness platform. The application is Android-first and uses a native React Native CLI project because camera tracking, secure storage, image selection and notifications depend on native modules.

## Sprint 1 user journeys

- Register with the backend password policy and verify an email address
- Sign in, securely restore a session, rotate refresh tokens and sign out
- Request and complete a password reset
- Complete four-step fitness onboarding and generate a first weekly plan
- Browse the supported exercise catalogue
- View the weekly programme, today's workout and exercise instructions
- View and update the fitness profile
- Upload, replace or remove a Cloudinary-backed profile image
- Switch between system, light and dark themes
- See consistent loading, empty, retry and API error states

## Design system

GymPilot uses an energetic but calm green-and-neutral palette. Light mode uses white and soft-green surfaces; dark mode uses near-black and deep-green surfaces. Barlow Condensed provides strong workout headings and metrics, while Inter is used for readable controls and body text. Font Awesome Free supplies the icon system.

The local font files and their OFL licences are under `assets/fonts`. If fonts are changed, relink them with:

```powershell
npx react-native-asset
```

## Main dependencies

- React Navigation for auth, tab and workout-detail navigation
- Axios for Spring Boot and vision-service clients
- Zustand for authenticated user/session state
- React Hook Form + Zod for form validation
- Keychain/Keystore storage through `react-native-keychain`
- Font Awesome Free and `react-native-svg` for icons
- `react-native-image-picker` for profile images
- Vision Camera for the later live exercise-analysis flow
- Notifee, Gifted Charts and Linear Gradient for later sprint features

## Local services

- Spring Boot API: `http://localhost:8080/api`
- Python vision service: `http://localhost:8000`
- Metro: `http://localhost:8081`

The Android emulator reaches the development computer through `10.0.2.2`. For a physical phone, change `DEVELOPMENT_HOST` in `src/config/environment.ts` to the computer's LAN address.

## Run

```powershell
npm install
npm start
```

In another terminal:

```powershell
npm run android
```

The backend should run with `EXPOSE_DEVELOPMENT_TOKENS=true` when exercising email verification and password recovery locally. Production must send the tokens through the configured email provider instead of returning them to the app.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
```

The device smoke flow is documented in `e2e/README.md` and can be run with Maestro after the API and Android app are running.

## Project layout

```text
src/
  components/    reusable themed controls, cards, icons and states
  config/        service base URLs
  navigation/    auth, tab and workout-detail navigation
  screens/       auth, onboarding, dashboard, workout and profile flows
  services/      typed APIs, refresh handling and secure token storage
  store/         authenticated session state
  theme/         light/dark colours and typography
  types/         API, authentication, profile and workout contracts
assets/fonts/    bundled open-font assets and licences
e2e/             Maestro Sprint 1 device smoke flow
```
