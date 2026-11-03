import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Determine SQLite directory: uses /tmp on Vercel production serverless, and ./data locally
const dbDir = process.env.VERCEL
  ? path.join("/tmp", "gitpulse")
  : path.resolve(process.cwd(), "data");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "cache.sqlite");

// Initialize Better-SQLite3 connection
export const sqlite = new Database(dbPath);

// Enable WAL mode for high concurrency with graceful fallback
try {
  sqlite.pragma("journal_mode = WAL");
} catch (e) {
  console.warn("[SQLite] WAL mode not supported in this environment, using standard mode.");
}

// Initialize tables automatically on bootstrap
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    followers INTEGER,
    following INTEGER,
    public_repos INTEGER,
    total_stars INTEGER,
    top_languages_json TEXT,
    contributions_json TEXT,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    description TEXT,
    html_url TEXT,
    language TEXT,
    languages_breakdown_json TEXT,
    stargazers_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    topics_json TEXT,
    updated_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_repositories_username ON repositories(username);

  CREATE TABLE IF NOT EXISTS user_settings (
    username TEXT PRIMARY KEY,
    last_jd_text TEXT,
    last_match_score INTEGER,
    last_match_details_json TEXT,
    theme_preference TEXT DEFAULT 'dark'
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chat_history_username ON chat_history(username);
`);

export const db = drizzle(sqlite, { schema });

