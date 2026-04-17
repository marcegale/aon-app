import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, blockTitle } = await req.json();

    const prompt = `
Explica esta pregunta de diagnóstico empresarial de forma clara y ejecutiva.

Bloque: ${blockTitle}
Pregunta: ${question}

Devuelve:
1. Qué significa realmente la pregunta
2. Por qué es importante
3. Cómo debería responder una empresa bien gestionada
4. Ejemplo concreto

Sé breve, claro y profesional.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content || "No se pudo generar la explicación.";

    return NextResponse.json({ ok: true, text });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Error generando explicación" },
      { status: 500 }
    );
  }
}