import { SignUp } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export default function SignUpPage({ params }: { params: Promise<{ "sign-up": string[] }> }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <Link href="/" className="flex items-center gap-2 mb-10 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold gradient-text">Verisium</span>
      </Link>
      <div className="relative z-10">
        <SignUp fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
