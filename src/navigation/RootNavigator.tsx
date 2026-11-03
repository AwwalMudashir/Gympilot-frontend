import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {AppIcon} from '../components/AppIcon';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {ResetPasswordScreen} from '../screens/auth/ResetPasswordScreen';
import {VerifyEmailScreen} from '../screens/auth/VerifyEmailScreen';
import {DashboardScreen} from '../screens/main/DashboardScreen';
import {ExerciseCatalogueScreen} from '../screens/main/ExerciseCatalogueScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {WeeklyPlanScreen} from '../screens/main/WeeklyPlanScreen';
import {WorkoutDetailScreen} from '../screens/main/WorkoutDetailScreen';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {useAuthStore} from '../store/authStore';
import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/typography';
import type {AuthStackParamList, MainStackParamList, MainTabParamList} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

type TabIconProps = {color: string; size: number};
const HomeTabIcon = ({color, size}: TabIconProps) => <AppIcon color={color} name="home" size={size - 2} />;
const PlanTabIcon = ({color, size}: TabIconProps) => <AppIcon color={color} name="dumbbell" size={size - 2} />;
const ExercisesTabIcon = ({color, size}: TabIconProps) => <AppIcon color={color} name="chart" size={size - 2} />;
const ProfileTabIcon = ({color, size}: TabIconProps) => <AppIcon color={color} name="user" size={size - 2} />;

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
      <AuthStack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
      <AuthStack.Screen component={ResetPasswordScreen} name="ResetPassword" />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const {colors} = useTheme();
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {backgroundColor: colors.background},
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {backgroundColor: colors.surface, borderTopColor: colors.border, height: 68, paddingBottom: 8, paddingTop: 7},
        tabBarLabelStyle: {fontFamily: fonts.body, fontSize: 11, fontWeight: '700'},
      }}>
      <MainTabs.Screen component={DashboardScreen} name="Home" options={{tabBarIcon: HomeTabIcon}} />
      <MainTabs.Screen component={WeeklyPlanScreen} name="Plan" options={{tabBarIcon: PlanTabIcon}} />
      <MainTabs.Screen component={ExerciseCatalogueScreen} name="Exercises" options={{tabBarIcon: ExercisesTabIcon}} />
      <MainTabs.Screen component={ProfileScreen} name="Profile" options={{tabBarIcon: ProfileTabIcon}} />
    </MainTabs.Navigator>
  );
}

function SignedInNavigator() {
  const {colors} = useTheme();
  return <MainStack.Navigator screenOptions={{headerStyle: {backgroundColor: colors.background}, headerTintColor: colors.text, headerShadowVisible: false, headerTitleStyle: {fontFamily: fonts.displaySemibold}}}>
    <MainStack.Screen component={MainNavigator} name="Tabs" options={{headerShown: false}} />
    <MainStack.Screen component={WorkoutDetailScreen} name="WorkoutDetail" options={{title: 'Workout details'}} />
  </MainStack.Navigator>;
}

export function RootNavigator() {
  const {colors} = useTheme();
  const initialize = useAuthStore(state => state.initialize);
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    initialize().catch(() => undefined);
  }, [initialize]);

  if (status === 'loading') {
    return (
      <View style={[styles.loading, {backgroundColor: colors.background}]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (status === 'signedOut') {
    return <AuthNavigator />;
  }
  if (!user?.emailVerified) {
    return <VerifyEmailScreen />;
  }
  if (!user?.onboardingComplete) {
    return <OnboardingScreen />;
  }
  return <SignedInNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
