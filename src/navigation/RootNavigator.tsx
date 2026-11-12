import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../components/AppIcon';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ExerciseCatalogueScreen } from '../screens/main/ExerciseCatalogueScreen';
import { ExerciseDetailScreen } from '../screens/main/ExerciseDetailScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { WorkoutHistoryScreen } from '../screens/main/WorkoutHistoryScreen';
import { WeeklyPlanScreen } from '../screens/main/WeeklyPlanScreen';
import { WorkoutDetailScreen } from '../screens/main/WorkoutDetailScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import type {
  AuthStackParamList,
  MainStackParamList,
  MainTabParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

type TabIconProps = { color: string; size: number };
const HomeTabIcon = ({ color, size }: TabIconProps) => (
  <AppIcon color={color} name="home" size={size - 2} />
);
const PlanTabIcon = ({ color, size }: TabIconProps) => (
  <AppIcon color={color} name="dumbbell" size={size - 2} />
);
const ExercisesTabIcon = ({ color, size }: TabIconProps) => (
  <AppIcon color={color} name="chart" size={size - 2} />
);
const HistoryTabIcon = ({ color, size }: TabIconProps) => (
  <AppIcon color={color} name="history" size={size - 2} />
);
const ProfileTabIcon = ({ color, size }: TabIconProps) => (
  <AppIcon color={color} name="user" size={size - 2} />
);

function SplashBrand() {
  return (
    <View
      accessibilityLabel="GymPilot"
      accessibilityRole="image"
      style={styles.splashBrand}
    >
      <View style={styles.splashMark}>
        <Text style={styles.splashMonogram}>GP</Text>
        <View style={styles.dumbbell}>
          <View style={styles.dumbbellPlateLarge} />
          <View style={styles.dumbbellPlateSmall} />
          <View style={styles.dumbbellBar} />
          <View style={styles.dumbbellPlateSmall} />
          <View style={styles.dumbbellPlateLarge} />
        </View>
      </View>

      <View style={styles.wordmark}>
        <Text style={styles.wordmarkGym}>GYM</Text>
        <Text style={styles.wordmarkPilot}>PILOT</Text>
      </View>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
      <AuthStack.Screen component={VerifyEmailScreen} name="VerifyEmail" />
      <AuthStack.Screen
        component={ForgotPasswordScreen}
        name="ForgotPassword"
      />
      <AuthStack.Screen component={ResetPasswordScreen} name="ResetPassword" />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <MainTabs.Screen
        component={DashboardScreen}
        name="Home"
        options={{ tabBarIcon: HomeTabIcon }}
      />
      <MainTabs.Screen
        component={WeeklyPlanScreen}
        name="Plan"
        options={{ tabBarIcon: PlanTabIcon }}
      />
      <MainTabs.Screen
        component={ExerciseCatalogueScreen}
        name="Exercises"
        options={{ tabBarIcon: ExercisesTabIcon }}
      />
      <MainTabs.Screen
        component={WorkoutHistoryScreen}
        name="History"
        options={{ tabBarIcon: HistoryTabIcon }}
      />
      <MainTabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ tabBarIcon: ProfileTabIcon }}
      />
    </MainTabs.Navigator>
  );
}

function SignedInNavigator() {
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
  return (
    <MainStack.Navigator
      initialRouteName={user?.role === 'ADMIN' ? 'AdminDashboard' : 'Tabs'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.displaySemibold },
      }}
    >
      <MainStack.Screen
        component={MainNavigator}
        name="Tabs"
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        component={AdminDashboardScreen}
        name="AdminDashboard"
        options={{ title: 'Administration' }}
      />
      <MainStack.Screen
        component={WorkoutDetailScreen}
        name="WorkoutDetail"
        options={{ title: 'Workout details' }}
      />
      <MainStack.Screen
        component={ExerciseDetailScreen}
        name="ExerciseDetail"
        options={{ title: 'Exercise guide' }}
      />
    </MainStack.Navigator>
  );
}

export function RootNavigator() {
  const initialize = useAuthStore(state => state.initialize);
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);
  const [splashReady, setSplashReady] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => setSplashReady(true), 400);
    initialize().catch(() => undefined);
    return () => clearTimeout(splashTimer);
  }, [initialize]);

  if (status === 'loading' || !splashReady) {
    return (
      <View style={styles.splash}>
        <View style={styles.topAccent} />
        <View style={styles.bottomAccent} />
        <SplashBrand />
        <Text style={styles.splashTagline}>TRAIN SMARTER. MOVE BETTER.</Text>
        <ActivityIndicator
          color="#3FA36C"
          size="small"
          style={styles.splashLoader}
        />
      </View>
    );
  }
  if (status === 'signedOut') {
    return <AuthNavigator />;
  }
  if (!user?.onboardingComplete && user?.role !== 'ADMIN') {
    return <OnboardingScreen />;
  }
  return <SignedInNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topAccent: {
    backgroundColor: '#E9F6EE',
    borderRadius: 105,
    height: 210,
    position: 'absolute',
    right: -78,
    top: -72,
    width: 210,
  },
  bottomAccent: {
    borderColor: '#DCEFE3',
    borderRadius: 82,
    borderWidth: 24,
    bottom: -74,
    height: 164,
    left: -68,
    position: 'absolute',
    width: 164,
  },
  splashBrand: {
    alignItems: 'center',
  },
  splashMark: {
    alignItems: 'center',
    backgroundColor: '#17201B',
    borderRadius: 22,
    elevation: 5,
    height: 78,
    justifyContent: 'center',
    shadowColor: '#152019',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    width: 78,
  },
  splashMonogram: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 38,
  },
  dumbbell: {
    alignItems: 'center',
    bottom: -6,
    flexDirection: 'row',
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
  },
  dumbbellBar: {
    backgroundColor: '#3FA36C',
    height: 4,
    width: 29,
  },
  dumbbellPlateLarge: {
    backgroundColor: '#3FA36C',
    borderRadius: 2,
    height: 16,
    width: 5,
  },
  dumbbellPlateSmall: {
    backgroundColor: '#3FA36C',
    borderRadius: 1,
    height: 11,
    marginHorizontal: 2,
    width: 4,
  },
  wordmark: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 23,
  },
  wordmarkGym: {
    color: '#17201B',
    fontFamily: fonts.display,
    fontSize: 43,
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  wordmarkPilot: {
    color: '#3FA36C',
    fontFamily: fonts.display,
    fontSize: 43,
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  splashTagline: {
    color: '#6E7872',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
  },
  splashLoader: { marginTop: 29, transform: [{ scale: 0.82 }] },
});
