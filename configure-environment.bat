@echo off
REM PRIMUS OS Environment Configuration Script
REM Sets up environment variables for production deployment

echo 🔧 PRIMUS OS Environment Configuration
echo ======================================

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # PRIMUS OS Production Environment Variables
        echo.
        echo # Database Configuration
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/primus_os
        echo.
        echo # Supabase Configuration (Required for production)
        echo SUPABASE_URL=https://your-project.supabase.co
        echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=production
        echo.
        echo # Security
        echo JWT_SECRET=your-secure-jwt-secret-here
        echo.
        echo # Performance
        echo CACHE_TTL=3600
        echo MAX_BATCH_SIZE=1000
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend/.env file...
    (
        echo # PRIMUS OS Backend Environment Variables
        echo.
        echo # Database
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/primus_os
        echo.
        echo # Supabase (Required)
        echo SUPABASE_URL=https://your-project.supabase.co
        echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
        echo.
        echo # Server
        echo PORT=3001
        echo NODE_ENV=production
        echo.
        echo # Performance
        echo CACHE_TTL=3600
        echo MAX_BATCH_SIZE=1000
    ) > backend\.env
    echo ✅ backend/.env file created
) else (
    echo ✅ backend/.env file already exists
)

echo.
echo ⚠️  IMPORTANT: Update the following values in your .env files:
echo.
echo 1. SUPABASE_URL: Your Supabase project URL
echo    Format: https://your-project-id.supabase.co
echo.
echo 2. SUPABASE_SERVICE_ROLE_KEY: Your service role key
echo    Get this from: Supabase Dashboard → Settings → API → service_role key
echo.
echo 3. DATABASE_URL: Update password if different from 'password'
echo.
echo 4. JWT_SECRET: Generate a secure random string
echo.
echo 📝 Instructions:
echo 1. Go to https://supabase.com/dashboard
echo 2. Select your project (or create one)
echo 3. Go to Settings → API
echo 4. Copy the Project URL and service_role key
echo 5. Update the .env files with these values
echo.
echo 🔍 To verify configuration:
echo - Run: ./verify-performance.bat
echo - Check that backend starts without Supabase warnings
echo.
echo Ready for production deployment! 🚀

pause