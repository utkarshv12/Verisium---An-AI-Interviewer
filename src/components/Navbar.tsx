"use client";

import Link from "next/link";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center group-hover:opacity-80 transition-opacity">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Verisium</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity">
                    Get Started Free
                  </button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 flex flex-col gap-4">
          <Link href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</Link>
          <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm">How it works</Link>
          {isSignedIn ? (
            <Link href="/dashboard" className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-center">
              Dashboard
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm text-slate-300 hover:text-white">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium">
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
