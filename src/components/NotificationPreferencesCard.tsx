import { useFocusEffect } from '@react-navigation/native';
import type { PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { apiErrorMessage } from '../services/http';
import { localNotificationService } from '../services/localNotificationService';
import { notificationApi } from '../services/notificationApi';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import type { NotificationPreferences } from '../types/notification';
import { AppIcon, type AppIconName } from './AppIcon';
import { Card } from './Card';
import { FormField } from './FormField';
import { PrimaryButton } from './PrimaryButton';
import { StatusNotice } from './StatusNotice';

const defaults: NotificationPreferences = {
  allNotificationsEnabled: true,
  workoutEnabled: true,
  workoutTime: '18:00',
  hydrationEnabled: true,
  hydrationIntervalMinutes: 120,
  bedtimeEnabled: false,
  bedtimeReminderTime: '22:00',
  sleepCheckinEnabled: false,
  sleepCheckinTime: '07:00',
};

export function NotificationPreferencesCard() {
  const { colors } = useTheme();
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: 'error' | 'success';
    message: string;
  }>();

  const load = useCallback(async () => {
    try {
      setPreferences(await notificationApi.getPreferences());
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  async function save() {
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
    const invalidEnabledReminder =
      preferences.allNotificationsEnabled &&
      ((preferences.workoutEnabled &&
        !validTime.test(preferences.workoutTime)) ||
        (preferences.bedtimeEnabled &&
          !validTime.test(preferences.bedtimeReminderTime)) ||
        (preferences.sleepCheckinEnabled &&
          !validTime.test(preferences.sleepCheckinTime)) ||
        (preferences.hydrationEnabled &&
          (preferences.hydrationIntervalMinutes < 30 ||
            preferences.hydrationIntervalMinutes > 480)));

    if (invalidEnabledReminder) {
      setNotice({
        tone: 'error',
        message:
          'Use 24-hour times and a hydration interval from 30 to 480 minutes.',
      });
      return;
    }

    setSaving(true);
    setNotice(undefined);
    try {
      const updated = await notificationApi.updatePreferences({
        allNotificationsEnabled: preferences.allNotificationsEnabled,
        workoutEnabled: preferences.workoutEnabled,
        workoutTime: preferences.workoutTime,
        hydrationEnabled: preferences.hydrationEnabled,
        hydrationIntervalMinutes: preferences.hydrationIntervalMinutes,
        bedtimeEnabled: preferences.bedtimeEnabled,
        bedtimeReminderTime: preferences.bedtimeReminderTime,
        sleepCheckinEnabled: preferences.sleepCheckinEnabled,
        sleepCheckinTime: preferences.sleepCheckinTime,
      });
      setPreferences(updated);

      try {
        const scheduled = await localNotificationService.sync(updated);
        if (!scheduled.permissionGranted) {
          setNotice({
            tone: 'error',
            message:
              'Preferences saved, but phone notifications are blocked. Allow GymBro notifications in your device settings.',
          });
        } else if (scheduled.scheduledCount === 0) {
          setNotice({
            tone: 'success',
            message: 'Preferences saved. Local reminders are switched off.',
          });
        } else {
          setNotice({
            tone: 'success',
            message: `${scheduled.scheduledCount} local reminder${
              scheduled.scheduledCount === 1 ? '' : 's'
            } scheduled on this phone.`,
          });
        }
      } catch {
        setNotice({
          tone: 'error',
          message:
            'Preferences were saved, but this phone could not schedule the reminders. Check notification permissions and try again.',
        });
      }
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setSaving(false);
    }
  }

  const remindersDisabled = !preferences.allNotificationsEnabled;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeading}>
        <View
          style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}
        >
          <AppIcon color={colors.primary} name="clock" size={18} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.section, { color: colors.text }]}>
            Reminders
          </Text>
          <Text style={[styles.sectionCaption, { color: colors.muted }]}>
            Your routine, on your time
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <View
          style={[
            styles.masterSetting,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <View style={styles.flex}>
            <Text style={[styles.masterTitle, { color: colors.text }]}>
              All reminders
            </Text>
            <Text style={[styles.masterDescription, { color: colors.muted }]}>
              Pause or resume every GymBro prompt at once.
            </Text>
          </View>
          <ReminderSwitch
            value={preferences.allNotificationsEnabled}
            onChange={allNotificationsEnabled =>
              setPreferences(current => ({
                ...current,
                allNotificationsEnabled,
              }))
            }
          />
        </View>

        <StatusNotice message={notice?.message} tone={notice?.tone} />

        <View style={styles.reminderList}>
          <ReminderSetting
            description="A prompt before today's scheduled training."
            disabled={remindersDisabled}
            icon="dumbbell"
            label="Workout"
            value={preferences.workoutEnabled}
            onChange={workoutEnabled =>
              setPreferences(current => ({ ...current, workoutEnabled }))
            }
          >
            {preferences.workoutEnabled && !remindersDisabled ? (
              <FormField
                label="Reminder time (24h)"
                placeholder="18:00"
                value={preferences.workoutTime}
                onChangeText={workoutTime =>
                  setPreferences(current => ({ ...current, workoutTime }))
                }
              />
            ) : null}
          </ReminderSetting>

          <ReminderSetting
            description="Gentle water prompts throughout your day."
            disabled={remindersDisabled}
            icon="water"
            label="Hydration"
            value={preferences.hydrationEnabled}
            onChange={hydrationEnabled =>
              setPreferences(current => ({ ...current, hydrationEnabled }))
            }
          >
            {preferences.hydrationEnabled && !remindersDisabled ? (
              <FormField
                label="Repeat every (minutes)"
                keyboardType="number-pad"
                placeholder="120"
                value={String(preferences.hydrationIntervalMinutes)}
                onChangeText={value =>
                  setPreferences(current => ({
                    ...current,
                    hydrationIntervalMinutes: Number(value) || 0,
                  }))
                }
              />
            ) : null}
          </ReminderSetting>

          <ReminderSetting
            description="A quiet nudge when it is time to wind down."
            disabled={remindersDisabled}
            icon="moon"
            label="Bedtime"
            value={preferences.bedtimeEnabled}
            onChange={bedtimeEnabled =>
              setPreferences(current => ({ ...current, bedtimeEnabled }))
            }
          >
            {preferences.bedtimeEnabled && !remindersDisabled ? (
              <FormField
                label="Reminder time (24h)"
                placeholder="22:00"
                value={preferences.bedtimeReminderTime}
                onChangeText={bedtimeReminderTime =>
                  setPreferences(current => ({
                    ...current,
                    bedtimeReminderTime,
                  }))
                }
              />
            ) : null}
          </ReminderSetting>

          <ReminderSetting
            description="Log last night's sleep and morning energy."
            disabled={remindersDisabled}
            icon="sun"
            label="Morning check-in"
            value={preferences.sleepCheckinEnabled}
            onChange={sleepCheckinEnabled =>
              setPreferences(current => ({ ...current, sleepCheckinEnabled }))
            }
          >
            {preferences.sleepCheckinEnabled && !remindersDisabled ? (
              <FormField
                label="Check-in time (24h)"
                placeholder="07:00"
                value={preferences.sleepCheckinTime}
                onChangeText={sleepCheckinTime =>
                  setPreferences(current => ({
                    ...current,
                    sleepCheckinTime,
                  }))
                }
              />
            ) : null}
          </ReminderSetting>
        </View>

        <PrimaryButton
          disabled={loading}
          label="Save reminder settings"
          loading={loading || saving}
          onPress={() => save().catch(() => undefined)}
        />
      </Card>
    </View>
  );
}

