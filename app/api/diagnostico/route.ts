import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta id" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        diagnosticoResumen: true,
        diagnostico: true,
        isUnlocked: true,
        nombre: true,
        email: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("GET /api/diagnostico error:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      rubro,
      empleados,
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

    if (!problema || !objetivo) {
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

    const prompt = `
Eres un consultor estratégico de negocios.

Analiza esta empresa:

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
`;

    const client = getOpenAIClient();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const diagnostico = response.output_text;

    const resumen = diagnostico.split("\n").slice(0, 5).join("\n");

    const leadScore = calcularLeadScore({
      email: "temp@email.com",
      rubro,
      empleados,
      facturacionAnual,
      problema,
      objetivo,
    });

    const lead = await prisma.lead.create({
      data: {
        nombre: "Pendiente",
        empresa: "Pendiente",
        email: "pendiente@alwayson.local",
        codigoPais: "+595",
        telefono: "000000000",
        telefonoCompleto: "+595000000000",

        rubro: rubro || null,
        empleados: empleados || null,
        facturacionAnual: facturacionAnual || null,
        problema,
        objetivo,
        diagnostico,
        diagnosticoResumen: resumen,
        leadScore: leadScore.score,
        leadLevel: leadScore.nivel,
        aceptaTerminos: true,
        fechaAceptacion: new Date(),
        humanVerified: true,
        isUnlocked: false,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      id: lead.id,
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