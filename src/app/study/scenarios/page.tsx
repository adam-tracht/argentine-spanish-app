'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DialogLine {
  speaker: 'you' | 'other';
  spanish: string;
  english: string;
  options?: string[];
}

interface Scenario {
  id: number;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  dialog: DialogLine[];
  tags: string[] | null;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios');
      const data = await response.json();
      setScenarios(data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentLineIndex(0);
    setShowTranslation(false);
  };

  const nextLine = () => {
    if (selectedScenario && currentLineIndex < selectedScenario.dialog.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
      setShowTranslation(false);
    } else if (selectedScenario) {
      // Scenario complete
      if (!completedScenarios.includes(selectedScenario.id)) {
        setCompletedScenarios([...completedScenarios, selectedScenario.id]);
      }
      setSelectedScenario(null);
      setCurrentLineIndex(0);
    }
  };

  const restartScenario = () => {
    setCurrentLineIndex(0);
    setShowTranslation(false);
  };

  const exitScenario = () => {
    setSelectedScenario(null);
    setCurrentLineIndex(0);
    setShowTranslation(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dating':
        return '💕';
      case 'social':
        return '🎉';
      case 'directions':
        return '🗺️';
      case 'food_drink':
        return '🍽️';
      case 'other':
        return '🛍️';
      default:
        return '💬';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food_drink':
        return 'Food & Drink';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Get unique categories and difficulties from scenarios
  const categories = ['all', ...Array.from(new Set(scenarios.map(s => s.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Filter scenarios
  const filteredScenarios = scenarios.filter(scenario => {
    const categoryMatch = selectedCategory === 'all' || scenario.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading scenarios...</div>
      </div>
    );
  }

  const currentLine = selectedScenario?.dialog[currentLineIndex];
  const progress = selectedScenario
    ? ((currentLineIndex + 1) / selectedScenario.dialog.length) * 100
    : 0;

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
          {selectedScenario && (
            <button
              onClick={exitScenario}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Exit Scenario
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Scenario Selection */}
        {!selectedScenario && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Conversation Scenarios
              </h1>
              <p className="text-lg text-gray-600">
                Practice real-world conversations for dating, bars, and daily life
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Scenarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category === 'all' ? (
                          'All'
                        ) : (
                          <>
                            {getCategoryIcon(category)} {getCategoryLabel(category)}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedDifficulty === difficulty
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredScenarios.length}</span> of {scenarios.length} scenarios
                </p>
              </div>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start mb-3">
                      <span className="text-4xl mr-3">
                        {getCategoryIcon(scenario.category)}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {scenario.title}
                        </h3>
                        {completedScenarios.includes(scenario.id) && (
                          <span className="text-green-600 text-sm font-medium">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4">
                      {scenario.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          scenario.difficulty
                        )}`}
                      >
                        {scenario.difficulty}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {scenario.category}
                      </span>
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {scenario.dialog.length} lines
                      </span>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={() => startScenario(scenario)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Start Scenario
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How to Use:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  1. Choose a scenario that matches your interests (dating,
                  social, directions, etc.)
                </li>
                <li>
                  2. Read the Spanish dialogue and try to understand before
                  revealing translation
                </li>
                <li>
                  3. Practice pronunciation by reading out loud
                </li>
                <li>
                  4. See response options to learn different ways to continue the
                  conversation
                </li>
                <li>
                  5. Complete scenarios to build confidence for real situations!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Active Scenario */}
        {selectedScenario && currentLine && (
          <div className="max-w-3xl mx-auto">
            {/* Scenario Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedScenario.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedScenario.description}
                  </p>
                </div>
                <span className="text-4xl">
                  {getCategoryIcon(selectedScenario.category)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    Line {currentLineIndex + 1} of{' '}
                    {selectedScenario.dialog.length}
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dialog */}
            <div className="space-y-4">
              {/* Current Line */}
              <div
                className={`${
                  currentLine.speaker === 'you'
                    ? 'bg-blue-500 text-white ml-8'
                    : 'bg-white text-gray-900 mr-8'
                } rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-start mb-2">
                  <span className="text-sm font-semibold opacity-75 uppercase tracking-wide">
                    {currentLine.speaker === 'you' ? 'You' : 'Other Person'}
                  </span>
                </div>

                {/* Spanish Text */}
                <p className="text-2xl font-medium mb-4">{currentLine.spanish}</p>

                {/* Translation Toggle */}
                {!showTranslation && (
                  <button
                    onClick={() => setShowTranslation(true)}
                    className={`text-sm ${
                      currentLine.speaker === 'you'
                        ? 'text-blue-100 hover:text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    } underline`}
                  >
                    Show translation
                  </button>
                )}

                {/* English Translation */}
                {showTranslation && (
                  <div
                    className={`mt-3 pt-3 border-t ${
                      currentLine.speaker === 'you'
                        ? 'border-blue-400'
                        : 'border-gray-200'
                    }`}
                  >
                    <p
                      className={`text-lg ${
                        currentLine.speaker === 'you'
                          ? 'text-blue-100'
                          : 'text-gray-600'
                      } italic`}
                    >
                      {currentLine.english}
                    </p>
                  </div>
                )}

                {/* Response Options */}
                {currentLine.options && currentLine.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-400">
                    <p className="text-sm text-blue-100 mb-2 font-semibold">
                      Other ways to respond:
                    </p>
                    <ul className="space-y-1 text-sm text-blue-50">
                      {currentLine.options.map((option, idx) => (
                        <li key={idx}>• {option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={restartScenario}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Restart
                </button>
                <button
                  onClick={nextLine}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {currentLineIndex < selectedScenario.dialog.length - 1
                    ? 'Next Line →'
                    : 'Complete Scenario ✓'}
                </button>
              </div>

              {/* Tip */}
              <div className="text-center text-gray-600 text-sm mt-4">
                💡 Try reading out loud to practice pronunciation
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
