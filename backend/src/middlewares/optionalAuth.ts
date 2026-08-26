// src/middlewares/optionalAuth.ts (remplace le contenu)
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './authenticate';

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const queryToken = req.query.token as string | undefined;

  const token = headerToken || queryToken;

  if (!token) {
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
    // Token invalide : traité comme visiteur
  }

  next();
};