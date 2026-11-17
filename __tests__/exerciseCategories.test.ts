import {
  matchesExerciseFilter,
  type ExerciseFilter,
} from '../src/config/exerciseCategories';
import type { Exercise } from '../src/types/workout';

function exercise(
  code: string,
  muscleGroup: string,
  equipment = 'Bodyweight',
  cameraSupported = false,
): Exercise {
  return {
    id: code,
    code,
    name: code,
    instructions: 'Move with control.',
    muscleGroup,
    equipment,
    cameraSupported,
    estimatedCaloriesPer10Minutes: 42,
  };
}

function matches(item: Exercise, filter: ExerciseFilter) {
  return matchesExerciseFilter(item, filter);
}

describe('exercise catalogue categories', () => {
  it('separates vision exercises from the rest of the catalogue', () => {
    expect(
      matches(
        exercise('BODYWEIGHT_SQUAT', 'Lower body', 'Bodyweight', true),
        'VISION',
      ),
    ).toBe(true);
    expect(matches(exercise('PUSH_UP', 'Upper body'), 'VISION')).toBe(false);
  });

  it('classifies goal and movement filters', () => {
    expect(
      matches(exercise('MOUNTAIN_CLIMBER', 'Conditioning'), 'WEIGHT_LOSS'),
    ).toBe(true);
    expect(
      matches(exercise('BICEP_CURL', 'Arms', 'Dumbbells'), 'STRENGTH'),
    ).toBe(true);
    expect(matches(exercise('PLANK', 'Core'), 'CORE')).toBe(true);
    expect(
      matches(exercise('DUMBBELL_ROW', 'Back', 'Dumbbells'), 'UPPER_BODY'),
    ).toBe(true);
    expect(matches(exercise('REVERSE_LUNGE', 'Lower body'), 'LOWER_BODY')).toBe(
      true,
    );
  });
});
