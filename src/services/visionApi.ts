import axios from 'axios';

import type { ApiEnvelope } from '../types/api';
import type { ExerciseResult } from '../types/workout';
import type {
  SquatFrameResult,
  SquatSession,
  SquatSummary,
  VisionWorkoutResult,
} from '../types/vision';
import { apiClient, dataOf, visionClient } from './http';

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

export const visionApi = {
  async startSquatSession(targetRepetitions: number) {
    const response = await visionClient.post<SquatSession>(
      '/api/v1/squat/sessions',
      { target_repetitions: targetRepetitions },
    );
    return response.data;
  },

  async analyseSquatFrame(sessionId: string, filePath: string) {
    const form = new FormData();
    const frame: ReactNativeFile = {
      uri: `file://${filePath}`,
      name: 'squat-frame.jpg',
      type: 'image/jpeg',
    };
    form.append('frame', frame as unknown as Blob);

    const response = await visionClient.post<SquatFrameResult>(
      `/api/v1/squat/sessions/${sessionId}/frames`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  async finishSquatSession(sessionId: string) {
    const response = await visionClient.post<SquatSummary>(
      `/api/v1/squat/sessions/${sessionId}/finish`,
    );
    return response.data;
  },

  async cancelSquatSession(sessionId: string) {
    await visionClient.delete(`/api/v1/squat/sessions/${sessionId}`);
  },

  async saveWorkoutResult(result: VisionWorkoutResult) {
    return dataOf(
      await apiClient.post<ApiEnvelope<ExerciseResult>>(
        '/vision/workout-results',
        result,
      ),
    );
  },
};

export function visionErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : 'Vision coaching could not continue.';
  }
  if (!error.response) {
    return 'Cannot reach the GymBro vision service. Check your internet connection and try again.';
  }
  if ([502, 503, 504].includes(error.response.status)) {
    return 'The vision coach is waking up. Wait about a minute, then start the set again.';
  }
  const detail = (error.response.data as { detail?: string } | undefined)
    ?.detail;
  return detail ?? 'Vision coaching could not analyse this frame.';
}
