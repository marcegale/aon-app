"use client";

import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);

  const slugIsValid = isValidSlug(slug);

    useEffect(() => {
    if (!isSlugManual) {
        setSlug(slugify(name));
    }
    }, [name, isSlugManual]);

  return (
    <PublicShell>
      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Create your workspace
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Set up your company inside Nexa Core
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="text-xs text-white/50">
                Company name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
              />
            </div>

            {/* Slug */}
            <div>
                <label className="text-xs text-white/50">
                    Workspace slug
                </label>
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                        const value = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "");

                        setSlug(value);
                        setIsSlugManual(true);
                    }}
                    placeholder="acme"
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white placeholder-white/30 outline-none ${
                    slugIsValid
                        ? "border-white/10 bg-black/40 focus:border-white/30"
                        : "border-red-500/50 bg-black/40 focus:border-red-500"
                    }`}
                />
                <p className="mt-1 text-[11px] text-white/40">
                    This will be your workspace URL
                </p>

                {slug && !slugIsValid && (
                    <p className="mt-1 text-[11px] text-red-400">
                    Only lowercase letters, numbers and hyphens allowed
                    </p>
                )}
            </div>

            {/* CTA */}
            <button
              className="w-full rounded-lg bg-white text-black py-2 text-sm font-medium transition hover:bg-white/90 disabled:opacity-50"
              disabled={!name || !slug || !slugIsValid}
            >
              Create workspace
            </button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}