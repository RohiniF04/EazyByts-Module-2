import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Stocks in the user's portfolio
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  shares: real("shares").notNull(),
  purchasePrice: real("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
});

// Watchlist items that users want to track
export const watchlistItems = pgTable("watchlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  dateAdded: timestamp("date_added").notNull(),
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
});

// User preferences for display options, etc.
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  defaultTimeframe: text("default_timeframe").default("1D"),
  theme: text("theme").default("light"),
  favoriteIndicators: text("favorite_indicators").array(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
