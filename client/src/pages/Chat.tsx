
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Message } from "../../../shared/schema";
import { Bot, History, Trash2, Send, MessageSquare } from "lucide-react";
import { nanoid } from "nanoid";

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  lastMessage?: string;
}

export default function Chat() {
  const [sessionId, setSessionId] = useState(() => nanoid());
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load chat sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("chat-sessions");
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setChatSessions(parsedSessions);
      } catch (error) {
        console.error("Error parsing chat sessions:", error);
      }
    }
  }, []);

  // Save chat sessions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chat-sessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Fetch messages for current session
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${sessionId}`],
    refetchInterval: 0,
    staleTime: Infinity,
  });

  // Update session when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const sessionTitle = messages.find(m => m.role === 'user')?.content.slice(0, 50) + "..." || "New Chat";
      
      setChatSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === sessionId);
        const updatedSession: ChatSession = {
          id: sessionId,
          title: sessionTitle,
          timestamp: Date.now(),
          lastMessage: lastMessage.content.slice(0, 100) + "..."
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedSession;
          return updated;
        } else {
          return [updatedSession, ...prev].slice(0, 20); // Keep only 20 most recent
        }
      });
    }
  }, [messages, sessionId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Send user message
      await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
        sessionId,
      });

      // Show typing indicator
      setIsTyping(true);
      
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get AI response
      const geminiResponse = await apiRequest("POST", "/api/gemini-chat", {
        message: content,
      });
      
      const geminiData = await geminiResponse.json();
      
      // Process and clean up the response
      const cleanedReply = geminiData.reply
        .replace(/^\s*Response:\s*/i, '')
        .trim();
      
      // Send AI message
      return await apiRequest("POST", "/api/messages", {
        content: cleanedReply,
        role: "assistant", 
        sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/messages/${sessionId}`],
      });
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Send message error:", error);
      setIsTyping(false);
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

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || sendMessageMutation.isPending) return;

    setMessage("");
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendMessageMutation.mutateAsync(content);
    } catch (error) {
      console.error("Error sending message:", error);
    }
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

  const handleNewChat = () => {
    const newSessionId = nanoid();
    setSessionId(newSessionId);
    setMessage("");
    setIsTyping(false);
  };

  const handleSessionClick = (session: ChatSession) => {
    setSessionId(session.id);
    setMessage("");
    setIsTyping(false);
  };

  const removeSession = (sessionIdToRemove: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionIdToRemove));
    if (sessionIdToRemove === sessionId) {
      handleNewChat();
    }
  };

  const clearAllSessions = () => {
    setChatSessions([]);
    handleNewChat();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const charCount = message.length;
  const isOverLimit = charCount > 2000;
  const canSend = message.trim() && !isOverLimit && !sendMessageMutation.isPending;

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar for Chat History */}
        <div className="w-80 border-r border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Chat History</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                >
                  New Chat
                </Button>
                {chatSessions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSessions}
                    className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4">
              {chatSessions.length === 0 ? (
                <div className="text-center text-white/50 py-12">
                  <History className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No chat sessions yet</p>
                  <p className="text-xs mt-1">Start a conversation to create chat history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      className={`group relative flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 ${
                        session.id === sessionId ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-2 leading-tight mb-1">
                          {session.title}
                        </p>
                        {session.lastMessage && (
                          <p className="text-xs text-white/40 line-clamp-1 mb-1">
                            {session.lastMessage}
                          </p>
                        )}
                        <p className="text-xs text-white/50">
                          {formatDate(session.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSession(session.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Welcome Message */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  AI Study Assistant Chat
                </h2>
                <p className="text-white/80 max-w-md mx-auto">
                  Ask questions about your studies, get explanations, or discuss any topic. 
                  Your AI assistant is here to help with your learning journey!
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot"></div>
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot"
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
          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies..."
                  className="min-h-[44px] max-h-32 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 resize-none"
                />
                {charCount > 0 && (
                  <div className={`absolute bottom-2 right-2 text-xs ${
                    isOverLimit ? 'text-red-400' : 'text-white/50'
                  }`}>
                    {charCount}/2000
                  </div>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!canSend}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
