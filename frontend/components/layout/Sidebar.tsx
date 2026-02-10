"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, CheckCircle, Briefcase, Layers, Settings, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Resume", href: "/builder", icon: FileText },
  { name: "Analyze Resume", href: "/analyzer", icon: CheckCircle },
  { name: "Templates", href: "/templates", icon: Layers },
  { name: "Job Match", href: "/jobs", icon: Briefcase },
  { name: "Guide", href: "/guide", icon: BookOpen },
];

const bottomNav = [
  { name: "Help", href: "#", icon: HelpCircle },
  { name: "Settings", href: "#", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useApp();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span>SpellFolio</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-2">
        {bottomNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <item.icon className="mr-3 h-5 w-5 text-slate-400" />
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-900 truncate">{user?.name || "User"}</span>
            <span className="text-xs text-slate-500 truncate">{user?.email || "user@email.com"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
