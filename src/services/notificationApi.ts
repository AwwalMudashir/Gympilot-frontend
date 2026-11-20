import type { ApiEnvelope } from '../types/api';
import type {
  NotificationPreferencePayload,
  NotificationPreferences,
} from '../types/notification';
import { apiClient, dataOf } from './http';

function displayTimes(value: NotificationPreferences): NotificationPreferences {
  return {
    ...value,
    workoutTime: value.workoutTime?.slice(0, 5) ?? '18:00',
    bedtimeReminderTime: value.bedtimeReminderTime?.slice(0, 5) ?? '22:00',
    sleepCheckinTime: value.sleepCheckinTime?.slice(0, 5) ?? '07:00',
  };
}

export const notificationApi = {
  async getPreferences() {
    return displayTimes(
      dataOf(
        await apiClient.get<ApiEnvelope<NotificationPreferences>>(
          '/notifications/preferences',
        ),
      ),
    );
  },

  async updatePreferences(payload: NotificationPreferencePayload) {
    return displayTimes(
      dataOf(
        await apiClient.put<ApiEnvelope<NotificationPreferences>>(
          '/notifications/preferences',
          payload,
        ),
      ),
    );
  },
};
