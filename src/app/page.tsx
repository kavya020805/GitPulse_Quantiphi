"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ContributionGraph } from "@/components/ContributionGraph";
import { RepositoryGrid } from "@/components/RepositoryGrid";
import { VibeCheckDrawer } from "@/components/VibeCheckDrawer";
import { PortfolioChatbot } from "@/components/PortfolioChatbot";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("shadcn");
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [cacheStatus, setCacheStatus] = useState<"HIT" | "MISS" | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vibe Check modal & result state
  const [isVibeCheckOpen, setIsVibeCheckOpen] = useState<boolean>(false);
  const [vibeCheckResult, setVibeCheckResult] = useState<VibeCheckResult | null>(null);

  const fetchPortfolio = useCallback(
    async (targetUser: string, forceRefresh: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/portfolio/${encodeURIComponent(targetUser)}${
          forceRefresh ? "?refresh=true" : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.data) {
          setPortfolioData(data.data);
          setCacheStatus(data.cacheStatus);
          setCachedAt(data.cachedAt);

          // Restore saved Vibe Check score from SQLite cache if available
          if (data.data.userSettings?.last_match_details) {
            setVibeCheckResult(data.data.userSettings.last_match_details);
          } else {
            setVibeCheckResult(null);
          }
        } else {
          setError(data.error || "Failed to load GitHub portfolio data.");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading portfolio data.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPortfolio(username, false);
  }, [username, fetchPortfolio]);

  const handleSearch = (newUsername: string) => {
    setUsername(newUsername);
  };

  const handleForceSync = () => {
    fetchPortfolio(username, true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUsername={username}
        cacheStatus={cacheStatus}
        cachedAt={cachedAt}
        isLoading={isLoading}
        onSearch={handleSearch}
        onForceSync={handleForceSync}
        onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchPortfolio(username, true)}
              className="flex items-center gap-1 font-semibold text-white px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-900 transition"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !portfolioData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800" />
            <div className="h-56 rounded-2xl bg-slate-900/60 border border-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800" />
              <div className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800" />
              <div className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800" />
            </div>
          </div>
        )}

        {/* Loaded Portfolio Views */}
        {portfolioData && (
          <>
            {/* 1. Profile Header with Top Languages Recharts Pie and Vibe Check Badge */}
            <ProfileHeader
              user={portfolioData.user}
              vibeCheckResult={vibeCheckResult}
              onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
            />

            {/* 2. 52-Week Contribution Heatmap Grid and Streaks */}
            <ContributionGraph contributions={portfolioData.user.contributions} />

            {/* 3. Filterable Repository Showcase Grid */}
            <RepositoryGrid repositories={portfolioData.repositories} />
          </>
        )}
      </main>

      {/* Vibe Check Modal / Drawer */}
      <VibeCheckDrawer
        isOpen={isVibeCheckOpen}
        onClose={() => setIsVibeCheckOpen(false)}
        username={username}
        initialResult={vibeCheckResult}
        onResultUpdated={(newRes) => setVibeCheckResult(newRes)}
      />

      {/* Floating Ask My Portfolio Chatbot Widget */}
      <PortfolioChatbot username={username} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>
          GitPulse • Built with Next.js 14, TypeScript, SQLite (<code className="text-emerald-400">better-sqlite3</code>), Recharts & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}

