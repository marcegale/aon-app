-- CreateTable
CREATE TABLE "charlie_devices" (
    "id"        TEXT         NOT NULL,
    "deviceKey" TEXT         NOT NULL,
    "userName"  TEXT         NOT NULL,
    "status"    TEXT         NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "charlie_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charlie_devices_deviceKey_key" ON "charlie_devices"("deviceKey");

-- CreateIndex
CREATE INDEX "charlie_devices_deviceKey_idx" ON "charlie_devices"("deviceKey");
