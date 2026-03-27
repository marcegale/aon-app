export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0D12] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
        Diagnostica tu empresa con AON
      </h1>

      <p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mb-8">
        Recibe un diagnóstico inicial automatizado y un plan de acción ejecutivo directamente en tu correo.
      </p>

      <div className="text-gray-400 text-center mb-10 space-y-2">
        <p>• Identifica problemas raíz</p>
        <p>• Detecta riesgos visibles</p>
        <p>• Obtén quick wins accionables</p>
        <p>• Recibe un plan de 30 días</p>
      </div>

      <a href="/diagnostico">
        <button className="bg-[#C9A24D] text-black px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition">
        Iniciar diagnóstico
        </button>
      </a>

      <p className="text-sm text-gray-500 mt-6">
        Tiempo estimado: 3 minutos
      </p>
    </main>
  );
}