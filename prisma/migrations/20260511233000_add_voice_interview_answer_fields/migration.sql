-- Additive voice interview fields.

ALTER TABLE "public"."recruiting_interview_answers"
ADD COLUMN "answerType" TEXT,
ADD COLUMN "durationSeconds" INTEGER,
ADD COLUMN "transcriptionStatus" TEXT,
ADD COLUMN "transcriptionConfidence" DOUBLE PRECISION,
ADD COLUMN "realtimeTranscript" JSONB,
ADD COLUMN "aiSignals" JSONB;
