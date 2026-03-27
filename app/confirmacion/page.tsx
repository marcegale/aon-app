export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-[#0B0D12] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
        Solicitud recibida
      </h1>

      <p className="text-gray-400 text-center max-w-xl mb-8">
        Gracias. AON ya está procesando tu diagnóstico inicial. Revisa tu correo en unos minutos.
      </p>

      <a
        href="/"
        className="bg-[#C9A24D] text-black px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
      >
        Volver al inicio
      </a>
    </main>
  );
}