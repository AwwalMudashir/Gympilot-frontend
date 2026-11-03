/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-navigation/native', () => ({
  DarkTheme: {colors: {}},
  DefaultTheme: {colors: {}},
  NavigationContainer: ({children}: React.PropsWithChildren) => children,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: React.PropsWithChildren) => children,
}));
jest.mock('../src/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
