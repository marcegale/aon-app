import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  createRecruitmentProcess,
  RecruitmentProcessInput,
  RecruitmentProcessOutput,
  saveRecruitmentProcessOutput,
} from "@/app/lib/rrhh-process-store";

type RequestBody = Partial<RecruitmentProcessInput>;

const requiredFields: Array<keyof RecruitmentProcessInput> = [
  "tenant_id",
  "user_id",
  "empresa_descripcion",
  "area",
  "motivo",
  "cultura",
  "salario_min",
  "salario_max",
  "organigrama_texto",
];

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function validateRequestBody(body: RequestBody) {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = body[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      missing.push(field);
    }
  }

  if (typeof body.salario_min !== "number" || Number.isNaN(body.salario_min)) {
    missing.push("salario_min");
  }

  if (typeof body.salario_max !== "number" || Number.isNaN(body.salario_max)) {
    missing.push("salario_max");
  }

  if (
    typeof body.salario_min === "number" &&
    typeof body.salario_max === "number" &&
    body.salario_min > body.salario_max
  ) {
    return {
      isValid: false,
      error: "salario_min no puede ser mayor que salario_max",
      missing,
    };
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      error: "Faltan o son inválidos campos obligatorios",
      missing: Array.from(new Set(missing)),
    };
  }

  return {
    isValid: true,
    missing: [],
  };
}

function buildPrompt(input: RecruitmentProcessInput) {
  return `
Eres un HR AI Agent senior para una plataforma SaaS multi-tenant llamada Nexa Core.
Debes proponer una estrategia de reclutamiento de alta calidad.

Devuelve SOLO JSON válido, sin markdown y sin texto adicional.
Usa EXACTAMENTE este esquema y nombres de campos:
{
  "diagnostico": "",
  "perfil": {
    "nombre": "",
    "objetivo": "",
    "responsabilidades": [],
    "requisitos": [],
    "habilidades": [],
    "kpis": [],
    "reporta_a": ""
  },
  "anuncio": {
    "formal": "",
    "atractivo": ""
  }
}

Reglas de formato obligatorias:
- diagnostico debe ser string.
- perfil debe ser objeto.
- anuncio debe ser objeto.
- perfil.responsabilidades, perfil.requisitos, perfil.habilidades y perfil.kpis deben ser arrays de strings.
- anuncio.formal y anuncio.atractivo deben ser strings.
- No agregues campos extras.

Contexto del proceso:
- tenant_id: ${input.tenant_id}
- user_id: ${input.user_id}
- empresa_descripcion: ${input.empresa_descripcion}
- area: ${input.area}
- motivo: ${input.motivo}
- cultura: ${input.cultura}
- salario_min: ${input.salario_min}
- salario_max: ${input.salario_max}
- organigrama_texto: ${input.organigrama_texto}
- perfiles_anteriores: ${input.perfiles_anteriores || "No informado"}
- busquedas_pasadas: ${input.busquedas_pasadas || "No informado"}

Asegúrate de que las recomendaciones sean coherentes con buenas prácticas laborales en Paraguay.
`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseAiResponse(rawText: string): RecruitmentProcessOutput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("La respuesta de OpenAI no es JSON válido");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("La respuesta de OpenAI no tiene la estructura esperada");
  }

  const candidate = parsed as Partial<RecruitmentProcessOutput> & {
    perfil?: {
      nombre?: unknown;
      objetivo?: unknown;
      responsabilidades?: unknown;
      requisitos?: unknown;
      habilidades?: unknown;
      kpis?: unknown;
      reporta_a?: unknown;
    };
    anuncio?: {
      formal?: unknown;
      atractivo?: unknown;
    };
  };

  const perfil = candidate.perfil;
  const anuncio = candidate.anuncio;

  const isValid =
    typeof candidate.diagnostico === "string" &&
    perfil &&
    typeof perfil === "object" &&
    typeof perfil.nombre === "string" &&
    typeof perfil.objetivo === "string" &&
    isStringArray(perfil.responsabilidades) &&
    isStringArray(perfil.requisitos) &&
    isStringArray(perfil.habilidades) &&
    isStringArray(perfil.kpis) &&
    typeof perfil.reporta_a === "string" &&
    anuncio &&
    typeof anuncio === "object" &&
    typeof anuncio.formal === "string" &&
    typeof anuncio.atractivo === "string";

  if (!isValid) {
    throw new Error(
      "La respuesta de OpenAI no cumple el esquema requerido (diagnostico/perfil/anuncio)"
    );
  }

  return {
    diagnostico: candidate.diagnostico!,
    perfil: {
      nombre: perfil.nombre!,
      objetivo: perfil.objetivo!,
      responsabilidades: perfil.responsabilidades!,
      requisitos: perfil.requisitos!,
      habilidades: perfil.habilidades!,
      kpis: perfil.kpis!,
      reporta_a: perfil.reporta_a!,
    },
    anuncio: {
      formal: anuncio.formal!,
      atractivo: anuncio.atractivo!,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const validation = validateRequestBody(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.error,
          missing_fields: validation.missing,
        },
        { status: 400 }
      );
    }

    // Entrada validada, convertimos al tipo final del proceso.
    const input: RecruitmentProcessInput = {
      tenant_id: body.tenant_id!,
      user_id: body.user_id!,
      empresa_descripcion: body.empresa_descripcion!,
      area: body.area!,
      motivo: body.motivo!,
      cultura: body.cultura!,
      salario_min: body.salario_min!,
      salario_max: body.salario_max!,
      organigrama_texto: body.organigrama_texto!,
      perfiles_anteriores: body.perfiles_anteriores,
      busquedas_pasadas: body.busquedas_pasadas,
    };

    // 1) Guardar input (mock DB).
    const processRecord = await createRecruitmentProcess(input);

    const openai = getOpenAIClient();
    const prompt = buildPrompt(input);

    // 2) Ejecutar generación del HR AI Agent.
    const aiResponse = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    console.log("AI RAW RESPONSE:", aiResponse.output_text);

    const rawText = aiResponse.output_text;

    if (!rawText) {
      throw new Error("OpenAI no devolvió texto");
    }

    const output = parseAiResponse(rawText);

    // 3) Guardar output (mock DB).
    const updatedRecord = await saveRecruitmentProcessOutput(processRecord.id, output);

    if (!updatedRecord) {
      throw new Error("No se pudo actualizar el proceso en la base mock");
    }

    return NextResponse.json({
      ok: true,
      process_id: updatedRecord.id,
      tenant_id: updatedRecord.input.tenant_id,
      user_id: updatedRecord.input.user_id,
      output: updatedRecord.output,
      created_at: updatedRecord.createdAt,
      updated_at: updatedRecord.updatedAt,
    });
  } catch (error: unknown) {
    console.error("POST /api/rrhh/create-process error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}