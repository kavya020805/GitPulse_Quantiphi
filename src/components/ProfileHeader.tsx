"use client";

import React from "react";
import { Star, GitFork, Users, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { motion } from "framer-motion";
import { LanguageStat } from "@/services/analytics.service";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { BlurText } from "./react-bits/BlurText";
import { CountUp } from "./react-bits/CountUp";
import { DecryptedText } from "./react-bits/DecryptedText";

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

// Custom glassmorphic tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-zinc-950/90 border border-zinc-800 px-3 py-2 rounded-lg shadow-xl text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
        <span className="text-zinc-200 font-medium">{data.name}</span>
      </div>
      <p className="text-zinc-400 mt-0.5">{data.value.toFixed(1)}% share</p>
    </div>
  );
};

export function ProfileHeader({ user, vibeCheckResult, onOpenVibeCheck }: ProfileHeaderProps) {
  const matchScore = vibeCheckResult?.matchPercentage ?? null;
  const primaryLang = user.top_languages?.[0];

  const getBadgeColor = (score: number) => {
    if (score >= 75) return { border: "border-emerald-500/50", text: "text-emerald-400", bg: "bg-emerald-950/40" };
    if (score >= 50) return { border: "border-amber-500/50", text: "text-amber-400", bg: "bg-amber-950/40" };
    return { border: "border-rose-500/50", text: "text-rose-400", bg: "bg-rose-950/40" };
  };

  const badgeStyle = matchScore !== null ? getBadgeColor(matchScore) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full glass-card p-6 sm:p-8 relative overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left: Profile Info (7 cols) */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="shrink-0"
          >
            <img
              src={user.avatar_url || `https://github.com/${user.username}.png`}
              alt={user.name || user.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-zinc-700/80 shadow-2xl"
            />
          </motion.div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Name + Username */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
                <BlurText text={user.name || user.username} />
              </h1>
              <a
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition"
              >
                @{user.username}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Bio */}
            <p className="text-[13px] text-zinc-400 leading-relaxed max-w-xl line-clamp-2">
              {user.bio || "Building modern software at the intersection of performance, design, and developer experience."}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-2">
              <StatPill icon={<Users className="w-3 h-3 text-zinc-500" />} label="followers">
                <CountUp target={user.followers} className="font-semibold text-zinc-100" />
              </StatPill>
              <StatPill icon={<Star className="w-3 h-3 text-amber-400/80" />} label="stars">
                <CountUp target={user.total_stars} className="font-semibold text-zinc-100" />
              </StatPill>
              <StatPill icon={<GitFork className="w-3 h-3 text-cyan-400/80" />} label="forks">
                <CountUp target={user.total_forks} className="font-semibold text-zinc-100" />
              </StatPill>
              <StatPill icon={<BookOpen className="w-3 h-3 text-zinc-500" />} label="repos">
                <CountUp target={user.public_repos} className="font-semibold text-zinc-100" />
              </StatPill>
            </div>

            {/* Vibe Check Badge */}
            <div className="pt-2">
              {badgeStyle && matchScore !== null ? (
                <motion.button
                  onClick={onOpenVibeCheck}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${badgeStyle.border} ${badgeStyle.bg} transition hover:brightness-110 cursor-pointer`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    JD Match
                  </span>
                  <span className={`text-base font-bold font-mono tabular-nums ${badgeStyle.text}`}>
                    <DecryptedText text={`${matchScore}%`} speed={30} />
                  </span>
                  <span className="text-[11px] text-zinc-500 border-l border-zinc-700/60 pl-2">
                    {vibeCheckResult?.badgeLabel}
                  </span>
                </motion.button>
              ) : (
                <button
                  onClick={onOpenVibeCheck}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:border-emerald-500/40 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Run Vibe Check against a Job Description
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Donut Chart (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-500">
                Language Distribution
              </h3>
              <span className="text-[10px] font-mono text-zinc-600">by repository</span>
            </div>

            {user.top_languages && user.top_languages.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Donut */}
                <div className="w-[160px] h-[160px] relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={user.top_languages}
                        dataKey="percentage"
                        nameKey="language"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {user.top_languages.map((entry, index) => (
                          <Cell key={index} fill={entry.color} className="transition-opacity hover:opacity-80" />
                        ))}
                        <Label
                          content={() => (
                            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x="50%"
                                className="fill-zinc-100 text-[15px] font-semibold"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                {primaryLang?.language || "—"}
                              </tspan>
                              <tspan
                                x="50%"
                                dy="16"
                                className="fill-zinc-500 text-[11px]"
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

                {/* Legend */}
                <div className="flex-1 w-full space-y-1.5">
                  {user.top_languages.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[12px] group">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-zinc-300 group-hover:text-zinc-100 transition truncate">
                          {item.language}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-500 tabular-nums ml-3">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-zinc-600">
                No language data available
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800/60 text-[11px]">
      {icon}
      {children}
      <span className="text-zinc-500">{label}</span>
    </div>
  );
}
