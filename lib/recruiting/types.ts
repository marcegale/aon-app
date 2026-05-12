import type { ProcessingStatus, RecruitingPipelineStage } from "@/generated/prisma/client";

export type RecruitingDecision = "qualified" | "rejected";

export const recruitingPipelineStages: Array<{
  value: RecruitingPipelineStage;
  label: string;
}> = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "technical", label: "Technical" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export const recruitingPipelineStageValues = recruitingPipelineStages.map((stage) => stage.value);

export function isRecruitingPipelineStage(value: unknown): value is RecruitingPipelineStage {
  return (
    typeof value === "string" &&
    recruitingPipelineStageValues.includes(value as RecruitingPipelineStage)
  );
}

export function isRecruitingDecision(value: unknown): value is RecruitingDecision {
  return value === "qualified" || value === "rejected";
}

export const processingOrder: Record<ProcessingStatus, number> = {
  completed: 0,
  queued: 1,
  processing: 1,
  retrying: 1,
  pending: 1,
  failed: 2,
  skipped: 2,
};

export function getFitLabel(cvScore: number | null | undefined, processingStatus?: string) {
  if (cvScore === null || cvScore === undefined || processingStatus !== "completed") {
    return "Pendiente";
  }

  if (cvScore >= 80) {
    return "Alto fit";
  }

  if (cvScore >= 60) {
    return "Medio fit";
  }

  return "Bajo fit";
}

export function getFitClass(cvScore: number | null | undefined, processingStatus?: string) {
  const fit = getFitLabel(cvScore, processingStatus);

  if (fit === "Alto fit") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }

  if (fit === "Medio fit") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  }

  if (fit === "Bajo fit") {
    return "border-red-500/25 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/5 text-white/60";
}

export function getProcessingStatusClass(status: string) {
  if (status === "completed") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "failed" || status === "skipped") {
    return "border-red-500/25 bg-red-500/10 text-red-300";
  }

  if (status === "processing" || status === "retrying") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  }

  return "border-white/10 bg-white/5 text-white/60";
}
