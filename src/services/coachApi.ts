import type { ApiEnvelope } from '../types/api';
import type { CoachBrief, CoachFeedback } from '../types/coach';
import { apiClient, dataOf } from './http';

export const coachApi = {
  async daily() {
    return dataOf(await apiClient.get<ApiEnvelope<CoachBrief>>('/coach/daily'));
  },

  async weekly() {
    return dataOf(
      await apiClient.get<ApiEnvelope<CoachBrief>>('/coach/weekly'),
    );
  },

  async regenerateDaily() {
    return dataOf(
      await apiClient.post<ApiEnvelope<CoachBrief>>('/coach/daily/regenerate'),
    );
  },

  async regenerateWeekly() {
    return dataOf(
      await apiClient.post<ApiEnvelope<CoachBrief>>('/coach/weekly/regenerate'),
    );
  },

  async recordFeedback(briefId: string, feedback: CoachFeedback) {
    return dataOf(
      await apiClient.put<ApiEnvelope<CoachBrief>>(
        `/coach/briefs/${briefId}/feedback`,
        { feedback },
      ),
    );
  },
};
