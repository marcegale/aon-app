import { logger, task } from "@trigger.dev/sdk";
import {
  evaluateAutomationRules,
  type RecruitingAutomationTrigger,
} from "@/lib/recruiting/automation";

export const recruitingAutomationTask = task({
  id: "recruiting-automation-evaluate",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 30_000,
    factor: 2,
    randomize: true,
  },
  run: async (
    payload: {
      tenantId: string;
      searchId: string;
      candidateId: string;
      triggerType: RecruitingAutomationTrigger;
    },
    { ctx },
  ) => {
    logger.info("Evaluating recruiting automations", {
      runId: ctx.run.id,
      ...payload,
    });

    const result = await evaluateAutomationRules(payload);

    logger.info("Recruiting automations evaluated", {
      runId: ctx.run.id,
      executionCount: result.length,
    });

    return result;
  },
});
