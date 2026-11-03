"use client";

import React, { useState } from "react";
import { Flame, Trophy, Calendar, Sparkles } from "lucide-react";
import { ContributionAnalytics, DailyContribution } from "@/services/analytics.service";

interface ContributionGraphProps {
  contributions: ContributionAnalytics;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-slate-800/80 hover:ring-1 hover:ring-slate-500",
  1: "bg-emerald-950/90 text-emerald-300 hover:ring-1 hover:ring-emerald-400",
  2: "bg-emerald-800 text-emerald-200 hover:ring-1 hover:ring-emerald-300",
  3: "bg-emerald-600 text-white hover:ring-1 hover:ring-emerald-200",
  4: "bg-emerald-400 text-slate-950 hover:ring-1 hover:ring-white",
};

export function ContributionGraph({ contributions }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyContribution | null>(null);

  const days = contributions.days || [];

  // Group days into 52/53 columns of 7 days
  const weeks: DailyContribution[][] = [];
  let currentWeek: DailyContribution[] = [];

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur shadow-xl">
      {/* Header with Server-Computed Streak Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Activity & Contribution Heatmap
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              52 Weeks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-computed streaks and daily commit intensity
          </p>
        </div>

        {/* Streak Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-500/30 text-orange-300">
            <Flame className="w-4 h-4 text-orange-400 fill-current" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] leading-none uppercase font-semibold">
                Current Streak
              </span>
              <strong className="text-sm font-extrabold text-orange-200">
                {contributions.currentStreak} Days
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <Trophy className="w-4 h-4 text-amber-400 fill-current" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] leading-none uppercase font-semibold">
                Longest Streak
              </span>
              <strong className="text-sm font-extrabold text-amber-200">
                {contributions.longestStreak} Days
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] leading-none uppercase font-semibold">
                Total Year
              </span>
              <strong className="text-sm font-extrabold text-emerald-200">
                {contributions.totalContributions} Commits
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[720px] flex flex-col gap-1">
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  const colorClass = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-[3px] transition-all cursor-pointer ${colorClass}`}
                      title={`${day.count} contributions on ${day.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Live Hover Detail & Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="min-h-[20px]">
          {hoveredDay ? (
            <span className="text-slate-200 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <strong>{hoveredDay.count} contributions</strong> on {formatDate(hoveredDay.date)}
            </span>
          ) : (
            <span className="text-slate-500">Hover over any cell to inspect daily commit cadence</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-800/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950/90" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
          <span className="text-slate-500 text-[11px]">More</span>
        </div>
      </div>
    </div>
  );
}
