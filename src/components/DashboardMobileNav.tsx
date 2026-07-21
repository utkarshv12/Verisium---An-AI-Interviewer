"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain, LayoutDashboard, PlusCircle, History, Menu, X, ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/interview/new", icon: PlusCircle, label: "New Interview" },
  { href: "/dashboard/history", icon: History, label: "History" },
];

export default function DashboardMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Verisium</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton />
          <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <link.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          ))}
        </div>
      )}

      {/* Spacer for mobile */}
      <div className="lg:hidden h-14" />
    </>
  );
}
