import type { WorkoutDay } from '../../types/workout';

export const WARM_UP_SECONDS = 45;
const REPETITION_SECONDS = 3;
const EXERCISE_TRANSITION_SECONDS = 45;

export function workoutMinimumSeconds(workout: WorkoutDay) {
  const movementSeconds = workout.exercises.reduce(
    (total, item) =>
      total + item.sets * item.targetRepetitions * REPETITION_SECONDS,
    0,
  );
  const restSeconds = workout.exercises.reduce(
    (total, item) => total + Math.max(0, item.sets - 1) * item.restSeconds,
    0,
  );
  const transitionSeconds =
    Math.max(0, workout.exercises.length - 1) * EXERCISE_TRANSITION_SECONDS;

  return WARM_UP_SECONDS + movementSeconds + restSeconds + transitionSeconds;
}

export function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
}
