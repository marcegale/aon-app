-- Additive enterprise readiness layer for recruiting.

ALTER TABLE "public"."recruiting_interview_sessions"
ADD COLUMN "scheduledAt" TIMESTAMP(3),
ADD COLUMN "calendarEventId" TEXT,
ADD COLUMN "meetingUrl" TEXT,
ADD COLUMN "timezone" TEXT,
ADD COLUMN "interviewerEmail" TEXT;

ALTER TABLE "public"."recruiting_offers"
ADD COLUMN "publicToken" TEXT,
ADD COLUMN "respondedAt" TIMESTAMP(3),
ADD COLUMN "candidateNotes" TEXT,
ADD COLUMN "pdfStoragePath" TEXT,
ADD COLUMN "pdfSignedUrl" TEXT,
ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3);

CREATE TABLE "public"."recruiting_notification_deliveries" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT,
  "searchId" TEXT,
  "offerId" TEXT,
  "interviewSessionId" TEXT,
  "type" TEXT NOT NULL,
  "toEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "provider" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_notification_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_calendar_connections" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'google',
  "email" TEXT NOT NULL,
  "encryptedAccessToken" TEXT,
  "encryptedRefreshToken" TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_calendar_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_role_assignments" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "permissions" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_role_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recruiting_offers_publicToken_key"
ON "public"."recruiting_offers"("publicToken");
CREATE INDEX "recruiting_offers_publicToken_idx"
ON "public"."recruiting_offers"("publicToken");
CREATE INDEX "recruiting_interview_sessions_scheduledAt_idx"
ON "public"."recruiting_interview_sessions"("scheduledAt");

CREATE INDEX "recruiting_notification_deliveries_tenantId_idx"
ON "public"."recruiting_notification_deliveries"("tenantId");
CREATE INDEX "recruiting_notification_deliveries_candidateId_idx"
ON "public"."recruiting_notification_deliveries"("candidateId");
CREATE INDEX "recruiting_notification_deliveries_searchId_idx"
ON "public"."recruiting_notification_deliveries"("searchId");
CREATE INDEX "recruiting_notification_deliveries_offerId_idx"
ON "public"."recruiting_notification_deliveries"("offerId");
CREATE INDEX "recruiting_notification_deliveries_interviewSessionId_idx"
ON "public"."recruiting_notification_deliveries"("interviewSessionId");
CREATE INDEX "recruiting_notification_deliveries_type_idx"
ON "public"."recruiting_notification_deliveries"("type");
CREATE INDEX "recruiting_notification_deliveries_status_idx"
ON "public"."recruiting_notification_deliveries"("status");

CREATE INDEX "recruiting_calendar_connections_tenantId_idx"
ON "public"."recruiting_calendar_connections"("tenantId");
CREATE INDEX "recruiting_calendar_connections_userId_idx"
ON "public"."recruiting_calendar_connections"("userId");
CREATE INDEX "recruiting_calendar_connections_provider_idx"
ON "public"."recruiting_calendar_connections"("provider");
CREATE INDEX "recruiting_calendar_connections_isActive_idx"
ON "public"."recruiting_calendar_connections"("isActive");

CREATE INDEX "recruiting_role_assignments_tenantId_idx"
ON "public"."recruiting_role_assignments"("tenantId");
CREATE INDEX "recruiting_role_assignments_userId_idx"
ON "public"."recruiting_role_assignments"("userId");
CREATE INDEX "recruiting_role_assignments_role_idx"
ON "public"."recruiting_role_assignments"("role");
CREATE UNIQUE INDEX "recruiting_role_assignments_tenantId_userId_role_key"
ON "public"."recruiting_role_assignments"("tenantId", "userId", "role");

ALTER TABLE "public"."recruiting_notification_deliveries"
ADD CONSTRAINT "recruiting_notification_deliveries_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_notification_deliveries"
ADD CONSTRAINT "recruiting_notification_deliveries_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_notification_deliveries"
ADD CONSTRAINT "recruiting_notification_deliveries_offerId_fkey"
FOREIGN KEY ("offerId") REFERENCES "public"."recruiting_offers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_notification_deliveries"
ADD CONSTRAINT "recruiting_notification_deliveries_interviewSessionId_fkey"
FOREIGN KEY ("interviewSessionId") REFERENCES "public"."recruiting_interview_sessions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
