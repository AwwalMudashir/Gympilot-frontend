export type SleepQuality = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';

export type SleepLog = {
  id: string;
  sleptAt: string;
  wokeAt: string;
  durationMinutes: number;
  quality: SleepQuality;
  energyLevel: number;
  notes?: string;
};

export type DailyHydration = {
  date: string;
  totalMl: number;
  targetMl: number;
  progressPercent: number;
  entries: Array<{ id: string; amountMl: number; loggedAt: string }>;
};

export type DailyNutrition = {
  date: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams: number;
  entries: Array<{
    id: string;
    mealName: string;
    calories: number;
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
    fibreGrams?: number;
    loggedAt: string;
  }>;
};

export type WellnessDay = {
  date: string;
  sleepMinutes: number;
  sleepQuality?: SleepQuality;
  energyLevel?: number;
  waterMl: number;
  waterTargetMl: number;
  nutritionCalories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};

export type WellnessProgress = {
  fromDate: string;
  toDate: string;
  averageSleepMinutes: number;
  averageEnergyLevel: number;
  hydrationGoalDays: number;
  totalNutritionCalories: number;
  dailyBreakdown: WellnessDay[];
};
