const REF_PATTERN = /\bREF-[A-Z0-9]{4,12}\b/i;

export function extractRecruitingRef(...values: Array<string | null | undefined>) {
  const source = values.filter(Boolean).join(" ");
  const match = source.match(REF_PATTERN);
  return match?.[0]?.toUpperCase() ?? null;
}
