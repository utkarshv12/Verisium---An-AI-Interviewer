import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { conductMultiAgentAnalysis } from "@/lib/gemini";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversation } = await request.json();

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentInterview = await db.interview.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!currentInterview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Mark interview completed
    await db.interview.update({
      where: { id },
      data: {
        status: "completed",
      },
    });

    // Previous interview for growth tracking
    const previousInterview = await db.interview.findFirst({
      where: {
        userId: user.id,
        role: currentInterview.role,
        status: "completed",
        id: {
          not: id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        feedback: true,
      },
    });

    let previousSessionData = undefined;

    if (previousInterview?.feedback) {
      previousSessionData = {
        overallScore: previousInterview.feedback.score / 10,

        technicalScore:
          (previousInterview.feedback.questionFeedback as any)
            ?.technicalScore || 0,

        communicationScore:
          (previousInterview.feedback.questionFeedback as any)
            ?.communicationScore || 0,

        confidenceScore:
          ((previousInterview.feedback.questionFeedback as any)
            ?.confidenceScore || 0) * 10,
      };
    }

    // Build transcript
    const transcript = conversation
      .filter((m: any) => m.role !== "system")
      .map(
        (m: any) =>
          `${m.role === "assistant"
            ? "Vera (AI Interviewer)"
            : "Candidate"
          }: ${m.content}`
      )
      .join("\n\n");

    // AI Analysis
    const { report, growth } =
      await conductMultiAgentAnalysis(
        currentInterview.role,
        currentInterview.techStack,
        currentInterview.level,
        transcript,
        previousSessionData
      );

    // Prepare feedback
    const feedbackData = {
      score: Math.round(
        (report?.overallScore || 5) * 10
      ),

      strengths: JSON.stringify(
        report?.keyStrengths || [
          "Communication",
          "Technical Knowledge",
        ]
      ),

      improvements: JSON.stringify(
        report?.improvementAreas || [
          "Confidence",
          "Problem Solving",
        ]
      ),

      summary:
        report?.performanceSummary ||
        "Interview analysis completed.",

      questionFeedback: {
        communicationScore:
          report?.communicationScore || 5,

        technicalScore:
          report?.technicalScore || 5,

        confidenceScore:
          (report?.confidenceScore || 70) / 10,

        problemSolvingScore:
          report?.problemSolvingScore || 5,

        eyeContactScore:
          report?.eyeContactScore || 80,

        suggestions:
          report?.coachingRecommendations || [],

        isConversational: true,

        detailedAnalysis: {
          ...report,
          growthData: growth || null,
        },
      } as any,

      multiAgentReport: report as any,

      growthData: growth as any,
    };

    // Check existing feedback
    const existingFeedback =
      await db.feedback.findUnique({
        where: {
          interviewId: id,
        },
      });

    // Update or create feedback
    if (existingFeedback) {
      await db.feedback.update({
        where: {
          interviewId: id,
        },
        data: feedbackData,
      });
    } else {
      await db.feedback.create({
        data: {
          interviewId: id,
          ...feedbackData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis: report,
      growth,
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
