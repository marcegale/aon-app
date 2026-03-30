"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";

export default function ResultadoClient() {
  const searchParams = useSearchParams();
  const diagnostico = searchParams.get("data");

  const descargarPDF = () => {
    const doc = new jsPDF();

    const margenIzquierdo = 20;
    const margenSuperior = 20;
    const anchoTexto = 170;
    const altoPagina = doc.internal.pageSize.height;
    const margenInferior = 20;
    const saltoLinea = 7;

    let y = margenSuperior;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Diagnóstico AON", margenIzquierdo, y);

    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const texto = diagnostico || "No hay diagnóstico disponible.";
    const lineas = doc.splitTextToSize(texto, anchoTexto);

    for (const linea of lineas) {
      if (y > altoPagina - margenInferior) {
        doc.addPage();
        y = margenSuperior;
      }

      doc.text(linea, margenIzquierdo, y);
      y += saltoLinea;
    }

    y += 10;

    const disclaimer =
      "Disclaimer: Este diagnóstico es una lectura inicial automatizada. Always On no se responsabiliza por decisiones o ejecuciones realizadas sin supervisión profesional de nuestro equipo. En casos puntuales, la IA puede generar interpretaciones inexactas. Recomendamos validar este diagnóstico antes de implementar cualquier plan de acción.";

    const lineasDisclaimer = doc.splitTextToSize(disclaimer, anchoTexto);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    for (const linea of lineasDisclaimer) {
      if (y > altoPagina - margenInferior) {
        doc.addPage();
        y = margenSuperior;
      }

      doc.text(linea, margenIzquierdo, y);
      y += 5;
    }

    doc.save("diagnostico.pdf");
  };

  return (
    <main className="min-h-screen bg-[#00003C]">
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 lg:py-16">
        <div className="mb-10">
          <div className="mb-6">
            <Image
              src="/logo-aon.png"
              alt="AON"
              width={64}
              height={64}
              className="h-14 w-14 object-contain md:h-16 md:w-16"
              priority
            />
          </div>

          <div className="inline-flex rounded-full border border-[#E2AB6D]/30 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#FDF6CB]/85">
            AON · Diagnóstico Estratégico
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#FDF6CB] md:text-5xl">
            Diagnóstico inicial
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#FDF6CB]/75 md:text-lg">
            Esta es una lectura inicial automatizada de la situación actual de tu
            empresa, con foco en prioridades, riesgos y acciones inmediatas.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#E2AB6D]/25 bg-[#FFFDF7] p-6 shadow-2xl shadow-black/20 md:p-8 lg:p-10">
          <div className="border-b border-[#E2AB6D]/15 pb-6">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#B07A45]">
              Resultado generado por AON
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#00003C]">
              Lectura estratégica inicial
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B4F6B]">
              Te recomendamos tomar este resultado como una primera lectura ejecutiva
              para ordenar prioridades antes de avanzar a una validación más profunda.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[#E2AB6D]/15 bg-white p-6 md:p-8">
            <div className="whitespace-pre-wrap text-[15px] leading-8 text-[#1E2340]">
              {diagnostico || "No hay diagnóstico disponible."}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#E2AB6D]/15 bg-[#FDF6CB]/20 p-4">
            <p className="text-xs leading-6 text-[#5A5F79]">
              <strong className="text-[#00003C]">Disclaimer:</strong> Este
              diagnóstico es una lectura inicial automatizada. Always On no se
              responsabiliza por decisiones o ejecuciones realizadas sin supervisión
              profesional de nuestro equipo. En casos puntuales, la IA puede generar
              interpretaciones inexactas. Recomendamos validar este diagnóstico antes
              de implementar cualquier plan de acción.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <a
              href="https://alwayson.com.py/#contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#00003C] px-6 py-3.5 text-center text-sm font-semibold text-[#FDF6CB] transition hover:bg-[#0A0A52] md:w-auto"
            >
              Validar diagnóstico con nuestro equipo
            </a>

            <button
              onClick={descargarPDF}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#00003C] px-6 py-3.5 text-sm font-semibold text-[#00003C] transition hover:bg-[#00003C] hover:text-[#FDF6CB] md:w-auto"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-[#E2AB6D] px-6 py-3.5 text-center text-sm font-semibold text-[#00003C] transition hover:opacity-90"
          >
            Volver al inicio
          </a>

          <a
            href="/diagnostico"
            className="inline-flex items-center justify-center rounded-2xl border border-[#E2AB6D] px-6 py-3.5 text-center text-sm font-semibold text-[#FDF6CB] transition hover:bg-[#E2AB6D] hover:text-[#00003C]"
          >
            Hacer otro diagnóstico
          </a>
        </div>
      </section>
    </main>
  );
}