import { useState } from "react";
import { Header } from "@/components/Header";
import { LearningInterface } from "@/components/LearningInterface";
import { Button } from "@/components/ui/button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useLocation } from "react-router-dom"; // Add this import

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLearningInterface, setShowLearningInterface] = useState(false);
  const location = window.location; // or useLocation() if using react-router

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowLearningInterface(true);
  };

  const handlePromptClick = (prompt: string) => {
    handleSearch(prompt);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    }
  };

  const prompts = [
    "Python programming....",
    "Help me learn calculus step by step...",
    "Teach me about photosynthesis...",
    "What is machine learning?",
    "What subject interests you?",
    "Ask me about any subject you want to learn...",
  ];

  const placeholders = [
    "Explain the water cycle process...",
    "How can I help you learn today?",
    "Ask about math, science, history...",
    "What subject interests you?",
    "Type your question and press Enter...",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onLogoClick={handleLogoClick} />

      {!showLearningInterface ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
          {/* Thought Bubble */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              {/* Main thought bubble - improved cloud-like shape */}
              <div className="relative">
                {/* Main cloud body with better shape */}
                <div
                  className="bg-card/90 backdrop-blur-sm border border-border/40 shadow-2xl relative hover:shadow-3xl transition-all duration-500 px-14 py-12"
                  style={{
                    borderRadius: "50% 60% 70% 40% / 60% 50% 80% 45%",
                    transform: "rotate(-1deg)",
                  }}
                >
                  {/* Multiple cloud bumps for natural organic shape */}
                  <div
                    className="absolute -top-6 left-6 w-16 h-10 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                    style={{
                      borderRadius: "60% 40% 50% 60% / 70% 30% 70% 50%",
                    }}
                  ></div>

                  <div
                    className="absolute -top-3 right-10 w-12 h-8 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                    style={{
                      borderRadius: "40% 60% 30% 70% / 50% 70% 30% 50%",
                    }}
                  ></div>

                  <div
                    className="absolute -left-4 top-8 w-10 h-14 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                    style={{
                      borderRadius: "50% 70% 60% 40% / 60% 40% 80% 50%",
                    }}
                  ></div>

                  <div
                    className="absolute -right-3 bottom-6 w-14 h-10 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                    style={{
                      borderRadius: "70% 30% 50% 60% / 40% 70% 50% 60%",
                    }}
                  ></div>

                  <div
                    className="absolute -bottom-2 left-1/4 w-8 h-6 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                    style={{
                      borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
                    }}
                  ></div>

                  {/* Enhanced gradient overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-violet-800/10 to-fuchsia-600/15"
                    style={{
                      borderRadius: "50% 60% 70% 40% / 60% 50% 80% 45%",
                    }}
                  ></div>

                  <p
                    className="text-3xl font-bold relative z-10 bg-gradient-to-r from-purple-900 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent leading-relaxed"
                    style={{ transform: "rotate(1deg)" }}
                  >
                    How can I help you learn today?
                  </p>
                </div>

                {/* Improved thought bubble tail with natural progression */}
                <div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-card/90 backdrop-blur-sm border border-border/40 shadow-lg"
                  style={{ borderRadius: "60% 40% 50% 60% / 70% 30% 70% 50%" }}
                ></div>

                <div
                  className="absolute -bottom-15 left-1/2 transform -translate-x-7 w-8 h-6 bg-card/90 backdrop-blur-sm border border-border/40 shadow-md"
                  style={{ borderRadius: "50% 70% 30% 50% / 60% 40% 60% 40%" }}
                ></div>

                <div
                  className="absolute -bottom-20 left-1/2 transform -translate-x-10 w-5 h-4 bg-card/90 backdrop-blur-sm border border-border/40 shadow-sm"
                  style={{ borderRadius: "60% 40% 50% 60% / 70% 30% 70% 50%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Prompt Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-5xl w-full">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="bg-card/30 backdrop-blur-sm border-border/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-2xl">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      ) : (
        <LearningInterface subject={searchQuery} />
      )}
    </div>
  );
}
