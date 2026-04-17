export const block13Documentos = {
  id: "block-13",
  title: "Documentación y Evidencia",
  type: "documents",
  hasScore: false,

  categories: [
    {
      id: "organigrama",
      label: "Organigrama",
      required: false,
      multiple: false,
    },
    {
      id: "eerr",
      label: "Estado de Resultados (EERR)",
      required: false,
      multiple: true,
    },
    {
      id: "balance",
      label: "Balance General",
      required: false,
      multiple: true,
    },
    {
      id: "acta_constitucion",
      label: "Acta de Constitución",
      required: false,
      multiple: false,
      source: "settings_preferred",
    },
    {
      id: "acta_asamblea",
      label: "Última Acta de Asamblea",
      required: false,
      multiple: true,
    },
    {
      id: "memoria_directorio",
      label: "Memoria del Directorio",
      required: false,
      multiple: true,
    },
    {
      id: "otros",
      label: "Otros Documentos",
      required: false,
      multiple: true,
    },
  ],
};