import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiErrorMessage } from '../services/http';
import { notificationApi } from '../services/notificationApi';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import type { NotificationPreferences } from '../types/notification';
import { Card } from './Card';
import { ChoiceChip } from './ChoiceChip';
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
    if (
      (preferences.workoutEnabled &&
        !validTime.test(preferences.workoutTime)) ||
      (preferences.bedtimeEnabled &&
        !validTime.test(preferences.bedtimeReminderTime)) ||
      (preferences.sleepCheckinEnabled &&
        !validTime.test(preferences.sleepCheckinTime)) ||
      (preferences.hydrationEnabled &&
        (preferences.hydrationIntervalMinutes < 30 ||
          preferences.hydrationIntervalMinutes > 480))
    ) {
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
      setNotice({ tone: 'success', message: 'Reminder preferences saved.' });
      Alert.alert('Reminders saved', 'Your reminder preferences are updated.');
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.section, { color: colors.text }]}>Reminders</Text>
      <Card>
        <Text style={[styles.caption, { color: colors.muted }]}>
          Choose the workout, hydration and recovery prompts you want GymBro to
          send.
        </Text>
        <StatusNotice message={notice?.message} tone={notice?.tone} />

        <ReminderToggle
          label="All notifications"
          value={preferences.allNotificationsEnabled}
          onChange={value =>
            setPreferences(current => ({
              ...current,
              allNotificationsEnabled: value,
            }))
          }
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ReminderToggle
          label="Workout reminder"
          value={preferences.workoutEnabled}
          onChange={value =>
            setPreferences(current => ({
              ...current,
              workoutEnabled: value,
            }))
          }
        />
        {preferences.workoutEnabled ? (
          <FormField
            label="Workout reminder time (24h)"
            placeholder="18:00"
            value={preferences.workoutTime}
            onChangeText={workoutTime =>
              setPreferences(current => ({ ...current, workoutTime }))
            }
          />
        ) : null}

        <ReminderToggle
          label="Hydration reminders"
          value={preferences.hydrationEnabled}
          onChange={value =>
            setPreferences(current => ({
              ...current,
              hydrationEnabled: value,
            }))
          }
        />
        {preferences.hydrationEnabled ? (
          <FormField
            label="Hydration interval (minutes)"
            keyboardType="number-pad"
            value={String(preferences.hydrationIntervalMinutes)}
            onChangeText={value =>
              setPreferences(current => ({
                ...current,
                hydrationIntervalMinutes: Number(value) || 0,
              }))
            }
          />
        ) : null}

        <ReminderToggle
          label="Bedtime reminder"
          value={preferences.bedtimeEnabled}
          onChange={value =>
            setPreferences(current => ({
              ...current,
              bedtimeEnabled: value,
            }))
          }
        />
        {preferences.bedtimeEnabled ? (
          <FormField
            label="Bedtime reminder (24h)"
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

        <ReminderToggle
          label="Morning sleep check-in"
          value={preferences.sleepCheckinEnabled}
          onChange={value =>
            setPreferences(current => ({
              ...current,
              sleepCheckinEnabled: value,
            }))
          }
        />
        {preferences.sleepCheckinEnabled ? (
          <FormField
            label="Sleep check-in time (24h)"
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

        <PrimaryButton
          disabled={loading}
          label={
            loading ? 'Loading reminder settings' : 'Save reminder settings'
          }
          loading={saving}
          onPress={() => save().catch(() => undefined)}
        />
      </Card>
    </View>
  );
}

function ReminderToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.reminderRow}>
      <Text style={[styles.reminderLabel, { color: colors.text }]}>
        {label}
      </Text>
      <View style={styles.reminderChoices}>
        <ChoiceChip
          label="On"
          selected={value}
          onPress={() => onChange(true)}
        />
        <ChoiceChip
          label="Off"
          selected={!value}
          onPress={() => onChange(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  section: { fontFamily: fonts.displaySemibold, fontSize: 24, marginTop: 5 },
  caption: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: { height: 1, marginBottom: 14 },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reminderLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
  },
  reminderChoices: { flexDirection: 'row', gap: 8 },
});
