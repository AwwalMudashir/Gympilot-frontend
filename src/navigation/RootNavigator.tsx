import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../components/AppIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { CoachScreen } from '../screens/main/CoachScreen';
import { ExerciseCatalogueScreen } from '../screens/main/ExerciseCatalogueScreen';
import { ExerciseDetailScreen } from '../screens/main/ExerciseDetailScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { WellnessScreen } from '../screens/main/WellnessScreen';
import { WorkoutHistoryScreen } from '../screens/main/WorkoutHistoryScreen';
import { WorkoutCameraScreen } from '../screens/main/WorkoutCameraScreen';
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
      accessibilityLabel="GymBro"
      accessibilityRole="image"
      style={styles.splashBrand}
    >
      <Image
        resizeMode="contain"
        source={require('../assets/branding/gymbro-wordmark.png')}
        style={styles.wordmark}
      />
    </View>
  );
}

function StartupRecovery() {
  const { colors } = useTheme();
  const initialize = useAuthStore(state => state.initialize);
  const continueSignedOut = useAuthStore(state => state.continueSignedOut);
  const message = useAuthStore(state => state.startupMessage);

  return (
    <View style={[styles.recovery, { backgroundColor: colors.background }]}>
      <View
        style={[styles.recoveryIcon, { backgroundColor: colors.primarySoft }]}
      >
        <AppIcon color={colors.primary} name="retry" size={28} />
      </View>

      <Text style={[styles.recoveryTitle, { color: colors.text }]}>
        Taking longer than expected
      </Text>
      <Text style={[styles.recoveryMessage, { color: colors.muted }]}>
        {message} Check your internet connection, wait a moment, then retry.
      </Text>

      <View style={styles.recoveryActions}>
        <PrimaryButton
          label="Try again"
          onPress={() => initialize().catch(() => undefined)}
        />
        <PrimaryButton
          label="Sign in again"
          onPress={() => continueSignedOut().catch(() => undefined)}
          variant="secondary"
        />
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
        component={CoachScreen}
        name="Coach"
        options={{ title: 'GymBro Coach' }}
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
      <MainStack.Screen
        component={WorkoutCameraScreen}
        name="WorkoutCamera"
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        component={WellnessScreen}
        name="Wellness"
        options={{ title: 'Wellness & recovery' }}
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
  if (status === 'startupError') {
    return <StartupRecovery />;
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
  wordmark: {
    height: 58,
    width: 174,
  },
  splashTagline: {
    color: '#6E7872',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 14,
  },
  splashLoader: { marginTop: 29, transform: [{ scale: 0.82 }] },
  recovery: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  recoveryIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 22,
    width: 72,
  },
  recoveryTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 25,
    textAlign: 'center',
  },
  recoveryMessage: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  recoveryActions: {
    gap: 12,
    marginTop: 30,
  },
});
