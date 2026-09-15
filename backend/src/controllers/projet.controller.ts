// src/controllers/projet.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createProjetSchema } from '../Validators/projet.validator';
import { storageService } from '../services/storage.service';

export const createProjet = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const couverture = files?.image_couverture?.[0];
    const autresImages = files?.images || [];

    const parsed = createProjetSchema.safeParse({
      ...req.body,
      domaine_ids: req.body.domaine_ids ? JSON.parse(req.body.domaine_ids) : [],
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    if (!couverture) {
      return res.status(400).json({ message: 'Une image de couverture est requise.' });
    }

    const { titre, description, domaine_ids } = parsed.data;
    const auteurId = req.user!.userId;
    const imageCouvertureUrl = `projets/${couverture.filename}`;

    const [result]: any = await pool.query(
      `INSERT INTO projets (titre, description, image_couverture, auteur_id)
       VALUES (?, ?, ?, ?)`,
      [titre, description || null, imageCouvertureUrl, auteurId]
    );

    const projetId = result.insertId;

    // Lier les domaines
    if (domaine_ids.length > 0) {
      const values = domaine_ids.map((domaineId) => [projetId, domaineId]);
      await pool.query(
        `INSERT INTO projet_domaines (projet_id, domaine_id) VALUES ?`,
        [values]
      );
    }

    // Enregistrer les images supplémentaires
    if (autresImages.length > 0) {
      const values = autresImages.map((file, index) => [
        projetId, `projets/${file.filename}`, index,
      ]);
      await pool.query(
        `INSERT INTO projet_fichiers (projet_id, fichier_url, ordre) VALUES ?`,
        [values]
      );
    }

    return res.status(201).json({
      message: 'Projet publié avec succès.',
      projetId,
    });

  } catch (error) {
    console.error('Erreur createProjet:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};