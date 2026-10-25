import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { storageService } from '../services/storage.service';
import {
  createEvenementSchema,
  updateEvenementSchema,
  vitrineSchema,
  idParamSchema,
  listQuerySchema,
} from '../Validators/evenement.validator';

// Dates renvoyées en texte "2026-10-20T14:00:00" (heure locale), pour éviter
// toute conversion de fuseau par mysql2 / JSON. La photo est exposée via
// a_photo (booléen) et la route GET /:id/photo, jamais par son chemin disque.
const COLS = `
  e.id, e.titre, e.description,
  DATE_FORMAT(e.date_debut, '%Y-%m-%dT%H:%i:%s') AS date_debut,
  DATE_FORMAT(e.date_fin,   '%Y-%m-%dT%H:%i:%s') AS date_fin,
  e.lieu, e.partenaires, e.visible_vitrine,
  (e.photo IS NOT NULL) AS a_photo
`;

// GET /api/evenements?mois=2026-10  (optionalAuth)
export const getEvenements = async (req: AuthRequest, res: Response) => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        message: 'Paramètre invalide',
        errors: query.error.flatten().fieldErrors,
      });
    }

    const isConnected = !!req.user;
    const conditions: string[] = [];
    const params: any[] = [];

    // Visiteur : uniquement les événements en vitrine
    if (!isConnected) conditions.push('e.visible_vitrine = 1');

    // Événements qui touchent le mois (y compris ceux qui chevauchent deux mois)
    const mois = query.data.mois;
    if (mois) {
      const annee = Number(mois.slice(0, 4));
      const m = Number(mois.slice(5, 7));
      const suivant = m === 12 ? `${annee + 1}-01` : `${annee}-${String(m + 1).padStart(2, '0')}`;
      conditions.push('e.date_debut < ? AND COALESCE(e.date_fin, e.date_debut) >= ?');
      params.push(`${suivant}-01 00:00:00`, `${mois}-01 00:00:00`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [evenements]: any = await pool.query(
      `SELECT ${COLS} FROM evenements e ${where} ORDER BY e.date_debut ASC`,
      params
    );

    return res.status(200).json({ evenements });
  } catch (error) {
    console.error('Erreur getEvenements:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// GET /api/evenements/:id  (optionalAuth)
export const getEvenementById = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;
    const isConnected = !!req.user;

    const [rows]: any = await pool.query(
      `SELECT ${COLS}, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM evenements e
       LEFT JOIN users u ON u.id = e.created_by
       WHERE e.id = ?`,
      [id]
    );
    const evenement = rows[0];

    // 404 (pas 403) pour un visiteur sur un contenu non-vitrine
    if (!evenement || (!isConnected && !evenement.visible_vitrine)) {
      return res.status(404).json({ message: 'Événement introuvable.' });
    }

    return res.status(200).json({ evenement });
  } catch (error) {
    console.error('Erreur getEvenementById:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// GET /api/evenements/:id/photo  (optionalAuth)
export const viewPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;
    const isConnected = !!req.user;

    const [rows]: any = await pool.query(
      'SELECT photo, visible_vitrine FROM evenements WHERE id = ?',
      [id]
    );
    const evenement = rows[0];

    if (!evenement || !evenement.photo || (!isConnected && !evenement.visible_vitrine)) {
      return res.status(404).json({ message: 'Photo introuvable.' });
    }
    if (!storageService.fileExists(evenement.photo)) {
      return res.status(404).json({ message: 'Photo introuvable.' });
    }

    return res.sendFile(storageService.getAbsolutePath(evenement.photo));
  } catch (error) {
    console.error('Erreur viewPhoto (événement):', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// POST /api/evenements  (multipart, champ photo optionnel)
export const createEvenement = async (req: AuthRequest, res: Response) => {
  const cleanup = async () => {
    if (req.file) await storageService.deleteFile(`evenements/${req.file.filename}`);
  };

  try {
    const parsed = createEvenementSchema.safeParse(req.body);
    if (!parsed.success) {
      await cleanup();
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { titre, description, date_debut, date_fin, lieu, partenaires } = parsed.data;
    const photo = req.file ? `evenements/${req.file.filename}` : null;

    // visible_vitrine = TRUE par défaut (valeur par défaut de la colonne)
    const [result]: any = await pool.query(
      `INSERT INTO evenements
         (titre, description, date_debut, date_fin, photo, lieu, partenaires, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titre, description, date_debut, date_fin || null, photo, lieu || null, partenaires || null, req.user!.userId]
    );

    return res.status(201).json({
      message: 'Événement créé avec succès.',
      evenementId: result.insertId,
    });
  } catch (error) {
    await cleanup();
    console.error('Erreur createEvenement:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// PATCH /api/evenements/:id  (JSON ou multipart ; photo optionnelle)
export const updateEvenement = async (req: AuthRequest, res: Response) => {
  const cleanup = async () => {
    if (req.file) await storageService.deleteFile(`evenements/${req.file.filename}`);
  };

  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      await cleanup();
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const parsed = updateEvenementSchema.safeParse(req.body);
    if (!parsed.success) {
      await cleanup();
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [rows]: any = await pool.query(
      `SELECT id, photo,
              DATE_FORMAT(date_debut, '%Y-%m-%d %H:%i:%s') AS date_debut,
              DATE_FORMAT(date_fin,   '%Y-%m-%d %H:%i:%s') AS date_fin
       FROM evenements WHERE id = ?`,
      [id]
    );
    const existing = rows[0];
    if (!existing) {
      await cleanup();
      return res.status(404).json({ message: 'Événement introuvable.' });
    }

    const { supprimer_photo, ...champs } = parsed.data;

    // Cohérence des dates après fusion avec l'existant (comparaison de chaînes "AAAA-MM-JJ HH:mm:ss")
    const debut: string = champs.date_debut ?? existing.date_debut;
    const fin: string | null = champs.date_fin === undefined ? existing.date_fin : champs.date_fin;
    if (fin && fin < debut) {
      await cleanup();
      return res.status(400).json({
        message: 'Données invalides',
        errors: { date_fin: ['La date de fin doit être après la date de début'] },
      });
    }

    const entries = Object.entries(champs).filter(([_, v]) => v !== undefined) as [string, any][];
    const photoChange = !!req.file || supprimer_photo === 'true';
    if (req.file) entries.push(['photo', `evenements/${req.file.filename}`]);
    else if (supprimer_photo === 'true') entries.push(['photo', null]);

    if (entries.length === 0) {
      return res.status(400).json({ message: 'Aucun champ à modifier.' });
    }

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([_, value]) => value);
    await pool.query(`UPDATE evenements SET ${setClause} WHERE id = ?`, [...values, id]);

    // Ancienne photo supprimée seulement après le succès du UPDATE
    if (photoChange && existing.photo) {
      await storageService.deleteFile(existing.photo);
    }

    return res.status(200).json({ message: 'Événement mis à jour avec succès.' });
  } catch (error) {
    await cleanup();
    console.error('Erreur updateEvenement:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// PATCH /api/evenements/:id/vitrine  (admin)
export const toggleVitrine = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const parsed = vitrineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [existing]: any = await pool.query('SELECT id FROM evenements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Événement introuvable.' });
    }

    await pool.query('UPDATE evenements SET visible_vitrine = ? WHERE id = ?', [
      parsed.data.visible_vitrine ? 1 : 0,
      id,
    ]);

    return res.status(200).json({
      message: parsed.data.visible_vitrine
        ? 'Événement mis en avant sur la vitrine.'
        : 'Événement retiré de la vitrine.',
    });
  } catch (error) {
    console.error('Erreur toggleVitrine (événement):', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// DELETE /api/evenements/:id
export const deleteEvenement = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const [rows]: any = await pool.query('SELECT photo FROM evenements WHERE id = ?', [id]);
    const evenement = rows[0];
    if (!evenement) {
      return res.status(404).json({ message: 'Événement introuvable.' });
    }

    await pool.query('DELETE FROM evenements WHERE id = ?', [id]);
    if (evenement.photo) {
      await storageService.deleteFile(evenement.photo);
    }

    return res.status(200).json({ message: 'Événement supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteEvenement:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};