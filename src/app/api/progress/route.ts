import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../../../drizzle/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// GET - Get user's progress for a specific vocab/verb
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const vocabId = searchParams.get('vocabId');
    const verbId = searchParams.get('verbId');

    if (!vocabId && !verbId) {
      return NextResponse.json({ error: 'vocabId or verbId required' }, { status: 400 });
    }

    let progress;
    if (vocabId) {
      progress = await db.query.userProgress.findFirst({
        where: and(
          eq(schema.userProgress.userId, user.id),
          eq(schema.userProgress.vocabId, parseInt(vocabId))
        ),
      });
    } else if (verbId) {
      progress = await db.query.userProgress.findFirst({
        where: and(
          eq(schema.userProgress.userId, user.id),
          eq(schema.userProgress.verbId, parseInt(verbId))
        ),
      });
    }

    return NextResponse.json({ progress: progress || null });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// POST - Update or create progress for a vocab/verb
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { vocabId, verbId, isKnown, wasCorrect } = body;

    if (!vocabId && !verbId) {
      return NextResponse.json({ error: 'vocabId or verbId required' }, { status: 400 });
    }

    // Find existing progress
    let existingProgress;
    if (vocabId) {
      existingProgress = await db.query.userProgress.findFirst({
        where: and(
          eq(schema.userProgress.userId, user.id),
          eq(schema.userProgress.vocabId, vocabId)
        ),
      });
    } else if (verbId) {
      existingProgress = await db.query.userProgress.findFirst({
        where: and(
          eq(schema.userProgress.userId, user.id),
          eq(schema.userProgress.verbId, verbId)
        ),
      });
    }

    const now = new Date();

    if (existingProgress) {
      // Update existing progress
      const updates: any = {
        updatedAt: now,
      };

      if (isKnown !== undefined) {
        updates.isKnown = isKnown;
      }

      if (wasCorrect !== undefined) {
        if (wasCorrect) {
          updates.correctCount = (existingProgress.correctCount || 0) + 1;
          updates.repetitions = (existingProgress.repetitions || 0) + 1;

          // Simple spaced repetition: increase interval
          const currentInterval = existingProgress.interval || 1;
          updates.interval = Math.min(currentInterval * 2, 365); // Max 1 year
          updates.nextReview = new Date(now.getTime() + updates.interval * 24 * 60 * 60 * 1000);
        } else {
          updates.incorrectCount = (existingProgress.incorrectCount || 0) + 1;
          // Reset interval on incorrect answer
          updates.interval = 1;
          updates.nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
        }
        updates.lastReviewed = now;
      }

      await db.update(schema.userProgress)
        .set(updates)
        .where(eq(schema.userProgress.id, existingProgress.id));

      return NextResponse.json({ success: true, updated: true });
    } else {
      // Create new progress entry
      const newProgress: any = {
        userId: user.id,
        lastReviewed: now,
        nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
        interval: 1,
        repetitions: wasCorrect ? 1 : 0,
        correctCount: wasCorrect ? 1 : 0,
        incorrectCount: wasCorrect ? 0 : 1,
        isKnown: isKnown || false,
      };

      if (vocabId) {
        newProgress.vocabId = vocabId;
      } else if (verbId) {
        newProgress.verbId = verbId;
      }

      await db.insert(schema.userProgress).values(newProgress);

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
