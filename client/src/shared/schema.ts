export interface Message {
  role: "user" | "ai";
  content: string;
  createdAt: string | Date;
}
