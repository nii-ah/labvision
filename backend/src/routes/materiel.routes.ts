import { Router } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { optionalAuth } from '../middlewares/optionalAuth';
import { requireRole } from '../middlewares/requireRole';
import { uploadMaterielFile } from '../middlewares/uploadMateriel';
import * as ctrl from '../controllers/materiel.controller';

const router = Router();

const gestion = requireRole('admin', 'resp_materiels');

// Consultation (visiteur : vitrine uniquement ; connecté : tout)
router.get('/', optionalAuth, ctrl.getMateriels);
router.get('/:id', optionalAuth, ctrl.getMaterielById);
router.get('/:id/fichiers/:fichierId', optionalAuth, ctrl.viewFichier);

// Gestion du catalogue
router.post('/', authenticateToken, gestion, ctrl.createMateriel);
router.patch('/:id', authenticateToken, gestion, ctrl.updateMateriel);
router.delete('/:id', authenticateToken, gestion, ctrl.deleteMateriel);

// Vitrine : admin uniquement
router.patch('/:id/vitrine', authenticateToken, requireRole('admin'), ctrl.toggleVitrine);

// Fichiers techniques
router.post('/:id/fichiers', authenticateToken, gestion, uploadMaterielFile, ctrl.addFichier);
router.delete('/:id/fichiers/:fichierId', authenticateToken, gestion, ctrl.deleteFichier);

export default router;