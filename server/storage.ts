import {
  users,
  learningHistory,
  breakSessions,
  type User,
  type InsertUser,
  type LearningHistory,
  type InsertLearningHistory,
  type BreakSession,
  type InsertBreakSession,
  messages,
  type Message,
  type InsertMessage,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLearningHistory(
    history: InsertLearningHistory
  ): Promise<LearningHistory>;
  createBreakSession(session: InsertBreakSession): Promise<BreakSession>;
  getLearningHistory(userId?: number): Promise<LearningHistory[]>;
  getBreakSessions(userId?: number): Promise<BreakSession[]>;
  createVideo(data: { youtubeUrl: string }): Promise<any>;
  updateVideo(id: number, data: Partial<Video>): Promise<Video | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  clearMessagesBySession(sessionId: string): Promise<void>;
}

interface Video {
  id: number;
  youtubeUrl: string;
  title: string;
  transcript: string;
  flashcards: any[];
  quizQuestions: any[];
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningHistories: Map<number, LearningHistory>;
  private breakSessionsMap: Map<number, BreakSession>;
  private currentUserId: number;
  private currentHistoryId: number;
  private currentSessionId: number;
  private videos: any[];
  private videoId: number;
  private messages: Map<number, Message>;
  private currentMessageId: number;
  private dataFile: string;

  constructor() {
    this.dataFile = './data/storage.json';
    this.users = new Map();
    this.learningHistories = new Map();
    this.breakSessionsMap = new Map();
    this.currentUserId = 1;
    this.currentHistoryId = 1;
    this.currentSessionId = 1;
    this.videos = [];
    this.videoId = 1;
    this.messages = new Map();
    this.currentMessageId = 1;
    
    this.loadData().catch(console.error);
  }

  private async loadData() {
    try {
      const { existsSync, mkdirSync, readFileSync } = await import('fs');
      const { dirname } = await import('path');
      
      // Create data directory if it doesn't exist
      const dataDir = dirname(this.dataFile);
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
      }

      if (existsSync(this.dataFile)) {
        const data = JSON.parse(readFileSync(this.dataFile, 'utf8'));
        
        // Restore users
        if (data.users) {
          this.users = new Map(data.users.map((user: any) => [user.id, user]));
        }
        
        // Restore learning histories
        if (data.learningHistories) {
          this.learningHistories = new Map(data.learningHistories.map((history: any) => [history.id, {
            ...history,
            createdAt: new Date(history.createdAt)
          }]));
        }
        
        // Restore break sessions
        if (data.breakSessions) {
          this.breakSessionsMap = new Map(data.breakSessions.map((session: any) => [session.id, {
            ...session,
            createdAt: new Date(session.createdAt)
          }]));
        }
        
        // Restore messages
        if (data.messages) {
          this.messages = new Map(data.messages.map((message: any) => [message.id, {
            ...message,
            createdAt: new Date(message.createdAt)
          }]));
        }
        
        // Restore other data
        this.currentUserId = data.currentUserId || 1;
        this.currentHistoryId = data.currentHistoryId || 1;
        this.currentSessionId = data.currentSessionId || 1;
        this.currentMessageId = data.currentMessageId || 1;
        this.videos = data.videos || [];
        this.videoId = data.videoId || 1;
        
        console.log(`Loaded ${this.users.size} users from persistent storage`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async saveData() {
    try {
      const { existsSync, mkdirSync, writeFileSync } = await import('fs');
      const { dirname } = await import('path');
      
      const dataDir = dirname(this.dataFile);
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
      }

      const data = {
        users: Array.from(this.users.values()),
        learningHistories: Array.from(this.learningHistories.values()),
        breakSessions: Array.from(this.breakSessionsMap.values()),
        messages: Array.from(this.messages.values()),
        currentUserId: this.currentUserId,
        currentHistoryId: this.currentHistoryId,
        currentSessionId: this.currentSessionId,
        currentMessageId: this.currentMessageId,
        videos: this.videos,
        videoId: this.videoId
      };
      
      writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserById(id: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.id.toString() === id
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    await this.saveData();
    return user;
  }

  async createLearningHistory(
    insertHistory: InsertLearningHistory
  ): Promise<LearningHistory> {
    const id = this.currentHistoryId++;
    const history: LearningHistory = {
      id,
      subject: insertHistory.subject,
      userId: insertHistory.userId ?? null,
      videoTitle: insertHistory.videoTitle ?? null,
      bookTitle: insertHistory.bookTitle ?? null,
      duration: insertHistory.duration ?? null,
      createdAt: new Date(),
    };
    this.learningHistories.set(id, history);
    await this.saveData();
    return history;
  }

  async createBreakSession(
    insertSession: InsertBreakSession
  ): Promise<BreakSession> {
    const id = this.currentSessionId++;
    const session: BreakSession = {
      id,
      userId: insertSession.userId ?? null,
      gameType: insertSession.gameType,
      duration: insertSession.duration,
      completed: insertSession.completed ?? null,
      createdAt: new Date(),
    };
    this.breakSessionsMap.set(id, session);
    await this.saveData();
    return session;
  }

  async getLearningHistory(userId?: number): Promise<LearningHistory[]> {
    const histories = Array.from(this.learningHistories.values());
    return userId ? histories.filter((h) => h.userId === userId) : histories;
  }

  async getBreakSessions(userId?: number): Promise<BreakSession[]> {
    const sessions = Array.from(this.breakSessionsMap.values());
    return userId ? sessions.filter((s) => s.userId === userId) : sessions;
  }

  async createVideo(data: { youtubeUrl: string }) {
    const video = {
      id: this.videoId++,
      youtubeUrl: data.youtubeUrl,
      title: "",
      transcript: "",
      flashcards: [],
      quizQuestions: [],
    };
    this.videos.push(video);
    return Promise.resolve(video);
  }

  async updateVideo(
    id: number,
    data: Partial<Video>
  ): Promise<Video | undefined> {
    const videoIndex = this.videos.findIndex((v) => v.id === id);
    if (videoIndex === -1) {
      return undefined;
    }

    this.videos[videoIndex] = {
      ...this.videos[videoIndex],
      ...data,
    };

    return this.videos[videoIndex];
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.find((v) => v.id === id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = {
      id,
      ...message,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    await this.saveData();
    return newMessage;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.sessionId === sessionId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }

  async clearMessagesBySession(sessionId: string): Promise<void> {
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([, message]) => message.sessionId === sessionId)
      .map(([id]) => id);

    messagesToDelete.forEach((id) => this.messages.delete(id));
  }

  async deleteMessagesBySession(sessionId: string): Promise<void> {
    try {
      // Create a new Map with filtered messages
      const filteredMessages = new Map(
        Array.from(this.messages.entries()).filter(
          ([_, message]) => message.sessionId !== sessionId
        )
      );

      this.messages = filteredMessages;
      await this.saveData();
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw new Error("Failed to delete messages");
    }
  }
}

export const storage = new MemStorage();