'use client';

import { useState } from 'react';

interface FlashcardProps {
  spanish: string;
  english: string;
  context?: string | null;
  category?: string;
  difficulty?: string;
  tags?: string[] | null;
  onRate: (rating: 'easy' | 'good' | 'hard' | 'again') => void;
}

export default function Flashcard({
  spanish,
  english,
  context,
  category,
  difficulty,
  tags,
  onRate,
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleRate = (rating: 'easy' | 'good' | 'hard' | 'again') => {
    onRate(rating);
    setFlipped(false);
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card */}
      <div
        className="relative h-96 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front - Spanish */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-between border-4 border-blue-500">
              {/* Tags and Category */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {category}
                  </span>
                )}
                {difficulty && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                )}
                {tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Spanish Text */}
              <div className="flex-1 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center">
                  {spanish}
                </h2>
              </div>

              {/* Hint */}
              <div className="text-center text-gray-500 text-sm">
                Click to reveal translation
              </div>
            </div>
          </div>

          {/* Back - English + Context */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-between text-white border-4 border-purple-600">
              {/* English Translation */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                  {english}
                </h2>
                {context && (
                  <p className="text-lg text-white text-center max-w-lg italic">
                    {context}
                  </p>
                )}
              </div>

              {/* Spanish reminder */}
              <div className="text-center text-white/80 text-sm">
                {spanish}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Buttons (only show when flipped) */}
      {flipped && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('again');
            }}
            className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition shadow-md"
          >
            Again
            <div className="text-xs font-normal mt-1">{'<1m'}</div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('hard');
            }}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition shadow-md"
          >
            Hard
            <div className="text-xs font-normal mt-1">{'<10m'}</div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('good');
            }}
            className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
          >
            Good
            <div className="text-xs font-normal mt-1">{'1d'}</div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('easy');
            }}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow-md"
          >
            Easy
            <div className="text-xs font-normal mt-1">{'4d'}</div>
          </button>
        </div>
      )}

      {/* Instructions */}
      {!flipped && (
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Try to recall the English translation before flipping</p>
        </div>
      )}
    </div>
  );
}
