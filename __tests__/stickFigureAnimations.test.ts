import {
  stickFigureAnimationFor,
  stickFigureMotionNameFor,
} from '../src/features/workout/stickFigureAnimations';

const exerciseCodes = [
  'PUSH_UP',
  'GLUTE_BRIDGE',
  'REVERSE_LUNGE',
  'PLANK',
  'DEAD_BUG',
  'MOUNTAIN_CLIMBER',
  'DUMBBELL_ROW',
  'SHOULDER_PRESS',
  'BAND_PULL_APART',
  'BANDED_GLUTE_WALK',
  'BENCH_DIP',
  'BENCH_STEP_UP',
  'KETTLEBELL_GOBLET_SQUAT',
  'SMITH_MACHINE_SQUAT',
  'KETTLEBELL_DEADLIFT',
  'BARBELL_ROMANIAN_DEADLIFT',
  'BARBELL_BENT_ROW',
  'MEDICINE_BALL_SLAM',
  'ASSISTED_PULL_UP',
  'HANGING_KNEE_RAISE',
  'CABLE_CHEST_PRESS',
  'CABLE_LAT_PULLDOWN',
  'LEG_PRESS',
  'STABILITY_BALL_LEG_CURL',
  'SUSPENSION_ROW',
  'PLYO_BOX_STEP_UP',
  'AB_WHEEL_ROLLOUT',
];

describe('exercise stick-figure animations', () => {
  it.each(exerciseCodes)(
    'maps %s to a valid looping Lottie composition',
    code => {
      const animation = stickFigureAnimationFor(code);

      expect(animation.nm).toContain('Stick Figure');
      expect(animation.op).toBe(60);
      expect(animation.layers.length).toBeGreaterThanOrEqual(7);
      expect(animation.layers.some(layer => layer.nm === 'Head')).toBe(true);
      expect(animation.layers.some(layer => layer.nm === 'Torso')).toBe(true);
    },
  );

  it('uses different motion families for unrelated exercises', () => {
    expect(stickFigureMotionNameFor('PUSH_UP')).not.toBe(
      stickFigureMotionNameFor('KETTLEBELL_DEADLIFT'),
    );
    expect(stickFigureMotionNameFor('CABLE_LAT_PULLDOWN')).not.toBe(
      stickFigureMotionNameFor('REVERSE_LUNGE'),
    );
  });

  it('does not reuse the bench animation for a plyo box step-up', () => {
    expect(stickFigureMotionNameFor('PLYO_BOX_STEP_UP')).toBe(
      'Plyo Box Step Up',
    );
    expect(stickFigureMotionNameFor('PLYO_BOX_STEP_UP')).not.toBe(
      stickFigureMotionNameFor('BENCH_STEP_UP'),
    );
  });

  it('uses equipment-specific squat and row demonstrations', () => {
    expect(stickFigureMotionNameFor('KETTLEBELL_GOBLET_SQUAT')).toBe(
      'Kettlebell Goblet Squat',
    );
    expect(stickFigureMotionNameFor('SMITH_MACHINE_SQUAT')).toBe(
      'Smith Machine Squat',
    );
    expect(stickFigureMotionNameFor('DUMBBELL_ROW')).toBe(
      'One Arm Dumbbell Row',
    );
  });
});
