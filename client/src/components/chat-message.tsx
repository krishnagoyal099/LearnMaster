import { Message } from "@/shared/schema";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Bot } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        description: "Message copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-xs lg:max-w-md xl:max-w-lg bg-[hsl(var(--gemini-primary))] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <div className="text-xs text-emerald-100 mt-2 flex items-center justify-end">
            <span>{formatTime(new Date(message.createdAt))}</span>
            <CheckCheck className="ml-2 h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex space-x-3 max-w-xs lg:max-w-md xl:max-w-lg">
        <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--gemini-primary))] to-[hsl(var(--gemini-secondary))] rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-3 w-3 text-white" />
        </div>
        <div className="bg-[hsl(var(--light-secondary))] dark:bg-[hsl(var(--dark-secondary))] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
            <span>{formatTime(new Date(message.createdAt))}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto p-1 h-auto hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={copyToClipboard}
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

