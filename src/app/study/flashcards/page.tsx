'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Flashcard from '@/components/Flashcard';

interface Vocabulary {
  id: number;
  spanish: string;
  english: string;
  context: string | null;
  category: string;
  difficulty: string;
  tags: string[] | null;
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

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch('/api/vocabulary');
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

  const handleRate = (rating: 'easy' | 'good' | 'hard' | 'again') => {
    setSessionStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [rating]: prev[rating] + 1,
    }));

    // Move to next card
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete
      setSessionStarted(false);
      setShowSettings(true);
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading flashcards...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition"
          >
            ← Argentine Spanish 🇦🇷
          </Link>
          {sessionStarted && (
            <button
              onClick={resetSession}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              New Session
            </button>
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
            <p className="text-lg text-gray-600 mb-8 text-center">
              Study vocabulary with spaced repetition
            </p>

            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={startSession}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
              >
                Start Session ({applyFilters().length} cards)
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                How it works:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  1. See the Spanish word and try to recall the English
                  translation
                </li>
                <li>2. Click the card to reveal the answer</li>
                <li>
                  3. Rate how well you knew it:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>
                      <span className="font-semibold text-red-600">
                        Again
                      </span>{' '}
                      - Didn't know it at all
                    </li>
                    <li>
                      <span className="font-semibold text-orange-600">
                        Hard
                      </span>{' '}
                      - Struggled to remember
                    </li>
                    <li>
                      <span className="font-semibold text-green-600">
                        Good
                      </span>{' '}
                      - Remembered with some effort
                    </li>
                    <li>
                      <span className="font-semibold text-blue-600">
                        Easy
                      </span>{' '}
                      - Knew it instantly
                    </li>
                  </ul>
                </li>
                <li>
                  4. Your ratings help the app show you words at the optimal
                  time
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Session Complete */}
        {!sessionStarted && !showSettings && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Session Complete! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Great work! You reviewed {sessionStats.reviewed} cards.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessionStats.easy}
                  </div>
                  <div className="text-sm text-gray-600">Easy</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {sessionStats.good}
                  </div>
                  <div className="text-sm text-gray-600">Good</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {sessionStats.hard}
                  </div>
                  <div className="text-sm text-gray-600">Hard</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {sessionStats.again}
                  </div>
                  <div className="text-sm text-gray-600">Again</div>
                </div>
              </div>

              <button
                onClick={resetSession}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start New Session
              </button>
            </div>
          </div>
        )}

        {/* Active Session */}
        {sessionStarted && currentCard && (
          <div>
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Card {sessionStats.reviewed + 1} of {sessionStats.total}
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
            />

            {/* Session Stats */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-around text-sm">
                  <div className="text-center">
                    <div className="text-blue-600 font-semibold">
                      {sessionStats.easy}
                    </div>
                    <div className="text-gray-500">Easy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">
                      {sessionStats.good}
                    </div>
                    <div className="text-gray-500">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-600 font-semibold">
                      {sessionStats.hard}
                    </div>
                    <div className="text-gray-500">Hard</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">
                      {sessionStats.again}
                    </div>
                    <div className="text-gray-500">Again</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
