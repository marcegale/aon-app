import { toFile } from "openai/uploads";
import { openai } from "@/lib/openai";
import { getSignedInterviewAudioUrl } from "@/lib/recruiting/interviewAudio";
import { generateInterviewBehaviorSignals } from "@/lib/recruiting/interviewIntelligence";

export async function transcribeInterviewAudio(input: {
  storagePath: string;
  fileName?: string;
}) {
  const signedUrl = await getSignedInterviewAudioUrl(input.storagePath);
  const response = await fetch(signedUrl);

  if (!response.ok) {
    throw new Error(`Unable to download interview audio: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const transcription = await openai.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe",
    file: await toFile(buffer, input.fileName ?? "audio.webm"),
    response_format: "json",
  });

  return {
    transcript: transcription.text,
    confidence: 0.85,
  };
}

export async function analyzeVoiceSignals(input: {
  transcript: string;
  question?: string | null;
}) {
  const words = input.transcript.split(/\s+/).filter(Boolean);
  const fillerWords = words.filter((word) =>
    ["eh", "em", "mmm", "este", "tipo", "digamos"].includes(word.toLowerCase()),
  );
  const behavior = await generateInterviewBehaviorSignals({
    transcript: input.transcript,
    question: input.question,
  });

  return {
    speakingPatterns: {
      wordCount: words.length,
      fillerWordCount: fillerWords.length,
      fillerWords,
    },
    communicationClarity: behavior.communicationScore,
    hesitationMarkers: fillerWords.length,
    confidenceSignals: behavior.confidenceScore,
    behavior,
  };
}

export async function summarizeRealtimeTranscript(input: { transcript: string }) {
  return {
    segments: [
      {
        start: 0,
        text: input.transcript,
      },
    ],
    summary: input.transcript.slice(0, 500),
  };
}
