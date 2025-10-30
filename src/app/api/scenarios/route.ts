import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scenarios } from '@/../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let conditions = [];

    if (category) {
      conditions.push(eq(scenarios.category, category));
    }

    if (difficulty) {
      conditions.push(eq(scenarios.difficulty, difficulty as any));
    }

    const query = conditions.length > 0
      ? db.select().from(scenarios).where(conditions[0])
      : db.select().from(scenarios);

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
