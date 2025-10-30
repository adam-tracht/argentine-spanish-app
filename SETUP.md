# Quick Setup Guide

## Step 1: Generate NEXTAUTH_SECRET

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env.local` file:
```
NEXTAUTH_SECRET=<paste-the-output-here>
```

## Step 2: Get Neon Database URL

### Option 1: For Local Development
1. Go to https://console.neon.tech/
2. Sign up/Sign in (free)
3. Click **Create Project**
4. Name it "spanish-app"
5. Copy the connection string
6. Paste it in `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### Option 2: Via Vercel (Auto-Provisioned)
When you deploy to Vercel, it automatically creates the database. You don't need to do anything manually!

## Step 3: Get Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a Project**
   - Click project dropdown at top
   - Click "New Project"
   - Name it "Spanish Learning App"
   - Click "Create"

3. **Enable Google+ API**
   - Left sidebar → **APIs & Services** → **Library**
   - Search "Google+ API"
   - Click it and click **Enable**

4. **Configure OAuth Consent Screen**
   - **APIs & Services** → **OAuth consent screen**
   - Select **External**
   - Click **Create**
   - Fill in:
     - App name: "Spanish Learning App"
     - User support email: your email
     - Developer contact: your email
   - Click **Save and Continue** through all steps

5. **Create OAuth Credentials**
   - **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "Spanish App Web Client"
   - **Authorized redirect URIs** - Add:
     - `http://localhost:3000/api/auth/callback/google`
     - (Add production URL later: `https://your-app.vercel.app/api/auth/callback/google`)
   - Click **Create**

6. **Copy Credentials to `.env.local`**
   ```
   GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
   ```

## Step 4: Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with vocabulary, verbs, and scenarios
npm run db:seed
```

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:3000

## Your Complete `.env.local` Should Look Like:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/spanish_db?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=jP8kX9mN2vL5qR7tY3wZ6bC4dF1gH8iJ0kL2mN5oP7qR

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
```

## Troubleshooting

### "DATABASE_URL environment variable is not set"
- Make sure you added the Neon connection string to `.env.local`
- Restart your dev server after adding env variables

### "Invalid credentials" when signing in
- Double-check your Google OAuth credentials
- Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Restart your dev server

### Database connection errors
- Check that your Neon database is active (free tier can pause after inactivity)
- Verify the connection string is correct and includes `?sslmode=require` at the end

## Need Help?

Check the main [README.md](./README.md) for more detailed instructions.
