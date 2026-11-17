import type { DayOfWeek } from './profile';
export type Exercise = {
  id: string;
  code: string;
  name: string;
  instructions: string;
  muscleGroup: string;
  equipment: string;
  cameraSupported: boolean;
  estimatedCaloriesPer10Minutes: number;
};
export type WorkoutPlanItem = {
  id: string;
  exercise: Exercise;
  sets: number;
  targetRepetitions: number;
  restSeconds: number;
  order: number;
  cameraSupported: boolean;
  estimatedCalories: number;
};
export type WorkoutDay = {
  day: DayOfWeek;
  title: string;
  estimatedMinutes: number;
  estimatedCalories: number;
  exercises: WorkoutPlanItem[];
};
export type WorkoutPlan = {
  id: string;
  weekStartDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  explanation: string;
  workoutDays: number;
  totalExercises: number;
  days: WorkoutDay[];
};
export type TodayWorkout = {
  planId: string;
  date: string;
  restDay: boolean;
  workout?: WorkoutDay;
};
export type WorkoutSessionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'CANCELLED';
export type WorkoutPhase =
  | 'WARM_UP'
  | 'DEMO'
  | 'COUNTDOWN'
  | 'ACTIVE'
  | 'REST'
  | 'COOLDOWN';
export type DifficultyRating =
  | 'TOO_EASY'
  | 'EASY'
  | 'MODERATE'
  | 'HARD'
  | 'TOO_HARD';
export type ExerciseResult = {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  completedSets: number;
  plannedRepetitions: number;
  completedRepetitions: number;
  skipped: boolean;
  caloriesBurned: number;
  averageTempoSeconds?: number;
  formScore?: number;
  formFlags: string[];
};
export type ExerciseCompletion = {
  exerciseId: string;
  completedSets: number;
  completedRepetitions: number;
  skipped: boolean;
};
export type WorkoutProgressCheckpoint = {
  currentExerciseIndex: number;
  currentSetNumber: number;
  currentPhase: WorkoutPhase;
  phaseRemainingSeconds: number;
  results: ExerciseCompletion[];
};
export type WorkoutSession = {
  id: string;
  workoutPlanId: string;
  workoutDay: DayOfWeek;
  title: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  activeSince?: string;
  status: WorkoutSessionStatus;
  difficultyRating?: DifficultyRating;
  notes?: string;
  currentExerciseIndex: number;
  currentSetNumber: number;
  currentPhase: WorkoutPhase;
  phaseRemainingSeconds: number;
  elapsedSeconds: number;
  caloriesBurned: number;
  results: ExerciseResult[];
};

export type DailyCalories = {
  date: string;
  caloriesBurned: number;
  completedWorkouts: number;
};

export type ExerciseCalories = {
  exerciseId: string;
  exerciseName: string;
  caloriesBurned: number;
  completedSets: number;
};

export type WorkoutAnalytics = {
  weekStartDate: string;
  todayCalories: number;
  weekCalories: number;
  completedWorkouts: number;
  completedExercises: number;
  dailyBreakdown: DailyCalories[];
  exerciseBreakdown: ExerciseCalories[];
};
