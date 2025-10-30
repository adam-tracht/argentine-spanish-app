# Argentine Spanish Learning App 🇦🇷

An interactive web application for learning Argentine Spanish, with a focus on dating, socializing, and Gen-Z slang. Features flashcards, quizzes, conversation scenarios, and spaced repetition learning.

## Features

- **🃏 Flashcards**: Swipeable cards with spaced repetition algorithm
- **✅ Multiple Choice Quizzes**: Test your knowledge with instant feedback
- **📝 Fill-in-the-Blank**: Practice sentence completion
- **💬 Conversation Scenarios**: Interactive dialogues for real-world situations (bars, dating, directions, etc.)
- **📚 Verb Conjugation Tables**: Searchable database of 45+ verbs with voseo forms
- **📊 Progress Tracking**: Monitor your learning with stats and streaks
- **🎯 Custom Vocabulary**: Add your own words and phrases

## Content Included

- **Voseo conjugations** (Argentina's "vos" instead of "tú")
- **Dating & social phrases** for bars and nightlife
- **Gen-Z/Millennial slang** (boludo, re, zarpado, flashear, manija, etc.)
- **Cultural context** (la previa, mate culture, porteño expressions)
- **150+ vocabulary entries** with tags and difficulty levels
- **10+ conversation scenarios** for common situations
- **45+ verbs** with full conjugation tables

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Vercel account (for deployment)
- A Neon database (will be auto-provisioned by Vercel)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spanish-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.local` and fill in your values:
   ```bash
   # Database (will be auto-filled by Vercel when you connect Neon)
   DATABASE_URL=your_neon_database_url

   # NextAuth (generate secret with: openssl rand -base64 32)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_generated_secret

   # Google OAuth (get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   Generate a secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   Push the schema to your database:
   ```bash
   npm run db:push
   ```

5. **Seed the database**

   Populate with vocabulary, verbs, and scenarios:
   ```bash
   npm run db:seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Deployment to Vercel

### Quick Deploy

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Connect Neon Database**
   - In Vercel project settings, go to "Storage"
   - Click "Create Database" → Choose "Neon"
   - Vercel will automatically provision a Neon Postgres database
   - The `DATABASE_URL` environment variable will be auto-filled

4. **Add Environment Variables**
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<generate-a-new-secret>
   GOOGLE_CLIENT_ID=<your-google-oauth-id>
   GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
   ```

5. **Run Database Migrations**

   After deployment, run these commands locally or in Vercel:
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Visit your deployed app!**

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
   - Left sidebar → **APIs & Services** → **Library**
   - Search "Google+ API" → Enable
4. Configure OAuth consent screen
   - **APIs & Services** → **OAuth consent screen**
   - Select **External** → Create
   - Fill in app name and your email → Save
5. Create OAuth credentials
   - **APIs & Services** → **Credentials**
   - **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Add redirect URIs:
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local` or Vercel environment variables

## Database Scripts

```bash
# Generate migration files
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Seed the database with initial data
npm run db:seed

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Project Structure

```
spanish-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   │   └── auth/           # NextAuth endpoints
│   │   ├── study/              # Study mode pages
│   │   │   ├── flashcards/
│   │   │   ├── quiz/
│   │   │   ├── fill-blank/
│   │   │   └── scenarios/
│   │   ├── verbs/              # Verb conjugation table
│   │   ├── dashboard/          # Progress dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   ├── db.ts               # Database connection
│   │   └── auth.ts             # Auth configuration
│   └── data/                   # Seed data (JSON)
├── drizzle/
│   ├── schema.ts               # Database schema
│   └── migrations/             # Migration files
├── scripts/
│   └── seed.ts                 # Database seeding script
├── drizzle.config.ts           # Drizzle configuration
└── package.json
```

## Adding Custom Content

### Adding Vocabulary

Edit `src/data/augmented-dating-vocab.json` or create a new JSON file:

```json
{
  "spanish": "tu palabra",
  "english": "your word",
  "category": "dating",
  "difficulty": "intermediate",
  "tags": ["slang", "casual"],
  "context": "Used when..."
}
```

Then run `npm run db:seed` again.

### Adding Conversation Scenarios

Edit `src/data/conversation-scenarios.json`:

```json
{
  "title": "Your Scenario Title",
  "description": "What this scenario teaches",
  "category": "dating",
  "difficulty": "intermediate",
  "tags": ["bar", "flirt"],
  "dialog": [
    {
      "speaker": "you",
      "spanish": "Hola",
      "english": "Hi",
      "options": ["Option 1", "Option 2"]
    }
  ]
}
```

## Contributing

Feel free to add more vocabulary, scenarios, or improve the learning algorithms!

## License

MIT

## Acknowledgments

- Vocabulary and verb conjugations sourced from Argentine Spanish tutoring sessions
- Built for learning the voseo dialect used in Buenos Aires
