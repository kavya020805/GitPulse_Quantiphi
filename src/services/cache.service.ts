import { db, sqlite } from "@/db";
import { users, repositories, userSettings, chatHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { LanguageStat, ContributionAnalytics } from "./analytics.service";
import { GitHubRawRepo, GitHubRawUser } from "./github.service";

// Cache TTL: 60 minutes in seconds
const CACHE_TTL_SECONDS = 60 * 60;

export interface PortfolioCachedData {
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
    contributions: ContributionAnalytics;
  };
  repositories: Array<GitHubRawRepo & { topics: string[] }>;
  userSettings?: {
    last_jd_text: string | null;
    last_match_score: number | null;
    last_match_details: any;
  } | null;
}

/**
 * Retrieve cached portfolio from SQLite if still within TTL
 */
export function getCachedPortfolio(
  username: string,
  forceRefresh: boolean = false
): { data: PortfolioCachedData; cachedAt: string } | null {
  if (forceRefresh) {
    return null;
  }

  const normalizedUsername = username.toLowerCase().trim();
  const nowUnix = Math.floor(Date.now() / 1000);

  // 1. Fetch user record
  const existingUser = db
    .select()
    .from(users)
    .where(eq(users.username, normalizedUsername))
    .get();

  if (!existingUser || !existingUser.updated_at) {
    return null;
  }

  // 2. Validate TTL
  const age = nowUnix - existingUser.updated_at;
  if (age > CACHE_TTL_SECONDS) {
    return null;
  }

  // 3. Fetch repositories from SQLite
  const cachedRepos = db
    .select()
    .from(repositories)
    .where(eq(repositories.username, normalizedUsername))
    .all();

  // 4. Fetch user settings (last Vibe Check data if any)
  const settings = db
    .select()
    .from(userSettings)
    .where(eq(userSettings.username, normalizedUsername))
    .get();

  const formattedRepos: Array<GitHubRawRepo & { topics: string[] }> = cachedRepos.map((r) => {
    let topics: string[] = [];
    try {
      if (r.topics_json) topics = JSON.parse(r.topics_json);
    } catch {
      topics = [];
    }
    return {
      id: r.id,
      name: r.name,
      full_name: r.full_name || `${r.username}/${r.name}`,
      description: r.description,
      html_url: r.html_url || `https://github.com/${r.username}/${r.name}`,
      language: r.language,
      stargazers_count: r.stargazers_count || 0,
      forks_count: r.forks_count || 0,
      topics,
      updated_at: r.updated_at || new Date().toISOString(),
      fork: false,
    };
  });

  let topLanguages: LanguageStat[] = [];
  try {
    if (existingUser.top_languages_json) {
      topLanguages = JSON.parse(existingUser.top_languages_json);
    }
  } catch {}

  let contributions: ContributionAnalytics = {
    days: [],
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
  };
  try {
    if (existingUser.contributions_json) {
      contributions = JSON.parse(existingUser.contributions_json);
    }
  } catch {}

  let totalForks = 0;
  for (const r of formattedRepos) {
    totalForks += r.forks_count || 0;
  }

  let lastMatchDetails = null;
  try {
    if (settings?.last_match_details_json) {
      lastMatchDetails = JSON.parse(settings.last_match_details_json);
    }
  } catch {}

  return {
    data: {
      user: {
        username: existingUser.username,
        name: existingUser.name,
        avatar_url: existingUser.avatar_url,
        bio: existingUser.bio,
        followers: existingUser.followers || 0,
        following: existingUser.following || 0,
        public_repos: existingUser.public_repos || formattedRepos.length,
        total_stars: existingUser.total_stars || 0,
        total_forks: totalForks,
        top_languages: topLanguages,
        contributions,
      },
      repositories: formattedRepos,
      userSettings: settings
        ? {
            last_jd_text: settings.last_jd_text,
            last_match_score: settings.last_match_score,
            last_match_details: lastMatchDetails,
          }
        : null,
    },
    cachedAt: new Date(existingUser.updated_at * 1000).toISOString(),
  };
}

/**
 * Save / Update full portfolio in SQLite with current timestamp
 */
