import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function JigsawGame() {
  const [pieces, setPieces] = useState(() => 
    Array.from({ length: 16 }, (_, i) => ({ id: i + 1, position: i }))
  );

  const shufflePieces = () => {
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPieces(shuffled.map((piece, index) => ({ ...piece, position: index })));
  };

  const movePiece = (index: number) => {
    // Simple move logic - swap with adjacent piece
    const newPieces = [...pieces];
    if (index < 15) {
      [newPieces[index], newPieces[index + 1]] = [newPieces[index + 1], newPieces[index]];
      setPieces(newPieces);
    }
  };

  return (
    <div className="text-center">
      <h4 className="text-lg font-semibold mb-4 text-foreground">Jigsaw Puzzle</h4>
      <div className="grid grid-cols-4 gap-2 mx-auto w-fit mb-4">
        {pieces.map((piece, index) => (
          <Button
            key={piece.id}
            variant="outline"
            onClick={() => movePiece(index)}
            className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800 border-2 border-yellow-500 dark:border-yellow-400 hover:scale-105 transition-transform text-xs font-bold text-yellow-800 dark:text-yellow-200"
          >
            {piece.id}
          </Button>
        ))}
      </div>
      <Button onClick={shufflePieces} size="sm" variant="outline">
        Shuffle Pieces
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        Click adjacent pieces to move them around!
      </p>
    </div>
  );
}
