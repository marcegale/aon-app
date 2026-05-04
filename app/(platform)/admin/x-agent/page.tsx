"use client";

import { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { GraphicPreview } from "./previews";
import type { OverlayData } from "./previews";

type MatchEntry = { home: string; away: string; score: string };

type GeneratedData = {
  content: string;
  content_type: string;
  visual_type: string;
  tone: string;
  overlay: {
    headline: string;
    subheadline: string;
    competition: string | null;
    status: string | null;
    matches: { home: string; away: string; score: string }[];
    quote: string | null;
    person: string | null;
    teams: string[];
  };
};

type XPost = {
  id: string;
  content: string;
  image_url: string | null;
  status: "draft" | "pending_approval" | "scheduled" | "published" | "failed" | "rejected";
  created_at: string;
  error_message: string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "text-white/50 border-white/10 bg-white/[0.04]" },
  pending_approval: { label: "Pendiente", className: "text-amber-300 border-amber-500/20 bg-amber-500/10" },
  scheduled: { label: "Programado", className: "text-sky-300 border-sky-500/20 bg-sky-500/10" },
  published: { label: "Publicado", className: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" },
  failed: { label: "Error", className: "text-red-300 border-red-500/20 bg-red-500/10" },
  rejected: { label: "Rechazado", className: "text-white/30 border-white/10 bg-white/[0.02]" },
};

const STATUS_PRESETS = ["EN VIVO", "ENTRETIEMPO", "FINAL", "SUSPENDIDO"];

const VISUAL_TYPES = [
  { value: "scoreboard", label: "Marcador" },
  { value: "quote_card", label: "Cita" },
  { value: "player_news", label: "Jugador" },
  { value: "stat_card", label: "Estadística" },
  { value: "breaking_card", label: "Urgente" },
  { value: "collage", label: "Collage" },
  { value: "background_only", label: "Fondo" },
] as const;

const EMPTY_MATCH: MatchEntry = { home: "", away: "", score: "" };
const PAGE_SIZE = 20;

export default function XAgentPage() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<XPost[]>([]);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [alternatives, setAlternatives] = useState<(GeneratedData & { label: string })[] | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [overlayApplied, setOverlayApplied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const composeFileRef = useRef<HTMLInputElement>(null);

  const [competition, setCompetition] = useState("");
  const [matchStatus, setMatchStatus] = useState("");
  const [matches, setMatches] = useState<MatchEntry[]>([{ ...EMPTY_MATCH }]);

  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);

  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [togglingEmails, setTogglingEmails] = useState(false);

  const [visualType, setVisualType] = useState("scoreboard");
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [quote, setQuote] = useState("");
  const [person, setPerson] = useState("");
  const [teamsInput, setTeamsInput] = useState("");
  const [credits, setCredits] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "rejected" | "pending_approval" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPosts();
    loadSettings();
  }, []);

  async function loadPosts() {
    const res = await fetch("/api/admin/x/posts");
    if (!res.ok) return;
    const data = await res.json();
    setPosts(data.posts ?? []);
  }

  async function loadSettings() {
    const res = await fetch("/api/admin/x/settings");
    if (!res.ok) return;
    const data = await res.json();
    setImagePrompt(data.image_prompt ?? "");
    setEmailsEnabled(data.emails_enabled ?? true);
  }

  async function handleToggleEmails() {
    setTogglingEmails(true);
    const next = !emailsEnabled;
    try {
      const res = await fetch("/api/admin/x/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails_enabled: next }),
      });
      if (res.ok) setEmailsEnabled(next);
    } finally {
      setTogglingEmails(false);
    }
  }

  async function handleSavePrompt() {
    setSavingPrompt(true);
    try {
      await fetch("/api/admin/x/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_prompt: imagePrompt }),
      });
      setPromptSaved(true);
      setTimeout(() => setPromptSaved(false), 2000);
    } finally {
      setSavingPrompt(false);
    }
  }

  async function uploadImageFile(file: File, onSuccess: (url: string) => void) {
    setUploadingImage(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const res = await fetch("/api/admin/x/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.image_url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploadingImage(false);
    }
  }

  function applyAlternative(option: GeneratedData & { label?: string }) {
    setGeneratedData(option);
    setContent(option.content);
    setIsAiGenerated(true);
    setImageUrl(null);
    setOverlayApplied(false);
    setVisualType(option.visual_type ?? "scoreboard");
    setHeadline(option.overlay?.headline ?? "");
    setSubheadline(option.overlay?.subheadline ?? "");
    setQuote(option.overlay?.quote ?? "");
    setPerson(option.overlay?.person ?? "");
    setTeamsInput((option.overlay?.teams ?? []).join(", "));
    if (option.overlay?.competition) setCompetition(option.overlay.competition);
    if (option.overlay?.status) setMatchStatus(option.overlay.status);
    if (option.overlay?.matches?.length) {
      setMatches(option.overlay.matches.map((m) => ({ home: m.home ?? "", away: m.away ?? "", score: m.score ?? "" })));
    } else {
      setMatches([{ ...EMPTY_MATCH }]);
    }
    setAlternatives(null);
  }

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setError(null);
    setAlternatives(null);
    try {
      const res = await fetch("/api/admin/x/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      const opts = data.options as (GeneratedData & { label: string })[] | undefined;
      if (!opts?.length) throw new Error("No content returned");
      if (opts.length === 1) {
        applyAlternative(opts[0]);
      } else {
        setAlternatives(opts);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateImage() {
    if (!content.trim()) return;
    setGeneratingImage(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/x/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.image_url);
      setOverlayApplied(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar imagen");
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleExportImage() {
    if (!previewRef.current) return;
    setExportingImage(true);
    setError(null);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const blobRes = await fetch(dataUrl);
      const blob = await blobRes.blob();
      const form = new FormData();
      form.append("file", blob, "graphic.png");
      const res = await fetch("/api/admin/x/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.image_url);
      setOverlayApplied(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al exportar imagen");
    } finally {
      setExportingImage(false);
    }
  }

  function updateMatch(i: number, field: keyof MatchEntry, val: string) {
    setMatches((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));
  }

  function addMatch() {
    setMatches((prev) => [...prev, { ...EMPTY_MATCH }]);
  }

  function removeMatch(i: number) {
    setMatches((prev) => prev.filter((_, idx) => idx !== i));
  }

  function clearCompose() {
    setContent("");
    setTopic("");
    setIsAiGenerated(false);
    setGeneratedData(null);
    setAlternatives(null);
    setImageUrl(null);
    setCompetition("");
    setMatchStatus("");
    setMatches([{ ...EMPTY_MATCH }]);
    setVisualType("scoreboard");
    setHeadline("");
    setSubheadline("");
    setQuote("");
    setPerson("");
    setTeamsInput("");
    setCredits("");
    setOverlayApplied(false);
  }

  function startEdit(post: XPost) {
    setEditingId(post.id);
    setEditContent(post.content);
    setEditImageUrl(post.image_url);
  }

  async function handleSaveEdit(id: string) {
    if (!editContent.trim() || editContent.length > 280) return;
    setActioning(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/x/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, image_url: editImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingId(null);
      await loadPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setActioning(null);
    }
  }

  function hasVisibleOverlay(): boolean {
    switch (visualType) {
      case "scoreboard": return !!(competition || matchStatus || matches.some((m) => m.home || m.away || m.score));
      case "quote_card": return !!(quote || person);
      case "player_news":
      case "collage": return !!(headline || subheadline || teamsInput);
      case "stat_card": return !!(headline || subheadline || person);
      case "breaking_card": return !!(headline || subheadline);
      case "background_only": return !!headline;
      default: return false;
    }
  }

  async function handleSave() {
    if (!content.trim()) return;
    setError(null);
    if (imageUrl && !overlayApplied && hasVisibleOverlay()) {
      setError("Debes aplicar la gráfica antes de guardar.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/x/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          image_url: imageUrl ?? null,
          status: isAiGenerated ? "pending_approval" : "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCompose();
      await loadPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: string) {
    setActioning(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/x/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al publicar");
    } finally {
      setActioning(null);
    }
  }

  async function handleReject(id: string) {
    setActioning(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/x/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al rechazar");
    } finally {
      setActioning(null);
    }
  }

  const charCount = content.length;
  const overLimit = charCount > 280;
  const filteredPosts = statusFilter === "all" ? posts : posts.filter((p) => p.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C96F3B]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">X Agent</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Redactá, generá con IA y publicá posts en tu cuenta de X.
        </p>
      </div>

      {/* Compose */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0F2422] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <input
            type="text"
            placeholder="Tema (para generar con IA)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="flex-1 rounded-xl border border-white/10 bg-[#0F2422] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C96F3B]/40"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="shrink-0 rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-2.5 text-sm font-medium text-[#F4EBD0] hover:bg-[#C96F3B]/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? "Generando..." : "Generar con IA"}
          </button>
        </div>

        {/* Alternatives picker */}
        {alternatives && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
              Elegí una opción editorial
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {alternatives.map((opt, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#C96F3B]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C96F3B]/90">
                      {opt.label}
                    </span>
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                      {opt.tone}
                    </span>
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-white/75">{opt.content}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-white/25">{opt.content_type} · {opt.visual_type}</span>
                    <button
                      type="button"
                      onClick={() => applyAlternative(opt)}
                      className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-1 text-[11px] font-semibold text-[#F4EBD0] hover:bg-[#C96F3B]/20"
                    >
                      Usar esta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsAiGenerated(false); }}
            placeholder="Escribí tu post..."
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C96F3B]/40"
          />
          <span className={`absolute bottom-3 right-4 text-xs ${overLimit ? "text-red-400" : "text-white/30"}`}>
            {charCount}/280
          </span>
        </div>

        {/* Editorial classification — shown after AI generation */}
        {generatedData && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">IA</span>
            <span className="rounded bg-[#C96F3B]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C96F3B]/90">
              {generatedData.content_type}
            </span>
            <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/55">
              {generatedData.visual_type}
            </span>
            <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              {generatedData.tone}
            </span>
          </div>
        )}

        {/* Graphic overlay editor */}
        <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">Gráfica</p>

          <div className="flex flex-wrap gap-1.5">
            {VISUAL_TYPES.map((vt) => (
              <button
                key={vt.value}
                type="button"
                onClick={() => setVisualType(vt.value)}
                className={`rounded-lg border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                  visualType === vt.value
                    ? "border-[#C96F3B]/35 bg-[#C96F3B]/15 text-[#C96F3B]"
                    : "border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/65"
                }`}
              >
                {vt.label}
              </button>
            ))}
          </div>

          {/* Scoreboard: competition + status + matches */}
          {visualType === "scoreboard" && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Competición (ej: LA LIGA)"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Estado (ej: EN VIVO)"
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setMatchStatus(p)}
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition ${
                          matchStatus === p
                            ? "bg-white/15 text-white"
                            : "bg-white/[0.05] text-white/40 hover:text-white/70"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_5rem_1fr_auto] items-center gap-2 sm:grid-cols-[1fr_6rem_1fr_auto]">
                    <input
                      type="text"
                      placeholder="Local"
                      value={m.home}
                      onChange={(e) => updateMatch(i, "home", e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                    />
                    <input
                      type="text"
                      placeholder="0 - 0"
                      value={m.score}
                      onChange={(e) => updateMatch(i, "score", e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-center text-sm font-bold tabular-nums text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                    />
                    <input
                      type="text"
                      placeholder="Visitante"
                      value={m.away}
                      onChange={(e) => updateMatch(i, "away", e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                    />
                    {matches.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeMatch(i)}
                        className="rounded-lg border border-white/10 px-2 py-2 text-xs text-white/30 hover:text-red-400"
                      >
                        ✕
                      </button>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMatch}
                  className="text-xs text-white/30 hover:text-white/60"
                >
                  + Agregar partido
                </button>
              </div>
            </>
          )}

          {/* Quote card: quote + person + competition */}
          {visualType === "quote_card" && (
            <div className="space-y-2">
              <textarea
                placeholder="Cita textual..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Persona (ej: Messi)"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
                <input
                  type="text"
                  placeholder="Competición (opcional)"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
              </div>
            </div>
          )}

          {/* Player news / collage: headline + subheadline + teams + competition */}
          {(visualType === "player_news" || visualType === "collage") && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Título principal"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <input
                type="text"
                placeholder="Subtítulo"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Equipos (separados por coma)"
                  value={teamsInput}
                  onChange={(e) => setTeamsInput(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
                <input
                  type="text"
                  placeholder="Competición (opcional)"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
              </div>
            </div>
          )}

          {/* Stat card: headline + subheadline + person + competition */}
          {visualType === "stat_card" && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Estadística o título"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <input
                type="text"
                placeholder="Contexto adicional"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Persona o equipo"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
                <input
                  type="text"
                  placeholder="Competición (opcional)"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
              </div>
            </div>
          )}

          {/* Breaking card: headline + subheadline + competition */}
          {visualType === "breaking_card" && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Noticia de último momento"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Subtítulo"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
                <input
                  type="text"
                  placeholder="Competición (opcional)"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value.toUpperCase())}
                  className="rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
                />
              </div>
            </div>
          )}

          {/* Background only: headline */}
          {visualType === "background_only" && (
            <input
              type="text"
              placeholder="Texto sobre la imagen (opcional)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
            />
          )}

          {/* Credits — universal, only shown when there is an image */}
          {imageUrl && (
            <input
              type="text"
              placeholder="Crédito fotográfico (ej: Reuters / Getty Images)"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0F2422] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
            />
          )}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => composeFileRef.current?.click()}
              disabled={uploadingImage}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploadingImage ? "Subiendo..." : "Subir imagen"}
            </button>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage || !content.trim()}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {generatingImage ? "Generando..." : "Generar fondo IA"}
            </button>
            {imageUrl && (
              <>
                <button
                  type="button"
                  onClick={handleExportImage}
                  disabled={exportingImage}
                  className="rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-2 text-sm font-medium text-[#F4EBD0] hover:bg-[#C96F3B]/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {exportingImage ? "Aplicando..." : "Aplicar gráfica a imagen"}
                </button>
                <button
                  type="button"
                  onClick={() => { setImageUrl(null); setOverlayApplied(false); }}
                  className="text-xs text-white/30 hover:text-white/60"
                >
                  Quitar imagen
                </button>
              </>
            )}
          </div>
          <input
            ref={composeFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImageFile(f, (url) => { setImageUrl(url); setOverlayApplied(false); });
              e.target.value = "";
            }}
          />
        </div>

        {imageUrl && (
          <div className="flex justify-center">
            <div className="w-full max-w-[min(520px,100%)]">
              <div ref={previewRef}>
                <GraphicPreview
                  imageUrl={imageUrl}
                  visualType={visualType}
                  overlay={{
                    headline,
                    subheadline,
                    competition: competition || null,
                    status: matchStatus || null,
                    matches: matches.filter((m) => m.home || m.away || m.score),
                    quote: quote || null,
                    person: person || null,
                    teams: teamsInput.split(",").map((t) => t.trim()).filter(Boolean),
                    credits: credits || null,
                  } satisfies OverlayData}
                />
              </div>
            </div>
          </div>
        )}

        {isAiGenerated && content.trim() && (
          <p className="text-xs text-amber-400/70">Generado con IA — pendiente de aprobación.</p>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim() || overLimit}
            className="rounded-xl bg-[#C96F3B] px-5 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-[#B85E30] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Guardando..." : isAiGenerated ? "Guardar para aprobación" : "Guardar como borrador"}
          </button>
        </div>
      </div>

      {/* Email toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F2422] px-6 py-4">
        <div>
          <p className="text-sm font-medium text-white/80">Emails de aprobación</p>
          <p className="mt-0.5 text-xs text-white/35">
            {emailsEnabled
              ? "El worker notifica por email al generar posts."
              : "Los posts se generan pero no se envían emails."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleEmails}
          disabled={togglingEmails}
          aria-pressed={emailsEnabled}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
            emailsEnabled
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
              : "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              emailsEnabled ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          {togglingEmails ? "..." : emailsEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Image prompt settings */}
      <div className="rounded-2xl border border-white/10 bg-[#0F2422]">
        <button
          type="button"
          onClick={() => setImagePromptOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-sm text-white/50 hover:text-white/80"
        >
          <span>Editar prompt generador de imágenes</span>
          <span className="text-xs">{imagePromptOpen ? "▲" : "▼"}</span>
        </button>
        {imagePromptOpen && (
          <div className="space-y-3 border-t border-white/10 px-6 pb-6 pt-4">
            <p className="text-xs text-white/40">
              Estilo visual base para el fondo. Se combina con el contexto del post para elegir el escenario deportivo.
            </p>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={3}
              placeholder="Ej: Cinematic wide-angle sports venue photograph, dramatic lighting, broadcast quality."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C96F3B]/40"
            />
            <div className="flex items-center justify-end gap-3">
              {promptSaved && <span className="text-xs text-emerald-400">Guardado</span>}
              <button
                type="button"
                onClick={handleSavePrompt}
                disabled={savingPrompt}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.07] disabled:opacity-40"
              >
                {savingPrompt ? "Guardando..." : "Guardar prompt"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shared edit file input */}
      <input
        ref={editFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadImageFile(f, setEditImageUrl);
          e.target.value = "";
        }}
      />

      {/* Post list — compact, filterable, paginated */}
      <div className="space-y-3">
        {/* Header + filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/30">
            Historial
            {posts.length > 0 && (
              <span className="ml-2 font-normal normal-case text-white/20">{filteredPosts.length} posts</span>
            )}
          </p>
          <div className="flex flex-wrap gap-1">
            {(["all", "pending_approval", "published", "rejected", "draft"] as const).map((f) => {
              const label = f === "all" ? "Todos" : (STATUS_LABELS[f]?.label ?? f);
              const count = f === "all" ? posts.length : posts.filter((p) => p.status === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    statusFilter === f ? "bg-white/15 text-white" : "text-white/35 hover:text-white/65"
                  }`}
                >
                  {label}
                  {count > 0 && <span className="ml-1 opacity-50">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {paginatedPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F2422] p-8 text-center text-sm text-white/40">
            {posts.length === 0 ? "No hay posts aún." : "No hay posts con este filtro."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F2422]">
            {paginatedPosts.map((post, idx) => {
              const badge = STATUS_LABELS[post.status] ?? STATUS_LABELS.draft;
              const isExpanded = expandedId === post.id;
              const isEditing = editingId === post.id;

              return (
                <div key={post.id} className={idx > 0 ? "border-t border-white/[0.06]" : ""}>
                  {/* Compact row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.025]"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      )}
                    </div>

                    {/* Content + date */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-snug text-white/85">{post.content}</p>
                      <p className="mt-1 text-[11px] text-white/30">
                        {new Date(post.created_at).toLocaleString("es-PY", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>

                    {/* Status + chevron */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[9px] text-white/20 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] bg-white/[0.015] px-4 pb-4 pt-3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={4}
                              className="w-full resize-none rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C96F3B]/40"
                            />
                            <span className={`absolute bottom-3 right-4 text-xs ${editContent.length > 280 ? "text-red-400" : "text-white/30"}`}>
                              {editContent.length}/280
                            </span>
                          </div>
                          {editImageUrl && (
                            <img src={editImageUrl} alt="" className="max-h-40 w-full rounded-xl object-cover" />
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => editFileRef.current?.click()}
                              disabled={uploadingImage}
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.07] disabled:opacity-40"
                            >
                              {uploadingImage ? "Subiendo..." : editImageUrl ? "Cambiar imagen" : "Subir imagen"}
                            </button>
                            {editImageUrl && (
                              <button
                                type="button"
                                onClick={() => setEditImageUrl(null)}
                                className="text-xs text-white/30 hover:text-white/60"
                              >
                                Quitar imagen
                              </button>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={actioning === post.id || !editContent.trim() || editContent.length > 280}
                              className="rounded-lg bg-[#C96F3B] px-3 py-1.5 text-xs font-semibold text-[#0B0D12] hover:bg-[#B85E30] disabled:opacity-40"
                            >
                              {actioning === post.id ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {post.image_url && (
                            <div className="mb-3 max-h-72 overflow-hidden rounded-xl border border-white/10">
                              <img src={post.image_url} alt="" className="w-full object-cover" />
                            </div>
                          )}
                          <p className="text-sm leading-relaxed text-white/80">{post.content}</p>
                          {post.error_message && (
                            <p className="mt-2 text-xs text-red-400">{post.error_message}</p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            {(post.status === "draft" || post.status === "pending_approval") && (
                              <button
                                type="button"
                                onClick={() => startEdit(post)}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
                              >
                                Editar
                              </button>
                            )}
                            {post.status === "pending_approval" && (
                              <button
                                type="button"
                                onClick={() => handleReject(post.id)}
                                disabled={actioning === post.id}
                                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                {actioning === post.id ? "..." : "Rechazar"}
                              </button>
                            )}
                            {(post.status === "pending_approval" || post.status === "draft" || post.status === "scheduled") && (
                              <button
                                type="button"
                                onClick={() => handlePublish(post.id)}
                                disabled={actioning === post.id}
                                className="rounded-lg bg-[#C96F3B] px-3 py-1.5 text-xs font-semibold text-[#0B0D12] hover:bg-[#B85E30] disabled:opacity-50"
                              >
                                {actioning === post.id ? "..." : post.status === "pending_approval" ? "Aprobar y publicar" : "Publicar ahora"}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/80 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-xs text-white/30">Página {currentPage} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/80 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
