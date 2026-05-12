"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  order: number;
  category: string;
  question: string;
  answerText: string;
};

export function InterviewForm({
  token,
  questions,
}: {
  token: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((question) => [question.id, question.answerText])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);

  async function saveAnswer(questionId: string) {
    setSaving(questionId);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/interview/${token}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          answerText: answers[questionId] ?? "",
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar la respuesta.");
      }

      setMessage("Respuesta guardada.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setSaving(null);
    }
  }

  async function completeInterview() {
    setCompleting(true);
    setError(null);
    setMessage("Evaluando entrevista...");

    try {
      for (const question of questions) {
        await saveAnswer(question.id);
      }

      const response = await fetch(`/api/interview/${token}/complete`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo completar la entrevista.");
      }

      setMessage("Entrevista completada.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setCompleting(false);
    }
  }

  async function startRecording(questionId: string) {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.set("questionId", questionId);
        formData.set("audio", blob, "audio.webm");
        if (recordingStartedAt) {
          formData.set(
            "durationSeconds",
            String(Math.round((Date.now() - recordingStartedAt) / 1000)),
          );
        }

        setSaving(questionId);
        try {
          const response = await fetch(`/api/interview/${token}/upload-audio`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || "No se pudo subir el audio.");
          }

          setMessage("Audio subido. La transcripcion se procesa en segundo plano.");
          router.refresh();
        } catch (error) {
          setError(error instanceof Error ? error.message : "Error desconocido");
        } finally {
          setSaving(null);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingQuestionId(questionId);
      setRecordingStartedAt(Date.now());
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo iniciar la grabacion.");
    }
  }

  function stopRecording() {
    mediaRecorder?.stop();
    setMediaRecorder(null);
    setRecordingQuestionId(null);
    setRecordingStartedAt(null);
  }

  return (
    <div className="space-y-5">
      {questions.map((question) => (
        <section
          key={question.id}
          className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-1 text-xs font-semibold text-[#F4EBD0]">
              {question.order}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
              {question.category}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">{question.question}</h2>
          <textarea
            rows={5}
            value={answers[question.id] ?? ""}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                [question.id]: event.target.value,
              }))
            }
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
            placeholder="Escribi tu respuesta..."
          />
          <button
            type="button"
            onClick={() => saveAnswer(question.id)}
            disabled={saving !== null || completing}
            className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving === question.id ? "Guardando..." : "Guardar respuesta"}
          </button>
          <button
            type="button"
            onClick={() =>
              recordingQuestionId === question.id ? stopRecording() : startRecording(question.id)
            }
            disabled={(recordingQuestionId !== null && recordingQuestionId !== question.id) || completing}
            className="ml-2 mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {recordingQuestionId === question.id ? "Detener grabacion" : "Grabar audio"}
          </button>
          {recordingQuestionId === question.id ? (
            <p className="mt-2 text-sm text-red-300">Grabando...</p>
          ) : null}
        </section>
      ))}

      <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5">
        <button
          type="button"
          onClick={completeInterview}
          disabled={completing}
          className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {completing ? "Completando..." : "Finalizar entrevista"}
        </button>
        {message ? <p className="mt-3 text-sm text-white/60">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
