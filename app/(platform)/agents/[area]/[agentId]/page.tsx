"use client";

import { use, useRef, useEffect, useMemo, useState } from "react";

type ParsedInvoiceItem = {
  descripcion: string;
  monto: number | string;
  ivaTipo: "EXENTO" | "5" | "10" | string;
};

type ParsedInvoice = {
  proveedor: string;
  fecha: string;
  numeroFactura: {
    establecimiento: string;
    puntoExpedicion: string;
    numero: string;
  };
  timbrado: string;
  vencimientoTimbrado: string;
  total: number | string;
  moneda: string;
  iva5: number | string;
  iva10: number | string;
  ivaExento: number | string;
  ivaTotal: number | string;
  actividadesProveedor: string[];
  items: ParsedInvoiceItem[];
};

type ValidationIssue = {
  type: "error" | "warning";
  field: string;
  message: string;
};

type ValidationResult = {
  isValid: boolean;
  issues: ValidationIssue[];
};

type AgentPageProps = {
  params: Promise<{
    area: string;
    agentId: string;
  }>;
};

const agentsData: Record<
  string,
  Record<
    string,
    {
      name: string;
      description: string;
      acceptedFormats: string;
      output: string;
    }
  >
> = {
  accounting: {
    "invoice-processor": {
      name: "Invoice Processing Agent",
      description:
        "Este agente procesa facturas desde imagen o PDF, extrae los datos clave y los transforma en información estructurada lista para cargar en el ERP.",
      acceptedFormats: "JPG, PNG, PDF",
      output: "JSON estructurado / CSV / carga ERP",
    },
  },
};

function toCSV(data: ParsedInvoice) {
  const header = ["descripcion", "monto"];
  const rows = (data.items || []).map((r) => [
    String(r.descripcion ?? ""),
    String(r.monto ?? ""),
  ]);

  const csv = [
    ["proveedor", data.proveedor ?? ""],
    ["fecha", data.fecha ?? ""],
    ["total", String(data.total ?? "")],
    ["moneda", data.moneda ?? ""],
    [],
    header,
    ...rows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  return csv;
}

function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatNumber(value: number | string, currency?: string) {
  const num =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : value;

  if (isNaN(num)) return value;

  const isPYG = currency === "PYG";

  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: isPYG ? 0 : 2,
    maximumFractionDigits: isPYG ? 0 : 2,
  }).format(num);
}

