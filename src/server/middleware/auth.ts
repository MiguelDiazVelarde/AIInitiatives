import { Request, Response, NextFunction } from 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicia sesión.' });
  }

  (req as AuthenticatedRequest).user = {
    id: req.session.userId,
    username: req.session.username || ''
  };

  next();
};

export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};