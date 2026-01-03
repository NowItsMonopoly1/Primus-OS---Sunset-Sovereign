import { Router, Request, Response } from 'express';
import { LaunchAgentClient } from '../../services/LaunchAgentClient';

const router = Router();

/**
 * Launch Agent Routes
 * Provides endpoints for automated continuity audits, security scans, and risk assessments
 */

/**
 * POST /api/launch-agent/continuity-audit
 * Run automated continuity audit for a firm
 */
router.post('/continuity-audit', async (req: Request, res: Response) => {
  try {
    const { firmId } = req.body;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        error: 'firmId is required'
      });
    }

    const launchAgent = req.app.locals.launchAgent as LaunchAgentClient;
    
    if (!launchAgent || !launchAgent.getAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'Launch Agent service is not available'
      });
    }

    const result = await launchAgent.runContinuityAudit(firmId);

    res.json({
      success: true,
      audit: result
    });
  } catch (error) {
    console.error('Continuity audit failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/launch-agent/security-scan
 * Run automated security scan for a firm
 */
router.post('/security-scan', async (req: Request, res: Response) => {
  try {
    const { firmId } = req.body;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        error: 'firmId is required'
      });
    }

    const launchAgent = req.app.locals.launchAgent as LaunchAgentClient;
    
    if (!launchAgent || !launchAgent.getAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'Launch Agent service is not available'
      });
    }

    const result = await launchAgent.runSecurityScan(firmId);

    res.json({
      success: true,
      scan: result
    });
  } catch (error) {
    console.error('Security scan failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/launch-agent/risk-assessment
 * Get comprehensive risk assessment (continuity + security)
 */
router.post('/risk-assessment', async (req: Request, res: Response) => {
  try {
    const { firmId } = req.body;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        error: 'firmId is required'
      });
    }

    const launchAgent = req.app.locals.launchAgent as LaunchAgentClient;
    
    if (!launchAgent || !launchAgent.getAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'Launch Agent service is not available'
      });
    }

    const assessment = await launchAgent.getComprehensiveRiskAssessment(firmId);

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Risk assessment failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/launch-agent/adapters
 * Get list of available Launch Agent adapters
 */
router.get('/adapters', async (req: Request, res: Response) => {
  try {
    const launchAgent = req.app.locals.launchAgent as LaunchAgentClient;
    
    if (!launchAgent || !launchAgent.getAvailability()) {
      return res.json({
        success: true,
        adapters: [],
        available: false
      });
    }

    const adapters = await launchAgent.getAdapters();

    res.json({
      success: true,
      adapters,
      available: true
    });
  } catch (error) {
    console.error('Failed to fetch adapters:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/launch-agent/status
 * Check Launch Agent service status
 */
router.get('/status', (req: Request, res: Response) => {
  const launchAgent = req.app.locals.launchAgent as LaunchAgentClient;
  
  const available = launchAgent && launchAgent.getAvailability();

  res.json({
    success: true,
    status: available ? 'online' : 'offline',
    available,
    timestamp: new Date().toISOString()
  });
});

export default router;
