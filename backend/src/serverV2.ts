/**
 * Primus OS Business Edition - Express Server (Database-Backed)
 *
 * Main application entry point with full repository integration
 */

import express from 'express';
import cors from 'cors';
import { createApiRouter } from './api/routes';
import { LedgerController } from './api/controllers/LedgerController';
import { GovernanceController } from './api/controllers/GovernanceController';
import { OnboardingController } from './api/controllers/OnboardingController';

// Domain Services
import { ContinuityScoreService } from './domain/continuity/ContinuityScoreService';
import { RationaleBuilder } from './domain/rationale/RationaleBuilder';
import { GovernanceEventService } from './domain/governance/GovernanceEventService';
import { GovernanceQueueService } from './domain/governance/GovernanceQueueServiceV2';
import { MappingEngine } from './domain/mapping/MappingEngine';

// Repositories
import { RelationshipRepository } from './infra/repositories/RelationshipRepository';
import { InteractionRepository } from './infra/repositories/InteractionRepository';
import { GovernanceRepository } from './infra/repositories/GovernanceRepository';

// Database
import { Database } from './infra/db/connection';

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
// TODO: Replace with real JWT authentication
app.use((req, res, next) => {
  (req as any).user = {
    id: 'user_1',
    email: 'admin@g2r.com',
    firmId: 'firm_1',
    role: 'ADMIN',
  };
  next();
});

// ============================================
// INITIALIZE REPOSITORIES
// ============================================
const relationshipRepository = new RelationshipRepository();
const interactionRepository = new InteractionRepository();
const governanceRepository = new GovernanceRepository();

// ============================================
// INITIALIZE SERVICES
// ============================================
const eventService = new GovernanceEventService(governanceRepository);
const continuityScoreService = new ContinuityScoreService();
const rationaleBuilder = new RationaleBuilder();
const governanceQueueService = new GovernanceQueueService(governanceRepository, eventService);
const mappingEngine = new MappingEngine();

// ============================================
// INITIALIZE CONTROLLERS
// ============================================
const ledgerController = new LedgerController(
  relationshipRepository,
  interactionRepository,
  governanceRepository,
  continuityScoreService,
  rationaleBuilder,
  eventService
);

const governanceController = new GovernanceController(
  governanceRepository,
  governanceQueueService
);

const onboardingController = new OnboardingController(
  mappingEngine,
  continuityScoreService,
  eventService,
  relationshipRepository,
  interactionRepository
);

// ============================================
// API ROUTES
// ============================================
app.use(
  '/api',
  createApiRouter({
    ledgerController,
    governanceController,
    onboardingController,
  })
);

// Health check
app.get('/health', async (req, res) => {
  const dbHealthy = await Database.healthCheck();

  res.json({
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'Primus OS Backend',
    database: dbHealthy ? 'connected' : 'disconnected',
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await Database.close();
  process.exit(0);
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
║   Database: PostgreSQL (connected)                        ║
║   Mode: ${process.env.NODE_ENV || 'development'}                                    ║
║                                                           ║
║   Governance over speed.                                  ║
║   Continuity over hustle.                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
