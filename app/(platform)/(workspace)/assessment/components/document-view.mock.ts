import type { TenantDocument } from "../types/documents";

export const mockDocuments: TenantDocument[] = [
  {
    id: "societario",
    tenantId: "tenant-demo",
    category: "legal",
    title: "Documentación societaria",
    description:
      "Estatuto, acta constitutiva, poderes, estructura legal y documentos base de la empresa.",
    status: "from_settings",
    source: "settings",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "financiera",
    tenantId: "tenant-demo",
    category: "financial",
    title: "Documentación financiera",
    description:
      "Balances, flujo de caja, estados financieros, impuestos y respaldos clave para evaluación.",
    status: "uploaded",
    source: "assessment",
    fileName: "balance-general-2025.pdf",
    fileUrl: "/mock/documents/balance-general-2025.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "operativa",
    tenantId: "tenant-demo",
    category: "operational",
    title: "Documentación operativa",
    description:
      "Manuales, SOPs, organigramas, reportes internos, políticas y evidencia de ejecución.",
    status: "empty",
    source: "assessment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "comercial",
    tenantId: "tenant-demo",
    category: "commercial",
    title: "Documentación comercial y mercado",
    description:
      "Pipeline, pricing, propuestas, reportes de ventas, materiales comerciales y benchmarks.",
    status: "empty",
    source: "assessment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];