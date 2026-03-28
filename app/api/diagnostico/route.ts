import { NextResponse } from "next/server";
import OpenAI from "openai";
import { enviarDiagnosticoEmail } from "@/app/lib/email";
import { validarTurnstile } from "@/app/lib/turnstile";
import { prisma } from "@/app/lib/prisma";

function getOpenAIClient() {
  console.log("ENV KEYS:", Object.keys(process.env));
  console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

function calcularLeadScore(data: {
  email: string;
  rubro?: string;
  empleados?: string;
  problema: string;
  objetivo: string;
}) {
  let score = 0;

  if (data.rubro?.trim()) score += 10;
  if (data.empleados?.trim()) score += 10;

  const empleadosNum = Number(data.empleados || "0");
  if (empleadosNum >= 10) score += 15;
  if (empleadosNum >= 50) score += 10;

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nombre,
      empresa,
      email,
      rubro,
      empleados,
      problema,
      objetivo,
      turnstileToken,
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
        {
          ok: false,
          message: "No se pudo validar la verificación humana.",
        },
        { status: 400 }
      );
    }

    if (!nombre || !empresa || !email || !problema || !objetivo) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const prompt = `
Eres un consultor estratégico de negocios.

Analiza esta empresa:

Empresa: ${empresa}
Rubro: ${rubro || "No especificado"}
Empleados: ${empleados || "No especificado"}
Problema: ${problema}
Objetivo: ${objetivo}

Devuelve exactamente con esta estructura:

1. Resumen ejecutivo
2. 3 problemas raíz
3. 3 riesgos
4. 3 quick wins
5. Plan de 30 días
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
      problema,
      objetivo,
    });

    let emailStatus: "sent" | "failed" | "not_attempted" = "not_attempted";
let emailError: string | null = null;

    await prisma.lead.create({
      data: {
        nombre,
        empresa,
        email,
        rubro: rubro || null,
        empleados: empleados || null,
        problema,
        objetivo,
        diagnostico,
        leadScore: leadScore.score,
        leadLevel: leadScore.nivel,
        emailStatus,
        emailError,
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