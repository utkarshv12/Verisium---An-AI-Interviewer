import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { answers } = await req.json();
    // answers: { questionId: string, userAnswer: string }[]

    for (const ans of answers) {
      await db.answer.upsert({
        where: { questionId: ans.questionId },
        create: { questionId: ans.questionId, userAnswer: ans.userAnswer },
        update: { userAnswer: ans.userAnswer },
      });
    }

    // Mark interview as completed
    await db.interview.update({
      where: { id: id },
      data: { status: "completed" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
