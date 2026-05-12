import { logger, task } from "@trigger.dev/sdk";
import { processRecruitingCandidateProcessingJob } from "@/lib/recruiting/ingestGmail";

export const processRecruitingCandidateJobTask = task({
  id: "recruiting-candidate-process",
  retry: {
    maxAttempts: 4,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: true,
  },
  run: async (payload: { jobId: string }, { ctx }) => {
    logger.info("Processing recruiting candidate job", {
      jobId: payload.jobId,
      runId: ctx.run.id,
    });

    const result = await processRecruitingCandidateProcessingJob(payload.jobId, ctx.run.id);

    logger.info("Recruiting candidate job finished", {
      jobId: payload.jobId,
      runId: ctx.run.id,
      result,
    });

    return result;
  },
});
