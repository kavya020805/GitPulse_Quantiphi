import { db } from "@/db";
import { users, repositories, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveChatMessage } from "./cache.service";

/**
 * Loads rich context from SQLite for a given developer
 */
function loadPortfolioContext(username: string) {
  const normalizedUsername = username.toLowerCase().trim();
  const user = db.select().from(users).where(eq(users.username, normalizedUsername)).get();
  const repos = db.select().from(repositories).where(eq(repositories.username, normalizedUsername)).all();
  const settings = db.select().from(userSettings).where(eq(userSettings.username, normalizedUsername)).get();

  let topLanguages: any[] = [];
  try {
    if (user?.top_languages_json) topLanguages = JSON.parse(user.top_languages_json);
  } catch {}

  let contributions: any = {};
  try {
    if (user?.contributions_json) contributions = JSON.parse(user.contributions_json);
  } catch {}

  // Sort repos by stars
  const sortedRepos = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 15);

  return {
    user,
    repos: sortedRepos,
    settings,
    topLanguages,
    contributions,
  };
}

/**
 * Feature 1: "Ask My Portfolio" Conversational Assistant
 */
export async function generateChatResponse(
  username: string,
  userMessage: string
): Promise<string> {
  const context = loadPortfolioContext(username);
  const normalizedUsername = username.toLowerCase().trim();

  // Try Google Gemini 1.5 Flash first if API key is provided
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `You are GitPulse AI, the official intelligent portfolio agent for the software developer @${username}.
You have direct read access to their verified GitHub metrics and cached SQLite database.
Answer the recruiter or hiring manager's query politely, authoritatively, and concisely.
Always cite their actual repository names, star counts, tech stacks, or commit streak data when answering.

DEVELOPER DATA:
- Name: ${context.user?.name || username}
- Bio: ${context.user?.bio || "Software Engineer"}
- Followers: ${context.user?.followers || 0}
- Total Stars: ${context.user?.total_stars || 0}
- Current Commit Streak: ${context.contributions?.currentStreak || 0} days
- Longest Streak: ${context.contributions?.longestStreak || 0} days
- Total Annual Contributions: ${context.contributions?.totalContributions || 0} commits
- Top Languages: ${context.topLanguages.map((l: any) => `${l.language} (${l.percentage}%)`).join(", ")}
- Top Repositories:
${context.repos.map((r) => `  * ${r.name} (${r.language || "N/A"}, ${r.stargazers_count} stars): ${r.description || "No description"}`).join("\n")}
`;

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: "Hello! Who are you representing?" }] },
          { role: "model", parts: [{ text: `Hi! I am the portfolio assistant for @${username}. I can answer questions about their projects, tech stack, and GitHub activity.` }] },
        ],
      });

      const response = await chat.sendMessage(`${systemPrompt}\n\nUSER QUESTION: ${userMessage}`);
      const reply = response.response.text();

      // Persist in SQLite
      saveChatMessage(normalizedUsername, "user", userMessage);
      saveChatMessage(normalizedUsername, "assistant", reply);

      return reply;
    } catch (err) {
      console.warn("[ChatbotService] Gemini call failed, falling back to deterministic engine:", err);
    }
  }

  // Deterministic Server-Side Intent Router (Fallback if no key or API error)
  const query = userMessage.toLowerCase();
  let reply = "";

  if (query.includes("star") || query.includes("best") || query.includes("project") || query.includes("popular")) {
    const top3 = context.repos.slice(0, 3);
    const repoBulletList = top3
      .map(
        (r, i) =>
          `${i + 1}. **[${r.name}](${r.html_url})** (${r.language || "TypeScript"}, ⭐ ${r.stargazers_count} stars)\n   _${r.description || "High-impact codebase"}_`
      )
      .join("\n\n");

    reply = `Here are **@${username}'s** most notable repositories by star engagement and impact:\n\n${repoBulletList}\n\nAcross all projects, they have accumulated **${context.user?.total_stars || 0} total GitHub stars**!`;
  } else if (query.includes("language") || query.includes("stack") || query.includes("tech") || query.includes("skill")) {
    const langBreakdown = context.topLanguages
      .map((l: any) => `• **${l.language}**: ${l.percentage}%`)
      .join("\n");

    reply = `Based on verified repository code breakdown, **@${username}** primarily builds in:\n\n${langBreakdown || "• TypeScript\n• Python\n• Go"}\n\nTheir primary technical focus centers around modern web applications, scalable backend microservices, and distributed architecture.`;
  } else if (query.includes("streak") || query.includes("activity") || query.includes("commit") || query.includes("consistent")) {
    const cur = context.contributions?.currentStreak || 0;
    const longest = context.contributions?.longestStreak || 0;
    const total = context.contributions?.totalContributions || 0;

    reply = `**Coding Consistency & Streak Analytics for @${username}:**\n\n• **Current Streak:** ${cur} consecutive active days\n• **Longest Streak:** ${longest} consecutive days\n• **Total Contributions:** ${total} commits across the last 365 days\n\nThis reflects a high degree of active engineering cadence and continuous development discipline.`;
  } else if (query.includes("fit") || query.includes("hire") || query.includes("role") || query.includes("experience")) {
    const topRepo = context.repos[0];
    reply = `**@${username}** demonstrates strong technical alignment for full-stack and backend roles. With **${context.user?.public_repos || 0} public repositories**, extensive code in **${context.topLanguages[0]?.language || "TypeScript"}**, and flagship work such as **${topRepo?.name || "core-engine"}**, they have demonstrated proficiency in building production-ready software with end-to-end testing and caching.`;
  } else {
    const topL = context.topLanguages.slice(0, 3).map((l: any) => l.language).join(", ");
    reply = `Hello! I'm the AI portfolio assistant for **@${username}**.\n\n• **Bio:** ${context.user?.bio || "Full-stack developer"}\n• **Key Languages:** ${topL || "TypeScript, Python"}\n• **Total Stars:** ${context.user?.total_stars || 0} ⭐\n\nFeel free to ask about their top repositories, coding streaks, or how their stack matches your team's open role!`;
  }

  // Persist in SQLite
  saveChatMessage(normalizedUsername, "user", userMessage);
  saveChatMessage(normalizedUsername, "assistant", reply);

  return reply;
}

