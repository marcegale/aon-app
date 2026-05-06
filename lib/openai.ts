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

  const message = response.output.find((item) => item.type === "message");
  const textBlock = message?.type === "message" ? message.content?.find((c) => c.type === "output_text") : null;
  return (textBlock?.type === "output_text" ? textBlock.text : null) || "{}";
}
