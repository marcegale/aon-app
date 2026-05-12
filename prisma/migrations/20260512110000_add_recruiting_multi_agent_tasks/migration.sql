-- Additive multi-agent autonomous recruiting tables.

CREATE TABLE "public"."recruiting_agent_memories" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentType" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "memoryKey" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recruiting_agent_memories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_agent_tasks" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentType" TEXT NOT NULL,
  "taskType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "priority" INTEGER NOT NULL DEFAULT 5,
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "errorMessage" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recruiting_agent_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_agent_approvals" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentRunId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "proposedAction" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recruiting_agent_approvals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_agent_memories_tenantId_idx" ON "public"."recruiting_agent_memories"("tenantId");
CREATE INDEX "recruiting_agent_memories_agentType_idx" ON "public"."recruiting_agent_memories"("agentType");
CREATE INDEX "recruiting_agent_memories_entityType_entityId_idx" ON "public"."recruiting_agent_memories"("entityType", "entityId");
CREATE UNIQUE INDEX "recruiting_agent_memories_tenantId_agentType_entityType_entityId_memoryKey_key"
ON "public"."recruiting_agent_memories"("tenantId", "agentType", "entityType", "entityId", "memoryKey");

CREATE INDEX "recruiting_agent_tasks_tenantId_idx" ON "public"."recruiting_agent_tasks"("tenantId");
CREATE INDEX "recruiting_agent_tasks_agentType_idx" ON "public"."recruiting_agent_tasks"("agentType");
CREATE INDEX "recruiting_agent_tasks_taskType_idx" ON "public"."recruiting_agent_tasks"("taskType");
CREATE INDEX "recruiting_agent_tasks_status_idx" ON "public"."recruiting_agent_tasks"("status");
CREATE INDEX "recruiting_agent_tasks_priority_idx" ON "public"."recruiting_agent_tasks"("priority");
CREATE INDEX "recruiting_agent_tasks_createdAt_idx" ON "public"."recruiting_agent_tasks"("createdAt");

CREATE INDEX "recruiting_agent_approvals_tenantId_idx" ON "public"."recruiting_agent_approvals"("tenantId");
CREATE INDEX "recruiting_agent_approvals_agentRunId_idx" ON "public"."recruiting_agent_approvals"("agentRunId");
CREATE INDEX "recruiting_agent_approvals_actionType_idx" ON "public"."recruiting_agent_approvals"("actionType");
CREATE INDEX "recruiting_agent_approvals_status_idx" ON "public"."recruiting_agent_approvals"("status");

ALTER TABLE "public"."recruiting_agent_approvals"
ADD CONSTRAINT "recruiting_agent_approvals_agentRunId_fkey"
FOREIGN KEY ("agentRunId") REFERENCES "public"."recruiting_agent_runs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
