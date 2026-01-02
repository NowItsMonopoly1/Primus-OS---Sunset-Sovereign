<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/102ZSFmvnUJbrWEtJAIjn4vRdEqmF0EcC

## Run Locally

**Prerequisites:** Node.js, Supabase account (for real-time features)

1. Install dependencies:
   `npm install`

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key: `GEMINI_API_KEY=your_key_here`
   - For Supabase (optional but recommended): Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. Run the app:
   `npm run dev`

## Supabase Setup (Hybrid Real-Time Database)

PRIMUS OS uses a **hybrid database approach** combining efficient API queries with real-time Supabase subscriptions for the ultimate user experience.

### Quick Setup

1. **Create Supabase Project:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and create project
   supabase login
   supabase projects create "primus-os-continuity"
   ```

2. **Run Database Migrations:**
   ```bash
   # Link to your project
   supabase link --project-ref your-project-ref

   # Apply schema
   psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f backend/db/schema.sql

   # Seed data
   psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f backend/db/seed.sql
   ```

3. **Configure Environment:**
   ```bash
   # Frontend (.env.local)
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Backend (backend/.env)
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

4. **Enable Real-Time:**
   - Go to Supabase Dashboard → Database → Replication
   - Enable real-time for: `relationships`, `interactions`, `continuity_snapshots`

### Features Unlocked

✅ **Static Fast Loading:** Relationships load instantly via optimized API queries  
✅ **Real-Time Updates:** Continuity scores update live without refresh  
✅ **Push Notifications:** New interactions appear immediately  
✅ **Enterprise Scale:** Handles 10K+ relationships efficiently  

### Without Supabase

The app works perfectly with mock data - just skip the Supabase setup. Real-time features will be disabled but all core functionality remains intact.
