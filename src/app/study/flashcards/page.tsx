'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Flashcard from '@/components/Flashcard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface Vocabulary {
  id: number;
  spanish: string;
  english: string;
  context: string | null;
  category: string;
  difficulty: string;
  tags: string[] | null;
  isFavorite?: boolean;
}

export default function FlashcardsPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
    easy: 0,
    good: 0,
    hard: 0,
    again: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [excludeKnown, setExcludeKnown] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeKnown, favoritesOnly]);

  const fetchVocabulary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vocabulary?excludeKnown=${excludeKnown}&favoritesOnly=${favoritesOnly}`);
      const data = await response.json();
      setVocabulary(shuffleArray(data));
      setSessionStats((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const applyFilters = () => {
    let filtered = vocabulary;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((v) => v.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((v) => v.difficulty === difficultyFilter);
    }

    return shuffleArray(filtered);
  };

  const startSession = () => {
    const filtered = applyFilters();
    setVocabulary(filtered);
    setCurrentIndex(0);
    setSessionStats({
      total: filtered.length,
      reviewed: 0,
      easy: 0,
      good: 0,
      hard: 0,
      again: 0,
    });
    setSessionStarted(true);
    setShowSettings(false);
  };

  const handleRate = async (rating: 'easy' | 'good' | 'hard' | 'again') => {
    setSessionStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [rating]: prev[rating] + 1,
    }));

    // Track progress in database
    const wasCorrect = rating === 'easy' || rating === 'good';
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentCard.id,
          wasCorrect,
        }),
      });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }

    // Move to next card
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete
      setSessionStarted(false);
      setShowSettings(true);
    }
  };

  const handleMarkAsKnown = async () => {
    if (!currentCard) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentCard.id,
          isKnown: true,
        }),
      });

      // Remove from current session
      const newVocab = vocabulary.filter((_, idx) => idx !== currentIndex);
      setVocabulary(newVocab);
      setSessionStats((prev) => ({
        ...prev,
        total: newVocab.length,
      }));

      // If no more cards, end session
      if (newVocab.length === 0 || currentIndex >= newVocab.length) {
        setSessionStarted(false);
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Error marking as known:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentCard) return;

    const newFavoriteStatus = !currentCard.isFavorite;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentCard.id,
          isFavorite: newFavoriteStatus,
        }),
      });

      // Update the current card's favorite status in state
      const updatedVocabulary = [...vocabulary];
      updatedVocabulary[currentIndex] = {
        ...currentCard,
        isFavorite: newFavoriteStatus,
      };
      setVocabulary(updatedVocabulary);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionStarted(false);
    setShowSettings(true);
    fetchVocabulary();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading flashcards...</div>
      </div>
    );
  }

  const categories = Array.from(
    new Set(vocabulary.map((v) => v.category))
  );
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const currentCard = vocabulary[currentIndex];
  const progress = ((sessionStats.reviewed / sessionStats.total) * 100) || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-blue-600"
          >
            ← Argentine Spanish 🇦🇷
          </Link>
          {sessionStarted && (
            <Button variant="secondary" size="sm" onClick={resetSession}>
              New Session
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Settings Panel */}
        {showSettings && !sessionStarted && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
              Flashcards
            </h1>
            <p className="text-lg text-gray-600 mb-10 text-center">
              Study vocabulary with spaced repetition
            </p>

            <Card padding="lg" className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Session Settings
              </h2>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Levels</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exclude Known Toggle */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="excludeKnown"
                  checked={excludeKnown}
                  onChange={(e) => setExcludeKnown(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="excludeKnown" className="ml-2 text-sm font-medium text-gray-700">
                  Hide cards I've mastered
                </label>
              </div>

              {/* Favorites Only Toggle */}
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="favoritesOnly"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="favoritesOnly" className="ml-2 text-sm font-medium text-gray-700">
                  ⭐ Show only favorites
                </label>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={startSession}>
                Start Session ({applyFilters().length} cards)
              </Button>
            </Card>

            {/* Instructions */}
            <Card padding="md" className="bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-4">
                How it works:
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-700 leading-relaxed">
                <li>
                  <span className="font-medium">1.</span> See the Spanish word and try to recall the English translation
                </li>
                <li><span className="font-medium">2.</span> Click the card to reveal the answer</li>
                <li>
                  <span className="font-medium">3.</span> Rate how well you knew it:
                  <ul className="ml-4 mt-2 space-y-1.5">
                    <li>
                      <span className="font-semibold text-red-600">Again</span> - Didn't know it at all
                    </li>
                    <li>
                      <span className="font-semibold text-amber-600">Hard</span> - Struggled to remember
                    </li>
                    <li>
                      <span className="font-semibold text-green-600">Good</span> - Remembered with some effort
                    </li>
                    <li>
                      <span className="font-semibold text-blue-600">Easy</span> - Knew it instantly
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">4.</span> Your ratings help the app show you words at the optimal time
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Session Complete */}
        {!sessionStarted && !showSettings && (
          <div className="max-w-2xl mx-auto text-center">
            <Card padding="lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Session Complete! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Great work! You reviewed {sessionStats.reviewed} cards.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {sessionStats.easy}
                  </div>
                  <div className="text-sm text-gray-600">Easy</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {sessionStats.good}
                  </div>
                  <div className="text-sm text-gray-600">Good</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {sessionStats.hard}
                  </div>
                  <div className="text-sm text-gray-600">Hard</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {sessionStats.again}
                  </div>
                  <div className="text-sm text-gray-600">Again</div>
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={resetSession}>
                Start New Session
              </Button>
            </Card>
          </div>
        )}

        {/* Active Session */}
        {sessionStarted && currentCard && (
          <div>
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <ProgressBar
                value={progress}
                showLabel
                label={`Card ${sessionStats.reviewed + 1} of ${sessionStats.total}`}
                variant="primary"
                size="md"
              />
            </div>

            {/* Flashcard */}
            <Flashcard
              spanish={currentCard.spanish}
              english={currentCard.english}
              context={currentCard.context}
              category={currentCard.category}
              difficulty={currentCard.difficulty}
              tags={currentCard.tags}
              onRate={handleRate}
              isFavorite={currentCard.isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Mark as Known Button */}
            <div className="max-w-2xl mx-auto mt-6 text-center">
              <button
                onClick={handleMarkAsKnown}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ✓ I've mastered this card - don't show it again
              </button>
            </div>

            {/* Session Stats */}
            <div className="max-w-2xl mx-auto mt-8">
              <Card padding="md">
                <div className="flex justify-around text-sm">
                  <div className="text-center">
                    <div className="text-2xl text-blue-600 font-semibold mb-1">
                      {sessionStats.easy}
                    </div>
                    <div className="text-gray-500">Easy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-green-600 font-semibold mb-1">
                      {sessionStats.good}
                    </div>
                    <div className="text-gray-500">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-amber-600 font-semibold mb-1">
                      {sessionStats.hard}
                    </div>
                    <div className="text-gray-500">Hard</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-red-600 font-semibold mb-1">
                      {sessionStats.again}
                    </div>
                    <div className="text-gray-500">Again</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
