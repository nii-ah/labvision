// src/middlewares/requireAdhesion.ts
import { Response, NextFunction } from 'express';
import { pool } from '../db';
import { AuthRequest } from './authenticate';

export const requireAdhesionValidee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    const [rows]: any = await pool.query(
      'SELECT validee FROM adhesions WHERE user_id = ? AND validee = 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        message: 'Cette action est réservée aux membres de Lab\'Vision. Veuillez faire une demande d\'adhésion.',
      });
    }

    next();
  } catch (error) {
    console.error('Erreur requireAdhesionValidee:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};