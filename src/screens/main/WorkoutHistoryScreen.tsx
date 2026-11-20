import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { wellnessApi } from '../../services/wellnessApi';
import { workoutApi } from '../../services/workoutApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { WorkoutSession } from '../../types/workout';
import type { WellnessProgress } from '../../types/wellness';

export function WorkoutHistoryScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [wellness, setWellness] = useState<WellnessProgress>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [historyValue, wellnessValue] = await Promise.all([
        workoutApi.history(),
        wellnessApi.progress(7).catch(() => undefined),
      ]);
      setSessions(historyValue);
      setWellness(wellnessValue);
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>PROGRESS</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Workout history
      </Text>
      <Card>
        <View style={styles.recoveryHeading}>
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="moon" color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recovery this week
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              Sleep, hydration and nutrition alongside your training
            </Text>
          </View>
        </View>

        <View style={styles.recoveryMetrics}>
          <RecoveryMetric
            label="Avg sleep"
            value={formatSleep(wellness?.averageSleepMinutes)}
          />
          <RecoveryMetric
            label="Water goal"
            value={`${wellness?.hydrationGoalDays ?? 0}/7 days`}
          />
          <RecoveryMetric
            label="Food logged"
            value={`${wellness?.totalNutritionCalories ?? 0} kcal`}
          />
        </View>

        {wellness?.dailyBreakdown.length ? (
          <View style={styles.weekBars}>
            {wellness.dailyBreakdown.map(day => {
              const ratio = day.waterTargetMl
                ? Math.min(day.waterMl / day.waterTargetMl, 1)
                : 0;
              return (
                <View key={day.date} style={styles.dayBarGroup}>
                  <View
                    style={[
                      styles.barTrack,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: colors.primary,
                          height: `${Math.max(ratio * 100, 5)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, { color: colors.muted }]}>
                    {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                      undefined,
                      { weekday: 'narrow' },
                    )}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <PrimaryButton
          label="Log today's wellness"
          variant="secondary"
          onPress={() => navigation.navigate('Wellness')}
        />
      </Card>
      {loading && sessions.length === 0 ? (
        <StateView
          title="Loading history"
          message="Collecting your recent sessions."
        />
      ) : error ? (
        <StateView
          title="Could not load history"
          message={error}
          actionLabel="Try again"
          onAction={load}
        />
      ) : sessions.length === 0 ? (
        <StateView
          title="No sessions yet"
          message="Complete or skip a planned workout and it will appear here."
          icon="history"
        />
      ) : (
        sessions.map(session => {
          const completedExercises = session.results.filter(
            result => !result.skipped,
          ).length;
          const skippedExercises = session.results.filter(
            result => result.skipped,
          ).length;
          const visionResults = session.results.filter(
            result => result.formScore !== undefined,
          );
          const statusColor =
            session.status === 'COMPLETED'
              ? colors.primary
              : session.status === 'SKIPPED'
              ? colors.warning
              : colors.muted;
          return (
            <Card key={session.id}>
              <View style={styles.row}>
                <View
                  style={[styles.icon, { backgroundColor: colors.primarySoft }]}
                >
                  <AppIcon
                    name={session.status === 'COMPLETED' ? 'check' : 'clock'}
                    color={statusColor}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {session.title}
                  </Text>
                  <Text style={[styles.meta, { color: colors.muted }]}>
                    {session.workoutDay} · {session.scheduledDate}
                  </Text>
                </View>
                <Text style={[styles.status, { color: statusColor }]}>
                  {session.status.replace('_', ' ')}
                </Text>
              </View>
              {session.status === 'COMPLETED' ? (
                <Text style={[styles.summary, { color: colors.muted }]}>
                  {completedExercises} exercises completed
                  {skippedExercises > 0 ? ` · ${skippedExercises} skipped` : ''}
                  {session.difficultyRating
                    ? ` · ${session.difficultyRating
                        .replace('_', ' ')
                        .toLowerCase()}`
                    : ''}
                </Text>
              ) : null}
              {visionResults.map(result => (
                <View
                  key={result.exerciseId}
                  style={[
                    styles.visionSummary,
                    {
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.visionTitleRow}>
                    <AppIcon name="camera" color={colors.primary} size={13} />
                    <Text style={[styles.visionTitle, { color: colors.text }]}>
                      {result.exerciseName}
                    </Text>
                  </View>
                  <Text
                    style={[styles.visionMetrics, { color: colors.primary }]}
                  >
                    {result.completedRepetitions} reps ·{' '}
                    {result.formScore?.toFixed(0)}% form
                    {result.averageTempoSeconds
                      ? ` · ${result.averageTempoSeconds.toFixed(1)}s tempo`
                      : ''}
                  </Text>
                  {result.formFlags.length > 0 ? (
                    <Text style={[styles.formFlags, { color: colors.muted }]}>
                      {result.formFlags
                        .map(flag => flag.replaceAll('_', ' ').toLowerCase())
                        .join(' · ')}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

function formatSleep(minutes?: number) {
  if (!minutes) return 'No data';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function RecoveryMetric({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.recoveryMetric}>
      <Text style={[styles.recoveryValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.recoveryLabel, { color: colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontFamily: fonts.display, fontSize: 42 },
  recoveryHeading: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  recoveryMetrics: { flexDirection: 'row', gap: 8, marginVertical: 17 },
  recoveryMetric: { flex: 1, minWidth: 0 },
  recoveryValue: {
    fontFamily: fonts.displaySemibold,
    fontSize: 17,
  },
  recoveryLabel: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  weekBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 76,
    marginBottom: 17,
  },
  dayBarGroup: { alignItems: 'center', flex: 1, gap: 5 },
  barTrack: {
    borderRadius: 99,
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 9,
  },
  barFill: { borderRadius: 99, width: '100%' },
  dayLabel: { fontFamily: fonts.body, fontSize: 9, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  icon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  flex: { flex: 1 },
  cardTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  meta: { fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  status: { fontFamily: fonts.body, fontSize: 10, fontWeight: '900' },
  summary: { fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
  visionSummary: {
    borderRadius: 13,
    borderWidth: 1,
    gap: 5,
    marginTop: 12,
    padding: 12,
  },
  visionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  visionTitle: { fontFamily: fonts.body, fontSize: 12, fontWeight: '900' },
  visionMetrics: { fontFamily: fonts.body, fontSize: 12, fontWeight: '800' },
  formFlags: {
    fontFamily: fonts.body,
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
