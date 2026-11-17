import {
  useIsFocused,
  useNavigation,
  usePreventRemove,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { useVisionWorkoutStore } from '../../store/visionWorkoutStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type {
  ExerciseCompletion,
  WorkoutDay,
  WorkoutPhase,
  WorkoutProgressCheckpoint,
  WorkoutSession,
} from '../../types/workout';
import { ExerciseDemonstration } from './ExerciseDemonstration';
import {
  createWorkoutCheckpoint,
  restoredWorkoutProgress,
  type ExerciseProgress,
} from './workoutProgress';
import {
  configureVoiceCoach,
  speakCoachCue,
  stopCoachVoice,
} from './voiceCoach';
import {
  formatTimer,
  WARM_UP_SECONDS,
  workoutMinimumSeconds,
} from './workoutTiming';

type Props = {
  workout: WorkoutDay;
  session: WorkoutSession;
  loading: boolean;
  onComplete: (results: ExerciseCompletion[]) => Promise<void>;
  onSaveAndExit: (checkpoint: WorkoutProgressCheckpoint) => Promise<void>;
  onSkip: () => void;
};

const DEMONSTRATION_SECONDS = 10;
const COUNTDOWN_SECONDS = 3;

function secondsSince(value?: string) {
  if (!value) return 0;
  const startedAt = new Date(value).getTime();
  if (Number.isNaN(startedAt)) return 0;

  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export function GuidedWorkoutRunner({
  workout,
  session,
  loading,
  onComplete,
  onSaveAndExit,
  onSkip,
}: Props) {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const isFocused = useIsFocused();
  const initialElapsed =
    (session.elapsedSeconds ?? 0) + secondsSince(session.activeSince);
  const initialExerciseIndex = Math.min(
    Math.max(0, session.currentExerciseIndex ?? 0),
    workout.exercises.length - 1,
  );
  const [phase, setPhase] = useState<WorkoutPhase>(
    session.currentPhase ?? 'WARM_UP',
  );
  const [phaseRemaining, setPhaseRemaining] = useState(
    session.phaseRemainingSeconds ?? WARM_UP_SECONDS,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsed);
  const [exerciseIndex, setExerciseIndex] = useState(initialExerciseIndex);
  const [setNumber, setSetNumber] = useState(
    Math.max(1, session.currentSetNumber ?? 1),
  );
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<ExerciseProgress>(() =>
    restoredWorkoutProgress(session),
  );
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [allowExit, setAllowExit] = useState(false);
  const [savingExit, setSavingExit] = useState(false);

  const exercise = workout.exercises[exerciseIndex];
  const visionResultKey = `${session.id}:${exercise.exercise.id}:${setNumber}`;
  const visionSetResult = useVisionWorkoutStore(
    state => state.completedSets[visionResultKey],
  );
  const clearVisionSetResult = useVisionWorkoutStore(state => state.clear);
  const isVisionSquat =
    exercise.cameraSupported && exercise.exercise.code === 'BODYWEIGHT_SQUAT';
  const requiredSeconds = useMemo(
    () =>
      workoutMinimumSeconds({
        ...workout,
        exercises: workout.exercises.filter(
          item => !progress[item.exercise.id]?.skipped,
        ),
      }),
    [progress, workout],
  );
  const completionRemaining = Math.max(0, requiredSeconds - elapsedSeconds);
  const workoutProgress = Math.min(
    100,
    Math.round((elapsedSeconds / requiredSeconds) * 100),
  );

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(
      () => setElapsedSeconds(value => value + 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (paused || phase === 'ACTIVE' || phase === 'COOLDOWN') return;

    const timer = setTimeout(() => {
      if (phaseRemaining > 1) {
        setPhaseRemaining(value => value - 1);
        return;
      }

      if (phase === 'WARM_UP' || phase === 'DEMO') {
        setPhase('COUNTDOWN');
        setPhaseRemaining(COUNTDOWN_SECONDS);
      } else if (phase === 'COUNTDOWN') {
        setPhase('ACTIVE');
        setPhaseRemaining(0);
      } else if (phase === 'REST') {
        setPhase('COUNTDOWN');
        setPhaseRemaining(COUNTDOWN_SECONDS);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [paused, phase, phaseRemaining]);

  useEffect(() => {
    configureVoiceCoach();
    return () => {
      stopCoachVoice().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (!voiceEnabled || paused || !isFocused) {
      stopCoachVoice().catch(() => undefined);
      return;
    }

    let cue: string | undefined;
    if (phase === 'WARM_UP') {
      cue =
        'Warm up for 45 seconds. Start with light marching, arm circles, and controlled mobility.';
    } else if (phase === 'DEMO') {
      cue = `Watch the ${exercise.exercise.name} demonstration. ${exercise.exercise.instructions}`;
    } else if (phase === 'ACTIVE') {
      cue = `Set ${setNumber} of ${exercise.sets}. Complete ${exercise.targetRepetitions} controlled repetitions.`;
    } else if (phase === 'REST') {
      cue = `Set complete. Rest for ${exercise.restSeconds} seconds.`;
    } else if (phase === 'COOLDOWN') {
      cue = 'All exercises are finished. Cool down and keep moving gently.';
    }

    if (!cue) return;
    speakCoachCue(cue).then(available => {
      if (!available) {
        setVoiceAvailable(false);
        setVoiceEnabled(false);
      }
    });
  }, [
    exercise.exercise.instructions,
    exercise.exercise.name,
    exercise.restSeconds,
    exercise.sets,
    exercise.targetRepetitions,
    isFocused,
    paused,
    phase,
    setNumber,
    voiceEnabled,
  ]);

  useEffect(() => {
    if (
      !voiceEnabled ||
      paused ||
      !isFocused ||
      phase !== 'COUNTDOWN' ||
      phaseRemaining < 1
    ) {
      return;
    }

    speakCoachCue(String(phaseRemaining)).then(available => {
      if (!available) {
        setVoiceAvailable(false);
        setVoiceEnabled(false);
      }
    });
  }, [isFocused, paused, phase, phaseRemaining, voiceEnabled]);

  useEffect(() => {
    if (!visionSetResult) return;

    clearVisionSetResult(visionResultKey);
    setProgress(current => {
      const existing = current[exercise.exercise.id];

      return {
        ...current,
        [exercise.exercise.id]: {
          completedSets: Math.max(existing?.completedSets ?? 0, setNumber),
          completedRepetitions: Math.max(
            existing?.completedRepetitions ?? 0,
            Math.min(exercise.targetRepetitions, visionSetResult.repetitions),
          ),
          skipped: false,
        },
      };
    });

    if (setNumber < exercise.sets) {
      setSetNumber(value => value + 1);
      setPhase('REST');
      setPhaseRemaining(exercise.restSeconds);
    } else if (exerciseIndex < workout.exercises.length - 1) {
      setExerciseIndex(value => value + 1);
      setSetNumber(1);
      setPhase('DEMO');
      setPhaseRemaining(DEMONSTRATION_SECONDS);
    } else {
      setPhase('COOLDOWN');
      setPhaseRemaining(0);
    }
  }, [
    clearVisionSetResult,
    exercise.exercise.id,
    exercise.restSeconds,
    exercise.sets,
    exercise.targetRepetitions,
    exerciseIndex,
    setNumber,
    visionResultKey,
    visionSetResult,
    workout.exercises.length,
  ]);

  const checkpoint = useMemo(
    () =>
      createWorkoutCheckpoint(workout, progress, {
        exerciseIndex,
        setNumber,
        phase,
        phaseRemaining,
      }),
    [exerciseIndex, phase, phaseRemaining, progress, setNumber, workout],
  );
  const completionResults: ExerciseCompletion[] = checkpoint.results;

  usePreventRemove(!allowExit, ({ data }) => {
    if (savingExit) {
      return;
    }

    Alert.alert(
      'Pause and leave workout?',
      'Leaving will pause this workout. Your completed sets and current exercise will be saved so you can continue from the same place later.',
      [
        { text: 'Keep training', style: 'cancel' },
        {
          text: 'Save and leave',
          onPress: async () => {
            setPaused(true);
            setSavingExit(true);

            try {
              await onSaveAndExit(checkpoint);
              setAllowExit(true);
              requestAnimationFrame(() => navigation.dispatch(data.action));
            } catch (caught) {
              setPaused(false);
              setSavingExit(false);
              Alert.alert(
                'Progress not saved',
                apiErrorMessage(
                  caught,
                  'GymBro could not save your position. Stay on this screen and try again.',
                ),
              );
            }
          },
        },
      ],
    );
  });

  function finishCurrentSet(completedRepetitions = exercise.targetRepetitions) {
    setProgress(current => {
      const existing = current[exercise.exercise.id];

      return {
        ...current,
        [exercise.exercise.id]: {
          completedSets: Math.max(existing?.completedSets ?? 0, setNumber),
          completedRepetitions: Math.max(
            existing?.completedRepetitions ?? 0,
            Math.min(exercise.targetRepetitions, completedRepetitions),
          ),
          skipped: false,
        },
      };
    });

    if (setNumber < exercise.sets) {
      setSetNumber(value => value + 1);
      setPhase('REST');
      setPhaseRemaining(exercise.restSeconds);
      return;
    }

    moveToNextExercise();
  }

  function openVisionCoach() {
    navigation.navigate('WorkoutCamera', {
      workoutSessionId: session.id,
      exerciseId: exercise.exercise.id,
      exerciseName: exercise.exercise.name,
      targetRepetitions: exercise.targetRepetitions,
      setNumber,
      resultKey: visionResultKey,
    });
  }

  function moveToNextExercise() {
    if (exerciseIndex < workout.exercises.length - 1) {
      setExerciseIndex(value => value + 1);
      setSetNumber(1);
      setPhase('DEMO');
      setPhaseRemaining(DEMONSTRATION_SECONDS);
      return;
    }

    setPhase('COOLDOWN');
    setPhaseRemaining(0);
  }

  function confirmSkipExercise() {
    Alert.alert(
      `Skip ${exercise.exercise.name}?`,
      'Only this exercise will be skipped. Any sets you already completed will be recorded, and the workout will continue with the next exercise.',
      [
        { text: 'Keep exercising', style: 'cancel' },
        {
          text: 'Skip exercise',
          style: 'destructive',
          onPress: () => {
            setProgress(current => {
              const existing = current[exercise.exercise.id];

              return {
                ...current,
                [exercise.exercise.id]: {
                  completedSets: existing?.completedSets ?? 0,
                  completedRepetitions: existing?.completedRepetitions ?? 0,
                  skipped: true,
                },
              };
            });
            moveToNextExercise();
          },
        },
      ],
    );
  }

  function phaseTitle() {
    if (phase === 'WARM_UP') return 'Warm up';
    if (phase === 'DEMO') return 'Watch the movement';
    if (phase === 'COUNTDOWN') return 'Get ready';
    if (phase === 'REST') return 'Recover';
    if (phase === 'COOLDOWN') return 'Session check';
    return exercise.exercise.name;
  }

  function toggleVoice() {
    setVoiceAvailable(true);
    setVoiceEnabled(value => {
      if (value) stopCoachVoice().catch(() => undefined);
      return !value;
    });
  }

  return (
    <Screen scroll>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            LIVE WORKOUT
          </Text>
          <Text style={[styles.sessionTitle, { color: colors.text }]}>
            {workout.title}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityLabel={
              voiceEnabled
                ? 'Turn voice coaching off'
                : 'Turn voice coaching on'
            }
            accessibilityRole="button"
            onPress={toggleVoice}
            style={[
              styles.controlButton,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <AppIcon
              name={voiceEnabled ? 'volume' : 'volumeOff'}
              color={colors.primary}
              size={16}
            />
          </Pressable>

          <Pressable
            accessibilityLabel={paused ? 'Resume workout' : 'Pause workout'}
            accessibilityRole="button"
            onPress={() => setPaused(value => !value)}
            style={[
              styles.controlButton,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <AppIcon
              name={paused ? 'play' : 'pause'}
              color={colors.primary}
              size={16}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.timerRow}>
        <View>
          <Text style={[styles.timerLabel, { color: colors.muted }]}>
            ELAPSED
          </Text>
          <Text style={[styles.timer, { color: colors.text }]}>
            {formatTimer(elapsedSeconds)}
          </Text>
        </View>

        <Text style={[styles.exerciseCount, { color: colors.muted }]}>
          Exercise {exerciseIndex + 1}/{workout.exercises.length}
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${workoutProgress}%` },
          ]}
        />
      </View>

      <Card style={styles.stageCard}>
        <Text style={[styles.phaseTitle, { color: colors.text }]}>
          {phaseTitle()}
        </Text>

        {phase === 'WARM_UP' ? (
          <>
            <View
              style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}
            >
              <AppIcon name="cardio" color={colors.primary} size={70} />
            </View>
            <Text style={[styles.largeTimer, { color: colors.primary }]}>
              {formatTimer(phaseRemaining)}
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              Raise your temperature with light marching, arm circles and
              controlled mobility.
            </Text>
          </>
        ) : null}

        {phase === 'DEMO' ? (
          <>
            <ExerciseDemonstration
              exercise={exercise.exercise}
              paused={paused}
            />
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              {exercise.exercise.name}
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              {exercise.exercise.instructions}
            </Text>
            <Text style={[styles.demoCountdown, { color: colors.primary }]}>
              Starting in {phaseRemaining}s
            </Text>
            {exercise.cameraSupported ? (
              <View
                style={[
                  styles.visionBadge,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <AppIcon name="camera" color={colors.primary} size={14} />
                <Text style={[styles.visionText, { color: colors.primary }]}>
                  Vision coaching supported
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        {phase === 'COUNTDOWN' ? (
          <>
            <Text style={[styles.countdown, { color: colors.primary }]}>
              {phaseRemaining}
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              Set {setNumber} of {exercise.sets} · {exercise.targetRepetitions}{' '}
              reps
            </Text>
          </>
        ) : null}

        {phase === 'ACTIVE' ? (
          <>
            <ExerciseDemonstration
              exercise={exercise.exercise}
              paused={paused}
            />
            <Text style={[styles.setLabel, { color: colors.primary }]}>
              SET {setNumber} OF {exercise.sets}
            </Text>
            <Text style={[styles.repTarget, { color: colors.text }]}>
              {exercise.targetRepetitions} reps
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              {isVisionSquat
                ? 'Position your full body in view. GymBro will count each complete squat and coach your form.'
                : 'Move with control and keep your breathing steady. Mark the set only after completing the target reps.'}
            </Text>
            <PrimaryButton
              label={isVisionSquat ? 'Open camera coach' : 'Set complete'}
              disabled={savingExit}
              onPress={isVisionSquat ? openVisionCoach : finishCurrentSet}
            />
          </>
        ) : null}

        {phase === 'REST' ? (
          <>
            <Text style={[styles.largeTimer, { color: colors.primary }]}>
              {formatTimer(phaseRemaining)}
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              Breathe slowly, loosen the working muscles and prepare for set{' '}
              {setNumber}.
            </Text>
          </>
        ) : null}

        {phase === 'COOLDOWN' ? (
          <>
            <View
              style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}
            >
              <AppIcon name="circleCheck" color={colors.primary} size={70} />
            </View>
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              All exercises finished
            </Text>
            <Text style={[styles.guidance, { color: colors.muted }]}>
              {completionRemaining > 0
                ? `Keep cooling down for ${formatTimer(
                    completionRemaining,
                  )}. Your plan's minimum safe session time has not finished yet.`
                : 'Your planned session time and every exercise are complete. Great work.'}
            </Text>
            <PrimaryButton
              label={
                completionRemaining > 0
                  ? `Complete in ${formatTimer(completionRemaining)}`
                  : 'Complete workout'
              }
              disabled={completionRemaining > 0}
              loading={loading}
              onPress={() => onComplete(completionResults)}
            />
          </>
        ) : null}

        {phase !== 'WARM_UP' && phase !== 'COOLDOWN' ? (
          <View style={styles.skipExercise}>
            <PrimaryButton
              label="Skip this exercise"
              disabled={loading || savingExit}
              variant="secondary"
              onPress={confirmSkipExercise}
            />
            <Text style={[styles.skipHint, { color: colors.muted }]}>
              The rest of your workout will continue.
            </Text>
          </View>
        ) : null}
      </Card>

      {paused ? (
        <Text style={[styles.paused, { color: colors.warning }]}>
          Workout paused.
        </Text>
      ) : null}

      {!voiceAvailable ? (
        <Text style={[styles.voiceNotice, { color: colors.warning }]}>
          Voice coaching is unavailable. Check that a text-to-speech voice is
          installed in your phone settings, then tap the muted speaker to retry.
        </Text>
      ) : null}

      <PrimaryButton
        label="End and skip workout"
        disabled={loading || savingExit}
        variant="danger"
        onPress={onSkip}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sessionTitle: { fontFamily: fonts.displaySemibold, fontSize: 28 },
  controls: { flexDirection: 'row', gap: 10 },
  controlButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  timerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  timer: { fontFamily: fonts.display, fontSize: 34 },
  exerciseCount: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  progressTrack: { borderRadius: 8, height: 7, overflow: 'hidden' },
  progressFill: { borderRadius: 8, height: '100%' },
  stageCard: { alignItems: 'center', gap: 15, paddingVertical: 26 },
  phaseTitle: {
    alignSelf: 'stretch',
    fontFamily: fonts.displaySemibold,
    fontSize: 25,
    textAlign: 'center',
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 80,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  largeTimer: { fontFamily: fonts.display, fontSize: 58 },
  guidance: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  exerciseName: {
    fontFamily: fonts.displaySemibold,
    fontSize: 27,
    textAlign: 'center',
  },
  demoCountdown: { fontFamily: fonts.body, fontSize: 14, fontWeight: '900' },
  visionBadge: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  visionText: { fontFamily: fonts.body, fontSize: 12, fontWeight: '800' },
  countdown: { fontFamily: fonts.display, fontSize: 118, lineHeight: 128 },
  setLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  repTarget: { fontFamily: fonts.display, fontSize: 48 },
  paused: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  voiceNotice: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  skipExercise: { alignSelf: 'stretch', gap: 7, marginTop: 6 },
  skipHint: { fontFamily: fonts.body, fontSize: 11, textAlign: 'center' },
});
