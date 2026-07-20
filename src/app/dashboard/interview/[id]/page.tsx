"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Vapi from "@vapi-ai/web";
import {
  Brain,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Loader2,
  AlertCircle,
  BarChart2,
} from "lucide-react";

type Phase = "pre" | "active" | "thinking" | "speaking" | "ending";

interface Question { id: string; questionText: string; order: number }
interface Interview {
  id: string;
  role: string;
  techStack: string;
  level: string;
  questions: Question[];
}

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any }
}

const ROLE_TAGS: Record<string, string[]> = {
  "Frontend Developer": ["React", "Next.js", "TypeScript", "JavaScript", "CSS"],
  "Backend Developer": ["Node.js", "Java", "Python", "REST APIs", "Databases"],
  "Full Stack Developer": ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"],
  "Data Science": ["Python", "TensorFlow", "Pandas", "SQL", "ML"],
  "DevOps / SRE": ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS"],
  "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin"],
  "AI/ML Engineer": ["Python", "PyTorch", "LangChain", "MLOps"],
  "Java Developer": ["Java", "Spring Boot", "Microservices", "JUnit"],
  "Python Developer": ["Python", "Django", "FastAPI", "Redis", "PostgreSQL"],
};

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("pre");
  const [error, setError] = useState("");

  // Voice
  const [liveText, setLiveText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const vapiRef = useRef<any>(null);
  const isCallActive = useRef(false);

  // Camera
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Load interview
  useEffect(() => {
    fetch(`/api/interview/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "completed") {
          router.replace(`/dashboard/interview/${id}/feedback`);
          return;
        }
        setInterview(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      isCallActive.current = true;
      setPhase("active");
    });

    vapi.on("call-end", () => {
      isCallActive.current = false;
      setPhase("pre");
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "partial") {
        setLiveText(message.transcript);
      }
      if (message.type === "transcript" && message.transcriptType === "final") {
        setFinalText((prev) => (prev ? prev + " " : "") + message.transcript);
        setLiveText("");
        setHistory((prev) => [...prev, { role: "user", content: message.transcript }]);
      }
      if (message.type === "speech-update") {
        if (message.status === "started") setPhase("speaking");
        else setPhase("active");
      }
      if (message.type === "conversation-update") {
        // Sync full history from Vapi
        const vapiHistory = message.conversation
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .map((m: any) => ({ role: m.role, content: m.content }));
        setHistory(vapiHistory);
      }
    });

    vapi.on("error", (e: any) => {
        console.error("Vapi Error Detailed:", e);
        // If the error has a message or description, show it
        const msg = e.message || e.description || "Voice connection error. Please try again.";
        setError(msg);
    });

    return () => {
      vapi.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Elapsed timer when interview is active
  useEffect(() => {
    if (phase === "pre" || phase === "ending") return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch { setCameraOn(false); }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  function toggleMute() {
    const newMute = !isMuted;
    vapiRef.current?.setMuted(newMute);
    setIsMuted(newMute);
  }

  // Start interview
  async function startInterview() {
    if (!interview) return;
    startCamera();
    
    const assistant = {
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Vera, an expert AI interviewer. 
            You are conducting a ${interview.level} level ${interview.role} interview.
            The candidate's tech stack is: ${interview.techStack}.
            
            Rules:
            1. Be professional yet encouraging.
            2. Ask one question at a time.
            3. Start by greeting the candidate and asking them to introduce themselves.
            4. Transition naturally between topics.
            5. If the candidate gives a short answer, ask a relevant follow-up.
            6. After enough questions, wrap up by saying "Thank you for the interview. I'll now generate your feedback report."`
          }
        ]
      },
      voice: {
        provider: "openai",
        voiceId: "shimmer"
      },
      firstMessage: `Hello! I'm Vera, your AI interviewer today. It's great to meet you! We're here for a ${interview.level} level ${interview.role} interview focusing on ${interview.techStack}. Let's get started — could you please introduce yourself and tell me about your background?`
    };

    try {
      await vapiRef.current.start(assistant);
    } catch (err: any) {
      console.error("Failed to start Vapi:", err);
      setError(err.message || "Could not start voice session.");
    }
  }

  async function handleEndInterview() {
    vapiRef.current?.stop();
    stopCamera();
    setPhase("ending");
    setLoadingStep(1); // "Aggregating Voice Data..."

    // Give it a small delay for the last "conversation-update" from Vapi
    await new Promise(r => setTimeout(r, 2000));
    setLoadingStep(2); // "Syncing Mission Log..."
    await new Promise(r => setTimeout(r, 1000));
    setLoadingStep(3); // "Engaging Multi-Agent Evaluators..."

    try {
      // Use the latest history we have
      const finalHistory = history;

      const res = await fetch(`/api/interview/${id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: finalHistory }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate report");
      }

      setLoadingStep(4); // "Finalizing Report..."
      await new Promise(r => setTimeout(r, 800));

      router.push(`/dashboard/interview/${id}/feedback`);
    } catch (err: any) {
      setError(`Analysis Error: ${err.message}. You can try viewing it from History later.`);
      console.error(err);
      // Wait a bit longer so they can read the error before redirecting to potentially empty feedback
      setTimeout(() => {
        router.push(`/dashboard/interview/${id}/feedback`);
      }, 6000);
    }
  }

  const elapsedStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, "0")}`;
  const roleTags = interview
    ? ROLE_TAGS[interview.role] ??
      interview.techStack.split(",").map((s) => s.trim()).slice(0, 5)
    : [];
  const candidateName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Candidate";
  const candidateInitial = candidateName[0]?.toUpperCase() ?? "C";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
        <p className="text-slate-400 animate-pulse">Setting up your interview room...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white font-semibold">Interview not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{interview.role} Interview</h1>
            {phase !== "pre" && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400 tracking-wide">LIVE</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {roleTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium"
              >
                {tag}
              </span>
            ))}
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
              {interview.level}
            </span>
          </div>
        </div>

        {phase !== "pre" && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono text-sm font-semibold">{elapsedStr}</span>
          </div>
        )}
      </div>

      {/* ── Video Panels ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* AI Interviewer */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="aspect-video flex flex-col items-center justify-center relative">
            {/* Glow background when speaking */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                phase === "speaking" ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl" />
            </div>

            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center transition-all duration-500 ${
                  phase === "speaking"
                    ? "scale-110 shadow-2xl shadow-violet-500/50"
                    : ""
                }`}
              >
                <Brain className="w-12 h-12 text-white" />
              </div>
              {phase === "speaking" && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-violet-400/60 animate-ping" />
                  <div
                    className="absolute -inset-2 rounded-full border border-violet-500/20 animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  />
                </>
              )}
              {phase === "thinking" && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-950">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Sound wave bars */}
            {phase === "speaking" && (
              <div className="flex items-end gap-1 mb-3" style={{ height: 32 }}>
                {[3, 5, 8, 6, 9, 7, 5, 8, 6, 4, 7, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-violet-400 rounded-full animate-pulse"
                    style={{
                      height: h * 3,
                      animationDelay: `${i * 0.07}s`,
                      animationDuration: "0.5s",
                    }}
                  />
                ))}
              </div>
            )}

            <p className="text-slate-500 text-xs text-center">
              {phase === "speaking"
                ? "Vera is speaking..."
                : phase === "thinking"
                ? "Vera is thinking..."
                : phase === "pre"
                ? "Ready to interview"
                : "Vera · Listening"}
            </p>
          </div>

          {/* Name tag */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-white text-sm font-semibold">Vera</span>
              <span className="text-slate-500 text-xs tracking-widest">AI INTERVIEWER</span>
            </div>
          </div>
        </div>

        {/* Candidate */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="aspect-video flex flex-col items-center justify-center relative">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-4xl font-bold text-white select-none">
                  {candidateInitial}
                </div>
                <p className="text-slate-500 text-xs">Camera is off</p>
              </div>
            )}

            {/* Mic waveform overlay */}
            {!isMuted && phase !== "pre" && phase !== "ending" && (
              <div className="absolute inset-0 flex items-end justify-center pb-16">
                <div className="flex items-end gap-1">
                  {[2, 5, 8, 6, 9, 5, 7, 4, 6, 8, 5, 3].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-red-400/80 rounded-full animate-pulse"
                      style={{
                        height: h * 3,
                        animationDelay: `${i * 0.09}s`,
                        animationDuration: "0.45s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Live badge */}
            {!isMuted && phase !== "pre" && phase !== "ending" && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
              </div>
            )}
          </div>

          {/* Name tag */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white text-sm font-semibold">{candidateName}</span>
              <span className="text-slate-500 text-xs tracking-widest">CANDIDATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-Interview: Start Button ── */}
      {phase === "pre" && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-slate-400 mb-2">
            Vera is ready to conduct your{" "}
            <span className="text-white font-semibold">{interview.role}</span> interview.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Make sure your microphone is working. Vera will speak questions — just answer naturally.
          </p>
          <button
            onClick={startInterview}
            className="inline-flex items-center gap-3 px-12 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-violet-500/25"
          >
            <Phone className="w-6 h-6" />
            Start Interview
          </button>
        </div>
      )}

      {/* ── Active Interview Controls ── */}
      {phase !== "pre" && phase !== "ending" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          {/* Live transcript box */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[80px]">
            <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Your answer</p>
            {finalText || liveText ? (
              <p className="text-white text-sm leading-relaxed">
                {finalText}
                {liveText && (
                  <span className="text-slate-400 italic"> {liveText}</span>
                )}
              </p>
            ) : (
              <p className="text-slate-600 text-sm italic">
                {phase === "speaking"
                  ? "Vera is speaking..."
                  : phase === "thinking"
                  ? "Vera is thinking..."
                  : !isMuted
                  ? "Vera is listening... speak your answer"
                  : "Microphone is muted"}
              </p>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: cam + mic */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => (cameraOn ? stopCamera() : startCamera())}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  cameraOn
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white"
                }`}
                title={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMute}
                disabled={phase === "thinking"}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  !isMuted
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110"
                    : "bg-slate-800 text-slate-400 hover:bg-violet-600 hover:text-white"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={!isMuted ? "Mute microphone" : "Unmute microphone"}
              >
                {!isMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <span className="text-xs text-slate-500">
                {phase === "speaking"
                  ? "🔊 Vera is speaking..."
                  : phase === "thinking"
                  ? "⏳ Vera is thinking..."
                  : !isMuted
                  ? "🎙️ Live"
                  : "Microphone Muted"}
              </span>
            </div>

            {/* Right: End Interview */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEndInterview()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                title="End interview and get report"
              >
                <PhoneOff className="w-4 h-4" />
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ending / Analysis screen ── */}
      {phase === "ending" && (
        <div className="glass-card rounded-2xl p-10 text-center py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent animate-pulse" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8 relative">
               <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-spin-slow" />
               <BarChart2 className="w-8 h-8 text-violet-400" />
            </div>

            <h3 className="text-white font-black text-3xl mb-4 tracking-tighter uppercase">
              {loadingStep === 1 && "Aggregating Voice Data"}
              {loadingStep === 2 && "Syncing Mission Log"}
              {loadingStep === 3 && "Engaging AI Evaluators"}
              {loadingStep === 4 && "Finalizing Report"}
              {!loadingStep && "Analyzing Session"}
            </h3>
            
            <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto font-medium">
              {loadingStep === 1 && "Verifying audio stream and synthesizing localized transcripts..."}
              {loadingStep === 2 && "Compiling interviewer intent and behavioral metadata..."}
              {loadingStep === 3 && "Vera is using 5 specialized agents to conduct a deep analysis..."}
              {loadingStep === 4 && "Compiling overall score and strategic recommendations..."}
              {!loadingStep && "Vera is generating your comprehensive performance report..."}
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700 ease-out"
                  style={{ width: `${(loadingStep / 4) * 100}%` }}
                 />
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      loadingStep >= step ? "bg-violet-500" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
