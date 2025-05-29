
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Book, Video, Globe, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Resource {
  title: string;
  url: string;
  description?: string;
  type: 'article' | 'video' | 'course' | 'documentation' | 'other';
}

async function searchLearnAnything(topic: string): Promise<Resource[]> {
  const response = await fetch(`/api/learn-anything/search?topic=${encodeURIComponent(topic)}`);
  if (!response.ok) {
    throw new Error('Failed to search resources');
  }
  return response.json();
}

export default function FindResources() {
  const [searchTopic, setSearchTopic] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/learn-anything/search', currentTopic],
    queryFn: () => searchLearnAnything(currentTopic),
    enabled: !!currentTopic,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTopic.trim()) {
      setCurrentTopic(searchTopic.trim());
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'course':
        return <Book className="h-4 w-4" />;
      case 'documentation':
        return <Book className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'course':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'documentation':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Find Learning Resources
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover curated learning resources from learn-anything.xyz for any topic you want to master.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter a topic to find resources (e.g., Python, Machine Learning, React)"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !searchTopic.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {currentTopic && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Resources for "{currentTopic}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Searching for resources...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">Failed to search resources. Please try again.</p>
                  <Button onClick={() => setCurrentTopic('')} variant="outline">
                    Clear Search
                  </Button>
                </div>
              )}

              {resources && resources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No resources found for "{currentTopic}"</p>
                  <Button onClick={() => setCurrentTopic('')} variant="outline">
                    Try Another Topic
                  </Button>
                </div>
              )}

              {resources && resources.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-6">
                    Found {resources.length} resources for "{currentTopic}"
                  </p>
                  
                  <div className="grid gap-4">
                    {resources.map((resource, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getResourceColor(resource.type)}>
                                {getResourceIcon(resource.type)}
                                <span className="ml-1 capitalize">{resource.type}</span>
                              </Badge>
                            </div>
                            
                            <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                              {resource.title}
                            </h3>
                            
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                            
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit Resource
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
