import { YoutubeTranscript } from 'youtube-transcript';

export async function extractYouTubeTranscript(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Fetch transcript
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptArray || transcriptArray.length === 0) {
      throw new Error("No transcript available for this video");
    }

    // Combine transcript segments into a single string
    const transcript = transcriptArray
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcript) {
      throw new Error("Transcript is empty");
    }

    return transcript;
  } catch (error) {
    console.error("Error extracting YouTube transcript:", error);
    throw new Error(`Failed to extract transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
