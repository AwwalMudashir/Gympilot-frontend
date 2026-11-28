import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimeUnit,
  TriggerType,
  type IntervalTrigger,
  type TimestampTrigger,
} from '@notifee/react-native';

import type { NotificationPreferences } from '../types/notification';

const CHANNEL_ID = 'gymbro-reminders';
const REMINDER_IDS = {
  workout: 'gymbro-workout-reminder',
  hydration: 'gymbro-hydration-reminder',
  bedtime: 'gymbro-bedtime-reminder',
  sleepCheckin: 'gymbro-sleep-checkin-reminder',
} as const;

export type ReminderSyncResult = {
  permissionGranted: boolean;
  scheduledCount: number;
};

export function nextDailyTimestamp(time: string, now = new Date()) {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}

async function scheduleDaily(
  id: string,
  title: string,
  body: string,
  time: string,
) {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextDailyTimestamp(time),
    repeatFrequency: RepeatFrequency.DAILY,
  };
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );
}

async function scheduleHydration(intervalMinutes: number) {
  const trigger: IntervalTrigger = {
    type: TriggerType.INTERVAL,
    interval: intervalMinutes,
    timeUnit: TimeUnit.MINUTES,
  };
  await notifee.createTriggerNotification(
    {
      id: REMINDER_IDS.hydration,
      title: 'Hydration check',
      body: 'Take a moment to drink some water and log your progress.',
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );
}

export const localNotificationService = {
  async sync(
    preferences: NotificationPreferences,
  ): Promise<ReminderSyncResult> {
    await notifee.cancelTriggerNotifications(Object.values(REMINDER_IDS));

    if (!preferences.allNotificationsEnabled) {
      return { permissionGranted: true, scheduledCount: 0 };
    }

    const hasEnabledReminder =
      preferences.workoutEnabled ||
      preferences.hydrationEnabled ||
      preferences.bedtimeEnabled ||
      preferences.sleepCheckinEnabled;
    if (!hasEnabledReminder) {
      return { permissionGranted: true, scheduledCount: 0 };
    }

    const settings = await notifee.requestPermission();
    const permissionGranted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
    if (!permissionGranted)
      return { permissionGranted: false, scheduledCount: 0 };

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'GymBro reminders',
      description: 'Workout, hydration, sleep and recovery reminders',
      importance: AndroidImportance.DEFAULT,
    });

    const schedules: Promise<void>[] = [];
    if (preferences.workoutEnabled) {
      schedules.push(
        scheduleDaily(
          REMINDER_IDS.workout,
          'Workout reminder',
          'Your GymBro training plan is ready when you are.',
          preferences.workoutTime,
        ),
      );
    }
    if (preferences.hydrationEnabled) {
      schedules.push(scheduleHydration(preferences.hydrationIntervalMinutes));
    }
    if (preferences.bedtimeEnabled) {
      schedules.push(
        scheduleDaily(
          REMINDER_IDS.bedtime,
          'Time to wind down',
          'Prepare for sleep so your body can recover for tomorrow.',
          preferences.bedtimeReminderTime,
        ),
      );
    }
    if (preferences.sleepCheckinEnabled) {
      schedules.push(
        scheduleDaily(
          REMINDER_IDS.sleepCheckin,
          'Morning check-in',
          "Log last night's sleep and how energised you feel this morning.",
          preferences.sleepCheckinTime,
        ),
      );
    }

    try {
      await Promise.all(schedules);
    } catch (error) {
      await notifee
        .cancelTriggerNotifications(Object.values(REMINDER_IDS))
        .catch(() => undefined);
      throw error;
    }
    return { permissionGranted: true, scheduledCount: schedules.length };
  },
};
