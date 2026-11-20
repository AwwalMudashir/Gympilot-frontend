import type { ApiEnvelope } from '../types/api';
import type {
  DailyHydration,
  DailyNutrition,
  SleepLog,
  SleepQuality,
  WellnessProgress,
} from '../types/wellness';
import { apiClient, dataOf } from './http';

export const wellnessApi = {
  async progress(days = 7) {
    return dataOf(
      await apiClient.get<ApiEnvelope<WellnessProgress>>(
        `/wellness/progress?days=${days}`,
      ),
    );
  },

  async addWater(amountMl: number) {
    return dataOf(
      await apiClient.post<ApiEnvelope<{ id: string }>>('/wellness/hydration', {
        amountMl,
      }),
    );
  },

  async dailyHydration() {
    return dataOf(
      await apiClient.get<ApiEnvelope<DailyHydration>>(
        '/wellness/hydration/daily',
      ),
    );
  },

  async addSleep(input: {
    sleptAt: string;
    wokeAt: string;
    quality: SleepQuality;
    energyLevel: number;
    notes?: string;
  }) {
    return dataOf(
      await apiClient.post<ApiEnvelope<SleepLog>>('/wellness/sleep', input),
    );
  },

  async addNutrition(input: {
    mealName: string;
    calories: number;
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
    fibreGrams?: number;
  }) {
    return dataOf(
      await apiClient.post<ApiEnvelope<{ id: string }>>(
        '/wellness/nutrition',
        input,
      ),
    );
  },

  async dailyNutrition() {
    return dataOf(
      await apiClient.get<ApiEnvelope<DailyNutrition>>(
        '/wellness/nutrition/daily',
      ),
    );
  },
};
