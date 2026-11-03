"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
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
    if (!text.trim()) return;

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
      }
    } catch (err) {
      console.error("Vibe check failed:", err);
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
      }
    } catch (err) {
      console.error("Pitch generation failed:", err);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const copyToClipboard = (text: string, type: "pitch" | "bio") => {
    navigator.clipboard.writeText(text);
    if (type === "pitch") {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedBio(true);
      setTimeout(() => setCopiedBio(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                "The Vibe Check" Compatibility Engine
              </h2>
              <p className="text-xs text-slate-400">
                Server-side keyword taxonomy matching against @{username}'s SQLite repository cache
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sample JDs for 1-click Viva Demo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Instant Demo: Choose a Sample Job Description
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_JDS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setJdText(sample.text);
                    handleAnalyze(sample.text);
                  }}
                  className="px-3 py-2 text-left text-xs rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 transition truncate"
                >
                  <span className="block font-semibold text-emerald-400 truncate">
                    {sample.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    Click to auto-analyze
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* JD Input Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Paste Custom Target Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste any engineering job description here (e.g. 'Looking for a senior backend developer with Python, FastAPI, Docker, and Redis')..."
              rows={4}
              className="w-full p-3 text-xs bg-slate-950 text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !jdText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950 transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Computing Alignment...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Run Vibe Check Compatibility
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-5 animate-in fade-in duration-300">
              {/* Compatibility Score Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-4">
                  {/* Circular Score Badge */}
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 text-xl font-black ${
                      result.badgeColor === "emerald"
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                        : result.badgeColor === "amber"
                        ? "bg-amber-950/80 border-amber-500 text-amber-300"
                        : "bg-rose-950/80 border-rose-500 text-rose-300"
                    }`}
                  >
                    {result.matchPercentage}%
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Evaluation Outcome
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {result.badgeLabel}
                    </h3>
                  </div>
                </div>

                {/* Extra Feature 2 Button */}
                <button
                  onClick={handleGeneratePitch}
                  disabled={isGeneratingPitch}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition disabled:opacity-50"
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
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Matched Technologies ({result.matchedSkills.length})</span>
                  </div>
                  {result.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2.5 py-1 rounded-lg bg-emerald-900/40 text-emerald-200 border border-emerald-700/50 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No direct overlaps detected</p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Skills to Learn / Mention ({result.missingSkills.length})</span>
                  </div>
                  {result.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2.5 py-1 rounded-lg bg-rose-900/40 text-rose-200 border border-rose-700/50 font-medium"
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Top Supporting Repositories From Candidate
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.topSupportingRepos.map((repo, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-slate-200 hover:text-emerald-400 flex items-center gap-1"
                            >
                              {repo.name}
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                            <span className="text-[11px] text-amber-400 font-semibold">
                              ⭐ {repo.stargazers_count}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {repo.description || "Portfolio project"}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                          {repo.matchedTaxa.map((tax) => (
                            <span
                              key={tax}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800"
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

              {/* Extra Feature 2 Display (Pitch & Readme) */}
              {pitchData && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      AI Tailored Recruiter Elevator Pitch
                    </span>
                    <button
                      onClick={() => copyToClipboard(pitchData.pitch, "pitch")}
                      className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
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
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                    "{pitchData.pitch}"
                  </p>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        README Bio Snippet (Markdown)
                      </span>
                      <button
                        onClick={() => copyToClipboard(pitchData.readmeSnippet, "bio")}
                        className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
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
                    <pre className="text-[11px] text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap font-mono">
                      {pitchData.readmeSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

