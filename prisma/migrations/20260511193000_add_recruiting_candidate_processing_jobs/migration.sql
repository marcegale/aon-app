-- Additive async processing support for Recruiting email ingestion.

CREATE TYPE "public"."ProcessingStatus" AS ENUM (
  'pending',
  'queued',
  'processing',
  'retrying',
  'completed',
  'failed',
  'skipped'
);

ALTER TABLE "public"."recruiting_candidates"
ADD COLUMN "processingStatus" "public"."ProcessingStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "processingError" TEXT;

CREATE TABLE "public"."recruiting_candidate_processing_jobs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "candidateId" TEXT,
  "connectionId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'gmail',
  "providerMessageId" TEXT NOT NULL,
  "gmailAttachmentId" TEXT NOT NULL,
  "attachmentFileName" TEXT NOT NULL,
  "attachmentMimeType" TEXT NOT NULL,
  "fromEmail" TEXT,
  "subject" TEXT,
  "refCode" TEXT NOT NULL,
  "processingStatus" "public"."ProcessingStatus" NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 4,
  "triggerRunId" TEXT,
  "cvHash" TEXT,
  "errorMessage" TEXT,
  "errorStack" TEXT,
  "logs" JSONB,
  "metadata" JSONB,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_candidate_processing_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_candidates_processingStatus_idx" ON "public"."recruiting_candidates"("processingStatus");

CREATE UNIQUE INDEX "recruiting_candidate_processing_jobs_searchId_providerMessageId_gmailAttachmentId_key"
ON "public"."recruiting_candidate_processing_jobs"("searchId", "providerMessageId", "gmailAttachmentId");

CREATE INDEX "recruiting_candidate_processing_jobs_tenantId_idx"
ON "public"."recruiting_candidate_processing_jobs"("tenantId");

CREATE INDEX "recruiting_candidate_processing_jobs_searchId_idx"
ON "public"."recruiting_candidate_processing_jobs"("searchId");

CREATE INDEX "recruiting_candidate_processing_jobs_candidateId_idx"
ON "public"."recruiting_candidate_processing_jobs"("candidateId");

CREATE INDEX "recruiting_candidate_processing_jobs_connectionId_idx"
ON "public"."recruiting_candidate_processing_jobs"("connectionId");

CREATE INDEX "recruiting_candidate_processing_jobs_processingStatus_idx"
ON "public"."recruiting_candidate_processing_jobs"("processingStatus");

CREATE INDEX "recruiting_candidate_processing_jobs_triggerRunId_idx"
ON "public"."recruiting_candidate_processing_jobs"("triggerRunId");

ALTER TABLE "public"."recruiting_candidate_processing_jobs"
ADD CONSTRAINT "recruiting_candidate_processing_jobs_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_candidate_processing_jobs"
ADD CONSTRAINT "recruiting_candidate_processing_jobs_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_candidate_processing_jobs"
ADD CONSTRAINT "recruiting_candidate_processing_jobs_connectionId_fkey"
FOREIGN KEY ("connectionId") REFERENCES "public"."recruiting_email_connections"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
