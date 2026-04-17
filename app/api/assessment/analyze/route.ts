import { NextResponse } from "next/server";

type ScoreItem = {
  title?: string;
  percentage?: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { blockScores, weakestBlocks, globalScore, mode } = body as {
      blockScores?: ScoreItem[];
      weakestBlocks?: ScoreItem[];
      globalScore?: {
        earned?: number;
        max?: number;
        percentage?: number;
      };
      mode?: "fast" | "premium";
    };

    const risks =
      Array.isArray(weakestBlocks) && weakestBlocks.length > 0
        ? weakestBlocks.map((b) => b.title || "Área crítica")
        : [];

    const opportunities =
      Array.isArray(blockScores)
        ? blockScores
            .filter((b) => (b.percentage ?? 0) >= 70)
            .map((b) => b.title || "Área destacada")
        : [];

    const weakest =
      Array.isArray(weakestBlocks) && weakestBlocks.length > 0
        ? weakestBlocks[0].title
        : "áreas operativas clave";

    const strongest =
      Array.isArray(blockScores) && blockScores.length > 0
        ? [...blockScores]
            .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0]?.title
        : null;

    const summary =
      typeof globalScore?.percentage === "number"
        ? `El diagnóstico evidencia un nivel de madurez operativa de ${Math.round(
            globalScore.percentage
          )}%, con una brecha estructural en ${weakest}. ${
            strongest
              ? `Al mismo tiempo, se observa una base positiva en ${strongest}, que puede ser utilizada como punto de apalancamiento.`
              : ""
          } La principal limitación actual no es solo de ejecución, sino de estructura, lo que impacta directamente en la capacidad de escalar con control.`
        : "No fue posible determinar el nivel de madurez operativa.";

    const priority =
      risks.length > 0
        ? `Intervenir prioritariamente en ${risks[0]}`
        : "Optimizar áreas con mayor rendimiento";

    const scoreValue =
  typeof globalScore?.percentage === "number"
    ? Math.round(globalScore.percentage)
    : 0;

const executiveDiagnosis =
  scoreValue >= 80
    ? "La organización presenta una base operativa relativamente sólida, aunque todavía existen oportunidades puntuales para reforzar consistencia, estandarización y capacidad de escala."
    : scoreValue >= 60
    ? "La organización muestra capacidades funcionales relevantes, pero con brechas que limitan control, previsibilidad y eficiencia transversal."
    : "La organización presenta fragilidades estructurales que afectan ejecución, control y capacidad de crecimiento sostenido.";

const strategicImplication =
  risks.length > 0
    ? `La principal implicancia estratégica es que la debilidad en ${weakest} puede comprometer no solo la operación diaria, sino también la capacidad de escalar con orden, sostener márgenes y profesionalizar la toma de decisiones.`
    : "No se observan brechas críticas inmediatas, pero sí margen para fortalecer estructura, trazabilidad y disciplina operativa.";

const recommendedActions =
  risks.length > 0
    ? [
        `Definir un plan de intervención específico sobre ${weakest}.`,
        "Asignar responsable directo, plazo y criterio de éxito por frente crítico.",
        "Estandarizar seguimiento con indicadores periódicos y revisión ejecutiva.",
        strongest
          ? `Usar ${strongest} como capacidad de apoyo para acelerar mejoras.`
          : "Apoyarse en las áreas más estables para sostener la transición.",
      ]
    : [
        "Consolidar buenas prácticas actuales.",
        "Formalizar métricas y rutinas de seguimiento.",
        "Priorizar mejoras incrementales sobre eficiencia y escalabilidad.",
      ];

    return NextResponse.json({
      ok: true,
      analysis: {
        modeUsed: mode ?? "fast",
        modelUsed: mode === "premium" ? "gpt-4.1-mini" : "rules-engine-v1",
        summary,
        executiveDiagnosis,
        strategicImplication,
        risks,
        opportunities,
        priority,
        recommendedActions,
      },
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Error en análisis" },
      { status: 500 }
    );
  }
}