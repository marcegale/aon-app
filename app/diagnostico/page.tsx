"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";

const EMPLEADOS_OPTIONS = [
  "De 1 a 10",
  "De 11 a 30",
  "De 31 a 60",
  "De 61 a 100",
  "De 101 a 500",
  "Más de 500",
];

const FACTURACION_OPTIONS = [
  "De 0 a 99.999 USD",
  "De 100.000 a 199.999 USD",
  "De 200.000 a 499.999 USD",
  "De 500.000 a 999.999 USD",
  "De 1.000.000 a 5.000.000 USD",
  "Más de 5.000.000 USD",
  "Prefiero no revelar esta información por ahora",
];

const RUBRO_OPTIONS = [
  "Agroganadera",
  "Agricultura",
  "Ganadería",
  "Industria alimenticia",
  "Bebidas",
  "Textil y confección",
  "Calzados y cuero",
  "Madera y muebles",
  "Química y farmacéutica",
  "Plásticos y caucho",
  "Metalúrgica",
  "Maquinarias y equipos",
  "Electrónica y tecnología",
  "Software y desarrollo",
  "Servicios de TI",
  "Telecomunicaciones",
  "Energía, electricidad y gas",
  "Construcción",
  "Inmobiliaria",
  "Arquitectura e ingeniería",
  "Comercio mayorista o minorista",
  "Import, Export y distribución",
  "Logística y transporte",
  "Almacenamiento y depósitos",
  "Automotriz",
  "Hotelería, Turismo, Gastronomía",
  "Salud y servicios médicos",
  "Finanzas y seguros",
  "Servicios profesionales",
  "Consultoría empresarial",
  "Marketing y publicidad",
  "Diseño y creatividad",
  "Medios y comunicación",
  "Recursos humanos y reclutamiento",
  "Seguridad y vigilancia",
  "Limpieza y mantenimiento",
  "Marketplace y plataformas digitales",
  "Belleza y cuidado personal",
  "Moda y accesorios",
  "Entretenimiento y eventos",
  "Deportes y bienestar",
  "Otro",
];

const LOADING_STEPS = [
  "Analizando la estructura general de tu empresa...",
  "Detectando patrones y puntos de tensión...",
  "Identificando riesgos visibles y oportunidades...",
  "Preparando tu diagnóstico ejecutivo inicial...",
];

