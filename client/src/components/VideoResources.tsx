import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp } from 'lucide-react';
import { getYouTubeVideos, type YouTubeVideo } from '@/lib/youtube';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface VideoResourcesProps {
  subject: string;
  timePreference: 'quick' | 'one-shot' | 'playlist' | null;
}

export function VideoResources({ subject, timePreference }: VideoResourcesProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubeVideo | null>(null);
  const [showPlaylistVideos, setShowPlaylistVideos] = useState(false);

  // Reset selections when time preference changes
  useEffect(() => {
    setSelectedVideo(null);
    setSelectedPlaylist(null);
    setShowPlaylistVideos(false);
  }, [timePreference]);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/youtube/search', subject, timePreference],
    queryFn: () => getYouTubeVideos(subject, timePreference),
    enabled: !!subject,
  });

  const handleVideoSelect = (video: YouTubeVideo) => {
    if (video.isPlaylist) {
      setSelectedPlaylist(video);
      setShowPlaylistVideos(true);
      setSelectedVideo(null);
    } else {
      setSelectedVideo(video);
      setShowPlaylistVideos(false);
      setSelectedPlaylist(null);
    }
  };

  const handlePlaylistVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setShowPlaylistVideos(false);
  };

  const handleBackToPlaylist = () => {
    setSelectedVideo(null);
    setShowPlaylistVideos(true);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
    setSelectedPlaylist(null);
    setShowPlaylistVideos(false);
  };

  const getVideoEmbedUrl = (videoId: string, isPlaylist: boolean = false, playlistId?: string) => {
    if (isPlaylist) {
      return `https://www.youtube.com/embed/videoseries?list=${videoId}`;
    }
    if (playlistId) {
      return `https://www.youtube.com/embed/${videoId}?list=${playlistId}`;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleCopyAndRevise = async () => {
    if (!selectedVideo) return;
    
    // Construct the YouTube watch URL
    let videoUrl: string;
    if (selectedVideo.isPlaylist) {
      videoUrl = `https://www.youtube.com/playlist?list=${selectedVideo.id}`;
    } else if (selectedVideo.playlistId) {
      videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.id}&list=${selectedVideo.playlistId}`;
    } else {
      videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.id}`;
    }

    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(videoUrl);
      
      toast({
        title: "URL Copied!",
        description: "Video URL copied to clipboard. Redirecting to revision page...",
      });

      // Navigate to revision page after a short delay
      setTimeout(() => {
        setLocation('/revision');
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <Play className="mr-2 h-5 w-5 text-red-500" />
          Video Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {selectedVideo ? (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={getVideoEmbedUrl(
                  selectedVideo.id, 
                  selectedVideo.isPlaylist, 
                  selectedVideo.playlistId
                )}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedVideo.channel}</p>
              {selectedVideo.playlistTitle && (
                <p className="text-xs text-blue-600">From: {selectedVideo.playlistTitle}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{selectedVideo.duration}</Badge>
                <Badge variant="secondary">{selectedVideo.difficulty}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedVideo.isPlaylistVideo && selectedPlaylist ? (
                <Button 
                  variant="outline" 
                  onClick={handleBackToPlaylist}
                  className="flex-1"
                >
                  Back to Playlist
                </Button>
              ) : null}
              <Button 
                variant="outline" 
                onClick={handleBackToVideos}
                className="flex-1"
              >
                Back to Video List
              </Button>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleCopyAndRevise}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              >
                Create Quiz & Memory Cards
              </Button>
            </div>
          </div>
        ) : showPlaylistVideos && selectedPlaylist ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{selectedPlaylist.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlaylist.channel}</p>
                <p className="text-xs text-blue-600">{selectedPlaylist.views}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleBackToVideos}
                size="sm"
              >
                Back to Playlists
              </Button>
            </div>
            <div className="space-y-4 h-96 overflow-y-auto">
              {selectedPlaylist.playlistVideos?.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => handlePlaylistVideoSelect(video)}
                >
                  <div className="flex space-x-4">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 truncate">
                        {video.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2 truncate">
                        {video.channel}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Video {index + 1}
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
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    {video.isPlaylist && (
                      <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        📋
                      </div>
                    )}
                  </div>
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
                      {video.isPlaylist && (
                        <Badge variant="destructive" className="text-xs">
                          {video.views}
                        </Badge>
                      )}
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
