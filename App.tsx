import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {RootNavigator} from './src/navigation/RootNavigator';
import {ThemeProvider, useTheme} from './src/theme/ThemeProvider';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider><ThemedApp /></ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const {colors, isDark} = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  return <>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <NavigationContainer
      linking={{prefixes: ['gymbro://auth', 'gympilot://auth'], config: {screens: {ResetPassword: 'reset-password', VerifyEmail: 'verify-email'}}}}
      theme={{...base, colors: {...base.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary}}}>
      <RootNavigator />
    </NavigationContainer>
  </>;
}

export default App;
