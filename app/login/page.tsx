import { PublicShell } from "../../components/public/public-shell";
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <PublicShell>
      <div className="grid w-full max-w-7xl items-center gap-10 py-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
            Enterprise access layer
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white md:text-5xl xl:text-6xl">
            Accede a tu
            <span className="bg-[linear-gradient(135deg,#ffffff_0%,#9ae6ff_30%,#e7c980_65%,#ffffff_100%)] bg-clip-text text-transparent">
              {" "}
              entorno operativo{" "}
            </span>
            dentro de Nexa Core.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/62">
            Inicia sesión para acceder a tus agentes, documentos, análisis y
            automatizaciones empresariales desde una capa segura y multi-tenant.
          </p>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
              <p className="text-sm font-medium text-white">
                Acceso por workspace
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Cada usuario ingresa a su empresa con aislamiento de datos,
                configuración y operación.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
              <p className="text-sm font-medium text-white">
                Seguridad primero
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Identidad, permisos y acceso pensados para uso empresarial real.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88)_0%,rgba(2,6,23,0.82)_100%)] p-6 shadow-[0_30px_120px_rgba(2,6,23,0.9)] backdrop-blur-2xl md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200">
                Login
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Iniciar sesión
              </h2>
            </div>

            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              Protected access
            </div>
          </div>

          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/80"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/80"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl border border-[#C9A24D]/25 bg-[#C9A24D]/10 px-4 py-3 text-sm font-medium text-[#E7C980] shadow-[0_0_30px_rgba(201,162,77,0.12)] transition hover:bg-[#C9A24D]/15"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}