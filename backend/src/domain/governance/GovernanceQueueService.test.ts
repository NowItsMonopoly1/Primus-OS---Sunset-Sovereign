/**
 * Primus OS Business Edition - Governance Queue Service Tests
 *
 * Unit tests for state machine transitions and validation
 */

import { GovernanceQueueService } from './GovernanceQueueService';
import { GovernanceEventService } from './GovernanceEventService';
import { GovernanceRepository } from '../../infra/repositories/GovernanceRepository';
import { GovernanceBatch, OutreachDraft } from '../../types';

// Mock repositories
const mockGovernanceRepo = {
  findBatchById: jest.fn(),
  findDraftById: jest.fn(),
  insertBatch: jest.fn(),
  insertDraft: jest.fn(),
  updateBatchStatus: jest.fn(),
  updateDraftBatch: jest.fn(),
  updateDraftsInBatch: jest.fn(),
  findBatchesByFirm: jest.fn(),
  findDraftsByBatch: jest.fn(),
  insertEvent: jest.fn(),
  findEventsByEntity: jest.fn(),
  findEventsByFirm: jest.fn(),
} as unknown as GovernanceRepository;

const mockEventService = {
  record: jest.fn(),
} as unknown as GovernanceEventService;

describe('GovernanceQueueService', () => {
  let service: GovernanceQueueService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GovernanceQueueService(mockGovernanceRepo, mockEventService);
  });

  describe('State Transition Validation', () => {
    it('should allow adding PREPARED draft to OPEN batch', async () => {
      const mockDraft = createMockDraft('draft_1', 'PREPARED');
      const mockBatch = createMockBatch('batch_1', 'OPEN');

      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(mockDraft);
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);
      (mockGovernanceRepo.updateDraftBatch as jest.Mock).mockResolvedValue(undefined);

      await service.addDraftToBatch({
        draftId: 'draft_1',
        batchId: 'batch_1',
        actorId: 'user_1',
        firmId: 'firm_1',
      });

      expect(mockGovernanceRepo.updateDraftBatch).toHaveBeenCalledWith(
        'draft_1',
        'batch_1',
        'IN_BATCH'
      );
    });

    it('should reject adding non-PREPARED draft to batch', async () => {
      const mockDraft = createMockDraft('draft_1', 'APPROVED'); // Wrong state
      const mockBatch = createMockBatch('batch_1', 'OPEN');

      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(mockDraft);
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await expect(
        service.addDraftToBatch({
          draftId: 'draft_1',
          batchId: 'batch_1',
          actorId: 'user_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Draft must be in PREPARED state');
    });

    it('should reject adding draft to non-OPEN batch', async () => {
      const mockDraft = createMockDraft('draft_1', 'PREPARED');
      const mockBatch = createMockBatch('batch_1', 'APPROVED'); // Wrong state

      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(mockDraft);
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await expect(
        service.addDraftToBatch({
          draftId: 'draft_1',
          batchId: 'batch_1',
          actorId: 'user_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Batch must be OPEN');
    });

    it('should allow approving OPEN batch', async () => {
      const mockBatch = createMockBatch('batch_1', 'OPEN');

      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);
      (mockGovernanceRepo.updateBatchStatus as jest.Mock).mockResolvedValue(undefined);
      (mockGovernanceRepo.updateDraftsInBatch as jest.Mock).mockResolvedValue(undefined);

      await service.approveBatch({
        batchId: 'batch_1',
        actorId: 'admin_1',
        firmId: 'firm_1',
      });

      expect(mockGovernanceRepo.updateBatchStatus).toHaveBeenCalledWith(
        'batch_1',
        'APPROVED',
        'admin_1'
      );
    });

    it('should allow approving UNDER_REVIEW batch', async () => {
      const mockBatch = createMockBatch('batch_1', 'UNDER_REVIEW');

      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);
      (mockGovernanceRepo.updateBatchStatus as jest.Mock).mockResolvedValue(undefined);
      (mockGovernanceRepo.updateDraftsInBatch as jest.Mock).mockResolvedValue(undefined);

      await service.approveBatch({
        batchId: 'batch_1',
        actorId: 'admin_1',
        firmId: 'firm_1',
      });

      expect(mockGovernanceRepo.updateBatchStatus).toHaveBeenCalledWith(
        'batch_1',
        'APPROVED',
        'admin_1'
      );
    });

    it('should reject approving EXECUTED batch', async () => {
      const mockBatch = createMockBatch('batch_1', 'EXECUTED');

      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await expect(
        service.approveBatch({
          batchId: 'batch_1',
          actorId: 'admin_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Batch must be OPEN or UNDER_REVIEW');
    });

    it('should only allow executing APPROVED batch', async () => {
      const mockBatch = createMockBatch('batch_1', 'APPROVED');

      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);
      (mockGovernanceRepo.updateBatchStatus as jest.Mock).mockResolvedValue(undefined);
      (mockGovernanceRepo.updateDraftsInBatch as jest.Mock).mockResolvedValue(undefined);

      await service.executeBatch({
        batchId: 'batch_1',
        actorId: 'admin_1',
        firmId: 'firm_1',
      });

      expect(mockGovernanceRepo.updateBatchStatus).toHaveBeenCalledWith('batch_1', 'EXECUTED');
    });

    it('should reject executing non-APPROVED batch', async () => {
      const mockBatch = createMockBatch('batch_1', 'OPEN');

      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await expect(
        service.executeBatch({
          batchId: 'batch_1',
          actorId: 'admin_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Only APPROVED batches can be executed');
    });
  });

  describe('Governance Events', () => {
    it('should record event when batch created', async () => {
      const mockBatch = createMockBatch('batch_1', 'OPEN');
      (mockGovernanceRepo.insertBatch as jest.Mock).mockResolvedValue(mockBatch);

      await service.createBatch({
        firmId: 'firm_1',
        label: 'Test Batch',
        createdBy: 'user_1',
      });

      expect(mockEventService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'BATCH_CREATED',
          entityType: 'BATCH',
        })
      );
    });

    it('should record event when draft added to batch', async () => {
      const mockDraft = createMockDraft('draft_1', 'PREPARED');
      const mockBatch = createMockBatch('batch_1', 'OPEN');

      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(mockDraft);
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await service.addDraftToBatch({
        draftId: 'draft_1',
        batchId: 'batch_1',
        actorId: 'user_1',
        firmId: 'firm_1',
      });

      expect(mockEventService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'DRAFT_ADDED_TO_BATCH',
          entityType: 'OUTREACH_DRAFT',
        })
      );
    });

    it('should record event when batch approved', async () => {
      const mockBatch = createMockBatch('batch_1', 'OPEN');
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(mockBatch);

      await service.approveBatch({
        batchId: 'batch_1',
        actorId: 'admin_1',
        firmId: 'firm_1',
      });

      expect(mockEventService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'BATCH_APPROVED',
          entityType: 'BATCH',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent draft', async () => {
      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addDraftToBatch({
          draftId: 'invalid',
          batchId: 'batch_1',
          actorId: 'user_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Draft not found');
    });

    it('should throw error for non-existent batch', async () => {
      const mockDraft = createMockDraft('draft_1', 'PREPARED');
      (mockGovernanceRepo.findDraftById as jest.Mock).mockResolvedValue(mockDraft);
      (mockGovernanceRepo.findBatchById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addDraftToBatch({
          draftId: 'draft_1',
          batchId: 'invalid',
          actorId: 'user_1',
          firmId: 'firm_1',
        })
      ).rejects.toThrow('Batch not found');
    });
  });
});

// Helper functions

function createMockBatch(id: string, status: any): GovernanceBatch {
  return {
    id,
    firmId: 'firm_1',
    label: 'Test Batch',
    status,
    createdBy: 'user_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockDraft(id: string, status: any): OutreachDraft {
  return {
    id,
    relationshipId: 'rel_1',
    firmId: 'firm_1',
    subject: 'Test',
    body: 'Test body',
    status,
    preparedBy: 'user_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
