import { Flashcard, QuizQuestion } from "@shared/schema";
import { nanoid } from "nanoid";

export function parseFlashcardsAndQuiz(geminiResponse: string): {
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
} {
  const flashcards: Flashcard[] = [];
  const quizQuestions: QuizQuestion[] = [];

  // Split by ### delimiter
  const sections = geminiResponse.split('###').map(section => section.trim()).filter(section => section.length > 0);

  for (const section of sections) {
    if (section.startsWith('Flashcard:')) {
      const flashcard = parseFlashcard(section);
      if (flashcard) {
        flashcards.push(flashcard);
      }
    } else if (section.startsWith('Quiz:')) {
      const quizQuestion = parseQuizQuestion(section);
      if (quizQuestion) {
        quizQuestions.push(quizQuestion);
      }
    }
  }

  return { flashcards, quizQuestions };
}

function parseFlashcard(section: string): Flashcard | null {
  try {
    // Remove "Flashcard:" prefix
    const content = section.replace(/^Flashcard:\s*/, '').trim();
    
    // Split by Q: and A:
    const qMatch = content.match(/Q:\s*(.+?)(?=\s*A:)/s);
    const aMatch = content.match(/A:\s*(.+?)$/s);

    if (!qMatch || !aMatch) {
      console.warn("Failed to parse flashcard:", section);
      return null;
    }

    const question = qMatch[1].trim();
    const answer = aMatch[1].trim();

    if (!question || !answer) {
      console.warn("Empty question or answer in flashcard:", section);
      return null;
    }

    return {
      id: nanoid(),
      question,
      answer,
    };
  } catch (error) {
    console.error("Error parsing flashcard:", error);
    return null;
  }
}

function parseQuizQuestion(section: string): QuizQuestion | null {
  try {
    // Remove "Quiz:" prefix
    const content = section.replace(/^Quiz:\s*/, '').trim();
    
    // Extract question (everything before "Options:")
    const questionMatch = content.match(/^(.+?)(?=\s*Options:)/s);
    if (!questionMatch) {
      console.warn("No question found in quiz section:", section);
      return null;
    }
    
    const question = questionMatch[1].trim();

    // Extract options
    const optionsMatch = content.match(/Options:\s*(.+?)(?=\s*Correct:)/s);
    if (!optionsMatch) {
      console.warn("No options found in quiz section:", section);
      return null;
    }

    const optionsText = optionsMatch[1].trim();
    const options = optionsText
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.match(/^[a-d]\)/))
      .map(line => line.replace(/^[a-d]\)\s*/, '').trim());

    if (options.length !== 4) {
      console.warn("Expected 4 options, found:", options.length, section);
      return null;
    }

    // Extract correct answer
    const correctMatch = content.match(/Correct:\s*([a-d])/);
    if (!correctMatch) {
      console.warn("No correct answer found in quiz section:", section);
      return null;
    }

    const correctLetter = correctMatch[1];
    const correctAnswer = correctLetter.charCodeAt(0) - 'a'.charCodeAt(0);

    if (correctAnswer < 0 || correctAnswer > 3) {
      console.warn("Invalid correct answer:", correctLetter, section);
      return null;
    }

    return {
      id: nanoid(),
      question,
      options,
      correctAnswer,
    };
  } catch (error) {
    console.error("Error parsing quiz question:", error);
    return null;
  }
}
