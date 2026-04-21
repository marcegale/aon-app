import { ReactNode } from "react";
import Link from "next/link";
import { PublicBackground } from "./public-background";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <PublicBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(201,162,77,0.12)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_35%),linear-gradient(135deg,rgba(201,162,77,0.28),rgba(59,130,246,0.18),rgba(168,85,247,0.18))]" />
              <span className="relative text-sm font-semibold tracking-[0.22em] text-white">
                NX
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.36em] text-[#E7C980]">
                NEXA CORE
              </span>
              <span className="text-xs text-white/40">
                Enterprise AI
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/signup"
              className="rounded-xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-2.5 text-sm font-medium text-[#E7C980] transition hover:bg-[#C9A24D]/15"
            >
              Crear cuenta
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08]"
            >
              Volver al inicio
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6">
          {children}
        </div>
      </div>
    </main>
  );
}