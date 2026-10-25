import { Router } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { optionalAuth } from '../middlewares/optionalAuth';
import { requireRole } from '../middlewares/requireRole';
import { uploadEvenementPhoto } from '../middlewares/uploadEvenement';
import * as ctrl from '../controllers/evenement.controller';

const router = Router();

const gestion = requireRole('admin', 'resp_activites');

// Consultation (visiteur : vitrine uniquement ; connecté : tout)
router.get('/', optionalAuth, ctrl.getEvenements);
router.get('/:id', optionalAuth, ctrl.getEvenementById);
router.get('/:id/photo', optionalAuth, ctrl.viewPhoto);

// Gestion (admin + responsable des activités)
router.post('/', authenticateToken, gestion, uploadEvenementPhoto, ctrl.createEvenement);
router.patch('/:id', authenticateToken, gestion, uploadEvenementPhoto, ctrl.updateEvenement);
router.delete('/:id', authenticateToken, gestion, ctrl.deleteEvenement);

// Vitrine : admin uniquement
router.patch('/:id/vitrine', authenticateToken, requireRole('admin'), ctrl.toggleVitrine);

export default router;