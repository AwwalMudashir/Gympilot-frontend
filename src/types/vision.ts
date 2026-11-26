export type SquatPhase = 'STANDING' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING';
export type CurlPhase = 'EXTENDED' | 'CURLING' | 'CONTRACTED' | 'LOWERING';
export type VisionPhase = SquatPhase | CurlPhase;
export type VisionExerciseCode = 'BODYWEIGHT_SQUAT' | 'BICEP_CURL';

export type VisionSession = {
  session_id: string;
  exercise: VisionExerciseCode;
  target_repetitions: number;
  repetitions: number;
  phase: VisionPhase;
  calibrated?: boolean;
};

export type VisionFrameResult = {
  session_id: string;
  pose_detected: boolean;
  repetitions: number;
  target_repetitions: number;
  phase: VisionPhase;
  calibrated?: boolean;
  knee_angle?: number;
  hip_angle?: number;
  forward_lean_angle?: number;
  elbow_angle?: number;
  upper_arm_angle?: number;
  form_flags: string[];
  feedback: string;
};

export type VisionSummary = {
  session_id: string;
  exercise: VisionExerciseCode;
  repetitions: number;
  target_repetitions: number;
  average_tempo_seconds?: number;
  form_flags: string[];
  score: number;
  completed: boolean;
};

export type VisionWorkoutResult = {
  workoutSessionId: string;
  exerciseId: string;
  completedSets: number;
  completedRepetitions: number;
  averageTempoSeconds?: number;
  formFlags: string[];
  score: number;
};

export type CompletedVisionSet = {
  resultKey: string;
  repetitions: number;
  score: number;
  formFlags: string[];
};
