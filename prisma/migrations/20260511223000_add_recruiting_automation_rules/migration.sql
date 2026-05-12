-- Additive automation rule engine for Recruiting Agent.

CREATE TABLE "public"."recruiting_automation_rules" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "searchId" TEXT,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "triggerType" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_automation_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_automation_executions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "ruleId" TEXT,
  "candidateId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "input" JSONB,
  "output" JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_automation_executions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_automation_rules_tenantId_idx"
ON "public"."recruiting_automation_rules"("tenantId");

CREATE INDEX "recruiting_automation_rules_searchId_idx"
ON "public"."recruiting_automation_rules"("searchId");

CREATE INDEX "recruiting_automation_rules_triggerType_idx"
ON "public"."recruiting_automation_rules"("triggerType");

CREATE INDEX "recruiting_automation_rules_enabled_idx"
ON "public"."recruiting_automation_rules"("enabled");

CREATE INDEX "recruiting_automation_executions_tenantId_idx"
ON "public"."recruiting_automation_executions"("tenantId");

CREATE INDEX "recruiting_automation_executions_ruleId_idx"
ON "public"."recruiting_automation_executions"("ruleId");

CREATE INDEX "recruiting_automation_executions_candidateId_idx"
ON "public"."recruiting_automation_executions"("candidateId");

CREATE INDEX "recruiting_automation_executions_searchId_idx"
ON "public"."recruiting_automation_executions"("searchId");

CREATE INDEX "recruiting_automation_executions_action_idx"
ON "public"."recruiting_automation_executions"("action");

CREATE INDEX "recruiting_automation_executions_status_idx"
ON "public"."recruiting_automation_executions"("status");

ALTER TABLE "public"."recruiting_automation_rules"
ADD CONSTRAINT "recruiting_automation_rules_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_automation_executions"
ADD CONSTRAINT "recruiting_automation_executions_ruleId_fkey"
FOREIGN KEY ("ruleId") REFERENCES "public"."recruiting_automation_rules"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_automation_executions"
ADD CONSTRAINT "recruiting_automation_executions_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_automation_executions"
ADD CONSTRAINT "recruiting_automation_executions_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
