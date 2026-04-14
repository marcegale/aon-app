import { prisma } from "@/app/lib/prisma";

export type RecruitmentProcessInput = {
  tenant_id: string;
  user_id: string;
  empresa_descripcion: string;
  area: string;
  motivo: string;
  cultura: string;
  salario_min: number;
  salario_max: number;
  organigrama_texto: string;
  perfiles_anteriores?: string;
  busquedas_pasadas?: string;
};

export type RecruitmentProfile = {
  nombre: string;
  objetivo: string;
  responsabilidades: string[];
  requisitos: string[];
  habilidades: string[];
  kpis: string[];
  reporta_a: string;
};

export type RecruitmentAnnouncement = {
  formal: string;
  atractivo: string;
};

export type RecruitmentProcessOutput = {
  diagnostico: string;
  perfil: RecruitmentProfile;
  anuncio: RecruitmentAnnouncement;
};

export type RecruitmentProcessRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: RecruitmentProcessInput;
  output?: RecruitmentProcessOutput;
};

function createRecordId() {
  return `rrhh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createRecruitmentProcess(
  input: RecruitmentProcessInput
): Promise<RecruitmentProcessRecord> {
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const id = createRecordId();

  try {
  console.log("ANTES DE prisma.create");
  await prisma.$queryRaw`SELECT 1`;
  console.log("DESPUES DE prisma.create");;
  
} catch (error) {
  console.error("createRecruitmentProcess DB error:", error);
  throw new Error("No se pudo guardar el proceso de reclutamiento");
}

  const record: RecruitmentProcessRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    input,
  };

  return record;
}

export async function saveRecruitmentProcessOutput(
  id: string,
  output: RecruitmentProcessOutput
): Promise<RecruitmentProcessRecord | null> {
  const nowDate = new Date();

  try {
   await prisma.rrhh_processes.update({
  where: { id },
  data: {
    output,
    updated_at: nowDate,
  },
}); 
  } catch (error) {
    console.error("saveRecruitmentProcessOutput DB error:", error);
    throw new Error("No se pudo guardar la salida del proceso de reclutamiento");
  }

  let row: Array<{
    id: string;
    input: unknown; 
    output: unknown;
    created_at: Date;
    updated_at: Date;
  }> = [];

  try {
    row = await prisma.$queryRaw<
      Array<{
        id: string;
        input: unknown;
        output: unknown;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      SELECT id, input, output, created_at, updated_at
      FROM rrhh_processes
      WHERE id = ${id}
      LIMIT 1
    `;
  } catch (error) {
    console.error("saveRecruitmentProcessOutput fetch DB error:", error);
    throw new Error("No se pudo recuperar el proceso de reclutamiento");
  }

  const record = row[0];

  if (!record) {
    return null;
  }

  const input = record.input as RecruitmentProcessInput;

  return {
    id: record.id,
    input,
    output: (record.output as RecruitmentProcessOutput) ?? output,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}