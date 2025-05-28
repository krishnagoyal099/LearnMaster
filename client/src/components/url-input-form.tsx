import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  youtubeUrl: z.string().url("Please enter a valid URL").refine(
    (url) => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      return youtubeRegex.test(url);
    },
    "Please enter a valid YouTube URL"
  ),
});

type FormData = z.infer<typeof formSchema>;

interface UrlInputFormProps {
  onSubmit: (youtubeUrl: string) => void;
  isLoading?: boolean;
  onModeChange?: (mode: 'flashcards' | 'quiz') => void;
  currentMode?: 'flashcards' | 'quiz';
}

export function UrlInputForm({ onSubmit, isLoading = false, onModeChange, currentMode = 'flashcards' }: UrlInputFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data.youtubeUrl);
  };

  const handleError = () => {
    const errors = form.formState.errors;
    if (errors.youtubeUrl) {
      toast({
        title: "Invalid URL",
        description: errors.youtubeUrl.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-6">
          <div>
            <Label htmlFor="youtube-url" className="block text-sm font-medium text-white mb-2">
              YouTube Video URL
            </Label>
            <div className="relative">
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                {...form.register("youtubeUrl")}
                disabled={isLoading}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </div>
            <p className="text-sm text-blue-200/80 mt-2">
              Enter a valid YouTube URL to extract the video transcript
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button"
              onClick={() => onModeChange?.('flashcards')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                currentMode === 'flashcards' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Memory Cards
            </Button>
            <Button 
              type="button"
              onClick={() => onModeChange?.('quiz')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                currentMode === 'quiz' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Quiz
            </Button>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !form.watch("youtubeUrl")}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
          >
            <span className="flex items-center justify-center space-x-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {isLoading ? "Generating..." : "Generate"}
              </span>
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
