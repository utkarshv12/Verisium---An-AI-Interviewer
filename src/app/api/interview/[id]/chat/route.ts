import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import db from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { history } = await request.json();

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const interview = await db.interview.findFirst({
      where: { id: id, userId: user.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const topicsList = interview.questions
      .map((q, i) => `${i + 1}. ${q.questionText}`)
      .join("\n");

    const systemPrompt = `You are Vera, a professional and warm AI technical interviewer at a top tech company. You are conducting a ${interview.level} level ${interview.role} interview focused on: ${interview.techStack}.

Your behavior rules:
- Be professional, warm, and encouraging — like a real human interviewer
- Ask ONLY ONE question per response, never ask two at once
- Keep responses SHORT (2-4 sentences max): acknowledge the answer briefly, then ask the next question
- Use natural transitional phrases like: "That's a great point!", "Interesting!", "I see, thanks for explaining that.", "Let me ask you something related...", "Hmm, good answer."
- Generate follow-up questions based on what the candidate says — be dynamic, not robotic
- After 2-3 exchanges on one topic, naturally move to the next topic
- After 8-12 total exchanges, wrap up the interview gracefully by saying something like "Thank you so much for your time today. This was a great interview. I'll now generate your feedback report."
- NEVER reveal you are an AI language model. You are Vera, a human interviewer.
- NEVER show numbered questions or bullet points

Topics to cover (use these as a guide, not a script):
${topicsList}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
      temperature: 0.85,
      max_tokens: 180,
    });

    const message =
      completion.choices[0]?.message?.content?.trim() ??
      "That's interesting. Could you elaborate a bit more on that?";

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
