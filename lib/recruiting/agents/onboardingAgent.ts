import { assertTenant, RecruitingAgent, RecruitingAgentInput } from "./types";

export function generateOnboardingChecklist() {
  return [
    "Confirmar aceptacion de oferta",
    "Preparar documentos contractuales",
    "Coordinar fecha de inicio",
    "Asignar responsable de onboarding",
    "Programar recordatorios",
  ];
}

export const onboardingAgent: RecruitingAgent = {
  agentType: "onboarding",
  validateInput(input: RecruitingAgentInput) {
    assertTenant(input);
  },
  async execute() {
    const checklist = generateOnboardingChecklist();
    return {
      summary: "Onboarding readiness checklist prepared.",
      recommendations: [{ type: "onboarding_checklist", checklist }],
      metrics: { checklistItems: checklist.length },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(_input, result) {
    return { agentType: "onboarding", metrics: result.metrics };
  },
};
