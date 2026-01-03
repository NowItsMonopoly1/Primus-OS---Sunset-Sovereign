# Launch Agent Integration Guide

## Overview
Launch Agent is a governance-first automation platform that provides:
- **Continuity Audits**: Automated relationship health assessments
- **Security Scans**: Vulnerability detection and compliance checks
- **Risk Assessments**: Comprehensive risk analysis (continuity + security)

## Prerequisites

1. **Deploy Launch Agent Service**
   ```bash
   # Clone the repository
   git clone https://github.com/NowItsMonopoly1/launch-agent.git
   cd launch-agent
   
   # Install dependencies
   pip install -r requirements.txt
   pip install -r requirements-api.txt
   
   # Start the API server
   python api/server.py
   # Server runs on http://localhost:8001
   ```

2. **Configure Environment Variables**
   Add to your `.env` file (root and `backend/.env`):
   ```env
   LAUNCH_AGENT_URL=http://localhost:8001
   LAUNCH_AGENT_API_KEY=your-api-key-here
   ```

## Architecture

```
Primus OS Frontend (React)
    ↓ API calls via src/services/api.ts
Primus OS Backend (Express)
    ↓ LaunchAgentClient (backend/src/services/LaunchAgentClient.ts)
Launch Agent Service (Python/FastAPI)
    ↓ Adapters (continuity, security, etc.)
```

## Features Integrated

### 1. Continuity Audit Button
Located in **Continuity Signals Page** (`/signals`)
- Click "Run Audit" to trigger automated continuity analysis
- Generates signals for:
  - Contact gaps
  - Engagement drift
  - Life-stage transitions
  - Succession gaps

### 2. Risk Assessment Button
Located in **Continuity Signals Page** (`/signals`)
- Click "Risk Assessment" for comprehensive analysis
- Combines continuity + security data
- Provides executive summary

### 3. Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/launch-agent/continuity-audit` | POST | Run continuity audit |
| `/api/launch-agent/security-scan` | POST | Run security scan |
| `/api/launch-agent/risk-assessment` | POST | Get comprehensive risk assessment |
| `/api/launch-agent/adapters` | GET | List available adapters |
| `/api/launch-agent/status` | GET | Check service status |

## Usage Examples

### Frontend (React)
```typescript
import api from '../services/api';

// Run continuity audit
const result = await api.runContinuityAudit('firm_1');

// Get risk assessment
const assessment = await api.getRiskAssessment('firm_1');
```

### Backend (Express)
```typescript
import { createLaunchAgentClient } from './services/LaunchAgentClient';

const launchAgent = createLaunchAgentClient();

// Run audit
const result = await launchAgent.runContinuityAudit('firm_1');

// Get comprehensive assessment
const assessment = await launchAgent.getComprehensiveRiskAssessment('firm_1');
```

### Direct API (curl)
```bash
# Run continuity audit
curl -X POST "http://localhost:3001/api/launch-agent/continuity-audit" \
  -H "Content-Type: application/json" \
  -d '{"firmId": "firm_1"}'

# Get risk assessment
curl -X POST "http://localhost:3001/api/launch-agent/risk-assessment" \
  -H "Content-Type: application/json" \
  -d '{"firmId": "firm_1"}'

# Check status
curl "http://localhost:3001/api/launch-agent/status"
```

## Monitoring

### Health Check
The Launch Agent status is included in the backend health check:
```bash
curl http://localhost:3001/health
```

Response includes:
```json
{
  "status": "healthy",
  "database": "connected",
  "launchAgent": "online"
}
```

### UI Indicators
- **Green "Run Audit" button**: Launch Agent is online
- **Gray "Launch Agent Offline"**: Service unavailable

## Troubleshooting

### Issue: Launch Agent Offline
**Cause**: Service not running or misconfigured URL

**Solution**:
1. Verify Launch Agent is running: `curl http://localhost:8001/health`
2. Check `LAUNCH_AGENT_URL` in `.env`
3. Review backend logs for connection errors

### Issue: Audit Button Disabled
**Cause**: Launch Agent service unavailable

**Solution**:
1. Start Launch Agent: `python api/server.py`
2. Refresh the Primus OS frontend

### Issue: "Service Not Available" Error
**Cause**: Missing environment variables

**Solution**:
1. Add `LAUNCH_AGENT_URL` to backend `.env`
2. Restart backend: `npm run dev`

## Production Deployment

### Option 1: Docker Compose
```yaml
services:
  primus-backend:
    build: ./backend
    environment:
      - LAUNCH_AGENT_URL=http://launch-agent:8001
  
  launch-agent:
    build: ./launch-agent
    ports:
      - "8001:8001"
```

### Option 2: Separate Server
1. Deploy Launch Agent to separate server/container
2. Update `LAUNCH_AGENT_URL` to point to production URL
3. Configure API key authentication

## Security

- **API Key**: Set `LAUNCH_AGENT_API_KEY` for authentication
- **Network**: Deploy Launch Agent on private network if possible
- **Rate Limiting**: Launch Agent has built-in rate limiting
- **Audit Logs**: All executions logged in Launch Agent

## Files Modified

### Backend
- ✅ `backend/src/services/LaunchAgentClient.ts` - Client service
- ✅ `backend/src/api/routes/launchAgentRoutes.ts` - API routes
- ✅ `backend/src/serverV2.ts` - Integration initialization

### Frontend
- ✅ `src/services/api.ts` - API client methods
- ✅ `src/pages/ContinuitySignalsPage.tsx` - UI buttons and handlers

### Configuration
- ✅ `.env.example` - Environment variable documentation
- ✅ `LAUNCH_AGENT_INTEGRATION.md` - This guide

## Next Steps

1. ✅ Deploy Launch Agent service
2. ✅ Configure environment variables
3. ✅ Test integration via Continuity Signals page
4. 📋 Configure scheduled audits (optional)
5. 📋 Set up monitoring and alerts (optional)

## Support

For Launch Agent issues:
- Repository: https://github.com/NowItsMonopoly1/launch-agent
- Docs: See Launch Agent README.md
- Doctrine: See Launch Agent DOCTRINE.md

For Primus OS integration issues:
- Check backend logs: `npm run dev` output
- Review frontend console for errors
- Test endpoints with curl/Postman
