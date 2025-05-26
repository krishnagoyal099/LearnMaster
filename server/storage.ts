import { 
  users, 
  learningHistory, 
  breakSessions,
  type User, 
  type InsertUser,
  type LearningHistory,
  type InsertLearningHistory,
  type BreakSession,
  type InsertBreakSession
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLearningHistory(history: InsertLearningHistory): Promise<LearningHistory>;
  createBreakSession(session: InsertBreakSession): Promise<BreakSession>;
  getLearningHistory(userId?: number): Promise<LearningHistory[]>;
  getBreakSessions(userId?: number): Promise<BreakSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningHistories: Map<number, LearningHistory>;
  private breakSessionsMap: Map<number, BreakSession>;
  private currentUserId: number;
  private currentHistoryId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.learningHistories = new Map();
    this.breakSessionsMap = new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
    this.currentSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLearningHistory(insertHistory: InsertLearningHistory): Promise<LearningHistory> {
    const id = this.currentHistoryId++;
    const history: LearningHistory = { 
      id,
      subject: insertHistory.subject,
      userId: insertHistory.userId ?? null,
      videoTitle: insertHistory.videoTitle ?? null,
      bookTitle: insertHistory.bookTitle ?? null,
      duration: insertHistory.duration ?? null,
      createdAt: new Date()
    };
    this.learningHistories.set(id, history);
    return history;
  }

  async createBreakSession(insertSession: InsertBreakSession): Promise<BreakSession> {
    const id = this.currentSessionId++;
    const session: BreakSession = { 
      id,
      userId: insertSession.userId ?? null,
      gameType: insertSession.gameType,
      duration: insertSession.duration,
      completed: insertSession.completed ?? null,
      createdAt: new Date()
    };
    this.breakSessionsMap.set(id, session);
    return session;
  }

  async getLearningHistory(userId?: number): Promise<LearningHistory[]> {
    const histories = Array.from(this.learningHistories.values());
    return userId 
      ? histories.filter(h => h.userId === userId)
      : histories;
  }

  async getBreakSessions(userId?: number): Promise<BreakSession[]> {
    const sessions = Array.from(this.breakSessionsMap.values());
    return userId 
      ? sessions.filter(s => s.userId === userId)
      : sessions;
  }
}

export const storage = new MemStorage();
