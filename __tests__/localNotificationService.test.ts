jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    cancelTriggerNotifications: jest.fn(),
    requestPermission: jest.fn(),
    createChannel: jest.fn(),
    createTriggerNotification: jest.fn(),
  },
  AndroidImportance: { DEFAULT: 3 },
  AuthorizationStatus: { AUTHORIZED: 1, DENIED: 0, PROVISIONAL: 2 },
  RepeatFrequency: { DAILY: 1 },
  TimeUnit: { MINUTES: 'MINUTES' },
  TriggerType: { TIMESTAMP: 0, INTERVAL: 1 },
}));

import notifee, { AuthorizationStatus } from '@notifee/react-native';

import {
  localNotificationService,
  nextDailyTimestamp,
} from '../src/services/localNotificationService';
import type { NotificationPreferences } from '../src/types/notification';

const preferences: NotificationPreferences = {
  allNotificationsEnabled: true,
  workoutEnabled: true,
  workoutTime: '18:00',
  hydrationEnabled: true,
  hydrationIntervalMinutes: 120,
  bedtimeEnabled: true,
  bedtimeReminderTime: '22:00',
  sleepCheckinEnabled: true,
  sleepCheckinTime: '07:00',
};

describe('local notification scheduling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(notifee.cancelTriggerNotifications).mockResolvedValue();
    jest.mocked(notifee.createChannel).mockResolvedValue('gymbro-reminders');
    jest.mocked(notifee.createTriggerNotification).mockResolvedValue('id');
    jest.mocked(notifee.requestPermission).mockResolvedValue({
      authorizationStatus: AuthorizationStatus.AUTHORIZED,
    } as never);
  });

  test('moves a daily reminder to tomorrow when its time has passed', () => {
    const now = new Date(2026, 10, 25, 19, 30, 0);
    const next = new Date(nextDailyTimestamp('18:00', now));

    expect(next.getDate()).toBe(26);
    expect(next.getHours()).toBe(18);
    expect(next.getMinutes()).toBe(0);
  });

  test('schedules all four enabled reminder types', async () => {
    const result = await localNotificationService.sync(preferences);

    expect(result).toEqual({ permissionGranted: true, scheduledCount: 4 });
    expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(4);
  });

  test('keeps preferences but schedules nothing when permission is denied', async () => {
    jest.mocked(notifee.requestPermission).mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    } as never);

    await expect(localNotificationService.sync(preferences)).resolves.toEqual({
      permissionGranted: false,
      scheduledCount: 0,
    });
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  test('cancels existing triggers when all reminders are disabled', async () => {
    await expect(
      localNotificationService.sync({
        ...preferences,
        allNotificationsEnabled: false,
      }),
    ).resolves.toEqual({ permissionGranted: true, scheduledCount: 0 });
    expect(notifee.requestPermission).not.toHaveBeenCalled();
  });
});
