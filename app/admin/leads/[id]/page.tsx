import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { updateLeadStatus, updateLeadNotes } from "./server-actions";

const ESTADOS = [
  "Nuevo",
  "Contactado",
  "En conversación",
  "Calificado",
  "Cerrado ganado",
  "Cerrado perdido",
];

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <a href="/admin/leads" className="text-sm text-neutral-400 underline">
            ← Volver a leads
          </a>
          <h1 className="mt-3 text-3xl font-semibold">{lead.empresa}</h1>
          <p className="text-neutral-400">{lead.nombre}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-medium">Datos del lead</h2>
            <p>
              <strong>Email:</strong> {lead.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {lead.telefono || "-"}
            </p>
            <p>
              <strong>Rubro:</strong> {lead.rubro}
            </p>
            <p>
              <strong>Empleados:</strong> {lead.empleados}
            </p>
            <p>
              <strong>Facturación:</strong> {lead.facturacion || "-"}
            </p>
            <p>
              <strong>Score:</strong> {lead.leadScore}
            </p>
            <p>
              <strong>Nivel:</strong> {lead.leadLevel}
            </p>
            <p>
              <strong>Estado:</strong> {lead.estadoComercial}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-medium">Gestión comercial</h2>

            <form action={updateLeadStatus} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <select
                name="estadoComercial"
                defaultValue={lead.estadoComercial}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
              >
                Guardar estado
              </button>
            </form>

            <form action={updateLeadNotes} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <textarea
                name="notasInternas"
                defaultValue={lead.notasInternas || ""}
                rows={6}
                placeholder="Notas internas..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-xl border border-neutral-700 px-4 py-3 text-sm font-medium"
              >
                Guardar notas
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-2 text-lg font-medium">Problema detectado</h2>
          <p className="whitespace-pre-wrap text-neutral-300">{lead.problema}</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-2 text-lg font-medium">Objetivo declarado</h2>
          <p className="whitespace-pre-wrap text-neutral-300">{lead.objetivo}</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-2 text-lg font-medium">Diagnóstico generado</h2>
          <div className="whitespace-pre-wrap leading-7 text-neutral-300">
            {lead.diagnostico}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="mb-2 text-lg font-medium">Legal</h2>
          <p>
            <strong>Aceptó términos:</strong> {lead.aceptaTerminos ? "Sí" : "No"}
          </p>
          <p>
            <strong>Fecha de aceptación:</strong>{" "}
            {lead.fechaAceptacion
              ? new Date(lead.fechaAceptacion).toLocaleString("es-PY")
              : "-"}
          </p>
        </div>
      </div>
    </main>
  );
}