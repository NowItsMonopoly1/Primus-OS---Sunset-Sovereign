#!/bin/bash

# PRIMUS OS Performance Verification Script
# Run after deploying performance optimizations

echo "🚀 PRIMUS OS Performance Verification"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "\n${YELLOW}1. Checking Backend Status${NC}"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    echo "Please start the backend: cd backend && npm run dev"
    exit 1
fi

# Check database connection
echo -e "\n${YELLOW}2. Verifying Database Connection${NC}"
DB_TEST=$(psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM relationships;" 2>/dev/null | grep -o '[0-9]*')
if [ ! -z "$DB_TEST" ]; then
    echo -e "${GREEN}✅ Database connected - $DB_TEST relationships found${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please ensure PostgreSQL is running and database is set up"
    exit 1
fi

# Check performance indexes
echo -e "\n${YELLOW}3. Verifying Performance Indexes${NC}"
INDEX_COUNT=$(psql -h localhost -U postgres -d primus_os -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';" | grep -o '[0-9]*')
if [ "$INDEX_COUNT" -ge 10 ]; then
    echo -e "${GREEN}✅ Performance indexes created - $INDEX_COUNT indexes found${NC}"
else
    echo -e "${RED}❌ Missing performance indexes${NC}"
    echo "Please run: psql -U postgres -d primus_os < backend/db/migrations/001_performance_indexes.sql"
fi

# Test API performance
echo -e "\n${YELLOW}4. Testing API Performance${NC}"

# Test portfolio endpoint
PORTFOLIO_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3001/api/ledger)
if (( $(echo "$PORTFOLIO_TIME < 0.5" | bc -l) )); then
    echo -e "${GREEN}✅ Portfolio API fast - ${PORTFOLIO_TIME}s${NC}"
else
    echo -e "${YELLOW}⚠️  Portfolio API slow - ${PORTFOLIO_TIME}s (expected < 0.5s)${NC}"
fi

# Test relationship detail endpoint
RELATIONSHIP_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3001/api/ledger/rel_1)
if (( $(echo "$RELATIONSHIP_TIME < 0.3" | bc -l) )); then
    echo -e "${GREEN}✅ Relationship API fast - ${RELATIONSHIP_TIME}s${NC}"
else
    echo -e "${YELLOW}⚠️  Relationship API slow - ${RELATIONSHIP_TIME}s (expected < 0.3s)${NC}"
fi

# Check frontend bundle size
echo -e "\n${YELLOW}5. Verifying Frontend Bundle Optimization${NC}"
if [ -f "dist/assets/index-*.js" ]; then
    MAIN_BUNDLE=$(ls -lh dist/assets/index-*.js | awk '{print $5}')
    echo -e "${GREEN}✅ Main bundle optimized - ${MAIN_BUNDLE}${NC}"

    # Check if under 200KB
    BUNDLE_SIZE=$(stat -f%z dist/assets/index-*.js 2>/dev/null || stat -c%s dist/assets/index-*.js)
    if [ "$BUNDLE_SIZE" -lt 200000 ]; then
        echo -e "${GREEN}✅ Bundle size excellent (< 200KB)${NC}"
    else
        echo -e "${YELLOW}⚠️  Bundle size large - consider further optimization${NC}"
    fi
else
    echo -e "${RED}❌ Frontend not built${NC}"
    echo "Please run: npm run build"
fi

# Performance benchmarks
echo -e "\n${YELLOW}6. Performance Benchmarks${NC}"
echo "Target Metrics:"
echo "• Score Recalculation (1000 rels): < 2 seconds"
echo "• Bulk Import (1000 rels): < 15 seconds"
echo "• List Queries: < 200ms"
echo "• Bundle Size: < 200KB"

echo -e "\n${GREEN}🎉 Performance verification complete!${NC}"
echo "If all checks passed, your PRIMUS OS deployment is optimized for enterprise scale."
echo ""
echo "Next steps:"
echo "1. Monitor production performance with the included metrics"
echo "2. Set up alerting for query times > 500ms"
echo "3. Consider Redis for caching in multi-instance deployments"