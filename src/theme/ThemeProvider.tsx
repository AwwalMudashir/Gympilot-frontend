import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type AppColors } from './colors';

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeValue = {
  colors: AppColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => Promise<void>;
};
const ThemeContext = createContext<ThemeValue | null>(null);
const STORAGE_KEY = 'gympilot.theme';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value === 'system' || value === 'light' || value === 'dark')
        setPreferenceState(value);
    });
  }, []);
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && systemScheme === 'dark');
  const value = useMemo<ThemeValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      async setPreference(next) {
        setPreferenceState(next);
        await AsyncStorage.setItem(STORAGE_KEY, next);
      },
    }),
    [isDark, preference],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
