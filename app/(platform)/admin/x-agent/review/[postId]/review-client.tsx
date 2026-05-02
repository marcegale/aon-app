"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { GraphicPreview } from "../../previews";
import type { OverlayData } from "../../previews";

type Props = {
  postId: string;
  queueId: string | null;
  selectedOptionKey: string;
  initialText: string;
  optionLabel: string;
  token: string;
};

export default function ReviewClient({
  postId,
  queueId,
  selectedOptionKey,
  initialText,
  optionLabel,
  token,
}: Props) {
  const [text, setText] = useState(initialText);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState("");
  const [overlayApplied, setOverlayApplied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const charCount = text.length;
  const overLimit = charCount > 280;

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const res = await fetch("/api/admin/x/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.image_url);
      setOverlayApplied(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleExport() {
    if (!previewRef.current) return;
    setExporting(true);
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
      setError(e instanceof Error ? e.message : "Error al exportar gráfica");
    } finally {
      setExporting(false);
    }
  }

  async function handlePublish() {
    if (!text.trim() || overLimit) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/x/review/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          queueId,
          selectedOptionKey,
          finalText: text,
          imageUrl: imageUrl ?? null,
          token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al publicar");
    } finally {
      setPublishing(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 text-xl text-emerald-400">
            ✓
          </div>
          <h1 className="text-xl font-bold text-white">Publicado en X</h1>
          <p className="mt-2 text-sm text-white/50">El post fue publicado correctamente.</p>
        </div>
      </div>
    );
  }

  const overlay: OverlayData = {
    headline: "",
    subheadline: "",
    competition: null,
    status: null,
    matches: [],
    quote: null,
    person: null,
    teams: [],
    credits: credits || null,
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A24D]">X Agent · Revisión</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Revisar y publicar</h1>
          <p className="mt-1 text-sm text-white/45">
            Opción seleccionada: <span className="text-white/70">{optionLabel}</span>
          </p>
        </div>

        {/* Text editor */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
            Texto del post
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#111620] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A24D]/40"
            />
            <span className={`absolute bottom-3 right-4 text-xs ${overLimit ? "text-red-400" : "text-white/30"}`}>
              {charCount}/280
            </span>
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
            Imagen (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.07] disabled:opacity-40"
            >
              {uploading ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {imageUrl && !overlayApplied && (
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="rounded-xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] hover:bg-[#C9A24D]/15 disabled:opacity-40"
              >
                {exporting ? "Aplicando..." : "Aplicar créditos a imagen"}
              </button>
            )}
            {imageUrl && (
              <button
                type="button"
                onClick={() => { setImageUrl(null); setOverlayApplied(false); }}
                className="text-sm text-white/30 hover:text-white/60"
              >
                Quitar imagen
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
          />

          {/* Credits */}
          {imageUrl && (
            <input
              type="text"
              placeholder="Crédito fotográfico (ej: Reuters / Getty Images)"
              value={credits}
              onChange={(e) => { setCredits(e.target.value); setOverlayApplied(false); }}
              className="w-full rounded-xl border border-white/10 bg-[#111620] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#C9A24D]/40"
            />
          )}
        </div>

        {/* Preview */}
        {imageUrl && (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <div ref={previewRef}>
                <GraphicPreview
                  imageUrl={imageUrl}
                  visualType="background_only"
                  overlay={overlay}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Reject + Publish */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <a
            href={`/api/admin/x/reject?id=${postId}&token=${token}`}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/45 hover:text-white/70"
          >
            Rechazar
          </a>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || !text.trim() || overLimit}
            className="rounded-xl bg-[#C9A24D] px-6 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-[#D8B45F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? "Publicando..." : "Publicar en X"}
          </button>
        </div>
      </div>
    </div>
  );
}
