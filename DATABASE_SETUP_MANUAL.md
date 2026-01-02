# PRIMUS OS Database Setup (Manual)

Since PostgreSQL command-line tools aren't in your PATH, here are the manual steps:

## 1. Install PostgreSQL (if not already installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install PostgreSQL 14+ with pgAdmin
- Note the installation directory (usually `C:\Program Files\PostgreSQL\14\bin`)

**Or use Docker:**
```bash
docker run --name primus-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

## 2. Set up Database

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `primus_os`
5. Owner: `postgres`

**Using Command Line (if PostgreSQL bin is in PATH):**
```bash
createdb -h localhost -U postgres primus_os
```

**Or navigate to PostgreSQL bin directory:**
```cmd
cd "C:\Program Files\PostgreSQL\14\bin"
createdb -h localhost -U postgres primus_os
```

## 3. Apply Schema and Migrations

**Using pgAdmin:**
1. Right-click `primus_os` database → Query Tool
2. Open and run: `backend/db/schema.sql`
3. Open and run: `backend/db/seed.sql`
4. Open and run: `backend/db/migrations/001_performance_indexes.sql`

**Using Command Line:**
```bash
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\14\bin"

# Apply schema
psql -h localhost -U postgres -d primus_os -f "C:\Users\Donte\Downloads\the-sunset-protocol---legacy-monetization\backend\db\schema.sql"

# Apply seed data
psql -h localhost -U postgres -d primus_os -f "C:\Users\Donte\Downloads\the-sunset-protocol---legacy-monetization\backend\db\seed.sql"

# Apply performance indexes
psql -h localhost -U postgres -d primus_os -f "C:\Users\Donte\Downloads\the-sunset-protocol---legacy-monetization\backend\db\migrations\001_performance_indexes.sql"
```

## 4. Verify Setup

**Check database contents:**
```sql
-- Connect to primus_os database and run:
SELECT COUNT(*) FROM relationships;
SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%%';
```

**Expected results:**
- Relationships count: Should show number of seeded relationships
- Index count: Should show 14+ performance indexes

## 5. Environment Configuration

Create `.env` files as described in the production guide:

**Main .env:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/primus_os
```

**backend/.env:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/primus_os
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Start Application

```bash
# Start backend
cd backend
npm start

# In another terminal, start frontend
npm run dev
```

## 7. Verify Deployment

Run the performance verification:
```bash
./verify-performance.bat
```

This should show all checks passing with your optimized PRIMUS OS system!