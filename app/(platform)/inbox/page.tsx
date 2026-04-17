"use client";

import { useState } from "react";
import SectionHeader from "../../../components/ui/section-header";

export default function InboxPage() {
  
  const conversations = [
  {
    name: "María González",
    phone: "+595 981 000 221",
    preview: "Hola, quisiera saber si tienen stock del modelo ejecutivo...",
    time: "Hace 2 min",
    status: "Activa",
    agent: "Sales Agent PY",
    channel: "WhatsApp",
    state: "Esperando respuesta",
    messages: [
      { from: "user", text: "Hola, quisiera saber si tienen stock del modelo ejecutivo." },
      { from: "agent", text: "Sí, actualmente tenemos disponibilidad. ¿Te gustaría que te comparta precio y condiciones?" },
      { from: "user", text: "Sí, por favor. También quisiera saber si hacen entregas." },
      { from: "agent", text: "Claro. El precio actual es de Gs. 1.250.000 y contamos con envío dentro del área metropolitana." },
    ],
  },
  {
    name: "Carlos Benítez",
    phone: "+595 972 144 882",
    preview: "Necesito confirmar el precio final con entrega incluida.",
    time: "Hace 8 min",
    status: "Humano",
    agent: "Human Handoff",
    channel: "WhatsApp",
    state: "Tomada por operador",
    messages: [
      { from: "user", text: "Necesito confirmar el precio final con entrega incluida." },
      { from: "agent", text: "Estoy derivando tu consulta a un asesor para confirmar el monto exacto." },
      { from: "user", text: "Perfecto, quedo atento." },
    ],
  },
  {
    name: "Lucía Fernández",
    phone: "+595 985 211 540",
    preview: "Perfecto, entonces realizo el pago esta tarde.",
    time: "Hace 21 min",
    status: "Resuelta",
    agent: "Sales Agent PY",
    channel: "WhatsApp",
    state: "Cierre logrado",
    messages: [
      { from: "agent", text: "Te comparto los datos para realizar el pago." },
      { from: "user", text: "Perfecto, entonces realizo el pago esta tarde." },
      { from: "agent", text: "Excelente. Quedo atento para confirmarte la recepción." },
    ],
  },
  {
    name: "Empresa Delta S.A.",
    phone: "+595 971 322 100",
    preview: "¿Pueden enviarme catálogo y condiciones comerciales?",
    time: "Hace 34 min",
    status: "Activa",
    agent: "B2B Agent",
    channel: "WhatsApp",
    state: "Calificando lead",
    messages: [
      { from: "user", text: "¿Pueden enviarme catálogo y condiciones comerciales?" },
      { from: "agent", text: "Sí. ¿Te gustaría que te comparta nuestro catálogo general o una propuesta para compras corporativas?" },
    ],
  },
];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeConversation = conversations[activeIndex];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Nexa Core"
        title="Inbox"
        description="Supervisa conversaciones, intervenciones humanas y actividad de los agentes."
      />

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 rounded-[28px] border border-white/10 bg-[#1C2230] p-4 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Conversaciones</h3>
            <div className="rounded-full bg-[#C9A24D]/10 px-3 py-1 text-xs text-[#E6C676]">
              24 abiertas
            </div>
          </div>

          <div className="space-y-3">
            {conversations.map((item, index) => (
            <div
              key={item.phone}
              onClick={() => setActiveIndex(index)}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                activeIndex === index
                  ? "border-white/10 bg-white/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10"
              }`}
            >
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

        <div className="xl:col-span-8 rounded-[28px] border border-white/10 bg-[#1C2230] p-6 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/35">Detalle</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{activeConversation.name}</h3>
              <p className="mt-1 text-sm text-white/45">{activeConversation.phone}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10">
                Tomar control
              </button>
              <button className="rounded-2xl border border-[#C9A24D]/30 bg-[#C9A24D]/10 px-4 py-2 text-sm text-[#F0D79C] transition hover:bg-[#C9A24D]/20">
                Derivar
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] bg-[#121722] p-5">
            {activeConversation.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.from === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                  className={`max-w-[70%] px-4 py-3 text-sm ${
                    message.from === "user"
                      ? "rounded-2xl rounded-bl-md bg-white/10 text-white/85"
                      : "rounded-2xl rounded-br-md bg-[#C9A24D]/15 text-[#F5E2AF]"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Agente actual</p>
              <p className="mt-2 text-sm text-white">{activeConversation.agent}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Canal</p>
              <p className="mt-2 text-sm text-white">{activeConversation.channel}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Estado</p>
              <p className="mt-2 text-sm text-white">{activeConversation.state}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}