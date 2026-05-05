import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRecruitingOutputs(input: {
  title: string;
  requestText: string;
}) {
  const prompt = `
Actúa como experto en reclutamiento.

Puesto: ${input.title}
Descripción del pedido: ${input.requestText}

Genera en JSON:
- jobProfile
- idealCandidate
- scoringCriteria
- copies (linkedin, instagram, email)
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  return response.output[0]?.content?.[0]?.text || "{}";
}
