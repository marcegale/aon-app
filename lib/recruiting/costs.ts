const OPENAI_PRICING_PER_1M: Record<string, { input: number; output: number }> = {
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "text-embedding-3-small": { input: 0.02, output: 0 },
};

export function estimateAIUsageCost(input: {
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}) {
  const pricing = OPENAI_PRICING_PER_1M[input.model ?? "gpt-4.1-mini"] ?? OPENAI_PRICING_PER_1M["gpt-4.1-mini"];
  const inputCost = ((input.inputTokens ?? 0) / 1_000_000) * pricing.input;
  const outputCost = ((input.outputTokens ?? 0) / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}

export function computeCostPerHire(input: { aiCost: number; hiredCount: number }) {
  if (input.hiredCount <= 0) return null;
  return Math.round((input.aiCost / input.hiredCount) * 100) / 100;
}

export function computeAutomationSavings(input: {
  automatedActions: number;
  minutesSavedPerAction?: number;
  hourlyCost?: number;
}) {
  const minutes = input.automatedActions * (input.minutesSavedPerAction ?? 8);
  const hourlyCost = input.hourlyCost ?? 40;
  return {
    minutesSaved: minutes,
    estimatedSavings: Math.round((minutes / 60) * hourlyCost * 100) / 100,
  };
}
