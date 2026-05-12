export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#00003C] px-6 py-12 text-[#FDF6CB]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-8 text-[#00003C] shadow-2xl shadow-black/20 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#B07A45]">
          AON App
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Terminos de Servicio
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4B4F6B]">
          Ultima actualizacion: 12 de mayo de 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#1E2340]">
          <section>
            <h2 className="text-lg font-semibold">1. Descripcion del servicio</h2>
            <p className="mt-2">
              AON App es una plataforma de automatizacion operativa y
              reclutamiento que permite crear busquedas, conectar fuentes de
              postulaciones, procesar CVs, organizar candidatos, generar analisis
              asistidos por inteligencia artificial y apoyar el seguimiento del
              pipeline de seleccion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Responsabilidades del usuario</h2>
            <p className="mt-2">
              El usuario es responsable de proporcionar informacion correcta,
              contar con autorizacion para tratar datos de candidatos, revisar
              los resultados generados por la plataforma y cumplir con las leyes
              laborales, de privacidad y de proteccion de datos aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Datos de reclutamiento</h2>
            <p className="mt-2">
              AON App puede procesar datos de candidatos, CVs, evaluaciones,
              notas de reclutadores, resultados de entrevistas y otros datos
              relacionados con procesos de seleccion. El usuario debe asegurarse
              de que el uso de estos datos sea legitimo y adecuado para su
              organizacion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Resultados y decisiones</h2>
            <p className="mt-2">
              Los analisis, rankings, recomendaciones y automatizaciones de AON
              App son herramientas de apoyo. AON App no garantiza la contratacion
              de candidatos, la calidad final de una decision de seleccion ni
              resultados laborales especificos. Las decisiones finales deben ser
              revisadas y tomadas por personas autorizadas por la organizacion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Uso aceptable</h2>
            <p className="mt-2">
              El usuario no debe usar AON App para actividades ilegales,
              discriminatorias, invasivas, abusivas, fraudulentas o contrarias a
              derechos de terceros. Tambien queda prohibido intentar acceder a
              datos de otros tenants, eludir controles de seguridad o usar la
              plataforma para fines distintos a los autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Servicios de terceros</h2>
            <p className="mt-2">
              Algunas funciones pueden depender de servicios externos, como
              Google OAuth, Gmail, almacenamiento, proveedores de email,
              calendarios o modelos de inteligencia artificial. La disponibilidad
              de estas funciones puede depender de la configuracion y politicas
              de dichos proveedores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Limitacion de responsabilidad</h2>
            <p className="mt-2">
              En la maxima medida permitida por la ley, AON App no sera
              responsable por danos indirectos, perdida de oportunidades,
              decisiones de contratacion, interrupciones de servicio, errores en
              datos provistos por usuarios o resultados derivados de informacion
              incompleta, inexacta o no revisada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Cambios en los terminos</h2>
            <p className="mt-2">
              Podemos actualizar estos Terminos de Servicio para reflejar cambios
              operativos, legales o tecnicos. La version publicada en esta pagina
              sera la version vigente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Contacto</h2>
            <p className="mt-2">
              Para consultas sobre estos Terminos de Servicio, contactar a{" "}
              <a className="font-semibold text-[#B07A45]" href="mailto:hola.aon@gmail.com">
                hola.aon@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
