"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicBackground } from "../components/public/public-background";
import { NeuralBrainBackground } from "../components/public/neural-brain-background";

export default function HomePage() {
  
  const [isContactOpen, setIsContactOpen] = useState(false);

return (
  <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
    <PublicBackground />

    <div className="relative z-10">
      <div className="relative z-10 flex h-full flex-col">
        {/* Top nav */}
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(201,162,77,0.12)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_35%),linear-gradient(135deg,rgba(201,162,77,0.28),rgba(59,130,246,0.18),rgba(168,85,247,0.18))]" />
              <span className="relative text-sm font-semibold tracking-[0.22em] text-white">
                NX
              </span>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#E7C980]">
                Nexa Core
              </p>
              <p className="text-xs text-white/40">
                Enterprise AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2.5 text-sm font-medium text-[#E7C980] shadow-[0_0_30px_rgba(201,162,77,0.14)] transition hover:bg-[#C9A24D]/15"
            >
              Crear cuenta
            </Link>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Contactar
            </button>
          </div>
        </header>

        {/* Main hero */}
        <section className="relative mx-auto grid h-full w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-8 pt-4 lg:grid-cols-[1.1fr_0.9fr]">
           {/* Left */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              El futuro empresarial ya llegó
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-6xl xl:text-7xl">
              La nueva
              <span className="bg-[linear-gradient(135deg,#ffffff_0%,#9ae6ff_30%,#e7c980_65%,#ffffff_100%)] bg-clip-text text-transparent">
                {" "}
                capa operativa{" "}
              </span>
              para empresas que quieren pensar, decidir y ejecutar con IA.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              Nexa Core unifica agentes, conocimiento, documentos, análisis,
              operaciones y control empresarial en una sola experiencia
              futurista, confiable y multi-tenant.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/create-workspace"
                className="group inline-flex items-center gap-3 rounded-2xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-6 py-4 text-sm font-medium text-[#E7C980] shadow-[0_0_40px_rgba(201,162,77,0.15)] transition hover:bg-[#C9A24D]/15"
              >
                Crear workspace
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
              >
                Acceder a mi cuenta
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">Multi-tenant</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Cada empresa con su propio workspace, datos y agentes.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">IA real</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Procesos, diagnósticos y automatización operativa.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                <p className="text-2xl font-semibold text-white">Enterprise</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Diseño confiable para equipos y operación crítica.
                </p>
              </div>
            </div>
          </div>

          {/* Right futuristic console */}
          <div className="relative z-10 flex items-center justify-center">

            <div className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative w-full max-w-[34rem]">
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(201,162,77,0.06))] blur-xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.82)_100%)] p-5 shadow-[0_30px_120px_rgba(2,6,23,0.9)] backdrop-blur-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200">
                      Control Center
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      NEXA CORE / LIVE ORCHESTRATION
                    </p>
                  </div>

                  <div className="flex items-center gap-2">               
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs text-emerald-300/80 animate-pulse">
                      System stable
                    </span>
                  </div>
                </div>

                {/* Main card */}
                <div className="mt-5 grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                        Agents
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">12</p>
                      <p className="mt-2 text-xs text-white/45">Specialized layers active</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                        Documents
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">4.2k</p>
                      <p className="mt-2 text-xs text-white/45">Indexed knowledge in sync</p>
                    </div>

                    <div className="rounded-2xl border border-[#C9A24D]/15 bg-[#C9A24D]/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#E7C980]">
                        Accuracy
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">98%</p>
                      <p className="mt-2 text-xs text-white/45">Validated workflows</p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                          Signal Stream
                        </p>
                        <p className="mt-2 text-sm text-white/65">
                          Enterprise AI flowing across tenants, agents and decisions.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/55">
                        Real-time
                      </div>
                    </div>

                    <div className="mt-6 h-36 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4">
                      <div className="flex h-full items-end gap-2">
                        {[38, 52, 44, 70, 62, 88, 76, 102, 94, 126, 112, 138].map(
                          (height, i) => (
                            <div
                              key={i}
                              className="relative flex-1 rounded-t-xl bg-[linear-gradient(180deg,rgba(154,230,255,0.9),rgba(59,130,246,0.35),rgba(168,85,247,0.25))] shadow-[0_0_25px_rgba(103,232,249,0.18)]"
                              style={{ height }}
                            >
                              <div className="absolute inset-x-0 top-0 h-6 rounded-t-xl bg-white/15 blur-sm" />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Security Layer
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                          ✓
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Trusted enterprise access
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            Identity, isolation and control by workspace.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        AI Operations
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                          ◉
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Agents coordinating in real time
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            Decisions, diagnostics and workflow execution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* bottom glow line */}
                <div className="mt-5 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.7),rgba(231,201,128,0.7),transparent)]" />
              </div>
            </div>
          </div>
        </section>
      </div>
      {isContactOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/12 bg-[#060b16]/95 p-8 shadow-[0_0_80px_rgba(79,70,229,0.18)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Contacto Nexa Core
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Contanos sobre tu empresa y tus necesidades de automatización.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="text-xs text-white/50">Nombre y Apellido</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="text-xs text-white/50">E-mail</label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="text-xs text-white/50">Empresa</label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="text-xs text-white/50">¿En qué podemos ayudarte?</label>
                <textarea
                  rows={4}
                  placeholder="We want to automate accounting, procurement and reporting across multiple teams."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}