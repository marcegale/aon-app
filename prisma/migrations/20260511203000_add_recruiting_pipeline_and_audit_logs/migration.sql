-- Additive recruiting pipeline and audit log support.

CREATE TYPE "public"."RecruitingPipelineStage" AS ENUM (
  'applied',
  'screening',
  'shortlisted',
  'interview',
  'technical',
  'offer',
  'hired',
  'rejected'
);

ALTER TABLE "public"."recruiting_candidates"
ADD COLUMN "pipelineStage" "public"."RecruitingPipelineStage" NOT NULL DEFAULT 'applied',
ADD COLUMN "pipelineUpdatedAt" TIMESTAMP(3);

CREATE INDEX "recruiting_candidates_pipelineStage_idx"
ON "public"."recruiting_candidates"("pipelineStage");

CREATE INDEX "recruiting_candidates_searchId_pipelineStage_idx"
ON "public"."recruiting_candidates"("searchId", "pipelineStage");

CREATE TABLE "public"."recruiting_candidate_audit_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "previousValue" TEXT,
  "newValue" TEXT,
  "actorUserId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_candidate_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_candidate_audit_logs_tenantId_idx"
ON "public"."recruiting_candidate_audit_logs"("tenantId");

CREATE INDEX "recruiting_candidate_audit_logs_candidateId_idx"
ON "public"."recruiting_candidate_audit_logs"("candidateId");

CREATE INDEX "recruiting_candidate_audit_logs_searchId_idx"
ON "public"."recruiting_candidate_audit_logs"("searchId");

CREATE INDEX "recruiting_candidate_audit_logs_action_idx"
ON "public"."recruiting_candidate_audit_logs"("action");

ALTER TABLE "public"."recruiting_candidate_audit_logs"
ADD CONSTRAINT "recruiting_candidate_audit_logs_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_candidate_audit_logs"
ADD CONSTRAINT "recruiting_candidate_audit_logs_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
