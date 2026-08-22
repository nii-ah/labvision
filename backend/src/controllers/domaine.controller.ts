// src/controllers/domaine.controller.ts
import { Request, Response } from 'express';
import { pool } from '../db';

export const getDomaines = async (req: Request, res: Response) => {
  try {
    const [domaines]: any = await pool.query(
      'SELECT id, nom FROM domaines ORDER BY nom ASC'
    );
    return res.status(200).json({ domaines });
  } catch (error) {
    console.error('Erreur getDomaines:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};