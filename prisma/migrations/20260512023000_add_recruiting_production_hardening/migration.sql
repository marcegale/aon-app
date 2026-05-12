-- Additive production hardening, observability, and privacy foundations.

ALTER TABLE "public"."recruiting_candidates"
ADD COLUMN "consentStatus" TEXT,
ADD COLUMN "consentCapturedAt" TIMESTAMP(3),
ADD COLUMN "dataRetentionUntil" TIMESTAMP(3),
ADD COLUMN "anonymizedAt" TIMESTAMP(3);

CREATE TABLE "public"."recruiting_operational_events" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT,
  "candidateId" TEXT,
  "jobId" TEXT,
  "automationExecutionId" TEXT,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_operational_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_data_retention_policies" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "cvRetentionDays" INTEGER NOT NULL DEFAULT 365,
  "audioRetentionDays" INTEGER NOT NULL DEFAULT 90,
  "interviewRetentionDays" INTEGER NOT NULL DEFAULT 365,
  "offerRetentionDays" INTEGER NOT NULL DEFAULT 365,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_data_retention_policies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_candidates_consentStatus_idx"
ON "public"."recruiting_candidates"("consentStatus");
CREATE INDEX "recruiting_candidates_dataRetentionUntil_idx"
ON "public"."recruiting_candidates"("dataRetentionUntil");
CREATE INDEX "recruiting_candidates_anonymizedAt_idx"
ON "public"."recruiting_candidates"("anonymizedAt");

CREATE INDEX "recruiting_operational_events_tenantId_idx"
ON "public"."recruiting_operational_events"("tenantId");
CREATE INDEX "recruiting_operational_events_searchId_idx"
ON "public"."recruiting_operational_events"("searchId");
CREATE INDEX "recruiting_operational_events_candidateId_idx"
ON "public"."recruiting_operational_events"("candidateId");
CREATE INDEX "recruiting_operational_events_jobId_idx"
ON "public"."recruiting_operational_events"("jobId");
CREATE INDEX "recruiting_operational_events_automationExecutionId_idx"
ON "public"."recruiting_operational_events"("automationExecutionId");
CREATE INDEX "recruiting_operational_events_type_idx"
ON "public"."recruiting_operational_events"("type");
CREATE INDEX "recruiting_operational_events_severity_idx"
ON "public"."recruiting_operational_events"("severity");
CREATE INDEX "recruiting_operational_events_createdAt_idx"
ON "public"."recruiting_operational_events"("createdAt");

CREATE INDEX "recruiting_data_retention_policies_tenantId_idx"
ON "public"."recruiting_data_retention_policies"("tenantId");
CREATE INDEX "recruiting_data_retention_policies_enabled_idx"
ON "public"."recruiting_data_retention_policies"("enabled");

ALTER TABLE "public"."recruiting_operational_events"
ADD CONSTRAINT "recruiting_operational_events_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_operational_events"
ADD CONSTRAINT "recruiting_operational_events_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_operational_events"
ADD CONSTRAINT "recruiting_operational_events_jobId_fkey"
FOREIGN KEY ("jobId") REFERENCES "public"."recruiting_candidate_processing_jobs"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_operational_events"
ADD CONSTRAINT "recruiting_operational_events_automationExecutionId_fkey"
FOREIGN KEY ("automationExecutionId") REFERENCES "public"."recruiting_automation_executions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