export function savePortfolioToCache(
  user: GitHubRawUser,
  repos: GitHubRawRepo[],
  totalStars: number,
  topLanguages: LanguageStat[],
  contributions: ContributionAnalytics
): void {
  const normalizedUsername = user.login.toLowerCase().trim();
  const nowUnix = Math.floor(Date.now() / 1000);

  // Upsert user inside a transaction
  const upsertUser = sqlite.prepare(`
    INSERT INTO users (
      username, name, avatar_url, bio, followers, following, public_repos,
      total_stars, top_languages_json, contributions_json, updated_at
    ) VALUES (
      @username, @name, @avatar_url, @bio, @followers, @following, @public_repos,
      @total_stars, @top_languages_json, @contributions_json, @updated_at
    )
    ON CONFLICT(username) DO UPDATE SET
      name = excluded.name,
      avatar_url = excluded.avatar_url,
      bio = excluded.bio,
      followers = excluded.followers,
      following = excluded.following,
      public_repos = excluded.public_repos,
      total_stars = excluded.total_stars,
      top_languages_json = excluded.top_languages_json,
      contributions_json = excluded.contributions_json,
      updated_at = excluded.updated_at;
  `);

  const deleteExistingRepos = sqlite.prepare(`DELETE FROM repositories WHERE username = ?`);
  const insertRepo = sqlite.prepare(`
    INSERT INTO repositories (
      id, username, name, full_name, description, html_url,
      language, stargazers_count, forks_count, topics_json, updated_at
    ) VALUES (
      @id, @username, @name, @full_name, @description, @html_url,
      @language, @stargazers_count, @forks_count, @topics_json, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      name = excluded.name,
      full_name = excluded.full_name,
      description = excluded.description,
      html_url = excluded.html_url,
      language = excluded.language,
      stargazers_count = excluded.stargazers_count,
      forks_count = excluded.forks_count,
      topics_json = excluded.topics_json,
      updated_at = excluded.updated_at;
  `);

  const tx = sqlite.transaction(() => {
    upsertUser.run({
      username: normalizedUsername,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      total_stars: totalStars,
      top_languages_json: JSON.stringify(topLanguages),
      contributions_json: JSON.stringify(contributions),
      updated_at: nowUnix,
    });

    deleteExistingRepos.run(normalizedUsername);

    for (const repo of repos) {
      insertRepo.run({
        id: repo.id,
        username: normalizedUsername,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        topics_json: JSON.stringify(repo.topics || []),
        updated_at: repo.updated_at,
      });
    }
  });

  tx();
}

/**
 * Save user JD settings and match score in SQLite
 */
export function saveUserSettings(
  username: string,
  lastJdText: string,
  lastMatchScore: number,
  lastMatchDetails: any
) {
  const normalizedUsername = username.toLowerCase().trim();
  const upsertSettings = sqlite.prepare(`
    INSERT INTO user_settings (username, last_jd_text, last_match_score, last_match_details_json)
    VALUES (@username, @last_jd_text, @last_match_score, @last_match_details_json)
    ON CONFLICT(username) DO UPDATE SET
      last_jd_text = excluded.last_jd_text,
      last_match_score = excluded.last_match_score,
      last_match_details_json = excluded.last_match_details_json;
  `);

  upsertSettings.run({
    username: normalizedUsername,
    last_jd_text: lastJdText,
    last_match_score: lastMatchScore,
    last_match_details_json: JSON.stringify(lastMatchDetails),
  });
}

/**
 * Add message to Chat History in SQLite
 */
export function saveChatMessage(username: string, role: "user" | "assistant", message: string) {
  const normalizedUsername = username.toLowerCase().trim();
  db.insert(chatHistory)
    .values({
      username: normalizedUsername,
      role,
      message,
      created_at: Math.floor(Date.now() / 1000),
    })
    .run();
}

/**
 * Get recent chat history for username
 */
export function getChatHistory(username: string, limitCount: number = 20) {
  const normalizedUsername = username.toLowerCase().trim();
  return db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.username, normalizedUsername))
    .orderBy(desc(chatHistory.id))
    .limit(limitCount)
    .all()
    .reverse();
}
