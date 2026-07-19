"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  AlertCircle,
  Loader2,
  Zap,
  Star,
  Brain,
} from "lucide-react";

interface FeedbackData {
  score: number | string;
  strengths: string[] | string;
  improvements: string[] | string;
  multiAgentReport?: any;
  growthData?: any;
  interview?: {
    role: string;
    level: string;
    techStack: string;
    type: string;
    questionsCount: number;
    createdAt: string;
  };
  questionFeedback: {
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    problemSolvingScore?: number;
    eyeContactScore?: number;
    suggestions: string[];
    detailedAnalysis?: any;
  };
}

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [feedback, setFeedback] =
    useState<FeedbackData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/interview/${id}/feedback`)
      .then((r) => r.json())
      .then((data) => {
        setFeedback(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-slate-400">
          Loading your performance report...
        </p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />

        <h2 className="text-xl font-bold text-white mb-2">
          No data found
        </h2>

        <p className="text-slate-400 mb-6">
          We couldn&apos;t find any feedback
          for this interview.
        </p>

        <Link
          href="/dashboard"
          className="px-6 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // SAFE VALUES
  const safeScore = Number(feedback?.score || 0);

  const parsedStrengths =
    typeof feedback?.strengths === "string"
      ? JSON.parse(feedback.strengths || "[]")
      : feedback?.strengths || [];

  const parsedImprovements =
    typeof feedback?.improvements === "string"
      ? JSON.parse(feedback.improvements || "[]")
      : feedback?.improvements || [];

  const report =
    feedback.multiAgentReport ||
    feedback.questionFeedback?.detailedAnalysis ||
    {};

  const growth =
    feedback.growthData ||
    feedback.questionFeedback?.detailedAnalysis
      ?.growthData;

  const technicalScore = Number(
    feedback.questionFeedback?.technicalScore ||
      0
  );

  const communicationScore = Number(
    feedback.questionFeedback
      ?.communicationScore || 0
  );

  const confidenceScore = Number(
    feedback.questionFeedback?.confidenceScore ||
      0
  );

  const problemSolvingScore = Number(
    feedback.questionFeedback
      ?.problemSolvingScore || 0
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-5xl font-black text-white">
            PERFORMANCE ANALYSIS
          </h1>

          <p className="text-slate-400 mt-2">
            {feedback.interview?.role ||
              "Developer"}{" "}
            Interview
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-5 py-2 rounded-xl bg-slate-800 text-white"
        >
          Dashboard
        </Link>
      </div>

      {/* SCORE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* CIRCLE SCORE */}
        <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center">

          <div className="relative w-56 h-56 mb-8">

            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-slate-800 stroke-current"
                strokeWidth="6"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />

              <circle
                className="text-violet-500 stroke-current transition-all duration-1000"
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
                strokeDasharray="264"
                strokeDashoffset={
                  264 -
                  (264 *
                    ((safeScore || 0) / 100))
                }
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <span className="text-6xl font-black text-white">
                {typeof safeScore === "number" &&
                !isNaN(safeScore)
                  ? (safeScore / 10).toFixed(0)
                  : "0"}
              </span>

              <span className="text-slate-500 text-xs uppercase tracking-widest">
                Mastery
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-400">
              AI Performance Rating
            </p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="glass-card rounded-3xl p-10">

          <h2 className="text-2xl font-bold text-white mb-8">
            Interview Metrics
          </h2>

          <div className="space-y-6">

            <Metric
              title="Technical Score"
              value={technicalScore}
            />

            <Metric
              title="Communication Score"
              value={communicationScore}
            />

            <Metric
              title="Confidence Score"
              value={confidenceScore}
            />

            <Metric
              title="Problem Solving"
              value={problemSolvingScore}
            />
          </div>
        </div>
      </div>

      {/* STRENGTHS + IMPROVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* STRENGTHS */}
        <div className="glass-card rounded-3xl p-10">

          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-emerald-400" />

            <h2 className="text-2xl font-bold text-white">
              Strengths
            </h2>
          </div>

          <div className="space-y-4">

            {parsedStrengths.map(
              (item: string, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        {/* IMPROVEMENTS */}
        <div className="glass-card rounded-3xl p-10">

          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-6 h-6 text-amber-400" />

            <h2 className="text-2xl font-bold text-white">
              Improvements
            </h2>
          </div>

          <div className="space-y-4">

            {parsedImprovements.map(
              (item: string, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* STRATEGIC REPORT */}
      <div className="glass-card rounded-3xl p-10 mb-10">

        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-violet-400" />

          <h2 className="text-2xl font-bold text-white">
            Strategic Assessment
          </h2>
        </div>

        <p className="text-slate-300 text-lg leading-relaxed">
          {report?.strategicAssessment ||
            report?.performanceSummary ||
            "No detailed assessment available."}
        </p>
      </div>

      {/* GROWTH */}
      {growth && (
        <div className="glass-card rounded-3xl p-10 mb-10">

          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-violet-400" />

            <h2 className="text-2xl font-bold text-white">
              Growth Analysis
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div className="p-6 rounded-2xl bg-slate-900">
              <p className="text-slate-400 mb-2">
                Previous Score
              </p>

              <p className="text-3xl font-black text-white">
                {growth.previousScore || 0}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900">
              <p className="text-slate-400 mb-2">
                Current Score
              </p>

              <p className="text-3xl font-black text-white">
                {growth.currentScore || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BUTTON */}
      <div className="flex justify-center mt-16">

        <Link
          href="/dashboard/interview/new"
          className="px-10 py-4 rounded-2xl bg-violet-600 text-white font-bold hover:bg-violet-500 transition-all"
        >
          Start New Interview
        </Link>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-slate-300">
          {title}
        </span>

        <span className="text-white font-bold">
          {value}
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-violet-500"
          style={{
            width: `${Math.min(
              Math.max(Number(value) * 10, 0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}