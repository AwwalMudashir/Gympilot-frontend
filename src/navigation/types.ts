export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {token?: string} | undefined;
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
  WorkoutDetail: {day?: import('../types/profile').DayOfWeek} | undefined;
};
