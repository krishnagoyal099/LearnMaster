import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchSection } from '@/components/SearchSection';
import { LearningInterface } from '@/components/LearningInterface';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLearningInterface, setShowLearningInterface] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowLearningInterface(true);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      {!showLearningInterface ? (
        <SearchSection onSearch={handleSearch} />
      ) : (
        <LearningInterface subject={searchQuery} />
      )}
    </div>
  );
}
