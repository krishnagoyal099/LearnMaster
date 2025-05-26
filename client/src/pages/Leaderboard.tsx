import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, BookOpen, Gamepad2, Clock, Target, Medal } from 'lucide-react';

interface LeaderboardUser {
  userId: string;
  rank: number;
  totalSessions?: number;
  totalMinutes?: number;
  subjects?: string[];
  totalBreaks?: number;
  completedBreaks?: number;
  gamesPlayed?: string[];
  completionRate?: string;
  lastActive?: Date;
}

export default function Leaderboard() {
  const { data: learningLeaderboard, isLoading: learningLoading } = useQuery({
    queryKey: ['/api/leaderboard/learning'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard/learning');
      if (!response.ok) throw new Error('Failed to fetch learning leaderboard');
      return response.json();
    }
  });

  const { data: breakLeaderboard, isLoading: breakLoading } = useQuery({
    queryKey: ['/api/leaderboard/breaks'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard/breaks');
      if (!response.ok) throw new Error('Failed to fetch break leaderboard');
      return response.json();
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 EduBuddy Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank among fellow learners!
          </p>
        </div>

        <Tabs defaultValue="learning" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Champions
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Focus Masters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Learning Champions - Ranked by Study Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : learningLeaderboard?.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No learning data yet. Start studying to appear on the leaderboard!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learningLeaderboard?.map((user: LeaderboardUser) => (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          user.rank <= 3 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(user.rank)}
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Learner #{user.userId}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(user.totalMinutes || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {user.totalSessions} sessions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end mb-2">
                            {user.subjects?.slice(0, 3).map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {(user.subjects?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(user.subjects?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breaks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                  Focus Masters - Ranked by Completed Breaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breakLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
                  </div>
                ) : breakLeaderboard?.length === 0 ? (
                  <div className="text-center py-8">
                    <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No break data yet. Take some focus breaks to appear on the leaderboard!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {breakLeaderboard?.map((user: LeaderboardUser) => (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          user.rank <= 3 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(user.rank)}
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Player #{user.userId}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {user.completedBreaks} completed
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {user.completionRate}% rate
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end mb-2">
                            {user.gamesPlayed?.map((game, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {game === 'crossword' ? '🎯' : game === 'jigsaw' ? '🧩' : '🧠'} {game}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.totalBreaks} total breaks
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}