"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JOB_ROLES, EXPERIENCE_LEVELS, TECH_STACKS } from "@/types";
import { Brain, Loader2, Sparkles, ChevronRight } from "lucide-react";

export default function NewInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [techStack, setTechStack] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [customTech, setCustomTech] = useState("");

  const availableTechStacks = role ? TECH_STACKS[role] ?? [] : [];
  const finalTechStack = techStack || customTech;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || !level || !finalTechStack) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, techStack: finalTechStack, numQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create interview");
      router.push(`/dashboard/interview/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create New Interview</h1>
        <p className="text-slate-400">Configure your mock interview session and let AI generate questions for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Role */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-semibold text-white">
            Job Role <span className="text-violet-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {JOB_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setTechStack(""); }}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                  role === r
                    ? "bg-violet-600/20 border-violet-500 text-violet-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-semibold text-white">
            Experience Level <span className="text-violet-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  level === lvl
                    ? "bg-violet-600/20 border-violet-500 text-violet-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-semibold text-white">
            Tech Stack <span className="text-violet-400">*</span>
          </label>
          {availableTechStacks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTechStacks.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setTechStack(techStack === tech ? "" : tech)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    techStack === tech
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Or type custom tech stack (e.g. React + TypeScript + GraphQL)"
            value={customTech}
            onChange={(e) => { setCustomTech(e.target.value); setTechStack(""); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Number of Questions */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <label className="block text-sm font-semibold text-white">
            Number of Questions: <span className="text-violet-400">{numQuestions}</span>
          </label>
          <input
            type="range"
            min={3}
            max={10}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>3 (Quick)</span>
            <span>5 (Standard)</span>
            <span>10 (Full)</span>
          </div>
        </div>

        {/* Summary */}
        {role && level && finalTechStack && (
          <div className="bg-violet-600/10 border border-violet-500/30 rounded-2xl p-4">
            <p className="text-sm text-violet-300">
              <span className="font-semibold">Ready to generate:</span> A {numQuestions}-question{" "}
              <span className="text-white font-semibold">{level}</span>{" "}
              <span className="text-white font-semibold">{role}</span> interview focused on{" "}
              <span className="text-white font-semibold">{finalTechStack}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !role || !level || !finalTechStack}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Interview
            </>
          )}
        </button>
      </form>
    </div>
  );
}
