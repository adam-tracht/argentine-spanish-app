'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Argentine Spanish 🇦🇷
          </h1>
          <div>
            {status === 'loading' ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 text-sm">
                  {session.user?.name || session.user?.email}
                </span>
                <Button variant="secondary" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Master Argentine Spanish
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn the slang, verb conjugations, and conversation skills you need to date,
            socialize, and thrive in Buenos Aires
          </p>
        </div>

        {/* Study Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {studyModes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="group block"
            >
              <Card hover padding="none" className="overflow-hidden h-full border border-gray-200">
                <div className="p-8 flex justify-center bg-gray-50">
                  <span className="text-6xl">{mode.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {mode.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mode.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <Card padding="lg" className="mb-16 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            What You'll Learn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🗣️</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-lg">
                  Voseo Conjugations
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Master the vos form used in Argentina instead of tú
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">💃</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-lg">
                  Dating & Social Phrases
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Flirt, make plans, and connect with confidence
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🎭</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-lg">
                  Gen-Z Slang
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sound natural with boludo, re, zarpado, and more
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🧉</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-lg">
                  Cultural Context
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Learn about la previa, mate culture, and porteño life
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Preview (if logged in) */}
        {session && (
          <Card padding="lg" className="bg-blue-50 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-600 text-sm">Cards Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-600 text-sm">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-600 text-sm">Words Mastered</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  View Full Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* CTA for non-logged in users */}
        {!session && status !== 'loading' && (
          <Card padding="lg" className="text-center bg-blue-50 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sign in to track your progress, save custom vocab, and unlock personalized learning
            </p>
            <Button variant="primary" size="lg" onClick={() => signIn()}>
              Sign In to Start Learning
            </Button>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p className="font-medium">Built for mastering Argentine Spanish 🇦🇷</p>
          <p className="text-sm mt-2 text-gray-500">
            Perfect for dating, socializing, and navigating Buenos Aires
          </p>
        </div>
      </footer>
    </div>
  );
}
