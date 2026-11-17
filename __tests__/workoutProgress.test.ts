import {
  createWorkoutCheckpoint,
  restoredWorkoutProgress,
} from '../src/features/workout/workoutProgress';
import type { WorkoutDay, WorkoutSession } from '../src/types/workout';

const workout: WorkoutDay = {
  day: 'MONDAY',
  title: 'Strength session',
  estimatedMinutes: 30,
  estimatedCalories: 18,
  exercises: [
    {
      id: 'plan-item-1',
      exercise: {
        id: 'exercise-1',
        code: 'PUSH_UP',
        name: 'Push-up',
        instructions: 'Lower with control.',
        muscleGroup: 'Upper body',
        equipment: 'Bodyweight',
        cameraSupported: false,
        estimatedCaloriesPer10Minutes: 42,
      },
      sets: 3,
      targetRepetitions: 10,
      restSeconds: 45,
      order: 1,
      cameraSupported: false,
      estimatedCalories: 18,
    },
  ],
};

describe('workout progress checkpoints', () => {
  it('always sends a complete, non-null pause payload', () => {
    const checkpoint = createWorkoutCheckpoint(
      workout,
      {
        'exercise-1': {
          completedSets: 1,
          completedRepetitions: 10,
          skipped: false,
        },
      },
      {
        exerciseIndex: 0,
        setNumber: 2,
        phase: 'REST',
        phaseRemaining: 30,
      },
    );

    expect(checkpoint).toEqual({
      currentExerciseIndex: 0,
      currentSetNumber: 2,
      currentPhase: 'REST',
      phaseRemainingSeconds: 30,
      results: [
        {
          exerciseId: 'exercise-1',
          completedSets: 1,
          completedRepetitions: 10,
          skipped: false,
        },
      ],
    });
  });

  it('normalizes legacy null progress values instead of sending null', () => {
    const restored = restoredWorkoutProgress({
      results: [
        {
          exerciseId: 'exercise-1',
          completedSets: null,
          completedRepetitions: null,
          skipped: false,
        },
      ],
    } as unknown as WorkoutSession);

    expect(restored['exercise-1']).toEqual({
      completedSets: 0,
      completedRepetitions: 0,
      skipped: false,
    });
  });

  it('does not send a result without an exercise ID', () => {
    const invalidWorkout = {
      ...workout,
      exercises: [
        {
          ...workout.exercises[0],
          exercise: { ...workout.exercises[0].exercise, id: '' },
        },
      ],
    };

    expect(() =>
      createWorkoutCheckpoint(
        invalidWorkout,
        {},
        {
          exerciseIndex: 0,
          setNumber: 1,
          phase: 'ACTIVE',
          phaseRemaining: 0,
        },
      ),
    ).toThrow('exercise ID is missing');
  });
});
