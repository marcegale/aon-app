import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type JsonInput = Record<string, unknown>;

function toJson(value: JsonInput | undefined): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value != null ? (value as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
}

export async function startAgentRun(params: {
  agentId: string;
  userId?: string;
  tenantId?: string;
  input?: JsonInput;
}): Promise<string> {
  const run = await prisma.agentRun.create({
    data: {
      agentId: params.agentId,
      userId: params.userId ?? null,
      tenantId: params.tenantId ?? null,
      status: "started",
      input: toJson(params.input),
    },
  });
  return run.id;
}

export async function completeAgentRun(
  runId: string,
  params: {
    output?: JsonInput;
    tokens?: number;
    cost?: number;
  } = {},
): Promise<void> {
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: "success",
      output: toJson(params.output),
      tokens: params.tokens ?? null,
      cost: params.cost ?? null,
    },
  });
}

export async function failAgentRun(
  runId: string,
  params: {
    output?: JsonInput;
  } = {},
): Promise<void> {
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: "error",
      output: toJson(params.output),
    },
  });
}
