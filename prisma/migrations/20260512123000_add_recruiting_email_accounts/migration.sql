-- Additive Gmail OAuth account connection table for Recruiting Agent.

CREATE TABLE "public"."recruiting_email_accounts" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'google',
  "email" TEXT NOT NULL,
  "googleAccountId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "tokenType" TEXT,
  "scope" TEXT,
  "expiryDate" TIMESTAMP(3),
  "monitoringEnabled" BOOLEAN NOT NULL DEFAULT false,
  "lastHistoryId" TEXT,
  "lastSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recruiting_email_accounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_email_accounts_tenantId_idx" ON "public"."recruiting_email_accounts"("tenantId");
CREATE INDEX "recruiting_email_accounts_userId_idx" ON "public"."recruiting_email_accounts"("userId");
CREATE INDEX "recruiting_email_accounts_tenantId_userId_idx" ON "public"."recruiting_email_accounts"("tenantId", "userId");
CREATE INDEX "recruiting_email_accounts_email_idx" ON "public"."recruiting_email_accounts"("email");
