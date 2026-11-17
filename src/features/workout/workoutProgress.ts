import type {
  WorkoutDay,
  WorkoutPhase,
  WorkoutProgressCheckpoint,
  WorkoutSession,
} from '../../types/workout';

export type ExerciseProgress = Record<
  string,
  { completedSets: number; completedRepetitions: number; skipped: boolean }
>;

type CheckpointPosition = {
  exerciseIndex: number;
  setNumber: number;
  phase: WorkoutPhase;
  phaseRemaining: number;
};

export function restoredWorkoutProgress(
  session: WorkoutSession,
): ExerciseProgress {
  return session.results.reduce<ExerciseProgress>((progress, result) => {
    if (!result.exerciseId) return progress;

    progress[result.exerciseId] = {
      completedSets: Math.max(0, Number(result.completedSets) || 0),
      completedRepetitions: Math.max(
        0,
        Number(result.completedRepetitions) || 0,
      ),
      skipped: Boolean(result.skipped),
    };
    return progress;
  }, {});
}

export function createWorkoutCheckpoint(
  workout: WorkoutDay,
  progress: ExerciseProgress,
  position: CheckpointPosition,
): WorkoutProgressCheckpoint {
  const results = workout.exercises.map(item => {
    if (!item.exercise.id) {
      throw new Error(
        `Cannot save ${item.exercise.name} because its exercise ID is missing. Refresh the workout and try again.`,
      );
    }

    const completed = progress[item.exercise.id];

    return {
      exerciseId: item.exercise.id,
      completedSets: Math.max(0, Number(completed?.completedSets) || 0),
      completedRepetitions: Math.max(
        0,
        Number(completed?.completedRepetitions) || 0,
      ),
      skipped: Boolean(completed?.skipped),
    };
  });

  return {
    currentExerciseIndex: Math.max(0, Number(position.exerciseIndex) || 0),
    currentSetNumber: Math.max(1, Number(position.setNumber) || 1),
    currentPhase: position.phase || 'WARM_UP',
    phaseRemainingSeconds: Math.max(0, Number(position.phaseRemaining) || 0),
    results,
  };
}
