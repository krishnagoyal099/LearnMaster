import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Message } from "../../../shared/schema";
import { Bot, Moon, Sun, Trash2, Send } from "lucide-react";
import { nanoid } from "nanoid";

export default function Chat() {
  const [sessionId] = useState(() => nanoid());
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for current session
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${sessionId}`],
    refetchInterval: 0, // Remove automatic refetching
    staleTime: Infinity, // Consider data fresh forever until manually invalidated
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Send user message
      await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
        sessionId,
      });

      // Send AI message
      return await apiRequest("POST", "/api/messages", {
        content: "AI response here", // Replace with actual Gemini response
        role: "assistant",
        sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/messages/${sessionId}`],
      });
      setMessage(""); // Clear input
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/messages/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/messages/${sessionId}`],
      });
      toast({
        description: "Chat history cleared",
      });
    },
    onError: (error) => {
      toast({
        description:
          error instanceof Error ? error.message : "Failed to clear chat",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Add message sending function
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync(message);
      setMessage(""); // Clear input after sending
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || sendMessageMutation.isPending) return;

    setMessage("");
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessageMutation.mutateAsync(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
  };

  const charCount = message.length;
  const isOverLimit = charCount > 2000;
  const canSend =
    message.trim() && !isOverLimit && !sendMessageMutation.isPending;

  return (
    <div className="h-full bg-[hsl(var(--light-bg))] dark:bg-[hsl(var(--dark-bg))] text-[hsl(var(--light-text))] dark:text-[hsl(var(--dark-text))] transition-colors duration-200">
      {/* Main Chat Area */}
      <main className="h-full pb-20 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Welcome Message */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-[hsl(var(--gemini-primary))] to-[hsl(var(--gemini-secondary))] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to Gemini Chat
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Start a conversation with Google's AI assistant. Ask
                  questions, get help with tasks, or just chat!
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={{
                  ...msg,
                  role: msg.role === "assistant" ? "ai" : "user",
                }}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3 max-w-xs lg:max-w-md xl:max-w-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--gemini-primary))] to-[hsl(var(--gemini-secondary))] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-[hsl(var(--light-secondary))] dark:bg-[hsl(var(--dark-secondary))] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-background/95 backdrop-blur">
            <div className="max-w-4xl mx-auto flex gap-4">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 min-h-[44px] max-h-32 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || isTyping}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
