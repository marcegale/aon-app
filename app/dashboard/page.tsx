export default function DashboardPage() {
  const kpis = [
    { label: "Conversaciones hoy", value: "184", delta: "+12%" },
    { label: "Leads calificados", value: "27", delta: "+8%" },
    { label: "Derivadas a humano", value: "14", delta: "-3%" },
    { label: "Tasa de resolución", value: "91%", delta: "+5%" },
  ];

  const inbox = [
    {
      name: "María González",
      phone: "+595 981 000 221",
      status: "Activa",
      preview: "Hola, quisiera saber si tienen stock del modelo ejecutivo...",
      time: "Hace 2 min",
    },
    {
      name: "Carlos Benítez",
      phone: "+595 972 144 882",
      status: "Humano",
      preview: "Necesito confirmar el precio final con entrega incluida.",
      time: "Hace 8 min",
    },
    {
      name: "Lucía Fernández",
      phone: "+595 985 211 540",
      status: "Resuelta",
      preview: "Perfecto, entonces realizo el pago esta tarde.",
      time: "Hace 21 min",
    },
    {
      name: "Empresa Delta S.A.",
      phone: "+595 971 322 100",
      status: "Activa",
      preview: "¿Pueden enviarme catálogo y condiciones comerciales?",
      time: "Hace 34 min",
    },
  ];

  const chartBars = [56, 74, 68, 92, 84, 116, 128, 122, 144, 138, 156, 172];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-white/10 bg-[#0E1118] px-5 py-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#C9A24D]">Always On</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nexa Core</h1>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#C9A24D]/30 bg-[#1C2230] text-sm text-[#C9A24D] shadow-lg shadow-black/20">
              AI
            </div>
          </div>

          <nav className="space-y-2">
            {[
              "Inicio",
              "Inbox",
              "Agente",
              "Conocimiento",
              "Catálogo",
              "Automatizaciones",
              "Analítica",
              "Configuración",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 text-sm transition ${
                  index === 0
                    ? "border border-white/10 bg-[#1C2230] text-white shadow-md shadow-black/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-[#C9A24D]/20 bg-gradient-to-b from-[#1C2230] to-[#141923] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#C9A24D]">Estado del sistema</p>
            <p className="mt-3 text-sm text-white/80">
              Agente principal activo y atendiendo conversaciones en tiempo real.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#C9A24D]" />
              <span className="text-sm text-white">Operativo</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-8 py-7">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/40">Tenant Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Panel de control</h2>
              <p className="mt-2 text-sm text-white/55">
                Controlá conversaciones, rendimiento y reglas de tu agente IA desde un solo lugar.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#141923] px-4 py-3 text-sm text-white/70">
                Últimos 30 días
              </div>
              <div className="rounded-2xl border border-[#C9A24D]/30 bg-[#C9A24D]/10 px-4 py-3 text-sm text-[#F0D79C]">
                Tenant: Demo Corp
              </div>
            </div>
          </header>

          <section className="grid grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-3xl border border-white/10 bg-[#1C2230] p-5 shadow-xl shadow-black/20"
              >
                <p className="text-sm text-white/55">{kpi.label}</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight">{kpi.value}</span>
                  <span className="rounded-full bg-[#C9A24D]/10 px-3 py-1 text-xs text-[#E6C676]">
                    {kpi.delta}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#1C2230] p-6 shadow-xl shadow-black/20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-white/35">Rendimiento</p>
                    <h3 className="mt-2 text-xl font-semibold">Crecimiento de interacción</h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                    Conversaciones / semana
                  </div>
                </div>

                <div className="flex h-72 items-end gap-3 rounded-3xl bg-[#121722] p-5">
                  {chartBars.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center justify-end gap-3">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-[#C9A24D]/70 to-[#E6C676] shadow-lg"
                        style={{ height: `${h}px` }}
                      />
                      <span className="text-xs text-white/35">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-[28px] border border-white/10 bg-[#1C2230] p-6">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/35">Agente</p>
                  <h3 className="mt-2 text-xl font-semibold">Resumen operativo</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      ["Tono configurado", "Profesional y cercano"],
                      ["Regla crítica", "Escalar reclamos sensibles"],
                      ["Horario activo", "08:00 – 22:00"],
                      ["Idioma principal", "Español"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span className="text-sm text-white/55">{k}</span>
                        <span className="text-sm text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#1C2230] p-6">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/35">Embudo</p>
                  <h3 className="mt-2 text-xl font-semibold">Conversión comercial</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      ["Consultas", "320", "w-full"],
                      ["Interesados", "148", "w-4/5"],
                      ["Cotizaciones", "59", "w-3/5"],
                      ["Cierres", "27", "w-2/5"],
                    ].map(([label, value, width]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-white/60">{label}</span>
                          <span className="text-white">{value}</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/10">
                          <div className={`h-3 rounded-full bg-[#C9A24D] ${width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#1C2230] p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-white/35">Inbox</p>
                    <h3 className="mt-2 text-xl font-semibold">Conversaciones recientes</h3>
                  </div>
                  <div className="rounded-full bg-[#C9A24D]/10 px-3 py-1 text-xs text-[#E6C676]">En vivo</div>
                </div>

                <div className="mt-5 space-y-3">
                  {inbox.map((item) => (
                    <div key={item.name} className="rounded-2xl border border-white/6 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-white/35">{item.phone}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] ${
                            item.status === "Activa"
                              ? "bg-[#C9A24D]/10 text-[#E6C676]"
                              : item.status === "Humano"
                              ? "bg-white/10 text-white/75"
                              : "bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-white/60">{item.preview}</p>
                      <p className="mt-3 text-xs text-white/30">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#1C2230] p-6">
                <p className="text-sm uppercase tracking-[0.22em] text-white/35">Acciones</p>
                <h3 className="mt-2 text-xl font-semibold">Accesos rápidos</h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["Editar reglas", "Cargar FAQ", "Actualizar catálogo", "Conectar CRM"].map((action) => (
                    <button
                      key={action}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white/80 transition hover:bg-white/10"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}