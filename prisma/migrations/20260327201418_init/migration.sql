-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rubro" TEXT,
    "empleados" TEXT,
    "problema" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "leadScore" INTEGER NOT NULL,
    "leadLevel" TEXT NOT NULL,
    "emailStatus" TEXT,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
