import { Building2, Files, Sparkles } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-[#0F1117] px-6 py-6 md:px-8">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#C9A24D]">
            Settings
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Configuración de la empresa
              </h1>
              <p className="max-w-3xl text-sm text-white/60">
                Administra la información institucional, el contexto base del tenant
                y la documentación estructural que alimentará otros módulos del sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="rounded-3xl border border-white/10 bg-[#0F1117] p-6 md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Building2 className="h-5 w-5 text-[#C9A24D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Company Profile</h2>
            <p className="mt-1 text-sm text-white/60">
              Datos institucionales base de la empresa. Esta información será utilizada
              por el assessment, la contextualización IA y futuros benchmarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Razón Social" value="No configurado" />
          <Field label="RUC" value="No configurado" />
          <Field label="Fecha de Constitución" value="No configurado" />
          <Field label="Correo Dirección" value="No configurado" />
          <Field label="Teléfono Dirección" value="No configurado" />
          <Field label="Ubicación" value="No configurado" />
          <Field label="Calle" value="No configurado" />
          <Field label="Número" value="No configurado" />
          <Field label="Piso" value="No configurado" />
          <Field label="Oficina" value="No configurado" />
          <Field label="Holding" value="No configurado" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-2xl border border-[#C9A24D]/30 bg-[#C9A24D]/10 px-4 py-2 text-sm font-medium text-[#E7C980] transition hover:bg-[#C9A24D]/15">
            Editar perfil
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
            Guardar cambios
          </button>
        </div>
      </section>

      {/* Company Documents */}
      <section className="rounded-3xl border border-white/10 bg-[#0F1117] p-6 md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Files className="h-5 w-5 text-[#C9A24D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Company Documents</h2>
            <p className="mt-1 text-sm text-white/60">
              Documentación estructural de la empresa. Esta sección será la base del
              repositorio institucional y servirá de fuente para evidencia futura.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatusRow label="Organigrama" status="Pendiente" />
          <StatusRow label="Acta de Constitución" status="Pendiente" />
          <StatusRow label="Última Acta de Asamblea" status="Pendiente" />
          <StatusRow label="Memorias del Directorio" status="Pendiente" />
          <StatusRow label="Otros Documentos" status="Pendiente" />
        </div>
      </section>

      {/* Assessment Context */}
      <section className="rounded-3xl border border-white/10 bg-[#0F1117] p-6 md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Sparkles className="h-5 w-5 text-[#C9A24D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Assessment Context</h2>
            <p className="mt-1 text-sm text-white/60">
              Variables contextuales que permitirán personalizar el diagnóstico,
              enriquecer prompts y mejorar la lectura del negocio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Industria / Segmento" value="No configurado" />
          <Field label="Tipo de negocio" value="No configurado" />
          <Field label="Tamaño de empresa" value="No configurado" />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 text-sm font-medium text-white/85">{value}</p>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-white/85">{label}</span>
      <span className="rounded-full border border-[#C9A24D]/20 bg-[#C9A24D]/10 px-3 py-1 text-xs font-medium text-[#E7C980]">
        {status}
      </span>
    </div>
  );
}