import { NextResponse } from "next/server";
import OpenAI from "openai";
import { validarTurnstile } from "@/app/lib/turnstile";
import { prisma } from "@/app/lib/prisma";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function calcularLeadScore(data: {
  email: string;
  rubro?: string | null;
  empleados?: string | null;
  facturacionAnual?: string | null;
  problema: string;
  objetivo: string;
}) {
  let score = 0;

  if (data.rubro?.trim()) score += 10;
  if (data.empleados?.trim()) score += 10;
  if (data.facturacionAnual?.trim()) score += 10;

  const empleadosLabel = (data.empleados || "").toLowerCase();

  if (
    empleadosLabel.includes("11 a 30") ||
    empleadosLabel.includes("31 a 60") ||
    empleadosLabel.includes("61 a 100") ||
    empleadosLabel.includes("101 a 500") ||
    empleadosLabel.includes("más de 500")
  ) {
    score += 15;
  }

  if (
    empleadosLabel.includes("61 a 100") ||
    empleadosLabel.includes("101 a 500") ||
    empleadosLabel.includes("más de 500")
  ) {
    score += 10;
  }

  if (data.problema.trim().length > 20) score += 20;
  if (data.objetivo.trim().length > 20) score += 20;

  const email = data.email.toLowerCase();
  const dominiosGenericos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"];
  const dominio = email.split("@")[1] || "";

  if (dominio && !dominiosGenericos.includes(dominio)) {
    score += 15;
  }

  let nivel = "Frío";
  if (score >= 70) nivel = "Caliente";
  else if (score >= 40) nivel = "Medio";

  return { score, nivel };
}

function validarEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const basicRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i;
  if (!basicRegex.test(normalizedEmail)) return false;

  const typoDomains = [".coim", ".comm", ".cpm", ".xom", ".con"];
  const domain = normalizedEmail.split("@")[1] || "";

  if (typoDomains.some((ending) => domain.endsWith(ending))) return false;

  return true;
}

function validarTelefono(telefono?: string) {
  if (!telefono) return true;
  return /^\d+$/.test(telefono);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre,
      empresa,
      email,
      rubro,
      empleados,
      codigoPais,
      telefono,
      facturacionAnual,
      problema,
      objetivo,
      turnstileToken,
      aceptaTerminos,
    } = body;

    if (!turnstileToken) {
      return NextResponse.json(
        { ok: false, message: "Validación humana requerida." },
        { status: 400 }
      );
    }

    const captchaResult = await validarTurnstile(turnstileToken);

    if (!captchaResult.success) {
      return NextResponse.json(
        { ok: false, message: "No se pudo validar la verificación humana." },
        { status: 400 }
      );
    }

    if (!nombre || !empresa || !email || !problema || !objetivo) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    if (!aceptaTerminos) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debes aceptar los términos y la política de privacidad.",
        },
        { status: 400 }
      );
    }

    if (!validarEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "El email ingresado no es válido." },
        { status: 400 }
      );
    }

    if (!validarTelefono(telefono)) {
      return NextResponse.json(
        { ok: false, message: "El teléfono debe contener solo números." },
        { status: 400 }
      );
    }

    const prompt = `
Eres un consultor estratégico de negocios.

Analiza esta empresa:

Empresa: ${empresa}
Rubro: ${rubro || "No especificado"}
Empleados: ${empleados || "No especificado"}
Facturación anual estimada: ${facturacionAnual || "No especificado"}
Problema: ${problema}
Objetivo: ${objetivo}

Devuelve exactamente con esta estructura:

1. Resumen ejecutivo
2. Tres problemas raíz
3. Tres riesgos
4. Tres quick wins
5. Plan de 30 días

Ten en cuenta que al ennumerar la devolución puede existir confusión numérica visual al poner "3. 3 riesgos", entonces utiliza este formato: "3. Tres riesgos".
Para elaborar tu análisis, revisa si la empresa tiene sitio o sitios web, reportes financieros disponibles en línea, redes sociales de la empresa y sus marcas, estructura de equipos en linkedIn o fuentes oficiales.
`;

    const client = getOpenAIClient();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const diagnostico = response.output_text;

    const leadScore = calcularLeadScore({
      email,
      rubro,
      empleados,
      facturacionAnual,
      problema,
      objetivo,
    });

    const emailStatus: "sent" | "failed" | "not_attempted" = "not_attempted";
    const emailError: string | null = null;

    await prisma.lead.create({
      data: {
        nombre,
        empresa,
        email,
        rubro: rubro || null,
        empleados: empleados || null,
        codigoPais: codigoPais || null,
        telefono: telefono || null,
        facturacionAnual: facturacionAnual || null,
        problema,
        objetivo,
        diagnostico,
        leadScore: leadScore.score,
        leadLevel: leadScore.nivel,
        emailStatus,
        emailError,
        aceptaTerminos: true,
        fechaAceptacion: new Date(),
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      diagnostico,
      leadScore: leadScore.score,
      leadLevel: leadScore.nivel,
      emailStatus,
      emailError,
    });
  } catch (error: any) {
    console.error("Error en API /api/diagnostico:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}