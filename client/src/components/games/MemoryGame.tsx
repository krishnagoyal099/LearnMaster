import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  const cardValues = ['🚀', '💻', '📚', '🎯', '🧠', '⚡'];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...cardValues, ...cardValues]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMatches(0);
  };

  const flipCard = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatches(matches + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="text-center">
      <h4 className="text-lg font-semibold mb-4 text-foreground">Memory Cards</h4>
      <div className="grid grid-cols-4 gap-2 mx-auto w-fit mb-4">
        {cards.map((card) => (
          <Button
            key={card.id}
            variant="outline"
            onClick={() => flipCard(card.id)}
            className={`w-12 h-12 text-lg transition-all duration-300 ${
              card.isFlipped || card.isMatched
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </Button>
        ))}
      </div>
      <div className="flex justify-center space-x-4 items-center">
        <p className="text-sm text-muted-foreground">
          Matches: {matches} / {cardValues.length}
        </p>
        <Button onClick={initializeGame} size="sm" variant="outline">
          New Game
        </Button>
      </div>
    </div>
  );
}
