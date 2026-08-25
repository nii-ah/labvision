// src/routes/ressource.routes.ts
import { Router } from 'express';
import { createRessource, getRessources, getRessourceById } from '../controllers/ressource.controller';
import { authenticateToken } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';
import { optionalAuth } from '../middlewares/optionalAuth';


const router = Router();

router.post('/ressources', authenticateToken, requireRole('admin'), createRessource);
router.get('/ressources', optionalAuth, getRessources);
router.get('/ressources/:id', optionalAuth, getRessourceById);

export default router;