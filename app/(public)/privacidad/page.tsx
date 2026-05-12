export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#00003C] px-6 py-12 text-[#FDF6CB]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-8 text-[#00003C] shadow-2xl shadow-black/20 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#B07A45]">
          AON App
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Politica de Privacidad
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#4B4F6B]">
          Ultima actualizacion: 12 de mayo de 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[#1E2340]">
          <section>
            <h2 className="text-lg font-semibold">1. Descripcion del servicio</h2>
            <p className="mt-2">
              AON App es una plataforma de automatizacion de reclutamiento que
              ayuda a equipos de talento a crear busquedas, monitorear correos
              relacionados con vacantes, procesar CVs y organizar candidatos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Conexion con Google y Gmail</h2>
            <p className="mt-2">
              AON App se conecta a Gmail solo despues de que el usuario otorga
              consentimiento mediante el flujo oficial de Google OAuth. El acceso
              solicitado es de solo lectura para Gmail. AON App no envia emails
              desde la cuenta de Gmail del usuario, no modifica mensajes y no
              elimina correos.
            </p>
            <p className="mt-2">
              El acceso a Gmail se usa para leer emails relacionados con
              reclutamiento y archivos adjuntos de CV que incluyan codigos de
              referencia de busqueda, por ejemplo referencias del tipo REF-XXXX.
              Esta informacion permite asociar postulaciones entrantes con la
              busqueda correcta dentro de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Datos que podemos tratar</h2>
            <p className="mt-2">
              Podemos tratar datos proporcionados por el usuario, datos de
              candidatos, informacion de busquedas laborales, metadatos de email
              relevantes para reclutamiento, asuntos, remitentes, fechas,
              fragmentos de mensajes y archivos adjuntos de CV cuando sean
              necesarios para prestar las funciones de automatizacion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Uso de los datos de Google</h2>
            <p className="mt-2">
              Los datos de usuario obtenidos desde Google se usan exclusivamente
              para proporcionar funciones de automatizacion de reclutamiento,
              como detectar correos de postulacion, leer CVs adjuntos, crear
              candidatos y actualizar el pipeline de la busqueda correspondiente.
            </p>
            <p className="mt-2">
              AON App no vende datos de usuarios de Google. AON App no comparte
              datos de usuarios de Google con terceros para publicidad, venta de
              datos o perfiles comerciales independientes del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Almacenamiento y seguridad</h2>
            <p className="mt-2">
              Aplicamos medidas razonables de seguridad para proteger la
              informacion tratada por la plataforma. Cuando corresponde, los
              tokens de acceso y refresh tokens se almacenan de forma segura y
              cifrada. Los CVs y datos de reclutamiento se conservan para operar
              las funciones solicitadas por el usuario y respetando la
              configuracion disponible en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Revocacion de acceso</h2>
            <p className="mt-2">
              El usuario puede revocar el acceso de AON App desde la seccion de
              permisos de su Cuenta de Google. Al revocar el acceso, AON App deja
              de poder leer nuevos datos de Gmail mediante esa autorizacion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Solicitudes de eliminacion</h2>
            <p className="mt-2">
              Los usuarios pueden solicitar acceso, correccion o eliminacion de
              sus datos contactando a soporte. Para solicitudes relacionadas con
              datos personales o datos conectados desde Google, escribir a{" "}
              <a className="font-semibold text-[#B07A45]" href="mailto:hola.aon@gmail.com">
                hola.aon@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Contacto</h2>
            <p className="mt-2">
              Para consultas sobre esta Politica de Privacidad o sobre el uso de
              datos en AON App, contactar a{" "}
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
