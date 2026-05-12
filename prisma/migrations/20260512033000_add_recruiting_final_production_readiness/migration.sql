-- Final additive production readiness layer.

ALTER TABLE "public"."recruiting_offers"
ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE TABLE "public"."recruiting_offer_signatures" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "signerEmail" TEXT NOT NULL,
  "signerName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "signedAt" TIMESTAMP(3),
  "signatureText" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recruiting_offer_signatures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_tenant_settings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "defaultTimezone" TEXT NOT NULL DEFAULT 'UTC',
  "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
  "defaultCountry" TEXT,
  "emailFromName" TEXT,
  "emailFromAddress" TEXT,
  "offerApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
  "interviewReminderHours" JSONB,
  "automationEnabled" BOOLEAN NOT NULL DEFAULT true,
  "aiScoringEnabled" BOOLEAN NOT NULL DEFAULT true,
  "voiceInterviewEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recruiting_tenant_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_notification_templates" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recruiting_notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_agent_runs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT,
  "candidateId" TEXT,
  "agentType" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "input" JSONB,
  "output" JSONB,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recruiting_agent_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_offers_expiresAt_idx" ON "public"."recruiting_offers"("expiresAt");

CREATE INDEX "recruiting_offer_signatures_tenantId_idx" ON "public"."recruiting_offer_signatures"("tenantId");
CREATE INDEX "recruiting_offer_signatures_offerId_idx" ON "public"."recruiting_offer_signatures"("offerId");
CREATE INDEX "recruiting_offer_signatures_candidateId_idx" ON "public"."recruiting_offer_signatures"("candidateId");
CREATE INDEX "recruiting_offer_signatures_status_idx" ON "public"."recruiting_offer_signatures"("status");

CREATE UNIQUE INDEX "recruiting_tenant_settings_tenantId_key" ON "public"."recruiting_tenant_settings"("tenantId");
CREATE INDEX "recruiting_tenant_settings_tenantId_idx" ON "public"."recruiting_tenant_settings"("tenantId");

CREATE UNIQUE INDEX "recruiting_notification_templates_tenantId_type_key"
ON "public"."recruiting_notification_templates"("tenantId", "type");
CREATE INDEX "recruiting_notification_templates_tenantId_idx" ON "public"."recruiting_notification_templates"("tenantId");
CREATE INDEX "recruiting_notification_templates_type_idx" ON "public"."recruiting_notification_templates"("type");
CREATE INDEX "recruiting_notification_templates_enabled_idx" ON "public"."recruiting_notification_templates"("enabled");

CREATE INDEX "recruiting_agent_runs_tenantId_idx" ON "public"."recruiting_agent_runs"("tenantId");
CREATE INDEX "recruiting_agent_runs_searchId_idx" ON "public"."recruiting_agent_runs"("searchId");
CREATE INDEX "recruiting_agent_runs_candidateId_idx" ON "public"."recruiting_agent_runs"("candidateId");
CREATE INDEX "recruiting_agent_runs_agentType_idx" ON "public"."recruiting_agent_runs"("agentType");
CREATE INDEX "recruiting_agent_runs_status_idx" ON "public"."recruiting_agent_runs"("status");

ALTER TABLE "public"."recruiting_offer_signatures"
ADD CONSTRAINT "recruiting_offer_signatures_offerId_fkey"
FOREIGN KEY ("offerId") REFERENCES "public"."recruiting_offers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_offer_signatures"
ADD CONSTRAINT "recruiting_offer_signatures_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_agent_runs"
ADD CONSTRAINT "recruiting_agent_runs_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_agent_runs"
ADD CONSTRAINT "recruiting_agent_runs_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
