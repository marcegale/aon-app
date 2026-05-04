import { ReactNode } from "react";
import Link from "next/link";
import { PublicBackground } from "./public-background";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#183A37] text-white">
      <PublicBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <img src="/brand/logo-white.png" alt="ai.gency" className="h-8 w-auto" />
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
              className="rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-2.5 text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15"
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
