import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoResources } from "./VideoResources";
import { BookResources } from "./BookResources";
import { Clock, Bookmark } from "lucide-react";

interface LearningInterfaceProps {
  subject: string;
}

type TimePreference = "quick" | "comprehensive" | null;

export function LearningInterface({ subject }: LearningInterfaceProps) {
  const [timePreference, setTimePreference] = useState<TimePreference>(null);

  return (
    <main className="px-4 pb-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Time Preference Selection */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How much time do you have?
          </h2>
          <div className="flex justify-center space-x-4">
            <Button
              variant={timePreference === "quick" ? "default" : "outline"}
              onClick={() => setTimePreference("quick")}
              className="px-6 py-3"
            >
              <Clock className="mr-2 h-4 w-4" />
              Quick Learning (15-30 min)
            </Button>
            <Button
              variant={
                timePreference === "comprehensive" ? "default" : "outline"
              }
              onClick={() => setTimePreference("comprehensive")}
              className="px-6 py-3"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Comprehensive Learning (1+ hours)
            </Button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          <VideoResources subject={subject} timePreference={timePreference} />
          <BookResources subject={subject} />
        </div>

        {/* Progress Tracker */}
        <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                Today's Progress
              </div>
              <div className="text-xs text-muted-foreground">
                Learning {subject}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