export default function DiagnosticoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_STEPS[0]);
  const [token, setToken] = useState("");
  const [acepta, setAcepta] = useState(false);

  const [formData, setFormData] = useState({
    rubro: "",
    empleados: "",
    facturacionAnual: "",
    problema: "",
    objetivo: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    if (!acepta) {
      alert(
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar."
      );
      return;
    }

    setLoading(true);

    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex += 1;
      if (stepIndex < LOADING_STEPS.length) {
        setLoadingText(LOADING_STEPS[stepIndex]);
      }
    }, 1400);

    try {
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken: token,
          aceptaTerminos: acepta,
        }),
      });

      const result = await response.json();

      clearInterval(interval);

      if (!response.ok) {
        alert(result.message || "Ocurrió un error.");
        setLoading(false);
        setLoadingText(LOADING_STEPS[0]);
      return;
      }

      if (!result?.id) {
        alert("No se recibió el ID del diagnóstico.");
        setLoading(false);
        setLoadingText(LOADING_STEPS[0]);
      return;
      }

      router.push(`/resultado?id=${result.id}`);

    } catch (error) {
      clearInterval(interval);
      console.error(error);
      alert("No se pudo enviar el formulario.");
      setLoading(false);
      setLoadingText(LOADING_STEPS[0]);
    }
  }

  return (
    <main className="min-h-screen bg-[#00003C]">
      <section className="mx-auto max-w-7xl px-5 py-6 md:px-6 lg:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center text-[#FDF6CB] lg:min-h-[calc(100vh-90px)]">
            <div className="mb-6">
              <Image
                src="/logo-aon.png"
                alt="AON"
                width={64}
                height={64}
                className="h-14 w-14 object-contain md:h-16 md:w-16"
                priority
              />
            </div>

            <div className="inline-flex w-fit rounded-full border border-[#E2AB6D]/30 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#FDF6CB]/85">
              AON · Diagnóstico Estratégico
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-[#FDF6CB] md:text-5xl">
              Recibí una lectura estratégica inicial de tu empresa
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#FDF6CB]/75 md:text-lg">
              Completá esta evaluación breve y AON generará un diagnóstico ejecutivo
              inicial con foco en estructura, gestión y oportunidades de mejora.
            </p>

            <div className="mt-6 space-y-3">
              <InfoCard
                title="Form rápido"
                text="Solo pedimos la información mínima necesaria para generar el diagnóstico."
              />
              <InfoCard
                title="Lectura ejecutiva inicial"
                text="AON detecta focos de mejora, riesgos visibles y acciones inmediatas."
              />
              <InfoCard
                title="Proceso confidencial"
                text="La información se utiliza únicamente para generar este diagnóstico inicial."
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-5 shadow-2xl shadow-black/20 md:p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00003C]">
                Completá tu evaluación inicial
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4B4F6B]">
                Te tomará menos de 2 minutos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FormSelect
                  label="Cantidad de empleados"
                  name="empleados"
                  value={formData.empleados}
                  onChange={handleChange}
                  options={EMPLEADOS_OPTIONS}
                  placeholder="Selecciona un rango"
                  disabled={loading}
                />

                <FormSelect
                  label="Facturación anual en USD"
                  name="facturacionAnual"
                  value={formData.facturacionAnual}
                  onChange={handleChange}
                  options={FACTURACION_OPTIONS}
                  placeholder="Selecciona un rango"
                  disabled={loading}
                />

                <div className="md:col-span-2">
                  <FormSelect
                    label="Rubro / Industria"
                    name="rubro"
                    value={formData.rubro}
                    onChange={handleChange}
                    options={RUBRO_OPTIONS}
                    placeholder="Selecciona un rubro"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <FormTextarea
                label="Problema principal"
                name="problema"
                value={formData.problema}
                onChange={handleChange}
                rows={4}
                required
                disabled={loading}
              />

              <FormTextarea
                label="Objetivo principal"
                name="objetivo"
                value={formData.objetivo}
                onChange={handleChange}
                rows={4}
                required
                disabled={loading}
              />

              <div className="rounded-2xl border border-[#E2AB6D]/20 bg-[#FDF6CB]/25 p-4 text-sm leading-6 text-[#4B4F6B]">
                Este diagnóstico no reemplaza una consultoría completa, pero sí
                ofrece una lectura estratégica inicial para detectar focos de mejora.
              </div>

              <div className="pt-1">
                <Turnstile
                  siteKey="0x4AAAAAACw5ZlW3h_E6OOI0"
                  onSuccess={(receivedToken) => setToken(receivedToken)}
                  onExpire={() => setToken("")}
                  onError={() => setToken("")}
                />
              </div>

              <div className="rounded-2xl border border-[#E2AB6D]/20 bg-white p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-[#D8D3C4] text-[#00003C] focus:ring-[#E2AB6D]/30 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm leading-6 text-[#4B4F6B]">
                    Acepto los{" "}
                    <a
                      href="/terminos"
                      className="font-medium text-[#00003C] underline underline-offset-2 hover:text-[#0A0A52]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Términos y Condiciones
                    </a>{" "}
                    y la{" "}
                    <a
                      href="/privacidad"
                      className="font-medium text-[#00003C] underline underline-offset-2 hover:text-[#0A0A52]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidad
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !token || !acepta}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold transition ${
                  loading || !token || !acepta
                    ? "cursor-not-allowed bg-[#B8B8C7] text-white"
                    : "bg-[#00003C] text-[#FDF6CB] hover:bg-[#0A0A52]"
                }`}
              >
                {loading ? "Procesando..." : "Recibir diagnóstico"}
              </button>

              {loading && (
                <div className="rounded-2xl border border-[#E2AB6D]/15 bg-[#F7F1DE] p-4 text-center">
                  <div className="mb-3 font-semibold text-[#00003C]">
                    AON está trabajando en tu diagnóstico...
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0C6]">
                    <div className="h-full w-full animate-pulse bg-[#E2AB6D]" />
                  </div>
                  <p className="mt-3 text-sm text-[#5C607B]">{loadingText}</p>
                  <p className="mt-2 text-xs text-[#5C607B]">
                    Esto puede tardar unos segundos. No cierres esta ventana.
                  </p>
                </div>
              )}
            </form>

            <p className="mt-6 text-xs leading-5 text-[#6B6F86]">
              La información será utilizada únicamente para generar un
              diagnóstico inicial y para contacto comercial, de conformidad con
              los términos aceptados por el usuario.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <p className="font-medium text-[#FDF6CB]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#FDF6CB]/70">{text}</p>
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-[#00003C]">
        {label}
        {required && <span className="ml-1 text-[#E2AB6D]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-2xl border border-[#D8D3C4] bg-white px-4 py-3 text-sm text-[#00003C] outline-none transition focus:border-[#E2AB6D] focus:ring-2 focus:ring-[#E2AB6D]/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({
  label,
  name,
  value,
  onChange,
  rows = 4,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-[#00003C]">
        {label}
        {required && <span className="ml-1 text-[#E2AB6D]">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        disabled={disabled}
        className="min-h-[96px] w-full rounded-2xl border border-[#D8D3C4] bg-white px-4 py-3 text-sm text-[#00003C] outline-none transition placeholder:text-[#8A8DA8] focus:border-[#E2AB6D] focus:ring-2 focus:ring-[#E2AB6D]/20 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}