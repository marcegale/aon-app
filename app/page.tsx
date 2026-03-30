import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#00003C]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center md:px-8">
        <div className="mb-6">
          <Image
            src="/logo-aon.png"
            alt="AON"
            width={72}
            height={72}
            className="h-16 w-16 object-contain md:h-20 md:w-20"
            priority
          />
        </div>

        <div className="inline-flex rounded-full border border-[#E2AB6D]/30 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#FDF6CB]/85">
          AON · Diagnóstico Estratégico
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[#FDF6CB] md:text-6xl">
          Diagnostica tu empresa con una lectura estratégica inicial
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#FDF6CB]/75 md:text-xl">
          Recibe un diagnóstico inicial automatizado con foco en estructura,
          prioridades, riesgos visibles y oportunidades de mejora para tu negocio.
        </p>

        <div className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-2">
          <FeatureCard text="Identifica problemas raíz" />
          <FeatureCard text="Detecta riesgos visibles" />
          <FeatureCard text="Obtén quick wins accionables" />
          <FeatureCard text="Recibe un plan inicial de 30 días" />
        </div>

        <div className="mt-10 flex flex-col items-center">
          <a
            href="/diagnostico"
            className="inline-flex items-center justify-center rounded-2xl bg-[#E2AB6D] px-8 py-3.5 text-sm font-semibold text-[#00003C] transition hover:opacity-90"
          >
            Iniciar diagnóstico
          </a>

          <p className="mt-4 text-sm text-[#FDF6CB]/55">
            Tiempo estimado: 3 minutos
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm">
      <p className="text-sm font-medium text-[#FDF6CB]">{text}</p>
    </div>
  );
}