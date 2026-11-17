import {
  formatTimer,
  WARM_UP_SECONDS,
  workoutMinimumSeconds,
} from '../src/features/workout/workoutTiming';
import type { WorkoutDay } from '../src/types/workout';

const workout: WorkoutDay = {
  day: 'MONDAY',
  title: 'Full body',
  estimatedMinutes: 9,
  estimatedCalories: 20,
  exercises: [
    {
      id: 'item-1',
      exercise: {
        id: 'exercise-1',
        code: 'BODYWEIGHT_SQUAT',
        name: 'Squat',
        instructions: 'Keep your chest tall.',
        muscleGroup: 'Lower body',
        equipment: 'Bodyweight',
        cameraSupported: true,
        estimatedCaloriesPer10Minutes: 50,
      },
      sets: 3,
      targetRepetitions: 10,
      restSeconds: 60,
      order: 1,
      cameraSupported: true,
      estimatedCalories: 20,
    },
  ],
};

describe('workout timing', () => {
  it('uses warm-up, movement and between-set rests for the minimum duration', () => {
    expect(WARM_UP_SECONDS).toBe(45);
    expect(workoutMinimumSeconds(workout)).toBe(255);
  });

  it('formats workout timers consistently', () => {
    expect(formatTimer(0)).toBe('00:00');
    expect(formatTimer(255)).toBe('04:15');
  });
});
