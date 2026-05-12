import { logger, task } from "@trigger.dev/sdk";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  analyzeVoiceSignals,
  summarizeRealtimeTranscript,
  transcribeInterviewAudio,
} from "@/lib/recruiting/transcription";

export const recruitingInterviewTranscriptionTask = task({
  id: "recruiting-interview-transcription",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },
  run: async (
    payload: {
      answerId: string;
      storagePath: string;
    },
    { ctx },
  ) => {
    logger.info("Interview transcription started", {
      runId: ctx.run.id,
      answerId: payload.answerId,
    });

    const answer = await prisma.recruitingInterviewAnswer.findUnique({
      where: { id: payload.answerId },
      include: {
        question: true,
      },
    });

    if (!answer) {
      throw new Error(`Interview answer not found: ${payload.answerId}`);
    }

    await prisma.recruitingInterviewAnswer.update({
      where: { id: answer.id },
      data: { transcriptionStatus: "processing" },
    });

    const transcription = await transcribeInterviewAudio({
      storagePath: payload.storagePath,
      fileName: answer.audioUrl?.split("/").pop() ?? "audio.webm",
    });
    const voiceSignals = await analyzeVoiceSignals({
      transcript: transcription.transcript,
      question: answer.question.question,
    });
    const realtimeTranscript = await summarizeRealtimeTranscript({
      transcript: transcription.transcript,
    });

    const updated = await prisma.recruitingInterviewAnswer.update({
      where: { id: answer.id },
      data: {
        transcript: transcription.transcript,
        transcriptionStatus: "completed",
        transcriptionConfidence: transcription.confidence,
        realtimeTranscript: realtimeTranscript as Prisma.InputJsonValue,
        aiSignals: voiceSignals as Prisma.InputJsonValue,
      },
    });

    logger.info("Interview transcription completed", {
      runId: ctx.run.id,
      answerId: answer.id,
      confidence: transcription.confidence,
    });

    return { answerId: updated.id, status: "completed" };
  },
});
