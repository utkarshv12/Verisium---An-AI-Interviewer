import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { generateFeedback } from "@/lib/gemini";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const interview = await db.interview.findFirst({
      where: { id: id, userId: user.id },
      include: { questions: { include: { answer: true }, orderBy: { order: "asc" } } },
    });
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    // Check if feedback already exists
    const existingFeedback = await db.feedback.findUnique({ where: { interviewId: id } });
    if (existingFeedback) return NextResponse.json(existingFeedback);

    const questionsAndAnswers = interview.questions.map((q) => ({
      question: q.questionText,
      answer: q.answer?.userAnswer ?? "",
    }));

    const aiResult = await generateFeedback(
      interview.role,
      interview.techStack,
      interview.level,
      questionsAndAnswers
    );

    const feedback = await db.feedback.create({
      data: {
        interviewId: id,
        score: aiResult.score,
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
        summary: aiResult.summary,
        questionFeedback: aiResult.questionFeedback as any,
      },
    });

    return NextResponse.json(feedback);
  } catch (err: any) {
    console.error("[POST /api/interview/[id]/feedback]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const feedback = await db.feedback.findUnique({
      where: { interviewId: id },
      include: { interview: true },
    });

    if (!feedback) return NextResponse.json({ error: "Feedback not found" }, { status: 404 });

    // Ensure user owns this interview
    if (feedback.interview.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(feedback);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
