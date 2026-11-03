"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Send,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { VibeCheckResult } from "@/services/vibecheck.service";

interface VibeCheckDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  initialResult: VibeCheckResult | null;
  onResultUpdated: (result: VibeCheckResult) => void;
}

const SAMPLE_JDS = [
  {
    title: "Full-Stack TypeScript / Next.js",
    text: "We are seeking a Senior Full-Stack Engineer with strong expertise in TypeScript, React, Next.js, Node.js, Tailwind CSS, GraphQL, and REST APIs. Experience with SQLite, PostgreSQL, Docker, CI/CD pipelines, and writing clean scalable frontend and backend code is required.",
  },
  {
    title: "AI / Python Backend Engineer",
    text: "Looking for a Backend AI Engineer proficient in Python, FastAPI, Django, PyTorch, Machine Learning, LLM integrations, RAG architecture, and Redis. Must have experience deploying Docker containers, building microservices, and optimizing data pipelines.",
  },
  {
    title: "Systems & Cloud Infrastructure",
    text: "Seeking a Systems & Cloud Infrastructure Engineer with deep skills in Go (Golang), Rust, Docker, Kubernetes, AWS, microservices, Linux, and distributed systems. Experience with low-latency key-value stores and concurrent systems is a plus.",
  },
];

export function VibeCheckDrawer({
  isOpen,
  onClose,
  username,
  initialResult,
  onResultUpdated,
}: VibeCheckDrawerProps) {
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VibeCheckResult | null>(initialResult);

  // Extra Feature 2: Pitch Generator state
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchData, setPitchData] = useState<{ pitch: string; readmeSnippet: string } | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || jdText;
    if (!text.trim()) {
      toast.error("Please enter a job description to analyze");
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
        setResult(data.result);
        onResultUpdated(data.result);
        toast.success(`Calculated compatibility: ${data.result.matchPercentage}% match`);
      } else {
        toast.error("Failed to analyze compatibility. Please try again.");
      }
    } catch (err) {
      console.error("Vibe check failed:", err);
      toast.error("Network error during compatibility calculation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const res = await fetch("/api/pitch-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, jobDescription: jdText }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPitchData(data.data);
        toast.success("Recruiter pitch and README snippet generated!");
      } else {
        toast.error("Failed to generate pitch. Using default overview.");
      }
    } catch (err) {
      console.error("Pitch generation failed:", err);
      toast.error("Network error while generating pitch.");
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const copyToClipboard = (text: string, type: "pitch" | "bio") => {
    navigator.clipboard.writeText(text);
    if (type === "pitch") {
      setCopiedPitch(true);
      toast.success("Pitch copied to clipboard!");
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedBio(true);
      toast.success("README bio copied to clipboard!");
      setTimeout(() => setCopiedBio(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                    The Vibe Check
                  </h2>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    Engine
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-normal">
                  Server-side JD taxonomy matching against @{username}&apos;s SQLite repository cache
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Sample JDs for 1-click Quick Assessment */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  1-Click Sample Job Descriptions
                </label>
                <span className="text-[11px] text-zinc-500">Click to instantly test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_JDS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setJdText(sample.text);
                      handleAnalyze(sample.text);
                    }}
                    className="p-3 text-left rounded-xl bg-zinc-900/60 hover:bg-zinc-900 text-zinc-200 border border-zinc-800/80 hover:border-emerald-500/40 transition-all group"
                  >
                    <span className="block text-xs font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                      {sample.title}
                    </span>
                    <span className="text-[11px] text-zinc-500 block truncate mt-1">
                      Auto-analyze candidate fit
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* JD Input Textarea */}
            <div>
              <label className="block text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Or Paste Custom Job Description
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste any engineering job description here (e.g. 'Looking for a senior backend developer with Python, FastAPI, Docker, and Redis')..."
                rows={4}
                className="w-full p-3.5 text-xs bg-zinc-900/50 text-zinc-200 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition font-sans"
              />
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing || !jdText.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Computing Alignment...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Run Vibe Check Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-5"
              >
                {/* Compatibility Score Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                  <div className="flex items-center gap-4">
                    {/* Score Badge */}
                    <div
                      className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border font-mono font-bold ${
                        result.badgeColor === "emerald"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : result.badgeColor === "amber"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      <span className="text-xl tabular-nums leading-none">
                        {result.matchPercentage}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 mt-1">
                        Match
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">
                        Evaluation Verdict
                      </span>
                      <h3 className="text-base font-semibold text-zinc-100">
                        {result.badgeLabel}
                      </h3>
                    </div>
                  </div>

                  {/* Pitch Generator Trigger */}
                  <button
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 hover:border-zinc-600 transition disabled:opacity-50"
                  >
                    {isGeneratingPitch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Generating Pitch...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Generate Recruiter Pitch & Bio
                      </>
                    )}
                  </button>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-2.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Matched Technologies ({result.matchedSkills.length})</span>
                    </div>
                    {result.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No direct overlaps detected</p>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-2.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Skills to Highlight / Learn ({result.missingSkills.length})</span>
                    </div>
                    {result.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 font-medium">100% skill alignment!</p>
                    )}
                  </div>
                </div>

                {/* Supporting Repositories */}
                {result.topSupportingRepos && result.topSupportingRepos.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-2.5">
                      Supporting Repositories from Candidate
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.topSupportingRepos.map((repo, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs flex flex-col justify-between hover:border-zinc-700 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-zinc-200 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                              >
                                {repo.name}
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </a>
                              <span className="text-[11px] font-mono text-amber-400">
                                ★ {repo.stargazers_count}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                              {repo.description || "Portfolio repository"}
                            </p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap gap-1">
                            {repo.matchedTaxa.map((tax) => (
                              <span
                                key={tax}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              >
                                ✓ {tax}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pitch Generator Section */}
                {pitchData && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Tailored Recruiter Pitch
                      </span>
                      <button
                        onClick={() => copyToClipboard(pitchData.pitch, "pitch")}
                        className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/80 transition"
                      >
                        {copiedPitch ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Pitch
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                      &ldquo;{pitchData.pitch}&rdquo;
                    </p>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          README Bio Snippet (Markdown)
                        </span>
                        <button
                          onClick={() => copyToClipboard(pitchData.readmeSnippet, "bio")}
                          className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/80 transition"
                        >
                          {copiedBio ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Markdown
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-[11px] text-emerald-300 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {pitchData.readmeSnippet}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
