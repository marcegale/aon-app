-- CreateTable
CREATE TABLE "atlas_devices" (
    "id"            TEXT         NOT NULL,
    "supabaseUserId" TEXT        NOT NULL,
    "deviceName"    TEXT         NOT NULL,
    "deviceKeyHash" TEXT         NOT NULL,
    "status"        TEXT         NOT NULL DEFAULT 'active',
    "lastSeenAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt"     TIMESTAMP(3),
    "platform"      TEXT         NOT NULL DEFAULT 'windows',
    "clientVersion" TEXT,
    "fingerprint"   TEXT,

    CONSTRAINT "atlas_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_device_registrations" (
    "id"               TEXT         NOT NULL,
    "deviceCodeHash"   TEXT         NOT NULL,
    "status"           TEXT         NOT NULL DEFAULT 'pending',
    "platform"         TEXT         NOT NULL,
    "clientVersion"    TEXT,
    "approvedByUserId" TEXT,
    "deviceName"       TEXT,
    "deviceKeyHash"    TEXT,
    "pickedUpAt"       TIMESTAMP(3),
    "expiresAt"        TIMESTAMP(3) NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt"       TIMESTAMP(3),
    "completedAt"      TIMESTAMP(3),
    "deniedAt"         TIMESTAMP(3),
    "atlasDeviceId"    TEXT,

    CONSTRAINT "atlas_device_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atlas_devices_deviceKeyHash_key" ON "atlas_devices"("deviceKeyHash");

-- CreateIndex
CREATE INDEX "atlas_devices_supabaseUserId_idx" ON "atlas_devices"("supabaseUserId");

-- CreateIndex
CREATE INDEX "atlas_devices_deviceKeyHash_idx" ON "atlas_devices"("deviceKeyHash");

-- CreateIndex
CREATE INDEX "atlas_devices_status_idx" ON "atlas_devices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "atlas_device_registrations_deviceCodeHash_key" ON "atlas_device_registrations"("deviceCodeHash");

-- CreateIndex
CREATE INDEX "atlas_device_registrations_deviceCodeHash_idx" ON "atlas_device_registrations"("deviceCodeHash");

-- CreateIndex
CREATE INDEX "atlas_device_registrations_status_expiresAt_idx" ON "atlas_device_registrations"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "atlas_device_registrations" ADD CONSTRAINT "atlas_device_registrations_atlasDeviceId_fkey"
    FOREIGN KEY ("atlasDeviceId") REFERENCES "atlas_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
