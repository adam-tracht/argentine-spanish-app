'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  const studyModes = [
    {
      title: 'Flashcards',
      description: 'Swipeable cards with spaced repetition',
      href: '/study/flashcards',
      icon: '🃏',
      color: 'bg-blue-500',
    },
    {
      title: 'Quiz',
      description: 'Multiple choice questions to test your knowledge',
      href: '/study/quiz',
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Fill in the Blank',
      description: 'Complete sentences with the correct word',
      href: '/study/fill-blank',
      icon: '📝',
      color: 'bg-yellow-500',
    },
    {
      title: 'Conversations',
      description: 'Interactive dialogues for real-world scenarios',
      href: '/study/scenarios',
      icon: '💬',
      color: 'bg-purple-500',
    },
    {
      title: 'Verb Tables',
      description: 'Browse and practice verb conjugations',
      href: '/verbs',
      icon: '📚',
      color: 'bg-pink-500',
    },
    {
      title: 'Dashboard',
      description: 'Track your progress and stats',
      href: '/dashboard',
      icon: '📊',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Argentine Spanish 🇦🇷
          </h1>
          <div>
            {status === 'loading' ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Argentine Spanish
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn the slang, verb conjugations, and conversation skills you need to date,
            socialize, and thrive in Buenos Aires
          </p>
        </div>

        {/* Study Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {studyModes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`${mode.color} p-6 flex justify-center`}>
                <span className="text-6xl">{mode.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {mode.title}
                </h3>
                <p className="text-gray-600">{mode.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            What You'll Learn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗣️</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Voseo Conjugations
                </h4>
                <p className="text-gray-600">
                  Master the vos form used in Argentina instead of tú
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💃</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Dating & Social Phrases
                </h4>
                <p className="text-gray-600">
                  Flirt, make plans, and connect with confidence
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎭</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Gen-Z Slang
                </h4>
                <p className="text-gray-600">
                  Sound natural with boludo, re, zarpado, and more
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧉</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Cultural Context
                </h4>
                <p className="text-gray-600">
                  Learn about la previa, mate culture, and porteño life
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Preview (if logged in) */}
        {session && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-blue-100">Cards Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-blue-100">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-blue-100">Words Mastered</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                View Full Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* CTA for non-logged in users */}
        {!session && status !== 'loading' && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6">
              Sign in to track your progress, save custom vocab, and unlock personalized learning
            </p>
            <button
              onClick={() => signIn()}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Sign In to Start Learning
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>Built for mastering Argentine Spanish 🇦🇷</p>
          <p className="text-sm mt-2">
            Perfect for dating, socializing, and navigating Buenos Aires
          </p>
        </div>
      </footer>
    </div>
  );
}
