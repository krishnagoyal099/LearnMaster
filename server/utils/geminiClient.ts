import { GoogleGenerativeAI } from "@google/generative-ai";

// Directly use your API key here
const genAI = new GoogleGenerativeAI("AIzaSyAf2_VjFj1jj_6gEpVhoV_bLYqA-cxTFJA");

export async function generateContentWithGemini(
  transcript: string
): Promise<string> {
  try {
    // Remove the env check since the key is hardcoded
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analyze the following video transcript and create educational content in the exact format specified below.

Generate 6-8 flashcards and 3-4 multiple choice quiz questions based on the key concepts from this transcript.

FLASHCARD FORMAT:
Each flashcard must start with "Flashcard:" on its own line, followed by "Q:" for the question and "A:" for the answer, then separated by "###" delimiter.

QUIZ FORMAT:
Each quiz question must start with "Quiz:" on its own line, followed by the question text, then "Options:" with 4 choices (a, b, c, d), then "Correct:" with the letter of the correct answer, then separated by "###" delimiter.

EXACT FORMAT EXAMPLE:
Flashcard:
Q: What is machine learning?
A: A subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

###

Flashcard:
Q: What is the difference between supervised and unsupervised learning?
A: Supervised learning uses labeled training data to learn patterns, while unsupervised learning finds patterns in data without labels.

###

Quiz:
What is the primary goal of machine learning?
Options:
a) To replace human intelligence completely
b) To enable computers to learn patterns from data
c) To create robots
d) To store large amounts of data
Correct: b

###

Quiz:
Which of the following is an example of supervised learning?
Options:
a) Clustering customer data
b) Email spam detection
c) Data compression
d) Anomaly detection without labels
Correct: b

###

Now analyze this transcript and generate the educational content:

${transcript}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Gemini API error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