function parseLocalizedNumber(value: number | string) {
  if (typeof value === "number") return value;

  const normalized = String(value)
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function validateInvoice(data: ParsedInvoice | null): ValidationResult {
  if (!data) {
    return {
      isValid: false,
      issues: [
        {
          type: "error",
          field: "general",
          message: "No se pudo interpretar la factura procesada.",
        },
      ],
    };
  }

  function parseDateSafe(value?: string) {
    if (!value) return null;

    const trimmed = value.trim();

    // intenta YYYY-MM-DD
    const iso = new Date(trimmed);
    if (!isNaN(iso.getTime())) return iso;

    // intenta DD/MM/YYYY
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  }

  const issues: ValidationIssue[] = [];

  if (!data.proveedor || !String(data.proveedor).trim()) {
    issues.push({
      type: "error",
      field: "proveedor",
      message: "El proveedor está vacío.",
    });
  }

  if (!data.fecha || !String(data.fecha).trim()) {
    issues.push({
      type: "error",
      field: "fecha",
      message: "La fecha está vacía.",
    });
  }

  if (!["PYG", "USD"].includes(String(data.moneda || "").trim().toUpperCase())) {
    issues.push({
      type: "error",
      field: "moneda",
      message: 'La moneda debe ser "PYG" o "USD".',
    });
  }

  const total = parseLocalizedNumber(data.total);
  const itemsTotal = (data.items || []).reduce(
    (sum, item) => sum + parseLocalizedNumber(item.monto),
    0
  );

  const difference = Math.abs(total - itemsTotal);

  if (difference > 0.01) {
    issues.push({
      type: "warning",
      field: "total",
      message: `El total (${formatNumber(total, data.moneda)}) no coincide con la suma de items (${formatNumber(itemsTotal, data.moneda)}).`,
    });
  }

  const iva5 = parseLocalizedNumber(data.iva5);
  const iva10 = parseLocalizedNumber(data.iva10);
  const ivaExento = parseLocalizedNumber(data.ivaExento);
  const ivaTotal = parseLocalizedNumber(data.ivaTotal);

  if (iva5 < 0) {
    issues.push({
      type: "error",
      field: "iva5",
      message: "La liquidación de IVA 5% no puede ser negativa.",
    });
  }

  if (iva10 < 0) {
    issues.push({
      type: "error",
      field: "iva10",
      message: "La liquidación de IVA 10% no puede ser negativa.",
    });
  }

  if (ivaExento < 0) {
    issues.push({
      type: "error",
      field: "ivaExento",
      message: "El monto exento no puede ser negativo.",
    });
  }

  if (ivaTotal < 0) {
    issues.push({
      type: "error",
      field: "ivaTotal",
      message: "La liquidación total del IVA no puede ser negativa.",
    });
  }

  const ivaDifference = Math.abs(ivaTotal - (iva5 + iva10));

  if (ivaDifference > 0.01) {
    issues.push({
      type: "warning",
      field: "ivaTotal",
      message: `El IVA total (${formatNumber(
        ivaTotal,
        data.moneda
      )}) no coincide con la suma de IVA 5% + IVA 10% (${formatNumber(
        iva5 + iva10,
        data.moneda
      )}).`,
    });
  }

  const invalidIvaItems = (data.items || []).filter(
    (item) => !["EXENTO", "5", "10"].includes(String(item.ivaTipo ?? "").trim().toUpperCase())
  );

  if (invalidIvaItems.length > 0) {
    issues.push({
      type: "error",
      field: "items.ivaTipo",
      message: "Uno o más items tienen un tipo de IVA inválido. Solo se admite EXENTO, 5 o 10.",
    });
  }

  const hasOnlyIva10Items =
    (data.items || []).length > 0 &&
    (data.items || []).every(
      (item) => String(item.ivaTipo ?? "").trim() === "10"
    );

  const hasOnlyIva5Items =
    (data.items || []).length > 0 &&
    (data.items || []).every(
      (item) => String(item.ivaTipo ?? "").trim() === "5"
    );
  const hasOnlyExemptItems =
    (data.items || []).length > 0 &&
    (data.items || []).every(
      (item) => String(item.ivaTipo ?? "").trim().toUpperCase() === "EXENTO"
    );

  if (hasOnlyIva10Items && iva5 > 0.01) {
    issues.push({
      type: "warning",
      field: "iva5",
      message: "Todos los items están marcados como IVA 10%, pero la liquidación IVA 5% es mayor a cero.",
    });
  }

  if (hasOnlyIva5Items && iva10 > 0.01) {
    issues.push({
      type: "warning",
      field: "iva10",
      message: "Todos los items están marcados como IVA 5%, pero la liquidación IVA 10% es mayor a cero.",
    });
  }

  if (hasOnlyExemptItems && (iva5 > 0.01 || iva10 > 0.01 || ivaTotal > 0.01)) {
    issues.push({
      type: "warning",
      field: "ivaExento",
      message: "Todos los items están marcados como EXENTO, pero existen importes de IVA 5%, IVA 10% o IVA Total mayores a cero.",
    });
  }

  const fechaFactura = parseDateSafe(data.fecha);
  const fechaVencimiento = parseDateSafe(data.vencimientoTimbrado);

  if (fechaFactura && fechaVencimiento) {
    if (fechaFactura > fechaVencimiento) {
      issues.push({
        type: "error",
        field: "vencimientoTimbrado",
        message: "La fecha de la factura es posterior al vencimiento del timbrado.",
      });
    }
  } else {
    issues.push({
      type: "warning",
      field: "vencimientoTimbrado",
      message: "No se pudo validar correctamente la fecha o el vencimiento del timbrado.",
    });
  }

  return {
    isValid: issues.filter((issue) => issue.type === "error").length === 0,
    issues,
  };
}

export default function AgentDetailPage({ params }: AgentPageProps) {
  const { area, agentId } = use(params);
  const agent = agentsData[area]?.[agentId];

  type FileItem = {
    file: File;
    previewUrl: string;
    status: "pending" | "processing" | "done" | "error";
    result?: string;
    parsed?: ParsedInvoice | null;
    originalParsed?: ParsedInvoice | null;
    isEditing?: boolean;
    isSelected?: boolean;
    isValidated?: boolean;
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const reviewPreviewRef = useRef<HTMLDivElement | null>(null);
  const reviewImageRef = useRef<HTMLImageElement | null>(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [reviewZoom, setReviewZoom] = useState(1);
  const [reviewRotation, setReviewRotation] = useState(0);
  const [lensState, setLensState] = useState<{
    containerX: number;
    containerY: number;
    imageX: number;
    imageY: number;
    baseLeft: number;
    baseTop: number;
    baseWidth: number;
    baseHeight: number;
  } | null>(null);

  const totalFilesLabel = useMemo(() => {
    if (files.length === 0) return "Ningún archivo cargado";
    if (files.length === 1) return "1 archivo cargado";
    return `${files.length} archivos cargados`;
  }, [files]);

  const processedCount = files.filter((item) => item.status === "done").length;
  const totalCount = files.length;

  const validationSummary = files.reduce(
    (acc, item) => {
      if (item.status !== "done" || !item.parsed) return acc;

      const validation = validateInvoice(item.parsed);

      if (validation.issues.length === 0) return acc;

      const hasError = validation.issues.some((i) => i.type === "error");
      const hasWarning = validation.issues.some((i) => i.type === "warning");

      if (hasError) acc.errors += 1;
      if (hasWarning) acc.warnings += 1;

      return acc;
    },
    { errors: 0, warnings: 0 }
  );

  const canExportBatch =
    files.length > 0 &&
    files.every((item) => item.status === "done" && item.parsed) &&
    validationSummary.errors === 0;

  const totalPages = Math.max(1, Math.ceil(files.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFiles = files.slice(startIndex, endIndex);

  const currentReviewItem =
    reviewIndex !== null ? files[reviewIndex] ?? null : null;

  const currentReviewValidation = currentReviewItem?.parsed
    ? validateInvoice(currentReviewItem.parsed)
    : null;

  const validatedCount = files.filter((item) => item.isValidated).length;
  const reviewableCount = files.filter(
    (item) => item.status === "done" && item.parsed
  ).length;

  const previousReviewIndex =
    reviewIndex !== null ? getPreviousReviewableIndex(files, reviewIndex - 1) : null;

  const nextReviewIndex =
    reviewIndex !== null ? getNextReviewableIndex(files, reviewIndex + 1) : null;

  const canExportValidatedBatch =
  reviewableCount > 0 && validatedCount === reviewableCount;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (!agent) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">
          Agente no encontrado
        </h1>
        <p className="text-sm text-white/65">
          Este agente no existe o aún no fue configurado.
        </p>
      </div>
    );
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending" as const,
      isSelected: true,
      isValidated: false,
    }));

    setFiles(selectedFiles);
    setPage(1);
    setIsReviewOpen(false);
    setReviewIndex(null);
  }

  function getNextReviewableIndex(items: FileItem[], startAt = 0) {
    for (let i = startAt; i < items.length; i++) {
      if (items[i].status === "done" && items[i].parsed && !items[i].isValidated) {
        return i;
      }
    }

    return null;
  }

  function openReviewFlow(items: FileItem[]) {
    const nextIndex = getNextReviewableIndex(items, 0);

    if (nextIndex === null) {
      setIsReviewOpen(false);
      setReviewIndex(null);
      return;
    }

    setReviewZoom(1);
    setReviewRotation(0);
    setReviewIndex(nextIndex);
    setIsReviewOpen(true);
  }

  function handleValidateCurrentInvoice() {
    if (reviewIndex === null) return;

    let nextIndexToOpen: number | null = null;

    setFiles((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx !== reviewIndex) return item;
        if (!item.parsed) return item;

        return {
          ...item,
          isValidated: true,
          parsed: {
            ...item.parsed,
            numeroFactura: {
              establecimiento:
                item.parsed.numeroFactura?.establecimiento?.trim() ?? "",
              puntoExpedicion:
                item.parsed.numeroFactura?.puntoExpedicion?.trim() ?? "",
              numero: item.parsed.numeroFactura?.numero?.trim() ?? "",
            },
          },
          originalParsed: item.parsed,
          isEditing: false,
        };
      });

      const nextPendingIndex = getNextReviewableIndex(updated, reviewIndex + 1);
      const lastPendingIndex = getLastPendingReviewIndex(updated);

      if (nextPendingIndex !== null) {
        nextIndexToOpen = nextPendingIndex;
      } else if (lastPendingIndex !== null) {
        nextIndexToOpen = lastPendingIndex;
      }

      return updated;
    });

    setTimeout(() => {
      if (nextIndexToOpen !== null) {
        setReviewIndex(nextIndexToOpen);
        setReviewZoom(1);
        setReviewRotation(0);
        setLensState(null);
        return;
      }

      handleFinishReviewFlow();
    }, 0);
  }

  function getPreviousReviewableIndex(items: FileItem[], startAt: number) {
    for (let i = startAt; i >= 0; i--) {
      if (items[i].status === "done" && items[i].parsed) {
        return i;
      }
    }

    return null;
  }

  function getLastPendingReviewIndex(items: FileItem[]) {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].status === "done" && items[i].parsed && !items[i].isValidated) {
      return i;
    }
  }

  return null;
}

  function handleGoToPreviousReview() {
    if (reviewIndex === null) return;

    const previousIndex = getPreviousReviewableIndex(files, reviewIndex - 1);

    if (previousIndex === null) return;

    setReviewIndex(previousIndex);
    setReviewZoom(1);
    setReviewRotation(0);
    setLensState(null);
  }

  function handleGoToNextReview() {
    if (reviewIndex === null) return;

    const nextIndex = getNextReviewableIndex(files, reviewIndex + 1);

    if (nextIndex === null) return;

    setReviewIndex(nextIndex);
    setReviewZoom(1);
    setReviewRotation(0);
    setLensState(null);
  }      

  function handleMouseMoveLens(e: React.MouseEvent<HTMLDivElement>) {
  const container = reviewPreviewRef.current;
  const img = reviewImageRef.current;

  if (!container || !img) {
      setLensState(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();

    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    const baseWidth = img.offsetWidth;
    const baseHeight = img.offsetHeight;

    const baseLeft = (container.clientWidth - baseWidth) / 2;
    const baseTop = (container.clientHeight - baseHeight) / 2;

    const centerX = baseLeft + baseWidth / 2;
    const centerY = baseTop + baseHeight / 2;

    const dx = (containerX - centerX) / reviewZoom;
    const dy = (containerY - centerY) / reviewZoom;

    const angle = (-reviewRotation * Math.PI) / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    const imageX = rotatedX + baseWidth / 2;
    const imageY = rotatedY + baseHeight / 2;

    const isInsideImage =
      imageX >= 0 &&
      imageX <= baseWidth &&
      imageY >= 0 &&
      imageY <= baseHeight;

    if (!isInsideImage) {
      setLensState(null);
      return;
    }

    setLensState({
      containerX,
      containerY,
      imageX,
      imageY,
      baseLeft,
      baseTop,
      baseWidth,
      baseHeight,
    });
  }

  function handleMouseLeaveLens() {
    setLensState(null);
  }


async function handleProcess() {
  if (files.length === 0) return;

  setLoading(true);

  for (let i = 0; i < files.length; i++) {
    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === i ? { ...f, status: "processing" } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", files[i].file);

      const res = await fetch("/api/agents/accounting/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const parsed = parseResult(data.raw);

      setFiles((prev) =>
        prev.map((f, idx) => {
          if (idx !== i) return f;

          return {
            ...f,
            status: "done",
            result: data.raw,
            parsed,
            originalParsed: parsed,
            isEditing: false,
            isSelected: f.isSelected ?? true,
            isValidated: false,
          };
        })
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "error" } : f
        )
      );
    }
  }

  setLoading(false);

  openReviewFlow(
    files.map((item) => ({
      ...item,
      isValidated: item.isValidated ?? false,
    }))
  );
}

