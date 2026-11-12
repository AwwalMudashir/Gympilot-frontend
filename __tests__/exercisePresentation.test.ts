import {exerciseIcon} from '../src/config/exercisePresentation';

const exercise = (code: string, name: string, muscleGroup: string, equipment: string) => ({
  code,
  name,
  muscleGroup,
  equipment,
});

describe('exerciseIcon', () => {
  it('uses exercise-specific icons for known catalogue movements', () => {
    expect(exerciseIcon(exercise('BODYWEIGHT_SQUAT', 'Bodyweight Squat', 'Lower body', 'Bodyweight'))).toBe('squat');
    expect(exerciseIcon(exercise('PLANK', 'Forearm Plank', 'Core', 'Bodyweight'))).toBe('core');
    expect(exerciseIcon(exercise('BENCH_STEP_UP', 'Bench Step-Up', 'Lower body', 'Bench'))).toBe('step');
    expect(exerciseIcon(exercise('SUSPENSION_ROW', 'Suspension Trainer Row', 'Back', 'Suspension trainer'))).toBe('pull');
  });

  it('derives a useful category icon for future exercises', () => {
    expect(exerciseIcon(exercise('NEW_PUSH', 'Incline Push-up', 'Chest', 'Bodyweight'))).toBe('push');
    expect(exerciseIcon(exercise('NEW_CORE', 'Side Crunch', 'Core', 'Bodyweight'))).toBe('core');
  });
});
