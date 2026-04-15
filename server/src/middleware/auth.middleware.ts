import type { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../auth/jwt.service';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    return;
  }
  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, error: 'Invalid or expired token.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}
