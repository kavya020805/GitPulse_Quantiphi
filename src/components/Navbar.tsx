"use client";

import React, { useState, useEffect } from "react";
import { Search, Database, RefreshCw, Zap, Sparkles, Command } from "lucide-react";
import { toast } from "sonner";

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
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchInput(currentUsername);
  }, [currentUsername]);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("gitpulse-search") as HTMLInputElement;
        input?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
      return `${Math.floor(diffMin / 60)}h ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Zap className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-zinc-100">
            GitPulse
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md">
          <div className={`relative flex items-center transition-all duration-200 rounded-lg border ${isFocused ? "border-zinc-600 ring-1 ring-zinc-700" : "border-zinc-800"} bg-zinc-900/80`}>
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
            <input
              id="gitpulse-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search GitHub username..."
              className="w-full pl-9 pr-20 py-1.5 text-[13px] bg-transparent text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded border border-zinc-700/80">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
              <button
                type="submit"
                disabled={isLoading}
                className="px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 transition"
              >
                Go
              </button>
            </div>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cache Badge */}
          {cacheStatus && (
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-md border ${
                cacheStatus === "HIT"
                  ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400"
                  : "bg-cyan-950/30 border-cyan-800/40 text-cyan-400"
              }`}
            >
              <Database className="w-3 h-3" />
              <span>
                {cacheStatus === "HIT"
                  ? `SQLite Cache · ${formatCachedTime(cachedAt)}`
                  : "Live Fetch"}
              </span>
            </div>
          )}

          {/* Force Sync */}
          <button
            onClick={() => {
              onForceSync();
              toast("Forcing live sync from GitHub API...", {
                icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
              });
            }}
            disabled={isLoading}
            title="Force refresh from GitHub"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/60 transition disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          {/* Vibe Check */}
          <button
            onClick={onOpenVibeCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vibe Check</span>
          </button>
        </div>
      </div>
    </header>
  );
}
