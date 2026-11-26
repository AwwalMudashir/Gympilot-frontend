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
  Coach: undefined;
  Wellness: undefined;
  WorkoutDetail: { day?: import('../types/profile').DayOfWeek } | undefined;
  ExerciseDetail: { exercise: import('../types/workout').Exercise };
  WorkoutCamera: {
    workoutSessionId: string;
    exerciseId: string;
    exerciseCode: import('../types/vision').VisionExerciseCode;
    exerciseName: string;
    targetRepetitions: number;
    setNumber: number;
    resultKey: string;
  };
};
