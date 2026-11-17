import { create } from 'zustand';

import type { CompletedVisionSet } from '../types/vision';

type VisionWorkoutState = {
  completedSets: Record<string, CompletedVisionSet>;
  publish: (result: CompletedVisionSet) => void;
  clear: (resultKey: string) => void;
};

export const useVisionWorkoutStore = create<VisionWorkoutState>(set => ({
  completedSets: {},
  publish: result =>
    set(state => ({
      completedSets: {
        ...state.completedSets,
        [result.resultKey]: result,
      },
    })),
  clear: resultKey =>
    set(state => {
      const completedSets = { ...state.completedSets };
      delete completedSets[resultKey];
      return { completedSets };
    }),
}));
