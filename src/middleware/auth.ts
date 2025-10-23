import { Request, Response, NextFunction } from 'express';

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

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicia sesión.' });
  }

  req.user = {
    id: req.session.userId,
    username: req.session.username || ''
  };

  next();
};

export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};