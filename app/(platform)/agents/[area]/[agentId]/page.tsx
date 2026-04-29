"use client";

import { use, useRef, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase/client";
import { saveCurrentInvoiceBatchToHistory } from "@/lib/history/client-history";

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
  ivaCalculado?: {
    gravada10: number;
    gravada5: number;
    exento: number;
    iva10: number;
    iva5: number;
    ivaTotal: number;
  };
};

function calcularIVACompleto(items: ParsedInvoiceItem[]) {
  let gravada10 = 0;
  let gravada5 = 0;
  let exento = 0;

  items.forEach((item) => {
    const monto = Number(item.monto || 0);

    if (item.ivaTipo === "10") {
      gravada10 += monto;
    } else if (item.ivaTipo === "5") {
      gravada5 += monto;
    } else {
      exento += monto;
    }
  });

  const iva10 = Math.ceil(gravada10 / 11);
  const iva5 = Math.ceil(gravada5 / 21);

  return {
    gravada10,
    gravada5,
    exento,
    iva10,
    iva5,
    ivaTotal: iva10 + iva5,
  };
}

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

function downloadExcel(filename: string, header: string[], rows: any[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");

  XLSX.writeFile(workbook, filename);
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

function formatInvoiceDate(value?: string | null) {
  if (!value) return "";

  const raw = String(value).trim();

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  // YYYY-MM-DD o YYYY/MM/DD
  const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const localMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (!day && localMatch) {
    day = Number(localMatch[1]);
    month = Number(localMatch[2]);
    year = Number(localMatch[3]);

    if (year < 100) year += 2000;
  }

  if (
    !day ||
    !month ||
    !year ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 2025 ||
    year > 2100
  ) {
    return "";
  }

  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");

  return `${dd}/${mm}/${year}`;
}

function isValidInvoiceDate(value?: string | null) {
  if (!value) return false;

  const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  return (
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 2025 &&
    year <= 2100
  );
}

function getItemsTotal(items: any[] = []) {
  return items.reduce((sum, item) => {
    return sum + Number(item.monto ?? item.montoTotal ?? 0);
  }, 0);
}

function calcularResumenIVA(items: any[]) {
  let totalExenta = 0;
  let total5 = 0;
  let total10 = 0;

  items.forEach((item) => {
    const monto = Number(item.monto || 0);
    const tipo = String(item.ivaTipo || "").toUpperCase().trim();

    if (tipo === "5" || tipo === "IVA 5%" || tipo === "5%") {
      total5 += monto;
    } else if (tipo === "10" || tipo === "IVA 10%" || tipo === "10%") {
      total10 += monto;
    } else {
      totalExenta += monto;
    }
  });

  const base5 = (total5 / 21) * 20;
  const liq5 = total5 / 21;

  const base10 = (total10 / 11) * 10;
  const liq10 = total10 / 11;

  return {
    exenta: Math.round(totalExenta),
    iva5: Math.round(base5),
    liq5: Math.round(liq5),
    iva10: Math.round(base10),
    liq10: Math.round(liq10),
  };
}

function validateInvoice(data: any) {
  const issues: {
    type: "error" | "warning";
    field: string;
    message: string;
  }[] = [];

  // =========================
  // FECHA FACTURA
  // =========================
  if (!isValidInvoiceDate(data.fecha)) {
    issues.push({
      type: "error",
      field: "fecha",
      message:
        "La fecha debe tener formato DD/MM/AAAA y estar entre 2025 y 2100.",
    });
  }

  // =========================
  // VENCIMIENTO TIMBRADO
  // =========================
  if (
    data.vencimientoTimbrado &&
    !isValidInvoiceDate(data.vencimientoTimbrado)
  ) {
    issues.push({
      type: "error",
      field: "vencimientoTimbrado",
      message:
        "El vencimiento del timbrado debe tener formato DD/MM/AAAA y estar entre 2025 y 2100.",
    });
  }

  // =========================
  // COHERENCIA ENTRE FECHAS
  // =========================
  if (
    isValidInvoiceDate(data.fecha) &&
    isValidInvoiceDate(data.vencimientoTimbrado)
  ) {
    const [d1, m1, y1] = data.fecha.split("/").map(Number);
    const [d2, m2, y2] = data.vencimientoTimbrado.split("/").map(Number);

    const fechaFactura = new Date(y1, m1 - 1, d1);
    const fechaVencimiento = new Date(y2, m2 - 1, d2);

    if (fechaFactura > fechaVencimiento) {
      issues.push({
        type: "warning",
        field: "vencimientoTimbrado",
        message:
          "La fecha de la factura es posterior al vencimiento del timbrado.",
      });
    }
  }

  // =========================
  // PROVEEDOR
  // =========================
  if (!data.proveedor || String(data.proveedor).trim() === "") {
    issues.push({
      type: "error",
      field: "proveedor",
      message: "El proveedor es obligatorio.",
    });
  }

  // =========================
  // TOTAL
  // =========================
  if (!data.total || Number(data.total) <= 0) {
    issues.push({
      type: "error",
      field: "total",
      message: "El total debe ser mayor a 0.",
    });
  }

  // =========================
  // ITEMS
  // =========================
  if (!data.items || data.items.length === 0) {
    issues.push({
      type: "warning",
      field: "items",
      message: "La factura no tiene items.",
    });
  }

  const itemsTotal = getItemsTotal(data.items || []);
  const invoiceTotal = Number(data.total || 0);

  if (invoiceTotal > 0 && itemsTotal > 0) {
    const difference = Math.abs(invoiceTotal - itemsTotal);

    if (difference > 100) {
      issues.push({
        type: "error",
        field: "items",
        message: `La suma de items (${itemsTotal}) no coincide con el total de la factura (${invoiceTotal}). Diferencia: ${difference}.`,
      });
    }
  }
  // =========================
  // RETORNO
  // =========================
  return {
    isValid: !issues.some((i) => i.type === "error"),
    issues,
  };
}


export default function AgentDetailPage({ params }: AgentPageProps) {
  const [processOnlyAllowed, setProcessOnlyAllowed] = useState(false);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(null);
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
    isDeducible?: boolean;
    facturaId?: string;
    ordenValidacion?: number;
    storagePath?: string;
    archivoTipo?: string;
    archivoSizeBytes?: number;
    localId: string;
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [usageUserId, setUsageUserId] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<{
    used: number;
    monthlyLimit: number;
    remaining: number;
    limitReached: boolean;
  } | null>(null);
  const [showAllValidatedToast, setShowAllValidatedToast] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
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
    const saved = localStorage.getItem("invoice_files");

    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!completionMessage) return;

    const timeout = setTimeout(() => {
      setCompletionMessage(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [completionMessage]);

  useEffect(() => {
    localStorage.setItem("invoice_files", JSON.stringify(files));
  }, [files]);

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

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUsageUserId(user.id);
    }

    loadUser();
  }, []);

  async function refreshUsage(userId: string) {
    const res = await fetch(`/api/usage/check?userId=${userId}`);
    const data = await res.json();

    if (!res.ok) return;

    setUsageInfo({
      used: data.used,
      monthlyLimit: data.monthlyLimit,
      remaining: data.remaining,
      limitReached: data.limitReached,
    });
  }

  useEffect(() => {
    if (!usageUserId) return;
    refreshUsage(usageUserId);
  }, [usageUserId]);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending" as const,
      isSelected: true,
      isValidated: false,
      isDeducible: true,
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPage(1);
  }

  function handleRemoveFile(fileIndex: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== fileIndex));

    if (reviewIndex === fileIndex) {
      setReviewIndex(null);
      setIsReviewOpen(false);
    }

    if (reviewIndex !== null && reviewIndex > fileIndex) {
      setReviewIndex(reviewIndex - 1);
    }
  }

  function handleRemoveCurrentReviewFile() {
    if (reviewIndex === null) return;

    setFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== reviewIndex);

      const nextIndex = getNextReviewableIndex(updated, reviewIndex);
      const fallbackIndex = getNextReviewableIndex(updated, 0);
      const targetIndex = nextIndex ?? fallbackIndex;

      if (targetIndex !== null) {
        setReviewIndex(targetIndex);
        setReviewZoom(1);
        setReviewRotation(0);
        setLensState(null);
        return updated;
      }

      setIsReviewOpen(false);
      setReviewIndex(null);
      setReviewZoom(1);
      setReviewRotation(0);
      setLensState(null);

      showAllValidatedMessage();
      
      setIsReviewOpen(false);
      setReviewIndex(null);

      setTimeout(() => {
        setCompletionMessage("Todas las facturas están validadas");
      }, 50);

      return updated;
    });
  }

  function handleClearFiles() {
    setFiles([]);
    setPage(1);
    setReviewIndex(null);
    setIsReviewOpen(false);
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
      const hasProcessingFiles = items.some((item) => item.status === "processing");

      if (hasProcessingFiles) {
        setIsReviewOpen(true);
        return;
      }

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

    const currentItem = files[reviewIndex];

    if (!usageUserId || !currentItem) return;

    const facturaId = currentItem.facturaId;

    if (!facturaId) return;

    let nextIndexToOpen: number | null = null;

    setFiles((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx !== reviewIndex) return item;
        if (!item.parsed) return item;

        return {
          ...item,
          isValidated: true,
          facturaId: item.facturaId,
          ordenValidacion: Date.now(),
          parsed: {
            ...item.parsed,
            fecha: formatInvoiceDate(item.parsed.fecha),
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

    fetch("/api/usage/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: usageUserId,
        facturaId,
      }),
    }).then(() => {
      refreshUsage(usageUserId);
    });

    setCompletionMessage("Factura validada correctamente");

    if (usageInfo?.remaining === 1) {
      setCompletionMessage("Última factura disponible en tu plan");
    }

    setTimeout(() => {
      if (nextIndexToOpen !== null) {
        setReviewIndex(nextIndexToOpen);
        setReviewZoom(1);
        setReviewRotation(0);
        setLensState(null);
        return;
      }

      handleFinishReviewFlow();
      showAllValidatedMessage();
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


async function handleProcess(processPartial = false) {

  if (files.length === 0) return;

  const selectedToProcessCount = files.filter(
    (item) =>
      item.isSelected &&
      (item.status === "pending" || item.status === "error")
  ).length;

  const remaining = usageInfo?.remaining ?? 0;

  if (!processPartial && usageInfo && selectedToProcessCount > remaining) {
    setProcessOnlyAllowed(true);
    setLimitReachedMessage(
      `Te quedan ${remaining} facturas disponibles. Seleccionaste ${selectedToProcessCount}.`
    );
    return;
  }

  if (usageInfo?.limitReached) {
    alert("Alcanzaste tu límite mensual de facturas. Contactanos para ampliar tu plan.");
    return;
  }

  const pendingToProcessCount = files.filter(
    (item) => item.status === "pending" || item.status === "error"
  ).length;

  if (usageInfo && pendingToProcessCount > usageInfo.remaining) {
    alert(`Te quedan ${usageInfo.remaining} facturas disponibles este mes. Reduce el lote o solicita más capacidad.`);
    return;
  }

  setLoading(true);

  const indexesToProcessBase = files
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        item.isSelected &&
        (item.status === "pending" || item.status === "error")
    )
    .map(({ index }) => index);

  let indexesToProcess = indexesToProcessBase;

  if (processPartial) {
    const remaining = usageInfo?.remaining ?? 0;
    indexesToProcess = indexesToProcessBase.slice(0, remaining);
  }

  const processOneFile = async (fileIndex: number, attempt = 1): Promise<void> => {
    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === fileIndex ? { ...f, status: "processing" } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", files[fileIndex].file);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      if (!usageUserId) {
        console.error("User not ready yet");
        return;
      }

      const res = await fetch("/api/agents/accounting/process", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "x-user-id": usageUserId,
        },
      }); 

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Process failed with status ${res.status}`);
      }

      if (res.status === 403) {
        const errorData = await res.json();

        setLimitReachedMessage(
          errorData.error || "Has alcanzado tu límite mensual"
        );

        return;
      }

      const data = await res.json();
      const parsed = parseResult(data.raw);

      const normalizedParsed = parsed
        ? ({
            ...parsed,
            proveedor:
              (parsed as any).proveedor ||
              (parsed as any).razonSocialEmisor ||
              "",
              fecha: formatInvoiceDate(
              (parsed as any).fecha ||
              (parsed as any).fechaEmision ||
              ""
            ),
            vencimientoTimbrado: formatInvoiceDate(
              (parsed as any).vencimientoTimbrado || ""
            ),
            items: ((parsed as any).items || []).map((item: any) => ({
              ...item,
              monto: item.monto ?? item.montoTotal ?? 0,
            })),
          } as any)
        : null;

      if (normalizedParsed) {
        normalizedParsed.ivaCalculado = calcularIVACompleto(
          normalizedParsed.items
        );
      }

      setFiles((prev) =>
        prev.map((f, idx) => {
          if (idx !== fileIndex) return f;

          return {
            ...f,
            status: "done",
            result: data.raw,
            parsed: normalizedParsed,
            originalParsed: normalizedParsed,
            facturaId: data.facturaId,
            storagePath: data.storagePath,
            archivoTipo: data.fileType,
            archivoSizeBytes: data.fileSize,
            isEditing: false,
            isSelected: f.isSelected ?? true,
            isValidated: false,
            isDeducible: true,
          };
        })
      );
    } catch (error) {
      if (attempt < 2) {
        await processOneFile(fileIndex, attempt + 1);
        return;
      }

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: "error" } : f
        )
      );
    }
  };

  for (let i = 0; i < indexesToProcess.length; i += 2) {
    const batch = indexesToProcess.slice(i, i + 2);
    await Promise.all(batch.map((fileIndex) => processOneFile(fileIndex)));
  }

  setLoading(false);
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

function buildSupabaseInvoiceRows(filesToExport: FileItem[]) {
  return filesToExport
    .filter((item) => item.isSelected && item.isValidated && item.parsed)
    .flatMap((item) => {
      const data = item.parsed!;
      const facturaId = item.facturaId ?? `fac_${crypto.randomUUID()}`;

      return (data.items || []).map((row, itemIndex) => ({
        factura_id: facturaId,
        item_index: itemIndex + 1,

        archivo_nombre: item.file.name,
        orden_validacion: item.ordenValidacion ?? null,

        storage_path: item.storagePath ?? null,
        archivo_tipo: item.archivoTipo ?? null,
        archivo_size_bytes: item.archivoSizeBytes ?? null,

        proveedor_razon_social: data.proveedor ?? "",
        fecha_emision: data.fecha ?? "",
        moneda: data.moneda ?? "",
        total_factura: Number(data.total || 0),

        numero_factura_establecimiento:
          data.numeroFactura?.establecimiento ?? "",
        numero_factura_punto_expedicion:
          data.numeroFactura?.puntoExpedicion ?? "",
        numero_factura_numero:
          data.numeroFactura?.numero ?? "",

        timbrado: data.timbrado ?? "",
        vencimiento_timbrado: data.vencimientoTimbrado ?? "",

        item_descripcion: row.descripcion ?? "",
        item_monto_total: Number(row.monto || 0),
        item_iva_tipo: row.ivaTipo ?? "EXENTO",

        deducible: item.isDeducible ?? true,
        validado: item.isValidated ?? false,

        raw_json: item.result ?? null,
      }));
    });
}

function handleFinishReviewFlow() {
  const supabaseRows = buildSupabaseInvoiceRows(files);

  fetch("/api/invoice-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows: supabaseRows }),
  });

  setIsReviewOpen(false);
  setReviewIndex(null);
  setReviewZoom(1);
  setReviewRotation(0);
  setLensState(null);
}

function showAllValidatedMessage() {
  setShowAllValidatedToast(true);

  setTimeout(() => {
    setShowAllValidatedToast(false);
  }, 3000);
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

async function handleExportBatch() {
  const selected = files.filter(
    (f) => f.isSelected && f.parsed && f.isValidated
  );

  if (selected.length === 0) return;

  const unvalidatedSelectedCount = files.filter(
    (f) => f.isSelected && f.parsed && !f.isValidated
  ).length;

  if (unvalidatedSelectedCount > 0) return;

  const supabaseRows = buildSupabaseInvoiceRows(files);
  console.log("SUPABASE ROWS READY:", supabaseRows);

  const saveResponse = await fetch("/api/agents/accounting/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows: supabaseRows }),
  });

  const saveResult = await saveResponse.json();
  console.log("SAVE STATUS:", saveResponse.status);
  console.log("SAVE RESULT:", saveResult);

  if (!saveResponse.ok) return;

  const header = [
    "ESTABLECIMIENTO",
    "SUCURSAL",
    "NUMERO DE FACTURA",
    "TIMBRADO",
    "PROVEEDOR",
    "FECHA",
    "MONEDA",
    "EXENTA",
    "IVA 5%",
    "LIQUIDACION IVA 5%",
    "IVA 10%",
    "LIQUIDACION IVA 10%",
    "DEDUCIBLE / NO DEDUCIBLE",
  ];

  const rows = selected.map((item) => {
    const data = item.parsed!;
    const resumenIVA = calcularResumenIVA(data.items || []);

    return [
      data.numeroFactura?.establecimiento ?? "",
      data.numeroFactura?.puntoExpedicion ?? "",
      data.numeroFactura?.numero ?? "",
      data.timbrado ?? "",
      data.proveedor ?? "",
      data.fecha ?? "",
      data.moneda ?? "",
      resumenIVA.exenta,
      resumenIVA.iva5,
      resumenIVA.liq5,
      resumenIVA.iva10,
      resumenIVA.liq10,
      item.isDeducible ? "DEDUCIBLE" : "NO DEDUCIBLE",
    ];
  });

  downloadExcel("lote_facturas.xlsx", header, rows);

  setFiles((prev) => prev.filter((f) => !f.isSelected));
  setPage(1);
  setReviewIndex(null);
  setIsReviewOpen(false);

  saveCurrentInvoiceBatchToHistory();
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
          [field]: typeof value === "string" ? value.toUpperCase() : value,
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

      const updatedItems = item.parsed.items.map((row, rowIndex) =>
        rowIndex === itemIndex
          ? {
              ...row,
              [field]:
                field === "monto"
                  ? Number(value) || 0
                  : String(value).toUpperCase(),
            }
          : row
      );

      const updatedParsed = {
        ...item.parsed,
        items: updatedItems,
      };

      // 🔥 recalcular IVA en tiempo real
      updatedParsed.ivaCalculado = calcularIVACompleto(updatedItems);

      return {
        ...item,
        parsed: updatedParsed,
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
                  Exportar lote a Excel
                </button>
              </div>

              <div className="flex items-center gap-3">
                {files.some((f) => f.status === "done" && f.parsed) && (
                  <button
                    type="button"
                    onClick={() => openReviewFlow(files)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Validar lote
                  </button>
                )}
                <div className="text-xs text-white/50">
                  {usageInfo
                    ? `Te quedan ${usageInfo.remaining} de ${usageInfo.monthlyLimit} facturas este mes`
                    : "Cargando uso..."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (usageInfo?.limitReached) {
                      setLimitReachedMessage("Límite alcanzado");
                      return;
                    }

                    handleProcess();
                  }}
                  disabled={files.length === 0 || loading}
                  className={`rounded-lg border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] disabled:cursor-not-allowed disabled:opacity-40 ${
                    usageInfo?.limitReached ? "opacity-50" : ""
                  }`}
                >
                  {loading ? "Procesando..." : "Procesar"}
                </button>
                {limitReachedMessage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0B1120] p-6 text-center">
                      
                      <p className="text-xs uppercase tracking-[0.28em] text-red-300">
                        Límite alcanzado
                      </p>

                      <h2 className="mt-3 text-xl font-semibold text-white">
                        Has llegado al límite de tu plan
                      </h2>

                      <p className="mt-3 text-sm text-white/60">
                        Para continuar procesando facturas, necesitas ampliar tu capacidad.
                      </p>

                      <div className="mt-6 space-y-3">
                        {processOnlyAllowed && (
                          <button
                            onClick={() => {
                              setLimitReachedMessage(null);
                              handleProcess(true); // 👈 modo parcial
                            }}
                            className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300"
                          >
                            Procesar solo lo permitido
                          </button>
                        )}

                        <button
                          onClick={() => setLimitReachedMessage(null)}
                          className="w-full text-xs text-white/40"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
            {usageInfo && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/70">
                <p>
                  Facturas usadas: <span className="text-white">{usageInfo.used}</span> /{" "}
                  <span className="text-white">{usageInfo.monthlyLimit}</span>
                </p>
                <p>
                  Disponibles:{" "}
                  <span className="text-emerald-300">{usageInfo.remaining}</span>
                </p>
              </div>
            )}

            {usageInfo?.limitReached && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                Alcanzaste tu límite mensual. Contactanos para ampliar tu plan.
              </div>
            )}
            {usageInfo?.limitReached && (
              <a
                href="https://wa.me/595972224294?text=Hola%2C%20necesito%20ampliar%20mi%20plan%20de%20facturas%20en%20Nexa%20Core"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-flex rounded-xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] hover:bg-[#C9A24D]/15"
              >
                Solicitar más capacidad
              </a>
            )}

            <div className="mt-4 space-y-3">
              {files.length > 0 ? (
                paginatedFiles.map((item, pageIndex) => {
                  const index = startIndex + pageIndex;

                  return (
                  <div
                    key={item.localId}
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
                      <div className="flex shrink-0 items-center gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Eliminar
                        </button>
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
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d/]/g, "").slice(0, 10);
                            handleParsedFieldChange(reviewIndex!, "fecha", value);
                          }}
                          placeholder="DD/MM/AAAA"
                          maxLength={10}
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                          Deducible
                        </span>
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
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, "").slice(0, 15);
                            handleParsedFieldChange(reviewIndex!, "timbrado", value);
                          }}
                          placeholder="NÚMERO DE TIMBRADO"
                          maxLength={15}
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

                          <select
                            value={row.ivaTipo ?? ""}
                            onChange={(e) =>
                              handleParsedItemChange(
                                reviewIndex!,
                                itemIndex,
                                "ivaTipo",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none"
                          >
                            <option value="10">IVA 10%</option>
                            <option value="5">IVA 5%</option>
                            <option value="EXENTO">Exenta</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setFiles((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== reviewIndex || !item.parsed) return item;

                                  const updatedItems = item.parsed.items.filter(
                                    (_, idx) => idx !== itemIndex
                                  );

                                  return {
                                    ...item,
                                    parsed: {
                                      ...item.parsed,
                                      items: updatedItems,
                                      ivaCalculado: calcularIVACompleto(updatedItems),
                                    },
                                  };
                                })
                              );
                            }}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) =>
                            prev.map((item, idx) => {
                              if (idx !== reviewIndex || !item.parsed) return item;

                              const updatedItems = [
                                ...(item.parsed.items || []),
                                {
                                  descripcion: "",
                                  monto: 0,
                                  ivaTipo: "EXENTO",
                                },
                              ];

                              return {
                                ...item,
                                parsed: {
                                  ...item.parsed,
                                  items: updatedItems,
                                  ivaCalculado: calcularIVACompleto(updatedItems),
                                },
                              };
                            })
                          );
                        }}
                        className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
                      >
                        Añadir item
                      </button>
                      {currentReviewItem.parsed?.ivaCalculado && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B1120] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Resumen IVA
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white">
                            <p>Gravada 10%: {currentReviewItem.parsed.ivaCalculado.gravada10}</p>
                            <p>IVA 10%: {currentReviewItem.parsed.ivaCalculado.iva10}</p>

                            <p>Gravada 5%: {currentReviewItem.parsed.ivaCalculado.gravada5}</p>
                            <p>IVA 5%: {currentReviewItem.parsed.ivaCalculado.iva5}</p>

                            <p>Exento: {currentReviewItem.parsed.ivaCalculado.exento}</p>

                            <p className="col-span-2 font-semibold">
                              IVA Total: {currentReviewItem.parsed.ivaCalculado.ivaTotal}
                            </p>
                          </div>
                        </div>
                      )}
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
                    onClick={handleRemoveCurrentReviewFile}
                    className="h-10 rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-300 hover:bg-red-500/20"
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.map((f, idx) =>
                          idx === reviewIndex
                            ? { ...f, isDeducible: !f.isDeducible }
                            : f
                        )
                      )
                    }
                    className={`h-10 px-4 rounded-lg text-sm font-medium border flex items-center justify-center ${
                      currentReviewItem.isDeducible !== false
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {currentReviewItem.isDeducible !== false
                      ? "Deducible"
                      : "No deducible"}
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
      {showAllValidatedToast && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="rounded-xl border border-emerald-500/20 bg-[#052e1a] px-4 py-3 text-sm font-medium text-emerald-200 shadow-xl">
            Todas las facturas están validadas
          </div>
        </div>
      )}
    </div>
  );
}