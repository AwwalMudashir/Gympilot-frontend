import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {DashboardScreen} from '../screens/main/DashboardScreen';
import {PlaceholderScreen} from '../screens/main/PlaceholderScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {useAuthStore} from '../store/authStore';
import {colors} from '../theme/colors';
import type {AuthStackParamList, MainTabParamList} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        tabBarActiveTintColor: colors.primary,
      }}>
      <MainTabs.Screen component={DashboardScreen} name="Home" />
      <MainTabs.Screen name="Plan">
        {() => <PlaceholderScreen title="Weekly plan" />}
      </MainTabs.Screen>
      <MainTabs.Screen name="Progress">
        {() => <PlaceholderScreen title="Progress" />}
      </MainTabs.Screen>
      <MainTabs.Screen component={ProfileScreen} name="Profile" />
    </MainTabs.Navigator>
  );
}

export function RootNavigator() {
  const initialize = useAuthStore(state => state.initialize);
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    initialize().catch(() => undefined);
  }, [initialize]);

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (status === 'signedOut') {
    return <AuthNavigator />;
  }
  if (!user?.onboardingComplete) {
    return <OnboardingScreen />;
  }
  return <MainNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