function handleEdit(index: number) {
  setFiles((prev) =>
    prev.map((item, idx) =>
      idx === index ? { ...item, isEditing: true } : item
    )
  );
}

function handleCancelEdit(index: number) {
  setFiles((prev) =>
    prev.map((item, idx) => {
      if (idx !== index) return item;

      return {
        ...item,
        parsed: item.originalParsed ?? item.parsed ?? null,
        isEditing: false,
      };
    })
  );
}

function handleSaveEdit(index: number) {
  setFiles((prev) =>
    prev.map((item, idx) => {
      if (idx !== index) return item;

      return {
        ...item,
        originalParsed: item.parsed ?? item.originalParsed ?? null,
        isEditing: false,
      };
    })
  );
}

function handleCloseReview() {
  setIsReviewOpen(false);
  setReviewIndex(null);
  setReviewZoom(1);
  setReviewRotation(0);
  setLensState(null);
}

function handleFinishReviewFlow() {
  setIsReviewOpen(false);
  setReviewIndex(null);
  setReviewZoom(1);
  setReviewRotation(0);
  setLensState(null);
}

function handleExportJSON(index: number) {
  const item = files[index];
  if (!item?.parsed) return;

  const content = JSON.stringify(item.parsed, null, 2);
  download(`${item.file.name}-parsed.json`, content, "application/json");
}

