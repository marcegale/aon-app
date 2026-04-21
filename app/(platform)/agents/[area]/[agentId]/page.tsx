"use client";

import { use, useEffect, useMemo, useState } from "react";

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
    status: "pending" | "processing" | "done" | "error";
    result?: string;
    parsed?: ParsedInvoice | null;
    originalParsed?: ParsedInvoice | null;
    isEditing?: boolean;
    isSelected?: boolean;
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
      status: "pending" as const,
      isSelected: true,
    }));

        setFiles(selectedFiles);
        setPage(1);
  }

async function handleProcess() {
  if (files.length === 0) return;

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

    setFiles((prev) =>
      prev.map((f, idx) => {
        if (idx !== i) return f;

        const parsed = parseResult(data.raw);

      return {
        ...f,
        status: "done",
        result: data.raw,
        parsed,
        originalParsed: parsed,
        isEditing: false,
        isSelected: f.isSelected ?? true,
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
    (f) => f.isSelected && f.parsed
  );

  if (selected.length === 0) return;

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
                  disabled={!canExportBatch}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  canExportBatch
                    ? "border border-[#C9A24D]/25 bg-[#C9A24D]/10 text-[#E7C980] hover:bg-[#C9A24D]/15"
                    : "border border-red-500/20 bg-red-500/10 text-red-300 cursor-not-allowed opacity-60"
                }`}
                >
                  Exportar lote completo
                </button>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={files.length === 0 || loading}
                className="rounded-lg border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Procesando..." : "Procesar"}
              </button>
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
                        {item.status === "error" && (
                          <span className="text-red-400">✖ Error</span>
                        )}
                      </div>
                    </div>

                    {item.result && (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                          Resultado
                        </p>
                        {(() => {
        const data = item.parsed ?? parseResult(item.result);
        const validation = validateInvoice(data);

        if (!data) {
          return (
            <pre className="mt-2 max-h-56 overflow-auto text-xs text-white/80">
              {item.result}
            </pre>
          );
        }

        return (
          <div className="mt-3 space-y-4 text-sm text-white/80">
            <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                Datos extraídos
              </p>

              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  validation.issues.length === 0
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {validation.issues.length === 0 ? "Válido" : "Revisar"}
              </span>
            </div>

              {!item.isEditing ? (
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                >
                  Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(index)}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15"
                  >
                    Guardar cambios
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCancelEdit(index)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {item.parsed && !item.isEditing && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportJSON(index)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                  >
                    Exportar JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCSV(index)}
                    className="rounded-lg border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-3 py-1.5 text-xs font-medium text-[#E7C980] transition hover:bg-[#C9A24D]/15"
                  >
                    Exportar CSV
                  </button>
                </div>
              )}
            </div>

            {validation.issues.length > 0 && (
              <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                  Validaciones
                </p>

                <div className="space-y-2">
                  {validation.issues.map((issue, issueIndex) => (
                    <div
                      key={`${issue.field}-${issueIndex}`}
                      className="text-sm text-white/85"
                    >
                      <span
                        className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          issue.type === "error"
                            ? "bg-red-500/15 text-red-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {issue.type === "error" ? "Error" : "Warning"}
                      </span>

                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">

              {/* PROVEEDOR */}
              <div>
                <p className="text-xs text-white/40">Proveedor</p>
                {!item.isEditing ? (
                  <p className="font-medium text-white">{data.proveedor}</p>
                ) : (
                  <input
                    value={data.proveedor ?? ""}
                    onChange={(e) =>
                      handleParsedFieldChange(index, "proveedor", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                  />
                )}
              </div>

              {/* FECHA */}
              <div>
                <p className="text-xs text-white/40">Fecha</p>
                {!item.isEditing ? (
                  <p className="font-medium text-white">{data.fecha}</p>
                ) : (
                  <input
                    value={data.fecha ?? ""}
                    onChange={(e) =>
                      handleParsedFieldChange(index, "fecha", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                  />
                )}
              </div>

              {/* NUMERO FACTURA */}
              <div>
                <p className="text-xs text-white/40">N° Factura</p>
                <p className="font-medium text-white">
                  {data.numeroFactura?.establecimiento} -{" "}
                  {data.numeroFactura?.puntoExpedicion} -{" "}
                  {data.numeroFactura?.numero}
                </p>
              </div>

              {/* TIMBRADO */}
              <div>
                <p className="text-xs text-white/40">Timbrado</p>
                <p className="font-medium text-white">{data.timbrado}</p>
              </div>

              {/* VENCIMIENTO TIMBRADO */}
              <div>
                <p className="text-xs text-white/40">Vencimiento Timbrado</p>
                <p className="font-medium text-white">{data.vencimientoTimbrado}</p>
              </div>

              {/* MONEDA */}
              <div>
                <p className="text-xs text-white/40">Moneda</p>
                {!item.isEditing ? (
                  <p className="font-medium text-white">{data.moneda}</p>
                ) : (
                  <input
                    value={data.moneda ?? ""}
                    onChange={(e) =>
                      handleParsedFieldChange(index, "moneda", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                  />
                )}
              </div>

              {/* TOTAL */}
              <div>
                <p className="text-xs text-white/40">Total</p>
                {!item.isEditing ? (
                  <p className="font-medium text-white">
                    {formatNumber(data.total, data.moneda)} {data.moneda}
                  </p>
                ) : (
                  <input
                    value={String(data.total ?? "")}
                    onChange={(e) =>
                      handleParsedFieldChange(index, "total", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                  />
                )}
              </div>

              {/* IVA 5 */}
              <div>
                <p className="text-xs text-white/40">IVA 5%</p>
                <p className="font-medium text-white">
                  {formatNumber(data.iva5, data.moneda)}
                </p>
              </div>

              {/* IVA 10 */}
              <div>
                <p className="text-xs text-white/40">IVA 10%</p>
                <p className="font-medium text-white">
                  {formatNumber(data.iva10, data.moneda)}
                </p>
              </div>

              {/* EXENTO */}
              <div>
                <p className="text-xs text-white/40">Exento</p>
                <p className="font-medium text-white">
                  {formatNumber(data.ivaExento, data.moneda)}
                </p>
              </div>

              {/* IVA TOTAL */}
              <div>
                <p className="text-xs text-white/40">IVA Total</p>
                <p className="font-medium text-white">
                  {formatNumber(data.ivaTotal, data.moneda)}
                </p>
              </div>

            </div>

            {data.actividadesProveedor?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-white/40">Actividades del proveedor</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.actividadesProveedor.map((act, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.items && (
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase text-white/40">
                    <tr>
                      <th className="px-3 py-2">Descripción</th>
                      <th className="px-3 py-2 text-center">IVA</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((row: ParsedInvoiceItem, i: number) => (
                      <tr key={i} className="border-t border-white/10">
                        <td className="px-3 py-2 text-white/80">
                          {!item.isEditing ? (
                            row.descripcion
                          ) : (
                            <input
                              value={row.descripcion ?? ""}
                              onChange={(e) =>
                                handleParsedItemChange(index, i, "descripcion", e.target.value)
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                            />
                          )}
                        </td>

                        <td className="px-3 py-2 text-center text-white">
                          {!item.isEditing ? (
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80">
                              {row.ivaTipo}
                            </span>
                          ) : (
                            <select
                              value={String(row.ivaTipo ?? "10").toUpperCase()}
                              onChange={(e) =>
                                handleParsedItemChange(index, i, "ivaTipo", e.target.value)
                              }
                              className="rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                            >
                              <option value="EXENTO">Exento</option>
                              <option value="5">5%</option>
                              <option value="10">10%</option>
                            </select>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right text-white">
                          {!item.isEditing ? (
                            formatNumber(row.monto, data.moneda)
                          ) : (
                            <input
                              value={String(row.monto ?? "")}
                              onChange={(e) =>
                                handleParsedItemChange(index, i, "monto", e.target.value)
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-3 py-2 text-right text-sm text-white outline-none"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
                      </div>
                    )}
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
      </div>
    </div>
  );
}