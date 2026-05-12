-- Additive recruiting email monitoring tables and candidate metadata.

ALTER TABLE "public"."recruiting_candidates"
ADD COLUMN "cvFileUrl" TEXT,
ADD COLUMN "cvFileName" TEXT,
ADD COLUMN "cvMimeType" TEXT,
ADD COLUMN "cvHash" TEXT,
ADD COLUMN "sourceEmailId" TEXT,
ADD COLUMN "sourceSubject" TEXT,
ADD COLUMN "cvSummary" TEXT,
ADD COLUMN "cvScore" INTEGER,
ADD COLUMN "cvReport" JSONB;

CREATE TABLE "public"."recruiting_email_connections" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'gmail',
  "emailAddress" TEXT NOT NULL,
  "googleRefreshToken" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "lastHistoryId" TEXT,
  "lastIngestedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_email_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_email_ingest_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT,
  "candidateId" TEXT,
  "connectionId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'gmail',
  "providerMessageId" TEXT,
  "fromEmail" TEXT,
  "subject" TEXT,
  "refCode" TEXT,
  "cvHash" TEXT,
  "status" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_email_ingest_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_candidates_sourceEmailId_idx" ON "public"."recruiting_candidates"("sourceEmailId");
CREATE INDEX "recruiting_candidates_cvHash_idx" ON "public"."recruiting_candidates"("cvHash");
CREATE UNIQUE INDEX "recruiting_candidates_searchId_sourceEmailId_key" ON "public"."recruiting_candidates"("searchId", "sourceEmailId");
CREATE UNIQUE INDEX "recruiting_candidates_searchId_cvHash_key" ON "public"."recruiting_candidates"("searchId", "cvHash");

CREATE INDEX "recruiting_email_connections_tenantId_idx" ON "public"."recruiting_email_connections"("tenantId");
CREATE INDEX "recruiting_email_connections_tenantId_status_idx" ON "public"."recruiting_email_connections"("tenantId", "status");
CREATE INDEX "recruiting_email_connections_searchId_idx" ON "public"."recruiting_email_connections"("searchId");

CREATE INDEX "recruiting_email_ingest_logs_tenantId_idx" ON "public"."recruiting_email_ingest_logs"("tenantId");
CREATE INDEX "recruiting_email_ingest_logs_searchId_idx" ON "public"."recruiting_email_ingest_logs"("searchId");
CREATE INDEX "recruiting_email_ingest_logs_candidateId_idx" ON "public"."recruiting_email_ingest_logs"("candidateId");
CREATE INDEX "recruiting_email_ingest_logs_connectionId_idx" ON "public"."recruiting_email_ingest_logs"("connectionId");
CREATE INDEX "recruiting_email_ingest_logs_providerMessageId_idx" ON "public"."recruiting_email_ingest_logs"("providerMessageId");

ALTER TABLE "public"."recruiting_email_connections"
ADD CONSTRAINT "recruiting_email_connections_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_email_ingest_logs"
ADD CONSTRAINT "recruiting_email_ingest_logs_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_email_ingest_logs"
ADD CONSTRAINT "recruiting_email_ingest_logs_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_email_ingest_logs"
ADD CONSTRAINT "recruiting_email_ingest_logs_connectionId_fkey"
FOREIGN KEY ("connectionId") REFERENCES "public"."recruiting_email_connections"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
