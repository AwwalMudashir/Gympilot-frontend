// This development build targets a physical Android phone connected over USB.
// `adb reverse tcp:8080 tcp:8080` makes the computer's API available to the
// phone as localhost:8080. Android emulators should use 10.0.2.2 instead.
const DEVELOPMENT_HOST = 'localhost';

export const environment = {
  apiBaseUrl: __DEV__
    ? `http://${DEVELOPMENT_HOST}:8080/api`
    : 'https://api.gympilot.example/api',
  visionBaseUrl: __DEV__
    ? `http://${DEVELOPMENT_HOST}:8000`
    : 'https://vision.gympilot.example',
} as const;
