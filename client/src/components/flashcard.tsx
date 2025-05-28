import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Flashcard as FlashcardType } from "../../../shared/schema";

interface FlashcardProps {
  flashcards: FlashcardType[];
}

function GlassButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white font-medium transition hover:bg-white/20 active:scale-95 mx-1"
      style={{
        boxShadow:
          "0 4px 24px 0 rgba(255,255,255,0.08), 0 1.5px 6px 0 rgba(0,0,0,0.18)",
      }}
    >
      {children}
    </button>
  );
}

export function Flashcard({ flashcards }: FlashcardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<boolean[]>(
    flashcards?.map(() => false) || []
  );

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1 < flashcards.length ? i + 1 : 0));
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 >= 0 ? i - 1 : flashcards.length - 1));
  };
  const shuffle = () => {
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setIndex(0);
    setFlipped(false);
    setLearned(shuffled.map(() => false));
  };
  const markAsLearned = () => {
    setLearned((prev) => prev.map((l, i) => (i === index ? true : l)));
  };

  if (!flashcards || !flashcards.length)
    return <div className="text-white text-center">No flashcards found.</div>;

  const card = flashcards[index];
  const nextCard = flashcards[(index + 1) % flashcards.length];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative w-full max-w-md min-h-[300px] flex justify-center items-center mb-8">
        {/* Stack of background cards */}
        {flashcards.length > 1 && (
          <>
            {/* Third card in back */}
            {flashcards.length > 2 && (
              <div
                className="absolute w-full h-[280px] rounded-2xl border-2 border-gray-300 bg-white shadow-lg"
                style={{
                  transform: "translateX(8px) translateY(8px) scale(0.95)",
                  zIndex: 1,
                }}
              />
            )}
            {/* Second card */}
            <div
              className="absolute w-full h-[290px] rounded-2xl border-2 border-gray-300 bg-white shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl"
              style={{
                transform: "translateX(4px) translateY(4px) scale(0.97)",
                zIndex: 2,
              }}
              onClick={next}
              title="Click to show next card"
            />
          </>
        )}

        {/* Active Card */}
        <div
          className={`relative w-full h-[300px] rounded-2xl shadow-2xl border-2 border-gray-300 bg-white transition-transform duration-500 cursor-pointer select-none
            ${flipped ? "rotate-y-180" : ""}
          `}
          style={{
            perspective: "1200px",
            boxShadow: "0 12px 32px 0 rgba(0, 0, 0, 0.15)",
            zIndex: 10,
          }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Card Inner */}
          <div
            className="absolute w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div className="absolute w-full h-full flex flex-col justify-center items-center p-8 backface-hidden rounded-2xl bg-white">
              <div className="text-xl font-semibold mb-4 text-gray-800 text-center leading-relaxed">
                {card.question}
              </div>
              <span className="mt-4 text-sm text-gray-500">
                Click to reveal answer
              </span>
            </div>
            {/* Back */}
            <div
              className="absolute w-full h-full flex flex-col justify-center items-center p-8 backface-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
              style={{
                transform: "rotateY(180deg) scaleX(-1)", // Add scaleX(-1) to counter the mirror effect
                backfaceVisibility: "hidden",
              }}
            >
              <div className="text-lg font-medium text-blue-900 text-center leading-relaxed">
                {card.answer}
              </div>
              <span className="mt-4 text-sm text-blue-600">
                Click to see question
              </span>
            </div>
          </div>
          {/* Learned ribbon badge */}
          {learned[index] && (
            <div
              className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs shadow-lg font-bold"
              style={{
                transform: "rotate(12deg)",
                zIndex: 20,
              }}
            >
              ✓ Learned
            </div>
          )}
        </div>
      </div>
      {/* Navigation Panel */}
      <div className="flex flex-wrap gap-3 justify-center items-center mb-4">
        <GlassButton onClick={prev} aria-label="Previous">
          Previous
        </GlassButton>
        <GlassButton onClick={shuffle} aria-label="Shuffle">
          Shuffle
        </GlassButton>
        <GlassButton onClick={markAsLearned} aria-label="Mark as Learned">
          {learned[index] ? "Learned" : "Mark as Learned"}
        </GlassButton>
        <GlassButton onClick={next} aria-label="Next">
          Next
        </GlassButton>
      </div>
      <div className="text-sm text-blue-200/80 mb-2">
        Card {index + 1} of {flashcards.length}
      </div>
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        @media (max-width: 500px) {
          .max-w-xs { max-width: 98vw !important; }
          .h-[260px] { height: 180px !important; }
        }
      `}</style>
    </div>
  );
}
