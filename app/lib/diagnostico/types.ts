export type QuestionType = "scale" | "multiple";

export type EvidenceOption = {
  id: string;
  label: string;
};

export type WeightedChoice = {
  id: string;
  label: string;
  points: number;
};

export type DiagnosticQuestion = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  weight: number;
  required?: boolean;
  allowNotApplicable?: boolean;

  scaleMinLabel?: string;
  scaleMaxLabel?: string;

  choices?: WeightedChoice[];
  evidence?: EvidenceOption[];
  hasNotes?: boolean;
};

export type DiagnosticBlock = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  weight: 100;
  allowNotApplicable?: boolean;
  questions: DiagnosticQuestion[];
};

export type ScaleAnswerValue = 1 | 2 | 3 | 4 | 5;

export type QuestionAnswer = {
  questionId: string;
  applicable: boolean;
  scaleValue?: ScaleAnswerValue;
  choiceId?: string;
  evidenceIds?: string[];
  notes?: string;
};

export type BlockAnswer = {
  blockId: string;
  applicable: boolean;
  answers: QuestionAnswer[];
};

export type TenantProfile = {
  companyName: string;
  industry: string;
  businessType: string;
  companySize?: string;
};

export type DiagnosticFormState = {
  tenantProfile: TenantProfile;
  blocks: BlockAnswer[];
};

export type QuestionScoreDetail = {
  questionId: string;
  originalWeight: number;
  effectiveWeight: number;
  applicable: boolean;
  earnedPoints: number;
};

export type BlockScoreDetail = {
  blockId: string;
  applicable: boolean;
  maxPoints: number;
  earnedPoints: number;
  questions: QuestionScoreDetail[];
};

export type GlobalScoreDetail = {
  maxPoints: number;
  earnedPoints: number;
  blocks: BlockScoreDetail[];
};