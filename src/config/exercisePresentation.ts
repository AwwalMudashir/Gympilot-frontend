import type { AppIconName } from '../components/AppIcon';
import type { Exercise } from '../types/workout';

const iconByCode: Record<string, AppIconName> = {
  BODYWEIGHT_SQUAT: 'squat',
  BICEP_CURL: 'dumbbell',
  PUSH_UP: 'push',
  GLUTE_BRIDGE: 'lowerBody',
  REVERSE_LUNGE: 'lowerBody',
  PLANK: 'core',
  DEAD_BUG: 'core',
  MOUNTAIN_CLIMBER: 'cardio',
  DUMBBELL_ROW: 'pull',
  SHOULDER_PRESS: 'verticalMove',
  BAND_PULL_APART: 'pull',
  BANDED_GLUTE_WALK: 'lowerBody',
  BENCH_DIP: 'push',
  BENCH_STEP_UP: 'step',
  KETTLEBELL_GOBLET_SQUAT: 'squat',
  KETTLEBELL_DEADLIFT: 'weight',
  BARBELL_ROMANIAN_DEADLIFT: 'weight',
  BARBELL_BENT_ROW: 'pull',
  MEDICINE_BALL_SLAM: 'cardio',
  ASSISTED_PULL_UP: 'verticalMove',
  HANGING_KNEE_RAISE: 'core',
  CABLE_CHEST_PRESS: 'push',
  CABLE_LAT_PULLDOWN: 'verticalMove',
  SMITH_MACHINE_SQUAT: 'squat',
  LEG_PRESS: 'verticalMove',
  STABILITY_BALL_LEG_CURL: 'lowerBody',
  SUSPENSION_ROW: 'pull',
  PLYO_BOX_STEP_UP: 'step',
  AB_WHEEL_ROLLOUT: 'core',
};

type ExerciseDescriptor = Pick<
  Exercise,
  'code' | 'equipment' | 'muscleGroup' | 'name'
>;

export function exerciseIcon(exercise: ExerciseDescriptor): AppIconName {
  const exactIcon = iconByCode[exercise.code.toUpperCase()];
  if (exactIcon) return exactIcon;

  const description =
    `${exercise.name} ${exercise.muscleGroup} ${exercise.equipment}`.toLowerCase();
  if (/\b(run|running|climber|conditioning|slam)\b/.test(description))
    return 'cardio';
  if (/core|ab|plank|crunch|knee raise|dead bug/.test(description))
    return 'core';
  if (/step|stairs|box/.test(description)) return 'step';
  if (/squat/.test(description)) return 'squat';
  if (/row|pull|back/.test(description)) return 'pull';
  if (/press|push|dip|chest|triceps/.test(description)) return 'push';
  if (/lunge|glute|leg|lower body|hamstring/.test(description))
    return 'lowerBody';
  if (/barbell|kettlebell|medicine ball/.test(description)) return 'weight';
  return 'dumbbell';
}
