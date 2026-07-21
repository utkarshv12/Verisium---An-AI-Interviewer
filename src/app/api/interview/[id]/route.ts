import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const interview = await db.interview.findFirst({
      where: { id: id, userId: user.id },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" },
        },
        feedback: true,
      },
    });

    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    return NextResponse.json(interview);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
