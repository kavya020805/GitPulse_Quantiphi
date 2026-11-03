"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, CheckCircle2, AlertCircle, ExternalLink, Zap, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { VibeCheckResult } from "@/services/vibecheck.service";
import { SpotlightCard } from "./react-bits/SpotlightCard";
import { DecryptedText } from "./react-bits/DecryptedText";
import { Magnet } from "./react-bits/Magnet";
import { ShinyText } from "./react-bits/ShinyText";

interface VibeCheckBentoCardProps {
  username: string;
  result: VibeCheckResult | null;
  onResultUpdated: (result: VibeCheckResult) => void;
  onOpenDrawer: () => void;
}

const SAMPLE_PRESETS = [
  {
    title: "Full-Stack TypeScript",
    role: "Senior Full-Stack Engineer with strong TypeScript, React, Next.js, Node.js, Tailwind CSS, GraphQL, REST APIs, SQLite, and Docker.",
  },
  {
    title: "AI Engineer",
    role: "Backend AI Engineer proficient in Python, FastAPI, PyTorch, LLM integrations, RAG architecture, Machine Learning, and Redis microservices.",
  },
  {
    title: "Python Backend",
    role: "Backend Systems Engineer with Python, Django, FastAPI, PostgreSQL, Docker, Redis caching, microservices, and CI/CD pipelines.",
  },
];

export function VibeCheckBentoCard({
  username,
  result,
  onResultUpdated,
  onOpenDrawer,
}: VibeCheckBentoCardProps) {
  const [customJd, setCustomJd] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleRunCheck = async (textToTest?: string) => {
    const text = textToTest || customJd;
    if (!text.trim()) {
      toast.error("Please select a sample JD or paste requirements");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/vibe-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, jobDescription: text }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        onResultUpdated(data.result);
        toast.success(`Analysis Complete: ${data.result.matchPercentage}% Compatibility`, {
          description: data.result.badgeLabel,
        });
      } else {
        toast.error("Unable to compute alignment with current inputs");
      }
    } catch {
      toast.error("Network error communicating with Vibe Check API");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.12)"
      className="w-full p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                The Vibe Check — Job Matcher Engine
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Server-Side Scorer
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
              Evaluates @{username}&apos;s SQLite repository taxonomy against target requirements
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-mono transition-colors self-start sm:self-auto"
        >
          <span>Open Full Drawer & Pitch</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Pills (1-Click Test) */}
      <div className="mt-4">
        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          1-Click Sample JD Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.title}
              onClick={() => {
                setActivePreset(preset.title);
                setCustomJd(preset.role);
                handleRunCheck(preset.role);
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all ${
                activePreset === preset.title
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/[0.06] hover:border-white/[0.16]"
              }`}
            >
              ★ {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Custom JD Input */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={customJd}
          onChange={(e) => {
            setCustomJd(e.target.value);
            setActivePreset(null);
          }}
          placeholder="Or test custom tech stack (e.g. 'Looking for Python, TypeScript, Docker, Redis, and React developer')..."
          className="flex-1 px-3.5 py-2 text-xs bg-zinc-950 text-zinc-200 placeholder-zinc-500 rounded-xl border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 font-sans"
        />
        <Magnet strength={0.3} activeDistance={30}>
          <button
            onClick={() => handleRunCheck()}
            disabled={isAnalyzing || !customJd.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/10 transition disabled:opacity-40"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scoring...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Run Vibe Check</span>
              </>
            )}
          </button>
        </Magnet>
      </div>

      {/* Analysis Result Banner */}
      {result && (
        <div className="mt-5 p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-xl border font-mono font-bold flex flex-col items-center justify-center ${
                  result.badgeColor === "emerald"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : result.badgeColor === "amber"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                <span className="text-lg leading-none">
                  <DecryptedText text={`${result.matchPercentage}%`} speed={25} />
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">
                  Match
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Verdict
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {result.badgeLabel}
                </h3>
              </div>
            </div>

            <button
              onClick={onOpenDrawer}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <span>Generate Recruiter Pitch & Bio Snippet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Matched vs Missing Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.04]">
            {/* Matched */}
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matched Tech ({result.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Skills to Highlight / Learn ({result.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    {s}
                  </span>
                ))}
                {result.missingSkills.length === 0 && (
                  <span className="text-xs text-emerald-400">100% full coverage!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </SpotlightCard>
  );
}

