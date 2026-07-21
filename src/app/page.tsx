import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import {
  Brain,
  Zap,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Trophy,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Questions",
    description:
      "Our AI generates realistic, role-specific interview questions tailored to your exact tech stack and experience level.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Feedback",
    description:
      "Get instant, detailed feedback on every answer — strengths, weaknesses, and actionable improvements.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress over time with detailed scores, improvement trends, and skill gap analysis.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "10+ Job Roles",
    description:
      "Frontend, Backend, Full Stack, Data Science, DevOps, Mobile, AI/ML, and more — all covered.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Trophy,
    title: "Scored Evaluations",
    description:
      "Each answer is scored on a 10-point scale with comprehensive reasoning from the AI evaluator.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Clock,
    title: "Practice Anytime",
    description:
      "Available 24/7. Practice as many interviews as you want, completely free — no limits.",
    gradient: "from-indigo-500 to-blue-600",
  },
];

const steps = [
  { step: "01", title: "Create Your Profile", description: "Sign up and tell us your target role, experience level, and preferred tech stack." },
  { step: "02", title: "Generate Interview", description: "AI crafts a personalized set of technical questions just for you in seconds." },
  { step: "03", title: "Answer Questions", description: "Type your answers at your own pace in a clean, distraction-free interview UI." },
  { step: "04", title: "Get AI Feedback", description: "Receive a detailed report with scores, strengths, weaknesses, and improvement tips." },
];

const testimonials = [
  { name: "Rahul Sharma", role: "Frontend Developer @ Google", text: "Verisium helped me prep for my Google interview in 2 weeks. The AI questions were spot-on and feedback was brutally honest.", rating: 5 },
  { name: "Priya Patel", role: "Backend Engineer @ Microsoft", text: "I failed 3 interviews before trying Verisium. After 10 sessions, I landed my dream job. The structured feedback made all the difference.", rating: 5 },
  { name: "Alex Chen", role: "Full Stack Dev @ Startup", text: "The tech stack-specific questions are incredible. It's like having a senior engineer interviewing you every day.", rating: 5 },
];

const stats = [
  { value: "50K+", label: "Interviews Conducted" },
  { value: "92%", label: "Job Offer Rate" },
  { value: "10+", label: "Job Roles Covered" },
  { value: "4.9★", label: "Average Rating" },
];

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Ace Your Next{" "}
            <span className="gradient-text">Technical Interview</span>{" "}
            with AI
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Verisium simulates real technical interviews with AI. Get personalized questions,
            instant scoring, and detailed feedback to land your dream job faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {userId ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105">
                    Start Mock Interview — Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="px-8 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-lg hover:border-slate-500 hover:text-white transition-all">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero card preview */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="glass-card rounded-2xl p-6 glow-violet">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-slate-500 ml-2">Verisium Interview Session</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card rounded-xl p-3 text-sm text-slate-300 flex-1">
                  Explain the difference between <code className="text-violet-400 bg-violet-400/10 px-1 rounded">useEffect</code> and <code className="text-violet-400 bg-violet-400/10 px-1 rounded">useLayoutEffect</code> in React. When would you choose one over the other?
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-300">U</div>
                <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-3 text-sm text-slate-300 flex-1 text-right">
                  useEffect runs after the browser paints, while useLayoutEffect runs synchronously after DOM mutations but before paint. I&apos;d use useLayoutEffect when I need to measure DOM elements or prevent flickering...
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-500" />)}
                  {[6,7,8,9,10].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-700" />)}
                </div>
                <span className="text-xs text-slate-500">Question 1 of 10</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">nail the interview</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Verisium combines cutting-edge AI with proven interview prep techniques to give you a real edge.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 hover:border-slate-600/50 transition-all group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="gradient-text">Verisium</span> works
            </h2>
            <p className="text-slate-400 text-lg">From signup to feedback in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="text-4xl font-black gradient-text mb-4">{step.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-violet-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Developers love <span className="gradient-text">Verisium</span>
            </h2>
            <p className="text-slate-400 text-lg">Join thousands of engineers who leveled up their interview game.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 glow-violet">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to ace your next interview?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Start practicing today. It's completely free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {userId ? (
                <Link
                  href="/dashboard/interview/new"
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105"
                >
                  Start Mock Interview
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105">
                    Start Mock Interview — Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited practice</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">Verisium</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Verisium. Built with 💜 using Next.js & Google Gemini AI.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
