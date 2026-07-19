import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  PlusCircle,
} from "lucide-react";

export default async function HistoryPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) redirect("/dashboard");

  const interviews = await db.interview.findMany({
    where: { userId: user.id },
    include: { feedback: true, questions: true },
    orderBy: { createdAt: "desc" },
  });

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-slate-400" />,
    in_progress: <AlertCircle className="w-4 h-4 text-amber-400" />,
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  };

  const statusBadge = {
    pending: "bg-slate-700/50 text-slate-400",
    in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview History</h1>
          <p className="text-slate-400 mt-1">{interviews.length} total interview sessions</p>
        </div>
        <Link
          href="/dashboard/interview/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity w-fit"
        >
          <PlusCircle className="w-5 h-5" />
          New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No interviews yet</h3>
          <p className="text-slate-400 text-sm mb-6">Start your first mock interview to see your history here</p>
          <Link
            href="/dashboard/interview/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90"
          >
            <PlusCircle className="w-5 h-5" /> Create Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="glass-card rounded-2xl p-5 hover:border-slate-600/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{interview.role}</h3>
                    <p className="text-sm text-slate-400">
                      {interview.techStack} · {interview.level} · {interview.questions.length} Questions
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(interview.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-15 sm:ml-0">
                  {interview.feedback && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">{interview.feedback.score}/100</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[interview.status as keyof typeof statusBadge]}`}>
                    {statusIcon[interview.status as keyof typeof statusIcon]}
                    <span className="capitalize">{interview.status.replace("_", " ")}</span>
                  </div>
                  <Link
                    href={
                      interview.status === "completed"
                        ? `/dashboard/interview/${interview.id}/feedback`
                        : `/dashboard/interview/${interview.id}`
                    }
                    className="text-xs px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors whitespace-nowrap"
                  >
                    {interview.status === "completed" ? "View Report" : "Continue →"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
