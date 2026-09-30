// src/controllers/projet.controller.ts
import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/authenticate';
import { createProjetSchema, updateProjetSchema } from '../Validators/projet.validator';
import { storageService } from '../services/storage.service';
import fs from 'fs';
import path from 'path';

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


const UPLOAD_DIR = path.join(__dirname, '../../uploads/projets');

// Helper : auteur du projet OU admin
const isAuteurOuAdmin = (req: AuthRequest, auteurId: number): boolean => {
  const isAuteur = req.user!.userId === auteurId;
  const isAdmin = req.user!.roles?.includes('admin');
  return isAuteur || !!isAdmin;
};

// ------------------------------------------------------------------
// GET /api/projets — liste complète (connecté uniquement)
// ------------------------------------------------------------------
export const getProjets = async (req: AuthRequest, res: Response) => {
  try {
    const [projets]: any = await pool.query(
      `SELECT p.id, p.titre, p.description, p.image_couverture, p.visible_vitrine,
              p.auteur_id, p.date_creation,
              u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM projets p
       JOIN users u ON u.id = p.auteur_id
       ORDER BY p.date_creation DESC`
    );

    if (projets.length === 0) {
      return res.status(200).json({ projets: [] });
    }

    const projetIds = projets.map((p: any) => p.id);

    const [domaines]: any = await pool.query(
      `SELECT pd.projet_id, d.id, d.nom
       FROM projet_domaines pd
       JOIN domaines d ON d.id = pd.domaine_id
       WHERE pd.projet_id IN (?)`,
      [projetIds]
    );

    const projetsAvecDomaines = projets.map((p: any) => ({
      ...p,
      domaines: domaines
        .filter((d: any) => d.projet_id === p.id)
        .map((d: any) => ({ id: d.id, nom: d.nom })),
    }));

    return res.status(200).json({ projets: projetsAvecDomaines });
  } catch (error) {
    console.error('Erreur getProjets:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// ------------------------------------------------------------------
// GET /api/projets/:id — détail (connecté uniquement)
// ------------------------------------------------------------------
export const getProjetById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [projets]: any = await pool.query(
      `SELECT p.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM projets p
       JOIN users u ON u.id = p.auteur_id
       WHERE p.id = ?`,
      [id]
    );

    if (projets.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    const projet = projets[0];

    const [domaines]: any = await pool.query(
      `SELECT d.id, d.nom
       FROM projet_domaines pd
       JOIN domaines d ON d.id = pd.domaine_id
       WHERE pd.projet_id = ?`,
      [id]
    );

    const [images]: any = await pool.query(
      `SELECT id, fichier_url, ordre
       FROM projet_fichiers
       WHERE projet_id = ?
       ORDER BY ordre ASC`,
      [id]
    );

    return res.status(200).json({ ...projet, domaines, images });
  } catch (error) {
    console.error('Erreur getProjetById:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// ------------------------------------------------------------------
// PATCH /api/projets/:id — auteur ou admin, texte + images
// ------------------------------------------------------------------
export const updateProjet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const nouvelleCouverture = files?.image_couverture?.[0];
    const nouvellesImages = files?.images || [];

    const [existants]: any = await pool.query(`SELECT * FROM projets WHERE id = ?`, [id]);
    if (existants.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }
    const projetExistant = existants[0];

    if (!isAuteurOuAdmin(req, projetExistant.auteur_id)) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const parsed = updateProjetSchema.safeParse({
      ...req.body,
      domaine_ids: req.body.domaine_ids ? JSON.parse(req.body.domaine_ids) : undefined,
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { titre, description, domaine_ids } = parsed.data;
    const champs: string[] = [];
    const valeurs: any[] = [];

    if (titre !== undefined) { champs.push('titre = ?'); valeurs.push(titre); }
    if (description !== undefined) { champs.push('description = ?'); valeurs.push(description); }

    // Nouvelle couverture : supprime l'ancienne du disque
    if (nouvelleCouverture) {
      const ancienChemin = path.join(UPLOAD_DIR, path.basename(projetExistant.image_couverture));
      if (fs.existsSync(ancienChemin)) fs.unlinkSync(ancienChemin);
      champs.push('image_couverture = ?');
      valeurs.push(`projets/${nouvelleCouverture.filename}`);
    }

    if (champs.length > 0) {
      valeurs.push(id);
      await pool.query(`UPDATE projets SET ${champs.join(', ')} WHERE id = ?`, valeurs);
    }

    // Domaines : remplacement complet si fourni
    if (domaine_ids !== undefined) {
      await pool.query(`DELETE FROM projet_domaines WHERE projet_id = ?`, [id]);
      if (domaine_ids.length > 0) {
        const values = domaine_ids.map((domaineId) => [id, domaineId]);
        await pool.query(`INSERT INTO projet_domaines (projet_id, domaine_id) VALUES ?`, [values]);
      }
    }

    // Galerie : remplacement complet si de nouvelles images sont envoyées
    if (nouvellesImages.length > 0) {
      const [anciennesImages]: any = await pool.query(
        `SELECT fichier_url FROM projet_fichiers WHERE projet_id = ?`, [id]
      );
      anciennesImages.forEach((img: any) => {
        const chemin = path.join(UPLOAD_DIR, path.basename(img.fichier_url));
        if (fs.existsSync(chemin)) fs.unlinkSync(chemin);
      });

      await pool.query(`DELETE FROM projet_fichiers WHERE projet_id = ?`, [id]);

      const values = nouvellesImages.map((file, index) => [id, `projets/${file.filename}`, index]);
      await pool.query(`INSERT INTO projet_fichiers (projet_id, fichier_url, ordre) VALUES ?`, [values]);
    }

    return res.status(200).json({ message: 'Projet mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur updateProjet:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};

// ------------------------------------------------------------------
// DELETE /api/projets/:id — auteur ou admin, supprime fichiers + BD
// ------------------------------------------------------------------
export const deleteProjet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [existants]: any = await pool.query(`SELECT * FROM projets WHERE id = ?`, [id]);
    if (existants.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }
    const projet = existants[0];

    if (!isAuteurOuAdmin(req, projet.auteur_id)) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const [images]: any = await pool.query(
      `SELECT fichier_url FROM projet_fichiers WHERE projet_id = ?`, [id]
    );

    const cheminsAsupprimer = [projet.image_couverture, ...images.map((img: any) => img.fichier_url)];
    cheminsAsupprimer.forEach((chemin) => {
      const cheminComplet = path.join(UPLOAD_DIR, path.basename(chemin));
      if (fs.existsSync(cheminComplet)) fs.unlinkSync(cheminComplet);
    });

    // ON DELETE CASCADE gère projet_domaines et projet_fichiers
    await pool.query(`DELETE FROM projets WHERE id = ?`, [id]);

    return res.status(200).json({ message: 'Projet supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteProjet:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};