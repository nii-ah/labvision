// src/routes/ressource.routes.ts
import { Router } from 'express';
import { createRessource, getRessources, getRessourceById, updateRessource, downloadRessourceFile, viewRessourceFile, deleteRessource, toggleVitrine} from '../controllers/ressource.controller';
import { authenticateToken } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { optionalAuth } from '../middlewares/optionalAuth';
import { uploadRessourceFile } from '../middlewares/upload';


const router = Router();

router.post(
  '/ressources',
  authenticateToken,
  requireRole('admin'),
  uploadRessourceFile,
  createRessource
);

router.get('/ressources', optionalAuth, getRessources);
router.get('/ressources/:id', optionalAuth, getRessourceById);
router.get('/ressources/:id/view', optionalAuth, viewRessourceFile);
router.get('/ressources/:id/download', optionalAuth, downloadRessourceFile);
router.patch('/ressources/:id', authenticateToken, requireRole('admin'), updateRessource);
router.delete('/ressources/:id', authenticateToken, requireRole('admin'), deleteRessource);
router.patch('/ressources/:id/vitrine', authenticateToken, requireRole('admin'), toggleVitrine);

export default router;