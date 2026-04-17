"use client";

import clsx from "clsx";
import { HelpCircle } from "lucide-react";
import { DiagnosticQuestion, QuestionAnswer } from "@/app/lib/diagnostico/types";

type Props = {
  question: DiagnosticQuestion;
  answer?: QuestionAnswer;
  onChange: (next: QuestionAnswer) => void;
  onFocusClick?: (question: DiagnosticQuestion) => void;
};

const scaleValues = [1, 2, 3, 4, 5] as const;

export function QuestionCard({ question, answer, onChange, onFocusClick }: Props) {
  const applicable = answer?.applicable ?? true;

  const update = (patch: Partial<QuestionAnswer>) => {
    onChange({
      questionId: question.id,
      applicable,
      evidenceIds: answer?.evidenceIds ?? [],
      notes: answer?.notes ?? "",
      ...answer,
      ...patch,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-[#C9A24D]/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C9A24D]">
                {question.weight} pts
              </span>
            </div>
            <h3 className="text-sm font-semibold leading-6 text-white">
              {question.title}
            </h3>
            {question.description ? (
              <p className="mt-1 text-sm text-white/55">{question.description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onFocusClick?.(question)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-[#C9A24D]/40 hover:bg-[#C9A24D]/10 hover:text-[#C9A24D]"
            aria-label="Explicación contextual"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {question.allowNotApplicable ? (
          <label className="flex items-center gap-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={!applicable}
              onChange={(e) => update({ applicable: !e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-[#C9A24D] focus:ring-[#C9A24D]"
            />
            No aplica
          </label>
        ) : null}

        <div className={clsx(!applicable && "pointer-events-none opacity-40")}>
          {question.type === "scale" ? (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-white/45">
                <span>{question.scaleMinLabel ?? "Bajo"}</span>
                <span>{question.scaleMaxLabel ?? "Alto"}</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {scaleValues.map((value) => {
                  const selected = answer?.scaleValue === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update({ scaleValue: value })}
                      className={clsx(
                        "h-12 rounded-xl border text-sm font-medium transition",
                        selected
                          ? "border-[#C9A24D] bg-[#C9A24D]/15 text-[#F4E7C1]"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {question.type === "multiple" && question.choices ? (
            <div className="space-y-2">
              {question.choices.map((choice) => {
                const selected = answer?.choiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => update({ choiceId: choice.id })}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                      selected
                        ? "border-[#C9A24D] bg-[#C9A24D]/15 text-[#F4E7C1]"
                        : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20 hover:bg-white/[0.06]",
                    )}
                  >
                    <span className="text-sm">{choice.label}</span>
                    <span className="text-xs text-white/45">{choice.points} pts base</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {question.evidence?.length ? (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Evidencia
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {question.evidence.map((item) => {
                  const checked = answer?.evidenceIds?.includes(item.id) ?? false;

                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-white/75"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = new Set(answer?.evidenceIds ?? []);
                          if (e.target.checked) current.add(item.id);
                          else current.delete(item.id);
                          update({ evidenceIds: Array.from(current) });
                        }}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-[#C9A24D] focus:ring-[#C9A24D]"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {question.hasNotes ? (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Notas
              </p>
              <textarea
                value={answer?.notes ?? ""}
                onChange={(e) => update({ notes: e.target.value })}
                rows={4}
                placeholder="Añade contexto breve si hace falta..."
                className="w-full rounded-xl border border-white/10 bg-[#0F1420] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#C9A24D]/50"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}