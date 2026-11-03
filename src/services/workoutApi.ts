import type {ApiEnvelope} from '../types/api';
import type {Exercise, TodayWorkout, WorkoutPlan} from '../types/workout';
import {apiClient, dataOf} from './http';
export const workoutApi = {
  async exercises() { return dataOf(await apiClient.get<ApiEnvelope<Exercise[]>>('/exercises')); },
  async currentPlan() { return dataOf(await apiClient.get<ApiEnvelope<WorkoutPlan>>('/workouts/plans/current')); },
  async generatePlan() { return dataOf(await apiClient.post<ApiEnvelope<WorkoutPlan>>('/workouts/plans/generate')); },
  async today() { return dataOf(await apiClient.get<ApiEnvelope<TodayWorkout>>('/workouts/today')); },
};
