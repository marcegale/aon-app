"use client";

import { FormEvent, useRef, useState } from "react";
import { jsPDF } from "jspdf";

type RecruitmentProcessResponse = {
  ok: boolean;
  process_id: string;
  tenant_id: string;
  user_id: string;
  output: {
    diagnostico: string;
    perfil: {
      nombre: string;
      objetivo: string;
      responsabilidades: string[];
      requisitos: string[];
      habilidades: string[];
      kpis: string[];
      reporta_a: string;
    };
    anuncio: {
      formal: string;
      atractivo: string;
    };
  };
  created_at: string;
  updated_at: string;
};

type FormState = {
  empresa_descripcion: string;
  area: string;
  motivo: string;
  cultura: string;
  salario_min: string;
  salario_max: string;
  organigrama_texto: string;
  perfiles_anteriores: string;
  busquedas_pasadas: string;
};

const initialFormState: FormState = {
  empresa_descripcion: "",
  area: "",
  motivo: "",
  cultura: "",
  salario_min: "",
  salario_max: "",
  organigrama_texto: "",
  perfiles_anteriores: "",
  busquedas_pasadas: "",
};

export default function NuevoPuestoPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecruitmentProcessResponse | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const requiredFields = [
      formState.empresa_descripcion,
      formState.area,
      formState.motivo,
      formState.cultura,
      formState.organigrama_texto,
      formState.salario_min,
      formState.salario_max,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      setError("Completa los campos obligatorios");
      return;
    }

    const salarioMin = Number(formState.salario_min);
    const salarioMax = Number(formState.salario_max);

    if (Number.isNaN(salarioMin) || Number.isNaN(salarioMax)) {
      setError("Salario mínimo y salario máximo deben ser números válidos.");
      return;
    }

    if (salarioMin > salarioMax) {
      setError("El salario mínimo no puede ser mayor que el salario máximo.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...formState,
        tenant_id: "demo-tenant",
        user_id: "demo-user",
        salario_min: salarioMin,
        salario_max: salarioMax,
      };

      const response = await fetch("/api/rrhh/create-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as
        | RecruitmentProcessResponse
        | { error?: string };

      if (!response.ok) {
        const apiError = "error" in data ? data.error : undefined;
        throw new Error(apiError || "No se pudo crear el nuevo puesto.");
      }

      setResult(data as RecruitmentProcessResponse);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error inesperado al crear el puesto.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPdf() {
    if (!result) return;

    const doc = new jsPDF();
    const perfil = result.output.perfil;
    const fechaActual = new Date().toLocaleDateString("es-PY");
    const marginX = 15;
    const maxWidth = 180;
    let currentY = 20;

    const ensurePageSpace = (neededHeight: number) => {
      if (currentY + neededHeight > 280) {
        doc.addPage();
        currentY = 20;
      }
    };

    const addParagraph = (text: string) => {
      const safeText = text || "-";
      const lines = doc.splitTextToSize(safeText, maxWidth);
      ensurePageSpace(lines.length * 6 + 2);
      doc.text(lines, marginX, currentY);
      currentY += lines.length * 6 + 2;
    };

    const addSection = (title: string, content: string) => {
      ensurePageSpace(10);
      doc.setFont("helvetica", "bold");
      doc.text(title, marginX, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      addParagraph(content);
      currentY += 2;
    };

    const addListSection = (title: string, items: string[]) => {
      ensurePageSpace(10);
      doc.setFont("helvetica", "bold");
      doc.text(title, marginX, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");

      if (!items.length) {
        addParagraph("-");
        currentY += 2;
        return;
      }

      for (const item of items) {
        addParagraph(`• ${item}`);
      }

      currentY += 2;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MANUAL DE PROCESOS", marginX, currentY);
    currentY += 8;
    doc.text("PERFIL DE CARGO", marginX, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Código: RRHH-001", marginX, currentY);
    currentY += 6;
    doc.text("Versión: 1.0", marginX, currentY);
    currentY += 6;
    doc.text(`Fecha: ${fechaActual}`, marginX, currentY);
    currentY += 6;
    doc.text(`Área: ${formState.area || "-"}`, marginX, currentY);
    currentY += 6;
    doc.text(`Puesto: ${perfil.nombre || "-"}`, marginX, currentY);
    currentY += 10;

    addSection("Objetivo", perfil.objetivo);
    addListSection("Responsabilidades", perfil.responsabilidades);
    addListSection("Requisitos", perfil.requisitos);
    addListSection("Habilidades", perfil.habilidades);
    addListSection("KPIs", perfil.kpis);
    addSection("Reporta a", perfil.reporta_a);

    const safeName = sanitizeFileName(perfil.nombre || "perfil-cargo");
    doc.save(`perfil-cargo-${safeName}.pdf`);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-semibold text-gray-900">Crear nuevo puesto</h1>
        <p className="mt-2 text-sm text-gray-600">
          Completá los datos del proceso de reclutamiento para generar diagnóstico,
          perfil y anuncio automáticamente.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <TextAreaField
            label="Descripción de la empresa"
            name="empresa_descripcion"
            value={formState.empresa_descripcion}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Área"
              name="area"
              value={formState.area}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <InputField
              label="Motivo"
              name="motivo"
              value={formState.motivo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <TextAreaField
            label="Cultura"
            name="cultura"
            value={formState.cultura}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Salario mínimo"
              name="salario_min"
              type="number"
              value={formState.salario_min}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <InputField
              label="Salario máximo"
              name="salario_max"
              type="number"
              value={formState.salario_max}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <TextAreaField
            label="Organigrama (texto)"
            name="organigrama_texto"
            value={formState.organigrama_texto}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextAreaField
            label="Perfiles anteriores (opcional)"
            name="perfiles_anteriores"
            value={formState.perfiles_anteriores}
            onChange={handleChange}
            disabled={loading}
          />

          <TextAreaField
            label="Búsquedas pasadas (opcional)"
            name="busquedas_pasadas"
            value={formState.busquedas_pasadas}
            onChange={handleChange}
            disabled={loading}
          />

          <p className="text-xs text-gray-500">* Campos obligatorios</p>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Generando proceso..." : "Crear puesto"}
          </button>
        </form>
      </section>

      {result ? (
        <section
          ref={resultRef}
          className="mx-auto mt-8 max-w-4xl rounded-xl border border-green-200 bg-green-50 p-6 md:p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900">Resultado del proceso</h2>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Descargar perfil en PDF
          </button>

          <div className="mt-5 space-y-4 text-sm text-gray-800">
            <ResultBlock title="Diagnóstico" content={result.output.diagnostico} />
            <ResultBlock title="Perfil - Nombre" content={result.output.perfil.nombre} />
            <ResultBlock title="Perfil - Objetivo" content={result.output.perfil.objetivo} />
            <ListBlock
              title="Perfil - Responsabilidades"
              items={result.output.perfil.responsabilidades}
            />
            <ListBlock title="Perfil - Requisitos" items={result.output.perfil.requisitos} />
            <ListBlock title="Perfil - Habilidades" items={result.output.perfil.habilidades} />
            <ListBlock title="Perfil - KPIs" items={result.output.perfil.kpis} />
            <ResultBlock title="Perfil - Reporta a" content={result.output.perfil.reporta_a} />
            <ResultBlock title="Anuncio formal" content={result.output.anuncio.formal} />
            <ResultBlock title="Anuncio atractivo" content={result.output.anuncio.atractivo} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 60);
}

function InputField({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm text-gray-700">
      <span className="mb-1 block font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none ring-blue-200 focus:ring"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm text-gray-700">
      <span className="mb-1 block font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        className="min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 outline-none ring-blue-200 focus:ring"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
    </label>
  );
}

function ResultBlock({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}