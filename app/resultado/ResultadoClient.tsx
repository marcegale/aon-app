"use client";

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
    <main className="min-h-screen bg-[#0B0D12] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C9A24D] mb-3">
            AON
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Diagnóstico inicial
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Esta es una lectura inicial automatizada de la situación actual de tu empresa, con foco en prioridades, riesgos y acciones inmediatas.
          </p>
        </div>

        <div className="bg-[#11161F] border border-[#2A3140] rounded-2xl p-8 shadow-xl">
          <div className="mb-6 pb-6 border-b border-[#2A3140]">
            <h2 className="text-xl font-semibold text-white">
              Resultado generado por AON
            </h2>
          </div>

          <div className="whitespace-pre-wrap text-gray-200 leading-8 text-[15px]">
            {diagnostico || "No hay diagnóstico disponible."}
          </div>

          <div className="mt-6 text-xs text-gray-500 leading-6">
            <p>
              <strong>Disclaimer:</strong> Este diagnóstico es una lectura inicial automatizada. Always On no se responsabiliza por decisiones o ejecuciones realizadas sin supervisión profesional de nuestro equipo. En casos puntuales, la IA puede generar interpretaciones inexactas. Recomendamos validar este diagnóstico antes de implementar cualquier plan de acción.
            </p>
          </div>

          <div className="mt-6">
            <a
              href="https://alwayson.com.py/#contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#C9A24D] text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Validar diagnóstico con nuestro equipo
            </a>
          </div>

          <button
            onClick={descargarPDF}
            className="mt-6 bg-[#C9A24D] text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Descargar PDF
          </button>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <a
            href="/"
            className="bg-[#C9A24D] text-black px-6 py-3 rounded-xl font-semibold text-center hover:opacity-90 transition"
          >
            Volver al inicio
          </a>

          <a
            href="/diagnostico"
            className="border border-[#C9A24D] text-[#C9A24D] px-6 py-3 rounded-xl font-semibold text-center hover:bg-[#C9A24D] hover:text-black transition"
          >
            Hacer otro diagnóstico
          </a>
        </div>
      </div>
    </main>
  );
}