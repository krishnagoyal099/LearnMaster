import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ChatModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    // Call Gemini API (replace with your actual API call)
    const res = await fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setMessages((msgs) => [
      ...msgs,
      { role: "assistant", content: data.reply },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <div className="h-96 overflow-y-auto bg-background rounded p-4 mb-4 border border-border">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={
                  msg.role === "user"
                    ? "font-semibold text-primary"
                    : "font-semibold text-green-400"
                }
              >
                {msg.role === "user" ? "You" : "AI"}:
              </span>{" "}
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            className="flex-1 rounded border px-3 py-2 bg-background text-foreground"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
