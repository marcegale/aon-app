import type { AgentDefinition } from "./types";

export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "invoice-processor",
    name: "Procesador de Facturas",
    description:
      "Extracción automática de datos de facturas con IA y validación por el operador.",
    area: "accounting",
    status: "production",
    href: "/agents/accounting/invoice-processor",
    apiBase: "/api/agents/accounting",
  },
  {
    id: "x-agent",
    name: "X / Twitter Agent",
    description:
      "Generación editorial autónoma de publicaciones deportivas con aprobación humana.",
    area: "admin",
    status: "production",
    href: "/admin/x-agent",
    apiBase: "/api/admin/x",
    adminOnly: true,
  },
  {
    id: "recruiting-agent",
    name: "Agente de Recruiting",
    description:
      "Búsquedas de talento asistidas por IA con generación de perfiles y copies por plataforma.",
    area: "hr",
    status: "partial",
    href: "/agents/hr/recruiting",
    apiBase: "/api/agents/hr/recruiting",
  },
  {
    id: "assessment",
    name: "Diagnóstico Empresarial",
    description:
      "Evaluación estructurada en 12 bloques con scoring y plan de acción.",
    area: "workspace",
    status: "partial",
    href: "/assessment",
    apiBase: "/api/assessment",
  },
  {
    id: "charlie",
    name: "Charlie Voice Assistant",
    description: "Asistente de voz para operaciones internas.",
    area: "operations",
    status: "placeholder",
    href: "/agents/operations/charlie",
    apiBase: "/api/agents/operations/charlie",
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function getAgentsByArea(area: AgentDefinition["area"]): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.area === area);
}

export function getProductionAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.status === "production");
}
