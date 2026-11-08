import type {ApiEnvelope} from '../types/api';
import type {DayOfWeek} from '../types/profile';
import type {DifficultyRating, Exercise, TodayWorkout, WorkoutPlan, WorkoutSession} from '../types/workout';
import {apiClient, dataOf} from './http';
export const workoutApi = {
  async exercises() { return dataOf(await apiClient.get<ApiEnvelope<Exercise[]>>('/exercises')); },
  async currentPlan() { return dataOf(await apiClient.get<ApiEnvelope<WorkoutPlan>>('/workouts/plans/current')); },
  async generatePlan() { return dataOf(await apiClient.post<ApiEnvelope<WorkoutPlan>>('/workouts/plans/generate')); },
  async regeneratePlan() { return dataOf(await apiClient.post<ApiEnvelope<WorkoutPlan>>('/workouts/plans/regenerate')); },
  async today() { return dataOf(await apiClient.get<ApiEnvelope<TodayWorkout>>('/workouts/today')); },
  async prepareSession(workoutPlanId: string, workoutDay: DayOfWeek, scheduledDate: string) {
    return dataOf(await apiClient.post<ApiEnvelope<WorkoutSession>>('/workouts/sessions', {workoutPlanId, workoutDay, scheduledDate}));
  },
  async startSession(sessionId: string) {
    return dataOf(await apiClient.post<ApiEnvelope<WorkoutSession>>(`/workouts/sessions/${sessionId}/start`));
  },
  async completeSession(sessionId: string, difficultyRating: DifficultyRating = 'MODERATE') {
    return dataOf(await apiClient.patch<ApiEnvelope<WorkoutSession>>(`/workouts/sessions/${sessionId}/complete`, {difficultyRating, results: []}));
  },
  async skipSession(sessionId: string, notes = 'Skipped by user') {
    return dataOf(await apiClient.patch<ApiEnvelope<WorkoutSession>>(`/workouts/sessions/${sessionId}/skip`, {notes}));
  },
  async rescheduleSession(sessionId: string, scheduledDate: string) {
    return dataOf(await apiClient.patch<ApiEnvelope<WorkoutSession>>(`/workouts/sessions/${sessionId}/reschedule`, {scheduledDate}));
  },
  async history() { return dataOf(await apiClient.get<ApiEnvelope<WorkoutSession[]>>('/workouts/sessions/history')); },
};
