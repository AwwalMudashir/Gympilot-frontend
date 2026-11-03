export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type FitnessGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'GENERAL_FITNESS' | 'STRENGTH' | 'MAINTENANCE' | 'CONSISTENCY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ProfilePayload = {
  age: number; heightCm: number; weightKg: number; experienceLevel: ExperienceLevel;
  fitnessGoal: FitnessGoal; preferredWorkoutLocation: string; availableEquipment: string[];
  preferredWorkoutDays: DayOfWeek[]; daysPerWeek: number; workoutDurationMinutes: number;
  dailyWaterTargetMl?: number; preferredBedtime?: string; preferredWakeTime?: string;
  sleepTargetMinutes?: number; waistCm?: number; chestCm?: number; armCm?: number;
};
export type Profile = ProfilePayload & {
  id: string; userId: string; email: string; firstName: string; lastName: string; profilePictureUrl?: string;
};
