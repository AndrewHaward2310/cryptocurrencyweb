import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for future authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Newsletter subscriptions table
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribed_at: timestamp("subscribed_at").defaultNow().notNull(),
  is_active: boolean("is_active").default(true).notNull(),
});

export const insertNewsletterSchema = createInsertSchema(newsletters).pick({
  email: true,
});

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image_url: text("image_url").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  published_at: timestamp("published_at").defaultNow().notNull(),
  is_featured: boolean("is_featured").default(false).notNull(),
  views: integer("views").default(0).notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
});

// Exported types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Types for news automation system
export interface RawNewsItem {
  title: string;
  content: string;
  source: string;
  url: string;
  image_url: string;
  timestamp: Date;
}

export interface ProcessedNewsItem extends RawNewsItem {
  category: string;
  relevanceScore: number;
  extracted_keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface NewsAutomationConfig {
  schedule: {
    fetchInterval: number; // in milliseconds
    publishTime: string;   // time of day to publish, e.g., "08:00"
  };
  sources: {
    name: string;
    url: string;
    trustScore: number; // 0-10
  }[];
  nlp: {
    minRelevanceScore: number; // 0-10
    minContentLength: number;
  };
  publishing: {
    articlesPerDay: number;
    autoPrioritize: boolean;
    defaultCategory: string;
  };
}
