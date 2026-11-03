"use client";

import React, { useState, useMemo } from "react";
import { Search, Star, GitFork, ExternalLink, ArrowUpRight, Code } from "lucide-react";
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
    repositories.forEach((r) => { if (r.language) set.add(r.language); });
    return ["All", ...Array.from(set).sort()];
  }, [repositories]);

  // Top 6 languages for the tab bar
  const topLanguageTabs = useMemo(() => {
    const counts: Record<string, number> = {};
    repositories.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    return ["All", ...Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l)];
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        if (selectedLanguage !== "All" && repo.language !== selectedLanguage) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const m = repo.name.toLowerCase().includes(q)
            || (repo.description || "").toLowerCase().includes(q)
            || (repo.topics || []).some((t) => t.toLowerCase().includes(q));
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full space-y-4"
    >
      {/* Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Repositories</h2>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
              {filteredRepos.length}/{repositories.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repos..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-zinc-950/80 text-zinc-200 placeholder-zinc-600 rounded-lg border border-zinc-800/80 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-[12px] bg-zinc-950/80 text-zinc-300 rounded-lg border border-zinc-800/80 focus:outline-none cursor-pointer"
            >
              <option value="stars">★ Stars</option>
              <option value="forks">⑂ Forks</option>
              <option value="updated">↻ Updated</option>
            </select>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
          {topLanguageTabs.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                selectedLanguage === lang
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-800/50"
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
              className="shrink-0 px-2 py-1 text-[11px] bg-transparent text-zinc-500 border border-zinc-800/60 rounded-md cursor-pointer hover:text-zinc-300"
            >
              <option value="All">More…</option>
              {languages.filter((l) => !topLanguageTabs.includes(l)).map((lang) => (
                <option key={lang} value={lang} className="bg-zinc-900">{lang}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRepos.length === 0 ? (
        <div className="glass-card p-12 text-center text-zinc-500 text-[13px]">
          No repositories match current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredRepos.map((repo) => {
              const langColor = repo.language ? GITHUB_LANGUAGE_COLORS[repo.language] || "#6b7280" : "#6b7280";
              return (
                <motion.div
                  key={repo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <SpotlightCard className="h-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700/80 transition-all duration-200 group">
                    <div className="p-4 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-[13px] text-zinc-200 hover:text-emerald-400 transition flex items-center gap-1 min-w-0"
                          >
                            <span className="truncate">{repo.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                          </a>
                        </div>

                        <p className="mt-1.5 text-[12px] text-zinc-500 leading-relaxed line-clamp-2 min-h-[32px]">
                          {repo.description || "No description provided."}
                        </p>

                        {repo.topics && repo.topics.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
                              >
                                {topic}
                              </span>
                            ))}
                            {repo.topics.length > 3 && (
                              <span className="text-[10px] text-zinc-600 self-center">
                                +{repo.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {repo.language && (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
                              <span className="text-zinc-400 font-medium">{repo.language}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-mono tabular-nums">
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Star className="w-3 h-3 text-amber-400/70" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <GitFork className="w-3 h-3 text-cyan-400/70" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
