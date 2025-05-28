import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp } from 'lucide-react';
import { getYouTubeVideos, type YouTubeVideo } from '@/lib/youtube';
import { useQuery } from '@tanstack/react-query';

interface VideoResourcesProps {
  subject: string;
  timePreference: 'quick' | 'one-shot' | 'playlist' | null;
}

export function VideoResources({ subject, timePreference }: VideoResourcesProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/youtube/search', subject, timePreference],
    queryFn: () => getYouTubeVideos(subject, timePreference),
    enabled: !!subject,
  });

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const getVideoEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Play className="mr-2 h-5 w-5 text-red-500" />
            Video Resources
          </CardTitle>
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Track Progress
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {selectedVideo ? (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={getVideoEmbedUrl(selectedVideo.id)}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedVideo.channel}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{selectedVideo.duration}</Badge>
                <Badge variant="secondary">{selectedVideo.difficulty}</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedVideo(null)}
              className="w-full"
            >
              Back to Video List
            </Button>
          </div>
        ) : (
          <div className="space-y-4 h-96 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading videos...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">Failed to load videos. Please try again.</p>
              </div>
            )}
            
            {videos && videos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No videos found for "{subject}"</p>
              </div>
            )}
            
            {videos?.map((video) => (
              <div
                key={video.id}
                className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                onClick={() => handleVideoSelect(video)}
              >
                <div className="flex space-x-4">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 truncate">
                      {video.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {video.channel}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {video.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {video.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
