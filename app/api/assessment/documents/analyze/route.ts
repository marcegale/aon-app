import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/app/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type BlockScoreInput = {
  blockId: string;
  title: string;
  earned: number;
  max: number;
  percentage: number;
  applicable: boolean;
};

type AnalyzeRequestBody = {
  tenantSlug: string;
  blockScores: BlockScoreInput[];
  globalScore: { earned: number; max: number; percentage: number };
  weakestBlocks: BlockScoreInput[];
  mode?: "fast" | "premium";
};

type AnalysisResponse = {
  summary: string;
  risks: string[];
  opportunities: string[];
  priority: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;

    const { tenantSlug, blockScores, globalScore, weakestBlocks, mode } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { ok: false, error: "tenantSlug es obligatorio" },
        { status: 400 },
      );
    }

    const prompt = `
Eres un consultor senior de diagnóstico empresarial.

Analiza esta empresa usando exclusivamente la información entregada.

TENANT:
${tenantSlug}

SCORE GLOBAL:
- earned: ${globalScore?.earned ?? 0}
- max: ${globalScore?.max ?? 0}
- percentage: ${globalScore?.percentage ?? 0}

SCORES POR BLOQUE:
${(blockScores || [])
  .map(
    (b) =>
      `- ${b.title}: ${b.percentage}% (${b.earned}/${b.max}) | applicable: ${b.applicable}`,
  )
  .join("\n")}

BLOQUES MÁS DÉBILES:
${(weakestBlocks || []).map((b) => `- ${b.title}: ${b.percentage}%`).join("\n")}

Devuelve únicamente JSON válido con esta estructura exacta:
{
  "summary": "string",
  "risks": ["string", "string", "string"],
  "opportunities": ["string", "string", "string"],
  "priority": "string"
}

Reglas:
- summary: 1 párrafo ejecutivo, claro y sobrio, máximo 80 palabras
- risks: máximo 3 items
- opportunities: máximo 3 items
- priority: una sola prioridad principal
- no inventes datos fuera del assessment
- escribe en español
`;

    const model = mode === "premium" ? "gpt-4.1" : "gpt-4.1-mini";

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un consultor estratégico experto en diagnóstico empresarial. Responde únicamente en JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let analysis: AnalysisResponse;

    try {
      analysis = JSON.parse(raw) as AnalysisResponse;
    } catch (parseError) {
      console.error("Error parseando JSON de OpenAI:", raw);

      analysis = {
        summary: "No se pudo generar un resumen estructurado.",
        risks: [],
        opportunities: [],
        priority: null,
      };
    }

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
        });

        if (!tenant) {
        return NextResponse.json(
            { ok: false, error: "Tenant no encontrado" },
            { status: 404 },
        );
        }

        if (mode === "premium") {
            await prisma.tenantAnalysis.create({
                data: {
                tenantId: tenant.id,
                mode: mode || "fast",
                summary: analysis.summary,
                risks: analysis.risks,
                opportunities: analysis.opportunities,
                priority: analysis.priority,
                globalScore: globalScore?.percentage ?? 0,
                },
            });
            }

        return NextResponse.json({
        ok: true,
        analysis,
        });
  } catch (error) {
    console.error("POST /api/assessment/analyze error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo generar el análisis.",
      },
      { status: 500 },
    );
  }
}