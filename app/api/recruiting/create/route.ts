import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRecruitingOutputs } from "@/lib/openai";

function generateRef() {
  return `REF-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, requestText, tenantId, userId } = body;

    const refCode = generateRef();

    const search = await prisma.recruitingSearch.create({
      data: {
        tenantId,
        createdById: userId,
        refCode,
        title,
        requestText,
        status: "generating",
      },
    });

    const aiRaw = await generateRecruitingOutputs({
      title,
      requestText,
    });

    let parsed;
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      parsed = { raw: aiRaw };
    }

    await prisma.recruitingSearch.update({
      where: { id: search.id },
      data: {
        jobProfileOutput: parsed.jobProfile || null,
        idealCandidateOutput: parsed.idealCandidate || null,
        scoringCriteriaOutput: parsed.scoringCriteria || null,
        publicationCopiesOutput: parsed.copies || null,
        aiGenerationLog: parsed,
        status: "publishing",
      },
    });

    return NextResponse.json({ success: true, id: search.id, refCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
