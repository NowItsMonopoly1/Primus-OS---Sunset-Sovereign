/**
 * Primus OS Business Edition - Express Server (Phase 5 Complete)
 *
 * Full backend with onboarding, firm scoping, and complete repository integration
 */

import express from 'express';
import cors from 'cors';
import { createApiRouter } from './api/routes';
import { LedgerController } from './api/controllers/LedgerControllerV2';
import { GovernanceController } from './api/controllers/GovernanceControllerV2';
import { OnboardingController } from './api/controllers/OnboardingControllerV2';

// Middleware
import { demoAuthMiddleware, requireAuth, requireFirmId } from './middleware/auth';

// Domain Services
import { ContinuityScoreService } from './domain/continuity/ContinuityScoreService';
import { RationaleBuilder } from './domain/rationale/RationaleBuilder';
import { GovernanceEventService } from './domain/governance/GovernanceEventService';
import { GovernanceQueueService } from './domain/governance/GovernanceQueueService';
import { MappingEngine } from './domain/mapping/MappingEngine';

// Repositories
import { RelationshipRepository } from './infra/repositories/RelationshipRepository';
import { InteractionRepository } from './infra/repositories/InteractionRepository';
import { GovernanceRepository } from './infra/repositories/GovernanceRepository';
import { LedgerSourceRepository } from './infra/repositories/LedgerSourceRepository';
import { FieldMappingRepository } from './infra/repositories/FieldMappingRepository';

// Database
import { Database } from './infra/db/connection';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Authentication (demo stub - replace with JWT in production)
app.use(demoAuthMiddleware);

// ============================================
// INITIALIZE REPOSITORIES
// ============================================
const relationshipRepository = new RelationshipRepository();
const interactionRepository = new InteractionRepository();
const governanceRepository = new GovernanceRepository();
const ledgerSourceRepository = new LedgerSourceRepository();
const fieldMappingRepository = new FieldMappingRepository();

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
  ledgerSourceRepository,
  fieldMappingRepository,
  relationshipRepository,
  interactionRepository
);

// ============================================
// API ROUTES (all require auth + firmId)
// ============================================
app.use(
  '/api',
  requireAuth,
  requireFirmId,
  createApiRouter({
    ledgerController,
    governanceController,
    onboardingController,
  })
);

// ============================================
// HEALTH CHECK (no auth required)
// ============================================
app.get('/health', async (req, res) => {
  const dbHealthy = await Database.healthCheck();

  res.json({
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'Primus OS Backend',
    version: '1.0.0',
    database: dbHealthy ? 'connected' : 'disconnected',
    features: {
      onboarding: true,
      governance: true,
      continuityScoring: true,
      firmScoping: true,
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[UNHANDLED ERROR]', err);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await Database.close();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// START SERVER
// ============================================
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
║   Database: PostgreSQL                                    ║
║   Mode: ${process.env.NODE_ENV || 'development'}                                    ║
║   Firm Scoping: ENABLED                                   ║
║                                                           ║
║   Phase 5 Features:                                       ║
║   ✓ Onboarding (4 endpoints)                              ║
║   ✓ Ledger Management                                     ║
║   ✓ Governance Workflows                                  ║
║   ✓ Continuity Scoring                                    ║
║   ✓ Audit Trail                                           ║
║                                                           ║
║   Governance over speed.                                  ║
║   Continuity over hustle.                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Log database connection
  Database.healthCheck().then((healthy) => {
    if (healthy) {
      console.log('✓ Database connected successfully\n');
    } else {
      console.error('✗ Database connection failed\n');
    }
  });
});

export default app;
