export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: string;
}

export async function getYouTubeVideos(
  subject: string, 
  timePreference: 'quick' | 'comprehensive' | null
): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(subject)}&type=${timePreference || 'all'}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube videos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}