function handleExportCSV(index: number) {
  const item = files[index];
  if (!item?.parsed) return;

  const csv = toCSV(item.parsed);
  download(`${item.file.name}-parsed.csv`, csv, "text/csv");
}

function handleExportBatch() {
  const selected = files.filter(
    (f) => f.isSelected && f.parsed && f.isValidated
  );

  if (selected.length === 0) return;

  const unvalidatedSelectedCount = files.filter(
    (f) => f.isSelected && f.parsed && !f.isValidated
  ).length;

  if (unvalidatedSelectedCount > 0) return;

  const rows = selected.flatMap((item, fileIndex) => {
    const data = item.parsed!;

    return (data.items || []).map((row) => [
      fileIndex + 1,
      item.file.name,
      data.proveedor,
      data.fecha,
      data.moneda,
      data.total,
      row.descripcion,
      row.monto,
    ]);
  });

  const header = [
    "factura",
    "archivo",
    "proveedor",
    "fecha",
    "moneda",
    "total",
    "descripcion",
    "monto",
  ];

  const csv = [header, ...rows]
    .map((r) => r.join(","))
    .join("\n");

  download("lote_facturas.csv", csv, "text/csv");
}

function handleToggleSelected(index: number) {
  setFiles((prev) =>
    prev.map((item, idx) =>
      idx === index
        ? { ...item, isSelected: !(item.isSelected ?? true) }
        : item
    )
  );
}

