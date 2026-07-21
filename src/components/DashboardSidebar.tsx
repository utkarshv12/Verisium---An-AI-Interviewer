import Link from "next/link";
import {
  Brain,
  LayoutDashboard,
  PlusCircle,
  History,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/interview/new", icon: PlusCircle, label: "New Interview" },
  { href: "/dashboard/history", icon: History, label: "History" },
];

export default async function DashboardSidebar() {
  const user = await currentUser();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-950 border-r border-slate-800 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">Verisium</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group"
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{link.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
