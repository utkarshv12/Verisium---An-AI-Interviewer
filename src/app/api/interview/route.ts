import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { role, level, techStack, numQuestions } = await req.json();
    if (!role || !level || !techStack)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate questions via Gemini
    const questions = await generateInterviewQuestions(role, techStack, level, numQuestions ?? 5);

    // Create interview + questions in DB
    const interview = await db.interview.create({
      data: {
        userId: user.id,
        role,
        techStack,
        level,
        numQuestions: numQuestions ?? 5,
        status: "in_progress",
        questions: {
          create: questions.map((q, i) => ({
            questionText: q,
            order: i,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(interview);
  } catch (err: any) {
    console.error("[POST /api/interview]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json([], { status: 200 });

    const interviews = await db.interview.findMany({
      where: { userId: user.id },
      include: { questions: { include: { answer: true } }, feedback: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interviews);
  } catch (err: any) {
    console.error("[GET /api/interview]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
