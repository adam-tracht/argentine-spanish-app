'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vocabulary {
  id: number;
  spanish: string;
  english: string;
  context: string | null;
  category: string;
  difficulty: string;
  tags: string[] | null;
}

interface QuizQuestion {
  vocab: Vocabulary;
  options: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Settings
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizMode, setQuizMode] = useState<'spanish-to-english' | 'english-to-spanish'>('spanish-to-english');
  const [excludeKnown, setExcludeKnown] = useState(true);

  useEffect(() => {
    fetchVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeKnown]);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch(`/api/vocabulary?excludeKnown=${excludeKnown}`);
      const data = await response.json();
      setVocabulary(data);
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

  const generateQuestions = (vocab: Vocabulary[]): QuizQuestion[] => {
    const filtered = vocab.filter((v) => {
      const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || v.difficulty === difficultyFilter;
      return matchesCategory && matchesDifficulty;
    });

    const shuffled = shuffleArray(filtered);
    const selected = shuffled.slice(0, Math.min(questionCount, filtered.length));

    return selected.map((vocab) => {
      const correctAnswer = quizMode === 'spanish-to-english' ? vocab.english : vocab.spanish;

      // Generate wrong answers from other vocab
      const otherVocab = filtered.filter((v) => v.id !== vocab.id);
      const wrongAnswers = shuffleArray(otherVocab)
        .slice(0, 3)
        .map((v) => quizMode === 'spanish-to-english' ? v.english : v.spanish);

      const options = shuffleArray([correctAnswer, ...wrongAnswers]);

      return {
        vocab,
        options,
        correctAnswer,
      };
    });
  };

  const startQuiz = () => {
    const newQuestions = generateQuestions(vocabulary);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizStarted(true);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return; // Prevent changing answer after submitting
    setSelectedAnswer(answer);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    // Track progress in database
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentQuestion.vocab.id,
          wasCorrect: isCorrect,
        }),
      });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleMarkAsKnown = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentQuestion.vocab.id,
          isKnown: true,
        }),
      });

      // Remove from current quiz
      const newQuestions = questions.filter((_, idx) => idx !== currentQuestionIndex);
      setQuestions(newQuestions);

      // If no more questions, end quiz
      if (newQuestions.length === 0 || currentQuestionIndex >= newQuestions.length) {
        setQuizComplete(true);
      } else {
        // Stay on same index (which now shows next question)
        setSelectedAnswer(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error('Error marking as known:', error);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  const categories = Array.from(new Set(vocabulary.map((v) => v.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const filteredVocabCount = vocabulary.filter((v) => {
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || v.difficulty === difficultyFilter;
    return matchesCategory && matchesDifficulty;
  }).length;

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
          {quizStarted && !quizComplete && (
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Exit Quiz
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quiz Settings */}
        {!quizStarted && !quizComplete && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
              Quiz Mode
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Test your vocabulary knowledge with multiple choice questions
            </p>

            <div className="bg-white rounded-xl shadow-md p-8 mb-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quiz Settings
              </h2>

              {/* Quiz Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Direction
                </label>
                <select
                  value={quizMode}
                  onChange={(e) => setQuizMode(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="spanish-to-english">Spanish → English</option>
                  <option value="english-to-spanish">English → Spanish</option>
                </select>
              </div>

              {/* Category */}
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

              {/* Difficulty */}
              <div className="mb-4">
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

              {/* Question Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              {/* Exclude Known Toggle */}
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="excludeKnown"
                  checked={excludeKnown}
                  onChange={(e) => setExcludeKnown(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="excludeKnown" className="ml-2 text-sm font-medium text-gray-700">
                  Hide words I've mastered
                </label>
              </div>

              <button
                onClick={startQuiz}
                disabled={filteredVocabCount === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {filteredVocabCount === 0
                  ? 'No vocabulary available'
                  : `Start Quiz (${Math.min(questionCount, filteredVocabCount)} questions)`}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  1. Choose your quiz settings (direction, category, difficulty,
                  question count)
                </li>
                <li>2. Read the question and select one of four answers</li>
                <li>3. Click "Submit Answer" to check if you're correct</li>
                <li>4. See immediate feedback with the correct answer</li>
                <li>5. Track your score and aim for 100%!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Active Quiz */}
        {quizStarted && !quizComplete && currentQuestion && (
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>
                  Score: {score}/{questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              {/* Question */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">
                  {quizMode === 'spanish-to-english'
                    ? 'What does this mean in English?'
                    : 'How do you say this in Spanish?'}
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {quizMode === 'spanish-to-english'
                    ? currentQuestion.vocab.spanish
                    : currentQuestion.vocab.english}
                </h2>
                {currentQuestion.vocab.context && !showResult && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Context: {currentQuestion.vocab.context}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;

                  let buttonStyle = 'bg-gray-50 hover:bg-gray-100 border-gray-200';

                  if (showResult) {
                    if (isCorrectOption) {
                      buttonStyle = 'bg-green-100 border-green-500 text-green-900';
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = 'bg-red-100 border-red-500 text-red-900';
                    }
                  } else if (isSelected) {
                    buttonStyle = 'bg-blue-100 border-blue-500 text-blue-900';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={`w-full px-6 py-4 text-left border-2 rounded-lg font-medium transition ${buttonStyle} ${
                        showResult ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && isCorrectOption && (
                          <span className="text-green-600 font-bold">✓</span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showResult && (
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    isCorrect
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`font-semibold mb-1 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-gray-700">
                      The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                    </p>
                  )}
                  {currentQuestion.vocab.context && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {currentQuestion.vocab.context}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showResult ? (
                  <button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? 'Next Question →'
                      : 'View Results'}
                  </button>
                )}
              </div>
            </div>

            {/* Mark as Known Button */}
            <div className="text-center mt-4">
              <button
                onClick={handleMarkAsKnown}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ✓ I've mastered this word - don't show it again
              </button>
            </div>
          </div>
        )}

        {/* Quiz Complete */}
        {quizComplete && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Quiz Complete! 🎉
              </h2>

              {/* Score */}
              <div className="mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-xl text-gray-600">
                  {Math.round((score / questions.length) * 100)}% Correct
                </div>
              </div>

              {/* Performance Message */}
              <div className="mb-6">
                {score === questions.length && (
                  <p className="text-lg text-green-600 font-semibold">
                    Perfect score! Outstanding! 🌟
                  </p>
                )}
                {score >= questions.length * 0.8 && score < questions.length && (
                  <p className="text-lg text-blue-600 font-semibold">
                    Great job! Keep it up! 💪
                  </p>
                )}
                {score >= questions.length * 0.6 && score < questions.length * 0.8 && (
                  <p className="text-lg text-yellow-600 font-semibold">
                    Good effort! Review and try again! 📚
                  </p>
                )}
                {score < questions.length * 0.6 && (
                  <p className="text-lg text-orange-600 font-semibold">
                    Keep practicing! You'll get better! 💡
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  New Quiz
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
