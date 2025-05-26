import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bot } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

export function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white/20 dark:bg-gray-800/50 p-4 rounded-full mr-4 backdrop-blur-sm">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            What do you want to learn today?
          </h1>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="For example: Python, JavaScript, Machine Learning..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-6 py-4 text-lg rounded-xl border-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-14"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-2 bg-primary hover:bg-primary/90 h-10 w-10"
            size="icon"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
