import PDFDocument from "pdfkit";

export async function POST(request: Request) {
  try {
    const { diagnostico } = await request.json();

    if (!diagnostico) {
      return Response.json(
        { ok: false, message: "No hay diagnóstico para generar PDF." },
        { status: 400 }
      );
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", (err: Error) => {
        reject(err);
      });

      doc.fontSize(22).text("Diagnóstico AON", {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(12).text(String(diagnostico), {
        align: "left",
      });

      doc.end();
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="diagnostico.pdf"',
      },
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);

    return Response.json(
      { ok: false, message: "No se pudo generar el PDF." },
      { status: 500 }
    );
  }
}