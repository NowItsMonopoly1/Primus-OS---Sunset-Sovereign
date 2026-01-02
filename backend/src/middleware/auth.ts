/**
 * Primus OS Business Edition - Authentication Middleware
 *
 * Firm-scoped request user stub (replace with real JWT later)
 */

import { Request, Response, NextFunction } from 'express';

export interface RequestUser {
  id: string;
  email: string;
  firmId: string;
  role: 'ADMIN' | 'USER';
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

/**
 * Demo authentication middleware
 * TODO: Replace with real JWT validation in production
 */
export function demoAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Stub user for development
  // In production, this would validate JWT and extract user from token
  req.user = {
    id: 'user_1',
    email: 'admin@g2r.com',
    firmId: 'firm_1', // All queries scoped to this firm
    role: 'ADMIN',
  };

  next();
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  next();
}

/**
 * Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Ensure firmId is present (used by all repositories)
 */
export function requireFirmId(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.firmId) {
    res.status(400).json({ error: 'Firm context required' });
    return;
  }

  next();
}
