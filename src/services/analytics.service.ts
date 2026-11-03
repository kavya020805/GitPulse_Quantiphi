// Official GitHub Language Colors Map
export const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Solidity: "#AA6746",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
};

export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DailyContribution {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionAnalytics {
  days: DailyContribution[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Server-Side calculation of total stars and forks across repositories
 */
export function calculateStarsAndForks(repos: Array<{ stargazers_count?: number; forks_count?: number }>) {
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
  }

  return { totalStars, totalForks };
}

/**
 * Server-Side calculation of Top Languages and percentage share
 */
export function calculateTopLanguages(repos: Array<{ language?: string | null }>): LanguageStat[] {
  const languageCounts: Record<string, number> = {};
  let totalTaggedRepos = 0;

  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      totalTaggedRepos++;
    }
  }

  if (totalTaggedRepos === 0) {
    return [];
  }

  const sortedLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);

  // Keep top 6 languages, group remainder into "Other" if necessary
  const topList: LanguageStat[] = [];
  let accountedCount = 0;

  const topSlices = sortedLanguages.slice(0, 5);
  for (const [lang, count] of topSlices) {
    const percentage = Math.round((count / totalTaggedRepos) * 1000) / 10;
    topList.push({
      language: lang,
      count,
      percentage,
      color: GITHUB_LANGUAGE_COLORS[lang] || "#8b949e",
    });
    accountedCount += count;
  }

  const remainderCount = totalTaggedRepos - accountedCount;
  if (remainderCount > 0) {
    topList.push({
      language: "Other",
      count: remainderCount,
      percentage: Math.round((remainderCount / totalTaggedRepos) * 1000) / 10,
      color: "#6b7280",
    });
  }

  return topList;
}

/**
 * Server-Side Streak and Activity Computation
 */
export function calculateStreakAnalytics(days: DailyContribution[]): ContributionAnalytics {
  if (!days || days.length === 0) {
    return {
      days: [],
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Ensure chronological order
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let totalContributions = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of sortedDays) {
    totalContributions += day.count;
    if (day.count > 0) {
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Calculate current streak working backwards from the most recent day
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const lastIndex = sortedDays.length - 1;

  // Check if today or yesterday has contributions to maintain streak
  let checkIdx = lastIndex;
  if (checkIdx >= 0 && sortedDays[checkIdx].date === todayStr && sortedDays[checkIdx].count === 0) {
    // If today has 0 commits yet, evaluate streak from yesterday
    checkIdx--;
  }

  while (checkIdx >= 0 && sortedDays[checkIdx].count > 0) {
    currentStreak++;
    checkIdx--;
  }

  return {
    days: sortedDays,
    totalContributions,
    currentStreak,
    longestStreak,
  };
}

