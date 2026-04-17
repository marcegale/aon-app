"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import jsPDF from "jspdf";
import { diagnosticBlocks } from "@/app/lib/diagnostico/config";
import { scoreBlock } from "@/app/lib/diagnostico/scoring";
import {
  BlockAnswer,
  DiagnosticQuestion,
  QuestionAnswer,
} from "@/app/lib/diagnostico/types";
import { BlockProgress } from "../../(platform)/assessment/components/block-progress";
import { QuestionCard } from "../../(platform)/assessment/components/question-card";
import { ScoreChip } from "../../(platform)/assessment/components/score-chip";
import { DocumentView } from "../../(platform)/assessment/components/document-view";
import { mockDocuments } from "../../(platform)/assessment/components/document-view.mock";
import type { TenantDocument } from "../../(platform)/assessment/types/documents";

function createInitialBlockAnswer(blockId: string): BlockAnswer {
  return {
    blockId,
    applicable: true,
    answers: [],
  };
}

export default function DiagnosticoPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = use(params);

// useEffect(() => {
//   const hasAuth = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(`tenant_auth_${tenantSlug}=`));
// 
//   if (!hasAuth) {
//     window.location.replace(`/${tenantSlug}/login`);
//   }
// }, []);

const tenantSlugValue =
  typeof tenantSlug === "string" && tenantSlug.trim().length > 0
    ? tenantSlug.trim()
    : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDocumentView, setIsDocumentView] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentActionLabel, setDocumentActionLabel] = useState<string | null>(null);
  const [blockAnswers, setBlockAnswers] = useState<BlockAnswer[]>(
    diagnosticBlocks.map((block) => createInitialBlockAnswer(block.id)),
  );
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [assessmentDocuments, setAssessmentDocuments] =
  useState<TenantDocument[]>(mockDocuments);
  
  const [aiAnalysis, setAiAnalysis] = useState<{
    modeUsed?: "fast" | "premium";
    modelUsed?: string;
    summary: string;
    executiveDiagnosis?: string;
    strategicImplication?: string;
    risks: string[];
    opportunities: string[];
    priority: string | null;
    recommendedActions?: string[];
  } | null>(null);

const [analysisMode, setAnalysisMode] = useState<"fast" | "premium">("fast");
const [isPremiumLoading, setIsPremiumLoading] = useState(false);

const [focusHelpOpen, setFocusHelpOpen] = useState(false);
const [focusHelpLoading, setFocusHelpLoading] = useState(false);
const [focusHelpText, setFocusHelpText] = useState("");
const [focusHelpQuestion, setFocusHelpQuestion] = useState("");
const [hasLoadedInitialAssessment, setHasLoadedInitialAssessment] = useState(false);

if (!tenantSlugValue) {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
          Tenant inválido o ausente en la URL.
        </div>
      </div>
    </div>
  );
}

    const currentBlock = diagnosticBlocks[currentIndex];
  const currentAnswer =
    blockAnswers.find((block) => block.blockId === currentBlock.id) ??
    createInitialBlockAnswer(currentBlock.id);

  const blockScore = useMemo(
  () => scoreBlock(currentBlock, currentAnswer),
  [currentBlock, currentAnswer],
);

const blockScores = useMemo(() => {
  return diagnosticBlocks.map((block) => {
    const answer =
      blockAnswers.find((item) => item.blockId === block.id) ??
      createInitialBlockAnswer(block.id);

    const result = scoreBlock(block, answer);
    const percentage =
      result.maxPoints > 0
        ? Math.round((result.earnedPoints / result.maxPoints) * 100)
        : 0;

    return {
      blockId: block.id,
      title: block.title,
      earned: result.earnedPoints,
      max: result.maxPoints,
      percentage,
      applicable: answer.applicable !== false,
    };
  });
}, [blockAnswers]);

const globalScore = useMemo(() => {
  const totals = blockScores.reduce(
    (acc, block) => {
      acc.earned += block.earned;
      acc.max += block.max;
      return acc;
    },
    { earned: 0, max: 0 },
  );

  const percentage =
    totals.max > 0 ? Math.round((totals.earned / totals.max) * 100) : 0;

  return {
    earned: totals.earned,
    max: totals.max,
    percentage,
  };
}, [blockScores]);

const weakestBlocks = useMemo(() => {
  return [...blockScores]
    .filter((block) => block.applicable && block.max > 0)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);
}, [blockScores]);

