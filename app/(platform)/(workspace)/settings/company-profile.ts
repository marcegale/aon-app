export const block00Identificacion = {
  id: "block-00",
  title: "Identificación de la Empresa",
  type: "form",
  hasScore: false,

  fields: [
    {
      id: "razon_social",
      label: "Razón Social",
      type: "text",
      required: true,
    },
    {
      id: "ruc",
      label: "RUC",
      type: "text",
      required: true,
    },
    {
      id: "fecha_constitucion",
      label: "Fecha de Constitución",
      type: "date",
      required: true,
    },
    {
      id: "email_direccion",
      label: "Correo de la Dirección",
      type: "email",
      required: true,
    },
    {
      id: "telefono_direccion",
      label: "Teléfono de la Dirección",
      type: "text",
      required: true,
    },
    {
      id: "ubicacion",
      label: "Ubicación (Maps)",
      type: "map",
      required: false,
    },
    {
      id: "direccion",
      label: "Dirección",
      type: "group",
      fields: [
        { id: "calle", type: "text" },
        { id: "numero", type: "text" },
        { id: "piso", type: "text" },
        { id: "oficina", type: "text" },
      ],
    },
    {
      id: "es_holding",
      label: "La empresa forma parte de un Holding",
      type: "checkbox",
      required: false,
    },
  ],
};