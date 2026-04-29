export type InvoiceHistoryItem = {
  status?: string;
  isValidated?: boolean;
  parsed?: unknown;
};

export type InvoiceHistoryBatch = {
  id: string;
  client: string;
  date: string;
  total: number;
  validated: number;
  items: InvoiceHistoryItem[];
};

type StoredInvoiceFile = {
  status?: string;
  isValidated?: boolean;
  parsed?: unknown;
};

const CLIENT_KEY = "nexa_active_client";
const FILES_KEY = "invoice_files";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveCurrentInvoiceBatchToHistory(
  filesSnapshot?: StoredInvoiceFile[]
): Promise<InvoiceHistoryBatch | null> {
  const files = filesSnapshot ?? readJson<StoredInvoiceFile[]>(FILES_KEY, []);

  if (files.length === 0) {
    return null;
  }

  const client =
    window.localStorage.getItem(CLIENT_KEY) || "Cliente sin identificar";
  const now = new Date();

  const items: InvoiceHistoryItem[] = files.map((file) => ({
    status: file.status,
    isValidated: file.isValidated,
    parsed: file.parsed ?? null,
  }));

  const batch: InvoiceHistoryBatch = {
    id: crypto.randomUUID(),
    client,
    date: now.toLocaleString("es-PY"),
    total: files.length,
    validated: files.filter((file) => file.isValidated).length,
    items,
  };

  try {
    await fetch("/api/history/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
  } catch {
    // silently fail — batch is already exported, history is secondary
  }

  return batch;
}
