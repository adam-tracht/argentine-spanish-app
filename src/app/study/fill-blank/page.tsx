'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Verb {
  id: number;
  infinitive: string;
  presenteVos: string;
  pasadoVos: string;
  presenteYo: string;
  pasadoYo: string;
  english: string;
  exampleSpanish: string | null;
  isIrregular: boolean | null;
}

interface Question {
  sentence: string;
  answer: string;
  hint: string;
  type: 'verb';
  originalItem: Verb;
}

export default function FillBlankPage() {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);

  // Settings
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const verbsRes = await fetch('/api/verbs');
      const verbsData = await verbsRes.json();
      setVerbs(verbsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const generateVerbQuestion = (verb: Verb): Question | null => {
    if (!verb.exampleSpanish) return null;

    // Randomly choose which conjugation to test
    const conjugations = [
      { form: verb.presenteVos, label: 'vos present' },
      { form: verb.pasadoVos, label: 'vos past' },
      { form: verb.presenteYo, label: 'yo present' },
      { form: verb.pasadoYo, label: 'yo past' },
    ];
    const randomConjugation = conjugations[Math.floor(Math.random() * conjugations.length)];

    // Check if the example contains this conjugation
    if (!verb.exampleSpanish.toLowerCase().includes(randomConjugation.form.toLowerCase())) {
      // Try another conjugation
      const alternateConjugation = conjugations.find((c) =>
        verb.exampleSpanish?.toLowerCase().includes(c.form.toLowerCase())
      );
      if (!alternateConjugation) return null;

      const sentence = verb.exampleSpanish.replace(
        new RegExp(alternateConjugation.form, 'gi'),
        '______'
      );
      return {
        sentence,
        answer: alternateConjugation.form,
        hint: `${verb.infinitive} (${alternateConjugation.label})`,
        type: 'verb',
        originalItem: verb,
      };
    }

    const sentence = verb.exampleSpanish.replace(
      new RegExp(randomConjugation.form, 'gi'),
      '______'
    );

    return {
      sentence,
      answer: randomConjugation.form,
      hint: `${verb.infinitive} (${randomConjugation.label})`,
      type: 'verb',
      originalItem: verb,
    };
  };

  const generateQuestions = (): Question[] => {
    const verbQuestions = shuffleArray(verbs)
      .slice(0, questionCount)
      .map(generateVerbQuestion)
      .filter((q): q is Question => q !== null);

    return verbQuestions.slice(0, questionCount);
  };

  const startExercise = () => {
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setExerciseStarted(true);
    setExerciseComplete(false);
    setUserAnswer('');
    setShowResult(false);
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(currentQuestion.answer);

    const correct = normalizedUser === normalizedCorrect;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setExerciseComplete(true);
    }
  };

  const resetExercise = () => {
    setExerciseStarted(false);
    setExerciseComplete(false);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setScore(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!showResult) {
        checkAnswer();
      } else {
        nextQuestion();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading exercises...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
          {exerciseStarted && !exerciseComplete && (
            <button
              onClick={resetExercise}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Exit Exercise
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Exercise Settings */}
        {!exerciseStarted && !exerciseComplete && (
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
              Verb Conjugation Practice
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Fill in the blank with the correct verb conjugation
            </p>

            <div className="bg-white rounded-xl shadow-md p-8 mb-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Exercise Settings
              </h2>

              {/* Question Count */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              <button
                onClick={startExercise}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
              >
                Start Exercise
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>1. Read the Spanish sentence with a blank (______)</li>
                <li>2. Look at the hint to see which verb and tense to use</li>
                <li>3. Type the correct verb conjugation</li>
                <li>4. Press Enter or click "Check Answer"</li>
                <li>5. Practice Argentine vos conjugations and get instant feedback!</li>
                <li className="mt-3 text-xs text-gray-600">
                  💡 Tip: Accents don't matter - "tenes" and "tenés" are both accepted
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Active Exercise */}
        {exerciseStarted && !exerciseComplete && currentQuestion && (
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
              {/* Sentence */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">
                  Fill in the blank with the correct word:
                </p>
                <p className="text-3xl font-medium text-gray-900 mb-4 text-center">
                  {currentQuestion.sentence}
                </p>

                {/* Hint */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <span className="text-sm text-gray-600">Hint: </span>
                  <span className="text-sm font-medium text-blue-800">
                    {currentQuestion.hint}
                  </span>
                </div>
              </div>

              {/* Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={showResult}
                  placeholder="Type your answer here..."
                  className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
                  autoFocus
                />
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
                    className={`font-semibold text-lg mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  {!isCorrect && (
                    <div>
                      <p className="text-gray-700 mb-1">
                        <span className="font-medium">Your answer:</span> {userAnswer}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Correct answer:</span>{' '}
                        <span className="text-green-700 font-semibold">
                          {currentQuestion.answer}
                        </span>
                      </p>
                    </div>
                  )}
                  {/* Full sentence with answer */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Complete sentence:</p>
                    <p className="text-lg text-gray-900">
                      {currentQuestion.sentence.replace('______', currentQuestion.answer)}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showResult ? (
                  <button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Check Answer
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

              {!showResult && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Press Enter to submit
                </p>
              )}
            </div>
          </div>
        )}

        {/* Exercise Complete */}
        {exerciseComplete && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Exercise Complete! 🎉
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
                    Perfect! Your recall is excellent! 🌟
                  </p>
                )}
                {score >= questions.length * 0.8 && score < questions.length && (
                  <p className="text-lg text-blue-600 font-semibold">
                    Great work! You're mastering this! 💪
                  </p>
                )}
                {score >= questions.length * 0.6 && score < questions.length * 0.8 && (
                  <p className="text-lg text-yellow-600 font-semibold">
                    Good progress! Keep practicing! 📚
                  </p>
                )}
                {score < questions.length * 0.6 && (
                  <p className="text-lg text-orange-600 font-semibold">
                    Keep going! Practice makes perfect! 💡
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetExercise}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  New Exercise
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