const executiveSummary = useMemo(() => {
  const weakest = weakestBlocks.map((b) => b.title);

  if (globalScore.percentage < 40) {
    return `La operación presenta debilidades críticas, especialmente en ${weakest.join(
      ", ",
    )}. Se recomienda intervención inmediata.`;
  }

  if (globalScore.percentage < 70) {
    return `Existen oportunidades claras de mejora, principalmente en ${weakest.join(
      ", ",
    )}. Ajustes estratégicos pueden generar impacto significativo.`;
  }

  return `La operación muestra un desempeño sólido. Los principales focos de optimización se encuentran en ${weakest.join(
    ", ",
  )}.`;
}, [globalScore, weakestBlocks]);

const executiveAlert = useMemo(() => {
  if (globalScore.percentage < 40) {
    return {
      label: "Riesgo alto",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    };
  }

  if (globalScore.percentage < 70) {
    return {
      label: "Atención requerida",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    };
  }

  return {
    label: "Salud operativa sólida",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  };
}, [globalScore]);

const executiveDiagnosisText =
  aiAnalysis?.executiveDiagnosis ||
  "La organización presenta hallazgos relevantes que requieren revisión estructurada.";

const strategicImplicationText =
  aiAnalysis?.strategicImplication ||
  "Las brechas detectadas impactan la consistencia operativa, la capacidad de control y la escalabilidad.";

const recommendedActionsText =
  Array.isArray(aiAnalysis?.recommendedActions) && aiAnalysis.recommendedActions.length > 0
    ? aiAnalysis.recommendedActions
    : [
        "Definir un frente prioritario de intervención.",
        "Asignar responsable y plazo de ejecución.",
        "Implementar seguimiento periódico con indicadores.",
      ];

