"use client";

import { useMemo, useState } from "react";
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
  "Prefiero no revelar esta información por ahora"
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

const COUNTRY_OPTIONS = [
  { code: "PY", flag: "🇵🇾", dialCode: "+595", label: "Paraguay" },
  { code: "AR", flag: "🇦🇷", dialCode: "+54", label: "Argentina" },
  { code: "BR", flag: "🇧🇷", dialCode: "+55", label: "Brasil" },
  { code: "BO", flag: "🇧🇴", dialCode: "+591", label: "Bolivia" },
  { code: "CL", flag: "🇨🇱", dialCode: "+56", label: "Chile" },
  { code: "UY", flag: "🇺🇾", dialCode: "+598", label: "Uruguay" },
  { code: "PE", flag: "🇵🇪", dialCode: "+51", label: "Perú" },
  { code: "CO", flag: "🇨🇴", dialCode: "+57", label: "Colombia" },
  { code: "MX", flag: "🇲🇽", dialCode: "+52", label: "México" },
  { code: "US", flag: "🇺🇸", dialCode: "+1", label: "Estados Unidos" },
  { code: "ES", flag: "🇪🇸", dialCode: "+34", label: "España" },
];

export default function DiagnosticoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [phonePlaceholder, setPhonePlaceholder] = useState("Ej: 981234567");
  const [errors, setErrors] = useState<{
    email?: string;
    telefono?: string;
  }>({});

  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    rubro: "",
    empleados: "",
    codigoPais: "+595",
    telefono: "",
    facturacionAnual: "",
    problema: "",
    objetivo: "",
  });

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_OPTIONS.find((country) => country.dialCode === formData.codigoPais) ||
      COUNTRY_OPTIONS[0]
    );
  }, [formData.codigoPais]);

  function validateEmail(value: string) {
    const email = value.trim().toLowerCase();

    if (!email) {
      return "El email es obligatorio.";
    }

    const basicRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i;
    if (!basicRegex.test(email)) {
      return "Ingresa un email válido.";
    }

    const parts = email.split("@");
    if (parts.length !== 2) {
      return "Ingresa un email válido.";
    }

    const domain = parts[1];

    const typoMap: Record<string, string> = {
      "gmail.coim": "gmail.com",
      "gmail.con": "gmail.com",
      "gmail.cim": "gmail.com",
      "gmail.comm": "gmail.com",
      "gmail.cpm": "gmail.com",
      "gmail.xom": "gmail.com",
      "hotmail.coim": "hotmail.com",
      "hotmail.con": "hotmail.com",
      "hotmail.cim": "hotmail.com",
      "outlook.coim": "outlook.com",
      "outlook.con": "outlook.com",
      "yahoo.coim": "yahoo.com",
      "icloud.coim": "icloud.com",
    };

    if (typoMap[domain]) {
      return `Revisa tu email. Quizás quisiste escribir ${parts[0]}@${typoMap[domain]}.`;
    }

    if (
      domain.endsWith(".coim") ||
      domain.endsWith(".comm") ||
      domain.endsWith(".cpm") ||
      domain.endsWith(".xom") ||
      domain.endsWith(".con")
    ) {
      return "Revisa el dominio de tu email. Parece tener un error tipográfico.";
    }

    return "";
  }

  function validatePhone(value: string) {
    if (!value.trim()) return "";
    if (!/^\d+$/.test(value)) {
      return "El teléfono solo debe contener números.";
    }
    if (value.length < 6) {
      return "El teléfono parece demasiado corto.";
    }
    return "";
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        telefono: numericValue,
      }));
      setErrors((prev) => ({
        ...prev,
        telefono: validatePhone(numericValue),
      }));
      return;
    }

    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        email: value,
      }));
      setErrors((prev) => ({
        ...prev,
        email: value ? validateEmail(value) : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateBeforeSubmit() {
    const emailError = validateEmail(formData.email);
    const telefonoError = validatePhone(formData.telefono);

    setErrors({
      email: emailError,
      telefono: telefonoError,
    });

    if (emailError || telefonoError) return false;

    return true;
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

    if (!validateBeforeSubmit()) {
      alert("Por favor, revisa los campos marcados.");
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
          aceptaTerminos: acepta,
          telefonoCompleto: `${formData.codigoPais}${formData.telefono}`,
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
    <main className="min-h-screen bg-[#00003C]">
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center text-[#FDF6CB] lg:min-h-[720px]">
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
              Completá esta evaluación y AON generará un diagnóstico ejecutivo
              con foco en estructura, gestión y oportunidades de mejora.
            </p>

            <div className="mt-8 space-y-4">
              <InfoCard
                title="Visión ejecutiva inicial"
                text="Una primera lectura ordenada para entender el momento actual de la empresa."
              />
              <InfoCard
                title="Criterio consultivo"
                text="El análisis está planteado para sentirse como una lectura estratégica, no como una respuesta genérica."
              />
              <InfoCard
                title="Proceso confidencial"
                text="La información se utiliza únicamente para generar este diagnóstico inicial."
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-6 shadow-2xl shadow-black/20 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#00003C]">
                Completá tu evaluación inicial
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4B4F6B]">
                Te tomará entre 3 y 5 minutos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <FormField
                  label="Empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={errors.email}
                  placeholder="Ej: nombre@empresa.com"
                />

                <FormSelect
                  label="Rubro"
                  name="rubro"
                  value={formData.rubro}
                  onChange={handleChange}
                  options={RUBRO_OPTIONS}
                  placeholder="Selecciona un rubro"
                  required
                  disabled={loading}
                />

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
              </div>

              <PhoneField
                label="Teléfono"
                countryValue={formData.codigoPais}
                phoneValue={formData.telefono}
                onCountryChange={handleChange}
                onPhoneChange={handleChange}
                disabled={loading}
                error={errors.telefono}
                placeholder={phonePlaceholder}
                onPhoneFocus={() => setPhonePlaceholder("")}
                onPhoneBlur={() => {
                  if (!formData.telefono) {
                    setPhonePlaceholder("Ej: 981234567");
                  }
                }}
                selectedCountry={selectedCountry}
              />

              <FormTextarea
                label="Principal problema actual"
                name="problema"
                value={formData.problema}
                onChange={handleChange}
                rows={5}
                required
                disabled={loading}
              />

              <FormTextarea
                label="Objetivo principal"
                name="objetivo"
                value={formData.objetivo}
                onChange={handleChange}
                rows={5}
                required
                disabled={loading}
              />

              <div className="rounded-2xl border border-[#E2AB6D]/20 bg-[#FDF6CB]/25 p-4 text-sm leading-6 text-[#4B4F6B]">
                Este diagnóstico no reemplaza una consultoría completa, pero sí
                ofrece una lectura estratégica inicial para detectar focos de
                mejora.
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
                    AON está analizando tu empresa...
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0C6]">
                    <div className="h-full w-full animate-pulse bg-[#E2AB6D]" />
                  </div>
                  <p className="mt-3 text-xs text-[#5C607B]">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="font-medium text-[#FDF6CB]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#FDF6CB]/70">{text}</p>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-[#00003C]">
        {label}
        {required && <span className="ml-1 text-[#E2AB6D]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#00003C] outline-none transition placeholder:text-[#8A8DA8] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-[#D8D3C4] focus:border-[#E2AB6D] focus:ring-[#E2AB6D]/20"
        }`}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
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

function PhoneField({
  label,
  countryValue,
  phoneValue,
  onCountryChange,
  onPhoneChange,
  disabled = false,
  error,
  placeholder,
  onPhoneFocus,
  onPhoneBlur,
  selectedCountry,
}: {
  label: string;
  countryValue: string;
  phoneValue: string;
  onCountryChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onPhoneChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  onPhoneFocus: () => void;
  onPhoneBlur: () => void;
  selectedCountry: { code: string; flag: string; dialCode: string; label: string };
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="telefono" className="text-sm font-medium text-[#00003C]">
        {label}
      </label>

      <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative">
          <select
            id="codigoPais"
            name="codigoPais"
            value={countryValue}
            onChange={onCountryChange}
            disabled={disabled}
            className="w-full appearance-none rounded-2xl border border-[#D8D3C4] bg-white px-4 py-3 pr-10 text-sm text-[#00003C] outline-none transition focus:border-[#E2AB6D] focus:ring-2 focus:ring-[#E2AB6D]/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.dialCode}>
                {country.flag} {country.label} ({country.dialCode})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4B4F6B]">
            ▾
          </div>
        </div>

        <div className="space-y-2">
          <div
            className={`flex items-center rounded-2xl border bg-white px-4 py-3 transition ${
              error
                ? "border-red-400 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                : "border-[#D8D3C4] focus-within:border-[#E2AB6D] focus-within:ring-2 focus-within:ring-[#E2AB6D]/20"
            }`}
          >
            <span className="mr-3 whitespace-nowrap text-sm font-medium text-[#4B4F6B]">
              {selectedCountry.flag} {selectedCountry.dialCode}
            </span>

            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              pattern="[0-9]*"
              value={phoneValue}
              onChange={onPhoneChange}
              onFocus={onPhoneFocus}
              onBlur={onPhoneBlur}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-[#00003C] outline-none placeholder:text-[#8A8DA8] disabled:cursor-not-allowed"
            />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
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
        className="min-h-[130px] w-full rounded-2xl border border-[#D8D3C4] bg-white px-4 py-3 text-sm text-[#00003C] outline-none transition placeholder:text-[#8A8DA8] focus:border-[#E2AB6D] focus:ring-2 focus:ring-[#E2AB6D]/20 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}