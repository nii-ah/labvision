// src/controllers/adhesion.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createAdhesionSchema } from '../Validators/adhesion.validator';

export const createAdhesion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Vérifier qu'il n'y a pas déjà une demande (validée ou en attente)
    const [existing]: any = await pool.query(
      'SELECT id, validee FROM adhesions WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      const message = existing[0].validee
        ? 'Vous êtes déjà membre de Lab\'Vision.'
        : 'Vous avez déjà une demande d\'adhésion en attente.';
      return res.status(409).json({ message });
    }

    const parsed = createAdhesionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    await pool.query(
      `INSERT INTO adhesions (user_id, statut_labvision) VALUES (?, ?)`,
      [userId, parsed.data.statut_labvision]
    );

    return res.status(201).json({
      message: 'Demande d\'adhésion envoyée. Elle sera examinée par un administrateur.',
    });

  } catch (error) {
    console.error('Erreur createAdhesion:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};


// src/controllers/adhesion.controller.ts (ajoute cette fonction)

export const validerAdhesion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const [existing]: any = await pool.query(
      'SELECT id, validee FROM adhesions WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Demande d\'adhésion introuvable.' });
    }

    if (existing[0].validee) {
      return res.status(409).json({ message: 'Cette adhésion est déjà validée.' });
    }

    await pool.query(
      `UPDATE adhesions 
       SET validee = 1, valide_par = ?, date_validation = NOW() 
       WHERE id = ?`,
      [adminId, id]
    );

    return res.status(200).json({ message: 'Adhésion validée avec succès.' });

  } catch (error) {
    console.error('Erreur validerAdhesion:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};



// src/controllers/adhesion.controller.ts (ajoute cette fonction)

export const getAdhesions = async (req: AuthRequest, res: Response) => {
  try {
    const { statut } = req.query;

    let sql = `
      SELECT a.id, a.user_id, a.statut_labvision, a.date_demande, 
             a.validee, a.date_validation,
             u.nom, u.prenom, u.email
      FROM adhesions a
      JOIN users u ON u.id = a.user_id
    `;

    if (statut === 'en_attente') {
      sql += ` WHERE a.validee = 0`;
    } else if (statut === 'validee') {
      sql += ` WHERE a.validee = 1`;
    }

    sql += ` ORDER BY a.date_demande DESC`;

    const [adhesions]: any = await pool.query(sql);

    return res.status(200).json({ adhesions });

  } catch (error) {
    console.error('Erreur getAdhesions:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

export const getMonAdhesion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [rows]: any = await pool.query(
      'SELECT id, statut_labvision, validee, date_demande, date_validation FROM adhesions WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({ adhesion: rows[0] || null });

  } catch (error) {
    console.error('Erreur getMonAdhesion:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};