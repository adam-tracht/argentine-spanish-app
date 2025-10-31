import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { vocabulary, users, userProgress } from '@/../drizzle/schema';
import { eq, ilike, or, and, inArray, notInArray, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',');
    const excludeKnown = searchParams.get('excludeKnown') === 'true';

    let conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(vocabulary.spanish, `%${search}%`),
          ilike(vocabulary.english, `%${search}%`)
        )
      );
    }

    // Category filter
    if (category) {
      conditions.push(eq(vocabulary.category, category as any));
    }

    // Difficulty filter
    if (difficulty) {
      conditions.push(eq(vocabulary.difficulty, difficulty as any));
    }

    const query = conditions.length > 0
      ? db.select().from(vocabulary).where(and(...conditions) as any)
      : db.select().from(vocabulary);

    let results = await query;

    // Filter by tags if provided (tags are stored as array in DB)
    if (tags && tags.length > 0) {
      results = results.filter(item =>
        item.tags && tags.some(tag => item.tags?.includes(tag))
      );
    }

    // Filter out known cards if user is logged in and excludeKnown=true
    if (excludeKnown) {
      const session = await getServerSession();
      if (session?.user?.email) {
        // Get user ID
        const user = await db.query.users.findFirst({
          where: eq(users.email, session.user.email),
        });

        if (user) {
          // Get all known vocab IDs for this user
          const knownProgress = await db.query.userProgress.findMany({
            where: and(
              eq(userProgress.userId, user.id),
              eq(userProgress.isKnown, true)
            ),
            columns: {
              vocabId: true,
            },
          });

          const knownVocabIds = knownProgress
            .map(p => p.vocabId)
            .filter(id => id !== null) as number[];

          // Filter out known vocabulary
          if (knownVocabIds.length > 0) {
            results = results.filter(item => !knownVocabIds.includes(item.id));
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}