function handleParsedFieldChange(
  index: number,
  field: keyof ParsedInvoice,
  value: string
) {
  setFiles((prev) =>
    prev.map((item, idx) => {
      if (idx !== index || !item.parsed) return item;

      return {
        ...item,
        parsed: {
          ...item.parsed,
          [field]: value,
        },
      };
    })
  );
}

function handleInvoiceNumberChange(
  fileIndex: number,
  field: "establecimiento" | "puntoExpedicion" | "numero",
  value: string
) {
  setFiles((prev) =>
    prev.map((item, idx) => {
      if (idx !== fileIndex || !item.parsed) return item;

      return {
        ...item,
        parsed: {
          ...item.parsed,
          numeroFactura: {
            establecimiento:
              item.parsed.numeroFactura?.establecimiento ?? "",
            puntoExpedicion:
              item.parsed.numeroFactura?.puntoExpedicion ?? "",
            numero: item.parsed.numeroFactura?.numero ?? "",
            [field]: value,
          },
        },
      };
    })
  );
}

function handleParsedItemChange(
  fileIndex: number,
  itemIndex: number,
  field: keyof ParsedInvoiceItem,
  value: string
) {
  setFiles((prev) =>
    prev.map((item, idx) => {
      if (idx !== fileIndex || !item.parsed) return item;

      return {
        ...item,
        parsed: {
          ...item.parsed,
          items: item.parsed.items.map((row, rowIndex) =>
            rowIndex === itemIndex
              ? {
                  ...row,
                  [field]: value,
                }
              : row
          ),
        },
      };
    })
  );
}

  function parseResult(raw: string): ParsedInvoice | null {
    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(cleaned) as ParsedInvoice;
    } catch {
      return null;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#C9A24D]">
          Nexa Core
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {agent.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          {agent.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Formatos aceptados
          </p>
          <p className="mt-3 text-sm text-white/80">
            {agent.acceptedFormats}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Output esperado
          </p>
          <p className="mt-3 text-sm text-white/80">{agent.output}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Estado
          </p>
          <p className="mt-3 text-sm text-white/80">
            Preparado para carga manual
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Carga de facturas
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Sube una o más facturas para preparar el procesamiento del agente.
            </p>
          </div>

          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0B1120]/60 px-6 py-10 text-center transition hover:border-[#C9A24D]/35 hover:bg-[#111827]">
            <span className="text-sm font-medium text-white">
              Haz click para seleccionar archivos
            </span>
            <span className="mt-2 text-sm text-white/55">
              Admite imágenes o PDF
            </span>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-[#0B1120]/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Archivos seleccionados
                </h3>
                <p className="mt-1 text-sm text-white/55">{totalFilesLabel}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-white/55">
                  Exporta múltiples facturas en un solo archivo.
                </p>
                <p className="text-sm text-white/55">
                  {validationSummary.errors > 0
                  ? "No puedes exportar mientras existan facturas con errores."
                  : canExportBatch
                  ? "Puedes exportar múltiples facturas seleccionadas en un solo archivo."
                  : "El lote se habilita solo cuando todas las facturas fueron procesadas."}
                </p>
                <button
                  type="button"
                  onClick={handleExportBatch}
                  disabled={!canExportValidatedBatch}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Exportar lote CSV
                </button>
              </div>

              <div className="flex items-center gap-3">
                {reviewableCount > 0 && (
                  <button
                    type="button"
                    onClick={() => openReviewFlow(files)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Revisar lote
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={files.length === 0 || loading}
                  className="rounded-lg border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Procesando..." : "Procesar"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/55">
              <span>
                Procesadas: {reviewableCount}
              </span>
              <span>
                Validadas: {validatedCount}
              </span>
              {!canExportValidatedBatch && reviewableCount > 0 && (
                <span className="text-[#E7C980]">
                  Debes validar todas las facturas antes de exportar el lote.
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Progreso del lote
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/55">
                  <span>
                    {processedCount}/{totalCount} facturas procesadas
                  </span>

                  {validationSummary.errors > 0 && (
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
                      {validationSummary.errors} con errores
                    </span>
                  )}

                  {validationSummary.warnings > 0 && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                      {validationSummary.warnings} con warnings
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/55">Por página</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-white/65">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {files.length > 0 ? (
                paginatedFiles.map((item, pageIndex) => {
                  const index = startIndex + pageIndex;

                  return (
                  <div
                    key={`${item.file.name}-${item.file.size}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.isSelected ?? true}
                          onChange={() => handleToggleSelected(index)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#C9A24D] focus:ring-[#C9A24D]"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {item.file.name}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm">
                        {item.status === "pending" && (
                          <span className="text-white/40">Pendiente</span>
                        )}
                        {item.status === "processing" && (
                          <span className="text-yellow-400">Procesando...</span>
                        )}
                        {item.status === "done" && (
                          <span className="text-emerald-400">✔ Procesado</span>
                        )}
                        {item.isValidated && (
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                            Validado
                          </span>
                        )}
                        {item.status === "error" && (
                          <span className="text-red-400">✖ Error</span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
              ) : (
                <p className="text-sm text-white/45">
                  Aún no hay archivos cargados.
                </p>
              )}
            </div>
            {result && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <h3 className="text-sm font-semibold text-emerald-300">
                    Resultado del procesamiento
                    </h3>

                    <pre className="mt-3 whitespace-pre-wrap text-xs text-white/80">
                    {result.raw}
                    </pre>
                </div>
            )}
          </div>
        </div>
        {isReviewOpen && currentReviewItem && currentReviewItem.parsed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 p-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-8xl overflow-hidden rounded-3xl border border-white/10 bg-[#08101F] shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#C9A24D]">
                  Validación de factura
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {currentReviewItem.file.name}
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  Revisión {reviewIndex !== null ? reviewIndex + 1 : 0} de {files.length}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoToPreviousReview}
                  disabled={previousReviewIndex === null}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={handleGoToNextReview}
                  disabled={nextReviewIndex === null}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>

                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="grid h-[calc(92vh-88px)] gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-[420px] border-b border-white/10 bg-[#030712] lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Vista previa
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Zoom -
                    </button>

                    <span className="min-w-[64px] text-center text-xs text-white/55">
                      {Math.round(reviewZoom * 100)}%
                    </span>

                    <button
                      type="button"
                      onClick={() => setReviewZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Zoom +
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewRotation((prev) => (prev - 90 + 360) % 360)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Rotar -
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewRotation((prev) => (prev + 90) % 360)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Rotar +
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewZoom(1);
                        setReviewRotation(0);
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex h-[72vh] items-center justify-center overflow-auto p-4">
                  {currentReviewItem.file.type === "application/pdf" ? (
                    <iframe
                      src={currentReviewItem.previewUrl}
                      title={currentReviewItem.file.name}
                      className="h-full w-full rounded-xl bg-white"
                    />
                  ) : (
                    <div
                      ref={reviewPreviewRef}
                      className="relative flex h-full w-full items-center justify-center overflow-hidden"
                      onMouseMove={handleMouseMoveLens}
                      onMouseLeave={handleMouseLeaveLens}
                    >
                      <img
                        ref={reviewImageRef}
                        data-review-image="true"
                        src={currentReviewItem.previewUrl}
                        alt={currentReviewItem.file.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-200"
                        style={{
                          transform: `scale(${reviewZoom}) rotate(${reviewRotation}deg)`,
                          transformOrigin: "center center",
                        }}
                      />

                      {lensState && (
                        <div
                          className="pointer-events-none absolute overflow-hidden rounded-full border border-white/20 shadow-xl"
                          style={{
                            width: 400,
                            height: 400,
                            left: lensState.containerX - 85,
                            top: lensState.containerY - 85,
                            backgroundColor: "#020617",
                          }}
                        >
                          <img
                            src={currentReviewItem.previewUrl}
                            alt=""
                            className="absolute max-w-none select-none"
                            style={{
                              left: lensState.baseLeft - (lensState.containerX - 85),
                              top: lensState.baseTop - (lensState.containerY - 85),
                              width: lensState.baseWidth,
                              height: lensState.baseHeight,
                              objectFit: "contain",
                              transform: `scale(${reviewZoom * 3.0}) rotate(${reviewRotation}deg)`,
                              transformOrigin: `${lensState.imageX}px ${lensState.imageY}px`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 h-full flex-col overflow-hidden">

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                  <div className="space-y-6">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h4 className="text-sm font-semibold text-white">
                      Datos principales
                    </h4>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Proveedor
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.proveedor ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(reviewIndex!, "proveedor", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Fecha
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.fecha ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(reviewIndex!, "fecha", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <div className="md:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-[#0B1120] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Número de factura
                          </p>

                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <label className="space-y-2">
                              <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                                Establecimiento
                              </span>
                              <input
                                value={String(
                                  currentReviewItem.parsed.numeroFactura?.establecimiento ?? ""
                                )}
                                onChange={(e) =>
                                  handleInvoiceNumberChange(
                                    reviewIndex!,
                                    "establecimiento",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                                Punto de expedición
                              </span>
                              <input
                                value={String(
                                  currentReviewItem.parsed.numeroFactura?.puntoExpedicion ?? ""
                                )}
                                onChange={(e) =>
                                  handleInvoiceNumberChange(
                                    reviewIndex!,
                                    "puntoExpedicion",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                                Número
                              </span>
                              <input
                                value={String(currentReviewItem.parsed.numeroFactura?.numero ?? "")}
                                onChange={(e) =>
                                  handleInvoiceNumberChange(
                                    reviewIndex!,
                                    "numero",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Total
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.total ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(reviewIndex!, "total", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Moneda
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.moneda ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(reviewIndex!, "moneda", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Timbrado
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.timbrado ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(reviewIndex!, "timbrado", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Vencimiento timbrado
                        </span>
                        <input
                          value={String(currentReviewItem.parsed.vencimientoTimbrado ?? "")}
                          onChange={(e) =>
                            handleParsedFieldChange(
                              reviewIndex!,
                              "vencimientoTimbrado",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h4 className="text-sm font-semibold text-white">
                      Validaciones
                    </h4>

                    <div className="mt-4 space-y-2">
                      {currentReviewValidation?.issues.length ? (
                        currentReviewValidation.issues.map((issue, idx) => (
                          <div
                            key={`${issue.field}-${idx}`}
                            className={`rounded-xl border px-3 py-2 text-sm ${
                              issue.type === "error"
                                ? "border-red-500/20 bg-red-500/10 text-red-200"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-200"
                            }`}
                          >
                            <span className="font-medium">{issue.field}:</span> {issue.message}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                          Sin observaciones. La factura está lista para validar.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h4 className="text-sm font-semibold text-white">
                      Items
                    </h4>

                    <div className="mt-4 space-y-3">
                      {currentReviewItem.parsed.items.map((row, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="grid gap-3 rounded-xl border border-white/10 bg-[#0B1120] p-3 md:grid-cols-[1.5fr_0.7fr_0.5fr]"
                        >
                          <input
                            value={String(row.descripcion ?? "")}
                            onChange={(e) =>
                              handleParsedItemChange(
                                reviewIndex!,
                                itemIndex,
                                "descripcion",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                          />

                          <input
                            value={String(row.monto ?? "")}
                            onChange={(e) =>
                              handleParsedItemChange(
                                reviewIndex!,
                                itemIndex,
                                "monto",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                          />

                          <input
                            value={String(row.ivaTipo ?? "")}
                            onChange={(e) =>
                              handleParsedItemChange(
                                reviewIndex!,
                                itemIndex,
                                "ivaTipo",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 border-t border-white/10 bg-[#08101F] px-6 pt-3 pb-5">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseReview}
                    className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Guardar y salir
                  </button>

                  <button
                    type="button"
                    onClick={handleValidateCurrentInvoice}
                    className="inline-flex h-10 items-center rounded-lg border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-3 text-sm font-medium text-[#E7C980] hover:bg-[#C9A24D]/15"
                  >
                    Validar y continuar
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}