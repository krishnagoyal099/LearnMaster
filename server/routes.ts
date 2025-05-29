import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  videoSearchSchema,
  generateContentRequestSchema,
  insertMessageSchema,
} from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";
import * as z from 'zod';
import { extractYouTubeTranscript } from "./utils/youtubeTranscript";
import { generateContentWithGemini } from "./utils/geminiClient";
import { parseFlashcardsAndQuiz } from "./utils/flashcardParser";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { insertUser, getUser, updateUser, insertMessage, getMessages } from "./storage";
import { generateWithGemini } from "./utils/geminiClient";
import { getYouTubeTranscript } from "./utils/youtubeTranscript";
import { parseFlashcardsAndQuiz } from "./utils/flashcardParser";
import { searchLearnAnything } from "./utils/learnAnythingScraper";

interface Video {
  id: number;
  youtubeUrl: string;
  title: string;
  transcript: string;
  flashcards: any[];
  quizQuestions: any[];
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Authentication routes
  app.post("/auth/signup", async (req, res) => {
    try {
      console.log("Signup request received:", req.body);
      const { email, password, name } = req.body;

      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        console.log("Password too short");
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log("User already exists:", email);
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        name,
        password: hashedPassword
      });

      console.log("User created successfully:", user.email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/auth/login", async (req, res) => {
    try {
      console.log("Login request received:", req.body);
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("Login successful for user:", email);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/auth/validate-token", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Find user
      const user = await storage.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // YouTube API search endpoint with enhanced functionality
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
      let maxResults = 12;
      let duration = "medium";
      let enhancedQuery = query;
      let searchType = "video";

      switch (timePreference) {
        case "quick":
          maxResults = 10;
          duration = "medium"; // Changed from "short" to avoid YouTube Shorts
          enhancedQuery = `${query} tutorial crash course beginner guide how to learn -shorts -short`;
          break;
        case "one-shot":
          maxResults = 8;
          duration = "long";
          enhancedQuery = `${query} complete tutorial full course comprehensive guide one video -shorts -short`;
          break;
        case "playlist":
          maxResults = 15;
          duration = "any";
          searchType = "playlist"; // Search for playlists instead of individual videos
          enhancedQuery = `${query} playlist course series tutorial learning -shorts`;
          break;
        default:
          enhancedQuery = `${query} tutorial programming learn -shorts -short`;
      }

      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("q", enhancedQuery);
      searchUrl.searchParams.set("type", searchType);
      searchUrl.searchParams.set("maxResults", maxResults.toString());
      searchUrl.searchParams.set("order", "relevance");
      if (searchType === "video") {
        searchUrl.searchParams.set("videoDuration", duration);
        searchUrl.searchParams.set("videoDefinition", "high");
      }
      searchUrl.searchParams.set("relevanceLanguage", "en");
      searchUrl.searchParams.set("key", API_KEY);

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      let videos;

      if (timePreference === "playlist") {
        // Handle playlist results
        videos = await Promise.all(
          data.items
            .map(async (item: any) => {
              const title = item.snippet.title.toLowerCase();
              const description = item.snippet.description?.toLowerCase() || "";
              const channelTitle = item.snippet.channelTitle.toLowerCase();

              // Filter out irrelevant playlists
              const irrelevantKeywords = [
                "music", "song", "funny", "meme", "reaction", "unboxing", 
                "vlog", "shorts", "compilation", "best of", "top 10"
              ];
              const isIrrelevant = irrelevantKeywords.some(
                (keyword) =>
                  title.includes(keyword) || description.includes(keyword)
              );

              if (isIrrelevant) {
                return null;
              }

              // Fetch videos from this playlist
              try {
                const playlistVideosUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
                playlistVideosUrl.searchParams.set("part", "snippet");
                playlistVideosUrl.searchParams.set("playlistId", item.id.playlistId);
                playlistVideosUrl.searchParams.set("maxResults", "20");
                playlistVideosUrl.searchParams.set("key", API_KEY);

                const playlistResponse = await fetch(playlistVideosUrl.toString());
                if (!playlistResponse.ok) {
                  throw new Error("Failed to fetch playlist videos");
                }

                const playlistData = await playlistResponse.json();
                const playlistVideos = playlistData.items?.map((playlistItem: any) => ({
                  id: playlistItem.snippet.resourceId.videoId,
                  title: playlistItem.snippet.title,
                  channel: playlistItem.snippet.channelTitle,
                  duration: "Video",
                  thumbnail: playlistItem.snippet.thumbnails.medium.url,
                  difficulty: "Intermediate",
                  views: "Playlist Video",
                  isPlaylistVideo: true,
                  playlistId: item.id.playlistId,
                  playlistTitle: item.snippet.title,
                })) || [];

                // Determine difficulty for playlist
                let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
                if (title.includes("advanced") || title.includes("expert") || 
                    title.includes("master") || title.includes("professional")) {
                  difficulty = "Advanced";
                } else if (title.includes("intermediate") || title.includes("beyond basic") ||
                           title.includes("next level") || channelTitle.includes("pro")) {
                  difficulty = "Intermediate";
                }

                return {
                  id: item.id.playlistId,
                  title: item.snippet.title,
                  channel: item.snippet.channelTitle,
                  duration: "Playlist",
                  thumbnail: item.snippet.thumbnails.medium.url,
                  difficulty,
                  views: `${playlistVideos.length} videos`,
                  isPlaylist: true,
                  playlistVideos: playlistVideos,
                };
              } catch (error) {
                console.error("Error fetching playlist videos:", error);
                return {
                  id: item.id.playlistId,
                  title: item.snippet.title,
                  channel: item.snippet.channelTitle,
                  duration: "Playlist",
                  thumbnail: item.snippet.thumbnails.medium.url,
                  difficulty: "Intermediate",
                  views: "Playlist",
                  isPlaylist: true,
                  playlistVideos: [],
                };
              }
            })
        );
        videos = videos.filter((video) => video !== null);
      } else {
        // Handle individual video results
        const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
        const detailsUrl = new URL(
          "https://www.googleapis.com/youtube/v3/videos"
        );
        detailsUrl.searchParams.set("part", "contentDetails,statistics");
        detailsUrl.searchParams.set("id", videoIds);
        detailsUrl.searchParams.set("key", API_KEY);

        const detailsResponse = await fetch(detailsUrl.toString());
        const detailsData = await detailsResponse.json();

        videos = data.items
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
            const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

            // Filter out shorts (videos under 1 minute) and very long videos for quick learning
            if (timePreference === "quick" && (totalMinutes < 1 || totalMinutes > 30)) {
              return null;
            }

            // For one-shot, prefer longer comprehensive videos
            if (timePreference === "one-shot" && totalMinutes < 10) {
              return null;
            }

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

            // Skip videos that seem irrelevant or are shorts
            const irrelevantKeywords = [
              "music", "song", "funny", "meme", "reaction", "unboxing", 
              "vlog", "shorts", "short", "#shorts", "60 seconds", "1 minute",
              "quick tip", "life hack", "compilation", "best moments"
            ];
            const isIrrelevant = irrelevantKeywords.some(
              (keyword) =>
                title.includes(keyword) || description.includes(keyword)
            );

            if (isIrrelevant) {
              return null; // Skip this video
            }

            // Prefer educational channels and tutorial content
            const educationalKeywords = [
              "tutorial", "course", "learn", "guide", "how to", "explained",
              "introduction", "basics", "fundamentals", "programming", "coding"
            ];
            const isEducational = educationalKeywords.some(
              (keyword) =>
                title.includes(keyword) || description.includes(keyword) ||
                channelTitle.includes(keyword)
            );

            // Skip non-educational content for learning purposes
            if (!isEducational && timePreference !== null) {
              return null;
            }

            // Determine difficulty based on enhanced criteria and time preference
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
            totalMinutes > 45 ||
            timePreference === "one-shot"
          ) {
            difficulty = "Intermediate";
          } else if (
            title.includes("beginner") ||
            title.includes("crash course") ||
            title.includes("basics") ||
            title.includes("intro") ||
            timePreference === "quick"
          ) {
            difficulty = "Beginner";
          }

          // Special handling for playlist preference
          if (
            timePreference === "playlist" &&
            (title.includes("playlist") ||
              title.includes("series") ||
              channelTitle.includes("academy") ||
              channelTitle.includes("course"))
          ) {
            difficulty = "Intermediate";
          }

          // Enhanced difficulty detection
            if (title.includes("advanced") || title.includes("expert") || 
                title.includes("master") || title.includes("professional") ||
                totalMinutes > 120) {
              difficulty = "Advanced";
            } else if (title.includes("intermediate") || title.includes("beyond basic") ||
                       title.includes("next level") || channelTitle.includes("pro") ||
                       (totalMinutes > 30 && totalMinutes <= 120)) {
              difficulty = "Intermediate";
            } else if (title.includes("beginner") || title.includes("intro") ||
                       title.includes("basics") || title.includes("fundamentals") ||
                       title.includes("getting started") || totalMinutes <= 30) {
              difficulty = "Beginner";
            }

            // Adjust difficulty based on time preference
            if (timePreference === "quick") {
              difficulty = "Beginner"; // Quick videos are usually beginner-friendly
            } else if (timePreference === "one-shot" && totalMinutes > 60) {
              difficulty = difficulty === "Beginner" ? "Intermediate" : difficulty;
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
          .filter((video) => video !== null); // Remove filtered out videos
      }

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

  // Generate content from YouTube URL
  app.post("/api/generate-content", async (req, res) => {
    try {
      const validatedData = generateContentRequestSchema.parse(req.body);

      // Create initial video record
      const video = await storage.createVideo({
        youtubeUrl: validatedData.youtubeUrl,
      });

      // Extract transcript
      let transcript: string;
      try {
        transcript = await extractYouTubeTranscript(validatedData.youtubeUrl);
      } catch (error) {
        return res.status(400).json({
          message:
            "Failed to extract transcript from YouTube video. Please check the URL and ensure the video has captions available.",
        });
      }

      // Generate content using Gemini AI
      let geminiResponse: string;
      try {
        geminiResponse = await generateContentWithGemini(transcript);
      } catch (error) {
        return res.status(500).json({
          message:
            "Failed to generate content using AI. Please try again later.",
        });
      }

      // Parse the response into flashcards and quiz questions
      const { flashcards, quizQuestions } =
        parseFlashcardsAndQuiz(geminiResponse);

      // Update video with generated content
      const updatedVideo = await storage.updateVideo(video.id, {
        transcript,
        flashcards,
        quizQuestions,
      });

      if (!updatedVideo) {
        return res.status(500).json({
          message: "Failed to save generated content.",
        });
      }

      res.json({
        id: updatedVideo.id,
        title: updatedVideo.title,
        flashcards,
        quizQuestions,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({
        message: "An unexpected error occurred while processing your request.",
      });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }

      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json({
        id: video.id,
        title: video.title,
        flashcards: video.flashcards || [],
        quizQuestions: video.quizQuestions || [],
      });
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({
        message: "Failed to fetch video data.",
      });
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

  // Gemini AI chat endpoint
  app.post("/api/gemini-chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      // Enhanced prompt for better, more focused responses
      const enhancedPrompt = `You are LearnMaster AI, an intelligent learning assistant focused on education and skill development. 

User message: "${message}"

Please provide a helpful, concise, and well-structured response. Follow these guidelines:
- Keep responses focused and practical
- Use clear, easy-to-understand language
- Include examples when explaining concepts
- Format code snippets with proper syntax highlighting
- For learning topics, provide step-by-step guidance
- Be encouraging and supportive
- Keep responses under 500 words unless detailed explanation is specifically requested

Response:`;

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
                    text: enhancedPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
              candidateCount: 1,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error("No response from Gemini AI");
      }

      res.json({ reply });
    } catch (error) {
      console.error("Gemini chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Add new endpoints for suggestions, search history, and favorites
  app.get("/api/suggestions", async (req, res) => {
    // ... your new suggestions endpoint code ...
  });

  app.get("/api/search-history", async (req, res) => {
    // ... your new search history endpoint code ...
  });

  app.post("/api/favorites", async (req, res) => {
    // ... your new favorites post endpoint code ...
  });

  app.delete("/api/favorites/:videoId", async (req, res) => {
    // ... your new favorites delete endpoint code ...
  });

  app.get("/api/favorites", async (req, res) => {
    // ... your new favorites get endpoint code ...
  });

  app.get("/api/favorites/:videoId", async (req, res) => {
    // ... your new favorites check endpoint code ...
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      // Add type annotation for the map callback parameter
      const formattedVideos = videos.map((video: Video) => ({
        id: video.id,
        title: video.title,
        duration: video.contentDetails?.duration || "",
        viewCount: video.statistics?.viewCount || "0",
        flashcards: video.flashcards || [],
        quizQuestions: video.quizQuestions || [],
      }));
      res.json(formattedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  // Get messages by session ID
  app.get("/api/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // New messages endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      // Log the request body for debugging
      console.log("Message request body:", req.body);

      // Validate input
      const validatedData = insertMessageSchema.parse(req.body);

      // Save message
      const userMessage = await storage.createMessage(validatedData);

      res.json(userMessage);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating message:", error.message);
      } else {
        console.error("Error creating message:", error);
      }

      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  });

  // Delete messages by session ID
  app.delete("/api/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteMessagesBySession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting messages:", error);
      res.status(500).json({ error: "Failed to delete messages" });
    }
  });

  app.post("/api/flashcards/parse", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const flashcards = parseFlashcards(content);
      res.json(flashcards);
    } catch (error) {
      console.error("Error parsing flashcards:", error);
      res.status(500).json({ error: "Failed to parse flashcards" });
    }
  });

  app.get("/api/learn-anything/search", async (req, res) => {
    try {
      const { topic } = req.query;

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic parameter is required" });
      }

      const resources = await searchLearnAnything(topic);
      res.json(resources);
    } catch (error) {
      console.error("Error searching learn-anything:", error);
      res.status(500).json({ error: "Failed to search resources" });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}