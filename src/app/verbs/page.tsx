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
  category: string | null;
}

export default function VerbsPage() {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showIrregularOnly, setShowIrregularOnly] = useState(false);

  useEffect(() => {
    fetchVerbs();
  }, []);

  const fetchVerbs = async () => {
    try {
      const response = await fetch('/api/verbs');
      const data = await response.json();
      setVerbs(data);
    } catch (error) {
      console.error('Error fetching verbs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerbs = verbs.filter(verb => {
    const matchesSearch =
      verb.infinitive.toLowerCase().includes(search.toLowerCase()) ||
      verb.english.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || verb.category === categoryFilter;

    const matchesIrregular =
      !showIrregularOnly || verb.isIrregular;

    return matchesSearch && matchesCategory && matchesIrregular;
  });

  const categories = Array.from(new Set(verbs.map(v => v.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading verbs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
            ← Argentine Spanish 🇦🇷
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Verb Conjugation Table
          </h1>
          <p className="text-lg text-gray-600">
            All {verbs.length} verbs with voseo conjugations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search verbs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat || ''}>
                    {cat || 'Uncategorized'}
                  </option>
                ))}
              </select>
            </div>

            {/* Irregular Filter */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showIrregularOnly}
                  onChange={(e) => setShowIrregularOnly(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Show irregular verbs only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredVerbs.length} verb{filteredVerbs.length !== 1 ? 's' : ''}
        </div>

        {/* Verbs Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Infinitive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    English
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vos (Present)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vos (Past)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yo (Present)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yo (Past)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVerbs.map((verb) => (
                  <tr key={verb.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {verb.infinitive}
                        </span>
                        {verb.isIrregular && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            irregular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {verb.english}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {verb.presenteVos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {verb.pasadoVos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {verb.presenteYo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {verb.pasadoYo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {verb.exampleSpanish}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredVerbs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No verbs found matching your filters.
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Guide:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><span className="font-semibold text-blue-600">Vos</span> - The "you" form used in Argentina (instead of tú)</li>
            <li><span className="font-semibold text-purple-600">Past tense</span> - Preterite (completed actions)</li>
            <li><span className="font-semibold text-red-600">Irregular verbs</span> - Don't follow standard conjugation patterns</li>
            <li>Categories: essential (daily use), social (conversations), slang (informal), food_drink</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
