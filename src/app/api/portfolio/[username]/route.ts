import { NextRequest, NextResponse } from "next/server";
import { getCachedPortfolio, savePortfolioToCache } from "@/services/cache.service";
import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  fetchContributionCalendar,
} from "@/services/github.service";
import {
  calculateStarsAndForks,
  calculateTopLanguages,
  calculateStreakAnalytics,
} from "@/services/analytics.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username?.trim();
    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // 1. Check SQLite Cache
    const cached = getCachedPortfolio(username, forceRefresh);
    if (cached) {
      return NextResponse.json({
        success: true,
        cacheStatus: "HIT",
        cachedAt: cached.cachedAt,
        data: cached.data,
      });
    }

    // 2. Cache MISS: Fetch from GitHub & compute on server
    const [rawUser, rawRepos] = await Promise.all([
      fetchGitHubProfile(username),
      fetchGitHubRepos(username),
    ]);

    const { totalStars } = calculateStarsAndForks(rawRepos);
    const topLanguages = calculateTopLanguages(rawRepos);
    const rawContributions = await fetchContributionCalendar(username, rawRepos);
    const contributions = calculateStreakAnalytics(rawContributions);

    // 3. Persist to SQLite
    savePortfolioToCache(rawUser, rawRepos, totalStars, topLanguages, contributions);

    // 4. Return standard payload
    const freshlyCached = getCachedPortfolio(username, false);

    return NextResponse.json({
      success: true,
      cacheStatus: "MISS",
      cachedAt: freshlyCached?.cachedAt || new Date().toISOString(),
      data: freshlyCached?.data || {
        user: {
          username: rawUser.login,
          name: rawUser.name,
          avatar_url: rawUser.avatar_url,
          bio: rawUser.bio,
          followers: rawUser.followers,
          following: rawUser.following,
          public_repos: rawUser.public_repos,
          total_stars: totalStars,
          total_forks: 0,
          top_languages: topLanguages,
          contributions,
        },
        repositories: rawRepos,
        userSettings: null,
      },
    });
  } catch (error: any) {
    console.error("[PortfolioAPI] Error handling portfolio request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process portfolio request",
      },
      { status: 500 }
    );
  }
}
