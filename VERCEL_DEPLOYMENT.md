# Vercel Deployment Guide

Your repo is live at: **https://github.com/adam-tracht/argentine-spanish-app**

Follow these steps to deploy to Vercel with Neon database integration.

## Step 1: Import Project to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/new)**
   - Sign in with GitHub (if you haven't already)

2. **Import Your Repository**
   - Click **"Add New..."** → **"Project"**
   - Find and select **`argentine-spanish-app`**
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

   ✅ **All default settings are correct - don't change anything!**

4. **Click "Deploy"** (for now - we'll add env vars after)
   - The first deployment will fail because we haven't set up the database yet
   - That's expected - we'll fix it in the next steps

## Step 2: Connect Neon Database

1. **Go to Your Vercel Project Dashboard**
   - After deployment (even if failed), you'll be in the project dashboard
   - Or go to: https://vercel.com/dashboard

2. **Navigate to Storage**
   - Click on your project **`argentine-spanish-app`**
   - Click the **"Storage"** tab in the top menu

3. **Create Postgres Database**
   - Click **"Create Database"**
   - Select **"Postgres"** (powered by Neon)
   - Choose **"Continue"**
   - Vercel will automatically:
     - Create a Neon database for you
     - Connect it to your project
     - Set the `DATABASE_URL` environment variable
   - Click **"Connect"**

   ✅ **Your database is now connected!** The `DATABASE_URL` is automatically set.

## Step 3: Add Environment Variables

1. **Go to Project Settings**
   - In your project dashboard, click **"Settings"** (top menu)
   - Click **"Environment Variables"** (left sidebar)

2. **Add These Variables** (click "Add Another" for each):

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXTAUTH_URL` | `https://your-project-name.vercel.app` | Production |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Production, Preview, Development |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | Production, Preview, Development |

   **Important Notes:**
   - Replace `your-project-name.vercel.app` with your actual Vercel URL (shown after deployment)
   - Select all three environments (Production, Preview, Development) for most variables
   - Generate a NEW `NEXTAUTH_SECRET` for production (don't reuse your local one)

## Step 4: Set Up Google OAuth for Production

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Update OAuth Redirect URIs**
   - Go to **APIs & Services** → **Credentials**
   - Click your OAuth client
   - Under **Authorized redirect URIs**, add:
     ```
     https://your-project-name.vercel.app/api/auth/callback/google
     ```
   - Replace `your-project-name.vercel.app` with your actual Vercel URL
   - Click **Save**

## Step 5: Initialize Database (Run Migrations & Seed)

You have two options:

### Option A: Run Locally (Recommended)

1. **Update your local `.env.local`**
   - Copy the `DATABASE_URL` from Vercel:
     - Vercel Project → **Settings** → **Environment Variables**
     - Copy the `DATABASE_URL` value
   - Paste it into your local `.env.local`

2. **Run the commands:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Option B: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login and link project:**
   ```bash
   vercel login
   vercel link
   ```

3. **Run commands:**
   ```bash
   vercel env pull .env.production
   npm run db:push
   npm run db:seed
   ```

## Step 6: Redeploy

1. **Trigger a New Deployment**
   - Go to Vercel dashboard → Your project
   - Click **"Deployments"** tab
   - Click the three dots (**...**) on the latest deployment
   - Click **"Redeploy"**
   - Click **"Redeploy"** in the confirmation modal

   **OR** just push a new commit to GitHub:
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push
   ```

2. **Wait for Deployment** (usually 1-2 minutes)

3. **Visit Your App!**
   - Click **"Visit"** button in Vercel
   - Or go to: `https://your-project-name.vercel.app`

## Step 7: Verify Everything Works

Test these features:

- [ ] Home page loads
- [ ] Click "Sign In" → Google OAuth works
- [ ] After sign-in, see your name in header
- [ ] Try clicking study mode cards (they'll show 404 for now - that's expected)
- [ ] Sign out works

## Troubleshooting

### Database Connection Errors
- Make sure you clicked "Connect" when creating the Neon database in Vercel
- Check that `DATABASE_URL` exists in Environment Variables
- Try redeploying after adding the database

### OAuth Errors ("redirect_uri_mismatch")
- Double-check the redirect URI in Google Cloud Console exactly matches: `https://your-project-name.vercel.app/api/auth/callback/google`
- Make sure you added `NEXTAUTH_URL` with your Vercel URL (no trailing slash)
- Redeploy after updating environment variables

### "NEXTAUTH_SECRET" Error
- Make sure you added the `NEXTAUTH_SECRET` environment variable
- Generate a new one with: `openssl rand -base64 32`
- Redeploy after adding it

### Empty Database
- Run `npm run db:push` and `npm run db:seed` (see Step 5)
- Verify the commands succeeded without errors

## Next Steps

Your app is deployed! Here's what to build next:

1. **API Routes** - Create endpoints to fetch vocab, verbs, scenarios
2. **Flashcards Page** - Build the first study mode
3. **Quiz Page** - Add multiple choice practice
4. **Verb Table** - Display conjugations
5. **Scenarios Page** - Interactive conversations
6. **Dashboard** - Progress tracking

Every time you push to GitHub, Vercel will automatically deploy your changes!

## Environment Variables Summary

Here's what each variable does:

- **DATABASE_URL** - Postgres connection string (auto-set by Vercel)
- **NEXTAUTH_URL** - Your production URL for NextAuth redirects
- **NEXTAUTH_SECRET** - Secret key for encrypting session tokens
- **GOOGLE_CLIENT_ID** - Google OAuth app identifier
- **GOOGLE_CLIENT_SECRET** - Google OAuth app secret key

## Useful Commands

```bash
# View deployment logs
vercel logs

# List your projects
vercel list

# Open project in browser
vercel open

# Pull environment variables
vercel env pull

# Check deployment status
vercel inspect <deployment-url>
```

## Your Live URLs

- **Production**: https://your-project-name.vercel.app
- **GitHub Repo**: https://github.com/adam-tracht/argentine-spanish-app
- **Vercel Dashboard**: https://vercel.com/adam-tracht/argentine-spanish-app

---

**Questions?** Check the main [README.md](./README.md) or [SETUP.md](./SETUP.md)
