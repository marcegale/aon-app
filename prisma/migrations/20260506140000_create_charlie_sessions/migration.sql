-- CreateTable
CREATE TABLE "charlie_sessions" (
    "id"              TEXT        NOT NULL,
    "deviceKey"       TEXT        NOT NULL,
    "openaiSessionId" TEXT,
    "status"          TEXT        NOT NULL DEFAULT 'active',
    "expiresAt"       TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charlie_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "charlie_sessions_deviceKey_idx" ON "charlie_sessions"("deviceKey");
