
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain, FileText, Youtube } from "lucide-react";
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
  onSubmit: (url: string) => void;
  isLoading: boolean;
  onModeChange: (mode: "flashcards" | "quiz") => void;
  currentMode: "flashcards" | "quiz";
  defaultValue?: string;
}

export function UrlInputForm({
  onSubmit,
  isLoading,
  onModeChange,
  currentMode,
  defaultValue = "",
}: UrlInputFormProps) {
  const [url, setUrl] = useState(defaultValue);

  // Update url when defaultValue changes
  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

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
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="youtube-url" className="flex items-center gap-2 text-gray-800 dark:text-white font-medium">
              <Youtube className="h-4 w-4 text-red-400" />
              YouTube Video URL
            </Label>
            <div className="relative">
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=example"
                className="w-full px-4 py-4 bg-white/10 dark:bg-white/10 border border-gray-300 dark:border-white/30 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm"
                {...form.register("youtubeUrl")}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-white/60 flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 dark:bg-white/40 rounded-full"></span>
              Paste any YouTube video URL to generate study materials
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-800 dark:text-white font-medium text-sm">Study Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button"
                onClick={() => onModeChange?.('flashcards')}
                className={`py-4 px-4 rounded-xl font-medium transition-all duration-200 ${
                  currentMode === 'flashcards' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-white/80 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/20'
                }`}
              >
                <Brain className="w-4 h-4 mr-2" />
                Memory Cards
              </Button>
              <Button 
                type="button"
                onClick={() => onModeChange?.('quiz')}
                className={`py-4 px-4 rounded-xl font-medium transition-all duration-200 ${
                  currentMode === 'quiz' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-white/80 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/20'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Practice Quiz
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !form.watch("youtubeUrl")}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center space-x-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {isLoading ? "Generating Study Materials..." : "Generate Study Materials"}
              </span>
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
