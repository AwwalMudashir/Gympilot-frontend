import type { Exercise } from '../types/workout';

export type ExerciseFilter =
  | 'ALL'
  | 'VISION'
  | 'STRENGTH'
  | 'WEIGHT_LOSS'
  | 'UPPER_BODY'
  | 'LOWER_BODY'
  | 'CORE'
  | 'BODYWEIGHT';

export const exerciseFilterOptions: {
  value: ExerciseFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'All' },
  { value: 'VISION', label: 'Vision' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'WEIGHT_LOSS', label: 'Lose weight' },
  { value: 'UPPER_BODY', label: 'Upper body' },
  { value: 'LOWER_BODY', label: 'Lower body' },
  { value: 'CORE', label: 'Core' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
];

const weightLossMovements = new Set([
  'BODYWEIGHT_SQUAT',
  'PUSH_UP',
  'REVERSE_LUNGE',
  'MOUNTAIN_CLIMBER',
  'BENCH_STEP_UP',
  'KETTLEBELL_GOBLET_SQUAT',
  'MEDICINE_BALL_SLAM',
  'PLYO_BOX_STEP_UP',
]);

export function matchesExerciseFilter(
  exercise: Exercise,
  filter: ExerciseFilter,
) {
  const muscleGroup = exercise.muscleGroup.toLowerCase();

  switch (filter) {
    case 'ALL':
      return true;
    case 'VISION':
      return exercise.cameraSupported;
    case 'STRENGTH':
      return muscleGroup !== 'conditioning';
    case 'WEIGHT_LOSS':
      return (
        muscleGroup === 'conditioning' ||
        weightLossMovements.has(exercise.code.toUpperCase())
      );
    case 'UPPER_BODY':
      return /upper|arm|back|shoulder|chest/.test(muscleGroup);
    case 'LOWER_BODY':
      return /lower|posterior|glute|leg|hamstring/.test(muscleGroup);
    case 'CORE':
      return muscleGroup.includes('core');
    case 'BODYWEIGHT':
      return exercise.equipment.toLowerCase() === 'bodyweight';
  }
}

export function exerciseCategoryLabels(exercise: Exercise) {
  return exerciseFilterOptions
    .filter(
      option =>
        option.value !== 'ALL' &&
        option.value !== 'STRENGTH' &&
        matchesExerciseFilter(exercise, option.value),
    )
    .map(option => option.label);
}
