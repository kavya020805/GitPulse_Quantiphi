"use client";

import React from "react";
import { Star, GitFork, Users, BookOpen, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { motion } from "framer-motion";
import { LanguageStat } from "@/services/analytics.service";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { BlurText } from "./react-bits/BlurText";
import { CountUp } from "./react-bits/CountUp";
import { DecryptedText } from "./react-bits/DecryptedText";
import { SpotlightCard } from "./react-bits/SpotlightCard";
import { TiltedCard } from "./react-bits/TiltedCard";
import { StarBorder } from "./react-bits/StarBorder";
import { ShinyText } from "./react-bits/ShinyText";

interface ProfileHeaderProps {
  user: {
    username: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
    followers: number;
    following: number;
    public_repos: number;
    total_stars: number;
    total_forks: number;
    top_languages: LanguageStat[];
  };
  vibeCheckResult: VibeCheckResult | null;
  onOpenVibeCheck: () => void;
}

// Custom glassmorphic tooltip for language donut
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-zinc-950/95 border border-zinc-800 px-3 py-2 rounded-xl shadow-2xl text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
        <span className="text-zinc-200 font-semibold">{data.name}</span>
      </div>
      <p className="text-zinc-400 mt-1">{data.value.toFixed(1)}% repository share</p>
    </div>
  );
};

export function ProfileHeader({ user, vibeCheckResult, onOpenVibeCheck }: ProfileHeaderProps) {
  const matchScore = vibeCheckResult?.matchPercentage ?? null;
  const primaryLang = user.top_languages?.[0];

  const getBorderColor = (score: number) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#f43f5e";
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* ─── BENTO COL 1-4: TiltedCard Avatar + Bio + Socials + StarBorder Badge ─── */}
      <div className="lg:col-span-4 h-full">
        <TiltedCard maxTilt={6} className="h-full">
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.12)"
            className="h-full p-6 flex flex-col justify-between"
          >
            <div>
              {/* Avatar + Identity */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar_url || `https://github.com/${user.username}.png`}
                    alt={user.name || user.username}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-1 ring-white/10 shadow-2xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-950 font-bold" title="Cached & Verified">
                    <ShieldCheck className="w-3 h-3 text-zinc-950 stroke-[3]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight leading-snug truncate">
                    <BlurText text={user.name || user.username} />
                  </h1>
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-0.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    @{user.username}
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-4 text-[13px] text-zinc-400 leading-relaxed line-clamp-3">
                {user.bio || "Building modern, resilient software architectures. Crafting high-performance web systems with clean code."}
              </p>
            </div>

            {/* Dynamic StarBorder Vibe Check Badge */}
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              {matchScore !== null ? (
                <StarBorder
                  onClick={onOpenVibeCheck}
                  color={getBorderColor(matchScore)}
                  speed="3.5s"
                  className="w-full cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Tech Stack Match:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        <DecryptedText text={`${matchScore}%`} speed={25} />
                      </span>
                      <span className="text-[10px] text-zinc-400 border-l border-zinc-700/80 pl-2 max-w-[120px] truncate">
                        {vibeCheckResult?.badgeLabel}
                      </span>
                    </div>
                  </div>
                </StarBorder>
              ) : (
                <StarBorder
                  onClick={onOpenVibeCheck}
                  color="#10b981"
                  speed="4s"
                  className="w-full cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 w-full py-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-zinc-200">
                      <ShinyText text="Run Tech Stack Vibe Check" />
                    </span>
                  </div>
                </StarBorder>
              )}
            </div>
          </SpotlightCard>
        </TiltedCard>
      </div>

      {/* ─── BENTO COL 5-8: 2x2 Grid of SpotlightCard KPI Blocks with CountUp ─── */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-3 h-full">
        {/* KPI 1: Followers */}
        <SpotlightCard
          spotlightColor="rgba(255, 255, 255, 0.08)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Followers</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-white/[0.06] flex items-center justify-center text-zinc-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 tabular-nums">
              <CountUp target={user.followers} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">GitHub Developer Network</p>
          </div>
        </SpotlightCard>

        {/* KPI 2: Total Stars */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total Stars</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 tabular-nums">
              <CountUp target={user.total_stars} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Aggregated Repo Impact</p>
          </div>
        </SpotlightCard>

        {/* KPI 3: Forks */}
        <SpotlightCard
          spotlightColor="rgba(6, 182, 212, 0.12)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Forks</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
              <CountUp target={user.total_forks} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Community Code Adaptations</p>
          </div>
        </SpotlightCard>

        {/* KPI 4: Public Repos */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.12)"
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Repositories</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300 tabular-nums">
              <CountUp target={user.public_repos} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Public Source Repositories</p>
          </div>
        </SpotlightCard>
      </div>

      {/* ─── BENTO COL 9-12: Interactive Top Languages Donut Chart ─── */}
      <div className="lg:col-span-4 h-full">
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.10)"
          className="p-6 h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 tracking-tight">
                Language Distribution
              </h3>
              <p className="text-[10px] font-mono text-zinc-400">Calculated across all repositories</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.06]">
              {user.top_languages?.length || 0} Languages
            </span>
          </div>

          {user.top_languages && user.top_languages.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
              {/* Donut Chart */}
              <div className="w-[140px] h-[140px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={user.top_languages}
                      dataKey="percentage"
                      nameKey="language"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={65}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {user.top_languages.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                          className="transition-opacity hover:opacity-80 outline-none"
                        />
                      ))}
                      <Label
                        content={() => (
                          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle">
                            <tspan
                              x="50%"
                              className="fill-zinc-100 text-[13px] font-semibold"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {primaryLang?.language || "—"}
                            </tspan>
                            <tspan
                              x="50%"
                              dy="15"
                              className="fill-zinc-400 text-[10px]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {primaryLang ? `${primaryLang.percentage}%` : ""}
                            </tspan>
                          </text>
                        )}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Language Legend */}
              <div className="flex-1 w-full space-y-2">
                {user.top_languages.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300 group-hover:text-zinc-100 transition truncate text-[11px]">
                        {item.language}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400 tabular-nums ml-2">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-zinc-600 font-mono">
              No language data available
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Primary: {primaryLang?.language || "N/A"}</span>
            <span className="text-emerald-400">★ Server Aggregated</span>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
