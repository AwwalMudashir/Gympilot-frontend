export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: {
    email?: string;
    token?: string;
    developmentVerificationToken?: string;
  };
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};
export type MainTabParamList = {
  Home: undefined;
  Plan: undefined;
  Exercises: undefined;
  History: undefined;
  Profile: undefined;
};
export type MainStackParamList = {
  Tabs: undefined;
  AdminDashboard: undefined;
  WorkoutDetail: { day?: import('../types/profile').DayOfWeek } | undefined;
  ExerciseDetail: { exercise: import('../types/workout').Exercise };
};
