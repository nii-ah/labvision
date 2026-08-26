// src/controllers/ressource.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createRessourceSchema, updateRessourceSchema, toggleVitrineSchema } from '../Validators/ressource.validator';
import { storageService } from '../services/storage.service';



export const createRessource = async (req: AuthRequest, res: Response) => {
  try {
    // Avec multer, req.body contient les champs texte, req.file le fichier
    const parsed = createRessourceSchema.safeParse({
      ...req.body,
      telechargeable: req.body.telechargeable === 'true',
      domaine_ids: req.body.domaine_ids ? JSON.parse(req.body.domaine_ids) : [],
    });

    if (!parsed.success) {
      // Si validation échoue mais fichier déjà uploadé, on le supprime pour éviter les orphelins
      if (req.file) {
        await storageService.deleteFile(`ressources/${req.file.filename}`);
      }
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Un fichier est requis.' });
    }

    const {
      titre, description, niveau, langue, format,
      image_url, telechargeable, domaine_ids,
    } = parsed.data;

    const auteurId = req.user!.userId;
    const fichierUrl = `ressources/${req.file.filename}`;

    const [result]: any = await pool.query(
      `INSERT INTO ressources 
       (titre, description, niveau, langue, format, fichier_url, image_url, telechargeable, auteur_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titre, description || null, niveau || 'Débutant', langue || 'Français',
        format, fichierUrl, image_url || null,
        telechargeable ? 1 : 0, auteurId,
      ]
    );

    const ressourceId = result.insertId;

    if (domaine_ids && domaine_ids.length > 0) {
      const values = domaine_ids.map((domaineId: number) => [ressourceId, domaineId]);
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

// src/controllers/ressource.controller.ts (ajoute ces deux fonctions)

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  audio: 'audio/mpeg',
  video: 'video/mp4',
};

export const viewRessourceFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = !!req.user;

    const [rows]: any = await pool.query(
      'SELECT fichier_url, format, visible_vitrine, titre FROM ressources WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const ressource = rows[0];

    // Visiteur : uniquement si sur la vitrine
    if (!isConnected && !ressource.visible_vitrine) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const absolutePath = storageService.getAbsolutePath(ressource.fichier_url);
    if (!storageService.fileExists(ressource.fichier_url)) {
      return res.status(404).json({ message: 'Fichier introuvable.' });
    }

    res.setHeader('Content-Type', MIME_TYPES[ressource.format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline'); // affichage dans le navigateur, pas de téléchargement forcé
    return res.sendFile(absolutePath);

  } catch (error) {
    console.error('Erreur viewRessourceFile:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

export const downloadRessourceFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = !!req.user;

    if (!isConnected) {
      return res.status(401).json({ message: 'Connectez-vous pour télécharger ce fichier.' });
    }

    const [rows]: any = await pool.query(
      'SELECT fichier_url, format, telechargeable, titre FROM ressources WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const ressource = rows[0];

    if (!ressource.telechargeable) {
      return res.status(403).json({ message: 'Cette ressource n\'est pas téléchargeable.' });
    }

    const absolutePath = storageService.getAbsolutePath(ressource.fichier_url);
    if (!storageService.fileExists(ressource.fichier_url)) {
      return res.status(404).json({ message: 'Fichier introuvable.' });
    }

    const extension = ressource.fichier_url.split('.').pop();
    const downloadName = `${ressource.titre.replace(/[^a-z0-9]/gi, '_')}.${extension}`;

    return res.download(absolutePath, downloadName);

  } catch (error) {
    console.error('Erreur downloadRessourceFile:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

export const deleteRessource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      'SELECT fichier_url FROM ressources WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    const ressource = rows[0];

    // Supprimer d'abord en base (ressource_domaines se nettoie automatiquement via ON DELETE CASCADE)
    await pool.query('DELETE FROM ressources WHERE id = ?', [id]);

    // Puis supprimer le fichier physique
    if (ressource.fichier_url) {
      await storageService.deleteFile(ressource.fichier_url);
    }

    return res.status(200).json({ message: 'Ressource supprimée avec succès.' });

  } catch (error) {
    console.error('Erreur deleteRessource:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

export const toggleVitrine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const parsed = toggleVitrineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [existing]: any = await pool.query(
      'SELECT id FROM ressources WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ressource introuvable.' });
    }

    await pool.query(
      'UPDATE ressources SET visible_vitrine = ? WHERE id = ?',
      [parsed.data.visible_vitrine ? 1 : 0, id]
    );

    return res.status(200).json({
      message: parsed.data.visible_vitrine
        ? 'Ressource mise en avant sur la vitrine.'
        : 'Ressource retirée de la vitrine.',
    });

  } catch (error) {
    console.error('Erreur toggleVitrine:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};