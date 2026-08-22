// src/middlewares/requireRole.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];

    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.',
      });
    }

    next();
  };
};