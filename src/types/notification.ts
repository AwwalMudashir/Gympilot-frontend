export type NotificationPreferences = {
  id?: string;
  allNotificationsEnabled: boolean;
  workoutEnabled: boolean;
  workoutTime: string;
  hydrationEnabled: boolean;
  hydrationIntervalMinutes: number;
  bedtimeEnabled: boolean;
  bedtimeReminderTime: string;
  sleepCheckinEnabled: boolean;
  sleepCheckinTime: string;
};

export type NotificationPreferencePayload = Omit<
  NotificationPreferences,
  'id'
> & {
  deviceToken?: string;
};
