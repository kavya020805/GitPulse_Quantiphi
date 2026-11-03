"use client";

import React, { useState, useMemo } from "react";
import { Flame, Trophy, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { ContributionAnalytics, DailyContribution } from "@/services/analytics.service";
import { CountUp } from "./react-bits/CountUp";

interface ContributionGraphProps {
  contributions: ContributionAnalytics;
}

// GitHub dark-mode emerald intensity palette
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

  // Group days into weeks
  const weeks: DailyContribution[][] = useMemo(() => {
    const w: DailyContribution[][] = [];
    let curr: DailyContribution[] = [];
    for (const day of days) {
      curr.push(day);
      if (curr.length === 7) { w.push(curr); curr = []; }
    }
    if (curr.length > 0) w.push(curr);
    return w;
  }, [days]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full glass-card p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Contribution Activity
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            365 days · server-computed streaks
          </p>
        </div>

        {/* Streak Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StreakPill
            icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
            label="Current"
            value={contributions.currentStreak}
            suffix=" days"
            color="text-orange-300"
          />
          <StreakPill
            icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
            label="Longest"
            value={contributions.longestStreak}
            suffix=" days"
            color="text-amber-300"
          />
          <StreakPill
            icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
            label="Total"
            value={contributions.totalContributions}
            suffix=""
            color="text-emerald-300"
          />
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-4 overflow-x-auto pb-1 relative">
        <div className="min-w-[700px] flex gap-[3px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => {
                    setHoveredDay(day);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-crosshair transition-all duration-150 hover:ring-1 hover:ring-zinc-400/60 hover:scale-125"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] || LEVEL_COLORS[0] }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="bg-zinc-950/95 border border-zinc-700 px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-mono whitespace-nowrap">
              <span className="text-zinc-100 font-semibold">{hoveredDay.count}</span>
              <span className="text-zinc-500"> contributions on </span>
              <span className="text-zinc-300">{formatDate(hoveredDay.date)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Hover hint + Legend */}
      <div className="mt-3 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{hoveredDay ? "" : "Hover cells for details"}</span>
        <div className="flex items-center gap-1">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </motion.div>
  );
}

function StreakPill({
  icon, label, value, suffix, color
}: {
  icon: React.ReactNode; label: string; value: number; suffix: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
      {icon}
      <div className="text-[11px]">
        <span className="text-zinc-500 block leading-none">{label}</span>
        <span className={`font-mono font-semibold text-[13px] tabular-nums ${color}`}>
          <CountUp target={value} />{suffix}
        </span>
      </div>
    </div>
  );
}
