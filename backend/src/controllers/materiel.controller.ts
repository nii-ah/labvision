import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { storageService } from '../services/storage.service';
import {
  createMaterielSchema,
  updateMaterielSchema,
  vitrineSchema,
  fichierBodySchema,
  idParamSchema,
  fichierParamSchema,
} from '../Validators/materiel.validator';

// GET /api/materiels  (optionalAuth)
export const getMateriels = async (req: AuthRequest, res: Response) => {
  try {
    const isConnected = !!req.user;

    const [materiels]: any = await pool.query(
      `SELECT m.id, m.nom, m.description, m.quantite_totale, m.visible_vitrine,
              m.created_at,
              (SELECT COUNT(*) FROM materiel_fichiers f WHERE f.materiel_id = m.id) AS nb_fichiers
       FROM materiels m
       ${isConnected ? '' : 'WHERE m.visible_vitrine = 1'}
       ORDER BY m.nom ASC`
    );

    return res.status(200).json({ materiels });
  } catch (error) {
    console.error('Erreur getMateriels:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// GET /api/materiels/:id  (optionalAuth)
export const getMaterielById = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;
    const isConnected = !!req.user;

    const [rows]: any = await pool.query('SELECT * FROM materiels WHERE id = ?', [id]);
    const materiel = rows[0];

    // 404 (pas 403) pour un visiteur sur un contenu non-vitrine
    if (!materiel || (!isConnected && !materiel.visible_vitrine)) {
      return res.status(404).json({ message: 'Matériel introuvable.' });
    }

    const [fichiers]: any = await pool.query(
      `SELECT id, type_fichier, nom_original, mime_type, taille, created_at
       FROM materiel_fichiers WHERE materiel_id = ?`,
      [id]
    );
    materiel.fichiers = fichiers;

    return res.status(200).json({ materiel });
  } catch (error) {
    console.error('Erreur getMaterielById:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// POST /api/materiels
export const createMateriel = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createMaterielSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { nom, description, quantite_totale } = parsed.data;

    const [result]: any = await pool.query(
      `INSERT INTO materiels (nom, description, quantite_totale, created_by)
       VALUES (?, ?, ?, ?)`,
      [nom, description || null, quantite_totale, req.user!.userId]
    );

    return res.status(201).json({
      message: 'Matériel ajouté avec succès.',
      materielId: result.insertId,
    });
  } catch (error) {
    console.error('Erreur createMateriel:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// PATCH /api/materiels/:id
export const updateMateriel = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const parsed = updateMaterielSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [existing]: any = await pool.query('SELECT id FROM materiels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Matériel introuvable.' });
    }

    const entries = Object.entries(parsed.data).filter(([_, v]) => v !== undefined);
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([_, value]) => value);

    await pool.query(`UPDATE materiels SET ${setClause} WHERE id = ?`, [...values, id]);

    return res.status(200).json({ message: 'Matériel mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur updateMateriel:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// PATCH /api/materiels/:id/vitrine  (admin)
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

    const [existing]: any = await pool.query('SELECT id FROM materiels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Matériel introuvable.' });
    }

    await pool.query('UPDATE materiels SET visible_vitrine = ? WHERE id = ?', [
      parsed.data.visible_vitrine ? 1 : 0,
      id,
    ]);

    return res.status(200).json({
      message: parsed.data.visible_vitrine
        ? 'Matériel mis en avant sur la vitrine.'
        : 'Matériel retiré de la vitrine.',
    });
  } catch (error) {
    console.error('Erreur toggleVitrine (matériel):', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// DELETE /api/materiels/:id
export const deleteMateriel = async (req: AuthRequest, res: Response) => {
  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const [existing]: any = await pool.query('SELECT id FROM materiels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Matériel introuvable.' });
    }

    const [fichiers]: any = await pool.query(
      'SELECT chemin FROM materiel_fichiers WHERE materiel_id = ?',
      [id]
    );

    // Les lignes materiel_fichiers partent via ON DELETE CASCADE
    await pool.query('DELETE FROM materiels WHERE id = ?', [id]);

    for (const f of fichiers) {
      await storageService.deleteFile(f.chemin);
    }

    return res.status(200).json({ message: 'Matériel supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteMateriel:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// POST /api/materiels/:id/fichiers  (multipart, champ "fichier")
export const addFichier = async (req: AuthRequest, res: Response) => {
  // Supprime le fichier déjà écrit par Multer en cas d'échec
  const cleanup = async () => {
    if (req.file) await storageService.deleteFile(`materiels/${req.file.filename}`);
  };

  try {
    const params = idParamSchema.safeParse(req.params);
    if (!params.success) {
      await cleanup();
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id } = params.data;

    const body = fichierBodySchema.safeParse(req.body);
    if (!body.success) {
      await cleanup();
      return res.status(400).json({
        message: 'Données invalides',
        errors: body.error.flatten().fieldErrors,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Un fichier est requis.' });
    }

    const [existing]: any = await pool.query('SELECT id FROM materiels WHERE id = ?', [id]);
    if (existing.length === 0) {
      await cleanup();
      return res.status(404).json({ message: 'Matériel introuvable.' });
    }

    const chemin = `materiels/${req.file.filename}`;

    const [result]: any = await pool.query(
      `INSERT INTO materiel_fichiers
         (materiel_id, type_fichier, nom_original, chemin, mime_type, taille)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, body.data.type_fichier, req.file.originalname, chemin, req.file.mimetype, req.file.size]
    );

    return res.status(201).json({
      message: 'Fichier ajouté avec succès.',
      fichierId: result.insertId,
    });
  } catch (error) {
    await cleanup();
    console.error('Erreur addFichier:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// GET /api/materiels/:id/fichiers/:fichierId  (optionalAuth)
// Même règle d'accès que le détail : visiteur = vitrine uniquement
export const viewFichier = async (req: AuthRequest, res: Response) => {
  try {
    const params = fichierParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id, fichierId } = params.data;
    const isConnected = !!req.user;

    const [rows]: any = await pool.query(
      `SELECT f.chemin, f.mime_type, f.nom_original, m.visible_vitrine
       FROM materiel_fichiers f
       JOIN materiels m ON m.id = f.materiel_id
       WHERE f.id = ? AND f.materiel_id = ?`,
      [fichierId, id]
    );
    const fichier = rows[0];

    if (!fichier || (!isConnected && !fichier.visible_vitrine)) {
      return res.status(404).json({ message: 'Fichier introuvable.' });
    }

    if (!storageService.fileExists(fichier.chemin)) {
      return res.status(404).json({ message: 'Fichier introuvable.' });
    }

    res.setHeader('Content-Type', fichier.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(storageService.getAbsolutePath(fichier.chemin));
  } catch (error) {
    console.error('Erreur viewFichier:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// DELETE /api/materiels/:id/fichiers/:fichierId
export const deleteFichier = async (req: AuthRequest, res: Response) => {
  try {
    const params = fichierParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'Identifiant invalide.' });
    }
    const { id, fichierId } = params.data;

    const [rows]: any = await pool.query(
      'SELECT chemin FROM materiel_fichiers WHERE id = ? AND materiel_id = ?',
      [fichierId, id]
    );
    const fichier = rows[0];
    if (!fichier) {
      return res.status(404).json({ message: 'Fichier introuvable.' });
    }

    await pool.query('DELETE FROM materiel_fichiers WHERE id = ?', [fichierId]);
    await storageService.deleteFile(fichier.chemin);

    return res.status(200).json({ message: 'Fichier supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteFichier:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};