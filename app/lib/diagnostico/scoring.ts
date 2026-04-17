import {
  BlockAnswer,
  BlockScoreDetail,
  DiagnosticBlock,
  GlobalScoreDetail,
  QuestionAnswer,
  QuestionScoreDetail,
} from "./types";

function roundInt(value: number) {
  return Math.round(value);
}

function redistributeWeights(
  questions: { id: string; weight: number; applicable: boolean }[],
): Record<string, number> {
  const applicableQuestions = questions.filter((q) => q.applicable);
  const totalApplicableWeight = applicableQuestions.reduce((sum, q) => sum + q.weight, 0);

  if (totalApplicableWeight <= 0) {
    return {};
  }

  const provisional = applicableQuestions.map((q) => ({
    id: q.id,
    raw: (q.weight / totalApplicableWeight) * 100,
  }));

  const rounded = provisional.map((item) => ({
    id: item.id,
    value: roundInt(item.raw),
  }));

  let roundedTotal = rounded.reduce((sum, item) => sum + item.value, 0);

  if (roundedTotal !== 100) {
    const maxItem = rounded.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
    const idx = rounded.findIndex((x) => x.id === maxItem.id);
    rounded[idx].value += 100 - roundedTotal;
    roundedTotal = rounded.reduce((sum, item) => sum + item.value, 0);
  }

  const result: Record<string, number> = {};
  for (const item of rounded) {
    result[item.id] = item.value;
  }

  return result;
}

function getScalePoints(scaleValue?: number, effectiveWeight?: number) {
  if (!scaleValue || !effectiveWeight) return 0;
  return roundInt((scaleValue / 5) * effectiveWeight);
}

function getMultiplePoints(
  answer: QuestionAnswer | undefined,
  block: DiagnosticBlock,
  questionId: string,
  effectiveWeight?: number,
) {
  if (!answer?.choiceId || !effectiveWeight) return 0;

  const question = block.questions.find((q) => q.id === questionId);
  const choice = question?.choices?.find((c) => c.id === answer.choiceId);

  if (!choice) return 0;

  const questionMax = Math.max(...(question?.choices?.map((c) => c.points) ?? [1]));
  return roundInt((choice.points / questionMax) * effectiveWeight);
}

export function scoreBlock(block: DiagnosticBlock, blockAnswer?: BlockAnswer): BlockScoreDetail {
  const applicable = blockAnswer?.applicable ?? true;

  if (!applicable) {
    return {
      blockId: block.id,
      applicable: false,
      maxPoints: 0,
      earnedPoints: 0,
      questions: [],
    };
  }

  const questionMeta = block.questions.map((q) => {
    const answer = blockAnswer?.answers.find((a) => a.questionId === q.id);
    const isApplicable = answer?.applicable ?? true;
    return {
      id: q.id,
      weight: q.weight,
      applicable: isApplicable,
    };
  });

  const effectiveWeights = redistributeWeights(questionMeta);

  const questionScores: QuestionScoreDetail[] = block.questions.map((q) => {
    const answer = blockAnswer?.answers.find((a) => a.questionId === q.id);
    const applicableQuestion = answer?.applicable ?? true;
    const effectiveWeight = applicableQuestion ? effectiveWeights[q.id] ?? 0 : 0;

    let earnedPoints = 0;

    if (applicableQuestion) {
      if (q.type === "scale") {
        earnedPoints = getScalePoints(answer?.scaleValue, effectiveWeight);
      }

      if (q.type === "multiple") {
        earnedPoints = getMultiplePoints(answer, block, q.id, effectiveWeight);
      }
    }

    return {
      questionId: q.id,
      originalWeight: q.weight,
      effectiveWeight,
      applicable: applicableQuestion,
      earnedPoints,
    };
  });

  const earnedPoints = questionScores.reduce((sum, q) => sum + q.earnedPoints, 0);

  return {
    blockId: block.id,
    applicable: true,
    maxPoints: 100,
    earnedPoints,
    questions: questionScores,
  };
}

export function scoreDiagnostic(
  blocks: DiagnosticBlock[],
  answers: BlockAnswer[],
): GlobalScoreDetail {
  const blockScores = blocks.map((block) => {
    const answer = answers.find((a) => a.blockId === block.id);
    return scoreBlock(block, answer);
  });

  const maxPoints = blockScores.reduce((sum, block) => sum + block.maxPoints, 0);
  const earnedPoints = blockScores.reduce((sum, block) => sum + block.earnedPoints, 0);

  return {
    maxPoints,
    earnedPoints,
    blocks: blockScores,
  };
}