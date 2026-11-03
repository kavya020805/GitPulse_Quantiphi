import { db } from "@/db";
import { repositories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { saveUserSettings } from "./cache.service";

export interface TechTaxonomyEntry {
  canonical: string;
  category: "Frontend" | "Backend" | "Database" | "DevOps/Cloud" | "AI/Data" | "Systems/Other";
  aliases: string[];
}

export const TECH_TAXONOMY: TechTaxonomyEntry[] = [
  // Frontend
  { canonical: "TypeScript", category: "Frontend", aliases: ["typescript", "ts"] },
  { canonical: "JavaScript", category: "Frontend", aliases: ["javascript", "js", "ecmascript"] },
  { canonical: "React", category: "Frontend", aliases: ["react", "reactjs", "react.js"] },
  { canonical: "Next.js", category: "Frontend", aliases: ["nextjs", "next.js", "next"] },
  { canonical: "Vue.js", category: "Frontend", aliases: ["vue", "vuejs", "vue.js", "nuxt"] },
  { canonical: "Angular", category: "Frontend", aliases: ["angular", "angularjs"] },
  { canonical: "Svelte", category: "Frontend", aliases: ["svelte", "sveltekit"] },
  { canonical: "Tailwind CSS", category: "Frontend", aliases: ["tailwind", "tailwindcss"] },
  { canonical: "HTML/CSS", category: "Frontend", aliases: ["html", "html5", "css", "css3", "sass", "scss"] },
  { canonical: "Redux", category: "Frontend", aliases: ["redux", "zustand", "mobx"] },

  // Backend
  { canonical: "Node.js", category: "Backend", aliases: ["node", "nodejs", "node.js", "express", "nestjs"] },
  { canonical: "Python", category: "Backend", aliases: ["python", "py", "django", "flask", "fastapi"] },
  { canonical: "Go (Golang)", category: "Backend", aliases: ["go", "golang", "gin", "fiber"] },
  { canonical: "Rust", category: "Backend", aliases: ["rust", "actix", "tokio", "axum"] },
  { canonical: "Java", category: "Backend", aliases: ["java", "spring", "spring boot", "springboot"] },
  { canonical: "C# / .NET", category: "Backend", aliases: ["c#", "csharp", ".net", "dotnet", "asp.net"] },
  { canonical: "PHP", category: "Backend", aliases: ["php", "laravel", "symfony"] },
  { canonical: "Ruby", category: "Backend", aliases: ["ruby", "rails", "ruby on rails"] },
  { canonical: "GraphQL", category: "Backend", aliases: ["graphql", "apollo"] },
  { canonical: "REST API", category: "Backend", aliases: ["rest", "restful", "rest api", "apis"] },

  // Databases & Storage
  { canonical: "PostgreSQL", category: "Database", aliases: ["postgresql", "postgres"] },
  { canonical: "MySQL", category: "Database", aliases: ["mysql", "mariadb"] },
  { canonical: "MongoDB", category: "Database", aliases: ["mongodb", "mongo", "nosql"] },
  { canonical: "Redis", category: "Database", aliases: ["redis", "memcached"] },
  { canonical: "SQLite", category: "Database", aliases: ["sqlite", "better-sqlite3"] },
  { canonical: "Elasticsearch", category: "Database", aliases: ["elasticsearch", "elastic", "opensearch"] },

  // DevOps & Cloud
  { canonical: "Docker", category: "DevOps/Cloud", aliases: ["docker", "container", "containers"] },
  { canonical: "Kubernetes", category: "DevOps/Cloud", aliases: ["kubernetes", "k8s"] },
  { canonical: "AWS", category: "DevOps/Cloud", aliases: ["aws", "amazon web services", "s3", "ec2", "lambda"] },
  { canonical: "Google Cloud", category: "DevOps/Cloud", aliases: ["gcp", "google cloud", "cloud run"] },
  { canonical: "CI/CD", category: "DevOps/Cloud", aliases: ["ci/cd", "github actions", "gitlab ci", "jenkins"] },
  { canonical: "Linux", category: "DevOps/Cloud", aliases: ["linux", "unix", "bash", "shell"] },
  { canonical: "Git", category: "DevOps/Cloud", aliases: ["git", "github", "version control"] },

  // AI & Data
  { canonical: "Machine Learning", category: "AI/Data", aliases: ["machine learning", "ml", "deep learning", "ai"] },
  { canonical: "PyTorch", category: "AI/Data", aliases: ["pytorch", "torch"] },
  { canonical: "TensorFlow", category: "AI/Data", aliases: ["tensorflow", "keras"] },
  { canonical: "LLM & GenAI", category: "AI/Data", aliases: ["llm", "large language model", "genai", "generative ai", "openai", "gemini", "rag"] },
  { canonical: "Pandas/NumPy", category: "AI/Data", aliases: ["pandas", "numpy", "data analysis", "scipy"] },

  // Systems & Other
  { canonical: "C / C++", category: "Systems/Other", aliases: ["c++", "cpp", "c/c++"] },
  { canonical: "Microservices", category: "Systems/Other", aliases: ["microservices", "microservice", "distributed systems"] },
];

export interface VibeCheckResult {
  username: string;
  matchPercentage: number;
  badgeLabel: string;
  badgeColor: "emerald" | "amber" | "rose";
  matchedSkills: string[];
  missingSkills: string[];
  topSupportingRepos: Array<{
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    matchedTaxa: string[];
    relevanceScore: number;
  }>;
  analyzedAt: string;
}

/**
 * Tokenize and match target Job Description against SQLite cached repositories
 */
export async function performVibeCheck(
  username: string,
  jobDescription: string
): Promise<VibeCheckResult> {
  const normalizedUsername = username.toLowerCase().trim();
  const jdLower = ` ${jobDescription.toLowerCase()} `;

  // 1. Identify skills mentioned in the Job Description
  const demandedSkills: TechTaxonomyEntry[] = [];
  for (const entry of TECH_TAXONOMY) {
    const isDemanded = entry.aliases.some((alias) => {
      // Escape special regex characters in alias (e.g. .net, c++, c#)
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]{}/<>-])${escaped}(?:$|[\\s,;:.()\\[\\]{}/<>-])`, "i");
      return regex.test(jdLower);
    });

    if (isDemanded) {
      demandedSkills.push(entry);
    }
  }

  // Fallback: If no skills found in text, pick top 5 standard skills so the UI is always instructive
  const targetSkills = demandedSkills.length > 0 ? demandedSkills : TECH_TAXONOMY.slice(0, 5);

  // 2. Fetch cached repositories from SQLite
  const repos = db
    .select()
    .from(repositories)
    .where(eq(repositories.username, normalizedUsername))
    .all();

  // 3. Score candidate repositories against demanded skills
  const matchedSkillsSet = new Set<string>();
  const repoMatches: Array<{
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    matchedTaxa: string[];
    relevanceScore: number;
  }> = [];

  for (const repo of repos) {
    let topics: string[] = [];
    try {
      if (repo.topics_json) topics = JSON.parse(repo.topics_json);
    } catch {
      topics = [];
    }

    const repoContext = `${repo.name} ${repo.language || ""} ${topics.join(" ")} ${repo.description || ""}`.toLowerCase();
    const matchedTaxaForRepo: string[] = [];

    for (const skill of targetSkills) {
      const hasSkill = skill.aliases.some((alias) => {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]{}/<>-])${escaped}(?:$|[\\s,;:.()\\[\\]{}/<>-])`, "i");
        return regex.test(repoContext);
      });

      if (hasSkill) {
        matchedTaxaForRepo.push(skill.canonical);
        matchedSkillsSet.add(skill.canonical);
      }
    }

    if (matchedTaxaForRepo.length > 0) {
      // Relevance score: skill overlap + star weight + presence
      const relevanceScore = matchedTaxaForRepo.length * 20 + Math.min(repo.stargazers_count || 0, 50);
      repoMatches.push({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url || `https://github.com/${repo.username}/${repo.name}`,
        language: repo.language,
        stargazers_count: repo.stargazers_count || 0,
        matchedTaxa: matchedTaxaForRepo,
        relevanceScore,
      });
    }
  }

  // Sort matching repos by relevance descending
  repoMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = targetSkills
    .map((s) => s.canonical)
    .filter((name) => !matchedSkillsSet.has(name));

  // Compute Match Percentage (Server-Side)
  let rawPercentage = Math.round((matchedSkills.length / targetSkills.length) * 100);
  if (targetSkills.length === 0) rawPercentage = 75;
  const matchPercentage = Math.max(10, Math.min(100, rawPercentage));

  let badgeLabel = "🌱 Growth Potential";
  let badgeColor: "emerald" | "amber" | "rose" = "rose";

  if (matchPercentage >= 75) {
    badgeLabel = "🔥 Ideal Fit";
    badgeColor = "emerald";
  } else if (matchPercentage >= 50) {
    badgeLabel = "⚡ Strong Match";
    badgeColor = "amber";
  }

  const result: VibeCheckResult = {
    username: normalizedUsername,
    matchPercentage,
    badgeLabel,
    badgeColor,
    matchedSkills,
    missingSkills,
    topSupportingRepos: repoMatches.slice(0, 4),
    analyzedAt: new Date().toISOString(),
  };

  // 4. Persist to SQLite user_settings table
  saveUserSettings(normalizedUsername, jobDescription, matchPercentage, result);

  return result;
}
