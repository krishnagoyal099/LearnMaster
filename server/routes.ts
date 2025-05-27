import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { YoutubeTranscript } from "youtube-transcript";

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube API integration
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { q: query, type: timePreference } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const API_KEY = process.env.YOUTUBE_API_KEY;
      if (!API_KEY) {
        return res
          .status(500)
          .json({ error: "YouTube API key not configured" });
      }

      // Determine search parameters based on time preference
      const maxResults = timePreference === "quick" ? 8 : 12;
      const duration = timePreference === "quick" ? "short" : "medium";

      // Enhanced search query with better filtering
      const enhancedQuery =
        timePreference === "quick"
          ? `${query} tutorial beginner crash course learn`
          : `${query} complete course tutorial programming full`;

      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", enhancedQuery);
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("maxResults", maxResults.toString());
      searchUrl.searchParams.set("order", "relevance");
      searchUrl.searchParams.set("videoDuration", duration);
      searchUrl.searchParams.set("videoDefinition", "high");
      searchUrl.searchParams.set("relevanceLanguage", "en");
      searchUrl.searchParams.set("key", API_KEY);

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      // Get video details for duration
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
      const detailsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
      );
      detailsUrl.searchParams.set("part", "contentDetails,statistics");
      detailsUrl.searchParams.set("id", videoIds);
      detailsUrl.searchParams.set("key", API_KEY);

      const detailsResponse = await fetch(detailsUrl.toString());
      const detailsData = await detailsResponse.json();

      const videos = data.items
        .map((item: any, index: number) => {
          const details = detailsData.items?.[index];
          const duration = details?.contentDetails?.duration || "PT0M0S";
          const views = details?.statistics?.viewCount || "0";

          // Parse ISO 8601 duration to readable format
          const durationMatch = duration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
          );
          const hours = durationMatch?.[1] || "0";
          const minutes = durationMatch?.[2] || "0";
          const seconds = durationMatch?.[3] || "0";
          const formattedDuration =
            hours !== "0"
              ? `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(
                  2,
                  "0"
                )}`
              : `${minutes}:${seconds.padStart(2, "0")}`;

          // Enhanced filtering and difficulty detection
          const title = item.snippet.title.toLowerCase();
          const description = item.snippet.description?.toLowerCase() || "";
          const channelTitle = item.snippet.channelTitle.toLowerCase();
          const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

          // Skip videos that seem irrelevant
          const irrelevantKeywords = [
            "music",
            "song",
            "funny",
            "meme",
            "reaction",
            "unboxing",
            "vlog",
          ];
          const isIrrelevant = irrelevantKeywords.some(
            (keyword) =>
              title.includes(keyword) || description.includes(keyword)
          );

          if (isIrrelevant) {
            return null; // Skip this video
          }

          // Determine difficulty based on enhanced criteria
          let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";

          if (
            title.includes("advanced") ||
            title.includes("expert") ||
            title.includes("master") ||
            totalMinutes > 180
          ) {
            difficulty = "Advanced";
          } else if (
            title.includes("intermediate") ||
            title.includes("complete") ||
            title.includes("full course") ||
            totalMinutes > 45
          ) {
            difficulty = "Intermediate";
          } else if (
            title.includes("beginner") ||
            title.includes("crash course") ||
            title.includes("basics") ||
            title.includes("intro")
          ) {
            difficulty = "Beginner";
          }

          return {
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            duration: formattedDuration,
            thumbnail: item.snippet.thumbnails.medium.url,
            difficulty,
            views: parseInt(views).toLocaleString() + " views",
          };
        })
        .filter((video: unknown) => video !== null); // Remove filtered out videos

      res.json(videos);
    } catch (error) {
      console.error("YouTube API error:", error);
      res.status(500).json({ error: "Failed to fetch YouTube videos" });
    }
  });

  // AI-powered book recommendations using Gemini
  app.get("/api/books/recommendations", async (req, res) => {
    try {
      const { subject } = req.query;

      if (!subject || typeof subject !== "string") {
        return res.status(400).json({ error: "Subject parameter is required" });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      // Use Gemini AI to get intelligent book recommendations
      const prompt = `Recommend the top 8 best books for learning ${subject}. For each book, provide:
1. Title (exact title)
2. Author name
3. Brief description (2-3 sentences)
4. Difficulty level (Beginner/Intermediate/Advanced)
5. Estimated page count

Format your response as a JSON array with this structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "Brief description here",
    "difficulty": "Beginner|Intermediate|Advanced",
    "pages": 300
  }
]

Focus on practical, well-known books that are actually available and useful for learning ${subject}.`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error("No response from Gemini AI");
      }

      // Parse the AI response to extract book recommendations
      let bookRecommendations;
      try {
        // Extract JSON from the response (in case AI adds extra text)
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          bookRecommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in AI response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        throw new Error("Failed to parse book recommendations");
      }

      // Transform to our format and scrape for actual PDF links
      const books = await Promise.all(
        bookRecommendations.map(async (book: any, index: number) => {
          let pdfUrl = `https://www.google.com/search?q=${encodeURIComponent(
            book.title + " " + book.author + " filetype:pdf"
          )}`;

          // Try to find actual PDF URLs by scraping search results
          try {
            const searchQuery = encodeURIComponent(
              `${book.title} ${book.author} filetype:pdf`
            );
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${
              process.env.GOOGLE_SEARCH_API_KEY || ""
            }&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID || ""}&q=${searchQuery}`;

            // If we have Google Custom Search API, use it to find direct PDF links
            if (
              process.env.GOOGLE_SEARCH_API_KEY &&
              process.env.GOOGLE_SEARCH_ENGINE_ID
            ) {
              const searchResponse = await fetch(searchUrl);
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                const pdfResult = searchData.items?.find(
                  (item: any) =>
                    item.link?.toLowerCase().endsWith(".pdf") ||
                    item.fileFormat === "PDF"
                );
                if (pdfResult) {
                  pdfUrl = pdfResult.link;
                }
              }
            }
          } catch (error) {
            console.log("PDF search failed for:", book.title);
          }

          return {
            id: `ai-book-${index}`,
            title: book.title || "Unknown Title",
            author: book.author || "Unknown Author",
            description: book.description || "No description available",
            previewUrl: `https://www.google.com/search?q=${encodeURIComponent(
              book.title + " " + book.author + " preview"
            )}`,
            downloadUrl: pdfUrl,
            totalPages: book.pages || 350,
            rating: 4.5,
            difficulty: book.difficulty || "Intermediate",
          };
        })
      );

      res.json(books);
    } catch (error) {
      console.error("Book recommendations error:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch AI book recommendations" });
    }
  });
  // Fetch YouTube transcript for a video
  app.get("/api/youtube/transcript", async (req, res) => {
    const { videoId } = req.query;
    if (!videoId || typeof videoId !== "string") {
      return res.status(400).json({ error: "Missing or invalid videoId" });
    }
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const transcriptText = transcript.map((t: any) => t.text).join(" ");
      if (!transcriptText) {
        return res
          .status(404)
          .json({ error: "No transcript found for this video." });
      }
      res.json({ transcript: transcriptText });
    } catch (error) {
      console.error("Transcript fetch error:", error);
      res.status(500).json({ error: "Failed to fetch transcript" });
    }
  });
  app.post("/api/revision/generate", async (req, res) => {
    const { transcript, type } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }
    if (!type || !["quiz", "flashcards"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type must be 'quiz' or 'flashcards'" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    let prompt = "";
    if (type === "quiz") {
      prompt = `Generate 5 multiple-choice quiz questions (with 4 options each and the correct answer) based on this transcript:\n${transcript}`;
    } else {
      prompt = `Generate 10 memory flashcards as Q&A pairs based on this transcript:\n${transcript}`;
    }

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        return res.status(500).json({ error: "No response from Gemini AI" });
      }

      res.json({ result: aiResponse });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to generate revision content" });
    }
  });

  // Learning history tracking
  app.post("/api/learning/history", async (req, res) => {
    try {
      const historyData = req.body;
      const result = await storage.createLearningHistory(historyData);
      res.json(result);
    } catch (error) {
      console.error("Learning history error:", error);
      res.status(500).json({ error: "Failed to save learning history" });
    }
  });

  // Break session tracking
  app.post("/api/break/session", async (req, res) => {
    try {
      const sessionData = req.body;
      const result = await storage.createBreakSession(sessionData);
      res.json(result);
    } catch (error) {
      console.error("Break session error:", error);
      res.status(500).json({ error: "Failed to save break session" });
    }
  });

  // Leaderboard API routes
  app.get("/api/leaderboard/learning", async (req, res) => {
    try {
      const allHistory = await storage.getLearningHistory();

      // Calculate learning stats by user
      const userStats = allHistory.reduce((stats: any, session) => {
        const userId = session.userId || "anonymous";
        if (!stats[userId]) {
          stats[userId] = {
            userId,
            totalSessions: 0,
            totalMinutes: 0,
            subjects: new Set(),
            lastActive: session.createdAt,
          };
        }

        stats[userId].totalSessions++;
        stats[userId].totalMinutes += session.duration || 0;
        stats[userId].subjects.add(session.subject);

        if (session.createdAt && session.createdAt > stats[userId].lastActive) {
          stats[userId].lastActive = session.createdAt;
        }

        return stats;
      }, {});

      // Convert to leaderboard format and sort by total minutes
      const leaderboard = Object.values(userStats)
        .map((user: any) => ({
          ...user,
          subjects: Array.from(user.subjects),
          rank: 0,
        }))
        .sort((a: any, b: any) => b.totalMinutes - a.totalMinutes);

      // Assign ranks
      leaderboard.forEach((user: any, index) => {
        user.rank = index + 1;
      });

      res.json(leaderboard);
    } catch (error) {
      console.error("Learning leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch learning leaderboard" });
    }
  });

  app.get("/api/leaderboard/breaks", async (req, res) => {
    try {
      const allSessions = await storage.getBreakSessions();

      // Calculate break stats by user
      const userStats = allSessions.reduce((stats: any, session) => {
        const userId = session.userId || "anonymous";
        if (!stats[userId]) {
          stats[userId] = {
            userId,
            totalBreaks: 0,
            totalBreakTime: 0,
            gamesPlayed: new Set(),
            completedBreaks: 0,
            lastBreak: session.createdAt,
          };
        }

        stats[userId].totalBreaks++;
        stats[userId].totalBreakTime += session.duration || 0;
        stats[userId].gamesPlayed.add(session.gameType);

        if (session.completed) {
          stats[userId].completedBreaks++;
        }

        if (session.createdAt && session.createdAt > stats[userId].lastBreak) {
          stats[userId].lastBreak = session.createdAt;
        }

        return stats;
      }, {});

      // Convert to leaderboard format and sort by completed breaks
      const leaderboard = Object.values(userStats)
        .map((user: any) => ({
          ...user,
          gamesPlayed: Array.from(user.gamesPlayed),
          completionRate:
            user.totalBreaks > 0
              ? ((user.completedBreaks / user.totalBreaks) * 100).toFixed(1)
              : 0,
          rank: 0,
        }))
        .sort((a: any, b: any) => b.completedBreaks - a.completedBreaks);

      // Assign ranks
      leaderboard.forEach((user: any, index) => {
        user.rank = index + 1;
      });

      res.json(leaderboard);
    } catch (error) {
      console.error("Break leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch break leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
