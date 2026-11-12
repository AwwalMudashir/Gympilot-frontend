import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { StatusNotice } from '../../components/StatusNotice';
import { GuidedWorkoutRunner } from '../../features/workout/GuidedWorkoutRunner';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { workoutApi } from '../../services/workoutApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { DayOfWeek } from '../../types/profile';
import type {
  ExerciseCompletion,
  WorkoutDay,
  WorkoutProgressCheckpoint,
  WorkoutSession,
} from '../../types/workout';

type Props = NativeStackScreenProps<MainStackParamList, 'WorkoutDetail'>;

const DAY_INDEX: Record<DayOfWeek, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

function planDate(weekStart: string, day: DayOfWeek) {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + DAY_INDEX[day]);
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isScheduledToday(session: WorkoutSession) {
  return session.scheduledDate === localDateValue();
}

export function WorkoutDetailScreen({ route }: Props) {
  const { colors } = useTheme();
  const [workout, setWorkout] = useState<WorkoutDay>();
  const [session, setSession] = useState<WorkoutSession>();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string>();
  const desiredDay = route.params?.day;

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const plan = await workoutApi.currentPlan();
      const desired =
        desiredDay ??
        new Date()
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toUpperCase();
      const selected = plan.days.find(day => day.day === desired);

      setWorkout(selected);
      if (selected) {
        const prepared = await workoutApi.prepareSession(
          plan.id,
          selected.day,
          planDate(plan.weekStartDate, selected.day),
        );
        const ready =
          prepared.status === 'IN_PROGRESS' && isScheduledToday(prepared)
            ? await workoutApi.startSession(prepared.id)
            : prepared;
        setSession(ready);
      }
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [desiredDay]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(
    action: () => Promise<WorkoutSession>,
    success: string,
  ) {
    setActionLoading(true);
    setError(undefined);

    try {
      setSession(await action());
      Alert.alert('GymPilot', success);
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      Alert.alert('Could not update workout', message);
    } finally {
      setActionLoading(false);
    }
  }

  async function saveProgressAndExit(checkpoint: WorkoutProgressCheckpoint) {
    if (!session) return;

    setActionLoading(true);
    setError(undefined);

    try {
      setSession(await workoutApi.pauseSession(session.id, checkpoint));
    } catch (caught) {
      setError(apiErrorMessage(caught));
      throw caught;
    } finally {
      setActionLoading(false);
    }
  }

  function reschedule() {
    if (!session) return;

    Alert.alert('Reschedule workout', 'Choose a new date.', [
      {
        text: 'Tomorrow',
        onPress: () =>
          runAction(
            () =>
              workoutApi.rescheduleSession(
                session.id,
                addDays(session.scheduledDate, 1),
              ),
            'Workout moved to tomorrow.',
          ),
      },
      {
        text: 'In 2 days',
        onPress: () =>
          runAction(
            () =>
              workoutApi.rescheduleSession(
                session.id,
                addDays(session.scheduledDate, 2),
              ),
            'Workout moved by two days.',
          ),
      },
      {
        text: 'Next week',
        onPress: () =>
          runAction(
            () =>
              workoutApi.rescheduleSession(
                session.id,
                addDays(session.scheduledDate, 7),
              ),
            'Workout moved to next week.',
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function skipInProgressWorkout() {
    if (!session) return;

    Alert.alert(
      'Skip the whole workout?',
      'This ends today’s entire workout. To skip only one movement, start or continue the workout and choose “Skip this exercise”.',
      [
        { text: 'Keep training', style: 'cancel' },
        {
          text: 'End and skip',
          style: 'destructive',
          onPress: () =>
            runAction(
              () => workoutApi.skipSession(session.id),
              'Workout marked as skipped.',
            ),
        },
      ],
    );
  }

  if (loading) {
    return (
      <Screen>
        <StateView
          title="Loading workout"
          message="Getting your session ready."
        />
      </Screen>
    );
  }

  if (!workout || !session) {
    return (
      <Screen>
        <StateView
          title="Recovery day"
          message={
            error ??
            'No training is scheduled for this day. Recovery is part of the plan.'
          }
          icon="moon"
        />
      </Screen>
    );
  }

  const scheduledToday = isScheduledToday(session);

  if (session.status === 'IN_PROGRESS' && scheduledToday) {
    return (
      <GuidedWorkoutRunner
        workout={workout}
        session={session}
        loading={actionLoading}
        error={error}
        onComplete={(results: ExerciseCompletion[]) =>
          runAction(
            () => workoutApi.completeSession(session.id, results),
            'Great work — this session is now in your history.',
          )
        }
        onSaveAndExit={saveProgressAndExit}
        onSkip={skipInProgressWorkout}
      />
    );
  }

  const finalised =
    session.status === 'COMPLETED' || session.status === 'SKIPPED';

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>
        {workout.day}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {workout.title}
      </Text>

      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: colors.muted }]}>
          {workout.exercises.length} exercises
        </Text>
        <Text style={[styles.metaText, { color: colors.muted }]}>
          {workout.estimatedMinutes} min
        </Text>
      </View>

      {!finalised && !scheduledToday ? (
        <StatusNotice
          message={`This workout is scheduled for ${session.scheduledDate}. It can only be started on that date.`}
        />
      ) : null}

      {workout.exercises.map((item, index) => (
        <Card key={item.id}>
          <View style={styles.exerciseRow}>
            <Text style={[styles.number, { color: colors.primary }]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <View style={styles.flex}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.exercise.name}
              </Text>
              <Text style={[styles.prescription, { color: colors.primary }]}>
                {item.sets} sets × {item.targetRepetitions} reps
              </Text>
            </View>
            {item.cameraSupported ? (
              <AppIcon name="camera" color={colors.primary} />
            ) : null}
          </View>

          <Text style={[styles.instructions, { color: colors.muted }]}>
            {item.exercise.instructions}
          </Text>
          <View style={[styles.rest, { borderTopColor: colors.border }]}>
            <AppIcon name="clock" color={colors.muted} size={13} />
            <Text style={[styles.restText, { color: colors.muted }]}>
              {item.restSeconds}s rest between sets
            </Text>
          </View>
        </Card>
      ))}

      <StatusNotice message={error} tone="error" />

      {finalised ? (
        <Card
          style={{
            backgroundColor:
              session.status === 'COMPLETED'
                ? colors.primarySoft
                : colors.surface,
          }}
        >
          <Text style={[styles.finalTitle, { color: colors.text }]}>
            {session.status === 'COMPLETED'
              ? 'Workout complete'
              : 'Workout skipped'}
          </Text>
          <Text style={[styles.instructions, { color: colors.muted }]}>
            This session is saved in your workout history.
          </Text>
        </Card>
      ) : (
        <>
          <PrimaryButton
            label={
              session.status === 'IN_PROGRESS'
                ? 'Continue workout'
                : 'Start workout'
            }
            disabled={!scheduledToday || actionLoading}
            loading={actionLoading}
            onPress={() =>
              runAction(
                () => workoutApi.startSession(session.id),
                'Workout started. You’ve got this.',
              )
            }
          />
          <PrimaryButton
            label="Reschedule"
            disabled={actionLoading}
            variant="secondary"
            onPress={reschedule}
          />
          <PrimaryButton
            label="Skip workout"
            disabled={!scheduledToday || actionLoading}
            variant="danger"
            onPress={skipInProgressWorkout}
          />
        </>
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
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  exerciseRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  number: { fontFamily: fonts.display, fontSize: 25 },
  flex: { flex: 1 },
  name: { fontFamily: fonts.displaySemibold, fontSize: 22 },
  prescription: { fontFamily: fonts.body, fontSize: 13, fontWeight: '800' },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  rest: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
  },
  restText: { fontFamily: fonts.body, fontSize: 12 },
  error: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  finalTitle: { fontFamily: fonts.displaySemibold, fontSize: 23 },
});
