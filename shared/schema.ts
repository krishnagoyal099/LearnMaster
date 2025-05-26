import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const learningHistory = pgTable("learning_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  videoTitle: text("video_title"),
  bookTitle: text("book_title"),
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const breakSessions = pgTable("break_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameType: text("game_type").notNull(), // crossword, jigsaw, memory
  duration: integer("duration").notNull(), // in seconds
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLearningHistorySchema = createInsertSchema(learningHistory).omit({
  id: true,
  createdAt: true,
});

export const insertBreakSessionSchema = createInsertSchema(breakSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LearningHistory = typeof learningHistory.$inferSelect;
export type InsertLearningHistory = z.infer<typeof insertLearningHistorySchema>;
export type BreakSession = typeof breakSessions.$inferSelect;
export type InsertBreakSession = z.infer<typeof insertBreakSessionSchema>;
