"use client";

import React, { useState, useMemo } from "react";
import { Search, Star, GitFork, ExternalLink, Filter, ArrowUpDown, Code } from "lucide-react";
import { GitHubRawRepo } from "@/services/github.service";
import { GITHUB_LANGUAGE_COLORS } from "@/services/analytics.service";

interface RepositoryGridProps {
  repositories: Array<GitHubRawRepo & { topics?: string[] }>;
}

export function RepositoryGrid({ repositories }: RepositoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "updated">("stars");

  // Extract unique languages for filter dropdown
  const languages = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return ["All", ...Array.from(set).sort()];
  }, [repositories]);

  // Filter and sort repositories
  const filteredRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        // Language filter
        if (selectedLanguage !== "All" && repo.language !== selectedLanguage) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = repo.name.toLowerCase().includes(q);
          const matchDesc = (repo.description || "").toLowerCase().includes(q);
          const matchTopics = (repo.topics || []).some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTopics) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stars") {
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        }
        if (sortBy === "forks") {
          return (b.forks_count || 0) - (a.forks_count || 0);
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [repositories, selectedLanguage, searchQuery, sortBy]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls Bar: Search, Language Filter, Sort dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Repository Showcase
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {filteredRepos.length} of {repositories.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repos or topics..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="stars" className="bg-slate-900 text-slate-200">
                Most Stars
              </option>
              <option value="forks" className="bg-slate-900 text-slate-200">
                Most Forks
              </option>
              <option value="updated" className="bg-slate-900 text-slate-200">
                Recently Updated
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRepos.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm">No repositories found matching current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => {
            const langColor = repo.language
              ? GITHUB_LANGUAGE_COLORS[repo.language] || "#8b949e"
              : "#8b949e";

            return (
              <div
                key={repo.id}
                className="group relative flex flex-col justify-between bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sm text-slate-100 hover:text-emerald-400 transition flex items-center gap-1.5 line-clamp-1"
                    >
                      {repo.name}
                      <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </a>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[36px]">
                    {repo.description || "No project description provided."}
                  </p>

                  {/* Topics Chips */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-emerald-400/90 border border-emerald-900/40"
                        >
                          #{topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Language + Stars + Forks + Updated Date */}
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {repo.language && (
                      <>
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: langColor }}
                        />
                        <span className="text-slate-300 font-medium">{repo.language}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-300 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {repo.stargazers_count}
                    </span>

                    <span className="flex items-center gap-1 text-cyan-300 font-medium">
                      <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