function ReminderSetting({
  children,
  description,
  disabled,
  icon,
  label,
  value,
  onChange,
}: PropsWithChildren<{
  description: string;
  disabled: boolean;
  icon: AppIconName;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}>) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.reminderBlock,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.border,
        },
        disabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.reminderRow}>
        <View
          style={[styles.reminderIcon, { backgroundColor: colors.primarySoft }]}
        >
          <AppIcon color={colors.primary} name={icon} size={17} />
        </View>
        <View style={styles.reminderCopy}>
          <Text style={[styles.reminderLabel, { color: colors.text }]}>
            {label}
          </Text>
          <Text style={[styles.reminderDescription, { color: colors.muted }]}>
            {description}
          </Text>
        </View>
        <ReminderSwitch disabled={disabled} value={value} onChange={onChange} />
      </View>
      {children ? <View style={styles.settingControl}>{children}</View> : null}
    </View>
  );
}

function ReminderSwitch({
  disabled = false,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();

  return (
    <Switch
      accessibilityRole="switch"
      disabled={disabled}
      ios_backgroundColor={colors.border}
      thumbColor={colors.surface}
      trackColor={{ false: colors.border, true: colors.primary }}
      value={value}
      onValueChange={onChange}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  section: { fontFamily: fonts.displaySemibold, fontSize: 24 },
  sectionCaption: { fontFamily: fonts.body, fontSize: 12, marginTop: 1 },
  card: { gap: 18 },
  masterSetting: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  masterTitle: { fontFamily: fonts.displaySemibold, fontSize: 19 },
  masterDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  reminderList: { gap: 12 },
  reminderBlock: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
  },
  reminderRow: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  reminderIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  reminderCopy: { flex: 1 },
  reminderLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
  },
  reminderDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  settingControl: { marginTop: 15 },
  disabled: { opacity: 0.52 },
  flex: { flex: 1 },
});
