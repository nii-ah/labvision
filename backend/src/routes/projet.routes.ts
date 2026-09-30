// src/routes/projet.routes.ts
import { Router } from 'express';
import { createProjet, deleteProjet, getProjetById, getProjets, updateProjet } from '../controllers/projet.controller';
import { authenticateToken } from '../middlewares/authenticate';
import { requireAdhesionValidee } from '../middlewares/requireAdhesion';
import { uploadProjetImages } from '../middlewares/uploadProjet';

const router = Router();

router.post(
  '/projets',
  authenticateToken,
  requireAdhesionValidee,
  uploadProjetImages,
  createProjet
);
router.get('/projets', authenticateToken, getProjets);
router.get('/projets/:id', authenticateToken, getProjetById);
router.patch('/projets/:id', authenticateToken, uploadProjetImages, updateProjet);
router.delete('/projets/:id', authenticateToken, deleteProjet);

export default router;