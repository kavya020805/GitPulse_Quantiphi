"use client";

import React, { useState } from "react";
import { Search, Database, RefreshCw, Zap, Sparkles } from "lucide-react";

interface NavbarProps {
  currentUsername: string;
  cacheStatus: "HIT" | "MISS" | null;
  cachedAt: string | null;
  isLoading: boolean;
  onSearch: (username: string) => void;
  onForceSync: () => void;
  onOpenVibeCheck: () => void;
}

export function Navbar({
  currentUsername,
  cacheStatus,
  cachedAt,
  isLoading,
  onSearch,
  onForceSync,
  onOpenVibeCheck,
}: NavbarProps) {
  const [searchInput, setSearchInput] = useState(currentUsername);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const formatCachedTime = (isoString: string | null) => {
    if (!isoString) return "just now";
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      return `${diffHours}h ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                GitPulse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Developer Portfolio</p>
          </div>
        </div>

        {/* Center: Search Username */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter GitHub username (e.g. shadcn, torvalds)..."
              className="w-full pl-9 pr-20 py-1.5 text-sm bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Analyze
            </button>
          </div>
        </form>

        {/* Right Actions: Cache Badge, Force Sync, Vibe Check */}
        <div className="flex items-center gap-2.5">
          {/* SQLite Cache Badge */}
          {cacheStatus && (
            <div
              className={`hidden md:flex items-center gap-2 px-2.5 py-1 text-xs rounded-lg border ${
                cacheStatus === "HIT"
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                  : "bg-cyan-950/40 border-cyan-800/60 text-cyan-300"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {cacheStatus === "HIT"
                  ? `SQLite Cache (${formatCachedTime(cachedAt)})`
                  : "Live GitHub API"}
              </span>
            </div>
          )}

          {/* Force Sync Button */}
          <button
            onClick={onForceSync}
            disabled={isLoading}
            title="Bypass cache and force refresh from GitHub API"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Force Sync</span>
          </button>

          {/* Vibe Check Button */}
          <button
            onClick={onOpenVibeCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-900/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vibe Check</span>
          </button>
        </div>
      </div>
    </header>
  );
}
