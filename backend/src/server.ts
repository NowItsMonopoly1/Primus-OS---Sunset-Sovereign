/**
 * Primus OS Business Edition - Express Server
 *
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import { createApiRouter } from './api/routes';
import { LedgerController } from './api/controllers/LedgerController';
import { GovernanceController } from './api/controllers/GovernanceController';
import { OnboardingController } from './api/controllers/OnboardingController';
import { ContinuityScoreService } from './domain/continuity/ContinuityScoreService';
import { RationaleBuilder } from './domain/rationale/RationaleBuilder';
import { GovernanceEventService } from './domain/governance/GovernanceEventService';
import { GovernanceQueueService } from './domain/governance/GovernanceQueueService';
import { MappingEngine } from './domain/mapping/MappingEngine';
import { GovernanceRepository } from './infra/repositories/GovernanceRepository';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mock authentication middleware
// TODO: Replace with real authentication
app.use((req, res, next) => {
  (req as any).user = {
    id: 'user_1',
    email: 'admin@g2r.com',
    firmId: 'firm_1',
    role: 'ADMIN',
  };
  next();
});

// Initialize services
const governanceRepository = new GovernanceRepository();
const eventService = new GovernanceEventService(governanceRepository);
const continuityScoreService = new ContinuityScoreService();
const rationaleBuilder = new RationaleBuilder();
const governanceQueueService = new GovernanceQueueService(eventService);
const mappingEngine = new MappingEngine();

// Initialize controllers
const ledgerController = new LedgerController(
  continuityScoreService,
  rationaleBuilder,
  eventService
);

const governanceController = new GovernanceController(governanceQueueService);

const onboardingController = new OnboardingController(
  mappingEngine,
  continuityScoreService,
  eventService
);

// API routes
app.use(
  '/api',
  createApiRouter({
    ledgerController,
    governanceController,
    onboardingController,
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Primus OS Backend',
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Primus OS Business Edition - Backend                   ║
║   G2R Continuity Operating System                        ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Health check: http://localhost:${PORT}/health             ║
║   API base: http://localhost:${PORT}/api                    ║
║                                                           ║
║   Governance over speed.                                  ║
║   Continuity over hustle.                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
