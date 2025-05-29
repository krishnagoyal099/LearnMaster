import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoResources } from "./VideoResources";
import { BookResources } from "./BookResources";
import { Clock, Bookmark } from "lucide-react";

interface LearningInterfaceProps {
  subject: string;
}

type TimePreference = "quick" | "one-shot" | "playlist" | null;

export function LearningInterface({ subject }: LearningInterfaceProps) {
  const [timePreference, setTimePreference] = useState<TimePreference>(null);

  return (
    <main className="px-4 pb-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Time Preference Selection */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            What type of learning do you prefer?
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
              variant={timePreference === "one-shot" ? "default" : "outline"}
              onClick={() => setTimePreference("one-shot")}
              className="px-6 py-3"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              One Shot Tutorial
            </Button>
            <Button
              variant={timePreference === "playlist" ? "default" : "outline"}
              onClick={() => setTimePreference("playlist")}
              className="px-6 py-3"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Full Playlist
            </Button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          <VideoResources subject={subject} timePreference={timePreference} />
          <BookResources subject={subject} />
        </div>

        
      </div>
    </main>
  );
}
