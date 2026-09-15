// src/routes/projet.routes.ts
import { Router } from 'express';
import { createProjet } from '../controllers/projet.controller';
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

export default router;