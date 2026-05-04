import { PublicShell } from "../../components/public/public-shell";
import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <PublicShell>
      <div className="grid w-full max-w-7xl items-center gap-10 py-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96F3B]/20 bg-[#C96F3B]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#F4EBD0] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#C96F3B] shadow-[0_0_16px_rgba(201,111,59,0.7)]" />
            Acceso seguro
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white md:text-5xl xl:text-6xl">
            Accede a tu
            <span className="bg-[linear-gradient(135deg,#ffffff_0%,#F4EBD0_50%,#C96F3B_85%,#ffffff_100%)] bg-clip-text text-transparent">
              {" "}
              entorno operativo{" "}
            </span>
            dentro de ai.gency.
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

        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,58,55,0.92)_0%,rgba(15,36,34,0.88)_100%)] p-6 shadow-[0_30px_120px_rgba(15,36,34,0.9)] backdrop-blur-2xl md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#F4EBD0]/55">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-3 text-sm font-medium text-[#F4EBD0] shadow-[0_0_30px_rgba(201,111,59,0.12)] transition hover:bg-[#C96F3B]/15"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}