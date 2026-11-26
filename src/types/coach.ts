export type CoachBriefType = 'DAILY' | 'WEEKLY';
export type CoachGenerationSource = 'OLLAMA' | 'FALLBACK' | 'UNKNOWN';
export type CoachFeedback = 'HELPFUL' | 'NOT_USEFUL';

export type CoachBrief = {
  id: string;
  briefType: CoachBriefType;
  summary: string;
  focusToday: string;
  cautions: string[];
  evidence: string[];
  missingData: string[];
  generationSource: CoachGenerationSource;
  feedback?: CoachFeedback;
  feedbackAt?: string;
  generatedAt: string;
};
