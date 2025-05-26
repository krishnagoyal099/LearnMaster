import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, X, Info } from 'lucide-react';
import { CrosswordGame } from './games/CrosswordGame';
import { JigsawGame } from './games/JigsawGame';
import { MemoryGame } from './games/MemoryGame';

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameType = 'crossword' | 'jigsaw' | 'memory' | null;

export function BreakModal({ isOpen, onClose }: BreakModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            onClose();
            alert('Break time is over! Redirecting back to learning...');
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setPresetTime = (seconds: number) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'crossword':
        return <CrosswordGame />;
      case 'jigsaw':
        return <JigsawGame />;
      case 'memory':
        return <MemoryGame />;
      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-3xl mb-2">🎮</div>
            <p>Select a game to start your focus break</p>
          </div>
        );
    }
  };

  const getGameIcon = (game: string) => {
    switch (game) {
      case 'crossword': return '🎯';
      case 'jigsaw': return '🧩';
      case 'memory': return '🧠';
      default: return '🎮';
    }
  };

  const getGameColors = (game: string) => {
    switch (game) {
      case 'crossword': return 'bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-800/50 border-pink-500';
      case 'jigsaw': return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 border-yellow-500';
      case 'memory': return 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 border-blue-500';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            Break Mode
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Timer Section */}
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="flex justify-center space-x-2 mb-4">
              {[300, 600, 900].map((seconds) => (
                <Button
                  key={seconds}
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetTime(seconds)}
                  className={timeLeft === seconds ? 'bg-purple-100 dark:bg-purple-900' : ''}
                >
                  {seconds / 60} min
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
              <Info className="mr-1 h-4 w-4" />
              Auto-redirect to learning page after time ends
            </div>
          </div>

          {/* Game Selection */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Game:</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {(['crossword', 'jigsaw', 'memory'] as const).map((game) => (
                <Button
                  key={game}
                  variant="outline"
                  onClick={() => handleGameSelect(game)}
                  className={`p-4 h-auto flex-col space-y-2 transition-colors border-2 ${
                    selectedGame === game 
                      ? getGameColors(game)
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <div className="text-2xl">{getGameIcon(game)}</div>
                  <div className="text-sm font-medium capitalize">{game}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Game Area */}
          <div className="bg-muted/50 rounded-lg p-6 min-h-[200px]">
            {renderGame()}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleTimer}
              className={isRunning ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Break
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
