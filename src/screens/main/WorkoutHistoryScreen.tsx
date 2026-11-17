import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { apiErrorMessage } from '../../services/http';
import { workoutApi } from '../../services/workoutApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { WorkoutSession } from '../../types/workout';

export function WorkoutHistoryScreen() {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSessions(await workoutApi.history());
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

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontFamily: fonts.display, fontSize: 42 },
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
