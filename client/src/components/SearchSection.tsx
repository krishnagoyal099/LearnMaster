import { useState } from "react";
import { Bot } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");

  // Placeholders for the animated effect
  const placeholders = [
    "For example: Python, JavaScript, Machine Learning...",
    "What do you want to learn today?",
    "Try 'React for beginners'",
    "Type a topic and press Enter!",
    "Find resources for Data Science, AI, and more...",
  ];

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle submit (Enter or button)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white/20 dark:bg-gray-800/50 p-4 rounded-full mr-4 backdrop-blur-sm">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            What do you want to learn today?
          </h1>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
