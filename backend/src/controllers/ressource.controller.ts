// src/controllers/ressource.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createRessourceSchema, updateRessourceSchema } from '../Validators/ressource.validator';


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

// src/controllers/ressource.controller.ts (ajoute cette fonction)

export const getRessources = async (req: AuthRequest, res: Response) => {
  try {
    const isConnected = !!req.user;
    const domaineId = req.query.domaine_id;

    let sql = `
      SELECT DISTINCT r.id, r.titre, r.description, r.niveau, r.langue, 
             r.format, r.image_url, r.fichier_url, r.telechargeable, 
             r.visible_vitrine, r.date_creation
      FROM ressources r
    `;
    const params: any[] = [];

    if (domaineId) {
      sql += ` INNER JOIN ressource_domaines rd ON rd.ressource_id = r.id `;
    }

    // Visiteur non connecté : uniquement les ressources mises en avant sur la vitrine
    if (!isConnected) {
      sql += ` WHERE r.visible_vitrine = 1`;
    } else {
      sql += ` WHERE 1=1`;
    }

    if (domaineId) {
      sql += ` AND rd.domaine_id = ?`;
      params.push(domaineId);
    }

    sql += ` ORDER BY r.date_creation DESC`;

    const [ressources]: any = await pool.query(sql, params);

    // Masquer fichier_url si visiteur non connecté ET ressource non téléchargeable
    const result = ressources.map((r: any) => {
      if (!isConnected && !r.telechargeable) {
        const { fichier_url, ...rest } = r;
        return rest;
      }
      return r;
    });

    return res.status(200).json({ ressources: result });

  } catch (error) {
    console.error('Erreur getRessources:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};


export const getRessourceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = !!req.user;

    const [ressources]: any = await pool.query(
      `SELECT r.id, r.titre, r.description, r.niveau, r.langue, 
              r.format, r.image_url, r.fichier_url, r.telechargeable, 
              r.visible_vitrine, r.date_creation, r.auteur_id,
              u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM ressources r
       JOIN users u ON u.id = r.auteur_id
       WHERE r.id = ?`,
      [id]
    );

    if (ressources.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const ressource = ressources[0];

    // Visiteur non connecté : uniquement si la ressource est sur la vitrine
    if (!isConnected && !ressource.visible_vitrine) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    // Récupérer les domaines liés
    const [domaines]: any = await pool.query(
      `SELECT d.id, d.nom FROM domaines d
       JOIN ressource_domaines rd ON rd.domaine_id = d.id
       WHERE rd.ressource_id = ?`,
      [id]
    );
    ressource.domaines = domaines;

    // Masquer fichier_url si visiteur non connecté ET non téléchargeable
    if (!isConnected && !ressource.telechargeable) {
      delete ressource.fichier_url;
    }

    return res.status(200).json({ ressource });

  } catch (error) {
    console.error('Erreur getRessourceById:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};


export const updateRessource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const parsed = updateRessourceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Vérifier que la ressource existe
    const [existing]: any = await pool.query(
      'SELECT id FROM ressources WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const { domaine_ids, ...fields } = parsed.data;

    // Construire dynamiquement la requête UPDATE selon les champs fournis
    const entries = Object.entries(fields).filter(([_, v]) => v !== undefined);

    if (entries.length > 0) {
      const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([_, value]) =>
        typeof value === 'boolean' ? (value ? 1 : 0) : value
      );

      await pool.query(
        `UPDATE ressources SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
    }

    // Mettre à jour les domaines si fournis
    if (domaine_ids) {
      await pool.query('DELETE FROM ressource_domaines WHERE ressource_id = ?', [id]);

      if (domaine_ids.length > 0) {
        const values = domaine_ids.map((domaineId) => [id, domaineId]);
        await pool.query(
          `INSERT INTO ressource_domaines (ressource_id, domaine_id) VALUES ?`,
          [values]
        );
      }
    }

    return res.status(200).json({ message: 'Ressource mise à jour avec succès.' });

  } catch (error) {
    console.error('Erreur updateRessource:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};