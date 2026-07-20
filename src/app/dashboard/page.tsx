import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import {
  PlusCircle,
  Brain,
  BarChart3,
  Trophy,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

async function getOrCreateUser(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  let user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl,
      },
    });
  }
  return user;
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await getOrCreateUser(clerkUser);

  const interviews = await db.interview.findMany({
    where: { userId: user.id },
    include: { feedback: true, questions: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const allInterviews = await db.interview.findMany({
    where: { userId: user.id },
    include: { feedback: true },
  });

  const totalInterviews = allInterviews.length;
  const completedInterviews = allInterviews.filter((i) => i.status === "completed");
  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.feedback?.score ?? 0), 0) /
            completedInterviews.length
        )
      : 0;
  const bestScore =
    completedInterviews.length > 0
      ? Math.max(...completedInterviews.map((i) => i.feedback?.score ?? 0))
      : 0;

  const stats = [
    { label: "Total Interviews", value: totalInterviews, icon: Brain, color: "from-violet-500 to-purple-600" },
    { label: "Avg Score", value: avgScore ? `${avgScore}/100` : "N/A", icon: BarChart3, color: "from-blue-500 to-cyan-600" },
    { label: "Best Score", value: bestScore ? `${bestScore}/100` : "N/A", icon: Trophy, color: "from-amber-500 to-orange-600" },
    { label: "Completed", value: completedInterviews.length, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
  ];

  const statusIcon = {
    pending: <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />,
    in_progress: <AlertCircle className="w-4 h-4 text-amber-400" />,
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  };

  const statusLabel = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const statusBadge = {
    pending: "bg-slate-700/50 text-slate-400",
    in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {clerkUser.firstName || "there"} 👋
          </h1>
          <p className="text-slate-400 mt-1">Ready for your next interview challenge?</p>
        </div>
        <Link
          href="/dashboard/interview/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity w-fit"
        >
          <PlusCircle className="w-5 h-5" />
          New Interview
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Interviews */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
          <Link href="/dashboard/history" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No interviews yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first AI mock interview to get started</p>
            <Link
              href="/dashboard/interview/new"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-5 h-5" />
              Create First Interview
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {interviews.map((interview) => (
              <div key={interview.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors gap-3">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{interview.role}</p>
                    <p className="text-sm text-slate-400">
                      {interview.techStack} · {interview.level} · {interview.questions.length}Q
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 ml-14 sm:ml-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[interview.status as keyof typeof statusBadge]}`}>
                    {statusIcon[interview.status as keyof typeof statusIcon]}
                    {statusLabel[interview.status as keyof typeof statusLabel]}
                  </div>
                  {interview.feedback && (
                    <span className="text-sm font-semibold text-violet-400">{interview.feedback.score}/100</span>
                  )}
                  <Link
                    href={
                      interview.status === "completed"
                        ? `/dashboard/interview/${interview.id}/feedback`
                        : `/dashboard/interview/${interview.id}`
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                  >
                    {interview.status === "completed" ? "View Report" : "Continue"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
