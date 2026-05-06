-- CreateTable
CREATE TABLE "recruiting_searches" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requestText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "monitoringStatus" TEXT,
    "area" TEXT,
    "seniority" TEXT,
    "modality" TEXT,
    "location" TEXT,
    "jobProfileOutput" JSONB,
    "idealCandidateOutput" JSONB,
    "scoringCriteriaOutput" JSONB,
    "publicationCopiesOutput" JSONB,
    "aiGenerationLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiting_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiting_company_profiles" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "razonSocial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiting_company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiting_attachments" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruiting_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiting_candidates" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "candidateCode" TEXT,
    "fullName" TEXT,
    "email" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruiting_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruiting_searches_refCode_key" ON "recruiting_searches"("refCode");

-- CreateIndex
CREATE INDEX "recruiting_searches_tenantId_idx" ON "recruiting_searches"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "recruiting_company_profiles_searchId_key" ON "recruiting_company_profiles"("searchId");

-- CreateIndex
CREATE INDEX "recruiting_attachments_searchId_idx" ON "recruiting_attachments"("searchId");

-- CreateIndex
CREATE INDEX "recruiting_candidates_searchId_idx" ON "recruiting_candidates"("searchId");

-- AddForeignKey
ALTER TABLE "recruiting_company_profiles" ADD CONSTRAINT "recruiting_company_profiles_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "recruiting_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiting_attachments" ADD CONSTRAINT "recruiting_attachments_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "recruiting_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiting_candidates" ADD CONSTRAINT "recruiting_candidates_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "recruiting_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