useEffect(() => {
  if (!tenantSlugValue) return;
  if (!blockAnswers || Object.keys(blockAnswers).length === 0) return;

  const runAnalysis = async () => {
    try {
      const response = await fetch("/api/assessment/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantSlug: tenantSlugValue,
          blockScores,
          globalScore,
          weakestBlocks,
          mode: "fast",
        }),
      });

      const data = await response.json();

      if (data.ok && data.analysis) {
        setAiAnalysis(data.analysis);
        setAnalysisMode("fast");
      }
    } catch (error) {
      console.error("Error generando análisis IA:", error);
    }
  };

  runAnalysis();
}, [tenantSlug, blockScores, globalScore, weakestBlocks]);

  const updateQuestion = (question: DiagnosticQuestion, next: QuestionAnswer) => {
    setBlockAnswers((prev) =>
      prev.map((block) => {
        if (block.blockId !== currentBlock.id) return block;

        const existing = block.answers.find((a) => a.questionId === question.id);
        const nextAnswers = existing
          ? block.answers.map((a) => (a.questionId === question.id ? next : a))
          : [...block.answers, next];

        return { ...block, answers: nextAnswers };
      }),
    );
  };

  const toggleBlockApplicable = (value: boolean) => {
    setBlockAnswers((prev) =>
      prev.map((block) =>
        block.blockId === currentBlock.id ? { ...block, applicable: value } : block,
      ),
    );
  };

  const quickViewBlocks = [
    ...diagnosticBlocks.map((block) => ({
      ...block,
      isDocumentBlock: false,
    })),
    {
      id: "block-13",
      title: "Documentación y Evidencia",
      isDocumentBlock: true,
    },
  ];

  useEffect(() => {
  if (!tenantSlug) return;

  const loadDocuments = async () => {
      try {
        const res = await fetch(
          `/api/assessment/documents?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        );
        const data = await res.json();

        if (data.ok) {
          const mergedDocuments = mockDocuments.map((mockDoc: TenantDocument) => {
            const realDoc = data.documents.find(
              (doc: TenantDocument) => doc.category === mockDoc.category,
            );

            return realDoc ?? mockDoc;
          });

          setAssessmentDocuments(mergedDocuments);
        }
      } catch (error) {
        console.error("Error cargando documentos:", error);
      }
    };

    loadDocuments();
  }, [tenantSlug]);

useEffect(() => {
  const loadLatestAssessment = async () => {
    try {
      if (!tenantSlugValue) return;

      const res = await fetch(
        `/api/assessment/latest?tenantSlug=${encodeURIComponent(tenantSlugValue)}`
      );

      const data = await res.json();

      if (data?.ok && data?.data?.rawData?.blockAnswers) {
        setBlockAnswers(data.data.rawData.blockAnswers);
      }
    } catch (error) {
      console.error("Error cargando assessment previo:", error);
    } finally {
      setHasLoadedInitialAssessment(true);
    }
  };

  loadLatestAssessment();
}, [tenantSlugValue]);

useEffect(() => {
  if (!tenantSlugValue) return;
  if (!hasLoadedInitialAssessment) return;
  if (!blockAnswers || blockAnswers.length === 0) return;

  const timeout = setTimeout(async () => {
    try {
      setIsSavingAssessment(true);

      await fetch("/api/assessment/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantSlug: tenantSlugValue,
          blockScores,
          globalScore,
          weakestBlocks,
          blockAnswers,
          aiAnalysis,
          mode: analysisMode,
        }),
      });
    } catch (error) {
      console.error("Error guardando assessment automáticamente:", error);
    } finally {
      setIsSavingAssessment(false);
    }
  }, 800);

  return () => clearTimeout(timeout);
}, [
  tenantSlugValue,
  blockAnswers,
  blockScores,
  globalScore,
  weakestBlocks,
  aiAnalysis,
  analysisMode,
  hasLoadedInitialAssessment
]);

const handleDownloadPdf = () => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  let y = 18;

  const scoreValue =
    typeof globalScore?.percentage === "number" ? globalScore.percentage : 0;

  const scoreLabel =
    scoreValue >= 80
      ? "Salud operativa sólida"
      : scoreValue >= 60
      ? "Atención requerida"
      : "Riesgo alto";

  const weakestLabel =
    Array.isArray(weakestBlocks) && weakestBlocks.length > 0
      ? weakestBlocks[0].title
      : "Sin foco crítico identificado";

  const premiumSummary = aiAnalysis?.summary || executiveSummary;
  const premiumDiagnosis =
    aiAnalysis?.executiveDiagnosis || executiveDiagnosisText;
  const premiumImplication =
    aiAnalysis?.strategicImplication || strategicImplicationText;
  const premiumPriority = aiAnalysis?.priority || `Intervenir ${weakestLabel}`;
  const premiumActions =
    Array.isArray(aiAnalysis?.recommendedActions) && aiAnalysis.recommendedActions.length > 0
      ? aiAnalysis.recommendedActions
      : recommendedActionsText;

  const premiumRisks =
    Array.isArray(aiAnalysis?.risks) && aiAnalysis.risks.length > 0
      ? aiAnalysis.risks
      : weakestBlocks.map((b) => `${b.title} con score de ${b.percentage}%`);

  const premiumOpportunities =
    Array.isArray(aiAnalysis?.opportunities) && aiAnalysis.opportunities.length > 0
      ? aiAnalysis.opportunities
      : blockScores
          .filter((b) => b.percentage >= 70)
          .slice(0, 3)
          .map((b) => `${b.title} como palanca de consolidación`);

  const topStrengths = [...blockScores]
    .filter((b) => b.applicable && b.max > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  const drawPageHeader = () => {
    doc.setFillColor(11, 13, 18);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFillColor(28, 34, 48);
    doc.roundedRect(marginX, 10, contentWidth, 20, 3, 3, "F");

    doc.setTextColor(233, 215, 165);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Always On · Reporte Ejecutivo de Diagnóstico", marginX + 4, 22);

    doc.setTextColor(160, 166, 178);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Empresa: ${(tenantSlugValue || "Cliente").replace(/-/g, " ").toUpperCase()}`,
      marginX + 4,
      27
    );

    y = 40;
  };

  const ensureSpace = (needed = 16) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      drawPageHeader();
    }
  };

  const sectionTitle = (title: string, subtitle?: string) => {
    ensureSpace(18);

    doc.setDrawColor(201, 162, 77);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(233, 215, 165);
    doc.text(title, marginX, y);

    if (subtitle) {
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(160, 166, 178);
      doc.text(subtitle, marginX, y);
    }

    y += 8;
  };

  const paragraph = (text: string, fontSize = 10, extraGap = 5) => {
    ensureSpace(16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(235, 235, 235);

    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 5 + extraGap;
  };

  const bulletList = (items: string[], emptyText: string) => {
    if (!items.length) {
      paragraph(emptyText);
      return;
    }

    items.forEach((item) => {
      ensureSpace(10);
      doc.setFillColor(201, 162, 77);
      doc.circle(marginX + 2, y - 1, 1, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(235, 235, 235);

      const lines = doc.splitTextToSize(item, contentWidth - 8);
      doc.text(lines, marginX + 6, y);
      y += lines.length * 5 + 3;
    });

    y += 2;
  };

  const metricCard = (
    x: number,
    cardY: number,
    width: number,
    title: string,
    value: string,
    note: string
  ) => {
    doc.setFillColor(28, 34, 48);
    doc.roundedRect(x, cardY, width, 26, 3, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 166, 178);
    doc.text(title.toUpperCase(), x + 4, cardY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(value, x + 4, cardY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(201, 162, 77);
    doc.text(note, x + 4, cardY + 22);
  };

  const drawScoreBar = (x: number, barY: number, width: number, value: number) => {
    doc.setFillColor(55, 61, 74);
    doc.roundedRect(x, barY, width, 6, 2, 2, "F");

    const filled = Math.max(6, Math.min(width, (width * value) / 100));
    doc.setFillColor(201, 162, 77);
    doc.roundedRect(x, barY, filled, 6, 2, 2, "F");
  };

  const blockTable = () => {
    sectionTitle("Desempeño por bloque", "Lectura rápida de madurez operativa");

    const startX = marginX;
    const col1 = 100;
    const col2 = 24;
    const col3 = 30;
    const col4 = 26;
    const rowH = 8;

    ensureSpace(20);

    doc.setFillColor(28, 34, 48);
    doc.rect(startX, y, col1 + col2 + col3 + col4, rowH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(233, 215, 165);
    doc.text("Bloque", startX + 2, y + 5.5);
    doc.text("Score", startX + col1 + 2, y + 5.5);
    doc.text("Puntos", startX + col1 + col2 + 2, y + 5.5);
    doc.text("Estado", startX + col1 + col2 + col3 + 2, y + 5.5);

    y += rowH;

    blockScores.forEach((block) => {
      ensureSpace(10);

      doc.setDrawColor(60, 66, 80);
      doc.rect(startX, y, col1 + col2 + col3 + col4, rowH);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(235, 235, 235);
      doc.text(block.title.slice(0, 42), startX + 2, y + 5.5);
      doc.text(`${block.percentage}%`, startX + col1 + 2, y + 5.5);
      doc.text(`${block.earned}/${block.max}`, startX + col1 + col2 + 2, y + 5.5);

      const status =
        block.percentage >= 80
          ? "Sólido"
          : block.percentage >= 60
          ? "Mejora"
          : "Crítico";

      doc.text(status, startX + col1 + col2 + col3 + 2, y + 5.5);

      y += rowH;
    });

    y += 6;
  };

  drawPageHeader();

  doc.setFillColor(28, 34, 48);
  doc.roundedRect(marginX, y, contentWidth, 52, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Diagnóstico Estratégico Operativo", marginX + 5, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 185, 195);
  const heroText = doc.splitTextToSize(
    "Resumen estratégico del estado actual del negocio, con foco en riesgos, oportunidades y prioridad de intervención.",
    contentWidth - 10
  );
  doc.text(heroText, marginX + 5, y + 20);

  drawScoreBar(marginX + 5, y + 34, contentWidth - 10, scoreValue);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(233, 215, 165);
  doc.text(`${scoreValue}%`, marginX + 5, y + 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(235, 235, 235);
  doc.text(scoreLabel, marginX + 28, y + 47);

  y += 62;

  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 2) / 3;

  metricCard(
    marginX,
    y,
    cardWidth,
    "Estado",
    scoreLabel,
    "Lectura ejecutiva"
  );
  metricCard(
    marginX + cardWidth + cardGap,
    y,
    cardWidth,
    "Foco crítico",
    weakestBlocks[0] ? `${weakestBlocks[0].percentage}%` : "N/A",
    weakestLabel
  );
  metricCard(
    marginX + (cardWidth + cardGap) * 2,
    y,
    cardWidth,
    "Modo análisis",
    analysisMode === "premium" ? "Premium" : "Fast",
    aiAnalysis?.modelUsed || "Motor actual"
  );

  y += 36;

  sectionTitle("Lectura ejecutiva", "Qué debería entender un director en 60 segundos");
  paragraph(premiumSummary);
  
  sectionTitle("Diagnóstico ejecutivo", "Lectura de madurez operativa");
  paragraph(premiumDiagnosis);

  sectionTitle("Implicancia estratégica", "Impacto transversal sobre el negocio");
  paragraph(premiumImplication);

  sectionTitle("Prioridad recomendada", "Acción principal sugerida");
  paragraph(premiumPriority);

  sectionTitle("Riesgos principales", "Factores que hoy limitan desempeño o control");
  bulletList(premiumRisks.slice(0, 5), "No se detectaron riesgos relevantes.");

  sectionTitle("Oportunidades de mayor retorno", "Áreas donde conviene capturar valor primero");
  bulletList(
    premiumOpportunities.slice(0, 5),
    "No se identificaron oportunidades destacadas."
  );
 
  sectionTitle("Fortalezas actuales", "Capacidades que conviene preservar y escalar");
  bulletList(
    topStrengths.map((b) => `${b.title} con ${b.percentage}% de cumplimiento.`),
    "No se detectaron fortalezas claras."
  );

  sectionTitle("Acciones recomendadas", "Siguiente nivel de intervención");
  bulletList(
    premiumActions,
    "No se definieron acciones recomendadas."
  );

  blockTable();

  sectionTitle("Cierre ejecutivo");
  paragraph(
    `El diagnóstico posiciona a la organización en un estado de ${scoreLabel.toLowerCase()}, con una brecha clara en ${weakestLabel}. ` +
    `La ejecución disciplinada sobre este frente tendrá impacto directo en control, eficiencia y escalabilidad del negocio.`
  );

  paragraph(
    "Este documento es una salida ejecutiva inicial. La siguiente fase recomendada es traducir estos hallazgos a un plan de acción por frente, responsable, plazo e impacto esperado.",
    9,
    0
  );

  doc.save(`reporte-ejecutivo-${tenantSlugValue || "tenant"}.pdf`);
};


    return (
    <>
      <div className="min-h-screen bg-[#0B0D12] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <BlockProgress
          current={currentIndex + 1}
          total={diagnosticBlocks.length}
          title={currentBlock.title}
          subtitle={currentBlock.subtitle}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {!isDocumentView ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                      Bloque actual · Tenant: {tenantSlug}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {currentBlock.title}
                    </h2>
                    {currentBlock.description ? (
                      <p className="mt-1 text-sm text-white/55">{currentBlock.description}</p>
                    ) : null}
                  </div>

                  <ScoreChip score={blockScore.earnedPoints} max={blockScore.maxPoints} />
                </div>

                {currentBlock.allowNotApplicable ? (
                  <label className="mt-5 flex items-center gap-3 text-sm text-white/75">
                    <input
                      type="checkbox"
                      checked={!currentAnswer.applicable}
                      onChange={(e) => toggleBlockApplicable(!e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-[#C9A24D] focus:ring-[#C9A24D]"
                    />
                    Este bloque no aplica para esta empresa
                  </label>
                ) : null}
              </div>

              <div className="space-y-4">
                {currentBlock.questions.map((question) => {
                  const answer = currentAnswer.answers.find((a) => a.questionId === question.id);

                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      answer={answer}
                      onChange={(next: QuestionAnswer) => updateQuestion(question, next)}
                      onFocusClick={async () => {
                        try {
                          const questionLabel =
                            (question as any).text ??
                            (question as any).label ??
                            (question as any).title ??
                            "Explicación de la pregunta";

                          setFocusHelpOpen(true);
                          setFocusHelpLoading(true);
                          setFocusHelpText("");
                          setFocusHelpQuestion(questionLabel);

                          const res = await fetch("/api/assessment/question-help", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              question: questionLabel,
                              blockTitle: currentBlock.title,
                            }),
                          });

                          const data = await res.json();

                          if (data?.ok) {
                            setFocusHelpText(data.text);
                          } else {
                            setFocusHelpText("No se pudo generar la explicación.");
                          }
                        } catch (error) {
                          setFocusHelpText("Error al generar explicación.");
                        } finally {
                          setFocusHelpLoading(false);
                        }
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsDocumentView(false);
                    setCurrentIndex((prev) => Math.max(prev - 1, 0));
                  }}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDocumentView(false);
                    setCurrentIndex((prev) => Math.min(prev + 1, diagnosticBlocks.length - 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C9A24D] px-4 py-3 text-sm font-medium text-[#0B0D12] transition hover:brightness-110"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DocumentView
                documents={assessmentDocuments}
                onBack={() => {
                  setIsDocumentView(false);
                  setSelectedDocumentId(null);
                  setDocumentActionLabel(null);
                }}
                onAction={async (action: { type: string; documentId: string }) => {
                  setSelectedDocumentId(action.documentId);

                  if (action.type === "open_upload") {
                    setSelectedDocumentId(action.documentId);
                    setDocumentActionLabel("Simulando carga...");

                    const targetDoc = assessmentDocuments.find(
                      (doc) => doc.id === action.documentId,
                    );

                    if (!targetDoc) {
                      setDocumentActionLabel("Documento no encontrado");
                      return;
                    }

                    try {
                      const formData = new FormData();
                      formData.append("tenantSlug", tenantSlug);
                      formData.append("category", targetDoc.category);
                      formData.append("title", `${targetDoc.title} - cargado desde UI`);
                      formData.append(
                        "description",
                        `Carga simulada para ${targetDoc.title}`,
                      );
                      formData.append("status", "uploaded");
                      formData.append("source", "assessment");

                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";

                      const selectedFile: File | null = await new Promise((resolve) => {
                        input.onchange = () => {
                          resolve(input.files?.[0] ?? null);
                        };
                        input.click();
                      });

                      if (!selectedFile) {
                        setDocumentActionLabel("Carga cancelada");
                        return;
                      }

                      const allowedTypes = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "image/png",
                        "image/jpeg",
                      ];

                      const maxSizeBytes = 10 * 1024 * 1024;

                      if (!allowedTypes.includes(selectedFile.type)) {
                        setDocumentActionLabel("Formato no permitido");
                        return;
                      }

                      if (selectedFile.size > maxSizeBytes) {
                        setDocumentActionLabel("Archivo demasiado grande");
                        return;
                      }

                      formData.append("file", selectedFile);

                      const uploadRes = await fetch("/api/assessment/documents", {
                        method: "POST",
                        body: formData,
                      });

                      if (!uploadRes.ok) {
                        throw new Error("No se pudo cargar el documento");
                      }

                      const res = await fetch(
                        `/api/assessment/documents?tenantSlug=${encodeURIComponent(tenantSlug)}`,
                      );
                      const data = await res.json();

                      if (data.ok) {
                        const mergedDocuments = mockDocuments.map(
                        (mockDoc: TenantDocument) => {
                            const storedDoc = data.documents.find(
                            (doc: TenantDocument) => doc.category === mockDoc.category,
                            );

                            return storedDoc
                              ? {
                                  ...mockDoc,
                                  ...storedDoc,
                                }
                              : mockDoc;
                          },
                        );

                        setAssessmentDocuments(mergedDocuments);
                        setSelectedDocumentId(null);
                        setDocumentActionLabel("Documento cargado correctamente");
                      } else {
                        setDocumentActionLabel("Error al refrescar documentos");
                      }
                    } catch (error) {
                      console.error(error);
                      setDocumentActionLabel("Error en carga");
                    }

                    return;
                  }

                  if (action.type === "open_document") {
                    const targetDoc = assessmentDocuments.find(
                      (doc) => doc.id === action.documentId,
                    );

                    if (targetDoc?.fileUrl) {
                      window.open(targetDoc.fileUrl, "_blank", "noopener,noreferrer");
                      setDocumentActionLabel("Documento abierto");
                    } else {
                      setDocumentActionLabel("Archivo no disponible");
                    }

                    return;
                  }

                  if (action.type === "go_settings") {
                    setDocumentActionLabel("Ir a Settings / Company Profile");
                  }
                }}
              />

              {selectedDocumentId && documentActionLabel ? (
                <div className="rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-4 text-sm text-[#E9D7A5]">
                  Acción mock: <span className="font-medium">{documentActionLabel}</span> ·
                  Documento: <span className="font-medium">{selectedDocumentId}</span>
                </div>
              ) : null}
            </div>
          )}

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                Vista rápida
              </p>

<div className="mt-4 rounded-xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-4">
  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E9D7A5]/70">
    Score global
  </div>

  <div className="mt-2 text-2xl font-semibold text-[#E9D7A5]">
    {globalScore.percentage}%
  </div>

  <div className="text-xs text-white/45">
    {globalScore.earned} / {globalScore.max} puntos
  </div>

  <div className={`mt-3 rounded-lg border p-3 text-sm ${executiveAlert.bg}`}>
    <span className={`font-medium ${executiveAlert.color}`}>
      {executiveAlert.label}
    </span>
  </div>

  <button
    disabled={isPremiumLoading}
    type="button"
    onClick={async () => {
          try {
            setIsPremiumLoading(true);

            const response = await fetch("/api/assessment/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tenantSlug: tenantSlugValue,
                blockScores,
                globalScore,
                weakestBlocks,
                mode: "premium",
              }),
            });

            const data = await response.json();

            if (data.ok && data.analysis) {
              setAiAnalysis(data.analysis);
              setAnalysisMode("premium");
            }

            if (isSavingAssessment) return;
            if (!blockAnswers || blockAnswers.length === 0) return;

            setIsSavingAssessment(true);

            try {
              await fetch("/api/assessment/save", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  tenantSlug: tenantSlugValue,
                  blockScores,
                  globalScore,
                  weakestBlocks,
                  blockAnswers,
                  aiAnalysis: data.analysis,
                  mode: "premium",
                }),
              });
            } finally {
              setIsSavingAssessment(false);
            }

          } catch (error) {
        console.error("Error generando análisis premium:", error);
      } finally {
        setIsPremiumLoading(false);
      }
    }}
    className="mt-3 w-full rounded-xl border border-[#C9A24D]/30 bg-[#C9A24D]/15 px-4 py-3 text-sm font-medium text-[#E9D7A5] transition hover:bg-[#C9A24D]/25"
  >
    {isPremiumLoading ? "Generando reporte..." : "Generar reporte premium"}
  </button>
  <button
    type="button"
    onClick={handleDownloadPdf}
    className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
  >
    Descargar PDF
  </button>
</div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                      Resumen ejecutivo
                    </div>

                    <div
                      className={`text-[10px] px-2 py-1 rounded-full border ${
                        analysisMode === "premium"
                          ? "border-[#C9A24D]/40 bg-[#C9A24D]/10 text-[#E9D7A5]"
                          : "border-white/10 bg-white/[0.05] text-white/50"
                      }`}
                    >
                      {analysisMode === "premium" ? "PREMIUM" : "FAST"}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {aiAnalysis?.summary || executiveSummary}
                  </p>
                </div>

                {aiAnalysis ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                      Insights IA
                    </div>

                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/55">Prioridad principal</span>
                        <span className="text-right text-[#C9A24D]">
                          {aiAnalysis.priority || "Sin definir"}
                        </span>
                      </div>

                      <div>
                        <div className="text-white/55">Riesgos</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {aiAnalysis.risks.length > 0 ? (
                            aiAnalysis.risks.map((risk) => (
                              <span
                                key={risk}
                                className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-200"
                              >
                                {risk}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/40">Sin riesgos detectados</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-white/55">Oportunidades</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {aiAnalysis.opportunities.length > 0 ? (
                            aiAnalysis.opportunities.map((opportunity) => (
                              <span
                                key={opportunity}
                                className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs text-green-200"
                              >
                                {opportunity}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/40">Sin oportunidades destacadas</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {weakestBlocks.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                      Prioridades
                    </div>

                    <div className="mt-3 space-y-2">
                      {weakestBlocks.map((block) => (
                        <div key={block.blockId} className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-white/75">{block.title}</span>
                          <span className="text-[#C9A24D]">{block.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              <div className="mt-4 rounded-xl border border-[#C9A24D]/20 bg-[#1C2230] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                    Global Score
                  </div>

                  {typeof globalScore?.percentage === "number" && (
                    <span className="text-[11px] text-white/50">
                      {globalScore.percentage >= 80
                        ? "Sólido"
                        : globalScore.percentage >= 60
                        ? "En desarrollo"
                        : "Crítico"}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-3xl font-semibold text-white">
                  {typeof globalScore?.percentage === "number"
                    ? globalScore.percentage.toFixed(1)
                    : "-"}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#C9A24D]/20 bg-[#1C2230] p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Estado del negocio
                </div>

                <div className="mt-2 text-sm text-white/90">
                  {typeof globalScore?.percentage === "number" ? (
                    globalScore.percentage >= 80 ? (
                      "Operación sólida con oportunidades de optimización puntual."
                    ) : globalScore.percentage >= 60 ? (
                      "Operación funcional con brechas que requieren intervención estratégica."
                    ) : (
                      "Riesgo operativo elevado. Se requiere intervención prioritaria."
                    )
                  ) : (
                    "Sin información suficiente para evaluar."
                  )}
                </div>

                {Array.isArray(weakestBlocks) && weakestBlocks.length > 0 && (
                  <div className="mt-2 text-xs text-white/50">
                    Principal foco: {weakestBlocks[0].title}
                  </div>
                )}
              </div>

              {analysisMode === "premium" && aiAnalysis ? (
                <div className="mt-4 rounded-xl border border-[#C9A24D]/20 bg-[#1C2230] p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E9D7A5]">
                    Análisis estratégico
                  </div>

                  {aiAnalysis.summary && (
                    <div className="mt-2 text-sm text-white/90">
                      {aiAnalysis.summary}
                    </div>
                  )}

                  {aiAnalysis.modeUsed && aiAnalysis.modelUsed && (
                    <div className="mt-2 text-[11px] text-white/40">
                      {aiAnalysis.modeUsed} · {aiAnalysis.modelUsed}
                    </div>
                  )}

                  {Array.isArray(aiAnalysis.risks) && aiAnalysis.risks.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] uppercase text-red-400/80">
                        Riesgos detectados
                      </div>
                      <ul className="mt-1 space-y-1 text-sm text-white/80">
                        {aiAnalysis.risks.slice(0, 3).map((r: string, i: number) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(aiAnalysis.opportunities) &&
                    aiAnalysis.opportunities.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] uppercase text-green-400/80">
                          Oportunidades
                        </div>
                        <ul className="mt-1 space-y-1 text-sm text-white/80">
                          {aiAnalysis.opportunities
                            .slice(0, 3)
                            .map((o: string, i: number) => (
                              <li key={i}>• {o}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : null}

              {analysisMode === "premium" && aiAnalysis ? (
                <>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-sm font-semibold text-[#E9D7A5]">
                      Diagnóstico ejecutivo
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Lectura de madurez y consistencia operativa
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/90">
                      {executiveDiagnosisText}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-sm font-semibold text-[#E9D7A5]">
                      Implicancia estratégica
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Impacto esperado sobre control, eficiencia y escalabilidad
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/90">
                      {strategicImplicationText}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-sm font-semibold text-[#E9D7A5]">
                      Acciones recomendadas
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Próximos pasos sugeridos
                    </div>

                    <div className="mt-3 space-y-2">
                      {recommendedActionsText.map((action, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white/90"
                        >
                          {index + 1}. {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {analysisMode === "premium" && aiAnalysis?.priority ? (
                <div className="mt-4 rounded-xl border border-[#C9A24D]/30 bg-[#C9A24D]/10 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E9D7A5]">
                    Plan de acción prioritario
                  </div>

                  <div className="mt-2 text-sm text-white">
                    {aiAnalysis.priority}
                  </div>

                  {Array.isArray(weakestBlocks) && weakestBlocks.length > 0 && (
                    <button
                      onClick={() => {
                        const first = weakestBlocks[0];
                        if (first?.blockId) {
                          const element = document.getElementById(first.blockId);
                          element?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className="mt-3 text-xs text-[#C9A24D] hover:underline"
                    >
                      Ir al área a mejorar
                    </button>
                  )}
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-red-500/20 bg-[#1C2230] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-red-400">
                    Riesgo prioritario
                  </div>

                  {Array.isArray(weakestBlocks) && weakestBlocks.length > 0 && (
                    <button
                      onClick={() => {
                        const first = weakestBlocks[0];
                        if (first?.blockId) {
                          const element = document.getElementById(first.blockId);
                          element?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className="text-[11px] text-[#C9A24D] hover:underline"
                    >
                      Ver bloque
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  {Array.isArray(weakestBlocks) && weakestBlocks.length > 0 ? (
                    <div className="text-sm text-white">
                      {weakestBlocks[0].title}
                    </div>
                  ) : (
                    <div className="text-sm text-white/40">Sin riesgos detectados</div>
                  )}
                </div>

                {analysisMode === "premium" && aiAnalysis?.priority ? (
                  <div className="mt-3 rounded-lg border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-3">
                    <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#E9D7A5]">
                      Acción sugerida por IA
                    </div>
                    <div className="mt-1 text-sm text-white/85">
                      {aiAnalysis.priority}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                {quickViewBlocks.map((block) => {
                  const answer = blockAnswers.find((a) => a.blockId === block.id);
                  const realIndex = diagnosticBlocks.findIndex((b) => b.id === block.id);
                  const isActive = !block.isDocumentBlock && realIndex === currentIndex;

                  const scoreLabel = block.isDocumentBlock
                    ? "Docs"
                    : (() => {
                        const diagnosticBlock = diagnosticBlocks.find((b) => b.id === block.id);
                        if (!diagnosticBlock) return "0 / 100";
                        const detail = scoreBlock(diagnosticBlock, answer);
                        return `${detail.earnedPoints} / ${detail.maxPoints}`;
                      })();

                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => {
                        if (block.isDocumentBlock) {
                          setIsDocumentView(true);
                          return;
                        }

                        setIsDocumentView(false);

                        if (realIndex >= 0) setCurrentIndex(realIndex);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-[#C9A24D]/50 bg-[#C9A24D]/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white">{block.title}</div>
                        <div className="text-xs text-white/45">{scoreLabel}</div>

                        {!block.isDocumentBlock ? (
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#C9A24D]"
                              style={{
                                width: `${
                                  blockScores.find((item) => item.blockId === block.id)?.percentage ?? 0
                                }%`,
                              }}
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="text-xs text-[#C9A24D]">
                        {block.isDocumentBlock
                          ? "Ver"
                          : answer?.applicable === false
                            ? "N/A"
                            : "Ver"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                Notas de diseño
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                <li>UI sobria, premium, sin ruido visual.</li>
                <li>Cards oscuras, bordes suaves, acento dorado sutil.</li>
                <li>Preparado para multi-step real y dashboard posterior.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
    {focusHelpOpen ? (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#11131A] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#C9A24D]">
                Foco IA
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {focusHelpQuestion || "Explicación de la pregunta"}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setFocusHelpOpen(false);
                setFocusHelpText("");
                setFocusHelpQuestion("");
                setFocusHelpLoading(false);
              }}
              className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/85 whitespace-pre-wrap">
            {focusHelpLoading
              ? "Generando explicación..."
              : focusHelpText || "Sin contenido."}
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}