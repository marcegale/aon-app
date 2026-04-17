import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type GlobalScore = {
  earned?: number;
  max?: number;
  percentage?: number;
};

type AiAnalysis = {
  summary?: string;
  risks?: string[];
  opportunities?: string[];
  priority?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      tenantSlug,
      blockScores,
      globalScore,
      weakestBlocks,
      blockAnswers,
      aiAnalysis,
      mode,
    } = body as {
      tenantSlug?: string;
      blockScores?: unknown[];
      globalScore?: GlobalScore;
      weakestBlocks?: { title?: string }[];
      blockAnswers?: unknown[];
      aiAnalysis?: AiAnalysis | null;
      mode?: "fast" | "premium";
    };

    const cleanSlug =
      typeof tenantSlug === "string" && tenantSlug.trim().length > 0
        ? tenantSlug.trim().toLowerCase()
        : null;

    if (!cleanSlug) {
      return NextResponse.json(
        { ok: false, error: "tenantSlug requerido" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.upsert({
      where: { slug: cleanSlug },
      update: {},
      create: {
        slug: cleanSlug,
        name: cleanSlug,
      },
    });

    const summary =
      aiAnalysis?.summary?.trim() ||
      "Diagnóstico generado sin resumen detallado.";

    const risks =
      Array.isArray(aiAnalysis?.risks) && aiAnalysis!.risks.length > 0
        ? aiAnalysis!.risks
        : Array.isArray(weakestBlocks)
        ? weakestBlocks.map((b) => b.title || "Área crítica")
        : [];

    const opportunities =
      Array.isArray(aiAnalysis?.opportunities)
        ? aiAnalysis!.opportunities
        : [];

    const priority =
      typeof aiAnalysis?.priority === "string" ? aiAnalysis.priority : null;

    const savedAnalysis = await prisma.tenantAnalysis.create({
      data: {
        tenantId: tenant.id,
        mode: mode ?? "premium",
        summary,
        risks,
        opportunities,
        priority,
        globalScore:
          typeof globalScore?.percentage === "number"
            ? Math.round(globalScore.percentage)
            : 0,
        rawData: JSON.parse(
          JSON.stringify({
            blockAnswers: Array.isArray(blockAnswers) ? blockAnswers : [],
            blockScores: Array.isArray(blockScores) ? blockScores : [],
            globalScore: globalScore ?? null,
            weakestBlocks: Array.isArray(weakestBlocks) ? weakestBlocks : [],
            aiAnalysis: aiAnalysis ?? null,
          })
        ),
      },
    });

    return NextResponse.json({
      ok: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      analysis: {
        id: savedAnalysis.id,
        mode: savedAnalysis.mode,
        globalScore: savedAnalysis.globalScore,
      },
    });
  } catch (error) {
    console.error("SAVE ASSESSMENT ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el assessment" },
      { status: 500 }
    );
  }
}