import type { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization middleware factory.
 * Returns middleware that checks if `req.user.role` is in the allowed roles list.
 * Must be used AFTER the `authenticate` middleware so `req.user` is populated.
 *
 * @example
 *   router.get('/admin', authenticate, authorize('Admin'), handler);
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
}
