"use client";

import React from "react";
import { Star, GitFork, Users, BookOpen, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { LanguageStat } from "@/services/analytics.service";
import { VibeCheckResult } from "@/services/vibecheck.service";

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

export function ProfileHeader({
  user,
  vibeCheckResult,
  onOpenVibeCheck,
}: ProfileHeaderProps) {
  const matchScore = vibeCheckResult?.matchPercentage ?? null;

  const getBadgeStyle = (score: number) => {
    if (score >= 75) {
      return {
        bg: "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-emerald-900/30",
        ring: "ring-emerald-500/40",
        text: "text-emerald-400",
      };
    }
    if (score >= 50) {
      return {
        bg: "bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-amber-900/30",
        ring: "ring-amber-500/40",
        text: "text-amber-400",
      };
    }
    return {
      bg: "bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-rose-900/30",
      ring: "ring-rose-500/40",
      text: "text-rose-400",
    };
  };

  const badgeStyle = matchScore !== null ? getBadgeStyle(matchScore) : null;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Avatar, Bio, Follower stats (7 cols) */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={user.avatar_url || `https://github.com/${user.username}.png`}
              alt={user.name || user.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-slate-700/80 shadow-2xl transition duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1 rounded-full border border-slate-700 shadow">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                {user.name || user.username}
              </h1>
              <a
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
              >
                @{user.username}
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl line-clamp-3">
              {user.bio || "Full-stack engineer crafting scalable web applications, backend architectures, and open-source tooling."}
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  <strong className="text-white">{user.followers}</strong> followers
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  <strong className="text-white">{user.following}</strong> following
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-300">Total Stars:</span>
                <strong className="text-white font-bold">{user.total_stars}</strong>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-300">
                <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">Forks:</span>
                <strong className="text-white font-bold">{user.total_forks}</strong>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  <strong className="text-white">{user.public_repos}</strong> repos
                </span>
              </div>
            </div>

            {/* Prominent Vibe Check Compatibility Badge */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-3">
              {badgeStyle && matchScore !== null ? (
                <div
                  onClick={onOpenVibeCheck}
                  className={`cursor-pointer inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border ${badgeStyle.bg} shadow-lg transition hover:brightness-110`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    JD Match Score:
                  </span>
                  <span className={`text-sm font-extrabold ${badgeStyle.text}`}>
                    {matchScore}%
                  </span>
                  <span className="text-xs font-medium text-slate-300 border-l border-slate-700/60 pl-2">
                    {vibeCheckResult?.badgeLabel}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onOpenVibeCheck}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Run "Vibe Check" with Target Job Description
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recharts Interactive Top Languages Donut Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400">
              Top Languages Breakdown
            </h3>
            <span className="text-[11px] text-slate-500">By Repository Share</span>
          </div>

          {user.top_languages && user.top_languages.length > 0 ? (
            <div className="w-full flex flex-col sm:flex-row items-center gap-4">
              {/* Donut Chart */}
              <div className="w-36 h-36 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                      itemStyle={{ color: "#38bdf8" }}
                    />
                    <Pie
                      data={user.top_languages}
                      dataKey="percentage"
                      nameKey="language"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {user.top_languages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                {user.top_languages.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-200 truncate">{item.language}</span>
                    <span className="text-slate-500 text-[11px] ml-auto">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-28 flex items-center justify-center text-xs text-slate-500">
              No language data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
