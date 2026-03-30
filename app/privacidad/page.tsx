export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#00003C] px-6 py-12 text-[#FDF6CB]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-8 text-[#00003C] shadow-2xl shadow-black/20 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#B07A45]">
          AON
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4B4F6B]">
          Última actualización: {new Date().toLocaleDateString("es-PY")}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#1E2340]">
          <section>
            <h2 className="text-lg font-semibold">1. Información recopilada</h2>
            <p className="mt-2">
              Recopilamos la información proporcionada voluntariamente por el
              usuario a través del formulario, incluyendo nombre, empresa,
              correo electrónico y datos relacionados con su negocio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Finalidad del tratamiento</h2>
            <p className="mt-2">
              La información es utilizada para generar el diagnóstico solicitado,
              mejorar el servicio, y eventualmente contactar al usuario con
              propuestas o seguimiento relacionado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Uso de inteligencia artificial</h2>
            <p className="mt-2">
              El diagnóstico es generado mediante sistemas automatizados de
              inteligencia artificial. La información ingresada puede ser
              procesada por dichos sistemas con el único fin de generar el
              resultado solicitado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Confidencialidad</h2>
            <p className="mt-2">
              Nos comprometemos a tratar la información del usuario de manera
              confidencial y a no compartirla con terceros sin consentimiento,
              salvo obligación legal o necesidad técnica para la prestación del
              servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Seguridad</h2>
            <p className="mt-2">
              Implementamos medidas razonables de seguridad para proteger los
              datos, aunque el usuario reconoce que ningún sistema es
              completamente seguro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Derechos del usuario</h2>
            <p className="mt-2">
              El usuario puede solicitar la actualización, corrección o
              eliminación de sus datos contactando a Always On a través de los
              canales oficiales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Aceptación</h2>
            <p className="mt-2">
              Al utilizar este servicio, el usuario acepta esta Política de
              Privacidad y el tratamiento de sus datos conforme a lo aquí
              establecido.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}