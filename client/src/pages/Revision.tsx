
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateContent } from "@/lib/api";
import { UrlInputForm } from "@/components/url-input-form";
import { Flashcard } from "@/components/flashcard";
import { QuizStack } from "@/components/quiz-stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, Brain } from "lucide-react";
import type {
  Flashcard as FlashcardType,
  QuizQuestion as QuizQuestionType,
} from "../../../shared/schema";

interface VideoHistory {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export default function Revision() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionType[]>([]);
  const [currentMode, setCurrentMode] = useState<"flashcards" | "quiz">(
    "flashcards"
  );
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  // Load video history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("youtube-revision-history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setVideoHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing video history:", error);
      }
    }
  }, []);

  // Save video history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("youtube-revision-history", JSON.stringify(videoHistory));
  }, [videoHistory]);

  const generateMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (data) => {
      setFlashcards(data.flashcards);
      setQuizQuestions(data.quizQuestions);
    },
  });

  const extractVideoTitle = async (url: string): Promise<string> => {
    try {
      // Extract video ID from URL
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      if (!videoIdMatch) return "Unknown Video";
      
      const videoId = videoIdMatch[1];
      
      // Fetch video title using YouTube oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title || "Unknown Video";
      }
    } catch (error) {
      console.error("Error fetching video title:", error);
    }
    return "Unknown Video";
  };

  const addToHistory = async (youtubeUrl: string) => {
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return;

    // Check if video already exists in history
    const existingIndex = videoHistory.findIndex(item => item.id === videoId);
    
    if (existingIndex >= 0) {
      // Move existing video to top
      const existingVideo = videoHistory[existingIndex];
      const updatedHistory = [
        { ...existingVideo, timestamp: Date.now() },
        ...videoHistory.filter((_, index) => index !== existingIndex)
      ];
      setVideoHistory(updatedHistory);
    } else {
      // Add new video to history
      const title = await extractVideoTitle(youtubeUrl);
      const newHistoryItem: VideoHistory = {
        id: videoId,
        url: youtubeUrl,
        title,
        timestamp: Date.now()
      };
      
      // Keep only the 20 most recent videos
      const updatedHistory = [newHistoryItem, ...videoHistory].slice(0, 20);
      setVideoHistory(updatedHistory);
    }
  };

  const handleGenerateContent = async (youtubeUrl: string) => {
    setCurrentVideoUrl(youtubeUrl);
    await addToHistory(youtubeUrl);
    generateMutation.mutate({ youtubeUrl });
  };

  const handleHistoryItemClick = (historyItem: VideoHistory) => {
    setCurrentVideoUrl(historyItem.url);
    generateMutation.mutate({ youtubeUrl: historyItem.url });
  };

  const removeFromHistory = (videoId: string) => {
    setVideoHistory(prev => prev.filter(item => item.id !== videoId));
  };

  const clearHistory = () => {
    setVideoHistory([]);
  };

  const handleQuizComplete = (score: number) => {
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);
    alert(`Quiz completed! You scored ${score}/${total} (${percentage}%)`);
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

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar for History */}
        <div className="w-80 border-r border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Study History</h2>
              {videoHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4">
              {videoHistory.length === 0 ? (
                <div className="text-center text-white/50 py-12">
                  <History className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No study materials created yet</p>
                  <p className="text-xs mt-1">Start by adding a YouTube video to generate revision content</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {videoHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleHistoryItemClick(item)}
                      className="group relative flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-2 leading-tight mb-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/50">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item.id);
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
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-4xl mx-auto p-8 space-y-12">
            
            {/* Header Section */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Smart Revision Hub
                  </h1>
                  <p className="text-white/80 text-lg">Convert educational videos into personalized study materials for effective revision</p>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="w-full max-w-2xl mx-auto">
              <UrlInputForm
                onSubmit={handleGenerateContent}
                isLoading={generateMutation.isPending}
                onModeChange={setCurrentMode}
                currentMode={currentMode}
                defaultValue={currentVideoUrl}
              />
            </div>

            {/* Error Display */}
            {generateMutation.isError && (
              <div className="w-full max-w-2xl mx-auto">
                <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-md">
                  <CardContent className="p-6 text-center">
                    <div className="text-red-300 font-medium">
                      {generateMutation.error instanceof Error
                        ? generateMutation.error.message
                        : "An error occurred. Please try again."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Results Section */}
            {(flashcards.length > 0 || quizQuestions.length > 0) && (
              <div className="w-full space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-semibold text-white">
                    {currentMode === "flashcards" ? "Revision Flashcards" : "Knowledge Assessment"}
                  </h2>
                  <p className="text-white/70">
                    {currentMode === "flashcards" 
                      ? `${flashcards.length} flashcards created for focused revision and memory retention`
                      : `${quizQuestions.length} questions to evaluate your comprehension and identify knowledge gaps`
                    }
                  </p>
                </div>

                <div className="w-full max-w-3xl mx-auto">
                  {currentMode === "flashcards" && flashcards.length > 0 && (
                    <Flashcard flashcards={flashcards} />
                  )}
                  {currentMode === "quiz" && quizQuestions.length > 0 && (
                    <QuizStack
                      quizQuestions={quizQuestions}
                      onComplete={handleQuizComplete}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
