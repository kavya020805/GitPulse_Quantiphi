"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ContributionGraph } from "@/components/ContributionGraph";
import { RepositoryGrid } from "@/components/RepositoryGrid";
import { VibeCheckDrawer } from "@/components/VibeCheckDrawer";
import { PortfolioChatbot } from "@/components/PortfolioChatbot";
import { DotGridBackground } from "@/components/react-bits/DotGridBackground";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Skeleton components
function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-900/60 border border-zinc-800/60 rounded-2xl ${className}`} />;
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
              description: `Cached profile for @${targetUser} served in <5ms`,
            });
          } else {
            toast.success("Fetched live from GitHub API", {
              description: `Profile for @${targetUser} synced & cached to SQLite`,
            });
          }
        } else {
          setError(data.error || "Failed to load portfolio data.");
        }
      } catch (err: any) {
        setError(err.message || "Network error.");
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      <DotGridBackground />

      <Navbar
        currentUsername={username}
        cacheStatus={cacheStatus}
        cachedAt={cachedAt}
        isLoading={isLoading}
        onSearch={handleSearch}
        onForceSync={handleForceSync}
        onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 flex items-center justify-between gap-3 text-[13px]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchPortfolio(username, true)}
              className="flex items-center gap-1 font-medium text-white px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/60 transition text-[12px]"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Skeleton Loading */}
        {isLoading && !portfolioData && (
          <div className="space-y-6">
            <SkeletonBlock className="h-48" />
            <SkeletonBlock className="h-52" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {portfolioData && (
          <>
            <ProfileHeader
              user={portfolioData.user}
              vibeCheckResult={vibeCheckResult}
              onOpenVibeCheck={() => setIsVibeCheckOpen(true)}
            />
            <ContributionGraph contributions={portfolioData.user.contributions} />
            <RepositoryGrid repositories={portfolioData.repositories} />
          </>
        )}
      </main>

      {/* Vibe Check Drawer */}
      <VibeCheckDrawer
        isOpen={isVibeCheckOpen}
        onClose={() => setIsVibeCheckOpen(false)}
        username={username}
        initialResult={vibeCheckResult}
        onResultUpdated={(newRes) => {
          setVibeCheckResult(newRes);
          toast.success(`Vibe Check: ${newRes.matchPercentage}% Match`, {
            description: newRes.badgeLabel,
          });
        }}
      />

      {/* Chatbot */}
      <PortfolioChatbot username={username} />

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 text-center text-[11px] text-zinc-600 font-mono">
        GitPulse · Next.js 14 · TypeScript · SQLite (better-sqlite3) · Recharts · Tailwind CSS
      </footer>
    </div>
  );
}
