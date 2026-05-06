-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "tokens" INTEGER,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_runs_agentId_idx" ON "agent_runs"("agentId");

-- CreateIndex
CREATE INDEX "agent_runs_tenantId_idx" ON "agent_runs"("tenantId");
