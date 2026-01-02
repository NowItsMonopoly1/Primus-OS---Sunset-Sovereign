@echo off
REM PRIMUS OS Database Setup and Migration Script
REM Run this to set up the database for production deployment

echo 🚀 PRIMUS OS Database Setup
echo =============================

REM Check if PostgreSQL is running
echo.
echo 1. Checking PostgreSQL status...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running
    echo Please start PostgreSQL service first
    echo On Windows: net start postgresql-x64-14
    echo On Linux/Mac: brew services start postgresql
    pause
    exit /b 1
)
echo ✅ PostgreSQL is running

REM Check if database exists
echo.
echo 2. Checking database...
psql -h localhost -U postgres -l | findstr primus_os >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating primus_os database...
    createdb -h localhost -U postgres primus_os
    if %errorlevel% neq 0 (
        echo ❌ Failed to create database
        echo Make sure PostgreSQL is running and you have admin privileges
        pause
        exit /b 1
    )
    echo ✅ Database created
) else (
    echo ✅ Database exists
)

REM Apply schema
echo.
echo 3. Applying database schema...
psql -h localhost -U postgres -d primus_os -f backend/db/schema.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to apply schema
    pause
    exit /b 1
)
echo ✅ Schema applied

REM Apply seed data
echo.
echo 4. Applying seed data...
psql -h localhost -U postgres -d primus_os -f backend/db/seed.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to apply seed data
    pause
    exit /b 1
)
echo ✅ Seed data applied

REM Apply performance indexes
echo.
echo 5. Applying performance indexes...
psql -h localhost -U postgres -d primus_os -f backend/db/migrations/001_performance_indexes.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to apply performance indexes
    pause
    exit /b 1
)
echo ✅ Performance indexes applied

REM Verify setup
echo.
echo 6. Verifying setup...
psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM relationships;" > temp_count.txt 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in (temp_count.txt) do set REL_COUNT=%%i
    echo ✅ Database ready with %REL_COUNT% relationships
) else (
    echo ❌ Database verification failed
)
del temp_count.txt 2>nul

REM Check indexes
psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%%';" > temp_idx.txt 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in (temp_idx.txt) do set IDX_COUNT=%%i
    echo ✅ %IDX_COUNT% performance indexes created
) else (
    echo ❌ Index verification failed
)
del temp_idx.txt 2>nul

echo.
echo 🎉 Database setup complete!
echo Your PRIMUS OS database is ready for production with full performance optimizations.
echo.
echo Next steps:
echo 1. Configure environment variables (see configure-environment.bat)
echo 2. Start the backend: cd backend && npm start
echo 3. Start the frontend: npm run dev
echo 4. Run performance verification: ./verify-performance.bat

pause