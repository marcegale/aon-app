"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";

export default function DiagnosticoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    rubro: "",
    empleados: "",
    problema: "",
    objetivo: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    if (!token) {
      alert("Por favor, confirma que eres humano.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken: token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Ocurrió un error.");
        setLoading(false);
        return;
      }

      const encoded = encodeURIComponent(result.diagnostico);
      router.push(`/resultado?data=${encoded}`);
    } catch (error) {
      console.error(error);
      alert("No se pudo enviar el formulario.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white flex flex-col items-center px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
        Cuéntanos sobre tu empresa
      </h1>

      <p className="text-gray-400 text-center mb-10 max-w-xl">
        Completa esta información para que AON prepare tu diagnóstico inicial.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <input
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="w-full p-3 rounded bg-[#1C2230]"
          required
          disabled={loading}
        />

        <input
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          placeholder="Empresa"
          className="w-full p-3 rounded bg-[#1C2230]"
          required
          disabled={loading}
        />

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 rounded bg-[#1C2230]"
          required
          disabled={loading}
        />

        <input
          name="rubro"
          value={formData.rubro}
          onChange={handleChange}
          placeholder="Rubro"
          className="w-full p-3 rounded bg-[#1C2230]"
          disabled={loading}
        />

        <input
          name="empleados"
          value={formData.empleados}
          onChange={handleChange}
          placeholder="Cantidad de empleados"
          className="w-full p-3 rounded bg-[#1C2230]"
          disabled={loading}
        />

        <textarea
          name="problema"
          value={formData.problema}
          onChange={handleChange}
          placeholder="Principal problema actual"
          className="w-full p-3 rounded bg-[#1C2230] min-h-[120px]"
          required
          disabled={loading}
        />

        <textarea
          name="objetivo"
          value={formData.objetivo}
          onChange={handleChange}
          placeholder="Objetivo principal"
          className="w-full p-3 rounded bg-[#1C2230] min-h-[120px]"
          required
          disabled={loading}
        />

        <div className="pt-2">
          <Turnstile
            siteKey="0x4AAAAAACw5ZlW3h_E6OOI0"
            onSuccess={(receivedToken) => setToken(receivedToken)}
            onExpire={() => setToken("")}
            onError={() => setToken("")}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className={`w-full py-3 rounded font-semibold transition ${
            loading || !token
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-[#C9A24D] text-black hover:opacity-90"
          }`}
        >
          {loading ? "Procesando..." : "Recibir diagnóstico"}
        </button>

        {loading && (
          <div className="rounded-xl border border-[#2A3140] bg-[#11161F] p-4 text-center">
            <div className="mb-3 text-[#C9A24D] font-semibold">
              AON está analizando tu empresa...
            </div>
            <div className="w-full h-2 bg-[#1C2230] rounded-full overflow-hidden">
              <div className="h-full w-full bg-[#C9A24D] animate-pulse" />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Esto puede tardar unos segundos. No cierres esta ventana.
            </p>
          </div>
        )}
      </form>

      <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
        La información será utilizada únicamente para generar un diagnóstico inicial y para contacto comercial.
      </p>
    </main>
  );
}