export const assessmentDocumentCategories = [
  {
    id: "organigrama",
    label: "Organigrama",
    multiple: false,
    source: "settings_preferred",
  },
  {
    id: "eerr",
    label: "Estado de Resultados (EERR)",
    multiple: true,
    source: "assessment",
  },
  {
    id: "balance_general",
    label: "Balance General",
    multiple: true,
    source: "assessment",
  },
  {
    id: "acta_constitucion",
    label: "Acta de Constitución",
    multiple: false,
    source: "settings_preferred",
  },
  {
    id: "acta_asamblea",
    label: "Acta de Asamblea",
    multiple: true,
    source: "assessment",
  },
  {
    id: "memoria_directorio",
    label: "Memoria del Directorio",
    multiple: true,
    source: "assessment",
  },
  {
    id: "otros_documentos",
    label: "Otros documentos",
    multiple: true,
    source: "assessment",
  },
] as const;