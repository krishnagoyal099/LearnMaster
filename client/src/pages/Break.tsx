import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, X, RotateCcw, Timer, Info } from 'lucide-react';
import { CrosswordGame } from '@/components/games/CrosswordGame';
import { JigsawGame } from '@/components/games/JigsawGame';
import { MemoryGame } from '@/components/games/MemoryGame';
import { useLocation } from 'wouter';

type GameType = 'crossword' | 'jigsaw' | 'memory' | null;

export default function Break() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            // Auto-redirect to learning page after time ends
            setLocation('/');
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, setLocation]);

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

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
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
          <div className="text-center text-muted-foreground py-12">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-lg">Select a game to start your focus break</p>
            <p className="text-sm mt-2">Choose from crossword, jigsaw, or memory games</p>
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
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🎯 Focus Break Mode
            </h1>
            <p className="text-muted-foreground">
              Take a productive break with focus-enhancing games
            </p>
          </div>

          {/* Main Break Interface */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2">
            <CardHeader className="text-center border-b">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Timer className="h-6 w-6 text-purple-600" />
                Break Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                  <span className="text-4xl font-bold text-white">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                {/* Time Preset Buttons */}
                <div className="flex justify-center space-x-3 mb-6">
                  {[
                    { seconds: 300, label: '5 min' },
                    { seconds: 600, label: '10 min' },
                    { seconds: 900, label: '15 min' },
                    { seconds: 1200, label: '20 min' }
                  ].map(({ seconds, label }) => (
                    <Button
                      key={seconds}
                      variant={timeLeft === seconds ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPresetTime(seconds)}
                      className={timeLeft === seconds ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className={isRunning ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause Break
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Break
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </div>

                {/* Auto-redirect Info */}
                <div className="flex items-center justify-center text-sm text-muted-foreground mb-8">
                  <Info className="mr-2 h-4 w-4" />
                  Auto-redirect to learning page after time ends
                </div>
              </div>

              {/* Game Selection */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                  Choose Your Game:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {(['crossword', 'jigsaw', 'memory'] as const).map((game) => (
                    <Button
                      key={game}
                      variant="outline"
                      onClick={() => handleGameSelect(game)}
                      className={`p-6 h-auto flex-col space-y-3 transition-all duration-200 border-2 ${
                        selectedGame === game 
                          ? getGameColors(game)
                          : 'border-transparent hover:border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-3xl">{getGameIcon(game)}</div>
                      <div className="text-lg font-medium capitalize">{game}</div>
                      <div className="text-sm text-muted-foreground">
                        {game === 'crossword' && 'Test your vocabulary'}
                        {game === 'jigsaw' && 'Arrange the pieces'}
                        {game === 'memory' && 'Match the cards'}
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Game Area */}
                <Card className="bg-muted/20 border-dashed border-2">
                  <CardContent className="p-8 min-h-[300px]">
                    {renderGame()}
                  </CardContent>
                </Card>
              </div>

              {/* Navigation */}
              <div className="text-center mt-8 pt-6 border-t">
                <Button
                  onClick={() => setLocation('/')}
                  variant="outline"
                  size="lg"
                >
                  <X className="mr-2 h-5 w-5" />
                  Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}