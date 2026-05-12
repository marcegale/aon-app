-- Additive talent intelligence, compensation memory, and offer engine tables.

CREATE TABLE "public"."recruiting_candidate_embeddings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "embeddingJson" JSONB,
  "embeddingModel" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_candidate_embeddings_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
    ALTER TABLE "public"."recruiting_candidate_embeddings"
    ADD COLUMN "embedding" vector;
  END IF;
END $$;

CREATE TABLE "public"."recruiting_candidate_memories" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "memoryType" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_candidate_memories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_offers" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "searchId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "currentVersionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recruiting_offers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recruiting_offer_versions" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "baseSalary" INTEGER NOT NULL,
  "variableCompensation" INTEGER,
  "equity" TEXT,
  "currency" TEXT NOT NULL,
  "country" TEXT,
  "benefits" JSONB,
  "generatedContent" TEXT NOT NULL,
  "aiSummary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recruiting_offer_versions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recruiting_candidate_embeddings_tenantId_idx"
ON "public"."recruiting_candidate_embeddings"("tenantId");
CREATE INDEX "recruiting_candidate_embeddings_candidateId_idx"
ON "public"."recruiting_candidate_embeddings"("candidateId");
CREATE INDEX "recruiting_candidate_embeddings_searchId_idx"
ON "public"."recruiting_candidate_embeddings"("searchId");
CREATE INDEX "recruiting_candidate_embeddings_sourceType_idx"
ON "public"."recruiting_candidate_embeddings"("sourceType");

CREATE INDEX "recruiting_candidate_memories_tenantId_idx"
ON "public"."recruiting_candidate_memories"("tenantId");
CREATE INDEX "recruiting_candidate_memories_candidateId_idx"
ON "public"."recruiting_candidate_memories"("candidateId");
CREATE INDEX "recruiting_candidate_memories_searchId_idx"
ON "public"."recruiting_candidate_memories"("searchId");
CREATE INDEX "recruiting_candidate_memories_memoryType_idx"
ON "public"."recruiting_candidate_memories"("memoryType");

CREATE INDEX "recruiting_offers_tenantId_idx" ON "public"."recruiting_offers"("tenantId");
CREATE INDEX "recruiting_offers_candidateId_idx" ON "public"."recruiting_offers"("candidateId");
CREATE INDEX "recruiting_offers_searchId_idx" ON "public"."recruiting_offers"("searchId");
CREATE INDEX "recruiting_offers_status_idx" ON "public"."recruiting_offers"("status");

CREATE INDEX "recruiting_offer_versions_offerId_idx"
ON "public"."recruiting_offer_versions"("offerId");

ALTER TABLE "public"."recruiting_candidate_embeddings"
ADD CONSTRAINT "recruiting_candidate_embeddings_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_candidate_embeddings"
ADD CONSTRAINT "recruiting_candidate_embeddings_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_candidate_memories"
ADD CONSTRAINT "recruiting_candidate_memories_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_candidate_memories"
ADD CONSTRAINT "recruiting_candidate_memories_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_offers"
ADD CONSTRAINT "recruiting_offers_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "public"."recruiting_candidates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."recruiting_offers"
ADD CONSTRAINT "recruiting_offers_searchId_fkey"
FOREIGN KEY ("searchId") REFERENCES "public"."recruiting_searches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."recruiting_offer_versions"
ADD CONSTRAINT "recruiting_offer_versions_offerId_fkey"
FOREIGN KEY ("offerId") REFERENCES "public"."recruiting_offers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
