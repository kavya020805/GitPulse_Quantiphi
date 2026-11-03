"use client";

import React, { useState, useMemo } from "react";
import { Search, Star, GitFork, ArrowUpRight, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GitHubRawRepo } from "@/services/github.service";
import { GITHUB_LANGUAGE_COLORS } from "@/services/analytics.service";
import { SpotlightCard } from "./react-bits/SpotlightCard";

interface RepositoryGridProps {
  repositories: Array<GitHubRawRepo & { topics?: string[] }>;
}

export function RepositoryGrid({ repositories }: RepositoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "updated">("stars");

  const languages = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return ["All", ...Array.from(set).sort()];
  }, [repositories]);

  // Top 6 languages for the tab bar
  const topLanguageTabs = useMemo(() => {
    const counts: Record<string, number> = {};
    repositories.forEach((r) => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
    });
    return ["All", ...Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l)];
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        if (selectedLanguage !== "All" && repo.language !== selectedLanguage) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const m =
            repo.name.toLowerCase().includes(q) ||
            (repo.description || "").toLowerCase().includes(q) ||
            (repo.topics || []).some((t) => t.toLowerCase().includes(q));
          if (!m) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        if (sortBy === "forks") return (b.forks_count || 0) - (a.forks_count || 0);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [repositories, selectedLanguage, searchQuery, sortBy]);

  return (
    <div className="w-full space-y-4">
      {/* Controls Container inside SpotlightCard */}
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.08)"
        className="p-5"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Repositories
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-white/[0.06]">
                  {filteredRepos.length} of {repositories.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Filter Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repositories..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 text-zinc-200 placeholder-zinc-500 rounded-xl border border-white/[0.08] focus:outline-none focus:border-emerald-500/50 font-sans"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-mono bg-zinc-950 text-zinc-300 rounded-xl border border-white/[0.08] focus:outline-none cursor-pointer hover:border-white/[0.16] transition"
            >
              <option value="stars">★ Most Stars</option>
              <option value="forks">⑂ Most Forks</option>
              <option value="updated">↻ Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {topLanguageTabs.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`shrink-0 px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                selectedLanguage === lang
                  ? "bg-zinc-800 text-zinc-100 border border-white/[0.12] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-zinc-800/40"
              }`}
            >
              {lang !== "All" && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: GITHUB_LANGUAGE_COLORS[lang] || "#6b7280" }}
                />
              )}
              {lang}
            </button>
          ))}
          {languages.length > topLanguageTabs.length && (
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="shrink-0 px-2.5 py-1 text-xs font-mono bg-transparent text-zinc-400 border border-white/[0.08] rounded-lg cursor-pointer hover:text-zinc-200 hover:border-white/[0.16]"
            >
              <option value="All" className="bg-zinc-950">More Languages…</option>
              {languages
                .filter((l) => !topLanguageTabs.includes(l))
                .map((lang) => (
                  <option key={lang} value={lang} className="bg-zinc-950">
                    {lang}
                  </option>
                ))}
            </select>
          )}
        </div>
      </SpotlightCard>

      {/* Repository Cards Grid */}
      {filteredRepos.length === 0 ? (
        <SpotlightCard className="p-12 text-center text-zinc-400 text-xs font-mono">
          No repositories matching &quot;{searchQuery}&quot; with selected filters.
        </SpotlightCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredRepos.map((repo) => {
              const langColor = repo.language
                ? GITHUB_LANGUAGE_COLORS[repo.language] || "#6b7280"
                : "#6b7280";
              return (
                <motion.div
                  key={repo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.14)"
                    className="h-full p-4 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-xs text-zinc-100 hover:text-emerald-400 transition-colors flex items-center gap-1 min-w-0"
                        >
                          <span className="truncate">{repo.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </a>
                      </div>

                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[32px]">
                        {repo.description || "Open source project on GitHub."}
                      </p>

                      {repo.topics && repo.topics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {repo.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-white/[0.04]"
                            >
                              {topic}
                            </span>
                          ))}
                          {repo.topics.length > 3 && (
                            <span className="text-[10px] font-mono text-zinc-400 self-center">
                              +{repo.topics.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {repo.language && (
                          <>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: langColor }}
                            />
                            <span className="text-zinc-300 font-mono text-[11px]">
                              {repo.language}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono tabular-nums text-zinc-400">
                        <span className="flex items-center gap-1 text-amber-300/90">
                          <Star className="w-3 h-3 text-amber-400" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-300/90">
                          <GitFork className="w-3 h-3 text-cyan-400" />
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
