"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ContributionGraph } from "@/components/ContributionGraph";
import { RepositoryGrid } from "@/components/RepositoryGrid";
import { VibeCheckBentoCard } from "@/components/VibeCheckBentoCard";
import { VibeCheckDrawer } from "@/components/VibeCheckDrawer";
import { PortfolioChatbot } from "@/components/PortfolioChatbot";
import { Squares } from "@/components/react-bits/Squares";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Skeleton loaders
function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-900/60 border border-white/[0.06] rounded-2xl ${className}`}
    />
  );
}

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("kavya020805");
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [cacheStatus, setCacheStatus] = useState<"HIT" | "MISS" | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVibeCheckOpen, setIsVibeCheckOpen] = useState<boolean>(false);
  const [vibeCheckResult, setVibeCheckResult] = useState<VibeCheckResult | null>(null);

  const fetchPortfolio = useCallback(
    async (targetUser: string, forceRefresh: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/portfolio/${encodeURIComponent(targetUser)}${forceRefresh ? "?refresh=true" : ""}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.data) {
          setPortfolioData(data.data);
          setCacheStatus(data.cacheStatus);
          setCachedAt(data.cachedAt);

          if (data.data.userSettings?.last_match_details) {
            setVibeCheckResult(data.data.userSettings.last_match_details);
          } else {
            setVibeCheckResult(null);
          }

          // Toast notification for cache status
          if (data.cacheStatus === "HIT") {
            toast.success("Loaded from SQLite cache", {
              description: `Served @${targetUser} profile in <5ms`,
            });
          } else {
            toast.success("Fetched live from GitHub API", {
              description: `Profile for @${targetUser} synced & persisted to SQLite`,
            });
          }
        } else {
          setError(data.error || "Failed to load portfolio data.");
        }
      } catch (err: any) {
        setError(err.message || "Network error communicating with backend.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPortfolio(username, false);
  }, [username, fetchPortfolio]);

  const handleSearch = (newUsername: string) => setUsername(newUsername);
  const handleForceSync = () => fetchPortfolio(username, true);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-50 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Step 1: Ambient React Bits Squares Background Canvas */}
      <Squares
        direction="diagonal"
        speed={0.4}
        squareSize={44}
        borderColor="rgba(255, 255, 255, 0.035)"
        hoverFillColor="rgba(16, 185, 129, 0.08)"
      />

      {/* Navigation */}
      <Navbar
        currentUsername={username}
        cacheStatus={cacheStatus}
        cachedAt={cachedAt}
        isLoading={isLoading}
        onSearch={handleSearch}
        onForceSync={handleForceSync}
        onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
      />

      {/* Main Asymmetric Bento Grid */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 text-red-300 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchPortfolio(username, true)}
              className="flex items-center gap-1 font-medium text-white px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-900/80 transition"
            >
              <RefreshCw className="w-3 h-3" /> Retry Sync
            </button>
          </div>
        )}

        {/* Skeleton Placeholders during Loading */}
        {isLoading && !portfolioData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <SkeletonBlock className="lg:col-span-4 h-64" />
              <SkeletonBlock className="lg:col-span-4 h-64" />
              <SkeletonBlock className="lg:col-span-4 h-64" />
            </div>
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-64" />
          </div>
        )}

        {/* Dashboard Loaded Content */}
        {portfolioData && (
          <div className="space-y-6">
            {/* ─── ROW 1: 12-Column Asymmetric Bento Header ─── */}
            <section aria-label="Profile and Metrics Bento Header">
              <ProfileHeader
                user={portfolioData.user}
                vibeCheckResult={vibeCheckResult}
                onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
              />
            </section>

            {/* ─── ROW 2: Full-Width Contribution Heatmap ─── */}
            <section aria-label="Annual Contribution Activity">
              <ContributionGraph contributions={portfolioData.user.contributions} />
            </section>

            {/* ─── ROW 3: Vibe Check Matcher Engine Bento Card ─── */}
            <section aria-label="The Vibe Check Job Matcher">
              <VibeCheckBentoCard
                username={username}
                result={vibeCheckResult}
                onResultUpdated={(newRes) => setVibeCheckResult(newRes)}
                onOpenDrawer={() => setIsVibeCheckOpen(true)}
              />
            </section>

            {/* ─── ROW 4: Interactive Repository Grid ─── */}
            <section aria-label="Repository Explorer">
              <RepositoryGrid repositories={portfolioData.repositories} />
            </section>
          </div>
        )}
      </main>

      {/* The Vibe Check Full Drawer (Modal for Pitch & Readme Snippet) */}
      <VibeCheckDrawer
        isOpen={isVibeCheckOpen}
        onClose={() => setIsVibeCheckOpen(false)}
        username={username}
        initialResult={vibeCheckResult}
        onResultUpdated={(newRes) => {
          setVibeCheckResult(newRes);
          toast.success(`Vibe Check: ${newRes.matchPercentage}% Compatibility`, {
            description: newRes.badgeLabel,
          });
        }}
      />

      {/* Portfolio Chatbot Agent grounded in SQLite */}
      <PortfolioChatbot username={username} />

      {/* Obsidian Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-6 text-center text-[11px] text-zinc-400 font-mono">
        GitPulse · Obsidian Bento Design · React Bits · Next.js 14 · SQLite (better-sqlite3)
      </footer>
    </div>
  );
}
