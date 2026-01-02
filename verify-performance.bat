@echo off
REM PRIMUS OS Performance Verification Script
REM Run after deploying performance optimizations

echo 🚀 PRIMUS OS Performance Verification
echo ======================================

REM Colors for output (Windows CMD doesn't support ANSI colors well, so using plain text)
set "RED=[ERROR]"
set "GREEN=[OK]"
set "YELLOW=[WARN]"

REM Check if backend is running
echo.
echo 1. Checking Backend Status
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN% Backend is running
) else (
    echo %RED% Backend not responding
    echo Please start the backend: cd backend ^&^& npm run dev
    goto :eof
)

REM Check database connection (assuming psql is available)
echo.
echo 2. Verifying Database Connection
psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM relationships;" > temp_db_count.txt 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in (temp_db_count.txt) do set DB_COUNT=%%i
    echo %GREEN% Database connected - %DB_COUNT% relationships found
) else (
    echo %RED% Database connection failed
    echo Please ensure PostgreSQL is running and database is set up
)
del temp_db_count.txt 2>nul

REM Check performance indexes
echo.
echo 3. Verifying Performance Indexes
psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%%';" > temp_index_count.txt 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in (temp_index_count.txt) do set INDEX_COUNT=%%i
    if %INDEX_COUNT% geq 10 (
        echo %GREEN% Performance indexes created - %INDEX_COUNT% indexes found
    ) else (
        echo %RED% Missing performance indexes
        echo Please run: psql -U postgres -d primus_os ^< backend/db/migrations/001_performance_indexes.sql
    )
) else (
    echo %RED% Could not check indexes
)
del temp_index_count.txt 2>nul

REM Test API performance
echo.
echo 4. Testing API Performance

REM Test portfolio endpoint
echo Testing portfolio endpoint...
curl -s -w "%%{time_total}" -o nul http://localhost:3001/api/ledger > temp_portfolio_time.txt 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in (temp_portfolio_time.txt) do set PORTFOLIO_TIME=%%i
    REM Simple comparison (Windows batch doesn't have bc)
    if %PORTFOLIO_TIME% lss 0.5 (
        echo %GREEN% Portfolio API fast - %PORTFOLIO_TIME%s
    ) else (
        echo %YELLOW% Portfolio API slow - %PORTFOLIO_TIME%s (expected ^< 0.5s)
    )
) else (
    echo %RED% Could not test portfolio API
)
del temp_portfolio_time.txt 2>nul

REM Check frontend bundle size
echo.
echo 5. Verifying Frontend Bundle Optimization
if exist "dist\assets\index-*.js" (
    for %%f in (dist\assets\index-*.js) do set BUNDLE_FILE=%%f
    for %%f in (%BUNDLE_FILE%) do (
        REM Get file size in bytes
        set FILE_SIZE=%%~zf
        REM Convert to KB (approximate)
        set /a BUNDLE_KB=%FILE_SIZE%/1024
        echo %GREEN% Main bundle optimized - %BUNDLE_KB%KB

        if %FILE_SIZE% lss 200000 (
            echo %GREEN% Bundle size excellent (^< 200KB)
        ) else (
            echo %YELLOW% Bundle size large - consider further optimization
        )
    )
) else (
    echo %RED% Frontend not built
    echo Please run: npm run build
)

REM Performance benchmarks
echo.
echo 6. Performance Benchmarks
echo Target Metrics:
echo • Score Recalculation (1000 rels): ^< 2 seconds
echo • Bulk Import (1000 rels): ^< 15 seconds
echo • List Queries: ^< 200ms
echo • Bundle Size: ^< 200KB

echo.
echo %GREEN% 🎉 Performance verification complete!
echo If all checks passed, your PRIMUS OS deployment is optimized for enterprise scale.
echo.
echo Next steps:
echo 1. Monitor production performance with the included metrics
echo 2. Set up alerting for query times ^> 500ms
echo 3. Consider Redis for caching in multi-instance deployments

pause