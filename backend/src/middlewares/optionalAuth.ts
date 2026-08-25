// src/middlewares/optionalAuth.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './authenticate';

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Pas de token : on continue, req.user reste undefined (visiteur)
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      roles: string[];
    };
    req.user = decoded;
  } catch (error) {
    // Token invalide : on l'ignore, on traite comme un visiteur plutôt que de bloquer
  }

  next();
};