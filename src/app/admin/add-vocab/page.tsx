'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AddVocabPage() {
  const [formData, setFormData] = useState({
    spanish: '',
    english: '',
    category: 'other',
    difficulty: 'beginner',
    tags: '',
    context: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    { value: 'grammar', label: 'Grammar' },
    { value: 'social', label: 'Social' },
    { value: 'dating', label: 'Dating' },
    { value: 'slang', label: 'Slang' },
    { value: 'directions', label: 'Directions' },
    { value: 'food_drink', label: 'Food & Drink' },
    { value: 'emotions', label: 'Emotions' },
    { value: 'other', label: 'Other' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        spanish: formData.spanish.trim(),
        english: formData.english.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : null,
        context: formData.context.trim() || null,
      };

      const response = await fetch('/api/vocabulary/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Vocabulary added successfully!' });
        // Reset form
        setFormData({
          spanish: '',
          english: '',
          category: 'other',
          difficulty: 'beginner',
          tags: '',
          context: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add vocabulary' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
            ← Argentine Spanish 🇦🇷
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Add Vocabulary
        </h1>
        <p className="text-lg text-gray-600 mb-10 text-center">
          Add new words and phrases to the database
        </p>

        <Card padding="lg" className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Spanish Word */}
            <div>
              <label htmlFor="spanish" className="block text-sm font-medium text-gray-700 mb-2">
                Spanish Word/Phrase *
              </label>
              <input
                type="text"
                id="spanish"
                required
                value={formData.spanish}
                onChange={(e) => setFormData({ ...formData, spanish: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="e.g., boludo"
              />
            </div>

            {/* English Translation */}
            <div>
              <label htmlFor="english" className="block text-sm font-medium text-gray-700 mb-2">
                English Translation *
              </label>
              <input
                type="text"
                id="english"
                required
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="e.g., dude/idiot"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                id="difficulty"
                required
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {difficulties.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="e.g., slang, casual, common"
              />
            </div>

            {/* Context */}
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                Context/Example
              </label>
              <textarea
                id="context"
                rows={3}
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="e.g., Common slang, can be friendly or insulting depending on context"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Vocabulary'}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card padding="md" className="mt-6 bg-blue-50 shadow-xl">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
          <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
            <li><span className="font-medium">•</span> Fill in the Spanish word and English translation</li>
            <li><span className="font-medium">•</span> Select the appropriate category and difficulty level</li>
            <li><span className="font-medium">•</span> Add tags separated by commas for easier searching</li>
            <li><span className="font-medium">•</span> Provide context or example usage to help learners understand when to use it</li>
            <li><span className="font-medium">•</span> New vocabulary will appear immediately in flashcards, quizzes, and fill-in-blank exercises</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
