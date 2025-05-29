import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LearningHistory = typeof learningHistory.$inferSelect;
export type InsertLearningHistory = typeof learningHistory.$inferInsert;
export type BreakSession = typeof breakSessions.$inferSelect;
export type InsertBreakSession = typeof breakSessions.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  mode: varchar("mode", { length: 20 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  videoId: varchar("video_id", { length: 50 }).notNull(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: varchar("duration", { length: 20 }),
  channel: text("channel"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  role: true,
  sessionId: true,
});

export const insertLearningHistorySchema = createInsertSchema(
  learningHistory
).omit({
  id: true,
  createdAt: true,
});

export const insertBreakSessionSchema = createInsertSchema(breakSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit(
  {
    id: true,
    timestamp: true,
  }
);

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  timestamp: true,
});

export const generateContentRequestSchema = z.object({
  youtubeUrl: z.string().url(),
});

export const videoSearchSchema = z.object({
  query: z.string().min(1),
  mode: z.enum(["quick", "oneshot", "playlist"]),
  maxResults: z.number().optional().default(20),
  order: z
    .enum(["relevance", "date", "rating", "viewCount", "title"])
    .optional()
    .default("relevance"),
  duration: z
    .enum(["short", "medium", "long", "any"])
    .optional()
    .default("any"),
});



export type Flashcard = {
  question: string;
  answer: string;
};

export type GenerateContentRequest = z.infer<
  typeof generateContentRequestSchema
>;

export type GenerateContentResponse = {
  id: number;
  title: string;
  flashcards: Flashcard[];
  quizQuestions: any[]; // Replace 'any' with your actual quiz question type if available
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // index of the correct option
};
