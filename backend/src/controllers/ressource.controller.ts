// src/controllers/ressource.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createRessourceSchema } from '../Validators/ressource.validator';


export const createRessource = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createRessourceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      titre, description, niveau, langue, format,
      fichier_url, image_url, telechargeable, domaine_ids,
    } = parsed.data;

    const auteurId = req.user!.userId;

    // 1. Insérer la ressource
    const [result]: any = await pool.query(
      `INSERT INTO ressources 
       (titre, description, niveau, langue, format, fichier_url, image_url, telechargeable, auteur_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titre, description || null, niveau || 'Débutant', langue || 'Français',
        format, fichier_url || null, image_url || null,
        telechargeable ? 1 : 0, auteurId,
      ]
    );

    const ressourceId = result.insertId;

    // 2. Lier les domaines
    if (domaine_ids && domaine_ids.length > 0) {
      const values = domaine_ids.map((domaineId) => [ressourceId, domaineId]);
      await pool.query(
        `INSERT INTO ressource_domaines (ressource_id, domaine_id) VALUES ?`,
        [values]
      );
    }

    return res.status(201).json({
      message: 'Ressource publiée avec succès.',
      ressourceId,
    });

  } catch (error) {
    console.error('Erreur createRessource:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};