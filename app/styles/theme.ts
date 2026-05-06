// ─── Brand primitives ────────────────────────────────────────────────────────

export const brand = {
  forest:     "#183A37",
  sand:       "#F4EBD0",
  terracotta: "#C96F3B",
} as const;

// RGB channel strings for rgba() composition
const sandRgb       = "244, 235, 208";   // #F4EBD0
const terracottaRgb = "201, 111, 59";    // #C96F3B

// ─── Theme tokens ─────────────────────────────────────────────────────────────

export const theme = {
  /** Platform / customer-facing context (forest base) */
  bg:           brand.forest,
  surface:      `rgba(${sandRgb}, 0.06)`,
  surfaceMuted: `rgba(${sandRgb}, 0.03)`,
  text:         brand.sand,
  textMuted:    `rgba(${sandRgb}, 0.55)`,
  accent:       brand.terracotta,
  accentSubtle: `rgba(${terracottaRgb}, 0.12)`,
  border:       `rgba(${sandRgb}, 0.12)`,

  /** Admin / internal tooling context (dark neutral base) */
  admin: {
    bg:           "#0B0D12",
    surface:      `rgba(${sandRgb}, 0.06)`,
    surfaceMuted: `rgba(${sandRgb}, 0.03)`,
    text:         brand.sand,
    textMuted:    `rgba(${sandRgb}, 0.55)`,
    accent:       brand.terracotta,
    border:       `rgba(${sandRgb}, 0.12)`,
  },
} as const;

// ─── Status (semantic, Tailwind class names) ─────────────────────────────────

export const status = {
  success: {
    text:   "text-emerald-300",
    bg:     "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  error: {
    text:   "text-red-300",
    bg:     "bg-red-500/10",
    border: "border-red-500/20",
  },
  warning: {
    text:   "text-amber-300",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  info: {
    text:   "text-sky-300",
    bg:     "bg-sky-500/10",
    border: "border-sky-500/20",
  },
} as const;
