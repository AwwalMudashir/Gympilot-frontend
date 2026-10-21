import {Platform} from 'react-native';

// Android emulators reach the development machine through 10.0.2.2.
// Change this host to the computer's LAN IP when using a physical phone.
const DEVELOPMENT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const environment = {
  apiBaseUrl: __DEV__
    ? `http://${DEVELOPMENT_HOST}:8080/api`
    : 'https://api.gympilot.example/api',
  visionBaseUrl: __DEV__
    ? `http://${DEVELOPMENT_HOST}:8000`
    : 'https://vision.gympilot.example',
} as const;
