export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#00003C] px-6 py-12 text-[#FDF6CB]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-8 text-[#00003C] shadow-2xl shadow-black/20 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#B07A45]">
          AON
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Términos y Condiciones
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4B4F6B]">
          Última actualización: {new Date().toLocaleDateString("es-PY")}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#1E2340]">
          <section>
            <h2 className="text-lg font-semibold">1. Objeto</h2>
            <p className="mt-2">
              AON ofrece una herramienta de diagnóstico estratégico inicial de
              carácter automatizado, destinada a brindar una lectura preliminar
              sobre la situación general de una empresa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Naturaleza del servicio</h2>
            <p className="mt-2">
              El diagnóstico generado por AON tiene carácter informativo y
              orientativo. No constituye asesoramiento profesional definitivo,
              auditoría, dictamen técnico, ni reemplaza una consultoría
              personalizada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Uso de la información</h2>
            <p className="mt-2">
              El usuario declara que la información proporcionada es veraz y
              suficiente para generar el diagnóstico inicial. AON no se
              responsabiliza por conclusiones afectadas por datos incompletos,
              inexactos o engañosos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Limitación de responsabilidad</h2>
            <p className="mt-2">
              El usuario acepta que cualquier decisión tomada con base en el
              diagnóstico será de su exclusiva responsabilidad. AON no garantiza
              resultados específicos ni asume responsabilidad por pérdidas,
              daños, omisiones o decisiones empresariales adoptadas sin
              validación profesional adicional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Propiedad intelectual</h2>
            <p className="mt-2">
              Los contenidos, estructura, metodología, diseño y textos del
              sistema AON son propiedad de Always On o se utilizan con debida
              autorización. Su reproducción o uso no autorizado queda prohibido.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Contacto posterior</h2>
            <p className="mt-2">
              El usuario autoriza a Always On a contactarlo en relación con el
              diagnóstico solicitado, seguimiento comercial y eventual propuesta
              de servicios vinculados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Aceptación</h2>
            <p className="mt-2">
              Al enviar el formulario, el usuario declara haber leído y aceptado
              estos Términos y Condiciones, así como la Política de Privacidad
              aplicable.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}