"use client";

import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { useState, useRef, useEffect } from "react";

export function Header({ title }: { title?: string }) {
  const { user, logout, isLoggedIn } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Optional title, no branding */}
      <div className="flex items-center gap-2">
        {title ? (
          <span className="text-base sm:text-lg font-semibold text-slate-800 line-clamp-1">{title}</span>
        ) : null}
      </div>

      {/* Right side — user avatar only */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-full bg-slate-100 p-1 pr-3 hover:bg-slate-200 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user?.name || "User"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
