-- Additive interview intelligence foundation for Recruiting Agent.

CREATE TABLE "public"."recruiting_interview_sessions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "publicToken" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "interviewScore" INTEGER,
  "interviewSummary" TEXT,
  "interviewReport" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_interview_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_interview_questions" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "question" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_interview_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_interview_answers" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "answerText" TEXT,
  "transcript" TEXT,
  "audioUrl" TEXT,
  "score" INTEGER,
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_interview_answers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recruiting_interview_sessions_publicToken_key"
ON "public"."recruiting_interview_sessions"("publicToken");

CREATE INDEX "recruiting_interview_sessions_tenantId_idx"
ON "public"."recruiting_interview_sessions"("tenantId");

CREATE INDEX "recruiting_interview_sessions_searchId_idx"
ON "public"."recruiting_interview_sessions"("searchId");

CREATE INDEX "recruiting_interview_sessions_candidateId_idx"
ON "public"."recruiting_interview_sessions"("candidateId");

CREATE INDEX "recruiting_interview_sessions_status_idx"
ON "public"."recruiting_interview_sessions"("status");

CREATE INDEX "recruiting_interview_sessions_expiresAt_idx"
ON "public"."recruiting_interview_sessions"("expiresAt");

CREATE INDEX "recruiting_interview_sessions_publicToken_idx"
ON "public"."recruiting_interview_sessions"("publicToken");

CREATE UNIQUE INDEX "recruiting_interview_questions_sessionId_order_key"
ON "public"."recruiting_interview_questions"("sessionId", "order");

CREATE INDEX "recruiting_interview_questions_sessionId_idx"
ON "public"."recruiting_interview_questions"("sessionId");

CREATE UNIQUE INDEX "recruiting_interview_answers_sessionId_questionId_key"
ON "public"."recruiting_interview_answers"("sessionId", "questionId");

CREATE INDEX "recruiting_interview_answers_sessionId_idx"
ON "public"."recruiting_interview_answers"("sessionId");

CREATE INDEX "recruiting_interview_answers_questionId_idx"
ON "public"."recruiting_interview_answers"("questionId");

ALTER TABLE "public"."recruiting_interview_sessions"
ADD CONSTRAINT "recruiting_interview_sessions_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_interview_sessions"
ADD CONSTRAINT "recruiting_interview_sessions_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_interview_questions"
ADD CONSTRAINT "recruiting_interview_questions_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "public"."recruiting_interview_sessions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_interview_answers"
ADD CONSTRAINT "recruiting_interview_answers_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "public"."recruiting_interview_sessions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_interview_answers"
ADD CONSTRAINT "recruiting_interview_answers_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "public"."recruiting_interview_questions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
