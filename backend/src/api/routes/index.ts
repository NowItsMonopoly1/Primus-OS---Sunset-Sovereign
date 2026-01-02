/**
 * Primus OS Business Edition - API Routes
 *
 * Main router configuration
 */

import { Router } from 'express';
import { LedgerController } from '../controllers/LedgerController';
import { GovernanceController } from '../controllers/GovernanceController';
import { OnboardingController } from '../controllers/OnboardingController';

export function createApiRouter(params: {
  ledgerController: LedgerController;
  governanceController: GovernanceController;
  onboardingController: OnboardingController;
}): Router {
  const router = Router();

  // Ledger routes
  router.get('/ledger', params.ledgerController.listPortfolio.bind(params.ledgerController));
  router.get('/ledger/:id', params.ledgerController.getRelationship.bind(params.ledgerController));
  router.post('/ledger/:id/drafts', params.ledgerController.createDraft.bind(params.ledgerController));
  router.post(
    '/ledger/:id/record-interaction',
    params.ledgerController.recordInteraction.bind(params.ledgerController)
  );
  router.post(
    '/ledger/recalculate-scores',
    params.ledgerController.recalculateScores.bind(params.ledgerController)
  );

  // Governance routes
  router.get(
    '/governance/batches',
    params.governanceController.listBatches.bind(params.governanceController)
  );
  router.post(
    '/governance/batches',
    params.governanceController.createBatch.bind(params.governanceController)
  );
  router.get(
    '/governance/batches/:id',
    params.governanceController.getBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/add-draft',
    params.governanceController.addDraftToBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/remove-draft',
    params.governanceController.removeDraftFromBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/submit',
    params.governanceController.submitForReview.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/approve',
    params.governanceController.approveBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/reject',
    params.governanceController.rejectBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/execute',
    params.governanceController.executeBatch.bind(params.governanceController)
  );
  router.post(
    '/governance/batches/:id/archive',
    params.governanceController.archiveBatch.bind(params.governanceController)
  );

  // Onboarding routes
  router.get(
    '/onboarding/ledger-sources',
    params.onboardingController.getLedgerSources.bind(params.onboardingController)
  );
  router.post(
    '/onboarding/ledger-sources',
    params.onboardingController.createLedgerSource.bind(params.onboardingController)
  );
  router.post(
    '/onboarding/preview-fields',
    params.onboardingController.previewFields.bind(params.onboardingController)
  );
  router.post(
    '/onboarding/approve-fields',
    params.onboardingController.approveFields.bind(params.onboardingController)
  );
  router.post(
    '/onboarding/run-assessment',
    params.onboardingController.runAssessment.bind(params.onboardingController)
  );

  return router;
}
