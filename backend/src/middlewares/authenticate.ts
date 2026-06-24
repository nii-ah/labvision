import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Étend le type Request d'Express pour y ajouter les infos de l'utilisateur connecté
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    roles: string[];
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format : "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      roles: string[];
    };

    req.user = decoded; // Injecte les infos user dans la requête
    next(); // Laisse passer vers le contrôleur
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};