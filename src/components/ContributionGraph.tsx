"use client";

import React, { useState, useMemo } from "react";
import { Flame, Trophy, Calendar, Activity } from "lucide-react";
import { ContributionAnalytics, DailyContribution } from "@/services/analytics.service";
import { CountUp } from "./react-bits/CountUp";
import { SpotlightCard } from "./react-bits/SpotlightCard";

interface ContributionGraphProps {
  contributions: ContributionAnalytics;
}

// Official GitHub dark-mode emerald intensity scale
const LEVEL_COLORS: Record<number, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

export function ContributionGraph({ contributions }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyContribution | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const days = contributions.days || [];

  // Group 365 days into 7-day calendar columns (weeks)
  const weeks: DailyContribution[][] = useMemo(() => {
    const w: DailyContribution[][] = [];
    let curr: DailyContribution[] = [];
    for (const day of days) {
      curr.push(day);
      if (curr.length === 7) {
        w.push(curr);
        curr = [];
      }
    }
    if (curr.length > 0) w.push(curr);
    return w;
  }, [days]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.12)"
      className="w-full p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                Contribution Heatmap
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                Annual Matrix
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
              365 consecutive days · server-computed streak algorithms
            </p>
          </div>
        </div>

        {/* Streak Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StreakPill
            icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
            label="Current Streak"
            value={contributions.currentStreak}
            suffix=" days"
            color="text-orange-300"
          />
          <StreakPill
            icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
            label="Longest Streak"
            value={contributions.longestStreak}
            suffix=" days"
            color="text-amber-300"
          />
          <StreakPill
            icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
            label="Total Contributions"
            value={contributions.totalContributions}
            suffix=""
            color="text-emerald-300"
          />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-5 overflow-x-auto pb-2 relative">
        <div className="min-w-[700px] flex gap-[3.5px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[3.5px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => {
                    setHoveredDay(day);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="w-[11.5px] h-[11.5px] rounded-[2.5px] cursor-crosshair transition-all duration-150 hover:ring-1 hover:ring-emerald-400 hover:scale-125 hover:z-20"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] || LEVEL_COLORS[0] }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Floating Instant Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="bg-zinc-950/95 border border-zinc-700/80 px-3 py-1.5 rounded-lg shadow-2xl text-[11px] font-mono whitespace-nowrap backdrop-blur-md">
              <span className="text-emerald-400 font-bold">{hoveredDay.count}</span>
              <span className="text-zinc-400"> contributions on </span>
              <span className="text-zinc-200">{formatDate(hoveredDay.date)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Legend & Status */}
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <span>{hoveredDay ? `Viewing: ${hoveredDay.date}` : "Hover any cell for exact timestamp count"}</span>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-[10px] text-zinc-400 uppercase">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            />
          ))}
          <span className="ml-1 text-[10px] text-zinc-400 uppercase">More</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

function StreakPill({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
      {icon}
      <div className="text-[11px]">
        <span className="text-zinc-400 block text-[10px] font-mono uppercase leading-tight">
          {label}
        </span>
        <span className={`font-mono font-semibold text-xs tabular-nums ${color}`}>
          <CountUp target={value} />
          {suffix}
        </span>
      </div>
    </div>
  );
}