/**
 * Feature 2: AI Recruiter Pitch & Bio Generator
 */
export async function generateRecruiterPitch(
  username: string,
  jobDescription?: string
): Promise<{ pitch: string; readmeSnippet: string }> {
  const context = loadPortfolioContext(username);
  const topRepos = context.repos.slice(0, 3);
  const primaryLang = context.topLanguages[0]?.language || "TypeScript";
  const stars = context.user?.total_stars || 0;
  const streak = context.contributions?.currentStreak || 0;

  const repoNames = topRepos.map((r) => r.name).join(", ");

  // Check if Gemini is available
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a career strategist. Draft a high-converting, professional 1-paragraph elevator pitch for candidate @${username} targeting the following Job Description:
JD: "${jobDescription || "Full-Stack Engineer with focus on modern APIs, TypeScript, and scalable architecture"}"

CANDIDATE FACTS:
- Languages: ${context.topLanguages.map((l: any) => l.language).join(", ")}
- Top Repos: ${repoNames}
- Total Stars: ${stars}
- Commit Streak: ${streak} days

Return a JSON with:
{
  "pitch": "1 punchy paragraph pitch",
  "readmeSnippet": "A 3-line Markdown bio snippet with badges and metrics"
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("[PitchGenerator] Gemini failed, using deterministic generation:", e);
    }
  }

  // High quality deterministic fallback generator
  const pitch = `As a dedicated software engineer with deep expertise in ${primaryLang} and full-stack system architecture, I bring a demonstrated track record of shipping production-grade applications with over ${stars} stars and ${context.user?.public_repos || 0} public repositories. Flagship projects like ${repoNames || "distributed services"} showcase my commitment to clean code, automated caching, and responsive design. With a sustained ${streak}-day active coding streak, I offer both technical competence and dependable engineering execution to accelerate your engineering roadmap.`;

  const readmeSnippet = `### 🚀 Hi, I'm @${username}
- 🛠️ **Primary Stack:** ${context.topLanguages.slice(0, 4).map((l: any) => `\`${l.language}\``).join(" • ")}
- 🌟 **Impact:** ${stars}+ Stars across ${context.user?.public_repos || 0} repositories | 🔥 **Streak:** ${streak} Days Active
- 💡 **Flagship Projects:** ${topRepos.map((r) => `[${r.name}](${r.html_url})`).join(" | ")}`;

  return { pitch, readmeSnippet };
}
