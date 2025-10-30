import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vocabulary } from '@/../drizzle/schema';
import { eq, ilike, or, and, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',');

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

    const results = await query;

    // Filter by tags if provided (tags are stored as array in DB)
    let filteredResults = results;
    if (tags && tags.length > 0) {
      filteredResults = results.filter(item =>
        item.tags && tags.some(tag => item.tags?.includes(tag))
      );
    }

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}
