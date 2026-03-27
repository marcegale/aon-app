import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EnviarDiagnosticoEmailParams = {
  to: string;
  nombre: string;
  empresa: string;
  diagnostico: string;
};

export async function enviarDiagnosticoEmail(
  params: EnviarDiagnosticoEmailParams
) {
  const { to, nombre, empresa, diagnostico } = params;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Falta la variable RESEND_API_KEY");
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const html = [
    '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 680px; margin: 0 auto; padding: 24px;">',
    "<h2 style=\"margin-bottom: 16px;\">Diagnóstico inicial AON</h2>",
    `<p>Hola ${nombre},</p>`,
    `<p>Gracias por utilizar AON. Te compartimos a continuación el diagnóstico inicial generado para <strong>${empresa}</strong>.</p>`,
    '<div style="margin: 24px 0; padding: 16px; background: #f7f7f7; border-radius: 8px; white-space: pre-wrap;">',
    diagnostico,
    "</div>",
    '<p style="font-size: 12px; color: #666; margin-top: 24px;">',
    "<strong>Disclaimer:</strong> Este diagnóstico es una lectura inicial automatizada. Always On no se responsabiliza por decisiones o ejecuciones realizadas sin supervisión profesional de nuestro equipo. En casos puntuales, la IA puede generar interpretaciones inexactas. Recomendamos validar este diagnóstico antes de implementar cualquier plan de acción.",
    "</p>",
    '<p style="margin-top: 24px;">',
    '<a href="https://alwayson.com.py/#contacto" style="display:inline-block; padding:12px 18px; background:#C9A24D; color:#000; text-decoration:none; border-radius:8px; font-weight:bold;">',
    "Validar diagnóstico con nuestro equipo",
    "</a>",
    "</p>",
    "</div>",
  ].join("");

  const response = await resend.emails.send({
    from,
    to,
    subject: `Tu diagnóstico inicial de AON para ${empresa}`,
    html,
  });

  console.log("Respuesta Resend:", response);

  if ("error" in response && response.error) {
    throw new Error(response.error.message || "Error al enviar email con Resend");
  }

  return response;
}