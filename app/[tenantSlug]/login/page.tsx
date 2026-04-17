"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";

export default function TenantLoginPage() {
  const params = useParams<{ tenantSlug: string }>();
  const tenantSlug = params.tenantSlug;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/tenant-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantSlug,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      window.location.href = `/${tenantSlug}/assessment`;
    } catch {
      setError("No se pudo iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#C9A24D]">
            Always On
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Acceso al assessment
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Tenant: <span className="text-white">{tenantSlug}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#C9A24D]/60"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-[#C9A24D]/60"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#C9A24D] px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}