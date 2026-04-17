import type { TenantDocument, DocumentCategory, DocumentStatus } from "../types/documents";
import { mockDocuments } from "./document-view.mock";

type DocumentViewAction =
  | {
      type: "open_upload";
      documentId: string;
    }
  | {
      type: "open_document";
      documentId: string;
    }
  | {
      type: "go_settings";
      documentId: string;
    };

type DocumentViewProps = {
  onBack: () => void;
  documents?: TenantDocument[];
  onAction?: (action: DocumentViewAction) => void;
};

function getStatusMeta(status: DocumentStatus) {
  switch (status) {
    case "uploaded":
      return {
        label: "Documento cargado",
        helper: "Este documento ya fue incorporado al assessment.",
        cardClass: "border-emerald-500/30 bg-emerald-500/10",
        badgeClass:
          "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
        buttonLabel: "Ver documento",
        buttonClass:
          "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20",
      };

    case "from_settings":
      return {
        label: "Disponible desde Settings",
        helper:
          "Este documento proviene de información institucional ya registrada.",
        cardClass: "border-amber-500/30 bg-amber-500/10",
        badgeClass:
          "border border-amber-400/30 bg-amber-500/15 text-amber-200",
        buttonLabel: "Ir a Settings",
        buttonClass:
          "border border-amber-400/30 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20",
      };

    case "empty":
    default:
      return {
        label: "Sin documento",
        helper: "Todavía no existe evidencia asociada para esta categoría.",
        cardClass: "border-white/10 bg-white/[0.03]",
        badgeClass: "border border-white/10 bg-white/5 text-white/70",
        buttonLabel: "Cargar documento",
        buttonClass:
          "border border-white/10 bg-white/5 text-white hover:bg-white/10",
      };
  }
}

function getCategoryMeta(category: DocumentCategory) {
  switch (category) {
    case "legal":
      return {
        overline: "Legal",
      };
    case "financial":
      return {
        overline: "Finanzas",
      };
    case "operational":
      return {
        overline: "Operaciones",
      };
    case "commercial":
      return {
        overline: "Comercial",
      };
    default:
      return {
        overline: "Documento",
      };
  }
}

function buildDocumentAction(doc: TenantDocument): DocumentViewAction {
  switch (doc.status) {
    case "uploaded":
      return {
        type: "open_document",
        documentId: doc.id,
      };

    case "from_settings":
      return {
        type: "go_settings",
        documentId: doc.id,
      };

    case "empty":
    default:
      return {
        type: "open_upload",
        documentId: doc.id,
      };
  }
}

export function DocumentView({
  onBack,
  documents = mockDocuments,
  onAction,
}: DocumentViewProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C9A24D]">
              Bloque 13
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Documentación y Evidencia
            </h2>

            <p className="max-w-3xl text-sm leading-6 text-white/70">
              Este bloque no suma puntos. Su función es consolidar evidencia
              documental del tenant para fortalecer trazabilidad, consistencia
              analítica y futuras validaciones del assessment.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Volver al assessment
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => {
          const statusMeta = getStatusMeta(doc.status);
          const categoryMeta = getCategoryMeta(doc.category);

          return (
            <article
              key={doc.id}
              className={`rounded-2xl border p-5 transition ${statusMeta.cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
                    {categoryMeta.overline}
                  </p>

                  <h3 className="text-base font-semibold text-white">
                    {doc.title}
                  </h3>

                  <p className="text-sm leading-6 text-white/70">
                    {doc.description}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${statusMeta.badgeClass}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className="mt-5 space-y-1">
                <p className="text-sm text-white/80">{statusMeta.helper}</p>

                <p className="text-xs text-white/50">
                  Fuente: {doc.source === "settings" ? "Settings" : "Assessment"}
                </p>

                {doc.fileName ? (
                  <p className="text-xs text-white/50">Archivo: {doc.fileName}</p>
                ) : null}

                <p className="text-xs text-white/40">
                  Actualizado: {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    const action = buildDocumentAction(doc);
                    onAction?.(action);
                  }}
                  className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition ${statusMeta.buttonClass}`}
                >
                  {statusMeta.buttonLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}