"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicBackground } from "@/components/public/public-background";

export default function HomePage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#183A37] text-white">
      <PublicBackground />

      <div className="relative z-10">
        <div className="relative z-10 flex h-full flex-col">
          {/* Top nav */}
          <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <img src="/brand/logo-white.png" alt="ai.gency" className="h-8 w-auto" />
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
                className="rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-2.5 text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C96F3B]/20 bg-[#C96F3B]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#F4EBD0] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#C96F3B] shadow-[0_0_16px_rgba(201,111,59,0.7)]" />
                AI para operaciones reales
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-6xl xl:text-7xl">
                AI systems for
                <span className="bg-[linear-gradient(135deg,#F4EBD0_0%,#C96F3B_60%,#F4EBD0_100%)] bg-clip-text text-transparent">
                  {" "}
                  faster, leaner{" "}
                </span>
                operations.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
                Practical AI workflows for client maintenance, document processing,
                reporting, and operational efficiency.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 rounded-2xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-6 py-4 text-sm font-medium text-[#F4EBD0] shadow-[0_0_40px_rgba(201,111,59,0.15)] transition hover:bg-[#C96F3B]/20"
                >
                  Explorar agentes
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
                >
                  Iniciar sesión
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                  <p className="text-2xl font-semibold text-white">Facturas</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Procesamiento automático de documentos contables.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                  <p className="text-2xl font-semibold text-white">Reportes</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Análisis y exportación de datos en tiempo real.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-md">
                  <p className="text-2xl font-semibold text-white">Agentes</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Flujos autónomos adaptados a cada operación.
                  </p>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative w-full max-w-[34rem]">
                <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(201,111,59,0.12),rgba(244,235,208,0.04),rgba(24,58,55,0.08))] blur-xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,58,55,0.92)_0%,rgba(15,36,34,0.85)_100%)] p-5 shadow-[0_30px_120px_rgba(15,36,34,0.9)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#F4EBD0]/55">
                        Operations Center
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        ai.gency / Live
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs text-emerald-300/80 animate-pulse">
                        System stable
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-[#C96F3B]/15 bg-[#C96F3B]/10 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#F4EBD0]/70">
                          Agentes
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-white">6</p>
                        <p className="mt-2 text-xs text-white/45">Flujos activos</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                          Docs
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-white">1.8k</p>
                        <p className="mt-2 text-xs text-white/45">Procesados</p>
                      </div>

                      <div className="rounded-2xl border border-[#F4EBD0]/10 bg-[#F4EBD0]/[0.04] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#F4EBD0]/70">
                          Precisión
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-white">97%</p>
                        <p className="mt-2 text-xs text-white/45">Validados</p>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                            Activity
                          </p>
                          <p className="mt-2 text-sm text-white/65">
                            Workflows running across accounting, reporting and ops.
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
                                className="relative flex-1 rounded-t-xl bg-[linear-gradient(180deg,rgba(201,111,59,0.9),rgba(201,111,59,0.35))]"
                                style={{ height }}
                              >
                                <div className="absolute inset-x-0 top-0 h-6 rounded-t-xl bg-white/10 blur-sm" />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                          Seguridad
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                            ✓
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              Acceso por workspace
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                              Aislamiento de datos por cliente.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                          AI Operations
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C96F3B]/20 bg-[#C96F3B]/10 text-[#F4EBD0]">
                            ◉
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              Agentes coordinados
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                              Decisiones y ejecución operativa.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(201,111,59,0.5),rgba(244,235,208,0.4),transparent)]" />
                </div>
              </div>
            </div>
          </section>

          <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 pb-6 text-xs text-white/45">
            <span>AON App</span>
            <div className="flex items-center gap-4">
              <Link href="/privacidad" className="transition hover:text-white/75">
                Politica de Privacidad
              </Link>
              <Link href="/terminos" className="transition hover:text-white/75">
                Terminos de Servicio
              </Link>
            </div>
          </footer>
        </div>

        {isContactOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/12 bg-[#0F2422]/95 p-8 shadow-[0_0_80px_rgba(201,111,59,0.15)]">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Contacto ai.gency
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
                    placeholder="Queremos automatizar contabilidad, reportes y operaciones diarias."
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
