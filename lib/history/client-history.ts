export type InvoiceHistoryBatch = {
  id: string;
  client: string;
  date: string;
  total: number;
  validated: number;
};

type StoredInvoiceFile = {
  status?: string;
  isValidated?: boolean;
};

const HISTORY_KEY = "invoice_files_history";
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

export function readInvoiceHistory(): InvoiceHistoryBatch[] {
  return readJson<InvoiceHistoryBatch[]>(HISTORY_KEY, []);
}

export function saveCurrentInvoiceBatchToHistory() {
  const files = readJson<StoredInvoiceFile[]>(FILES_KEY, []);

  if (files.length === 0) {
    return null;
  }

  const client = window.localStorage.getItem(CLIENT_KEY) || "Cliente sin identificar";
  const history = readInvoiceHistory();
  const now = new Date();

  const batch: InvoiceHistoryBatch = {
    id: crypto.randomUUID(),
    client,
    date: now.toLocaleString("es-PY"),
    total: files.length,
    validated: files.filter((file) => file.isValidated).length,
  };

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([batch, ...history]));

  return batch;
}
