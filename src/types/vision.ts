export type SquatPhase = 'STANDING' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING';

export type SquatSession = {
  session_id: string;
  exercise: 'BODYWEIGHT_SQUAT';
  target_repetitions: number;
  repetitions: number;
  phase: SquatPhase;
};

export type SquatFrameResult = {
  session_id: string;
  pose_detected: boolean;
  repetitions: number;
  target_repetitions: number;
  phase: SquatPhase;
  knee_angle?: number;
  hip_angle?: number;
  forward_lean_angle?: number;
  form_flags: string[];
  feedback: string;
};

export type SquatSummary = {
  session_id: string;
  exercise: 'BODYWEIGHT_SQUAT';
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
