import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  username: text("username").primaryKey(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  followers: integer("followers"),
  following: integer("following"),
  public_repos: integer("public_repos"),
  total_stars: integer("total_stars"),
  top_languages_json: text("top_languages_json"),
  contributions_json: text("contributions_json"),
  updated_at: integer("updated_at"),
});

export const repositories = sqliteTable(
  "repositories",
  {
    id: integer("id").primaryKey(),
    username: text("username").notNull(),
    name: text("name").notNull(),
    full_name: text("full_name"),
    description: text("description"),
    html_url: text("html_url"),
    language: text("language"),
    languages_breakdown_json: text("languages_breakdown_json"),
    stargazers_count: integer("stargazers_count").default(0),
    forks_count: integer("forks_count").default(0),
    topics_json: text("topics_json"),
    updated_at: text("updated_at"),
  },
  (table) => ({
    usernameIdx: index("idx_repositories_username").on(table.username),
  })
);

export const userSettings = sqliteTable("user_settings", {
  username: text("username").primaryKey(),
  last_jd_text: text("last_jd_text"),
  last_match_score: integer("last_match_score"),
  last_match_details_json: text("last_match_details_json"),
  theme_preference: text("theme_preference").default("dark"),
});

export const chatHistory = sqliteTable("chat_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  message: text("message").notNull(),
  created_at: integer("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Repository = typeof repositories.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type ChatHistory = typeof chatHistory.$inferSelect;

